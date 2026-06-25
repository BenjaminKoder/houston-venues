// Enrich a venue with AI: looks up current web details for a Houston venue and
// returns a structured suggestion the client can review field-by-field.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VenueInput {
  name?: string;
  neighborhood?: string;
  address?: string;
  website?: string;
  category?: string;
}

// Guard against SSRF: only allow http(s) URLs that do not resolve to
// localhost, link-local, or private network ranges.
function isSafeUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]" ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host) ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; HoustonVenues/1.0)" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m && m[1]) {
        let img = m[1].trim();
        if (img.startsWith("//")) img = "https:" + img;
        else if (img.startsWith("/")) {
          const u = new URL(url);
          img = u.origin + img;
        }
        if (img.startsWith("http")) return img;
      }
    }
  } catch (_e) {
    // ignore
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI is not configured." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const venue = (await req.json()) as VenueInput;
    if (!venue.name) {
      return new Response(JSON.stringify({ error: "Venue name is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = `You are helping the Innovation Norway Houston team verify an event venue in the Houston, Texas area.

Venue name: ${venue.name}
${venue.neighborhood ? `Neighborhood hint: ${venue.neighborhood}\n` : ""}${venue.address ? `Address hint: ${venue.address}\n` : ""}${venue.category ? `Category hint: ${venue.category}\n` : ""}
Return your best, most current knowledge of this venue's real-world details. If you are unsure of a field, return null for it rather than guessing. Coordinates must be precise decimal degrees for the actual Houston-area location. Provide the official website if you know it.`;

    const tool = {
      type: "function",
      function: {
        name: "report_venue",
        description: "Report verified details about a Houston-area event venue.",
        parameters: {
          type: "object",
          properties: {
            address: { type: ["string", "null"], description: "Full street address" },
            neighborhood: { type: ["string", "null"] },
            lat: { type: ["number", "null"], description: "Decimal latitude" },
            lng: { type: ["number", "null"], description: "Decimal longitude" },
            googleRating: { type: ["number", "null"], description: "Current Google rating 0-5" },
            website: { type: ["string", "null"], description: "Official website URL" },
            category: { type: ["string", "null"] },
            capacity: { type: ["string", "null"], description: "Notable capacity info" },
            amenities: { type: "array", items: { type: "string" } },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
          },
          required: ["amenities", "confidence"],
          additionalProperties: false,
        },
      },
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a meticulous research assistant for event planning. Only report details you are confident about; use null otherwise.",
          },
          { role: "user", content: prompt },
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: "report_venue" } },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(
        JSON.stringify({ error: "Rate limit reached. Please try again shortly." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiRes.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Add credits in Lovable Cloud." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "AI lookup failed." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    let suggestion: Record<string, unknown> = {};
    if (call?.function?.arguments) {
      try {
        suggestion = JSON.parse(call.function.arguments);
      } catch (_e) {
        suggestion = {};
      }
    }

    // Try to fetch a real hero image (og:image) from the website.
    const site = (suggestion.website as string) || venue.website || null;
    let imageUrl: string | null = null;
    if (site) imageUrl = await fetchOgImage(site);
    if (imageUrl) suggestion.imageUrl = imageUrl;

    return new Response(JSON.stringify({ suggestion }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("enrich-venue error", e);
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

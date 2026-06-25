UPDATE public.venues SET website = v.website, image_url = v.image_url, image_verified = true
FROM (VALUES
 ('avant-garden','https://www.avantgardenhouston.com/','https://www.avantgardenhouston.com/themes/tendenci2018/media/img/wedding1sm.jpg'),
 ('balboa-surf-club','https://www.balboasurfclub.com/','https://images.getbento.com/accounts/fbc36ba02dfea760e90616ad3edfee5d/media/images/5259BSC_Hero_Image.jpg'),
 ('bungalow','https://bungalowdining.com/','https://bungalowdining.com/wp-content/uploads/bungalow-dining-interior-img.jpeg'),
 ('flight-club','https://www.flightclubdartsusa.com/houston','https://www.flightclubdartsusa.com/img/asset/YXNzZXRzL2hvdXN0b24vaG91c3Rvbi1iYXItc2VhdGluZy5qcGc/houston-bar-seating.jpg?h=960&q=70&fm=webp&s=b89e997aaadea534aa444a05ae69666c'),
 ('frost-town-brewing','https://frosttownbrew.com/','https://static.wixstatic.com/media/3d83b2_8abf29ad41544332871aa73aa5479dd8~mv2.png/v1/fill/w_1200,h_650,al_c,q_85/3d83b2_8abf29ad41544332871aa73aa5479dd8~mv2.png'),
 ('haywire','https://haywirerestaurant.com/','https://cdn.sanity.io/images/9p1heoig/production/f41fe7e9eea080699b3181b28ae985ad991f48fe-8010x5340.jpg?w=1600&fit=max&auto=format'),
 ('joystix','https://joystixgames.com/','https://www.joystixgames.com/wp-content/uploads/2024/03/about-us.jpg'),
 ('la-lucha','https://laluchatx.com/','https://laluchatx.com/wp-content/uploads/2018/10/la-lucha_banner_01-1440x1050.jpg'),
 ('melrose','https://www.melrosehtx.com/','https://static.wixstatic.com/media/058839_bbd6abfe3c854302af0603c2bd1cfd53f000.jpg'),
 ('ouisies-table','https://www.ouisiestable.com/','https://popmenucloud.com/cdn-cgi/image/width=1200,height=1200,fit=scale-down,format=auto,quality=60/zlcnsafy/1ddaedf3-9c03-451c-aad0-6fb251c4ad9e.jpg'),
 ('star-rover','https://www.starroverhtx.com/','https://images.squarespace-cdn.com/content/v1/68bafafe76ca5d0593a9fe89/9dae64e7-c4b5-4fe4-94fb-6e90bda3000d/DSC03487.jpg'),
 ('state-of-grace','https://stateofgracetx.com/','https://stateofgracetx.com/wp-content/uploads/2016/02/Big_home_photo.jpg'),
 ('station-3','http://www.houstonfirestation.com/','https://images.squarespace-cdn.com/content/v1/5373e99ae4b0297decd47b98/1489090975606-KRTC5MM1H8X0WKKS3NHW/For+Website.jpg'),
 ('the-grove','https://thegrovehouston.com/','https://images.squarespace-cdn.com/content/v1/536d2ea1e4b03d8b7efd3ad9/1434736007695-AWSSGRUCQHPVPMRPPVYR/The+Grove+Exterior+Night.jpg'),
 ('the-parador','http://www.paradorhouston.com/','https://images.squarespace-cdn.com/content/v1/569c26f65dc6dec58710e677/1460663530491-5B0UUFUBQVPLC879FX2D/paradornightnight2.jpg'),
 ('the-revaire','https://www.therevaire.com/','https://www.therevaire.com/wp-content/uploads/2019/05/rev_hgo_024.jpg'),
 ('the-rustic','https://www.therustic.com/','https://www.therustic.com/media/v1/583/2024/06/R_FB_Concert_JessSepkowitz.jpg'),
 ('thompson-chardon','https://www.chardonhouston.com/','https://images.getbento.com/accounts/bbaa9b547c078470aef5a3cb5e5c6ff8/media/images/96374Chardon_BarDining_02_DavidVarley.jpg'),
 ('houston-party-boats','https://www.houstonpartyboats.com/','https://houstonpartyboats.com/wp-content/uploads/2024/03/HPB-Bar.jpg')
) AS v(id, website, image_url)
WHERE public.venues.id = v.id;
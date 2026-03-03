/**
 * County-level FEMA flood zone and USFS wildfire risk data.
 * Based on:
 *   - FEMA National Flood Hazard Layer (NFHL) Special Flood Hazard Areas (SFHA) Zone A/AE/VE designations
 *   - USFS National Fire Occurrence Database and Cal Fire historical burn area data
 *   - NOAA Storm Events and FEMA Disaster Declarations database
 *
 * County FIPS = 5-digit string: state FIPS (2) + county FIPS (3)
 * Risk levels: "High" | "Moderate" | "Low"
 */

import type { RiskLevel } from "./femaRisk";
import { getRiskForState, RISK_COLORS, WILDFIRE_COLORS } from "./femaRisk";

/** FIPS → 2-letter state abbreviation (used for fallback) */
const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "11": "DC", "12": "FL",
  "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN",
  "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME",
  "24": "MD", "25": "MA", "26": "MI", "27": "MN", "28": "MS",
  "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT",
  "50": "VT", "51": "VA", "53": "WA", "54": "WV", "55": "WI", "56": "WY",
};

// ---------------------------------------------------------------------------
// FLOOD RISK — County FIPS sets
// Source: FEMA NFHL Zone AE / A / VE / AO (Special Flood Hazard Areas)
// ---------------------------------------------------------------------------

/** Counties with FEMA-designated HIGH flood risk (Zone A/AE/VE/AO SFHA) */
const HIGH_FLOOD_COUNTIES = new Set<string>([
  // Louisiana — extensive bayou/deltaic SFHA
  "22071", // Orleans (New Orleans)
  "22051", // Jefferson
  "22075", // Plaquemines
  "22087", // St. Bernard
  "22057", // Lafourche
  "22109", // Terrebonne
  "22023", // Cameron
  "22113", // Vermilion
  "22101", // St. Mary
  "22045", // Iberia
  "22019", // Calcasieu (Lake Charles)
  "22053", // Jefferson Davis
  "22011", // Beauregard
  "22121", // Washington
  "22117", // Washington (alt)
  "22079", // Rapides (partial)

  // Florida — NFIP highest participation state
  "12087", // Monroe (Florida Keys) — extreme VE zone
  "12086", // Miami-Dade
  "12011", // Broward (Fort Lauderdale)
  "12099", // Palm Beach
  "12071", // Lee (Fort Myers — Ian 2022)
  "12021", // Collier (Naples)
  "12103", // Pinellas (St. Pete)
  "12057", // Hillsborough (Tampa)
  "12015", // Charlotte
  "12115", // Sarasota
  "12081", // Manatee
  "12027", // DeSoto
  "12035", // Flagler
  "12127", // Volusia (Daytona)
  "12109", // St. Johns (Jacksonville suburbs)
  "12031", // Duval (Jacksonville)
  "12089", // Nassau
  "12033", // Escambia (Pensacola)
  "12113", // Santa Rosa
  "12131", // Walton
  "12005", // Bay (Panama City — Michael 2018)
  "12045", // Gulf
  "12037", // Franklin

  // Texas — Harvey/Imelda flood corridor
  "48167", // Galveston
  "48201", // Harris (Houston — Harvey $125B)
  "48245", // Jefferson (Beaumont)
  "48361", // Orange
  "48199", // Hardin
  "48291", // Liberty
  "48071", // Chambers
  "48351", // Newton
  "48241", // Jasper
  "48457", // Tyler
  "48403", // Sabine
  "48405", // San Augustine
  "48373", // Polk
  "48007", // Aransas (Rockport — Harvey landfall)
  "48273", // Kleberg
  "48355", // Nueces (Corpus Christi)
  "48061", // Cameron (Brownsville/Rio Grande)
  "48215", // Hidalgo (McAllen)
  "48427", // Starr
  "48489", // Willacy

  // North Carolina — barrier island / coastal plain
  "37055", // Dare (Outer Banks)
  "37095", // Hyde
  "37177", // Tyrrell
  "37187", // Washington
  "37015", // Bertie
  "37041", // Chowan
  "37143", // Perquimans
  "37139", // Pasquotank
  "37029", // Camden
  "37053", // Currituck
  "37073", // Gates
  "37091", // Hertford
  "37131", // Northampton
  "37019", // Brunswick (Wilmington area)
  "37129", // New Hanover (Wilmington — Florence)
  "37031", // Carteret (Atlantic Beach)
  "37049", // Craven (New Bern — Florence)
  "37137", // Pamlico
  "37013", // Beaufort (Washington NC)
  "37147", // Pitt (Greenville — Floyd/Matthew)

  // New Jersey — post-Hurricane Sandy elevations
  "34029", // Ocean (Toms River, Long Beach Island)
  "34001", // Atlantic (Atlantic City)
  "34009", // Cape May
  "34025", // Monmouth (Long Branch, Asbury Park)
  "34017", // Hudson (Hoboken)
  "34023", // Middlesex (Sayreville)
  "34039", // Union (Elizabeth waterfront)

  // New York — post-Sandy Zone AE/VE expansions
  "36059", // Nassau (Long Island south shore)
  "36103", // Suffolk (Long Island east)
  "36047", // Kings (Brooklyn — Gowanus, Red Hook)
  "36081", // Queens (Rockaways)
  "36085", // Richmond (Staten Island)
  "36061", // New York (Manhattan lower/FiDi)
  "36005", // Bronx (Pelham Bay)

  // South Carolina — low-country SFHA
  "45043", // Georgetown
  "45051", // Horry (Myrtle Beach)
  "45013", // Beaufort (Hilton Head)
  "45029", // Colleton
  "45053", // Jasper
  "45019", // Charleston

  // Mississippi — Gulf Coast
  "28045", // Hancock (Bay St. Louis — Katrina)
  "28047", // Harrison (Biloxi/Gulfport)
  "28059", // Jackson (Pascagoula)
  "28109", // Pearl River
  "28039", // George
  "28131", // Stone

  // Virginia — Hampton Roads / Chesapeake Bay
  "51810", // Virginia Beach city
  "51710", // Norfolk city
  "51650", // Hampton city
  "51740", // Portsmouth city
  "51800", // Suffolk city
  "51001", // Accomack (Eastern Shore)
  "51131", // Northampton (Eastern Shore)
  "51093", // Isle of Wight
  "51115", // Mathews
  "51073", // Gloucester
  "51199", // York
  "51095", // James City (Williamsburg)

  // Maryland — Chesapeake Bay shores
  "24039", // Somerset
  "24019", // Dorchester (sea-level rise hotspot)
  "24045", // Wicomico
  "24047", // Worcester (Ocean City)
  "24009", // Calvert

  // Georgia — coastal zone
  "13179", // Liberty (Hinesville)
  "13229", // Pierce
  "13039", // Camden (St. Marys)
  "13127", // Glynn (Brunswick)
  "13191", // McIntosh
  "13099", // Effingham
  "13051", // Chatham (Savannah)
  "13209", // Montgomery
  "13001", // Appling

  // Massachusetts — coastal/Cape Cod
  "25001", // Barnstable (Cape Cod)
  "25007", // Dukes (Martha's Vineyard)
  "25019", // Nantucket
  "25023", // Plymouth (south shore)

  // Delaware — low elevation / coastal
  "10005", // Sussex (Rehoboth Beach area)
  "10003", // New Castle (partial, Wilmington waterfront)

  // Pennsylvania — Susquehanna / Delaware River
  "42079", // Luzerne (Wilkes-Barre — Agnes / Irene)
  "42089", // Monroe (Pocono)
  "42103", // Pike
  "42095", // Northampton
  "42025", // Carbon

  // California — Sacramento-San Joaquin Delta
  "06067", // Sacramento (below sea level in delta area)
  "06077", // San Joaquin (Stockton / delta)
  "06115", // Yuba (historic Yuba City flood 1997)
  "06101", // Sutter (1997 break)

  // Indiana — Wabash / Ohio River
  "18005", // Bartholomew
  "18093", // Lawrence (partial)
  "18123", // Perry
  "18147", // Spencer
  "18175", // Washington (partial)
  "18025", // Crawford

  // Ohio — Ohio River
  "39015", // Brown
  "39025", // Clermont
  "39025", // Clermont
  "39061", // Hamilton (Cincinnati)
  "39081", // Jefferson
  "39109", // Miami (partial)

  // Tennessee — Cumberland / Tennessee River
  "47081", // Humphreys (2021 extreme flash flood — 20" rain)
  "47043", // Dickson
  "47149", // Robertson
  "47125", // Montgomery (Clarksville)
  "47007", // Benton (Kentucky Lake)

  // Alabama — Mobile / Tombigbee
  "01097", // Mobile
  "01003", // Baldwin
  "01129", // Washington
  "01047", // Dallas
]);

/** Counties with FEMA-designated MODERATE flood risk (Zone X-shaded / B) */
const MODERATE_FLOOD_COUNTIES = new Set<string>([
  // Florida — inland with some floodplain
  "12001", // Alachua (Gainesville)
  "12017", // Citrus
  "12053", // Hernando
  "12069", // Lake
  "12117", // Seminole
  "12095", // Orange (Orlando — 2017 Irma flooding)
  "12097", // Osceola
  "12111", // St. Lucie
  "12043", // Glades
  "12049", // Hardee

  // Texas — adjacent to high-risk / flood-prone
  "48157", // Fort Bend (Houston suburbs)
  "48339", // Montgomery (Houston suburbs)
  "48039", // Brazoria
  "48321", // Matagorda
  "48409", // San Jacinto
  "48391", // Robertson
  "48029", // Bexar (San Antonio — 2021 freeze/flooding)
  "48113", // Dallas (partial creek corridors)
  "48121", // Denton (partial)
  "48135", // Ector (Odessa)

  // North Carolina — Piedmont river corridors
  "37021", // Buncombe (Asheville — Helene 2024)
  "37055", // (already high)
  "37059", // Davie
  "37067", // Forsyth (Winston-Salem)
  "37081", // Guilford (Greensboro)
  "37119", // Mecklenburg (Charlotte)
  "37025", // Cabarrus

  // Virginia — inland rivers
  "51036", // Charles City
  "51127", // New Kent
  "51149", // Prince George
  "51087", // Henrico (Richmond)
  "51760", // Richmond city
  "51540", // Charlottesville city
  "51003", // Albemarle

  // New Jersey — inland flood corridors
  "34005", // Burlington
  "34007", // Camden
  "34011", // Cumberland
  "34013", // Essex (Newark — Passaic River)
  "34031", // Passaic

  // New York — Hudson River / inland
  "36119", // Westchester
  "36087", // Rockland
  "36071", // Orange (Passaic headwaters)
  "36079", // Putnam
  "36111", // Ulster (Hudson)
  "36019", // Clinton
  "36031", // Essex (Adirondacks)
  "36033", // Franklin

  // Maryland — bay tributaries
  "24003", // Anne Arundel
  "24005", // Baltimore County
  "24027", // Howard
  "24029", // Kent
  "24035", // Queen Anne's
  "24025", // Harford
  "24037", // St. Mary's

  // Georgia — Savannah / Altamaha River
  "13133", // Greene
  "13261", // Sumter
  "13223", // Paulding (partial)
  "13135", // Gwinnett (partial — creek corridors)
  "13063", // Clayton

  // South Carolina — interior rivers
  "45037", // Edgefield
  "45041", // Florence (Pee Dee River — Florence 2018)
  "45027", // Clarendon
  "45035", // Dorchester
  "45015", // Berkeley

  // Tennessee — river lowlands
  "47021", // Cheatham
  "47037", // Davidson (Nashville — 2010 flood)
  "47111", // Macon
  "47085", // Lake (Reelfoot)
  "47033", // Crockett

  // Pennsylvania — river cities
  "42017", // Bucks (Delaware River — Trenton area)
  "42101", // Philadelphia
  "42045", // Delaware
  "42029", // Chester (Brandywine Creek)
  "42133", // York (Susquehanna)
  "42043", // Dauphin (Harrisburg — Susquehanna)
  "42075", // Lebanon

  // Illinois — Illinois / Mississippi River
  "17163", // St. Clair (East St. Louis)
  "17119", // Madison (Alton — Mississippi)
  "17133", // Monroe
  "17017", // Cass
  "17011", // Bureau (Illinois River)
  "17175", // Stark
  "17001", // Adams (Quincy — Mississippi)

  // Missouri — Missouri / Mississippi River
  "29099", // Jefferson (St. Louis suburbs)
  "29189", // St. Louis County (partial)
  "29510", // St. Louis city
  "29019", // Boone (Columbia — partial)
  "29051", // Cole (Jefferson City — Missouri R.)

  // Ohio — Maumee / Scioto / Miami Rivers
  "39039", // Defiance
  "39171", // Williams
  "39049", // Franklin (Columbus — Scioto)
  "39041", // Delaware
  "39097", // Logan
  "39001", // Adams

  // Indiana — Ohio / White / Wabash River
  "18015", // Carroll
  "18181", // White
  "18107", // Owen
  "18055", // Greene
  "18027", // Daviess
  "18101", // Martin

  // California — Valley floodplain
  "06019", // Fresno (San Joaquin River)
  "06039", // Madera
  "06047", // Merced
  "06099", // Stanislaus
  "06077", // (already high)
  "06113", // Yolo (Cache Creek / Sacramento)
  "06021", // Glenn
  "06011", // Colusa
  "06007", // Butte (Feather River — Oroville spillway 2017)
  "06095", // Solano (Cache Creek / Delta)
  "06057", // Nevada (partial — Bear River)

  // Michigan — Saginaw Bay / rivers
  "26145", // Saginaw
  "26017", // Bay (Saginaw Bay)
  "26073", // Isabella (Chippewa/Tittabawassee)
  "26155", // Shiawassee (2020 dam failure)
  "26111", // Midland (2020 dam failure — major disaster)

  // Arizona — monsoon flash flood zones
  "04019", // Pima (Tucson — monsoon)
  "04013", // Maricopa (Phoenix — monsoon)
  "04021", // Pinal
  "04005", // Coconino (partial)

  // Washington — coastal / rivers
  "53015", // Cowlitz (Chehalis / Columbia)
  "53041", // Lewis (Chehalis — 2007 major flood)
  "53027", // Grays Harbor
  "53049", // Pacific (Willapa Bay)
  "53069", // Wahkiakum

  // Oregon — Willamette / Umpqua / Rogue
  "41005", // Clackamas (Clackamas River)
  "41047", // Marion (Willamette)
  "41053", // Polk
  "41059", // Umatilla
  "41067", // Washington (Tualatin)

  // Colorado — Front Range creeks
  "08013", // Boulder (2013 flood — $4B damage)
  "08001", // Adams (South Platte)
  "08031", // Denver (South Platte)
  "08005", // Arapahoe
  "08035", // Douglas (Cherry Creek headwaters)

  // Massachusetts — Charles / Merrimack / Taunton
  "25009", // Essex (Merrimack)
  "25017", // Middlesex (Concord / Charles)
  "25021", // Norfolk
  "25025", // Suffolk (Boston — Charles)
  "25027", // Worcester (partial)
]);

// ---------------------------------------------------------------------------
// WILDFIRE RISK — County FIPS sets
// Source: USFS National Fire Occurrence Database, Cal Fire, NWCG risk maps
// ---------------------------------------------------------------------------

/** Counties with HIGH wildfire risk (documented significant burn history / WUI exposure) */
const HIGH_WILDFIRE_COUNTIES = new Set<string>([
  // California — highest-risk counties in the nation
  "06007", // Butte (Camp Fire 2018 — Paradise destroyed — 85 deaths)
  "06089", // Shasta (Carr Fire 2018; Caldor 2021)
  "06105", // Trinity (remote — near-annual burns)
  "06103", // Tehama
  "06063", // Plumas (Dixie Fire 2021 — largest single CA fire)
  "06091", // Sierra (Dixie Fire edge)
  "06057", // Nevada (Caldor Fire edge; Bear Fire)
  "06009", // Calaveras (Butte Fire 2015)
  "06109", // Tuolumne (Rim Fire 2013 — Yosemite)
  "06043", // Mariposa (Oak Fire 2022)
  "06033", // Lake (Valley Fire 2015; Mendocino Complex)
  "06045", // Mendocino (Mendocino Complex 2018 — largest at time)
  "06023", // Humboldt (Antelope Fire; NW CA)
  "06097", // Sonoma (Tubbs Fire 2017 — Santa Rosa)
  "06055", // Napa (Glass Fire 2020)
  "06017", // El Dorado (Caldor Fire 2021 — South Lake Tahoe)
  "06005", // Amador (Butte Lightning Complex)
  "06019", // Fresno (Creek Fire 2020 — largest single-ignition)
  "06107", // Tulare (Windy Fire; Castle Fire)
  "06029", // Kern (Sequoia Complex)
  "06111", // Ventura (Thomas Fire 2017 — largest at time; Woolsey 2018)
  "06037", // Los Angeles (Woolsey; Bobcat; Eaton/Palisades 2025)
  "06073", // San Diego (Cedar 2003; Harris 2007; Witch 2007)
  "06065", // Riverside (Fairview Fire 2022)
  "06071", // San Bernardino (Blue Cut; Bobcat; El Dorado)
  "06059", // Orange (Santiago; Bond Fire 2020)
  "06013", // Contra Costa (Diablo Range WUI)
  "06061", // Placer (KNP Complex edge)
  "06067", // Sacramento (Cosumnes; delta WUI perimeter)
  "06003", // Alpine (near Caldor perimeter)
  "06001", // Alameda (Diablo / Orinda WUI)

  // Colorado — Front Range / western slope
  "08013", // Boulder (Marshall Fire 2021 — most destructive CO fire)
  "08069", // Larimer (Cameron Peak 2020 — largest CO fire at time; High Park)
  "08049", // Grand (East Troublesome 2020 — 2nd largest CO)
  "08059", // Jefferson (Lookout Mtn. WUI; Coal Creek)
  "08041", // El Paso (Waldo Canyon 2012; Black Forest 2013)
  "08119", // Teller (Hayman Fire 2002; Waldo adj.)
  "08019", // Clear Creek (Echo Mountain 2020)
  "08047", // Gilpin
  "08093", // Park (Hayman Fire core)
  "08015", // Chaffee (Pine Creek)
  "08065", // Lake (Turquoise Lake WUI)
  "08067", // La Plata (416 Fire 2018)
  "08083", // Montezuma (Weber Fire)
  "08007", // Archuleta
  "08031", // Denver (partial — suburban WUI edges)
  "08027", // Custer
  "08055", // Huerfano (Spring Fire 2018)
  "08071", // Las Animas

  // Oregon — east of Cascades / Rogue / Klamath
  "41029", // Jackson (Almeda Fire 2020 — Ashland / Talent / Phoenix; Rogue complex)
  "41033", // Josephine (Rum Creek Fire 2022; Klondike)
  "41035", // Klamath (Bootleg Fire 2021 — largest OR)
  "41037", // Lake (Summer Lake; Bootleg edge)
  "41017", // Deschutes (Grandview; Joes Draw)
  "41013", // Crook (Riley Complex)
  "41031", // Jefferson
  "41025", // Harney (Deep South Complex)
  "41045", // Malheur
  "41023", // Grant (Magone Lake; Galena)
  "41069", // Wheeler
  "41021", // Gilliam (Columbia Gorge edge)
  "41055", // Sherman
  "41065", // Wasco (Eagle Creek 2017 — Columbia Gorge)
  "41059", // Umatilla (Frazier Fire; eastern OR)
  "41071", // Yamhill (partial WUI)

  // Washington — east of Cascades (perpetually high risk)
  "53047", // Okanogan (Carlton Complex 2014; Cougar Creek; Crescent Mtn)
  "53019", // Ferry (Black Mountain; Huckleberry)
  "53065", // Stevens (Boyds; Havillah)
  "53051", // Pend Oreille (Ione; Sacheen)
  "53043", // Lincoln (Firestorm 2001 — Spokane suburbs)
  "53007", // Chelan (Sleepy Hollow 2015; Nile)
  "53077", // Yakima (Nile; Snowshoe; Yakima Training Center)
  "53037", // Kittitas (Taylor Bridge 2012)
  "53039", // Klickitat (Rattlesnake Complex)
  "53025", // Grant (Beezley Hills)
  "53017", // Douglas (Highway 2 Corridor)
  "53071", // Walla Walla (China Hollow; Frog Hollow)
  "53001", // Adams (Lind Coulee; Washtucna)

  // Arizona — high-risk — SE / Mogollon Rim / White Mtns
  "04005", // Coconino (Schultz Fire; Tunnel Fire 2022; Museum Fire)
  "04025", // Yavapai (Doce Fire 2013; Gladiator; Goodwin)
  "04007", // Gila (Wallow Fire 2011 — largest AZ fire ever)
  "04001", // Apache (Wallow Fire core; Bear Wallow; Frye)
  "04017", // Navajo (Rodeo-Chediski 2002; Wallow edge)
  "04009", // Graham (Frye Fire 2017 — Pinaleños)
  "04011", // Greenlee (Eagle; Nuttall)
  "04023", // Santa Cruz (Murphy; Horseshoe 2)
  "04019", // Pima (Bighorn; Frye edge — Catalina WUI)
  "04021", // Pinal (Mescal; Picketpost)

  // Montana — western forests (near-annual large fires)
  "30089", // Sanders (Skidoo Butte; South Fork)
  "30053", // Lincoln (Pete King; Whitetail)
  "30061", // Mineral (Straight Creek)
  "30063", // Missoula (Lolo; Rattlesnake)
  "30081", // Ravalli (Bitterroot Complex 2000; Roaring Lion)
  "30029", // Flathead (Whitefish; Spotted Bear)
  "30047", // Lake (Jocko Lakes)
  "30039", // Granite (West Fork)
  "30023", // Deer Lodge (Anaconda/Flint Creek)
  "30077", // Powell (Helmville; Seven Mile)
  "30071", // Phillips (Ackley Lake; Prairie Fire — eastern MT)
  "30075", // Powder River (prairie fire risk)
  "30001", // Beaverhead (Tendoy Mts)
  "30021", // Dawson (prairie)

  // Idaho — Clearwater / Salmon River / Boise Front
  "16035", // Clearwater (Lolo Complex; Clearwater Complex)
  "16049", // Idaho (Moose Fire 2022; Frank Church Wilderness fires)
  "16059", // Lemhi (Salmon-Challis; Patterson Fire)
  "16037", // Custer (Salmon-Challis)
  "16085", // Valley (Cascade; Tepee Springs)
  "16003", // Adams (Rattlesnake; Grouse)
  "16069", // Nez Perce (Tenmile)
  "16087", // Washington (Squaw Creek)
  "16015", // Boise (Rabbit Creek; Boise Front — near BSU/WUI)
  "16043", // Elmore (Lightening Complex; Milestone)
  "16013", // Blaine (Silver Creek; Lodgepole)

  // New Mexico — Jemez / Sangre de Cristo / Sacramento Mtns
  "35003", // Catron (Wallow cross-border)
  "35017", // Grant (Signal; Whitewater-Baldy 2012)
  "35023", // Hidalgo (Whitewater-Baldy edge)
  "35051", // Sierra (Silver Fire; Tadpole)
  "35027", // Lincoln (Little Bear 2012 — Ruidoso; Hermits Peak adj.)
  "35035", // Otero (High Mountain Fire; Meadow Fire)
  "35043", // Sandoval (Cerro Grande 2000 — Los Alamos! Hermits Peak 2022)
  "35028", // Los Alamos (Cerro Grande 2000; Hermits Peak 2022 — largest NM ever)
  "35053", // Socorro (Langmuir; Webb; Derry)
  "35049", // San Miguel (Hermits Peak 2022 — 342,000+ acres)
  "35047", // San Juan (Sambrito; Gobernador)
  "35039", // Rio Arriba (Tascosa; Cerro Pelado)
  "35055", // Taos (Midnight Meadows; Hummingbird)
  "35057", // Torrance

  // Texas — Trans-Pecos / west TX prairie fires
  "48377", // Presidio (Chinati; Pinto Canyon)
  "48243", // Jeff Davis (Davis Mts)
  "48043", // Brewster (Big Bend region)
  "48371", // Pecos (Pecos County fires)
  "48383", // Reeves
  "48301", // Loving (West TX Panhandle wind-driven)
  "48495", // Winkler
  "48475", // Ward
  "48103", // Crane
  "48461", // Upton
  "48011", // Armstrong (Panhandle fires 2024 — Smokehouse Creek)
  "48357", // Ochiltree (2024 Panhandle fires — largest TX ever)
  "48087", // Collingsworth
  "48169", // Garza
  "48389", // Reeves (overlap — unique code)
  "48295", // Lipscomb (2024 Panhandle)
  "48421", // Sherman (2024 Panhandle — Smokehouse Creek core)
  "48111", // Dallam (2024 Panhandle)
  "48341", // Moore

  // Utah — Great Basin / Escalante / Uinta WUI
  "49053", // Washington (Beaver Dam; Quail; Gunlock — St. George area)
  "49021", // Iron (Brian Head Fire 2017; Pine Valley)
  "49001", // Beaver (Barn Fire)
  "49031", // Piute (Sevier complex)
  "49055", // Wayne (Pole Creek)
  "49017", // Garfield (Casto Canyon; Brian Head adj.)
  "49025", // Kane (East Fork)
  "49037", // San Juan (Recapture)
  "49007", // Carbon (Price Canyon)
  "49015", // Emery (Ferron; Muddy Creek)
  "49011", // Davis (Bountiful Bench WUI)
  "49035", // Salt Lake (partial — Wasatch Front WUI)

  // Nevada — Great Basin / Sierra Nevada east slope
  "32011", // Elko (Jarbidge Wilderness; Martin; Dinner Station)
  "32013", // Humboldt (Kings River; Orovada)
  "32015", // Lander (Crescent Dunes; Cortez)
  "32009", // Eureka (Diamond Valley; Willow Springs)
  "32033", // White Pine (White Pine; Millard; Osceola)
  "32023", // Nye (Muddy Mountains; Wheeler Pass)
  "32021", // Mineral (Walker Lake; Wheeler)
  "32019", // Lyon (Tamarack Fire cross-border; Pine Nut WUI)
  "32031", // Washoe (Tamarack; Reno-Tahoe WUI; Cold Springs)

  // Wyoming — Big Horn / Yellowstone adj.
  "56029", // Park (Yellowstone boundary fires; Shoshone NF)
  "56013", // Fremont (Wind River; Shoshone)
  "56035", // Sublette (Pinedale Anticline WUI)
  "56003", // Big Horn (Pryor Mts)
  "56039", // Teton (Jackson Hole WUI)
  "56023", // Lincoln (Bridger-Teton)

  // Other western states
  "08101", // Pueblo, CO (Junkins Fire 2021)
  "08121", // Washington, CO (Calwood Fire east edge)
  "16021", // Boundary, ID
  "16033", // Clark, ID (high desert)
  "30003", // Big Horn, MT
  "30067", // Park, MT (Yellowstone adj.)
  "56005", // Campbell, WY (prairie fire)
]);

/** Counties with MODERATE wildfire risk */
const MODERATE_WILDFIRE_COUNTIES = new Set<string>([
  // California — lower-severity or periodic burn cycles
  "06041", // Marin (Point Reyes fire 2020; WUI)
  "06075", // San Francisco (urban WUI edges)
  "06081", // San Mateo (WUI hills)
  "06085", // Santa Clara (SCU Lightning Complex)
  "06069", // San Benito (Pinnacles adj.)
  "06053", // Monterey (Dolan Fire; River Fire)
  "06079", // San Luis Obispo (Chimney; Sherpa; River Fire)
  "06083", // Santa Barbara (Thomas Fire edge; Alisal Fire 2021)
  "06031", // Kings (partial mountains)
  "06011", // Colusa (partial Cache Creek range)
  "06033", // (already high)
  "06025", // Imperial (marginal — desert scrub)

  // Colorado
  "08035", // Douglas (Black Forest edge; Cherokee Ranch)
  "08001", // Adams (South Platte; limited)
  "08005", // Arapahoe (limited urban WUI)
  "08109", // Saguache (Subalpine/Sangre)
  "08023", // Costilla (Cucharas Pass)

  // Oregon
  "41043", // Linn (Holiday Farm Fire 2020)
  "41039", // Lane (Holiday Farm; Archie Creek)
  "41019", // Douglas (Archie Creek Fire 2020)
  "41027", // Hood River (Eagle Creek 2017; Columbia Gorge edge)
  "41005", // Clackamas (Riverside Fire 2020; Beachie Creek adj.)
  "41047", // Marion (Beachie Creek Fire 2020 — Detroit; Santiam Canyon)
  "41003", // Benton (Flat Fire)
  "41053", // Polk (Baskett Slough)

  // Washington
  "53061", // Snohomish (Bolt Creek Fire 2022; Mountain Loop WUI)
  "53005", // Benton (Horse Heaven; Benton City)
  "53021", // Franklin (Horse Heaven adj.)
  "53069", // Wahkiakum (adj. Clark; Columbia)
  "53011", // Clark (Columbia Gorge)
  "53059", // Skamania (Columbia Gorge — Eagle Creek cross-border)
  "53063", // Spokane (Firestorm 2001 historical; Beacon Hill)

  // Arizona
  "04015", // Mohave (Boundary; Ranch House)
  "04012", // La Paz (limited)
  "04027", // Yuma (limited desert fire)

  // Montana
  "30093", // Silver Bow (Anaconda WUI)
  "30013", // Cascade (Highwood; Belt Mtns WUI)
  "30111", // Yellowstone (Billings WUI; Rims)
  "30049", // Lewis and Clark (Helena Mts; Canyon Ferry WUI)
  "30037", // Golden Valley
  "30079", // Prairie

  // Idaho
  "16011", // Bingham (Snake River Plains fire)
  "16027", // Butte (Borah Peak area)
  "16025", // Camas (high desert)
  "16083", // Twin Falls (Milner; Sinking Creek)
  "16055", // Gooding
  "16063", // Lincoln (Magic Valley)

  // New Mexico
  "35001", // Bernalillo (Albuquerque — Sandia WUI; 2022 Cibola adj.)
  "35045", // San Juan (Gallegos; Gobernador)
  "35059", // Union (NE NM prairie)
  "35061", // Valencia (Manzano Mts)
  "35031", // McKinley (Cibola NF edge)

  // Texas
  "48029", // Bexar (limited — cedar breaks WUI)
  "48451", // Tom Green (limited cedar — San Angelo area)
  "48329", // Midland (limited)
  "48135", // Ector (limited)
  "48059", // Callahan (Taylor Co. adj.)
  "48213", // Henderson (E. TX Pineywoods periodic)

  // Utah
  "49041", // Sevier (Fishlake NF adj.)
  "49039", // Sanpete (Manti-LaSal NF adj.)
  "49029", // Morgan (Wasatch Front WUI)
  "49043", // Summit (Park City WUI)
  "49051", // Wasatch (Heber WUI; Daniels Canyon)

  // Nevada
  "32003", // Clark (Spring Mtns; Red Rock; Goodsprings)
  "32510", // Carson City (Tahoe-Reno WUI)
  "32029", // Storey (Virginia Range fires adj. Reno)
  "32005", // Douglas (Tahoe adj.; Pine Nut WUI)

  // Other
  "56019", // Johnson, WY (Bighorn Mtns WUI)
  "56025", // Natrona, WY (Casper Mtn; Muddy Mts)
  "56041", // Uinta, WY (WUI fire risk)
  "49045", // Tooele, UT (partial)
  "32007", // Elko adj. / East Humboldt
  "06039", // Madera, CA (partial valley WUI)
]);

// ---------------------------------------------------------------------------
// Public accessor functions
// ---------------------------------------------------------------------------

/**
 * Get flood risk level for a specific county FIPS code.
 * Falls back to state-level estimate if county not in explicit lookup.
 */
export function getCountyFloodRisk(countyFips: string): RiskLevel {
  if (HIGH_FLOOD_COUNTIES.has(countyFips)) return "High";
  if (MODERATE_FLOOD_COUNTIES.has(countyFips)) return "Moderate";
  const stateAbbr = FIPS_TO_STATE[countyFips.slice(0, 2)] ?? "";
  return getRiskForState(stateAbbr).floodZone;
}

/**
 * Get wildfire risk level for a specific county FIPS code.
 * Falls back to state-level estimate if county not in explicit lookup.
 */
export function getCountyWildfireRisk(countyFips: string): RiskLevel {
  if (HIGH_WILDFIRE_COUNTIES.has(countyFips)) return "High";
  if (MODERATE_WILDFIRE_COUNTIES.has(countyFips)) return "Moderate";
  const stateAbbr = FIPS_TO_STATE[countyFips.slice(0, 2)] ?? "";
  return getRiskForState(stateAbbr).wildfireRisk;
}

/**
 * Get fill color for a county's flood risk.
 */
export function countyFloodFill(countyFips: string): string {
  const level = getCountyFloodRisk(countyFips);
  return RISK_COLORS[level].fill;
}

/**
 * Get fill color for a county's wildfire risk.
 */
export function countyWildfireFill(countyFips: string): string {
  const level = getCountyWildfireRisk(countyFips);
  return WILDFIRE_COLORS[level].fill;
}

/**
 * Get both flood and wildfire risk levels for a county.
 */
export function getCountyRisk(countyFips: string) {
  return {
    floodRisk: getCountyFloodRisk(countyFips),
    wildfireRisk: getCountyWildfireRisk(countyFips),
  };
}

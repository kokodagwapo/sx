/**
 * buildRealGeoData.cjs
 * Reads realLoans.json and produces realGeoData.json:
 * A flat array of LoanGeoRecord objects (state → county level, one entry per county)
 * with real loan counts and UPBs from the actual loan tape.
 *
 * County FIPS codes are looked up from a comprehensive built-in mapping.
 * Unknown counties fall back to state FIPS + "999" (no risk overlay, harmless).
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------------
// State abbr → {fips, name} lookup
// ---------------------------------------------------------------------------
const STATE_INFO = {
  AL: { fips: "01", name: "Alabama" }, AK: { fips: "02", name: "Alaska" },
  AZ: { fips: "04", name: "Arizona" }, AR: { fips: "05", name: "Arkansas" },
  CA: { fips: "06", name: "California" }, CO: { fips: "08", name: "Colorado" },
  CT: { fips: "09", name: "Connecticut" }, DC: { fips: "11", name: "Washington DC" },
  DE: { fips: "10", name: "Delaware" }, FL: { fips: "12", name: "Florida" },
  GA: { fips: "13", name: "Georgia" }, HI: { fips: "15", name: "Hawaii" },
  ID: { fips: "16", name: "Idaho" }, IL: { fips: "17", name: "Illinois" },
  IN: { fips: "18", name: "Indiana" }, IA: { fips: "19", name: "Iowa" },
  KS: { fips: "20", name: "Kansas" }, KY: { fips: "21", name: "Kentucky" },
  LA: { fips: "22", name: "Louisiana" }, ME: { fips: "23", name: "Maine" },
  MD: { fips: "24", name: "Maryland" }, MA: { fips: "25", name: "Massachusetts" },
  MI: { fips: "26", name: "Michigan" }, MN: { fips: "27", name: "Minnesota" },
  MS: { fips: "28", name: "Mississippi" }, MO: { fips: "29", name: "Missouri" },
  MT: { fips: "30", name: "Montana" }, NE: { fips: "31", name: "Nebraska" },
  NV: { fips: "32", name: "Nevada" }, NH: { fips: "33", name: "New Hampshire" },
  NJ: { fips: "34", name: "New Jersey" }, NM: { fips: "35", name: "New Mexico" },
  NY: { fips: "36", name: "New York" }, NC: { fips: "37", name: "North Carolina" },
  ND: { fips: "38", name: "North Dakota" }, OH: { fips: "39", name: "Ohio" },
  OK: { fips: "40", name: "Oklahoma" }, OR: { fips: "41", name: "Oregon" },
  PA: { fips: "42", name: "Pennsylvania" }, RI: { fips: "44", name: "Rhode Island" },
  SC: { fips: "45", name: "South Carolina" }, SD: { fips: "46", name: "South Dakota" },
  TN: { fips: "47", name: "Tennessee" }, TX: { fips: "48", name: "Texas" },
  UT: { fips: "49", name: "Utah" }, VT: { fips: "50", name: "Vermont" },
  VA: { fips: "51", name: "Virginia" }, WA: { fips: "53", name: "Washington" },
  WV: { fips: "54", name: "West Virginia" }, WI: { fips: "55", name: "Wisconsin" },
  WY: { fips: "56", name: "Wyoming" },
};

// ---------------------------------------------------------------------------
// County name (lowercase, trimmed) + state → county FIPS (3-digit)
// Source: US Census Bureau FIPS codes
// ---------------------------------------------------------------------------
const COUNTY_FIPS = {
  // California
  "alameda:CA": "001", "alpine:CA": "003", "amador:CA": "005", "butte:CA": "007",
  "calaveras:CA": "009", "colusa:CA": "011", "contra costa:CA": "013", "del norte:CA": "015",
  "el dorado:CA": "017", "fresno:CA": "019", "glenn:CA": "021", "humboldt:CA": "023",
  "imperial:CA": "025", "inyo:CA": "027", "kern:CA": "029", "kings:CA": "031",
  "lake:CA": "033", "lassen:CA": "035", "los angeles:CA": "037", "madera:CA": "039",
  "marin:CA": "041", "mariposa:CA": "043", "mendocino:CA": "045", "merced:CA": "047",
  "modoc:CA": "049", "mono:CA": "051", "monterey:CA": "053", "napa:CA": "055",
  "nevada:CA": "057", "orange:CA": "059", "placer:CA": "061", "plumas:CA": "063",
  "riverside:CA": "065", "sacramento:CA": "067", "san benito:CA": "069",
  "san bernardino:CA": "071", "san diego:CA": "073", "san francisco:CA": "075",
  "san joaquin:CA": "077", "san luis obispo:CA": "079", "san mateo:CA": "081",
  "santa barbara:CA": "083", "santa clara:CA": "085", "santa cruz:CA": "087",
  "shasta:CA": "089", "sierra:CA": "091", "siskiyou:CA": "093", "solano:CA": "095",
  "sonoma:CA": "097", "stanislaus:CA": "099", "sutter:CA": "101", "tehama:CA": "103",
  "trinity:CA": "105", "tulare:CA": "107", "tuolumne:CA": "109", "ventura:CA": "111",
  "yolo:CA": "113", "yuba:CA": "115",
  // Florida
  "alachua:FL": "001", "baker:FL": "003", "bay:FL": "005", "bradford:FL": "007",
  "brevard:FL": "009", "broward:FL": "011", "calhoun:FL": "013", "charlotte:FL": "015",
  "citrus:FL": "017", "clay:FL": "019", "collier:FL": "021", "columbia:FL": "023",
  "miami-dade:FL": "086", "desoto:FL": "027", "dixie:FL": "029", "duval:FL": "031",
  "escambia:FL": "033", "flagler:FL": "035", "franklin:FL": "037", "gadsden:FL": "039",
  "gilchrist:FL": "041", "glades:FL": "043", "gulf:FL": "045", "hamilton:FL": "047",
  "hardee:FL": "049", "hendry:FL": "051", "hernando:FL": "053", "highlands:FL": "055",
  "hillsborough:FL": "057", "holmes:FL": "059", "indian river:FL": "061", "jackson:FL": "063",
  "jefferson:FL": "065", "lafayette:FL": "067", "lake:FL": "069", "lee:FL": "071",
  "leon:FL": "073", "levy:FL": "075", "liberty:FL": "077", "madison:FL": "079",
  "manatee:FL": "081", "marion:FL": "083", "martin:FL": "085", "monroe:FL": "087",
  "nassau:FL": "089", "okaloosa:FL": "091", "okeechobee:FL": "093", "orange:FL": "095",
  "osceola:FL": "097", "palm beach:FL": "099", "pasco:FL": "101", "pinellas:FL": "103",
  "polk:FL": "105", "putnam:FL": "107", "santa rosa:FL": "113", "sarasota:FL": "115",
  "seminole:FL": "117", "st. johns:FL": "109", "st. lucie:FL": "111", "sumter:FL": "119",
  "suwannee:FL": "121", "taylor:FL": "123", "union:FL": "125", "volusia:FL": "127",
  "wakulla:FL": "129", "walton:FL": "131", "washington:FL": "133",
  // Georgia
  "appling:GA": "001", "atkinson:GA": "003", "bacon:GA": "005", "baker:GA": "007",
  "baldwin:GA": "009", "banks:GA": "011", "barrow:GA": "013", "bartow:GA": "015",
  "ben hill:GA": "017", "berrien:GA": "019", "bibb:GA": "021", "bleckley:GA": "023",
  "brantley:GA": "025", "brooks:GA": "027", "bryan:GA": "029", "bulloch:GA": "031",
  "burke:GA": "033", "butts:GA": "035", "calhoun:GA": "037", "camden:GA": "039",
  "candler:GA": "043", "carroll:GA": "045", "catoosa:GA": "047", "charlton:GA": "049",
  "chatham:GA": "051", "chattahoochee:GA": "053", "chattooga:GA": "055",
  "cherokee:GA": "057", "clarke:GA": "059", "clay:GA": "061", "clayton:GA": "063",
  "clinch:GA": "065", "cobb:GA": "067", "coffee:GA": "069", "colquitt:GA": "071",
  "columbia:GA": "073", "cook:GA": "075", "coweta:GA": "077", "crawford:GA": "079",
  "crisp:GA": "081", "dade:GA": "083", "dawson:GA": "085", "decatur:GA": "087",
  "dekalb:GA": "089", "dodge:GA": "091", "dooly:GA": "093", "dougherty:GA": "095",
  "douglas:GA": "097", "early:GA": "099", "echols:GA": "101", "effingham:GA": "103",
  "elbert:GA": "105", "emanuel:GA": "107", "evans:GA": "109", "fannin:GA": "111",
  "fayette:GA": "113", "floyd:GA": "115", "forsyth:GA": "117", "franklin:GA": "119",
  "fulton:GA": "121", "gilmer:GA": "123", "glascock:GA": "125", "glynn:GA": "127",
  "gordon:GA": "129", "grady:GA": "131", "greene:GA": "133", "gwinnett:GA": "135",
  "habersham:GA": "137", "hall:GA": "139", "hancock:GA": "141", "haralson:GA": "143",
  "harris:GA": "145", "hart:GA": "147", "heard:GA": "149", "henry:GA": "151",
  "houston:GA": "153", "irwin:GA": "155", "jackson:GA": "157", "jasper:GA": "159",
  "jeff davis:GA": "161", "jefferson:GA": "163", "jenkins:GA": "165", "johnson:GA": "167",
  "jones:GA": "169", "lamar:GA": "171", "lanier:GA": "173", "laurens:GA": "175",
  "lee:GA": "177", "liberty:GA": "179", "lincoln:GA": "181", "long:GA": "183",
  "lowndes:GA": "185", "lumpkin:GA": "187", "macon:GA": "193", "madison:GA": "195",
  "marion:GA": "197", "mcduffie:GA": "189", "mcintosh:GA": "191", "meriwether:GA": "199",
  "miller:GA": "201", "mitchell:GA": "205", "monroe:GA": "207", "montgomery:GA": "209",
  "morgan:GA": "211", "murray:GA": "213", "muscogee:GA": "215", "newton:GA": "217",
  "oconee:GA": "219", "oglethorpe:GA": "221", "paulding:GA": "223", "peach:GA": "225",
  "pickens:GA": "227", "pierce:GA": "229", "pike:GA": "231", "polk:GA": "233",
  "pulaski:GA": "235", "putnam:GA": "237", "quitman:GA": "239", "rabun:GA": "241",
  "randolph:GA": "243", "richmond:GA": "245", "rockdale:GA": "247", "schley:GA": "249",
  "screven:GA": "251", "seminole:GA": "253", "spalding:GA": "255", "stephens:GA": "257",
  "stewart:GA": "259", "sumter:GA": "261", "talbot:GA": "263", "taliaferro:GA": "265",
  "tattnall:GA": "267", "taylor:GA": "269", "telfair:GA": "271", "terrell:GA": "273",
  "thomas:GA": "275", "tift:GA": "277", "toombs:GA": "279", "towns:GA": "281",
  "treutlen:GA": "283", "troup:GA": "285", "turner:GA": "287", "twiggs:GA": "289",
  "union:GA": "291", "upson:GA": "293", "walker:GA": "295", "walton:GA": "297",
  "ware:GA": "299", "warren:GA": "301", "washington:GA": "303", "wayne:GA": "305",
  "webster:GA": "307", "wheeler:GA": "309", "white:GA": "311", "whitfield:GA": "313",
  "wilcox:GA": "315", "wilkes:GA": "317", "wilkinson:GA": "319", "worth:GA": "321",
  // Pennsylvania
  "adams:PA": "001", "allegheny:PA": "003", "armstrong:PA": "005", "beaver:PA": "007",
  "bedford:PA": "009", "berks:PA": "011", "blair:PA": "013", "bradford:PA": "015",
  "bucks:PA": "017", "butler:PA": "019", "cambria:PA": "021", "cameron:PA": "023",
  "carbon:PA": "025", "centre:PA": "027", "chester:PA": "029", "clarion:PA": "031",
  "clearfield:PA": "033", "clinton:PA": "035", "columbia:PA": "037", "crawford:PA": "039",
  "cumberland:PA": "041", "dauphin:PA": "043", "delaware:PA": "045", "elk:PA": "047",
  "erie:PA": "049", "fayette:PA": "051", "forest:PA": "053", "franklin:PA": "055",
  "fulton:PA": "057", "greene:PA": "059", "huntingdon:PA": "061", "indiana:PA": "063",
  "jefferson:PA": "065", "juniata:PA": "067", "lackawanna:PA": "069", "lancaster:PA": "071",
  "lawrence:PA": "073", "lebanon:PA": "075", "lehigh:PA": "077", "luzerne:PA": "079",
  "lycoming:PA": "081", "mckean:PA": "083", "mercer:PA": "085", "mifflin:PA": "087",
  "monroe:PA": "089", "montgomery:PA": "091", "montour:PA": "093", "northampton:PA": "095",
  "northumberland:PA": "097", "perry:PA": "099", "philadelphia:PA": "101", "pike:PA": "103",
  "potter:PA": "105", "schuylkill:PA": "107", "snyder:PA": "109", "somerset:PA": "111",
  "sullivan:PA": "113", "susquehanna:PA": "115", "tioga:PA": "117", "union:PA": "119",
  "venango:PA": "121", "warren:PA": "123", "washington:PA": "125", "wayne:PA": "127",
  "westmoreland:PA": "129", "wyoming:PA": "131", "york:PA": "133",
  // Texas
  "anderson:TX": "001", "andrews:TX": "003", "angelina:TX": "005", "aransas:TX": "007",
  "archer:TX": "009", "armstrong:TX": "011", "atascosa:TX": "013", "austin:TX": "015",
  "bailey:TX": "017", "bandera:TX": "019", "bastrop:TX": "021", "baylor:TX": "023",
  "bee:TX": "025", "bell:TX": "027", "bexar:TX": "029", "blanco:TX": "031",
  "borden:TX": "033", "bosque:TX": "035", "bowie:TX": "037", "brazoria:TX": "039",
  "brazos:TX": "041", "brewster:TX": "043", "briscoe:TX": "045", "brooks:TX": "047",
  "brown:TX": "049", "burleson:TX": "051", "burnet:TX": "053", "caldwell:TX": "055",
  "calhoun:TX": "057", "callahan:TX": "059", "cameron:TX": "061", "camp:TX": "063",
  "carson:TX": "065", "cass:TX": "067", "castro:TX": "069", "chambers:TX": "071",
  "cherokee:TX": "073", "childress:TX": "075", "clay:TX": "077", "cochran:TX": "079",
  "coke:TX": "081", "coleman:TX": "083", "collin:TX": "085", "collingsworth:TX": "087",
  "colorado:TX": "089", "comal:TX": "091", "comanche:TX": "093", "concho:TX": "095",
  "cooke:TX": "097", "corpus christi:TX": "355", "coryell:TX": "099", "cottle:TX": "101",
  "crane:TX": "103", "crockett:TX": "105", "crosby:TX": "107", "culberson:TX": "109",
  "dallam:TX": "111", "dallas:TX": "113", "dawson:TX": "115", "deaf smith:TX": "117",
  "delta:TX": "119", "denton:TX": "121", "dewitt:TX": "123", "dickens:TX": "125",
  "dimmit:TX": "127", "donley:TX": "129", "duval:TX": "131", "eastland:TX": "133",
  "ector:TX": "135", "edwards:TX": "137", "el paso:TX": "141", "ellis:TX": "139",
  "erath:TX": "143", "falls:TX": "145", "fannin:TX": "147", "fayette:TX": "149",
  "fisher:TX": "151", "floyd:TX": "153", "foard:TX": "155", "fort bend:TX": "157",
  "franklin:TX": "159", "freestone:TX": "161", "frio:TX": "163", "gaines:TX": "165",
  "galveston:TX": "167", "garza:TX": "169", "gillespie:TX": "171", "glasscock:TX": "173",
  "goliad:TX": "175", "gonzales:TX": "177", "gray:TX": "179", "grayson:TX": "181",
  "gregg:TX": "183", "grimes:TX": "185", "guadalupe:TX": "187", "hale:TX": "189",
  "hall:TX": "191", "hamilton:TX": "193", "hansford:TX": "195", "hardeman:TX": "197",
  "hardin:TX": "199", "harris:TX": "201", "harrison:TX": "203", "hartley:TX": "205",
  "haskell:TX": "207", "hays:TX": "209", "hemphill:TX": "211", "henderson:TX": "213",
  "hidalgo:TX": "215", "hill:TX": "217", "hockley:TX": "219", "hood:TX": "221",
  "hopkins:TX": "223", "houston:TX": "225", "howard:TX": "227", "hudspeth:TX": "229",
  "hunt:TX": "231", "hutchinson:TX": "233", "irion:TX": "235", "jack:TX": "237",
  "jackson:TX": "239", "jasper:TX": "241", "jeff davis:TX": "243", "jefferson:TX": "245",
  "jim hogg:TX": "247", "jim wells:TX": "249", "johnson:TX": "251", "jones:TX": "253",
  "karnes:TX": "255", "kaufman:TX": "257", "kendall:TX": "259", "kenedy:TX": "261",
  "kent:TX": "263", "kerr:TX": "265", "kimble:TX": "267", "king:TX": "269",
  "kinney:TX": "271", "kleberg:TX": "273", "knox:TX": "275", "la salle:TX": "283",
  "lamar:TX": "277", "lamb:TX": "279", "lampasas:TX": "281", "lavaca:TX": "285",
  "lee:TX": "287", "leon:TX": "289", "liberty:TX": "291", "limestone:TX": "293",
  "lipscomb:TX": "295", "live oak:TX": "297", "llano:TX": "299", "loving:TX": "301",
  "lubbock:TX": "303", "lynn:TX": "305", "madison:TX": "313", "marion:TX": "315",
  "martin:TX": "317", "mason:TX": "319", "matagorda:TX": "321", "maverick:TX": "323",
  "mcculloch:TX": "307", "mclennan:TX": "309", "mcmullen:TX": "311", "medina:TX": "325",
  "menard:TX": "327", "midland:TX": "329", "milam:TX": "331", "mills:TX": "333",
  "mitchell:TX": "335", "montague:TX": "337", "montgomery:TX": "339", "moore:TX": "341",
  "morris:TX": "343", "motley:TX": "345", "nacogdoches:TX": "347", "navarro:TX": "349",
  "newton:TX": "351", "nolan:TX": "353", "nueces:TX": "355", "ochiltree:TX": "357",
  "oldham:TX": "359", "orange:TX": "361", "palo pinto:TX": "363", "panola:TX": "365",
  "parker:TX": "367", "parmer:TX": "369", "pecos:TX": "371", "polk:TX": "373",
  "potter:TX": "375", "presidio:TX": "377", "rains:TX": "379", "randall:TX": "381",
  "reagan:TX": "383", "real:TX": "385", "red river:TX": "387", "reeves:TX": "389",
  "refugio:TX": "391", "roberts:TX": "393", "robertson:TX": "395", "rockwall:TX": "397",
  "runnels:TX": "399", "rusk:TX": "401", "sabine:TX": "403", "san augustine:TX": "405",
  "san jacinto:TX": "407", "san patricio:TX": "409", "san saba:TX": "411",
  "schleicher:TX": "413", "scurry:TX": "415", "shackelford:TX": "417", "shelby:TX": "419",
  "sherman:TX": "421", "smith:TX": "423", "somervell:TX": "425", "starr:TX": "427",
  "stephens:TX": "429", "sterling:TX": "431", "stonewall:TX": "433", "sutton:TX": "435",
  "swisher:TX": "437", "tarrant:TX": "439", "taylor:TX": "441", "terrell:TX": "443",
  "terry:TX": "445", "throckmorton:TX": "447", "titus:TX": "449", "tom green:TX": "451",
  "travis:TX": "453", "trinity:TX": "455", "tyler:TX": "457", "upshur:TX": "459",
  "upton:TX": "461", "uvalde:TX": "463", "val verde:TX": "465", "van zandt:TX": "467",
  "victoria:TX": "469", "walker:TX": "471", "waller:TX": "473", "ward:TX": "475",
  "washington:TX": "477", "webb:TX": "479", "wharton:TX": "481", "wheeler:TX": "483",
  "wichita:TX": "485", "wilbarger:TX": "487", "willacy:TX": "489", "williamson:TX": "491",
  "wilson:TX": "493", "winkler:TX": "495", "wise:TX": "497", "wood:TX": "499",
  "yoakum:TX": "501", "young:TX": "503", "zapata:TX": "505", "zavala:TX": "507",
  // New York
  "albany:NY": "001", "allegany:NY": "003", "bronx:NY": "005", "broome:NY": "007",
  "cattaraugus:NY": "009", "cayuga:NY": "011", "chautauqua:NY": "013", "chemung:NY": "015",
  "chenango:NY": "017", "clinton:NY": "019", "columbia:NY": "021", "cortland:NY": "023",
  "delaware:NY": "025", "dutchess:NY": "027", "erie:NY": "029", "essex:NY": "031",
  "franklin:NY": "033", "fulton:NY": "035", "genesee:NY": "037", "greene:NY": "039",
  "hamilton:NY": "041", "herkimer:NY": "043", "jefferson:NY": "045", "kings:NY": "047",
  "lewis:NY": "049", "livingston:NY": "051", "madison:NY": "053", "monroe:NY": "055",
  "montgomery:NY": "057", "nassau:NY": "059", "new york:NY": "061", "niagara:NY": "063",
  "oneida:NY": "065", "onondaga:NY": "067", "ontario:NY": "069", "orange:NY": "071",
  "orleans:NY": "073", "oswego:NY": "075", "otsego:NY": "077", "putnam:NY": "079",
  "queens:NY": "081", "rensselaer:NY": "083", "richmond:NY": "085", "rockland:NY": "087",
  "saratoga:NY": "091", "schenectady:NY": "093", "schoharie:NY": "095", "schuyler:NY": "097",
  "seneca:NY": "099", "st. lawrence:NY": "089", "steuben:NY": "101", "suffolk:NY": "103",
  "sullivan:NY": "105", "tioga:NY": "107", "tompkins:NY": "109", "ulster:NY": "111",
  "warren:NY": "113", "washington:NY": "115", "wayne:NY": "117", "westchester:NY": "119",
  "wyoming:NY": "121", "yates:NY": "123",
  // New Jersey
  "atlantic:NJ": "001", "bergen:NJ": "003", "burlington:NJ": "005", "camden:NJ": "007",
  "cape may:NJ": "009", "cumberland:NJ": "011", "essex:NJ": "013", "gloucester:NJ": "015",
  "hudson:NJ": "017", "hunterdon:NJ": "019", "mercer:NJ": "021", "middlesex:NJ": "023",
  "monmouth:NJ": "025", "morris:NJ": "027", "ocean:NJ": "029", "passaic:NJ": "031",
  "salem:NJ": "033", "somerset:NJ": "035", "sussex:NJ": "037", "union:NJ": "039",
  "warren:NJ": "041",
  // Washington
  "adams:WA": "001", "asotin:WA": "003", "benton:WA": "005", "chelan:WA": "007",
  "clallam:WA": "009", "clark:WA": "011", "columbia:WA": "013", "cowlitz:WA": "015",
  "douglas:WA": "017", "ferry:WA": "019", "franklin:WA": "021", "garfield:WA": "023",
  "grant:WA": "025", "grays harbor:WA": "027", "island:WA": "029", "jefferson:WA": "031",
  "king:WA": "033", "kitsap:WA": "035", "kittitas:WA": "037", "klickitat:WA": "039",
  "lewis:WA": "041", "lincoln:WA": "043", "mason:WA": "045", "okanogan:WA": "047",
  "pacific:WA": "049", "pend oreille:WA": "051", "pierce:WA": "053", "san juan:WA": "055",
  "skagit:WA": "057", "skamania:WA": "059", "snohomish:WA": "061", "spokane:WA": "063",
  "stevens:WA": "065", "thurston:WA": "067", "wahkiakum:WA": "069", "walla walla:WA": "071",
  "whatcom:WA": "073", "whitman:WA": "075", "yakima:WA": "077",
  // Maryland
  "allegany:MD": "001", "anne arundel:MD": "003", "baltimore:MD": "005",
  "baltimore city:MD": "510", "calvert:MD": "009", "caroline:MD": "011",
  "carroll:MD": "013", "cecil:MD": "015", "charles:MD": "017", "dorchester:MD": "019",
  "frederick:MD": "021", "garrett:MD": "023", "harford:MD": "025", "howard:MD": "027",
  "kent:MD": "029", "montgomery:MD": "031", "prince george's:MD": "033",
  "queen anne's:MD": "035", "somerset:MD": "039", "st. mary's:MD": "037",
  "talbot:MD": "041", "washington:MD": "043", "wicomico:MD": "045", "worcester:MD": "047",
  // Colorado
  "adams:CO": "001", "alamosa:CO": "003", "arapahoe:CO": "005", "archuleta:CO": "007",
  "baca:CO": "009", "bent:CO": "011", "boulder:CO": "013", "broomfield:CO": "014",
  "chaffee:CO": "015", "cheyenne:CO": "017", "clear creek:CO": "019", "conejos:CO": "021",
  "costilla:CO": "023", "crowley:CO": "025", "custer:CO": "027", "delta:CO": "029",
  "denver:CO": "031", "dolores:CO": "033", "douglas:CO": "035", "eagle:CO": "037",
  "elbert:CO": "039", "el paso:CO": "041", "fremont:CO": "043", "garfield:CO": "045",
  "gilpin:CO": "047", "grand:CO": "049", "gunnison:CO": "051", "hinsdale:CO": "053",
  "huerfano:CO": "055", "jackson:CO": "057", "jefferson:CO": "059", "kiowa:CO": "061",
  "kit carson:CO": "063", "la plata:CO": "067", "lake:CO": "065", "larimer:CO": "069",
  "las animas:CO": "071", "lincoln:CO": "073", "logan:CO": "075", "mesa:CO": "077",
  "mineral:CO": "079", "moffat:CO": "081", "montezuma:CO": "083", "montrose:CO": "085",
  "morgan:CO": "087", "otero:CO": "089", "ouray:CO": "091", "park:CO": "093",
  "phillips:CO": "095", "pitkin:CO": "097", "prowers:CO": "099", "pueblo:CO": "101",
  "rio blanco:CO": "103", "rio grande:CO": "105", "routt:CO": "107", "saguache:CO": "109",
  "san juan:CO": "111", "san miguel:CO": "113", "sedgwick:CO": "115", "summit:CO": "117",
  "teller:CO": "119", "washington:CO": "121", "weld:CO": "123", "yuma:CO": "125",
  // Utah
  "beaver:UT": "001", "box elder:UT": "003", "cache:UT": "005", "carbon:UT": "007",
  "daggett:UT": "009", "davis:UT": "011", "duchesne:UT": "013", "emery:UT": "015",
  "garfield:UT": "017", "grand:UT": "019", "iron:UT": "021", "juab:UT": "023",
  "kane:UT": "025", "millard:UT": "027", "morgan:UT": "029", "piute:UT": "031",
  "rich:UT": "033", "salt lake:UT": "035", "san juan:UT": "037", "sanpete:UT": "039",
  "sevier:UT": "041", "summit:UT": "043", "tooele:UT": "045", "uintah:UT": "047",
  "utah:UT": "049", "wasatch:UT": "051", "washington:UT": "053", "wayne:UT": "055",
  "weber:UT": "057",
  // North Carolina
  "alamance:NC": "001", "alexander:NC": "003", "alleghany:NC": "005", "anson:NC": "007",
  "ashe:NC": "009", "avery:NC": "011", "beaufort:NC": "013", "bertie:NC": "015",
  "bladen:NC": "017", "brunswick:NC": "019", "buncombe:NC": "021", "burke:NC": "023",
  "cabarrus:NC": "025", "caldwell:NC": "027", "camden:NC": "029", "carteret:NC": "031",
  "caswell:NC": "033", "catawba:NC": "035", "chatham:NC": "037", "cherokee:NC": "039",
  "chowan:NC": "041", "clay:NC": "043", "cleveland:NC": "045", "columbus:NC": "047",
  "craven:NC": "049", "cumberland:NC": "051", "currituck:NC": "053", "dare:NC": "055",
  "davidson:NC": "057", "davie:NC": "059", "duplin:NC": "061", "durham:NC": "063",
  "edgecombe:NC": "065", "forsyth:NC": "067", "franklin:NC": "069", "gaston:NC": "071",
  "gates:NC": "073", "graham:NC": "075", "granville:NC": "077", "greene:NC": "079",
  "guilford:NC": "081", "halifax:NC": "083", "harnett:NC": "085", "haywood:NC": "087",
  "henderson:NC": "089", "hertford:NC": "091", "hoke:NC": "093", "hyde:NC": "095",
  "iredell:NC": "097", "jackson:NC": "099", "johnston:NC": "101", "jones:NC": "103",
  "lee:NC": "105", "lenoir:NC": "107", "lincoln:NC": "109", "macon:NC": "113",
  "madison:NC": "115", "martin:NC": "117", "mcdowell:NC": "111", "mecklenburg:NC": "119",
  "mitchell:NC": "121", "montgomery:NC": "123", "moore:NC": "125", "nash:NC": "127",
  "new hanover:NC": "129", "northampton:NC": "131", "onslow:NC": "133", "orange:NC": "135",
  "pamlico:NC": "137", "pasquotank:NC": "139", "pender:NC": "141", "perquimans:NC": "143",
  "person:NC": "145", "pitt:NC": "147", "polk:NC": "149", "randolph:NC": "151",
  "richmond:NC": "153", "robeson:NC": "155", "rockingham:NC": "157", "rowan:NC": "159",
  "rutherford:NC": "161", "sampson:NC": "163", "scotland:NC": "165", "stanly:NC": "167",
  "stokes:NC": "169", "surry:NC": "171", "swain:NC": "173", "transylvania:NC": "175",
  "tyrrell:NC": "177", "union:NC": "179", "vance:NC": "181", "wake:NC": "183",
  "warren:NC": "185", "washington:NC": "187", "watauga:NC": "189", "wayne:NC": "191",
  "wilkes:NC": "193", "wilson:NC": "195", "yadkin:NC": "197", "yancey:NC": "199",
  // Illinois
  "adams:IL": "001", "alexander:IL": "003", "bond:IL": "005", "boone:IL": "007",
  "brown:IL": "009", "bureau:IL": "011", "calhoun:IL": "013", "carroll:IL": "015",
  "cass:IL": "017", "champaign:IL": "019", "christian:IL": "021", "clark:IL": "023",
  "clay:IL": "025", "clinton:IL": "027", "coles:IL": "029", "cook:IL": "031",
  "crawford:IL": "033", "cumberland:IL": "035", "dekalb:IL": "037", "dewitt:IL": "039",
  "douglas:IL": "041", "dupage:IL": "043", "edgar:IL": "045", "edwards:IL": "047",
  "effingham:IL": "049", "fayette:IL": "051", "ford:IL": "053", "franklin:IL": "055",
  "fulton:IL": "057", "gallatin:IL": "059", "greene:IL": "061", "grundy:IL": "063",
  "hamilton:IL": "065", "hancock:IL": "067", "hardin:IL": "069", "henderson:IL": "071",
  "henry:IL": "073", "iroquois:IL": "075", "jackson:IL": "077", "jasper:IL": "079",
  "jefferson:IL": "081", "jersey:IL": "083", "jo daviess:IL": "085", "johnson:IL": "087",
  "kane:IL": "089", "kankakee:IL": "091", "kendall:IL": "093", "knox:IL": "095",
  "la salle:IL": "099", "lake:IL": "097", "lawrence:IL": "101", "lee:IL": "103",
  "livingston:IL": "105", "logan:IL": "107", "macon:IL": "115", "macoupin:IL": "117",
  "madison:IL": "119", "marion:IL": "121", "marshall:IL": "123", "mason:IL": "125",
  "massac:IL": "127", "mcdonough:IL": "109", "mchenry:IL": "111", "mclean:IL": "113",
  "menard:IL": "129", "mercer:IL": "131", "monroe:IL": "133", "montgomery:IL": "135",
  "morgan:IL": "137", "moultrie:IL": "139", "ogle:IL": "141", "peoria:IL": "143",
  "perry:IL": "145", "piatt:IL": "147", "pike:IL": "149", "pope:IL": "151",
  "pulaski:IL": "153", "putnam:IL": "155", "randolph:IL": "157", "richland:IL": "159",
  "rock island:IL": "161", "saline:IL": "165", "sangamon:IL": "167", "schuyler:IL": "169",
  "scott:IL": "171", "shelby:IL": "173", "st. clair:IL": "163", "stark:IL": "175",
  "stephenson:IL": "177", "tazewell:IL": "179", "union:IL": "181", "vermilion:IL": "183",
  "wabash:IL": "185", "warren:IL": "187", "washington:IL": "189", "wayne:IL": "191",
  "white:IL": "193", "whiteside:IL": "195", "will:IL": "197", "williamson:IL": "199",
  "winnebago:IL": "201", "woodford:IL": "203",
  // Ohio
  "adams:OH": "001", "allen:OH": "003", "ashland:OH": "005", "ashtabula:OH": "007",
  "athens:OH": "009", "auglaize:OH": "011", "belmont:OH": "013", "brown:OH": "015",
  "butler:OH": "017", "carroll:OH": "019", "champaign:OH": "021", "clark:OH": "023",
  "clermont:OH": "025", "clinton:OH": "027", "columbiana:OH": "029", "coshocton:OH": "031",
  "crawford:OH": "033", "cuyahoga:OH": "035", "darke:OH": "037", "defiance:OH": "039",
  "delaware:OH": "041", "erie:OH": "043", "fairfield:OH": "045", "fayette:OH": "047",
  "franklin:OH": "049", "fulton:OH": "051", "gallia:OH": "053", "geauga:OH": "055",
  "greene:OH": "057", "guernsey:OH": "059", "hamilton:OH": "061", "hancock:OH": "063",
  "hardin:OH": "065", "harrison:OH": "067", "henry:OH": "069", "highland:OH": "071",
  "hocking:OH": "073", "holmes:OH": "075", "huron:OH": "077", "jackson:OH": "079",
  "jefferson:OH": "081", "knox:OH": "083", "lake:OH": "085", "lawrence:OH": "087",
  "licking:OH": "089", "logan:OH": "091", "lorain:OH": "093", "lucas:OH": "095",
  "madison:OH": "097", "mahoning:OH": "099", "marion:OH": "101", "medina:OH": "103",
  "meigs:OH": "105", "mercer:OH": "107", "miami:OH": "109", "monroe:OH": "111",
  "montgomery:OH": "113", "morgan:OH": "115", "morrow:OH": "117", "muskingum:OH": "119",
  "noble:OH": "121", "ottawa:OH": "123", "paulding:OH": "125", "perry:OH": "127",
  "pickaway:OH": "129", "pike:OH": "131", "portage:OH": "133", "preble:OH": "135",
  "putnam:OH": "137", "richland:OH": "139", "ross:OH": "141", "sandusky:OH": "143",
  "scioto:OH": "145", "seneca:OH": "147", "shelby:OH": "149", "stark:OH": "151",
  "summit:OH": "153", "trumbull:OH": "155", "tuscarawas:OH": "157", "union:OH": "159",
  "van wert:OH": "161", "vinton:OH": "163", "warren:OH": "165", "washington:OH": "167",
  "wayne:OH": "169", "williams:OH": "171", "wood:OH": "173", "wyandot:OH": "175",
  // Virginia
  "accomack:VA": "001", "albemarle:VA": "003", "alleghany:VA": "005", "amelia:VA": "007",
  "amherst:VA": "009", "appomattox:VA": "011", "arlington:VA": "013", "augusta:VA": "015",
  "bath:VA": "017", "bedford:VA": "019", "bland:VA": "021", "botetourt:VA": "023",
  "brunswick:VA": "025", "buchanan:VA": "027", "buckingham:VA": "029", "campbell:VA": "031",
  "caroline:VA": "033", "carroll:VA": "035", "charles city:VA": "036", "charlotte:VA": "037",
  "chesterfield:VA": "041", "clarke:VA": "043", "craig:VA": "045", "culpeper:VA": "047",
  "cumberland:VA": "049", "dickenson:VA": "051", "dinwiddie:VA": "053", "essex:VA": "057",
  "fairfax:VA": "059", "fauquier:VA": "061", "floyd:VA": "063", "fluvanna:VA": "065",
  "franklin:VA": "067", "frederick:VA": "069", "giles:VA": "071", "gloucester:VA": "073",
  "goochland:VA": "075", "grayson:VA": "077", "greene:VA": "079", "greensville:VA": "081",
  "halifax:VA": "083", "hanover:VA": "085", "henrico:VA": "087", "henry:VA": "089",
  "highland:VA": "091", "isle of wight:VA": "093", "james city:VA": "095",
  "king and queen:VA": "097", "king george:VA": "099", "king william:VA": "101",
  "lancaster:VA": "103", "lee:VA": "105", "loudoun:VA": "107", "louisa:VA": "109",
  "lunenburg:VA": "111", "madison:VA": "113", "mathews:VA": "115", "mecklenburg:VA": "117",
  "middlesex:VA": "119", "montgomery:VA": "121", "nelson:VA": "125", "new kent:VA": "127",
  "northampton:VA": "131", "northumberland:VA": "133", "nottoway:VA": "135",
  "orange:VA": "137", "page:VA": "139", "patrick:VA": "141", "pittsylvania:VA": "143",
  "powhatan:VA": "145", "prince edward:VA": "147", "prince george:VA": "149",
  "prince william:VA": "153", "pulaski:VA": "155", "rappahannock:VA": "157",
  "richmond:VA": "159", "roanoke:VA": "161", "rockbridge:VA": "163", "rockingham:VA": "165",
  "russell:VA": "167", "scott:VA": "169", "shenandoah:VA": "171", "smyth:VA": "173",
  "southampton:VA": "175", "spotsylvania:VA": "177", "stafford:VA": "179",
  "surry:VA": "181", "sussex:VA": "183", "tazewell:VA": "185", "warren:VA": "187",
  "washington:VA": "191", "westmoreland:VA": "193", "wise:VA": "195", "wythe:VA": "197",
  "york:VA": "199",
  // South Carolina
  "abbeville:SC": "001", "aiken:SC": "003", "allendale:SC": "005", "anderson:SC": "007",
  "bamberg:SC": "009", "barnwell:SC": "011", "beaufort:SC": "013", "berkeley:SC": "015",
  "calhoun:SC": "017", "charleston:SC": "019", "cherokee:SC": "021", "chester:SC": "023",
  "chesterfield:SC": "025", "clarendon:SC": "027", "colleton:SC": "029", "darlington:SC": "031",
  "dillon:SC": "033", "dorchester:SC": "035", "edgefield:SC": "037", "fairfield:SC": "039",
  "florence:SC": "041", "georgetown:SC": "043", "greenville:SC": "045", "greenwood:SC": "047",
  "hampton:SC": "049", "horry:SC": "051", "jasper:SC": "053", "kershaw:SC": "055",
  "lancaster:SC": "057", "laurens:SC": "059", "lee:SC": "061", "lexington:SC": "063",
  "mccormick:SC": "065", "marion:SC": "067", "marlboro:SC": "069", "newberry:SC": "071",
  "oconee:SC": "073", "orangeburg:SC": "075", "pickens:SC": "077", "richland:SC": "079",
  "saluda:SC": "081", "spartanburg:SC": "083", "sumter:SC": "085", "union:SC": "087",
  "williamsburg:SC": "089", "york:SC": "091",
  // Delaware
  "kent:DE": "001", "new castle:DE": "003", "sussex:DE": "005",
  // Massachusetts
  "barnstable:MA": "001", "berkshire:MA": "003", "bristol:MA": "005", "dukes:MA": "007",
  "essex:MA": "009", "franklin:MA": "011", "hampden:MA": "013", "hampshire:MA": "015",
  "middlesex:MA": "017", "nantucket:MA": "019", "norfolk:MA": "021", "plymouth:MA": "023",
  "suffolk:MA": "025", "worcester:MA": "027",
  // Tennessee
  "anderson:TN": "001", "bedford:TN": "003", "benton:TN": "005", "bledsoe:TN": "007",
  "blount:TN": "009", "bradley:TN": "011", "campbell:TN": "013", "cannon:TN": "015",
  "carroll:TN": "017", "carter:TN": "019", "cheatham:TN": "021", "chester:TN": "023",
  "claiborne:TN": "025", "clay:TN": "027", "cocke:TN": "029", "coffee:TN": "031",
  "crockett:TN": "033", "cumberland:TN": "035", "davidson:TN": "037", "decatur:TN": "039",
  "dekalb:TN": "041", "dickson:TN": "043", "dyer:TN": "045", "fayette:TN": "047",
  "fentress:TN": "049", "franklin:TN": "051", "gibson:TN": "053", "giles:TN": "055",
  "grainger:TN": "057", "greene:TN": "059", "grundy:TN": "061", "hamblen:TN": "063",
  "hamilton:TN": "065", "hancock:TN": "067", "hardeman:TN": "069", "hardin:TN": "071",
  "hawkins:TN": "073", "haywood:TN": "075", "henderson:TN": "077", "henry:TN": "079",
  "hickman:TN": "081", "houston:TN": "083", "humphreys:TN": "085", "jackson:TN": "087",
  "jefferson:TN": "089", "johnson:TN": "091", "knox:TN": "093", "lake:TN": "095",
  "lauderdale:TN": "097", "lawrence:TN": "099", "lewis:TN": "101", "lincoln:TN": "103",
  "loudon:TN": "105", "macon:TN": "111", "madison:TN": "113", "marion:TN": "115",
  "marshall:TN": "117", "maury:TN": "119", "mcminn:TN": "107", "mcnairy:TN": "109",
  "meigs:TN": "121", "monroe:TN": "123", "montgomery:TN": "125", "moore:TN": "127",
  "morgan:TN": "129", "obion:TN": "131", "overton:TN": "133", "perry:TN": "135",
  "pickett:TN": "137", "polk:TN": "139", "putnam:TN": "141", "rhea:TN": "143",
  "roane:TN": "145", "robertson:TN": "147", "rutherford:TN": "149", "scott:TN": "151",
  "sequatchie:TN": "153", "sevier:TN": "155", "shelby:TN": "157", "smith:TN": "159",
  "stewart:TN": "161", "sullivan:TN": "163", "sumner:TN": "165", "tipton:TN": "167",
  "trousdale:TN": "169", "unicoi:TN": "171", "union:TN": "173", "van buren:TN": "175",
  "warren:TN": "177", "washington:TN": "179", "wayne:TN": "181", "weakley:TN": "183",
  "white:TN": "185", "williamson:TN": "187", "wilson:TN": "189",
  // Arizona
  "apache:AZ": "001", "cochise:AZ": "003", "coconino:AZ": "005", "gila:AZ": "007",
  "graham:AZ": "009", "greenlee:AZ": "011", "la paz:AZ": "012", "maricopa:AZ": "013",
  "mohave:AZ": "015", "navajo:AZ": "017", "pima:AZ": "019", "pinal:AZ": "021",
  "santa cruz:AZ": "023", "yavapai:AZ": "025", "yuma:AZ": "027",
  // Oregon
  "baker:OR": "001", "benton:OR": "003", "clackamas:OR": "005", "clatsop:OR": "007",
  "columbia:OR": "009", "coos:OR": "011", "crook:OR": "013", "curry:OR": "015",
  "deschutes:OR": "017", "douglas:OR": "019", "gilliam:OR": "021", "grant:OR": "023",
  "harney:OR": "025", "hood river:OR": "027", "jackson:OR": "029", "jefferson:OR": "031",
  "josephine:OR": "033", "klamath:OR": "035", "lake:OR": "037", "lane:OR": "039",
  "lincoln:OR": "041", "linn:OR": "043", "malheur:OR": "045", "marion:OR": "047",
  "morrow:OR": "049", "multnomah:OR": "051", "polk:OR": "053", "sherman:OR": "055",
  "tillamook:OR": "057", "umatilla:OR": "059", "union:OR": "061", "wallowa:OR": "063",
  "wasco:OR": "065", "washington:OR": "067", "wheeler:OR": "069", "yamhill:OR": "071",
  // Michigan
  "alcona:MI": "001", "alger:MI": "003", "allegan:MI": "005", "alpena:MI": "007",
  "antrim:MI": "009", "arenac:MI": "011", "baraga:MI": "013", "barry:MI": "015",
  "bay:MI": "017", "benzie:MI": "019", "berrien:MI": "021", "branch:MI": "023",
  "calhoun:MI": "025", "cass:MI": "027", "charlevoix:MI": "029", "cheboygan:MI": "031",
  "chippewa:MI": "033", "clare:MI": "035", "clinton:MI": "037", "crawford:MI": "039",
  "delta:MI": "041", "dickinson:MI": "043", "eaton:MI": "045", "emmet:MI": "047",
  "genesee:MI": "049", "gladwin:MI": "051", "gogebic:MI": "053", "grand traverse:MI": "055",
  "gratiot:MI": "057", "hillsdale:MI": "059", "houghton:MI": "061", "huron:MI": "063",
  "ingham:MI": "065", "ionia:MI": "067", "iosco:MI": "069", "iron:MI": "071",
  "isabella:MI": "073", "jackson:MI": "075", "kalamazoo:MI": "077", "kalkaska:MI": "079",
  "kent:MI": "081", "keweenaw:MI": "083", "lake:MI": "085", "lapeer:MI": "087",
  "leelanau:MI": "089", "lenawee:MI": "091", "livingston:MI": "093", "luce:MI": "095",
  "mackinac:MI": "097", "macomb:MI": "099", "manistee:MI": "101", "marquette:MI": "103",
  "mason:MI": "105", "mecosta:MI": "107", "menominee:MI": "109", "midland:MI": "111",
  "missaukee:MI": "113", "monroe:MI": "115", "montcalm:MI": "117", "montmorency:MI": "119",
  "muskegon:MI": "121", "newaygo:MI": "123", "oakland:MI": "125", "oceana:MI": "127",
  "ogemaw:MI": "129", "ontonagon:MI": "131", "osceola:MI": "133", "oscoda:MI": "135",
  "otsego:MI": "137", "ottawa:MI": "139", "presque isle:MI": "141", "roscommon:MI": "143",
  "saginaw:MI": "145", "sanilac:MI": "151", "schoolcraft:MI": "153", "shiawassee:MI": "155",
  "st. clair:MI": "147", "st. joseph:MI": "149", "tuscola:MI": "157", "van buren:MI": "159",
  "washtenaw:MI": "161", "wayne:MI": "163", "wexford:MI": "165",
  // Indiana
  "adams:IN": "001", "allen:IN": "003", "bartholomew:IN": "005", "benton:IN": "007",
  "blackford:IN": "009", "boone:IN": "011", "brown:IN": "013", "carroll:IN": "015",
  "cass:IN": "017", "clark:IN": "019", "clay:IN": "021", "clinton:IN": "023",
  "crawford:IN": "025", "daviess:IN": "027", "dearborn:IN": "029", "decatur:IN": "031",
  "dekalb:IN": "033", "delaware:IN": "035", "dubois:IN": "037", "elkhart:IN": "039",
  "fayette:IN": "041", "floyd:IN": "043", "fountain:IN": "045", "franklin:IN": "047",
  "fulton:IN": "049", "gibson:IN": "051", "grant:IN": "053", "greene:IN": "055",
  "hamilton:IN": "057", "hancock:IN": "059", "harrison:IN": "061", "hendricks:IN": "063",
  "henry:IN": "065", "howard:IN": "067", "huntington:IN": "069", "jackson:IN": "071",
  "jasper:IN": "073", "jay:IN": "075", "jefferson:IN": "077", "jennings:IN": "079",
  "johnson:IN": "081", "knox:IN": "083", "kosciusko:IN": "085", "lagrange:IN": "087",
  "lake:IN": "089", "laporte:IN": "091", "lawrence:IN": "093", "madison:IN": "095",
  "marion:IN": "097", "marshall:IN": "099", "martin:IN": "101", "miami:IN": "103",
  "monroe:IN": "105", "montgomery:IN": "107", "morgan:IN": "109", "newton:IN": "111",
  "noble:IN": "113", "ohio:IN": "115", "orange:IN": "117", "owen:IN": "119",
  "parke:IN": "121", "perry:IN": "123", "pike:IN": "125", "porter:IN": "127",
  "posey:IN": "129", "pulaski:IN": "131", "putnam:IN": "133", "randolph:IN": "135",
  "ripley:IN": "137", "rush:IN": "139", "scott:IN": "143", "shelby:IN": "145",
  "spencer:IN": "147", "st. joseph:IN": "141", "starke:IN": "149", "steuben:IN": "151",
  "sullivan:IN": "153", "switzerland:IN": "155", "tippecanoe:IN": "157", "tipton:IN": "159",
  "union:IN": "161", "vanderburgh:IN": "163", "vermillion:IN": "165", "vigo:IN": "167",
  "wabash:IN": "169", "warren:IN": "171", "warrick:IN": "173", "washington:IN": "175",
  "wayne:IN": "177", "wells:IN": "179", "white:IN": "181", "whitley:IN": "183",
  // Minnesota
  "aitkin:MN": "001", "anoka:MN": "003", "becker:MN": "005", "beltrami:MN": "007",
  "benton:MN": "009", "big stone:MN": "011", "blue earth:MN": "013", "brown:MN": "015",
  "carlton:MN": "017", "carver:MN": "019", "cass:MN": "021", "chippewa:MN": "023",
  "chisago:MN": "025", "clay:MN": "027", "clearwater:MN": "029", "cook:MN": "031",
  "cottonwood:MN": "033", "crow wing:MN": "035", "dakota:MN": "037", "dodge:MN": "039",
  "douglas:MN": "041", "faribault:MN": "043", "fillmore:MN": "045", "freeborn:MN": "047",
  "goodhue:MN": "049", "grant:MN": "051", "hennepin:MN": "053", "houston:MN": "055",
  "hubbard:MN": "057", "isanti:MN": "059", "itasca:MN": "061", "jackson:MN": "063",
  "kanabec:MN": "065", "kandiyohi:MN": "067", "kittson:MN": "069", "koochiching:MN": "071",
  "lac qui parle:MN": "073", "lake:MN": "075", "lake of the woods:MN": "077",
  "le sueur:MN": "079", "lincoln:MN": "081", "lyon:MN": "083", "mahnomen:MN": "087",
  "marshall:MN": "089", "martin:MN": "091", "mcleod:MN": "085", "meeker:MN": "093",
  "mille lacs:MN": "095", "morrison:MN": "097", "mower:MN": "099", "murray:MN": "101",
  "nicollet:MN": "103", "nobles:MN": "105", "norman:MN": "107", "olmsted:MN": "109",
  "otter tail:MN": "111", "pennington:MN": "113", "pine:MN": "115", "pipestone:MN": "117",
  "polk:MN": "119", "pope:MN": "121", "ramsey:MN": "123", "red lake:MN": "125",
  "redwood:MN": "127", "renville:MN": "129", "rice:MN": "131", "rock:MN": "133",
  "roseau:MN": "135", "scott:MN": "139", "sherburne:MN": "141", "sibley:MN": "143",
  "st. louis:MN": "137", "stearns:MN": "145", "steele:MN": "147", "stevens:MN": "149",
  "swift:MN": "151", "todd:MN": "153", "traverse:MN": "155", "wabasha:MN": "157",
  "wadena:MN": "159", "waseca:MN": "161", "washington:MN": "163", "watonwan:MN": "165",
  "wilkin:MN": "167", "winona:MN": "169", "wright:MN": "171", "yellow medicine:MN": "173",
};

// ---------------------------------------------------------------------------
// State center coordinates for map zoom
// ---------------------------------------------------------------------------
const STATE_CENTERS = {
  "01": [-86.9, 32.3], "02": [-153.5, 64.8], "04": [-111.6, 34.4], "05": [-92.4, 34.9],
  "06": [-119.4, 37.2], "08": [-105.3, 39.1], "09": [-72.8, 41.6], "10": [-75.5, 38.9],
  "11": [-77.0, 38.9], "12": [-81.5, 27.5], "13": [-83.6, 32.6], "15": [-155.6, 19.7],
  "16": [-114.2, 43.6], "17": [-89.6, 40.0], "18": [-86.1, 40.3], "19": [-93.6, 42.0],
  "20": [-98.4, 38.5], "21": [-84.3, 37.7], "22": [-91.9, 31.0], "23": [-69.4, 45.4],
  "24": [-76.6, 38.9], "25": [-71.4, 42.4], "26": [-84.5, 43.6], "27": [-94.7, 46.4],
  "28": [-89.6, 32.7], "29": [-91.4, 37.9], "30": [-110.4, 46.9], "31": [-99.9, 41.1],
  "32": [-116.4, 38.3], "33": [-71.5, 43.2], "34": [-74.5, 40.2], "35": [-105.9, 34.5],
  "36": [-75.5, 43.0], "37": [-79.0, 35.5], "38": [-99.5, 47.5], "39": [-82.9, 40.4],
  "40": [-97.5, 35.5], "41": [-120.6, 43.8], "42": [-77.2, 41.2], "44": [-71.5, 41.6],
  "45": [-81.2, 34.0], "46": [-99.4, 44.4], "47": [-86.6, 35.8], "48": [-99.5, 31.5],
  "49": [-111.6, 39.3], "50": [-72.6, 44.1], "51": [-78.7, 37.4], "53": [-120.7, 47.4],
  "54": [-80.5, 38.6], "55": [-89.6, 44.6], "56": [-107.3, 43.0],
};

function lookupCountyFips(countyName, stateAbbr) {
  if (!countyName) return null;
  const key = countyName.toLowerCase().trim() + ":" + stateAbbr;
  return COUNTY_FIPS[key] || null;
}

function countyCenter(stateFips, countyFips3) {
  const [baseLon, baseLat] = STATE_CENTERS[stateFips] || [-98, 38];
  const hash = (countyFips3 || "000").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const offsetLon = ((hash % 17) - 8) * 0.2;
  const offsetLat = ((Math.floor(hash / 17) % 13) - 6) * 0.15;
  return { lon: baseLon + offsetLon, lat: baseLat + offsetLat };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const loans = JSON.parse(fs.readFileSync(path.resolve("client/src/data/real/realLoans.json"), "utf8"));

// Group by state → county
const byStateCounty = {};
for (const loan of loans) {
  const stateAbbr = (loan.state || "").trim().toUpperCase();
  const countyName = (loan.county || "Unknown").trim();
  const city = (loan.city || "").trim();
  const stateInfo = STATE_INFO[stateAbbr];
  if (!stateInfo) continue;

  const stateKey = stateAbbr;
  if (!byStateCounty[stateKey]) byStateCounty[stateKey] = { stateInfo, countyMap: {}, primaryCity: city };
  const cMap = byStateCounty[stateKey].countyMap;
  if (!cMap[countyName]) cMap[countyName] = { count: 0, upb: 0, cities: {} };
  cMap[countyName].count++;
  cMap[countyName].upb += loan.upb;
  cMap[countyName].cities[city] = (cMap[countyName].cities[city] || 0) + 1;
}

// Build flat array of LoanGeoRecord
const records = [];
let idCounter = 1;
for (const [stateAbbr, stateData] of Object.entries(byStateCounty)) {
  const { stateInfo, countyMap } = stateData;
  const { fips: stateFips, name: stateName } = stateInfo;

  for (const [countyName, countyData] of Object.entries(countyMap)) {
    const countyFips3 = lookupCountyFips(countyName, stateAbbr) || "999";
    const countyFips5 = stateFips + countyFips3;

    // Primary city = most common city in county
    const primaryCity = Object.entries(countyData.cities)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    // One tract per county — county-level aggregation
    const tractFips = countyFips5 + "000100"; // synthetic tract suffix
    const { lon, lat } = countyCenter(stateFips, countyFips3);

    records.push({
      id: String(idCounter++),
      stateFips,
      stateName,
      countyFips: countyFips5,
      countyName,
      city: primaryCity,
      tractFips,
      tractName: `${countyName} County`,
      loanCount: countyData.count,
      upb: Math.round(countyData.upb),
    });
  }
}

const outPath = path.resolve("client/src/data/real/realGeoData.json");
fs.writeFileSync(outPath, JSON.stringify(records, null, 2));

console.log(`✓ Written ${records.length} county records to ${outPath}`);
const totalLoans = records.reduce((s, r) => s + r.loanCount, 0);
const totalUpb = records.reduce((s, r) => s + r.upb, 0);
console.log(`  Total loans: ${totalLoans} | Total UPB: $${(totalUpb / 1e9).toFixed(3)}B`);
const states = new Set(records.map(r => r.stateFips)).size;
console.log(`  States: ${states} | Counties: ${records.length}`);

import { useState, useCallback, useMemo } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup, Sphere } from "react-simple-maps";
import { ChevronLeft, ZoomIn, ZoomOut, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LoanGeoRecord } from "@/data/mock/step1";
import { step1TractCentroids } from "@/data/mock/step1";
import { STATE_CENTERS } from "@/data/mock/step1GeoData";
import { getRiskForState, RISK_COLORS, WILDFIRE_COLORS } from "@/data/mock/femaRisk";

const STATES_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const COUNTIES_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

type Geo = { rsmKey: string; id: string; properties: { name: string } };

type DrillLevel = "us-county" | "state" | "tract";

type GeoDrilldownMapProps = {
  loans: LoanGeoRecord[];
  onSelectionChange?: (level: "state" | "county" | "tract", name: string, loans: LoanGeoRecord[]) => void;
  className?: string;
  riskLayer?: "flood" | "wildfire";
};

/** State FIPS → state name for labels */
const STATE_NAMES: Record<string, string> = {
  "01": "ALABAMA", "02": "ALASKA", "04": "ARIZONA", "05": "ARKANSAS", "06": "CALIFORNIA",
  "08": "COLORADO", "09": "CONNECTICUT", "10": "DELAWARE", "11": "DISTRICT OF COLUMBIA",
  "12": "FLORIDA", "13": "GEORGIA", "15": "HAWAII", "16": "IDAHO", "17": "ILLINOIS",
  "18": "INDIANA", "19": "IOWA", "20": "KANSAS", "21": "KENTUCKY", "22": "LOUISIANA",
  "23": "MAINE", "24": "MARYLAND", "25": "MASSACHUSETTS", "26": "MICHIGAN", "27": "MINNESOTA",
  "28": "MISSISSIPPI", "29": "MISSOURI", "30": "MONTANA", "31": "NEBRASKA", "32": "NEVADA",
  "33": "NEW HAMPSHIRE", "34": "NEW JERSEY", "35": "NEW MEXICO", "36": "NEW YORK",
  "37": "NORTH CAROLINA", "38": "NORTH DAKOTA", "39": "OHIO", "40": "OKLAHOMA",
  "41": "OREGON", "42": "PENNSYLVANIA", "44": "RHODE ISLAND", "45": "SOUTH CAROLINA",
  "46": "SOUTH DAKOTA", "47": "TENNESSEE", "48": "TEXAS", "49": "UTAH", "50": "VERMONT",
  "51": "VIRGINIA", "53": "WASHINGTON", "54": "WEST VIRGINIA", "55": "WISCONSIN", "56": "WYOMING",
};

const DEFAULT_CENTER: [number, number] = [-98, 38];
const DEFAULT_ZOOM = 1;

export function GeoDrilldownMap({ loans, onSelectionChange, className, riskLayer }: GeoDrilldownMapProps) {
  const [level, setLevel] = useState<DrillLevel>("us-county");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [hoveredCounty, setHoveredCounty] = useState<{ fips: string; name: string; count: number; upb: number; stateName?: string } | null>(null);

  const allCountyData = useMemo(() => {
    const byCounty = new Map<string, { count: number; upb: number; stateFips: string; countyName: string; stateName: string }>();
    for (const l of loans) {
      const cur = byCounty.get(l.countyFips) ?? { count: 0, upb: 0, stateFips: l.stateFips, countyName: l.countyName, stateName: l.stateName };
      cur.count += l.loanCount;
      cur.upb += l.upb;
      byCounty.set(l.countyFips, cur);
    }
    return byCounty;
  }, [loans]);

  const countyData = useMemo(() => {
    if (!selectedState) return new Map<string, { count: number; upb: number }>();
    const byCounty = new Map<string, { count: number; upb: number }>();
    for (const l of loans) {
      if (l.stateFips !== selectedState) continue;
      const cur = byCounty.get(l.countyFips) ?? { count: 0, upb: 0 };
      cur.count += l.loanCount;
      cur.upb += l.upb;
      byCounty.set(l.countyFips, cur);
    }
    return byCounty;
  }, [loans, selectedState]);

  const tractData = useMemo(() => {
    if (!selectedState || !selectedCounty) return [];
    return loans.filter((l) => l.stateFips === selectedState && l.countyFips === selectedCounty);
  }, [loans, selectedState, selectedCounty]);

  const stateNameByFips = useMemo(() => {
    const names = new Map<string, string>();
    for (const l of loans) names.set(l.stateFips, l.stateName);
    return names;
  }, [loans]);

  const countyNameByFips = useMemo(() => {
    const names = new Map<string, string>();
    for (const l of loans) names.set(l.countyFips, l.countyName);
    return names;
  }, [loans]);

  const maxAllCounty = Math.max(1, ...Array.from(allCountyData.values()).map((v) => v.count));
  const maxCounty = Math.max(1, ...Array.from(countyData.values()).map((v) => v.count));

  const handleBack = useCallback(() => {
    if (level === "state") {
      setLevel("us-county");
      setSelectedState(null);
      setSelectedCounty(null);
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(DEFAULT_ZOOM);
      onSelectionChange?.("state", "", loans);
    } else if (level === "tract") {
      setLevel("state");
      setSelectedCounty(null);
      const countyLoans = loans.filter((l) => l.stateFips === selectedState && l.countyFips === selectedCounty);
      onSelectionChange?.("county", countyNameByFips.get(selectedCounty!) ?? "", countyLoans);
    }
  }, [level, selectedState, selectedCounty, loans, countyNameByFips, onSelectionChange]);

  const handleMapMoveEnd = useCallback(({ coordinates, zoom }: { coordinates: [number, number]; zoom: number }) => {
    setMapCenter(coordinates);
    setMapZoom(zoom);
  }, []);

  const zoomIn = useCallback(() => setMapZoom((z) => Math.min(8, z * 1.5)), []);
  const zoomOut = useCallback(() => setMapZoom((z) => Math.max(1, z / 1.5)), []);
  const goHome = useCallback(() => {
    setMapCenter(DEFAULT_CENTER);
    setMapZoom(DEFAULT_ZOOM);
  }, []);

  return (
    <div className={cn("flex flex-col h-full w-full p-0 m-0", className)}>
      {(level === "state" || level === "tract") && (
        <div className="absolute top-2 left-2 z-30 flex items-center gap-2 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-slate-200">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to {level === "state" ? "US" : "Counties"}
          </button>
          <span className="text-xs text-slate-500 font-medium">
            {level === "state" && selectedState != null && stateNameByFips.get(selectedState)}
            {level === "tract" && selectedState != null && selectedCounty != null &&
              `${stateNameByFips.get(selectedState) ?? ""} → ${countyNameByFips.get(selectedCounty) ?? ""}`}
          </span>
        </div>
      )}

      <div className="relative flex-1 overflow-hidden bg-transparent transition-all duration-300 border-0 shadow-none p-0 m-0 outline-none rounded-none flex flex-col">
        {/* Map controls — top center, horizontal, minimalist (drag to pan) */}
        {(level === "us-county" || level === "state") && (
          <div className="absolute top-2 right-3 z-20 flex items-center rounded-lg bg-white/40 shadow-sm backdrop-blur-md">
            <button
              type="button"
              onClick={goHome}
              className="flex h-8 w-8 items-center justify-center rounded-l-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Reset view"
            >
              <Home className="h-4 w-4" strokeWidth={2} />
            </button>
            <span className="h-5 w-px bg-slate-200/60" aria-hidden />
            <button
              type="button"
              onClick={zoomOut}
              className="flex h-8 w-8 items-center justify-center text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={zoomIn}
              className="flex h-8 w-8 items-center justify-center rounded-r-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Tooltip for county hover */}
        {hoveredCounty && level === "us-county" && (() => {
          const stateAbbr = FIPS_TO_ABBR[hoveredCounty.fips.slice(0, 2)] ?? "";
          const risk = stateAbbr ? getRiskForState(stateAbbr) : null;
          return (
            <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-white/90 px-3 py-2 shadow-md backdrop-blur-md animate-fade-in-up max-w-[220px] border border-white/50">
              <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{hoveredCounty.name}</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{hoveredCounty.count.toLocaleString()} loans</div>
              <div className="text-xs text-slate-600">UPB: ${(hoveredCounty.upb / 1_000_000).toFixed(1)}M</div>
              {risk && riskLayer && (
                <div className="mt-1.5 border-t border-slate-200/70 pt-1.5 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-slate-500">Flood:</span>
                    <span className={cn("font-semibold", RISK_COLORS[risk.floodZone].text)}>{risk.floodZone}</span>
                    <span className="text-slate-400">({risk.floodDisasters} FEMA events)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="text-slate-500">Wildfire:</span>
                    <span className={cn("font-semibold", RISK_COLORS[risk.wildfireRisk].text)}>{risk.wildfireRisk}</span>
                    <span className="text-slate-400">({risk.wildfireDisasters} events)</span>
                  </div>
                  {risk.hurricaneRisk !== "Low" && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="text-slate-500">Hurricane:</span>
                      <span className={cn("font-semibold", RISK_COLORS[risk.hurricaneRisk].text)}>{risk.hurricaneRisk}</span>
                    </div>
                  )}
                </div>
              )}
              {hoveredCounty.count > 0 && <div className="mt-1 text-[10px] text-sky-600 font-medium">Click to drill down</div>}
            </div>
          );
        })()}

        {/* Legend — bottom left when on us-county */}
        {level === "us-county" && !hoveredCounty && !riskLayer && (
          <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-white/80 backdrop-blur-sm px-3 py-2 shadow-sm border border-white/50">
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">Loan Concentration</div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">Low</span>
              {["#bfdbfe","#60a5fa","#3b82f6","#1d4ed8","#1e3a8a"].map((c) => (
                <div key={c} className="h-2.5 w-5 rounded-sm" style={{ background: c }} />
              ))}
              <span className="text-[10px] text-slate-400">High</span>
            </div>
            <div className="mt-1 text-[9px] text-slate-400">Gray = no loans in this county</div>
          </div>
        )}
        {level === "us-county" && !hoveredCounty && riskLayer && (
          <div className="absolute bottom-3 left-3 z-10 rounded-lg bg-white/80 backdrop-blur-sm px-3 py-2 shadow-sm border border-white/50">
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
              {riskLayer === "flood" ? "Flood Risk" : "Wildfire Risk"}
            </div>
            {(["High", "Moderate", "Low"] as const).map((lvl) => {
              const colors = riskLayer === "flood" ? RISK_COLORS : WILDFIRE_COLORS;
              return (
                <div key={lvl} className="flex items-center gap-1.5 mb-0.5">
                  <div className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: colors[lvl].fill }} />
                  <span className="text-[10px] text-slate-600">{lvl}</span>
                </div>
              );
            })}
          </div>
        )}

        {level === "us-county" && (
          <div className="h-full w-full transition-opacity duration-300">
            <USCountyMap
              allCountyData={allCountyData}
              maxVal={maxAllCounty}
              riskLayer={riskLayer}
              center={mapCenter}
              zoom={mapZoom}
              onMoveEnd={handleMapMoveEnd}
              onCountyClick={(fips) => {
                const d = allCountyData.get(fips);
                if (!d) return;
                setSelectedState(d.stateFips);
                setLevel("state");
                const stateLoans = loans.filter((l) => l.stateFips === d.stateFips);
                onSelectionChange?.("state", d.stateName, stateLoans);
              }}
              onCountyHover={setHoveredCounty}
            />
          </div>
        )}

        {level === "state" && selectedState && (
          <div className="h-full w-full animate-fade-in-up">
            <CountyMap
              stateFips={selectedState}
              countyData={countyData}
              maxVal={maxCounty}
              onCountyClick={(fips) => {
                setSelectedCounty(fips);
                setLevel("tract");
                const countyLoans = loans.filter((l) => l.countyFips === fips);
                onSelectionChange?.("county", countyNameByFips.get(fips) ?? "", countyLoans);
              }}
            />
          </div>
        )}

        {level === "tract" && selectedState && selectedCounty && (
          <div className="h-full w-full animate-fade-in-up">
            <TractView
              tractData={tractData}
              stateName={stateNameByFips.get(selectedState) ?? ""}
              countyName={countyNameByFips.get(selectedCounty) ?? ""}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** FIPS state code → 2-letter abbreviation */
const FIPS_TO_ABBR: Record<string, string> = {
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

function riskFillForFips(stateFips: string, layer: "flood" | "wildfire"): string {
  const abbr = FIPS_TO_ABBR[stateFips] ?? "";
  const risk = getRiskForState(abbr);
  const level = layer === "flood" ? risk.floodZone : risk.wildfireRisk;
  return layer === "flood" ? RISK_COLORS[level].fill : WILDFIRE_COLORS[level].fill;
}

function USCountyMap({
  allCountyData,
  maxVal,
  riskLayer,
  center,
  zoom,
  onMoveEnd,
  onCountyClick,
  onCountyHover,
}: {
  allCountyData: Map<string, { count: number; upb: number; stateFips: string; countyName: string; stateName: string }>;
  maxVal: number;
  riskLayer?: "flood" | "wildfire";
  center: [number, number];
  zoom: number;
  onMoveEnd: (args: { coordinates: [number, number]; zoom: number }) => void;
  onCountyClick: (fips: string) => void;
  onCountyHover: (info: { fips: string; name: string; count: number; upb: number } | null) => void;
}) {
  return (
    <ComposableMap projection="geoAlbersUsa" className="h-full w-full" projectionConfig={{ scale: 1000 }} style={{ width: "100%", height: "100%", outline: "none", border: "none", background: "transparent", padding: 0, margin: 0, display: "block" }}>
      <ZoomableGroup center={center} zoom={zoom} onMoveEnd={onMoveEnd} minZoom={1} maxZoom={8} filter="none" style={{ outline: "none" }}>
        <Geographies geography={COUNTIES_URL} stroke="none" style={{ outline: "none", border: "none", padding: 0, margin: 0, display: "block" }}>
          {({ geographies }: { geographies: Geo[] }) =>
            geographies.map((geo) => {
              const fips = geo.id;
              const d = allCountyData.get(fips);
              const v = d?.count ?? 0;
              const stateFips = fips.slice(0, 2);
              const hasData = v > 0;
              const t = maxVal > 0 ? v / maxVal : 0;
              const dataFill = riskLayer
                ? riskFillForFips(stateFips, riskLayer)
                : choroplethColorFor(t);
              const fill = (!riskLayer && !hasData) ? "#d1dae6" : dataFill;
              const fillOpacity = (!riskLayer && !hasData) ? 0.45 : 1;

              // Pulsating heatmap animation — only for loan choropleth, not risk layers
              const fipsNum = parseInt(fips, 10) || 0;
              const pulseDuration = !riskLayer && hasData
                ? (t >= 0.6 ? 1.6 + (fipsNum % 7) * 0.22 : 2.4 + (fipsNum % 11) * 0.3) + "s"
                : "0s";
              const pulseDelay = !riskLayer && hasData
                ? (1.0 + (fipsNum % 23) * 0.19).toFixed(2) + "s"
                : "0s";
              const pulseAnim = !riskLayer && hasData
                ? (t >= 0.6 ? "county-heat-pulse-hi" : "county-heat-pulse")
                : "none";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  fillOpacity={fillOpacity}
                  stroke={hasData ? "rgba(255,255,255,0.55)" : "rgba(180,194,213,0.4)"}
                  strokeWidth={hasData ? 0.6 : 0.3}
                  style={{
                    default: {
                      outline: "none",
                      border: "none",
                      boxShadow: "none",
                      cursor: hasData ? "pointer" : "default",
                      animation: `${pulseAnim} ${pulseDuration} ease-in-out ${pulseDelay} infinite`,
                      transition: "fill 0.3s ease",
                    },
                    hover: {
                      outline: "none",
                      border: "none",
                      boxShadow: "none",
                      fill: hasData ? "#facc15" : "#cdd6e2",
                      fillOpacity: hasData ? 1 : 0.55,
                      opacity: 1,
                      cursor: hasData ? "pointer" : "default",
                      animation: "none",
                      filter: hasData ? "drop-shadow(0 0 6px rgba(234,179,8,0.7))" : "none",
                    },
                    pressed: { outline: "none", border: "none", boxShadow: "none", animation: "none" },
                  }}
                  onClick={() => hasData && onCountyClick(fips)}
                  onMouseEnter={() =>
                    d && onCountyHover({ fips, name: `${d.countyName}, ${d.stateName}`, count: d.count, upb: d.upb })
                  }
                  onMouseLeave={() => onCountyHover(null)}
                />
              );
            })
          }
        </Geographies>
        {/* State labels */}
        {Object.entries(STATE_CENTERS).map(([fips, coords]) => (
          <Marker key={fips} coordinates={coords}>
            <text
              textAnchor="middle"
              fontSize={10}
              fontFamily="system-ui, sans-serif"
              fill="rgba(71,85,105,0.5)"
              fontWeight={600}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {STATE_NAMES[fips] ?? ""}
            </text>
          </Marker>
        ))}
      </ZoomableGroup>
    </ComposableMap>
  );
}

function CountyMap({
  stateFips,
  countyData,
  maxVal,
  onCountyClick,
}: {
  stateFips: string;
  countyData: Map<string, { count: number; upb: number }>;
  maxVal: number;
  onCountyClick: (fips: string) => void;
}) {
  return (
    <ComposableMap projection="geoAlbersUsa" className="h-full w-full" projectionConfig={{ scale: 1000 }} style={{ width: "100%", height: "100%", outline: "none", border: "none", background: "transparent", padding: 0, margin: 0, display: "block" }}>
      <ZoomableGroup center={stateCenter(stateFips)} zoom={3} filter="none" style={{ outline: "none" }}>
        <Geographies geography={COUNTIES_URL} stroke="none" style={{ outline: "none", border: "none", padding: 0, margin: 0, display: "block" }}>
          {({ geographies }: { geographies: Geo[] }) =>
            geographies
              .filter((g) => g.id.startsWith(stateFips))
              .map((geo) => {
                const fips = geo.id;
                const v = countyData.get(fips)?.count ?? 0;
                const hasData = v > 0;
                const fill = hasData ? choroplethColorFor(v / maxVal) : undefined;
                const animDelay = `${(parseInt(fips, 10) % 13) * 0.7}s`;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="none"
                    strokeWidth={0}
                    style={{
                      default: {
                        outline: "none",
                        border: "none",
                        boxShadow: "none",
                        cursor: hasData ? "pointer" : "default",
                        ...(hasData
                          ? { transition: "fill 0.2s ease" }
                          : { animation: `pastel-cycle 10s ease-in-out ${animDelay} infinite`, fill: "white" }),
                      },
                      hover: { outline: "none", border: "none", boxShadow: "none", fill: hasData ? "#facc15" : "#e9d5ff", cursor: hasData ? "pointer" : "default" },
                      pressed: { outline: "none", border: "none", boxShadow: "none" },
                    }}
                    onClick={() => hasData && onCountyClick(fips)}
                  />
                );
              })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
}

function TractView({
  tractData,
  stateName,
  countyName,
}: {
  tractData: LoanGeoRecord[];
  stateName: string;
  countyName: string;
}) {
  const centroidMap = new Map(step1TractCentroids.map((c) => [c.tractFips, c]));
  const tractWithCoords = tractData
    .map((t) => {
      const c = centroidMap.get(t.tractFips);
      return c ? { ...t, lon: c.lon, lat: c.lat } : null;
    })
    .filter(Boolean) as (LoanGeoRecord & { lon: number; lat: number })[];

  return (
    <div className="grid h-full grid-cols-1 gap-3 p-3 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-slate-200/70 bg-white">
        <div className="border-b border-slate-200/70 px-3 py-2 text-xs font-semibold text-slate-700">
          Census Tracts — {countyName}, {stateName}
        </div>
        <div className="max-h-[280px] overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Tract</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">City</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">Loans</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600">UPB</th>
              </tr>
            </thead>
            <tbody>
              {tractData.map((t) => (
                <tr key={t.tractFips} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-800">{t.tractName}</td>
                  <td className="px-3 py-2 text-slate-700">{t.city ?? countyName}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-700">{t.loanCount}</td>
                  <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                    {Intl.NumberFormat("en-US").format(t.upb)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200/70 bg-white">
        <div className="border-b border-slate-200/70 px-3 py-2 text-xs font-semibold text-slate-700">
          Tract Locations (centroids)
        </div>
        <div className="relative h-[280px] w-full">
          <ComposableMap projection="geoAlbersUsa" className="h-full w-full">
            <ZoomableGroup center={[tractWithCoords[0]?.lon ?? -98, tractWithCoords[0]?.lat ?? 38]} zoom={6}>
              <Geographies geography={STATES_URL}>
                {({ geographies }: { geographies: Geo[] }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="white"
                      stroke="none"
                      strokeWidth={0}
                      style={{ default: { outline: "none", border: "none", boxShadow: "none" }, hover: { outline: "none", border: "none", boxShadow: "none" }, pressed: { outline: "none", border: "none", boxShadow: "none" } }}
                    />
                  ))
                }
              </Geographies>
              {tractWithCoords.map((t) => (
                <Marker key={t.tractFips} coordinates={[t.lon, t.lat]}>
                  <circle
                    r={Math.max(4, Math.min(14, t.loanCount / 2))}
                    fill="#7dd3fc"
                    fillOpacity={0.75}
                    stroke="#fff"
                    strokeWidth={1}
                    style={{ cursor: "pointer" }}
                  >
                    <title>{`${t.tractName}: ${t.loanCount} loans`}</title>
                  </circle>
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>
    </div>
  );
}

function stateCenter(fips: string): [number, number] {
  return STATE_CENTERS[fips] ?? [-98, 38];
}

/** Choropleth colors: blue intensity gradient — low → high, data counties only */
function choroplethColorFor(t: number) {
  if (t <= 0) return "transparent";
  if (t < 0.15) return "#bfdbfe"; // blue-200 — very low
  if (t < 0.35) return "#60a5fa"; // blue-400 — low-mid
  if (t < 0.55) return "#3b82f6"; // blue-500 — mid
  if (t < 0.75) return "#1d4ed8"; // blue-700 — mid-high
  return "#1e3a8a";               // blue-900 — high
}


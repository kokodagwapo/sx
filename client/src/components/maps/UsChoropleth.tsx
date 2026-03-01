import { ComposableMap, Geographies, Geography } from "react-simple-maps";

type Datum = { stateName: string; value: number };
type Geo = {
  rsmKey: string;
  properties: { name: string };
};

export function UsChoropleth({
  data,
}: {
  data: Datum[];
}) {
  const byName = new Map(data.map((d) => [d.stateName, d.value]));
  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);

  return (
    <div className="h-full w-full">
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }: { geographies: Geo[] }) =>
            geographies.map((geo) => {
              const name = String(geo.properties.name);
              const v = byName.get(name) ?? 0;
              const fill = colorFor(v / max);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="rgba(15,23,42,0.18)"
                  strokeWidth={0.6}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#0ea5e9" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

function colorFor(t: number) {
  // t in [0,1]
  if (t <= 0) return "#f1f5f9";
  if (t < 0.2) return "#dbeafe";
  if (t < 0.4) return "#bfdbfe";
  if (t < 0.6) return "#93c5fd";
  if (t < 0.8) return "#60a5fa";
  return "#2563eb";
}


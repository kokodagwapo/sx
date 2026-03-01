/** Official SprinkleX by Teraverde logo — exact brand version */

const TEAL = "#007B8A";
const GREEN_CENTER = "#4E9A4B";
const GREEN_MID = "#6DAA47";
const GREEN_LIGHT = "#90D348";

function LogoIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      {/* X graphic — 9 circles in X pattern */}
      <circle cx="16" cy="16" r="2.5" fill={GREEN_CENTER} />
      <circle cx="10" cy="10" r="2" fill={GREEN_MID} />
      <circle cx="22" cy="10" r="2" fill={GREEN_MID} />
      <circle cx="10" cy="22" r="2" fill={GREEN_MID} />
      <circle cx="22" cy="22" r="2" fill={GREEN_MID} />
      <circle cx="6" cy="6" r="1.6" fill={GREEN_LIGHT} />
      <circle cx="26" cy="6" r="1.6" fill={GREEN_LIGHT} />
      <circle cx="6" cy="26" r="1.6" fill={GREEN_LIGHT} />
      <circle cx="26" cy="26" r="1.6" fill={GREEN_LIGHT} />
      {/* TM */}
      <text x="24" y="8" fontSize="4" fill={TEAL} fontFamily="sans-serif" fontWeight="600">
        TM
      </text>
    </svg>
  );
}

export function SprinkleXLogo({
  className,
  showText = true,
  size = "md",
}: {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const iconSizes = { sm: 26, md: 30, lg: 36 };
  const textSizes = { sm: "text-[15px]", md: "text-[18px]", lg: "text-[20px]" };
  const bySizes = { sm: "text-[10px]", md: "text-[11px]", lg: "text-[12px]" };
  const iconSize = iconSizes[size];

  return (
    <div
      className={`flex items-center gap-2 ${className ?? ""}`}
      aria-label="SprinkleX by Teraverde"
    >
      {!showText ? (
        <LogoIcon size={iconSize} />
      ) : (
        <div className="flex flex-col items-start gap-0">
          <div className="flex items-baseline gap-0.5">
            <span
              className={`font-bold tracking-[-0.02em] ${textSizes[size]}`}
              style={{ color: TEAL, fontFamily: "var(--font-display, system-ui, sans-serif)" }}
            >
              Sprinkle
            </span>
            <LogoIcon size={iconSize} />
          </div>
          <span
            className={`font-medium ${bySizes[size]}`}
            style={{ color: TEAL, fontFamily: "var(--font-display, system-ui, sans-serif)" }}
          >
            by Teraverde (r)
          </span>
        </div>
      )}
    </div>
  );
}

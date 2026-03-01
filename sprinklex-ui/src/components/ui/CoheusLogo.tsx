/** Coheus logo — matches original: PMS 286 blue, PMS 368 green, transparent background */
export function CoheusLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Coheus"
    >
      {/* COHEUS text — PMS 286 #4285F4 */}
      <text
        x="0"
        y="24"
        fontFamily="Arial, sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="#4285F4"
        letterSpacing="0.05em"
      >
        COHEUS
      </text>
      <text x="118" y="20" fontFamily="Arial, sans-serif" fontSize="10" fill="#4285F4">
        ®
      </text>
      {/* Upper wave — PMS 286 blue, thicker */}
      <path
        d="M 2 30 Q 35 26 70 30 Q 105 34 138 30"
        stroke="#4285F4"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Lower wave — PMS 368 green #34A853, thinner */}
      <path
        d="M 4 34 Q 35 30.5 70 34 Q 105 37.5 136 34"
        stroke="#34A853"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

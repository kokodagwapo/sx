interface SVGProps {
  className?: string;
}

export function OFWNurse({ className = "w-24 h-24" }: SVGProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="100" cy="70" r="25" fill="#FDB462" stroke="#E8A252" strokeWidth="2"/>
      {/* Nurse Cap */}
      <path d="M80 55 L120 55 L115 45 L85 45 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
      <circle cx="100" cy="50" r="3" fill="#dc2626"/>
      {/* Body */}
      <rect x="85" y="90" width="30" height="40" rx="5" fill="#10b981" stroke="#059669" strokeWidth="2"/>
      {/* Arms */}
      <circle cx="70" cy="105" r="8" fill="#FDB462"/>
      <circle cx="130" cy="105" r="8" fill="#FDB462"/>
      {/* Legs */}
      <rect x="92" y="125" width="6" height="25" fill="#1f2937"/>
      <rect x="102" y="125" width="6" height="25" fill="#1f2937"/>
      {/* Medical Cross */}
      <path d="M95 100 L105 100 M100 95 L100 105" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

export function OFWConstructionWorker({ className = "w-24 h-24" }: SVGProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hard Hat */}
      <ellipse cx="100" cy="55" rx="30" ry="15" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
      {/* Head */}
      <circle cx="100" cy="70" r="20" fill="#FDB462" stroke="#E8A252" strokeWidth="2"/>
      {/* Body */}
      <rect x="85" y="85" width="30" height="40" rx="5" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
      {/* High-vis vest */}
      <rect x="80" y="90" width="40" height="30" rx="3" fill="#eab308" stroke="#ca8a04" strokeWidth="2"/>
      {/* Arms */}
      <circle cx="70" cy="105" r="8" fill="#FDB462"/>
      <circle cx="130" cy="105" r="8" fill="#FDB462"/>
      {/* Legs */}
      <rect x="92" y="120" width="6" height="25" fill="#1f2937"/>
      <rect x="102" y="120" width="6" height="25" fill="#1f2937"/>
      {/* Reflective stripes */}
      <rect x="80" y="95" width="40" height="2" fill="#fbbf24"/>
      <rect x="80" y="105" width="40" height="2" fill="#fbbf24"/>
    </svg>
  );
}

export function OFWChef({ className = "w-24 h-24" }: SVGProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chef Hat */}
      <ellipse cx="100" cy="40" rx="25" ry="15" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
      <rect x="85" y="50" width="30" height="15" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
      {/* Head */}
      <circle cx="100" cy="75" r="20" fill="#FDB462" stroke="#E8A252" strokeWidth="2"/>
      {/* Body */}
      <rect x="80" y="90" width="40" height="40" rx="5" fill="#ffffff" stroke="#e5e7eb" strokeWidth="2"/>
      {/* Double-breasted buttons */}
      <circle cx="92" cy="105" r="2" fill="#6b7280"/>
      <circle cx="92" cy="115" r="2" fill="#6b7280"/>
      <circle cx="108" cy="105" r="2" fill="#6b7280"/>
      <circle cx="108" cy="115" r="2" fill="#6b7280"/>
      {/* Arms */}
      <circle cx="65" cy="105" r="8" fill="#FDB462"/>
      <circle cx="135" cy="105" r="8" fill="#FDB462"/>
      {/* Legs */}
      <rect x="92" y="125" width="6" height="25" fill="#1f2937"/>
      <rect x="102" y="125" width="6" height="25" fill="#1f2937"/>
    </svg>
  );
}

export function PiggyBankIllustration({ className = "w-24 h-24" }: SVGProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Piggy Bank Body */}
      <ellipse cx="110" cy="120" rx="50" ry="35" fill="#fca5a5" stroke="#f87171" strokeWidth="3"/>
      {/* Piggy Bank Head */}
      <circle cx="70" cy="100" r="25" fill="#fca5a5" stroke="#f87171" strokeWidth="3"/>
      {/* Snout */}
      <ellipse cx="50" cy="105" rx="8" ry="6" fill="#f87171" stroke="#ef4444" strokeWidth="2"/>
      {/* Nostrils */}
      <circle cx="47" cy="103" r="1.5" fill="#dc2626"/>
      <circle cx="47" cy="107" r="1.5" fill="#dc2626"/>
      {/* Eye */}
      <circle cx="70" cy="95" r="4" fill="#ffffff"/>
      <circle cx="71" cy="94" r="2" fill="#1f2937"/>
      {/* Ear */}
      <path d="M75 85 Q85 80 80 90 Q75 95 75 85" fill="#f87171"/>
      {/* Legs */}
      <rect x="85" y="145" width="8" height="15" rx="4" fill="#f87171"/>
      <rect x="100" y="145" width="8" height="15" rx="4" fill="#f87171"/>
      <rect x="115" y="145" width="8" height="15" rx="4" fill="#f87171"/>
      <rect x="130" y="145" width="8" height="15" rx="4" fill="#f87171"/>
      {/* Coin Slot */}
      <rect x="105" y="90" width="20" height="3" rx="1.5" fill="#dc2626"/>
      {/* Tail */}
      <path d="M155 115 Q170 110 165 125 Q160 135 155 130" fill="#f87171" stroke="#ef4444" strokeWidth="2"/>
      {/* Coins floating above */}
      <circle cx="130" cy="70" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
      <text x="130" y="75" textAnchor="middle" className="text-xs font-bold" fill="#92400e">₱</text>
      <circle cx="150" cy="55" r="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
      <text x="150" y="58" textAnchor="middle" className="text-xs" fill="#92400e">₱</text>
    </svg>
  );
}

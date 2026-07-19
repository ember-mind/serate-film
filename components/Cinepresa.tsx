// La cinepresa in cabina di proiezione: bobine che girano e fascio di luce
// che sfarfalla sullo schermo del cinemascope. Decorativa, aria-hidden.
export function Cinepresa() {
  return (
    <div className="cinepresa" aria-hidden>
      <svg viewBox="0 0 300 170" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient
            id="fascio-luce"
            x1="174"
            y1="86"
            x2="15"
            y2="160"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#e9bc6a" stopOpacity="0.5" />
            <stop offset="1" stopColor="#e9bc6a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* fascio del proiettore */}
        <polygon className="fascio" points="174,79 174,93 30,170 0,148" fill="url(#fascio-luce)" />

        {/* gambe del treppiede */}
        <path d="M216 108 L206 134 M260 108 L270 134" stroke="#d4a24e" strokeWidth="2" strokeLinecap="round" />
        <path d="M202 134 L210 134 M266 134 L274 134" stroke="#d4a24e" strokeWidth="2" strokeLinecap="round" />

        {/* corpo macchina */}
        <rect x="200" y="64" width="76" height="44" rx="4" fill="#221f1a" stroke="#d4a24e" strokeWidth="2" />
        <circle cx="248" cy="86" r="6" stroke="#d4a24e" strokeWidth="1.5" fill="#171512" />

        {/* obiettivo */}
        <rect x="178" y="78" width="22" height="16" rx="2" fill="#221f1a" stroke="#d4a24e" strokeWidth="2" />
        <rect x="170" y="81" width="8" height="10" rx="1.5" fill="#d4a24e" />

        {/* manovella */}
        <path d="M282 90 L292 80" stroke="#d4a24e" strokeWidth="2" strokeLinecap="round" />
        <circle cx="292" cy="80" r="3" fill="#d4a24e" />

        {/* bobina grande */}
        <circle cx="222" cy="40" r="22" fill="#171512" stroke="#d4a24e" strokeWidth="2" />
        <g className="bobina-spokes" stroke="#d4a24e" strokeWidth="1.5">
          <line x1="222" y1="22" x2="222" y2="58" />
          <line x1="204" y1="40" x2="240" y2="40" />
          <line x1="209.3" y1="27.3" x2="234.7" y2="52.7" />
          <line x1="209.3" y1="52.7" x2="234.7" y2="27.3" />
        </g>
        <circle cx="222" cy="40" r="4" fill="#d4a24e" />

        {/* bobina piccola */}
        <circle cx="263" cy="47" r="15" fill="#171512" stroke="#d4a24e" strokeWidth="2" />
        <g className="bobina-spokes bobina-spokes--piccola" stroke="#d4a24e" strokeWidth="1.5">
          <line x1="263" y1="35" x2="263" y2="59" />
          <line x1="251" y1="47" x2="275" y2="47" />
          <line x1="254.5" y1="38.5" x2="271.5" y2="55.5" />
          <line x1="254.5" y1="55.5" x2="271.5" y2="38.5" />
        </g>
        <circle cx="263" cy="47" r="3" fill="#d4a24e" />
      </svg>
    </div>
  );
}

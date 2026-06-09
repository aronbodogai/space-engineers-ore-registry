export default function Logo({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Hexagonal ore crystal — pointy-top orientation */}
      <polygon
        points="16,2 27.86,9 27.86,23 16,30 4.14,23 4.14,9"
        fill="#071320"
        stroke="#75c9f1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Crystal facet lines — Y triskelion pattern */}
      <line x1="16" y1="16" x2="16" y2="2"       stroke="#75c9f1" strokeWidth="0.7" strokeOpacity="0.45" />
      <line x1="16" y1="16" x2="27.86" y2="23"   stroke="#75c9f1" strokeWidth="0.7" strokeOpacity="0.45" />
      <line x1="16" y1="16" x2="4.14" y2="23"    stroke="#75c9f1" strokeWidth="0.7" strokeOpacity="0.45" />
      {/* Centre ore node */}
      <circle cx="16" cy="16" r="2.8" fill="#75c9f1" />
    </svg>
  );
}

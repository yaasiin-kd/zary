export function ZaryMark({ className = 'zmark' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#2b3fa0" />
      <path d="M8.5 10H18M21 12.8L10 22H23.5" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22.6" cy="9.6" r="3.4" fill="#e8a531" stroke="#2b3fa0" strokeWidth="1.4" />
    </svg>
  );
}

export default function Logo() {
  return (
    <>
      <ZaryMark />
      <span className="zword">zary</span>
    </>
  );
}

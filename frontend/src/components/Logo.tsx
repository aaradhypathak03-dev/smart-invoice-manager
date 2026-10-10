export default function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#0d0d0d" />
      <path d="M12 9.5h11.5l4.5 4.5v16a1 1 0 0 1-1 1H12a1 1 0 0 1-1-1v-19.5a1 1 0 0 1 1-1Z" fill="#fff" />
      <path d="M23.5 9.5v4.5H28" fill="none" stroke="#0d0d0d" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M14.3 19h9.4M14.3 22.6h9.4M14.3 26.2h6" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28.5" cy="28.5" r="6.5" fill="#1e8e3e" stroke="#fff" strokeWidth="1.5" />
      <path
        d="M25.9 28.6l1.7 1.7 3.2-3.4"
        fill="none"
        stroke="#fff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

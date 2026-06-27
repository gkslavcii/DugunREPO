/** İnce yapraklı dal süslemesi (botanik ayraç için). */
export function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 28" className={className} aria-hidden fill="currentColor">
      <path
        d="M6 14 Q 40 10 74 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <ellipse cx="22" cy="10" rx="5.5" ry="2.2" transform="rotate(-26 22 10)" />
      <ellipse cx="22" cy="18" rx="5.5" ry="2.2" transform="rotate(26 22 18)" />
      <ellipse cx="40" cy="8" rx="6" ry="2.4" transform="rotate(-22 40 8)" />
      <ellipse cx="40" cy="20" rx="6" ry="2.4" transform="rotate(22 40 20)" />
      <ellipse cx="58" cy="10" rx="5" ry="2" transform="rotate(-28 58 10)" />
      <ellipse cx="58" cy="18" rx="5" ry="2" transform="rotate(28 58 18)" />
    </svg>
  );
}

/** Çiftin baş harflerinden zarif, mühür benzeri bir monogram. */
export function Monogram({ left, right }: { left: string; right: string }) {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center sm:h-[72px] sm:w-[72px]">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full text-dusk-deep/35"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="50" cy="50" r="46" strokeWidth="1.2" />
        <circle
          cx="50"
          cy="50"
          r="42"
          strokeWidth="0.5"
          strokeDasharray="2 4"
          opacity="0.6"
        />
      </svg>
      <span className="font-display text-xl tracking-wide text-ink sm:text-2xl">
        {left}
        <span className="mx-0.5 align-middle text-base italic text-dusk-deep sm:text-lg">
          &amp;
        </span>
        {right}
      </span>
    </div>
  );
}

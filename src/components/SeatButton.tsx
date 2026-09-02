import Link from "next/link";

/** Anasayfada sol altta, göze batmayan "yerini bul" butonu. */
export default function SeatButton() {
  return (
    <Link
      href="/oturma"
      aria-label="Yerini bul"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-ivory/25 bg-ink/60 px-3 py-2 text-ivory/90 shadow-lg backdrop-blur-sm transition hover:bg-ink/80 hover:text-ivory"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="h-4 w-4"
        aria-hidden
      >
        <ellipse cx="12" cy="12" rx="6" ry="4" />
        <circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="19.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="17.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
      <span className="text-xs font-medium">Yerini bul</span>
    </Link>
  );
}

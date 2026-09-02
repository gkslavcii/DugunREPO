import Link from "next/link";

/** Anasayfada sol altta, göze batmayan küçük "yerini bul" ikonu. */
export default function SeatButton() {
  return (
    <Link
      href="/oturma"
      aria-label="Yerini bul"
      title="Yerini bul"
      className="fixed bottom-4 left-4 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 bg-ink/40 text-ivory/75 shadow-sm backdrop-blur-sm transition hover:bg-ink/70 hover:text-ivory"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="h-[18px] w-[18px]"
        aria-hidden
      >
        <ellipse cx="12" cy="12" rx="6" ry="4" />
        <circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="19.5" cy="12" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    </Link>
  );
}

"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition hover:opacity-90"
    >
      Yazdır / PDF olarak kaydet
    </button>
  );
}

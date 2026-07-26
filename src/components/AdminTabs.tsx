import Link from "next/link";

/** Admin panel sekme navigasyonu (Gelenler / Ayarlar). */
export default function AdminTabs({
  active,
}: {
  active: "gelenler" | "ayarlar";
}) {
  const base = "rounded-full px-5 py-2 text-sm font-medium transition";
  const on = "bg-ink text-ivory";
  const off = "border border-ink/15 text-ink-soft hover:bg-ink/[0.04]";
  return (
    <div className="mb-8 flex gap-2">
      <Link
        href="/admin"
        className={`${base} ${active === "gelenler" ? on : off}`}
      >
        📥 Gelenler
      </Link>
      <Link
        href="/admin/ayarlar"
        className={`${base} ${active === "ayarlar" ? on : off}`}
      >
        ⚙️ Ayarlar
      </Link>
    </div>
  );
}

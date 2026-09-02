import Link from "next/link";

/** Admin panel sekme navigasyonu. */
export default function AdminTabs({
  active,
}: {
  active: "gelenler" | "ayarlar" | "oturma";
}) {
  const base = "rounded-full px-5 py-2 text-sm font-medium transition";
  const on = "bg-ink text-ivory";
  const off = "border border-ink/15 text-ink-soft hover:bg-ink/[0.04]";
  const tabs: { id: "gelenler" | "ayarlar" | "oturma"; href: string; label: string }[] = [
    { id: "gelenler", href: "/admin", label: "📥 Gelenler" },
    { id: "ayarlar", href: "/admin/ayarlar", label: "⚙️ Ayarlar" },
    { id: "oturma", href: "/admin/oturma", label: "🪑 Oturma" },
  ];
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={t.href}
          className={`${base} ${active === t.id ? on : off}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

/**
 * Site içeriği — tek yerden yönetilir.
 *
 * `mode` ile o an hangi etkinlikteysek ("kina" / "dugun") onu gösteririz.
 * İleride bu değer + metinler admin panelinden (Supabase) yönetilecek;
 * şimdilik buradan elle değiştirebilirsin.
 */

export type EventMode = "kina" | "dugun";

type EventContent = {
  eyebrow: string;
  welcome: string;
};

export const siteConfig = {
  coupleNames: { bride: "Sezin", groom: "Göksel" },

  /** O an hangi etkinlikteyiz? "kina" veya "dugun" */
  mode: "dugun" as EventMode,

  /** İkinizin arka planı silinmiş fotoğrafı (public/images/ içine koy) */
  coupleImage: "/images/couple.png",

  events: {
    kina: {
      eyebrow: "Kına Gecemize Hoş Geldiniz",
      welcome:
        "Bu güzel geceyi bizimle paylaştığınız için teşekkür ederiz. Kınamıza kattığınız her renk, kalbimizde özel bir yer tutacak.",
    },
    dugun: {
      eyebrow: "Düğünümüze Hoş Geldiniz",
      welcome:
        "En mutlu günümüzde yanımızda olduğunuz için minnettarız. Bırakacağınız her kare ve her satır, bu anıyı bizimle birlikte ölümsüzleştirecek.",
    },
  } satisfies Record<EventMode, EventContent>,
} as const;

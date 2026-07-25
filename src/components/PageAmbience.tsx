import FloatingLeaves from "./FloatingLeaves";

/**
 * İç sayfalar (Andaç, Fotoğraflar) için ortak zarafet katmanı.
 * Anasayfayla bütünlük: yumuşak ışıltılar + ince kağıt dokusu + süzülen yapraklar.
 * `fixed` olduğundan uzun (kaydırılan) sayfalarda da ekranı sarar.
 */
export default function PageAmbience() {
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-8%] h-[46vh] w-[46vh] -translate-x-1/2 rounded-full bg-dusk/15 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-6%] h-[40vh] w-[40vh] rounded-full bg-sage/15 blur-3xl" />
        <div className="absolute left-[-10%] top-[38%] h-[32vh] w-[32vh] rounded-full bg-[#d9c08a]/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_58%,rgb(51_65_75_/_0.05))]" />
        <div className="grain absolute inset-0 opacity-[0.04] mix-blend-soft-light" />
      </div>
      <FloatingLeaves />
    </>
  );
}

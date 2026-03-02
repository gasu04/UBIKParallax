/*
 * AboutPage — About UBIKParallax
 * Bauhaus: typographic, minimal, philosophical
 */

export default function AboutPage() {
  return (
    <div className="fade-in">
      <div className="px-8 lg:px-16 pt-8 lg:pt-12 pb-6">
        <h1 style={{ fontFamily: 'var(--font-display)' }}
            className="text-2xl lg:text-3xl font-bold text-[oklch(0.12_0_0)] mb-2">
          ABOUT
        </h1>
        <div className="bauhaus-rule-red w-16 mb-4" />
      </div>

      <div className="bauhaus-rule" />

      <div className="px-8 lg:px-16 py-12 max-w-2xl">
        <div className="note-prose">
          <h2>UBIKParallax</h2>

          <p>
            This is a digital garden — a personal archive of interlinked observations on mathematics, philosophy, and the patterns that connect them. Unlike a blog, which presents ideas chronologically, a digital garden organizes them by connection. Notes link to other notes. Ideas grow, branch, and evolve.
          </p>

          <p>
            The name draws from Philip K. Dick's <em>UBIK</em> — a novel about the instability of reality and the persistence of consciousness across temporal boundaries. <strong>Parallax</strong> refers to the shift in perspective that occurs when you observe the same object from different positions. Together, they describe the intent of this archive: to register observations from outside the system, where all temporal intervals are accessible, none ranked, none sequential.
          </p>

          <div className="bauhaus-rule my-8" />

          <h2>On the Design</h2>

          <p>
            The visual language is drawn from the Bauhaus movement (1919–1933) — specifically the Dessau period's emphasis on geometric rationalism. The palette is restricted to black, white, and vermillion red. Typography uses Space Grotesk for display and JetBrains Mono for body text, creating a catalog-like reading experience.
          </p>

          <p>
            The design philosophy is simple: form follows function. Every element earns its place. Decoration that doesn't communicate is removed. The contrast between the geometric digital structure and the organic handwritten journal pages is intentional — it mirrors the tension between systematic thought and lived experience.
          </p>

          <div className="bauhaus-rule my-8" />

          <h2>On the Content</h2>

          <p>
            The archive currently contains notes on Euler's Identity, philosophical reflections on imitation and social conformity, and scanned pages from a personal handwritten journal. These represent different modes of thought: the analytical, the philosophical, and the personal.
          </p>

          <p>
            This is a living archive. New observations will be added as they are registered. The graph of connections will grow. The system will evolve.
          </p>

          <div className="bauhaus-rule my-8" />

          <p className="text-[oklch(0.50_0_0)] text-xs">
            Built as a legacy archive — for family, for future reference, for the record.
          </p>
        </div>
      </div>
    </div>
  );
}

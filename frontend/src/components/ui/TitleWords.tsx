/**
 * A page title whose words rise into place one after another when the page opens (about 0.6 s),
 * the same motion as the landing page headings. The text stays one readable string for screen
 * readers, and reduced motion shows it at once (the global reduced motion rule shortens animations).
 */
export function TitleWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <span className="sv-word inline-block" style={{ animationDelay: `${i * 70}ms` }}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

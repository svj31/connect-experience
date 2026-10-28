/** The app background: a slow starfield and two faint orbit rings. Purely decorative. */
export function Sky() {
  return (
    <div className="sv-sky" aria-hidden="true">
      <div className="stars" />
      <div className="stars b" />
      <div className="ring" style={{ width: 900, height: 420, left: "-20%", top: "8%", transform: "rotate(-18deg)" }} />
      <div className="ring" style={{ width: 700, height: 300, right: "-15%", bottom: "4%", animationDirection: "reverse" }} />
    </div>
  );
}

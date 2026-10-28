/** Small looping illustrations for the three problems on the landing page. Decorative only. */
export function SwipeArt() {
  return (
    <div className="relative mx-auto h-40 w-32" aria-hidden="true">
      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border border-line bg-paper-deep" />
      <div className="swipe-2 absolute inset-0 rounded-2xl border border-line bg-surface p-3"><div className="h-20 rounded-xl bg-rose-soft" /><div className="mt-2 h-2 w-16 rounded bg-line" /></div>
      <div className="swipe-1 absolute inset-0 rounded-2xl border border-line-strong bg-surface p-3"><div className="h-20 rounded-xl bg-violet-soft" /><div className="mt-2 h-2 w-20 rounded bg-line" /><div className="mt-1.5 h-2 w-12 rounded bg-line" /></div>
    </div>
  );
}

export function DeadChatArt() {
  return (
    <div className="mx-auto flex h-40 w-48 flex-col justify-center gap-2" aria-hidden="true">
      <span className="msg-1 self-end rounded-2xl rounded-br-sm bg-violet px-3 py-1.5 text-sm font-semibold text-on-primary">hey</span>
      <span className="msg-2 self-start rounded-2xl rounded-bl-sm border border-line bg-surface px-3 py-1.5 text-sm text-muted">hey</span>
      <span className="self-center text-xs text-muted">Seen 3 days ago</span>
    </div>
  );
}

export function OvershareArt() {
  return (
    <div className="overshare mx-auto h-40 w-36 rounded-2xl border border-line bg-surface p-3" aria-hidden="true">
      {["w-24", "w-20", "w-28", "w-16", "w-24", "w-20", "w-14"].map((w, i) => (
        <div key={i} className="mt-1.5 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose" />
          <span className={`h-2 rounded bg-line ${w}`} />
        </div>
      ))}
    </div>
  );
}

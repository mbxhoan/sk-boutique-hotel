export default function NewsDetailLoading() {
  return (
    <>
      <style>{`
        @keyframes nd-skel { 0% { background-position: -480px 0; } 100% { background-position: 480px 0; } }
        .ndl-shell { padding-top: 48px; padding-bottom: clamp(80px, 10vw, 160px); }
        .ndl-bar { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60; }
        .ndl-bar::after { content: ""; display: block; height: 100%; width: 22%; background: linear-gradient(90deg, var(--gold), var(--gold-soft)); animation: ndl-slide 1.1s ease-in-out infinite; }
        @keyframes ndl-slide { 0% { margin-left: 0; } 50% { margin-left: 78%; } 100% { margin-left: 0; } }
        .ndl-skel { border-radius: var(--radius-sm); background: var(--surface-container-highest); background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%); background-size: 480px 100%; background-repeat: no-repeat; animation: nd-skel 1.4s ease-in-out infinite; }
        .ndl-head { max-width: 760px; margin: 24px auto 56px; display: flex; flex-direction: column; align-items: center; gap: 18px; }
        .ndl-line { height: 16px; width: 100%; }
        .ndl-cover { aspect-ratio: 21/9; width: 100%; max-width: 1180px; margin: 0 auto 64px; border-radius: var(--radius-sm); }
        .ndl-body { max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; gap: 18px; }
        @media (prefers-reduced-motion: reduce) { .ndl-skel, .ndl-bar::after { animation: none; } }
      `}</style>

      <div aria-hidden className="ndl-bar" />
      <div className="section-shell ndl-shell" aria-busy="true" aria-label="Loading article">
        <div className="ndl-head">
          <div className="ndl-skel ndl-line" style={{ width: 140, height: 12 }} />
          <div className="ndl-skel ndl-line" style={{ width: "82%", height: 40 }} />
          <div className="ndl-skel ndl-line" style={{ width: "64%", height: 40 }} />
          <div className="ndl-skel ndl-line" style={{ width: "70%", height: 14, marginTop: 8 }} />
          <div className="ndl-skel ndl-line" style={{ width: 220, height: 12, marginTop: 8 }} />
        </div>
        <div className="ndl-skel ndl-cover" />
        <div className="ndl-body">
          {[92, 100, 84, 96, 70, 100, 88, 60].map((w, i) => (
            <div key={i} className="ndl-skel ndl-line" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </>
  );
}

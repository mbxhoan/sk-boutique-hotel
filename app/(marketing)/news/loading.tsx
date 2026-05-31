export default function NewsListLoading() {
  return (
    <>
      <style>{`
        @keyframes nl-skel { 0% { background-position: -480px 0; } 100% { background-position: 480px 0; } }
        .nll-shell { padding-top: 56px; padding-bottom: clamp(80px, 10vw, 160px); }
        .nll-skel { border-radius: var(--radius-sm); background: var(--surface-container-highest); background-image: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%); background-size: 480px 100%; background-repeat: no-repeat; animation: nl-skel 1.4s ease-in-out infinite; }
        .nll-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; flex-wrap: wrap; margin-bottom: 56px; }
        .nll-head__l { flex: 1 1 320px; display: flex; flex-direction: column; gap: 16px; }
        .nll-head__r { flex: 1 1 300px; display: flex; flex-direction: column; gap: 14px; max-width: 380px; }
        .nll-featured { display: grid; grid-template-columns: 1.25fr 1fr; gap: 0; align-items: center; }
        .nll-featured__media { aspect-ratio: 4/5; }
        .nll-featured__panel { background: #fff; margin-left: -80px; padding: 48px; display: flex; flex-direction: column; gap: 18px; box-shadow: 0 4px 40px rgba(0,12,30,0.08); border-radius: var(--radius-sm); z-index: 2; }
        .nll-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-top: 96px; }
        .nll-card { display: flex; flex-direction: column; gap: 14px; }
        .nll-card__media { aspect-ratio: 4/3; }
        @media (max-width: 880px) {
          .nll-featured { grid-template-columns: 1fr; }
          .nll-featured__panel { margin: -32px 16px 0; padding: 28px; }
          .nll-grid { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) { .nll-skel { animation: none; } }
      `}</style>

      <section className="section-shell nll-shell" aria-busy="true" aria-label="Loading articles">
        {/* Hero */}
        <div className="nll-head">
          <div className="nll-head__l">
            <div className="nll-skel" style={{ width: 180, height: 12 }} />
            <div className="nll-skel" style={{ width: "min(520px, 80%)", height: 64 }} />
            <div className="nll-skel" style={{ width: "min(420px, 64%)", height: 64 }} />
          </div>
          <div className="nll-head__r">
            {[100, 92, 80].map((w, i) => (
              <div key={i} className="nll-skel" style={{ width: `${w}%`, height: 13 }} />
            ))}
            <div className="nll-skel" style={{ width: 220, height: 13, marginTop: 8 }} />
          </div>
        </div>

        {/* Featured */}
        <div className="nll-featured">
          <div className="nll-skel nll-featured__media" />
          <div className="nll-featured__panel">
            <div className="nll-skel" style={{ width: 120, height: 11 }} />
            <div className="nll-skel" style={{ width: "90%", height: 30 }} />
            <div className="nll-skel" style={{ width: "70%", height: 30 }} />
            <div className="nll-skel" style={{ width: "100%", height: 13, marginTop: 6 }} />
            <div className="nll-skel" style={{ width: "85%", height: 13 }} />
            <div className="nll-skel" style={{ width: 160, height: 12, marginTop: 8 }} />
          </div>
        </div>

        {/* Card grid */}
        <div className="nll-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="nll-card">
              <div className="nll-skel nll-card__media" />
              <div className="nll-skel" style={{ width: 90, height: 10 }} />
              <div className="nll-skel" style={{ width: "92%", height: 20 }} />
              <div className="nll-skel" style={{ width: "60%", height: 20 }} />
              <div className="nll-skel" style={{ width: 130, height: 11, marginTop: 4 }} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

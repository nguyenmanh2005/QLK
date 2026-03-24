import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@800;900&display=swap');

        .nf-bg::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridScroll 20s linear infinite;
          pointer-events: none;
          z-index: 0;
        }

        .nf-bg::after {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 2px,
            rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
          z-index: 100;
        }

        @keyframes gridScroll {
          0%   { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }

        .nf-404 {
          font-family: 'Syne', sans-serif;
          font-weight: 900;
          font-size: clamp(120px, 22vw, 220px);
          line-height: 0.85;
          letter-spacing: -0.04em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(0,229,255,0.2);
          position: relative;
          user-select: none;
          margin-bottom: 8px;
          animation: fadeUp 0.6s 0.1s both;
        }

        .nf-404::before {
          content: '404';
          position: absolute;
          inset: 0;
          color: transparent;
          -webkit-text-stroke: 1px #00e5ff;
          animation: glitch1 4s infinite;
          clip-path: polygon(0 20%, 100% 20%, 100% 45%, 0 45%);
        }

        .nf-404::after {
          content: '404';
          position: absolute;
          inset: 0;
          color: transparent;
          -webkit-text-stroke: 1px #ff3366;
          animation: glitch2 4s infinite;
          clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%);
        }

        @keyframes glitch1 {
          0%, 90%, 100% { transform: translate(0); opacity: 0; }
          91% { transform: translate(-4px, 2px); opacity: 1; }
          93% { transform: translate(4px, -2px); opacity: 1; }
          95% { transform: translate(-2px, 1px); opacity: 1; }
          97% { transform: translate(0); opacity: 0; }
        }

        @keyframes glitch2 {
          0%, 88%, 100% { transform: translate(0); opacity: 0; }
          89% { transform: translate(4px, -1px); opacity: 1; }
          91% { transform: translate(-4px, 2px); opacity: 1; }
          93% { transform: translate(2px, -1px); opacity: 1; }
          95% { transform: translate(0); opacity: 0; }
        }

        .nf-cursor {
          display: inline-block;
          width: 8px; height: 14px;
          background: #00e5ff;
          vertical-align: middle;
          margin-left: 2px;
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .nf-status-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #ff3366;
          box-shadow: 0 0 8px #ff3366;
          animation: dotPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .nf-terminal  { animation: fadeUp 0.6s 0.3s both; }
        .nf-message   { animation: fadeUp 0.6s 0.45s both; }
        .nf-actions   { animation: fadeUp 0.6s 0.55s both; }
        .nf-badge     { animation: fadeInDown 0.5s 0.3s both; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nf-btn-primary {
          font-family: 'Space Mono', monospace;
          font-size: 12px; font-weight: 700;
          padding: 10px 24px; border-radius: 4px;
          background: #00e5ff; border: 1px solid #00e5ff;
          color: #080b0f; cursor: pointer;
          letter-spacing: 0.05em; transition: all 0.2s;
          box-shadow: 0 0 20px rgba(0,229,255,0.3);
        }
        .nf-btn-primary:hover {
          background: transparent; color: #00e5ff;
          box-shadow: 0 0 30px rgba(0,229,255,0.5);
        }

        .nf-btn-secondary {
          font-family: 'Space Mono', monospace;
          font-size: 12px; padding: 10px 24px; border-radius: 4px;
          background: transparent; border: 1px solid #1e2a38;
          color: #4a5568; cursor: pointer;
          letter-spacing: 0.05em; transition: all 0.2s;
        }
        .nf-btn-secondary:hover {
          border-color: #00e5ff; color: #00e5ff;
        }
      `}</style>

      {/* Status bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 36,
        background: '#0d1117', borderBottom: '1px solid #1e2a38',
        display: 'flex', alignItems: 'center', padding: '0 24px',
        gap: 12, fontFamily: "'Space Mono', monospace", fontSize: 11,
        color: '#4a5568', zIndex: 50,
      }}>
        <div className="nf-status-dot" />
        <span style={{ color: '#00e5ff' }}>HTTP/1.1</span>
        <span style={{ color: '#ff3366', fontWeight: 700 }}>404 Not Found</span>
        <span style={{ marginLeft: 'auto' }}>GET /page-you-were-looking-for</span>
      </div>

      {/* Badge */}
      <div className="nf-badge" style={{
        position: 'fixed', top: 54, right: 24,
        background: '#ff3366', color: 'white',
        fontSize: 10, fontWeight: 700,
        fontFamily: "'Space Mono', monospace",
        padding: '4px 10px', borderRadius: 3,
        letterSpacing: '0.1em',
        boxShadow: '0 0 16px rgba(255,51,102,0.4)', zIndex: 50,
      }}>
        404
      </div>

      {/* Main */}
      <div className="nf-bg" style={{
        minHeight: '100vh', background: '#080b0f',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', gap: 0, position: 'relative',
        fontFamily: "'Space Mono', monospace",
        overflow: 'hidden',
      }}>

        <div className="nf-404">404</div>

        {/* Terminal */}
        <div className="nf-terminal" style={{
          width: '100%', maxWidth: 560,
          background: '#0d1117', border: '1px solid #1e2a38',
          borderRadius: 8, overflow: 'hidden',
          boxShadow: '0 0 40px rgba(0,229,255,0.1)',
          marginBottom: 36, position: 'relative', zIndex: 10,
        }}>
          <div style={{
            background: '#111820', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid #1e2a38',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            <span style={{ fontSize: 11, color: '#4a5568', margin: '0 auto', transform: 'translateX(-20px)' }}>
              bash — 80×24
            </span>
          </div>
          <div style={{ padding: '20px 24px', fontSize: 13, lineHeight: 1.8 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: '#00e5ff' }}>~$</span>
              <span style={{ color: '#e2e8f0' }}>curl -I https://yoursite.com/page</span>
            </div>
            <div style={{ color: '#ff3366', paddingLeft: 20 }}>HTTP/1.1 404 Not Found</div>
            <div style={{ color: '#4a5568', paddingLeft: 20 }}>
              Date: <span style={{ color: '#e2e8f0' }}>Wed, 18 Mar 2026</span>
            </div>
            <div style={{ color: '#4a5568', paddingLeft: 20 }}>Content-Type: text/html; charset=utf-8</div>
            <div style={{ color: '#ff3366', paddingLeft: 20 }}>X-Error: Resource does not exist</div>
            <br />
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: '#00e5ff' }}>~$</span>
              <span style={{ color: '#e2e8f0' }}>find / -name "the-page-you-want"</span>
            </div>
            <div style={{ color: '#ff3366', paddingLeft: 20 }}>find: No such file or directory</div>
            <br />
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ color: '#00e5ff' }}>~$</span>
              <span style={{ color: '#00e5ff' }}>
                cd /home<span className="nf-cursor" />
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="nf-message" style={{
          textAlign: 'center', marginBottom: 32,
          position: 'relative', zIndex: 10,
        }}>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
            color: '#e2e8f0', letterSpacing: '0.05em', marginBottom: 8,
          }}>
            PAGE NOT FOUND
          </h1>
          <p style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.6 }}>
            The resource you requested has vanished into the void.<br />
            It may have been moved, deleted, or never existed.
          </p>
        </div>

        {/* Actions */}
        <div className="nf-actions" style={{
          display: 'flex', gap: 12, flexWrap: 'wrap',
          justifyContent: 'center', position: 'relative', zIndex: 10,
        }}>
          <button className="nf-btn-primary" onClick={() => navigate('/dashboard')}>
            ← Go Home
          </button>
          <button className="nf-btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>

      </div>
    </>
  );
};
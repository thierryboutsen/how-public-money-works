/* global React */
const { useState, useEffect } = React;

// LinkedIn banner: 1584 x 396 (4:1)
// Safe area: profile photo covers lower-left ~ 180px circle centered at ~(180, 340) from top-left
// So avoid important content in bottom-left ~ 0..400 x 200..396

// ---------- Shared primitives ----------

const Stripes = ({ opacity = 0.06, color = "#C9A96A" }) => (
  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <defs>
      <pattern id="hair" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
        <line x1="0" y1="0" x2="0" y2="3" stroke={color} strokeWidth="0.4" opacity={opacity * 4} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hair)" />
  </svg>
);

const Grain = () => (
  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35, mixBlendMode: 'overlay' }}>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
      <feColorMatrix values="0 0 0 0 0.8   0 0 0 0 0.7   0 0 0 0 0.4   0 0 0 0.25 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

const SafeZoneOverlay = ({ show }) => {
  if (!show) return null;
  return (
    <>
      {/* Profile photo safe area — roughly a 180px circle centered near bottom-left of banner */}
      <div style={{
        position: 'absolute', left: 60, bottom: -90, width: 240, height: 240,
        borderRadius: '50%', border: '1.5px dashed rgba(217, 63, 63, 0.9)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', left: 20, bottom: 8, fontSize: 10,
        color: 'rgba(217,63,63,0.9)', fontFamily: 'ui-monospace, monospace',
        letterSpacing: '0.1em', textTransform: 'uppercase', pointerEvents: 'none',
      }}>profile photo safe-zone</div>
    </>
  );
};

// ---------- Banner 1: Editorial Masthead ----------

function BannerMasthead({ showSafe, palette }) {
  const { bg, gold, ivory, muted, deepGold } = palette;
  return (
    <div style={{
      position: 'relative', width: 1584, height: 396,
      background: `linear-gradient(135deg, ${bg} 0%, ${shade(bg, -8)} 60%, ${shade(bg, -18)} 100%)`,
      overflow: 'hidden', fontFamily: "'Cormorant Garamond', serif",
      color: ivory,
    }}>
      {/* Radial vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 70% 80% at 72% 50%, ${shade(bg, 6)} 0%, transparent 70%)`,
      }} />
      <Stripes opacity={0.05} color={gold} />

      {/* Top rule w/ masthead */}
      <div style={{
        position: 'absolute', top: 28, left: 64, right: 64,
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.42em',
          color: gold, fontWeight: 500, textTransform: 'uppercase',
        }}>Public Finance</div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${gold}, transparent)` }} />
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.42em',
          color: muted, fontWeight: 500, textTransform: 'uppercase',
        }}>Est. MMXI · São Paulo — Brasil</div>
      </div>

      {/* Center editorial block, shifted right of safe zone */}
      <div style={{
        position: 'absolute', left: 420, right: 96, top: 78, bottom: 58,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* Tiny kicker */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.5em',
          color: gold, marginBottom: 14, textTransform: 'uppercase',
        }}>
          <span style={{ display: 'inline-block', width: 22, height: 1, background: gold, verticalAlign: 'middle', marginRight: 14, marginBottom: 3 }} />
          Institutional Finance &nbsp;·&nbsp; Public-Sector Governance
        </div>

        {/* Name */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 62, lineHeight: 1.02,
          fontWeight: 400, letterSpacing: '-0.01em', color: ivory,
          marginBottom: 14,
        }}>
          Eliana <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Correa Faria</span> Lima
        </div>

        {/* Gold rule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 38, height: 1, background: gold }} />
          <div style={{ width: 3, height: 3, background: gold, borderRadius: '50%' }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${gold}40, transparent)` }} />
        </div>

        {/* English line */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 14, letterSpacing: '0.18em',
          color: ivory, fontWeight: 500, textTransform: 'uppercase', marginBottom: 10,
        }}>
          Public Finance <span style={{ color: gold }}>·</span> Government Budgeting <span style={{ color: gold }}>·</span> Fiscal Modernization <span style={{ color: gold }}>·</span> Public Sector Transformation
        </div>

        {/* Portuguese line */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
          fontSize: 18, letterSpacing: '0.02em', color: muted, fontWeight: 400,
        }}>
          Finanças Públicas · Orçamento Governamental · Modernização Fiscal · Transformação do Setor Público
        </div>
      </div>

      {/* Right column folio */}
      <div style={{
        position: 'absolute', right: 64, top: 0, bottom: 0, width: 1,
        background: `linear-gradient(to bottom, transparent, ${gold}60, transparent)`,
      }} />
      <div style={{
        position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%) rotate(90deg)',
        transformOrigin: 'center', fontFamily: "'Inter', sans-serif", fontSize: 9,
        letterSpacing: '0.6em', color: gold, textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        Vol. XIII &nbsp;—&nbsp; Fiscal Governance Edition
      </div>

      {/* Bottom rule */}
      <div style={{
        position: 'absolute', bottom: 26, left: 420, right: 96,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ width: 28, height: 1, background: gold }} />
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.4em',
          color: deepGold, textTransform: 'uppercase', fontWeight: 500,
        }}>
          13 + Years · Municipal Administration · Brazil
        </div>
      </div>

      <Grain />
      <SafeZoneOverlay show={showSafe} />
    </div>
  );
}

// ---------- Banner 2: Quiet Luxury / Thin-rule ----------

function BannerQuiet({ showSafe, palette }) {
  const { bg, gold, ivory, muted } = palette;
  return (
    <div style={{
      position: 'relative', width: 1584, height: 396,
      background: bg, overflow: 'hidden',
    }}>
      {/* Faint vertical column lines — like a newspaper grid */}
      <svg width="1584" height="396" style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <line key={i} x1={i * (1584/7)} y1="0" x2={i * (1584/7)} y2="396"
            stroke={gold} strokeWidth="0.5" />
        ))}
      </svg>

      {/* Outer frame */}
      <div style={{
        position: 'absolute', inset: 22,
        border: `1px solid ${gold}40`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 26,
        border: `1px solid ${gold}18`,
        pointerEvents: 'none',
      }} />

      {/* Corner marks */}
      {[[22,22],[1584-22,22],[22,396-22],[1584-22,396-22]].map(([x,y],i) => (
        <div key={i} style={{
          position: 'absolute', left: x-4, top: y-4, width: 8, height: 8,
          border: `1px solid ${gold}`, transform: 'rotate(45deg)', background: bg,
        }}/>
      ))}

      {/* Top tagline */}
      <div style={{
        position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.55em',
        color: gold, textTransform: 'uppercase', fontWeight: 500,
      }}>
        — Institutional Finance &nbsp;·&nbsp; Public-Sector Governance —
      </div>

      {/* Name — centered editorial */}
      <div style={{
        position: 'absolute', top: 95, left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Cormorant Garamond', serif", fontSize: 72, lineHeight: 1,
        color: ivory, fontWeight: 300, letterSpacing: '0.005em',
      }}>
        Eliana <span style={{ fontStyle: 'italic' }}>Correa Faria</span> Lima
      </div>

      {/* Gold diamond divider */}
      <div style={{
        position: 'absolute', top: 200, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      }}>
        <div style={{ width: 120, height: 1, background: `linear-gradient(to right, transparent, ${gold})` }} />
        <div style={{ width: 6, height: 6, background: gold, transform: 'rotate(45deg)' }} />
        <div style={{ width: 120, height: 1, background: `linear-gradient(to left, transparent, ${gold})` }} />
      </div>

      {/* English line */}
      <div style={{
        position: 'absolute', top: 232, left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Inter', sans-serif", fontSize: 14, letterSpacing: '0.22em',
        color: ivory, textTransform: 'uppercase', fontWeight: 500,
      }}>
        Public Finance &nbsp;·&nbsp; Government Budgeting &nbsp;·&nbsp; Fiscal Modernization &nbsp;·&nbsp; Public-Sector Transformation
      </div>

      {/* Portuguese line */}
      <div style={{
        position: 'absolute', top: 265, left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
        fontSize: 18, color: muted, letterSpacing: '0.015em',
      }}>
        Finanças Públicas · Orçamento Governamental · Modernização Fiscal · Transformação do Setor Público
      </div>

      {/* Bottom badge — placed right of safe zone */}
      <div style={{
        position: 'absolute', bottom: 48, right: 60,
        fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.4em',
        color: gold, textTransform: 'uppercase', textAlign: 'right',
      }}>
        <div style={{ opacity: 0.9 }}>São Paulo — Brasil</div>
        <div style={{ width: 28, height: 1, background: gold, marginLeft: 'auto', margin: '6px 0 6px auto' }} />
        <div style={{ color: muted, letterSpacing: '0.35em' }}>13 + Years of Practice</div>
      </div>

      <Grain />
      <SafeZoneOverlay show={showSafe} />
    </div>
  );
}

// ---------- Banner 3: Asymmetric Broadsheet ----------

function BannerBroadsheet({ showSafe, palette }) {
  const { bg, gold, ivory, muted, deepGold } = palette;
  return (
    <div style={{
      position: 'relative', width: 1584, height: 396,
      background: bg, overflow: 'hidden',
    }}>
      {/* Left deep-navy block */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 380,
        background: `linear-gradient(180deg, ${shade(bg, -10)} 0%, ${shade(bg, -20)} 100%)`,
        borderRight: `1px solid ${gold}30`,
      }} />

      {/* Folio number bigly — subtle */}
      <div style={{
        position: 'absolute', left: 72, top: 36,
        fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
        fontSize: 14, color: gold, letterSpacing: '0.08em',
      }}>
        N.º <span style={{ fontStyle: 'normal', fontSize: 16, fontWeight: 500 }}>XIII</span>
      </div>

      {/* Vertical text in left column */}
      <div style={{
        position: 'absolute', left: 72, top: 70,
        fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.55em',
        color: gold, textTransform: 'uppercase', fontWeight: 500,
      }}>
        An Editorial on
      </div>

      {/* Serif hero phrase in left column */}
      <div style={{
        position: 'absolute', left: 72, top: 98, width: 260,
        fontFamily: "'Cormorant Garamond', serif", fontSize: 44, lineHeight: 1.02,
        color: ivory, fontWeight: 300, letterSpacing: '-0.005em',
      }}>
        Fiscal <span style={{ fontStyle: 'italic' }}>stewardship</span>, in practice.
      </div>

      {/* Right side — main identity block */}
      <div style={{
        position: 'absolute', left: 440, right: 80, top: 60, bottom: 52,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* Upper kicker */}
        <div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 10.5, letterSpacing: '0.5em',
            color: gold, textTransform: 'uppercase', fontWeight: 500, marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ width: 24, height: 1, background: gold }} />
            The Correspondent
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 64, lineHeight: 1,
            color: ivory, fontWeight: 400, letterSpacing: '-0.01em',
          }}>
            Eliana Correa <span style={{ fontStyle: 'italic', fontWeight: 300 }}>Faria</span> Lima
          </div>
        </div>

        {/* Divider + statements */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 44, height: 1, background: gold }} />
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: gold }} />
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: gold, opacity: 0.6 }} />
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: gold, opacity: 0.3 }} />
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13.5, letterSpacing: '0.2em',
            color: ivory, textTransform: 'uppercase', fontWeight: 500, marginBottom: 9,
          }}>
            Public Finance <span style={{ color: gold, margin: '0 4px' }}>/</span> Government Budgeting <span style={{ color: gold, margin: '0 4px' }}>/</span> Fiscal Modernization <span style={{ color: gold, margin: '0 4px' }}>/</span> Public-Sector Transformation
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
            fontSize: 17.5, color: muted, letterSpacing: '0.015em',
          }}>
            Finanças Públicas · Orçamento Governamental · Modernização Fiscal · Transformação do Setor Público
          </div>
        </div>
      </div>

      {/* Right edge vertical mark */}
      <div style={{
        position: 'absolute', right: 34, top: 36, bottom: 36,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ width: 1, flex: 1, background: `linear-gradient(to bottom, transparent, ${gold}60, transparent)` }} />
      </div>
      <div style={{
        position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%) rotate(90deg)',
        transformOrigin: 'center', fontFamily: "'Inter', sans-serif", fontSize: 8.5,
        letterSpacing: '0.55em', color: deepGold, textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}>
        São Paulo · Brasil · MMXXVI
      </div>

      <Stripes opacity={0.04} color={gold} />
      <Grain />
      <SafeZoneOverlay show={showSafe} />
    </div>
  );
}

// ---------- helpers ----------

function shade(hex, amount) {
  // amount in percentage points; positive lighter, negative darker
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (amount/100) * 255)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

// ---------- export ----------

Object.assign(window, {
  BannerMasthead, BannerQuiet, BannerBroadsheet,
});

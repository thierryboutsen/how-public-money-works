/* global React */

// LinkedIn banner: 1584 x 396
// Profile photo safe-zone: ~200px circle centered around (200, 330) from top-left.
// All key content anchored right of x ≈ 420 or above y ≈ 220 to stay clear.

// --- Shared atmosphere ---

const Grain = ({ opacity = 0.25 }) => (
  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity, mixBlendMode: 'overlay' }}>
    <filter id="bgrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
      <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.75  0 0 0 0 0.45  0 0 0 0.22 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#bgrain)" />
  </svg>
);

const Vignette = ({ bg, dir = '72% 50%' }) => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `radial-gradient(ellipse 85% 110% at ${dir}, rgba(255,255,255,0.05) 0%, transparent 55%), radial-gradient(ellipse 90% 120% at 10% 100%, rgba(0,0,0,0.35) 0%, transparent 60%)`,
  }} />
);

const SafeZoneOverlay = ({ show }) => {
  if (!show) return null;
  return (
    <>
      <div style={{
        position: 'absolute', left: 72, bottom: -70, width: 220, height: 220,
        borderRadius: '50%', border: '1.5px dashed rgba(220, 70, 70, 0.85)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', left: 76, bottom: 8, fontSize: 9,
        color: 'rgba(220,70,70,0.9)', fontFamily: 'ui-monospace, monospace',
        letterSpacing: '0.22em', textTransform: 'uppercase', pointerEvents: 'none',
      }}>profile-photo safe zone</div>
    </>
  );
};

// Monogram — small editorial mark, replaces heavy iconography
const Monogram = ({ gold, ivory, size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{ display: 'block' }}>
    <circle cx="30" cy="30" r="28.5" fill="none" stroke={gold} strokeWidth="0.6" opacity="0.8" />
    <circle cx="30" cy="30" r="24" fill="none" stroke={gold} strokeWidth="0.4" opacity="0.35" />
    <text x="30" y="38" textAnchor="middle" fill={ivory}
      fontFamily="'Playfair Display', serif" fontSize="22" fontStyle="italic" fontWeight="400"
      letterSpacing="-0.02em">
      ecfl
    </text>
  </svg>
);

// ------------------ 1. Executive Minimal / Quiet Luxury ------------------
// Refined: more whitespace, removed corner diamonds (too busy), single frame,
// better type rhythm, Portuguese now properly-weighted, monogram center.

function BannerQuiet({ showSafe, palette }) {
  const { bg, gold, ivory, muted, deepGold } = palette;
  return (
    <div style={{
      position: 'relative', width: 1584, height: 396,
      background: `linear-gradient(180deg, ${shade(bg, 3)} 0%, ${bg} 50%, ${shade(bg, -6)} 100%)`,
      overflow: 'hidden',
    }}>
      <Vignette bg={bg} dir="50% 35%" />

      {/* Single refined frame */}
      <div style={{
        position: 'absolute', inset: '26px 32px',
        border: `1px solid ${gold}33`, pointerEvents: 'none',
      }} />

      {/* Top eyebrow line — wider tracking, thinner */}
      <div style={{
        position: 'absolute', top: 58, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18,
      }}>
        <div style={{ width: 40, height: 1, background: `linear-gradient(to right, transparent, ${gold})` }} />
        <div style={{
          fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
          fontSize: 13, color: gold, letterSpacing: '0.22em',
        }}>
          Institutional Finance &nbsp;·&nbsp; Public-Sector Governance
        </div>
        <div style={{ width: 40, height: 1, background: `linear-gradient(to left, transparent, ${gold})` }} />
      </div>

      {/* Name — larger, lighter, letter-spaced like a masthead */}
      <div style={{
        position: 'absolute', top: 108, left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Playfair Display', serif", fontSize: 76, lineHeight: 1,
        color: ivory, fontWeight: 400, letterSpacing: '-0.008em',
      }}>
        Eliana <span style={{ fontStyle: 'italic', fontWeight: 400, color: shade(ivory, -3) }}>Correa Faria</span> Lima
      </div>

      {/* Single gold rule, no diamond */}
      <div style={{
        position: 'absolute', top: 215, left: '50%', transform: 'translateX(-50%)',
        width: 56, height: 1.2, background: gold,
      }} />

      {/* English line — small caps, well spaced */}
      <div style={{
        position: 'absolute', top: 238, left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Inter', sans-serif", fontSize: 13, letterSpacing: '0.34em',
        color: ivory, textTransform: 'uppercase', fontWeight: 500,
      }}>
        Public Finance &nbsp;<span style={{ color: gold, fontWeight: 300 }}>·</span>&nbsp; Government Budgeting &nbsp;<span style={{ color: gold, fontWeight: 300 }}>·</span>&nbsp; Fiscal Modernization &nbsp;<span style={{ color: gold, fontWeight: 300 }}>·</span>&nbsp; Public-Sector Transformation
      </div>

      {/* Portuguese line — italic serif, softer */}
      <div style={{
        position: 'absolute', top: 272, left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
        fontSize: 17, color: muted, letterSpacing: '0.01em', fontWeight: 400,
      }}>
        Finanças Públicas &nbsp;·&nbsp; Orçamento Governamental &nbsp;·&nbsp; Modernização Fiscal &nbsp;·&nbsp; Transformação do Setor Público
      </div>

      {/* Bottom-right footer — elegant, minimal */}
      <div style={{
        position: 'absolute', bottom: 50, right: 60, textAlign: 'right',
        fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.42em',
        color: deepGold, textTransform: 'uppercase', fontWeight: 500,
      }}>
        São Paulo · Brasil
      </div>

      {/* Bottom-left mirrored (kept above profile photo) */}
      <div style={{
        position: 'absolute', bottom: 50, left: 380,
        fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.42em',
        color: deepGold, textTransform: 'uppercase', fontWeight: 500,
      }}>
        MMXXVI
      </div>

      <Grain />
      <SafeZoneOverlay show={showSafe} />
    </div>
  );
}

// ------------------ 2. Editorial Masthead (primary) ------------------
// Refined: English positioning line promoted to HERO readable size,
// monogram anchor on right, name slightly restrained so positioning reads first,
// softer decorative elements.

function BannerMasthead({ showSafe, palette }) {
  const { bg, gold, ivory, muted, deepGold } = palette;
  return (
    <div style={{
      position: 'relative', width: 1584, height: 396,
      background: `linear-gradient(120deg, ${shade(bg, -4)} 0%, ${bg} 55%, ${shade(bg, 3)} 100%)`,
      overflow: 'hidden',
    }}>
      <Vignette bg={bg} dir="70% 40%" />

      {/* Top masthead bar */}
      <div style={{
        position: 'absolute', top: 38, left: 72, right: 72,
        display: 'flex', alignItems: 'center', gap: 20,
      }}>
        <div style={{
          fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
          fontSize: 13, color: gold, letterSpacing: '0.08em',
        }}>
          The Correspondent <span style={{ opacity: 0.6 }}>—</span> <span style={{ fontStyle: 'normal', fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase' }}>Vol. XIII</span>
        </div>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${gold}55, ${gold}20)` }} />
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.42em',
          color: muted, textTransform: 'uppercase', fontWeight: 500,
        }}>
          São Paulo · Brasil
        </div>
      </div>

      {/* Content block — shifted right of safe zone */}
      <div style={{
        position: 'absolute', left: 430, right: 180, top: 88, bottom: 58,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.5em',
          color: gold, textTransform: 'uppercase', fontWeight: 500, marginBottom: 18,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ width: 22, height: 1, background: gold }} />
          On Public Finance &amp; Governance
        </div>

        {/* Name — restrained but elegant */}
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: 54, lineHeight: 1.02,
          color: ivory, fontWeight: 400, letterSpacing: '-0.012em', marginBottom: 22,
        }}>
          Eliana Correa <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Faria</span> Lima
        </div>

        {/* Clean gold rule */}
        <div style={{
          width: 72, height: 1.2, background: gold, marginBottom: 18,
        }} />

        {/* HERO English positioning — now the headline */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 15, letterSpacing: '0.28em',
          color: ivory, textTransform: 'uppercase', fontWeight: 500, marginBottom: 12,
          lineHeight: 1.5,
        }}>
          Public Finance <span style={{ color: gold, fontWeight: 300, margin: '0 2px' }}>·</span> Government Budgeting <span style={{ color: gold, fontWeight: 300, margin: '0 2px' }}>·</span> Fiscal Modernization <span style={{ color: gold, fontWeight: 300, margin: '0 2px' }}>·</span> Public-Sector Transformation
        </div>

        {/* Portuguese — italic, softer, fluid */}
        <div style={{
          fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
          fontSize: 17.5, color: muted, letterSpacing: '0.008em', lineHeight: 1.35,
        }}>
          Finanças Públicas · Orçamento Governamental · Modernização Fiscal · Transformação do Setor Público
        </div>
      </div>

      {/* Right-edge monogram column */}
      <div style={{
        position: 'absolute', right: 72, top: 88, bottom: 58,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 14,
      }}>
        <div style={{ width: 1, flex: 1, background: `linear-gradient(to bottom, transparent, ${gold}40, transparent)` }} />
        <Monogram gold={gold} ivory={ivory} size={52} />
        <div style={{ width: 1, flex: 1, background: `linear-gradient(to bottom, transparent, ${gold}40, transparent)` }} />
      </div>

      {/* Bottom rule */}
      <div style={{
        position: 'absolute', bottom: 30, left: 430, right: 180,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ width: 20, height: 1, background: gold }} />
        <div style={{
          fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
          fontSize: 12, color: deepGold, letterSpacing: '0.06em',
        }}>
          Thirteen years in the stewardship of public resources.
        </div>
      </div>

      <Grain />
      <SafeZoneOverlay show={showSafe} />
    </div>
  );
}

// ------------------ 3. Bilingual Split (refined) ------------------
// Previously rigid block/block split. Refined into a fluid editorial with
// a subtle vertical gold thread, bilingual content flowing on either side,
// name spanning across for unity.

function BannerBilingual({ showSafe, palette }) {
  const { bg, gold, ivory, muted, deepGold } = palette;
  return (
    <div style={{
      position: 'relative', width: 1584, height: 396,
      background: `linear-gradient(135deg, ${shade(bg, -3)} 0%, ${bg} 60%, ${shade(bg, 4)} 100%)`,
      overflow: 'hidden',
    }}>
      <Vignette bg={bg} dir="60% 50%" />

      {/* Name spans horizontally, unifying the composition — shifted right to clear safe zone */}
      <div style={{
        position: 'absolute', top: 58, left: 430, right: 80,
        fontFamily: "'Playfair Display', serif", fontSize: 52, lineHeight: 1,
        color: ivory, fontWeight: 400, letterSpacing: '-0.012em',
        display: 'flex', alignItems: 'baseline', gap: 18,
      }}>
        <span>Eliana Correa <span style={{ fontStyle: 'italic' }}>Faria</span> Lima</span>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${gold}60, transparent)`, alignSelf: 'center', marginBottom: 6 }} />
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.45em',
          color: gold, textTransform: 'uppercase', fontWeight: 500,
          whiteSpace: 'nowrap',
        }}>Bilingual · EN / PT-BR</span>
      </div>

      {/* Dual-column body, separated by a fine vertical thread */}
      <div style={{
        position: 'absolute', top: 148, left: 430, right: 80, bottom: 68,
        display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 40,
      }}>
        {/* EN column */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.5em',
            color: gold, textTransform: 'uppercase', fontWeight: 500, marginBottom: 18,
          }}>— In English</div>
          <div style={{
            fontFamily: "'Playfair Display', serif", fontSize: 22, lineHeight: 1.28,
            color: ivory, fontWeight: 400, letterSpacing: '-0.005em',
          }}>
            Public Finance. Government Budgeting. <span style={{ fontStyle: 'italic', color: shade(ivory, -5) }}>Fiscal Modernization. Public-Sector Transformation.</span>
          </div>
        </div>

        {/* Thread */}
        <div style={{ background: `linear-gradient(to bottom, transparent, ${gold}45 30%, ${gold}45 70%, transparent)` }} />

        {/* PT column */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <div style={{
            fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.5em',
            color: gold, textTransform: 'uppercase', fontWeight: 500, marginBottom: 18,
          }}>— Em Português</div>
          <div style={{
            fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
            fontSize: 22, lineHeight: 1.28, color: muted, fontWeight: 400,
          }}>
            Finanças Públicas. Orçamento Governamental. <span style={{ color: shade(muted, 6) }}>Modernização Fiscal. Transformação do Setor Público.</span>
          </div>
        </div>
      </div>

      {/* Top-left mark (above safe zone) */}
      <div style={{
        position: 'absolute', top: 44, left: 72,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <Monogram gold={gold} ivory={ivory} size={44} />
      </div>

      {/* Bottom footer — right */}
      <div style={{
        position: 'absolute', bottom: 30, right: 80,
        fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
        fontSize: 12, color: deepGold, letterSpacing: '0.04em',
      }}>
        Institutional Finance &nbsp;·&nbsp; Public-Sector Governance
      </div>

      <Grain />
      <SafeZoneOverlay show={showSafe} />
    </div>
  );
}

// ------------------ 4. Broadsheet / Asymmetric (refined) ------------------
// Refined: softened the hard navy block into a tonal shift, editorial pull-quote
// replaces heavy slab, calmer hierarchy, less experimental.

function BannerBroadsheet({ showSafe, palette }) {
  const { bg, gold, ivory, muted, deepGold } = palette;
  return (
    <div style={{
      position: 'relative', width: 1584, height: 396,
      background: `linear-gradient(90deg, ${shade(bg, -8)} 0%, ${shade(bg, -8)} 26%, ${bg} 32%, ${shade(bg, 2)} 100%)`,
      overflow: 'hidden',
    }}>
      <Vignette bg={bg} dir="65% 45%" />

      {/* Subtle vertical separator */}
      <div style={{
        position: 'absolute', left: '29%', top: 40, bottom: 40, width: 1,
        background: `linear-gradient(to bottom, transparent, ${gold}55, transparent)`,
      }} />

      {/* Left column — pull quote (kept ABOVE safe zone) */}
      <div style={{
        position: 'absolute', left: 72, top: 52, width: 330,
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: 88, lineHeight: 0.7,
          color: gold, fontStyle: 'italic', fontWeight: 400,
          marginBottom: -4,
        }}>“</div>
        <div style={{
          fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
          fontSize: 22, lineHeight: 1.25, color: ivory, fontWeight: 400,
          letterSpacing: '-0.003em',
        }}>
          Fiscal stewardship, in practice — <span style={{ color: muted }}>budgeting as the operating system of public promise.</span>
        </div>
      </div>

      {/* Right column — identity */}
      <div style={{
        position: 'absolute', left: '32%', right: 80, top: 62, bottom: 52,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.48em',
          color: gold, textTransform: 'uppercase', fontWeight: 500, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ width: 22, height: 1, background: gold }} />
          The Correspondent · N.º XIII
        </div>

        {/* Name */}
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: 56, lineHeight: 1,
          color: ivory, fontWeight: 400, letterSpacing: '-0.012em', marginBottom: 22,
        }}>
          Eliana Correa <span style={{ fontStyle: 'italic' }}>Faria</span> Lima
        </div>

        <div style={{ width: 64, height: 1.2, background: gold, marginBottom: 18 }} />

        {/* English positioning — hero */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 14, letterSpacing: '0.26em',
          color: ivory, textTransform: 'uppercase', fontWeight: 500, marginBottom: 10,
          lineHeight: 1.5,
        }}>
          Public Finance <span style={{ color: gold, fontWeight: 300 }}>·</span> Government Budgeting <span style={{ color: gold, fontWeight: 300 }}>·</span> Fiscal Modernization <span style={{ color: gold, fontWeight: 300 }}>·</span> Public-Sector Transformation
        </div>

        {/* Portuguese */}
        <div style={{
          fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
          fontSize: 17, color: muted, letterSpacing: '0.008em', lineHeight: 1.35,
        }}>
          Finanças Públicas · Orçamento Governamental · Modernização Fiscal · Transformação do Setor Público
        </div>
      </div>

      {/* Bottom-right folio */}
      <div style={{
        position: 'absolute', bottom: 28, right: 72,
        fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.42em',
        color: deepGold, textTransform: 'uppercase', fontWeight: 500,
      }}>
        São Paulo · Brasil &nbsp;—&nbsp; MMXXVI
      </div>

      <Grain />
      <SafeZoneOverlay show={showSafe} />
    </div>
  );
}

// ------------------ helpers ------------------

function shade(hex, amount) {
  if (hex.startsWith('rgb')) return hex;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (amount/100) * 255)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

// ------------------ 5 & 6. Broadsheet with subtle infographic motifs ------------------

// Dashboard-style chart mark: concentric arc + rising bars.
// Intentionally quiet — hairlines, low opacity, decorative not literal.
const DashboardMotif = ({ gold, ivory, muted, width = 300, height = 260 }) => (
  <svg width={width} height={height} viewBox="0 0 300 260"
    style={{ display: 'block', opacity: 0.85 }}>
    <defs>
      <linearGradient id="dmArc" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={gold} stopOpacity="0.9" />
        <stop offset="100%" stopColor={gold} stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id="dmBar" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={gold} stopOpacity="0" />
        <stop offset="100%" stopColor={gold} stopOpacity="0.55" />
      </linearGradient>
    </defs>

    {/* Concentric arcs — dashboard ring */}
    <g transform="translate(150, 130)">
      <circle r="96" fill="none" stroke={gold} strokeWidth="0.5" opacity="0.22" />
      <circle r="78" fill="none" stroke={gold} strokeWidth="0.4" opacity="0.14" />
      <circle r="60" fill="none" stroke={gold} strokeWidth="0.4" opacity="0.1" />
      {/* Three-quarter arc */}
      <path d="M 96 0 A 96 96 0 1 0 -67.88 -67.88" fill="none"
        stroke="url(#dmArc)" strokeWidth="1.4" strokeLinecap="round" />
      {/* Ticks */}
      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const x1 = Math.cos(a) * 102;
        const y1 = Math.sin(a) * 102;
        const x2 = Math.cos(a) * 106;
        const y2 = Math.sin(a) * 106;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={gold} strokeWidth="0.5" opacity={i % 6 === 0 ? 0.55 : 0.22} />;
      })}
      {/* Inner dot */}
      <circle r="2" fill={gold} opacity="0.9" />
    </g>

    {/* Rising bars at bottom — sparkline feel */}
    <g transform="translate(30, 220)">
      {[14, 22, 18, 34, 28, 46, 40, 58, 54, 72, 64, 88].map((h, i) => (
        <rect key={i} x={i * 20} y={-h} width="10" height={h}
          fill="url(#dmBar)" />
      ))}
      {/* Baseline */}
      <line x1="-4" y1="0" x2="248" y2="0" stroke={gold} strokeWidth="0.5" opacity="0.3" />
    </g>

    {/* Diagonal ascending line overlay */}
    <polyline
      points="30,210 70,188 110,196 150,160 190,168 230,130 270,108"
      fill="none" stroke={ivory} strokeWidth="0.8" opacity="0.35"
      strokeLinecap="round" strokeLinejoin="round" />
    {[[30,210],[70,188],[110,196],[150,160],[190,168],[230,130],[270,108]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r="1.2" fill={ivory} opacity="0.55" />
    ))}
  </svg>
);

// City-skyline motif — public-sector, buildings silhouette + rising columns.
const SkylineMotif = ({ gold, ivory, muted, width = 320, height = 260 }) => (
  <svg width={width} height={height} viewBox="0 0 320 260"
    style={{ display: 'block', opacity: 0.85 }}>
    <defs>
      <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={gold} stopOpacity="0.0" />
        <stop offset="60%" stopColor={gold} stopOpacity="0.35" />
        <stop offset="100%" stopColor={gold} stopOpacity="0.7" />
      </linearGradient>
      <linearGradient id="skyBar" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor={gold} stopOpacity="0.0" />
        <stop offset="100%" stopColor={gold} stopOpacity="0.45" />
      </linearGradient>
    </defs>

    {/* Skyline — thin strokes only, no fills */}
    <g transform="translate(0, 60)" fill="none" stroke="url(#skyFade)" strokeWidth="1">
      {/* Classical building (left) — columns */}
      <g opacity="0.85">
        <line x1="18" y1="180" x2="18" y2="80" />
        <line x1="32" y1="180" x2="32" y2="80" />
        <line x1="46" y1="180" x2="46" y2="80" />
        <line x1="60" y1="180" x2="60" y2="80" />
        <line x1="74" y1="180" x2="74" y2="80" />
        {/* Pediment */}
        <polyline points="10,80 46,58 82,80" />
        {/* Base */}
        <line x1="6" y1="180" x2="88" y2="180" />
        <line x1="10" y1="86" x2="82" y2="86" />
      </g>

      {/* Tall modern towers (middle-right) */}
      <g opacity="0.9">
        <rect x="108" y="54" width="24" height="126" />
        {/* Window grid */}
        {Array.from({ length: 10 }).map((_, r) =>
          <line key={r} x1="108" y1={60 + r * 12} x2="132" y2={60 + r * 12} strokeWidth="0.4" opacity="0.55" />
        )}
      </g>
      <g opacity="0.9">
        <rect x="144" y="90" width="20" height="90" />
        {Array.from({ length: 7 }).map((_, r) =>
          <line key={r} x1="144" y1={98 + r * 12} x2="164" y2={98 + r * 12} strokeWidth="0.4" opacity="0.5" />
        )}
      </g>
      <g opacity="0.95">
        <rect x="176" y="30" width="26" height="150" />
        {Array.from({ length: 12 }).map((_, r) =>
          <line key={r} x1="176" y1={38 + r * 12} x2="202" y2={38 + r * 12} strokeWidth="0.4" opacity="0.55" />
        )}
        {/* Antenna */}
        <line x1="189" y1="30" x2="189" y2="14" />
      </g>
      <g opacity="0.85">
        <rect x="214" y="72" width="18" height="108" />
        {Array.from({ length: 9 }).map((_, r) =>
          <line key={r} x1="214" y1={80 + r * 12} x2="232" y2={80 + r * 12} strokeWidth="0.4" opacity="0.45" />
        )}
      </g>
      <g opacity="0.8">
        <rect x="244" y="108" width="16" height="72" />
        {Array.from({ length: 6 }).map((_, r) =>
          <line key={r} x1="244" y1={116 + r * 12} x2="260" y2={116 + r * 12} strokeWidth="0.4" opacity="0.4" />
        )}
      </g>

      {/* Ground line */}
      <line x1="0" y1="180" x2="320" y2="180" stroke={gold} strokeWidth="0.6" opacity="0.4" />
    </g>

    {/* Ascending bar column bottom-right — growth */}
    <g transform="translate(262, 240)">
      {[10, 18, 28, 40, 52].map((h, i) => (
        <rect key={i} x={i * 10} y={-h} width="6" height={h}
          fill="url(#skyBar)" />
      ))}
    </g>

    {/* Thin ascending trajectory */}
    <polyline
      points="8,232 56,218 104,208 152,190 200,180 252,158 300,138"
      fill="none" stroke={ivory} strokeWidth="0.6" opacity="0.3"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Shared broadsheet body with infographic motif.
// Name: ALWAYS "Eliana Correa Faria Lima" — single consistent style, no italic on Faria.
function BroadsheetBase({ showSafe, palette, motif }) {
  const { bg, gold, ivory, muted, deepGold } = palette;
  return (
    <div style={{
      position: 'relative', width: 1584, height: 396,
      background: `linear-gradient(90deg, ${shade(bg, -8)} 0%, ${shade(bg, -8)} 26%, ${bg} 32%, ${shade(bg, 2)} 100%)`,
      overflow: 'hidden',
    }}>
      <Vignette bg={bg} dir="65% 45%" />

      {/* Motif layer — behind everything, above background */}
      {motif === 'dashboard' && (
        <div style={{
          position: 'absolute', left: 390, top: 60, pointerEvents: 'none',
        }}>
          <DashboardMotif gold={gold} ivory={ivory} muted={muted} width={300} height={280} />
        </div>
      )}
      {motif === 'skyline' && (
        <div style={{
          position: 'absolute', right: 40, top: 40, pointerEvents: 'none',
        }}>
          <SkylineMotif gold={gold} ivory={ivory} muted={muted} width={360} height={300} />
        </div>
      )}

      {/* Subtle vertical separator */}
      <div style={{
        position: 'absolute', left: '29%', top: 40, bottom: 40, width: 1,
        background: `linear-gradient(to bottom, transparent, ${gold}55, transparent)`,
      }} />

      {/* Left column — pull quote (kept ABOVE safe zone) */}
      <div style={{
        position: 'absolute', left: 72, top: 52, width: 330,
      }}>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: 88, lineHeight: 0.7,
          color: gold, fontStyle: 'italic', fontWeight: 400,
          marginBottom: -4,
        }}>“</div>
        <div style={{
          fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
          fontSize: 22, lineHeight: 1.25, color: ivory, fontWeight: 400,
          letterSpacing: '-0.003em',
        }}>
          Fiscal stewardship, in practice — <span style={{ color: muted }}>budgeting as the operating system of public promise.</span>
        </div>
      </div>

      {/* Right column — identity.
          For 'skyline' motif, narrow the right edge to leave motif room. */}
      <div style={{
        position: 'absolute',
        left: '32%',
        right: motif === 'skyline' ? 380 : 80,
        top: 62, bottom: 52,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        {/* Eyebrow */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: '0.48em',
          color: gold, textTransform: 'uppercase', fontWeight: 500, marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ width: 22, height: 1, background: gold }} />
          The Correspondent · N.º XIII
        </div>

        {/* Name — consistent single style, no italic, no oscillation */}
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: 54, lineHeight: 1,
          color: ivory, fontWeight: 400, letterSpacing: '-0.012em', marginBottom: 22,
        }}>
          Eliana Correa Faria Lima
        </div>

        <div style={{ width: 64, height: 1.2, background: gold, marginBottom: 18 }} />

        {/* English positioning — includes Health Governance */}
        <div style={{
          fontFamily: "'Inter', sans-serif", fontSize: 13, letterSpacing: '0.22em',
          color: ivory, textTransform: 'uppercase', fontWeight: 500, marginBottom: 10,
          lineHeight: 1.5,
        }}>
          Public Finance <span style={{ color: gold, fontWeight: 300 }}>·</span> Government Budgeting <span style={{ color: gold, fontWeight: 300 }}>·</span> Health Governance <span style={{ color: gold, fontWeight: 300 }}>·</span> Fiscal Modernization <span style={{ color: gold, fontWeight: 300 }}>·</span> Public-Sector Transformation
        </div>

        {/* Portuguese */}
        <div style={{
          fontFamily: "'Libre Caslon Text', Georgia, serif", fontStyle: 'italic',
          fontSize: 16, color: muted, letterSpacing: '0.008em', lineHeight: 1.35,
        }}>
          Finanças Públicas · Orçamento Governamental · Governança em Saúde · Modernização Fiscal · Transformação do Setor Público
        </div>
      </div>

      {/* Bottom-right folio */}
      <div style={{
        position: 'absolute', bottom: 28, right: 72,
        fontFamily: "'Inter', sans-serif", fontSize: 9.5, letterSpacing: '0.42em',
        color: deepGold, textTransform: 'uppercase', fontWeight: 500,
      }}>
        São Paulo · Brasil &nbsp;—&nbsp; MMXXVI
      </div>

      <Grain />
      <SafeZoneOverlay show={showSafe} />
    </div>
  );
}

function BannerBroadsheetDashboard(props) {
  return <BroadsheetBase {...props} motif="dashboard" />;
}

function BannerBroadsheetSkyline(props) {
  return <BroadsheetBase {...props} motif="skyline" />;
}

Object.assign(window, {
  BannerMasthead, BannerQuiet, BannerBilingual, BannerBroadsheet,
  BannerBroadsheetDashboard, BannerBroadsheetSkyline,
});

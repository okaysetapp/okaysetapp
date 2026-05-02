import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Store, Calendar, Map as MapIcon, Filter, Sparkles,
  Camera, Utensils, ArrowRight, Search, ThumbsUp,
} from 'lucide-react';

// A small inline badge-pill used to accent words inside the headline
const Pill = ({ children, icon: Icon, variant = 'primary' }) => {
  const styles = {
    primary: 'bg-primary text-primary-foreground border-primary',
    secondary: 'bg-secondary text-secondary-foreground border-primary',
    surface: 'bg-surface text-primary border-primary',
  }[variant];
  return (
    <span
      className={`inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-1 md:py-2 rounded-full border-2 shadow-hard align-middle mx-1 ${styles}`}
    >
      {Icon && <Icon className="w-6 h-6 md:w-9 md:h-9" strokeWidth={2.5} />}
      {children}
    </span>
  );
};

// Sample vendor pill card shown over the mock map — mimics our VendorMarker style
const VendorPill = ({ name, category, icon: Icon, distance, className = '' }) => (
  <div
    className={`absolute flex items-center gap-2.5 bg-surface border-2 border-primary rounded-full px-3 py-2 shadow-hard whitespace-nowrap ${className}`}
  >
    <span className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center border-2 border-primary flex-shrink-0">
      <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2.5} />
    </span>
    <div className="leading-none">
      <p className="text-sm font-bold text-primary">{name}</p>
      <p className="text-[10px] text-primary/50 mt-0.5">{category}{distance ? ` · ${distance}` : ''}</p>
    </div>
  </div>
);

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* ===== Floating pill nav ===== */}
      <nav className="sticky top-3 md:top-6 z-30 flex justify-center px-3 md:px-4">
        <div className="flex items-center gap-0.5 md:gap-2 bg-surface border-2 border-border rounded-full shadow-hard p-1 md:p-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-2 md:px-4 h-9 md:h-11 font-black text-primary flex-shrink-0"
            data-testid="nav-logo"
          >
            <span className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="hidden sm:inline text-sm md:text-base">OkaySet</span>
          </button>
          <button
            onClick={() => navigate('/planner-auth')}
            className="h-9 md:h-11 px-2.5 md:px-5 rounded-full font-bold text-xs md:text-base text-primary hover:bg-primary/5 transition flex-shrink-0"
            data-testid="nav-plan-event"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" strokeWidth={2.5} />
              <span className="sm:hidden">Plan</span>
              <span className="hidden sm:inline">Plan event</span>
            </span>
          </button>
          <button
            onClick={() => navigate('/vendor-auth')}
            className="h-9 md:h-11 px-2.5 md:px-5 rounded-full font-bold text-xs md:text-base text-primary hover:bg-primary/5 transition flex-shrink-0"
            data-testid="nav-list-business"
          >
            <span className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" strokeWidth={2.5} />
              <span className="hidden sm:inline">List business</span>
              <span className="sm:hidden">List</span>
            </span>
          </button>
          <button
            onClick={() => navigate('/admin-auth')}
            className="h-9 md:h-11 px-3 md:px-5 rounded-full font-bold text-xs md:text-base bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1.5 flex-shrink-0"
            data-testid="nav-login"
          >
            Login <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section className="px-6 md:px-12 pt-16 md:pt-24 pb-8 md:pb-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.05] text-primary">
            <span className="block">
              Finding your next{' '}
              <Pill icon={Calendar} variant="surface">event</Pill>
            </span>
            <span className="block mt-2 md:mt-3 text-primary/50 font-bold">
              should be as easy as
            </span>
            <span className="block mt-2 md:mt-3">
              using a <Pill icon={MapIcon} variant="secondary">map</Pill>
            </span>
          </h1>

          <p className="mt-8 md:mt-10 text-lg md:text-xl text-primary max-w-2xl mx-auto leading-relaxed">
            A simple platform to discover local event service providers. Vendors list themselves. Planners find them by location. No middlemen.
          </p>

          {/* Primary CTAs — keep both roles front and centre */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/planner-auth')}
              className="h-14 px-8 rounded-full font-bold text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-transform active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
              data-testid="hero-planner-btn"
            >
              <Search className="w-5 h-5" strokeWidth={2.5} />
              Find vendors
            </button>
            <button
              onClick={() => navigate('/vendor-auth')}
              className="h-14 px-8 rounded-full font-bold text-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border-2 border-primary transition-transform active:scale-95 flex items-center gap-2 w-full sm:w-auto justify-center"
              data-testid="hero-vendor-btn"
            >
              <Store className="w-5 h-5" strokeWidth={2.5} />
              List your business
            </button>
          </div>
        </div>
      </section>

      {/* ===== Map preview card ===== */}
      <section className="px-4 sm:px-6 md:px-12 pb-12 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative rounded-2xl md:rounded-3xl border-2 border-border shadow-hard overflow-hidden h-[400px] md:h-[540px]"
            style={{ backgroundColor: '#f0ebe0' }}
          >
            {/* === Kochi / Ernakulam-inspired map — canal through the city === */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1200 540"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden
            >
              {/* ── City blocks: 3 rows (above canal, below canal) ── */}
              <rect x="0"    y="0"   width="258"  height="90"  fill="#e8e4da" />
              <rect x="304"  y="0"   width="198"  height="90"  fill="#e8e4da" />
              <rect x="558"  y="0"   width="184"  height="90"  fill="#e8e4da" />
              <rect x="798"  y="0"   width="196"  height="90"  fill="#e8e4da" />
              <rect x="1050" y="0"   width="150"  height="90"  fill="#e8e4da" />

              <rect x="0"    y="138" width="258"  height="192" fill="#e8e4da" />
              <rect x="304"  y="138" width="198"  height="192" fill="#e8e4da" />
              <rect x="558"  y="138" width="184"  height="192" fill="#e8e4da" />
              <rect x="798"  y="138" width="196"  height="192" fill="#e8e4da" />
              <rect x="1050" y="138" width="150"  height="192" fill="#e8e4da" />

              <rect x="0"    y="424" width="258"  height="116" fill="#e8e4da" />
              <rect x="304"  y="424" width="198"  height="116" fill="#e8e4da" />
              <rect x="558"  y="424" width="184"  height="116" fill="#e8e4da" />
              <rect x="798"  y="424" width="196"  height="116" fill="#e8e4da" />
              <rect x="1050" y="424" width="150"  height="116" fill="#e8e4da" />

              {/* ── Park: pinned to upper-right block, anchored to roads ── */}
              <rect x="804" y="6" width="184" height="78" rx="8" fill="#c0d888" fillOpacity="0.78" />
              <circle cx="832" cy="26" r="11" fill="#8eb848" fillOpacity="0.72" />
              <circle cx="862" cy="20" r="13" fill="#7ea838" fillOpacity="0.66" />
              <circle cx="896" cy="28" r="10" fill="#8eb848" fillOpacity="0.72" />
              <circle cx="928" cy="20" r="12" fill="#7ea838" fillOpacity="0.66" />
              <circle cx="958" cy="28" r="9"  fill="#8eb848" fillOpacity="0.72" />
              <circle cx="840" cy="60" r="12" fill="#7ea838" fillOpacity="0.66" />
              <circle cx="874" cy="66" r="10" fill="#8eb848" fillOpacity="0.72" />
              <circle cx="910" cy="59" r="13" fill="#7ea838" fillOpacity="0.66" />
              <circle cx="946" cy="65" r="9"  fill="#8eb848" fillOpacity="0.72" />

              {/* ── Kochi canal — runs horizontally through the city ── */}
              {/* Main canal body, gentle natural meander */}
              <path
                d="M-20 374
                   C100 368, 240 378, 390 372
                   C540 366, 680 376, 830 370
                   C960 365, 1100 374, 1220 370
                   L1220 416
                   C1100 420, 960 410, 830 416
                   C680 422, 540 412, 390 418
                   C240 424, 100 414, -20 420 Z"
                fill="#a8c6e0"
              />
              {/* Lighter centre band — gives the water some depth */}
              <path
                d="M-20 386
                   C100 382, 240 388, 390 384
                   C540 380, 680 386, 830 382
                   C960 379, 1100 384, 1220 382
                   L1220 404
                   C1100 402, 960 396, 830 400
                   C680 404, 540 398, 390 402
                   C240 406, 100 400, -20 404 Z"
                fill="#c2d9f0"
                fillOpacity="0.5"
              />
              {/* Subtle ripple marks */}
              <g fill="none" stroke="#90b4d0" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4">
                <path d="M60 391 C180 387, 300 393, 420 389" />
                <path d="M480 391 C600 387, 720 393, 840 389" />
                <path d="M900 391 C1020 387, 1120 393, 1200 389" />
              </g>

              {/* ── Roads ── */}
              <g fill="none" stroke="#c4bdb0" strokeLinecap="round">
                {/* N-S majors */}
                <line x1="260"  y1="-20" x2="260"  y2="560" strokeWidth="10" />
                <line x1="500"  y1="-20" x2="500"  y2="560" strokeWidth="10" />
                <line x1="746"  y1="-20" x2="746"  y2="560" strokeWidth="9"  />
                <line x1="998"  y1="-20" x2="998"  y2="560" strokeWidth="8"  />
                {/* E-W majors above canal */}
                <line x1="-20"  y1="90"  x2="1220" y2="90"  strokeWidth="10" />
                <line x1="-20"  y1="330" x2="1220" y2="330" strokeWidth="10" />
                <line x1="-20"  y1="212" x2="1220" y2="212" strokeWidth="7"  />
                {/* Canal-bank roads — give the waterway its "road on both sides" Kerala feel */}
                <line x1="-20"  y1="364" x2="1220" y2="364" strokeWidth="7"  />
                <line x1="-20"  y1="424" x2="1220" y2="424" strokeWidth="6"  />
              </g>
              {/* Centre dashes */}
              <g fill="none" stroke="white" strokeDasharray="14 10" strokeOpacity="0.42" strokeWidth="1.5" strokeLinecap="round">
                <line x1="260"  y1="-20" x2="260"  y2="560" />
                <line x1="500"  y1="-20" x2="500"  y2="560" />
                <line x1="-20"  y1="90"  x2="1220" y2="90"  />
                <line x1="-20"  y1="330" x2="1220" y2="330" />
              </g>
              {/* Minor roads */}
              <g fill="none" stroke="#d0c9b8" strokeLinecap="round" strokeWidth="4">
                <line x1="-20"  y1="44"  x2="260"  y2="44"  />
                <line x1="260"  y1="168" x2="500"  y2="168" />
                <line x1="500"  y1="168" x2="746"  y2="168" />
                <line x1="746"  y1="168" x2="998"  y2="168" />
                <line x1="128"  y1="90"  x2="128"  y2="330" />
                <line x1="622"  y1="90"  x2="622"  y2="330" />
                <line x1="870"  y1="90"  x2="870"  y2="330" />
                {/* Below canal */}
                <line x1="-20"  y1="480" x2="500"  y2="480" />
                <line x1="500"  y1="480" x2="998"  y2="480" />
              </g>

              {/* ── Dashed connection lines from beacon (600,270) to each vendor ── */}
              {/*
                  Foodlink      → left-[11%] top-[20%]  ≈ SVG (132, 108)
                  Leela Palace  → left-[35%] top-[ 6%]  ≈ SVG (420, 32)
                  Frame Studio  → left-[18%] top-[48%]  ≈ SVG (216, 259)
                  Blossom Decor → right-[5%] top-[44%]  ≈ SVG (886, 238)
              */}
              <g fill="none" stroke="#001F3F" strokeDasharray="10 7" strokeOpacity="0.13" strokeLinecap="round" strokeWidth="2">
                <line x1="600" y1="270" x2="132" y2="108" />
                <line x1="600" y1="270" x2="420" y2="32"  />
                <line x1="600" y1="270" x2="216" y2="259" />
                <line x1="600" y1="270" x2="886" y2="238" />
              </g>
              {/* Vendor pin dots */}
              <g strokeWidth="3">
                <circle cx="132" cy="108" r="6" fill="#FFDC00" stroke="#001F3F" />
                <circle cx="420" cy="32"  r="6" fill="#FFDC00" stroke="#001F3F" />
                <circle cx="216" cy="259" r="6" fill="#FFDC00" stroke="#001F3F" />
                <circle cx="886" cy="238" r="6" fill="#FFDC00" stroke="#001F3F" />
              </g>
            </svg>

            {/* Radius rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 md:w-80 md:h-80 rounded-full border border-primary/[0.08]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-48 md:h-48 rounded-full border border-primary/[0.1] bg-primary/[0.015]" />

            {/* ── Vendor pills — organic layout, breaking the four-corner rectangle ── */}
            {/* Foodlink: upper-left */}
            <VendorPill
              name="Foodlink" category="Catering" icon={Utensils} distance="0.4 km"
              className="top-[22%] left-[3%] md:top-[22%] md:left-[14%]"
            />
            {/* Leela Palace: top-centre (breaks the rectangle) */}
            <VendorPill
              name="Leela Palace" category="Venue" icon={MapPin} distance="0.9 km"
              className="top-[14%] right-[3%] md:top-[8%] md:right-auto md:left-[36%]"
            />
            {/* Frame Studio: left, mid-height (above the canal) */}
            <VendorPill
              name="Frame Studio" category="Photography" icon={Camera} distance="1.1 km"
              className="top-[55%] left-[3%] md:top-[50%] md:left-[20%]"
            />
            {/* Blossom Decor: right, mid-height (not a corner) */}
            <VendorPill
              name="Blossom Decor" category="Decor" icon={Sparkles} distance="0.7 km"
              className="hidden sm:flex sm:top-[55%] sm:right-[3%] md:top-[46%] md:right-[5%]"
            />

            {/* Center beacon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="absolute w-11 h-11 rounded-full bg-secondary/35 animate-ping" />
              <div className="absolute w-6  h-6  rounded-full bg-secondary/25 animate-ping" style={{ animationDelay: '0.4s' }} />
              <div className="w-4 h-4 bg-secondary rounded-full border-[3px] border-primary shadow-hard" />
            </div>

            {/* Top HUD */}
            <div className="absolute top-0 left-0 right-0 p-2.5 md:p-4 flex items-center gap-1.5 md:gap-2">
              <div className="bg-surface/95 border-2 border-border rounded-full px-2.5 py-1.5 flex items-center gap-1.5 shadow-hard flex-shrink-0">
                <MapPin className="w-3 h-3 text-primary flex-shrink-0" strokeWidth={2.5} />
                <span className="text-[11px] md:text-xs font-bold text-primary">Ernakulam</span>
              </div>
              <div className="flex gap-1">
                {['All', 'Venue', 'Catering'].map((label, i) => (
                  <span
                    key={label}
                    className={`text-[10px] md:text-[11px] font-bold px-2 md:px-2.5 py-1.5 rounded-full border-2 ${
                      i === 0
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-surface/85 border-border text-primary/60'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="ml-auto bg-surface/95 border-2 border-border rounded-full px-2.5 py-1.5 shadow-hard flex items-center gap-1.5 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                <span className="text-[10px] md:text-xs font-bold text-primary">4 nearby</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Feature 1: X marks the spot ===== */}
      <section className="px-6 md:px-12 py-16 md:py-24 bg-surface border-y-2 border-border">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight">
              Nearby, <span className="text-primary/40">by design.</span>
            </h2>
            <p className="mt-6 text-lg text-primary leading-relaxed max-w-xl">
              Your next caterer probably works two blocks away. The florist you'd love to hire is three streets over. We put them on a map, so the people closest to your event stop being invisible.
            </p>
          </div>
          {/* Visual: stacked vendor pills on an abstract map */}
          <div className="relative h-80 md:h-96 rounded-3xl border-2 border-border shadow-hard bg-background overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
            <VendorPill name="Foodlink" category="Catering" icon={Utensils} className="top-8 left-6" />
            <VendorPill name="Mumbai Caterers" category="Catering" icon={Utensils} className="top-24 right-6" />
            <VendorPill name="Frame Studio" category="Photography" icon={Camera} className="top-44 left-10" />
            <VendorPill name="Leela" category="Venue" icon={MapPin} className="bottom-20 right-8" />
            <VendorPill name="Blossom Decor" category="Decor" icon={Sparkles} className="bottom-6 left-16" />
          </div>
        </div>
      </section>

      {/* ===== Feature 2: Filter signal from noise ===== */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Visual FIRST on desktop */}
          <div className="order-2 md:order-1 relative h-80 md:h-96 rounded-3xl border-2 border-border shadow-hard bg-surface p-6 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" strokeWidth={2.5} />
              <span className="text-sm font-black text-primary uppercase tracking-wide">Filters</span>
            </div>
            <div className="space-y-2">
              {[
                { name: 'Venue', count: 48, active: true },
                { name: 'Catering', count: 32, active: false },
                { name: 'Photography', count: 27, active: true },
                { name: 'Decor', count: 19, active: false },
                { name: 'Makeup', count: 14, active: false },
                { name: 'Jewellery', count: 9, active: false },
              ].map((f) => (
                <div
                  key={f.name}
                  className={`flex items-center justify-between rounded-lg border-2 px-4 py-2.5 ${
                    f.active ? 'bg-secondary/30 border-primary' : 'bg-background border-border'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`w-4 h-4 rounded border-2 border-primary flex items-center justify-center ${
                        f.active ? 'bg-primary' : 'bg-surface'
                      }`}
                    >
                      {f.active && <ThumbsUp className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />}
                    </span>
                    <span className="font-bold text-primary">{f.name}</span>
                  </span>
                  <span className="text-sm text-primary/70 font-mono">{f.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight">
              Ten checkboxes. <span className="text-primary/40">Zero clutter.</span>
            </h2>
            <p className="mt-6 text-lg text-primary leading-relaxed max-w-xl">
              Pick the services you actually care about — venues, caterers, decor, makeup, rentals — and the map quietly fades the rest. No infinite scroll, no filter roulette. Just what you asked for.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Testimonial chat bubble ===== */}
      <section className="px-6 md:px-12 py-16 md:py-24 bg-surface border-y-2 border-border">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* emoji reactions */}
            <div className="absolute -top-8 left-6 flex items-center gap-1 bg-surface border-2 border-border rounded-full px-3 py-1 shadow-hard text-lg">
              <span>👍</span><span>👏</span><span>❤️</span><span>🔥</span>
            </div>
            <div className="bg-secondary text-primary border-2 border-primary rounded-[32px] rounded-bl-lg p-6 md:p-8 shadow-hard">
              <p className="text-lg md:text-2xl font-medium italic leading-relaxed">
                "I found three decorators and a caterer near my venue in one afternoon. Usually takes me a week of phone calls and Instagram DMs. This just... worked."
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-primary/70 font-mono">
                <span>✓✓ Read</span><span>·</span><span>5:52 PM</span>
              </div>
            </div>
            <div className="mt-5 ml-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full border-2 border-border flex items-center justify-center text-primary-foreground font-black text-lg">
                S
              </div>
              <div>
                <p className="font-bold text-primary">Sandra T.</p>
                <p className="text-sm text-primary/70">Wedding Planner, Bengaluru</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Role Selection (existing cards, preserved text & testids) ===== */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-primary mb-3 text-center">
            Ready to start?
          </h2>
          <p className="text-lg text-primary/70 mb-12 text-center">
            What your event needs, right here.
          </p>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div
              className="bg-surface border-2 border-border rounded-2xl p-6 md:p-8 shadow-hard hover:translate-y-[-4px] hover:shadow-hard-hover transition-all cursor-pointer"
              onClick={() => navigate('/planner-auth')}
              data-testid="planner-card"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary">Planning an Event</h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-primary mb-6">
                Search for venues, caterers, photographers, and more on an interactive map. Find services near your event location.
              </p>
              <button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-full font-bold text-lg transition-transform active:scale-95 focus:ring-4 focus:ring-secondary"
                data-testid="get-started-planner-btn"
              >
                Get Started
              </button>
            </div>

            <div
              className="bg-surface border-2 border-border rounded-2xl p-6 md:p-8 shadow-hard hover:translate-y-[-4px] hover:shadow-hard-hover transition-all cursor-pointer"
              onClick={() => navigate('/vendor-auth')}
              data-testid="vendor-card"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center border-2 border-primary">
                  <Store className="w-8 h-8 text-secondary-foreground" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-primary">Provide Services</h3>
              </div>
              <p className="text-base md:text-lg leading-relaxed text-primary mb-6">
                List your event service business for free. Pin your location on the map. Get discovered by local event planners.
              </p>
              <button
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 h-12 px-8 rounded-full font-bold text-lg border-2 border-primary transition-transform active:scale-95 focus:ring-4 focus:ring-primary"
                data-testid="get-started-vendor-btn"
              >
                List Your Business
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/admin-auth')}
              className="text-primary hover:text-primary/80 font-medium text-base underline"
              data-testid="admin-login-link"
            >
              Admin Login
            </button>
          </div>
        </div>
      </section>

      {/* ===== How It Works (preserved) ===== */}
      <section className="px-6 md:px-12 py-12 md:py-16 bg-surface border-t-2 border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-8 md:mb-12 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: 1, t: 'Search Location', p: 'Enter your event location or drop a pin on the map' },
              { n: 2, t: 'Browse Services', p: 'See nearby vendors on the map. Filter by service type' },
              { n: 3, t: 'Contact Directly', p: 'Get vendor contact details and reach out on your own terms' },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-hard ring-4 ring-surface ring-offset-2 ring-offset-surface">
                  <span className="text-3xl font-black text-primary-foreground">{s.n}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-primary mb-3">{s.t}</h3>
                <p className="text-base md:text-lg leading-relaxed text-primary">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Footer (preserved) ===== */}
      <footer className="px-6 md:px-12 py-8 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-base md:text-lg">
            A platform for discovery. No bookings. No payments. No reviews.
          </p>
        </div>
      </footer>
    </div>
  );
}

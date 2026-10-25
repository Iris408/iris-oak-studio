import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sliders, 
  Sun, 
  Moon, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Code, 
  Layout, 
  Server, 
  ChevronRight, 
  X, 
  Send, 
  Copy, 
  Check, 
  Maximize2, 
  RefreshCw, 
  HelpCircle,
  Clock,
  Briefcase,
  Terminal,
  Activity,
  DollarSign
} from 'lucide-react';

// --- PALETTES & THEMES ---
const COLOR_THEMES = {
  monochrome: {
    name: 'Monochrome Dark',
    bg: 'bg-zinc-950',
    text: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    cardBg: 'bg-zinc-900/60',
    border: 'border-zinc-800',
    accent: 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200',
    accentBorder: 'border-zinc-700',
    badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    highlight: 'text-white',
    highContrast: { textMuted: 'text-zinc-200', border: 'border-zinc-400' }
  },
  swiss: {
    name: 'Modern Swiss',
    bg: 'bg-stone-100',
    text: 'text-stone-900',
    textMuted: 'text-stone-600',
    cardBg: 'bg-white/80',
    border: 'border-stone-200',
    accent: 'bg-red-600 text-white hover:bg-red-700',
    accentBorder: 'border-red-500',
    badge: 'bg-stone-200/80 text-stone-800 border-stone-300',
    highlight: 'text-red-600',
    highContrast: { textMuted: 'text-stone-900', border: 'border-stone-600' }
  },
  cobalt: {
    name: 'Midnight Cobalt',
    bg: 'bg-slate-950',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    cardBg: 'bg-slate-900/80',
    border: 'border-slate-800',
    accent: 'bg-indigo-500 text-white hover:bg-indigo-600',
    accentBorder: 'border-indigo-400',
    badge: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80',
    highlight: 'text-indigo-400',
    highContrast: { textMuted: 'text-slate-200', border: 'border-slate-400' }
  },
  editorial: {
    name: 'Warm Editorial',
    bg: 'bg-[#FAF8F5]',
    text: 'text-[#1A1A1A]',
    textMuted: 'text-[#66605A]',
    cardBg: 'bg-[#F2EFE9]',
    border: 'border-[#E2DDD5]',
    accent: 'bg-[#2A2A2A] text-[#FAF8F5] hover:bg-[#404040]',
    accentBorder: 'border-[#B5AFA4]',
    badge: 'bg-[#E5E0D6] text-[#33302C] border-[#D1CABF]',
    highlight: 'text-[#8C4A2B]',
    highContrast: { textMuted: 'text-[#1A1A1A]', border: 'border-[#66605A]' }
  }
};

// `available: false` disables the option until its font files are added.
const TYPOGRAPHY_STYLES = {
  sans: { name: 'Modern Sans', label: 'Sans', class: 'font-sans', available: true },
  serif: { name: 'Editorial Serif', label: 'Serif', class: 'font-serif', available: true },
  mono: { name: 'Technical Mono', label: 'Mono', class: 'font-mono', available: true },
  dyslexic: { name: 'OpenDyslexic', label: 'OpenDyslexic', class: 'font-dyslexic', available: true }
};

// Applied to the root <html> font size so every rem-based utility scales.
const TEXT_SIZES = {
  small: { label: 'Small', value: '87.5%' },
  default: { label: 'Default', value: '100%' },
  large: { label: 'Large', value: '112.5%' }
};

// Hero orbit: ellipse centred at (360, 260), rx 300, ry 140, tilted 28°, in a 720×520 stage.
const ORBIT_PATH = 'M 95.1 119.2 A 300 140 28 1 1 624.9 400.8 A 300 140 28 1 1 95.1 119.2';

const FOCUS_RING = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400';

// --- CONFIGURATOR PERSISTENCE ---
const SETTINGS_STORAGE_KEY = 'studio-configurator-settings';

const DEFAULT_SETTINGS = {
  themeKey: 'monochrome',
  typographyKey: 'sans',
  textSize: 'default',
  highContrast: false
};

// Returns saved settings, falling back to defaults for any missing or invalid value.
const loadSettings = () => {
  let saved = {};
  try {
    saved = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY)) || {};
  } catch {
    return DEFAULT_SETTINGS;
  }
  if (typeof saved !== 'object' || Array.isArray(saved)) return DEFAULT_SETTINGS;

  const has = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  return {
    themeKey: has(COLOR_THEMES, saved.themeKey) ? saved.themeKey : DEFAULT_SETTINGS.themeKey,
    typographyKey: has(TYPOGRAPHY_STYLES, saved.typographyKey) && TYPOGRAPHY_STYLES[saved.typographyKey].available
      ? saved.typographyKey
      : DEFAULT_SETTINGS.typographyKey,
    textSize: has(TEXT_SIZES, saved.textSize) ? saved.textSize : DEFAULT_SETTINGS.textSize,
    highContrast: typeof saved.highContrast === 'boolean' ? saved.highContrast : DEFAULT_SETTINGS.highContrast
  };
};

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// --- INITIAL SAMPLE DATA ---
const SAMPLE_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Aura Health & Performance App',
    client: 'Aura Systems Inc.',
    category: 'Web Dev',
    summary: 'Custom Next.js web portal and high-frequency data analytics dashboard for high-performance athletic training.',
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'GraphQL', 'Tailwind CSS'],
    stats: { performance: '99/100', loadTime: '0.4s', conversion: '+34%' },
    deliverables: ['Custom Web Platform', 'Design System', 'API Gateway Integrations', 'Site Maintenance Plan'],
    description: 'We built a streamlined, zero-latency dashboard interface designed to visualize heavy telemetry data in real-time. Paired with a headless CMS backend for immediate content updates.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'proj-2',
    title: 'Verve Spatial Architecture Studio',
    client: 'Verve Atelier',
    category: 'Systems',
    summary: 'Monochrome minimalist visual identity, dynamic Webflow page build, and headless portfolio gallery.',
    tags: ['Brand Identity', 'UX Engineering', 'Three.js', 'Webflow'],
    stats: { performance: '100/100', loadTime: '0.3s', engagement: '+52%' },
    deliverables: ['Brand Guidelines', 'Component Library', 'WebGL Showcase', 'Continuous Monthly Maintenance'],
    description: 'A quiet, high-contrast digital space designed to let architectural imagery command full focus. Built with subtle spatial transitions and smooth micro-interactions.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'proj-3',
    title: 'Chronos Continuous Care Platform',
    client: 'Chronos Digital',
    category: 'Care Retainers',
    summary: 'Ongoing site care, security hardening, automated performance tuning, and feature expansion retainer for SaaS client.',
    tags: ['Site Maintenance', 'CI/CD Pipelines', 'Sentry Monitoring', 'Stripe Billing'],
    stats: { uptime: '99.99%', issueResolution: '< 2 hrs', securityScore: 'A+' },
    deliverables: ['Weekly Backups & Audit', 'Feature Sprints', 'Core Web Vitals Guarantee', '24/7 Monitoring'],
    description: 'An all-inclusive care subscription ensuring the client website maintains peak security, SEO health, and lightning-fast loading speeds week after week.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'proj-4',
    title: 'Kinetix E-Commerce Experience',
    client: 'Kinetix Labs',
    category: 'Product Build',
    summary: 'Headless Shopify ecommerce experience with custom product configurator and frictionless checkout flow.',
    tags: ['Shopify Plus', 'React', 'Tailwind', 'Sanity CMS'],
    stats: { revenueGrowth: '+48%', cartAbandonment: '-18%', mobileSpeed: '98/100' },
    deliverables: ['Headless Frontend', '3D Configurator', 'Custom Checkout', 'Monthly Care Agreement'],
    description: 'Designed and developed to elevate premium hardware sales with immersive 360-degree product previews and an intuitive checkout path.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80'
  }
];

const CARE_PLANS = [
  {
    id: 'site-check-up',
    name: 'Site Check-up',
    category: 'One-off review',
    tagline: 'A clear review of your website, with practical next steps.',
    price: '£149',
    period: 'one-off',
    features: [
      'Review of up to five key pages',
      'Check mobile layout, links and forms',
      'Review visible performance and accessibility issues',
      'Prioritised findings and practical recommendations',
      'Report normally within five working days'
    ],
    note: 'If you start an annual care plan within 14 days, the £149 check-up fee is credited toward it.',
    popular: false,
    type: 'one-off'
  },
  {
    id: 'tier-core',
    name: 'Core',
    category: 'Ongoing website care',
    tagline: 'Routine maintenance for custom-built and WordPress websites.',
    price: '£59',
    annualPrice: '£590',
    annualMonthlyPrice: '£49.17',
    annualSaving: '£118',
    period: 'per month',
    features: [
      'Monthly platform, theme and plugin or dependency update review',
      'Backup check',
      'Basic security and uptime checks',
      'Key pages and forms tested after updates',
      'Short monthly care summary',
      'Email support, reply within two working days'
    ],
    note: 'Included tasks are agreed for your site before care begins.',
    popular: false,
    type: 'monthly'
  },
  {
    id: 'tier-growth',
    name: 'Growth',
    category: 'Ongoing website care',
    tagline: 'More hands-on support for sites needing regular attention.',
    price: '£119',
    annualPrice: '£1,190',
    annualMonthlyPrice: '£99.17',
    annualSaving: '£238',
    period: 'per month',
    features: [
      'Everything in Core Care',
      'Up to one hour of small, agreed site or content updates each month',
      'Performance checks and reasonable fixes within the included hour',
      'Priority email support, reply within one working day'
    ],
    note: 'Larger changes and new features are scoped and quoted separately.',
    popular: true,
    type: 'monthly'
  },
  {
    id: 'tier-priority',
    name: 'Priority',
    category: 'Ongoing website care',
    tagline: 'More time for regular updates and ongoing site improvements.',
    price: '£229',
    annualPrice: '£2,290',
    annualMonthlyPrice: '£190.83',
    annualSaving: '£458',
    period: 'per month',
    features: [
      'Everything in Growth Care',
      'Up to three hours of agreed site updates or maintenance work each month',
      'Quarterly review of site needs and recommended next steps',
      'Priority email support, reply within one working day'
    ],
    note: 'Larger changes and new features are scoped and quoted separately.',
    popular: false,
    type: 'monthly'
  }
];

const TECH_STACK = [
  { name: 'Next.js 15', role: 'Fullstack Framework', category: 'Engineering' },
  { name: 'Astro', role: 'Ultra-Fast Static Sites', category: 'Engineering' },
  { name: 'Tailwind CSS', role: 'Utility-First Styling', category: 'Design & Code' },
  { name: 'Framer Motion', role: 'Micro-Interactions & Motion', category: 'Design & Code' },
  { name: 'Sanity / Dato CMS', role: 'Headless Content Architecture', category: 'CMS' },
  { name: 'Stripe & Lemonsqueezy', role: 'Payments & Subscriptions', category: 'Infrastructure' },
  { name: 'Vercel / Cloudflare', role: 'Edge Deployment & CDN', category: 'Infrastructure' },
  { name: 'Figma', role: 'Systemic UI/UX Design', category: 'Design' }
];

export default function App() {
  // Configurator state (restored from localStorage; drawer state is not persisted)
  const [initialSettings] = useState(loadSettings);
  const [themeKey, setThemeKey] = useState(initialSettings.themeKey);
  const [typographyKey, setTypographyKey] = useState(initialSettings.typographyKey);
  const [textSize, setTextSize] = useState(initialSettings.textSize);
  const [highContrast, setHighContrast] = useState(initialSettings.highContrast);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const configButtonRef = useRef(null);
  const drawerRef = useRef(null);

  // Studio Details
  const studioName = 'IRIS & OAK / STUDIO';
  const studioTagline = 'We design and build high-precision websites and platforms, and provide ongoing care so you can scale with confidence.';
  const [studioStatus, setStudioStatus] = useState('Available for Q4/Q1 Sprints & Care Retainers');

  // Filtering state
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'blueprint'
  
  // Estimator Form State
  const [estimatorStep, setEstimatorStep] = useState(1);
  const [projectScope, setProjectScope] = useState([]);
  const [budgetRange, setBudgetRange] = useState('$5k - $10k');
  const [timeline, setTimeline] = useState('4-6 Weeks');
  const [retainerInterest, setRetainerInterest] = useState('Growth Care ($1.85k/mo)');
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'annual'
  const [clientDetails, setClientDetails] = useState({ name: '', email: '', company: '', details: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  const activeTheme = highContrast
    ? { ...COLOR_THEMES[themeKey], ...COLOR_THEMES[themeKey].highContrast }
    : COLOR_THEMES[themeKey];
  const activeFont = TYPOGRAPHY_STYLES[typographyKey];

  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SIZES[textSize].value;
  }, [textSize]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify({ themeKey, typographyKey, textSize, highContrast })
      );
    } catch {
      // Storage unavailable (private mode, blocked site data): settings last for this visit only.
    }
  }, [themeKey, typographyKey, textSize, highContrast]);

  // Drawer keyboard handling: focus moves in on open, Escape closes, Tab stays inside,
  // and focus returns to the opener on close.
  useEffect(() => {
    if (!isDrawerOpen) return;

    const getFocusable = () => Array.from(drawerRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []);
    getFocusable()[0]?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsDrawerOpen(false);
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const insideDrawer = drawerRef.current.contains(document.activeElement);

      if (e.shiftKey && (document.activeElement === first || !insideDrawer)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !insideDrawer)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const opener = configButtonRef.current;
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      opener?.focus();
    };
  }, [isDrawerOpen]);

  // Calculated estimates based on user selections
  const estimatedTotal = useMemo(() => {
    let base = 0;
    if (projectScope.includes('Design')) base += 3500;
    if (projectScope.includes('Development')) base += 4500;
    if (projectScope.includes('Brand System')) base += 2500;
    if (projectScope.includes('Maintenance Strategy')) base += 1200;

    let multiplier = 1;
    if (budgetRange === '< $5k') multiplier = 0.8;
    if (budgetRange === '$10k - $20k') multiplier = 1.3;
    if (budgetRange === '$20k+') multiplier = 1.8;

    return Math.round(base * multiplier);
  }, [projectScope, budgetRange]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return SAMPLE_PROJECTS;
    return SAMPLE_PROJECTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const toggleScopeOption = (option) => {
    setProjectScope(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const generateBriefText = () => {
    return `--- STUDIO INQUIRY BRIEF ---
Studio Target: ${studioName}
Client: ${clientDetails.name} (${clientDetails.email})
Company: ${clientDetails.company || 'N/A'}
Scope Required: ${projectScope.join(', ') || 'Not specified'}
Selected Budget Range: ${budgetRange}
Target Timeline: ${timeline}
Care/Maintenance Retainer: ${retainerInterest}
Estimated Value: ~$${estimatedTotal.toLocaleString()}

Project Description:
${clientDetails.details || 'No additional details provided.'}
----------------------------`;
  };

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(generateBriefText());
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2000);
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} ${activeTheme.text} ${activeFont.class} transition-colors duration-300 relative selection:bg-zinc-700 selection:text-white`}>
      
      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${activeTheme.border} ${activeTheme.bg}/80 transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <a href="/" className="font-bold tracking-wider text-sm uppercase">
                {studioName}
              </a>
            <span className={`hidden md:inline-block text-xs px-2 py-0.5 rounded border ${activeTheme.badge}`}>
              Digital Studio
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide uppercase">
            <a href="#portfolio" className="hover:opacity-70 transition-opacity">Portfolio</a>
            <a href="#services" className="hover:opacity-70 transition-opacity">Studio Offerings</a>
            <a href="#engineering" className="hover:opacity-70 transition-opacity">Engineering</a>
            <a href="#estimator" className="hover:opacity-70 transition-opacity">Estimator</a>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              ref={configButtonRef}
              aria-haspopup="dialog"
              aria-expanded={isDrawerOpen}
              onClick={() => setIsDrawerOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded border transition-all ${activeTheme.accentBorder} ${activeTheme.cardBg} hover:opacity-90`}
            >
              <Sliders size={14} />
              <span className="hidden sm:inline">Studio Configurator</span>
            </button>
            
            <a
              href="#estimator"
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${activeTheme.accent}`}
            >
              Enquire
            </a>
          </div>
        </div>
      </header>

      {/* DYNAMIC STUDIO HER0 SECTION */}
      <section className="relative isolate pt-20 pb-16 md:pt-32 md:pb-24 border-b border-dashed border-zinc-800/40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Decorative slow-orbit background (behind content, non-interactive, static with reduced motion) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none select-none absolute inset-0 -z-10 overflow-hidden ${activeTheme.highlight}`}
        >
          {/* Fixed 720×520 stage (matches ORBIT_PATH coordinates), scaled down on smaller screens */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[720px] h-[520px] origin-right scale-[0.55] sm:scale-75 lg:scale-100 opacity-70 md:opacity-100">
            {/* Soft colour haze around the sphere and along the orbit */}
            <div className="absolute left-[380px] top-[93px] w-[260px] h-[260px] rounded-full bg-current opacity-20 blur-3xl animate-orbit-glow motion-reduce:animate-none" />
            <div className="absolute left-[160px] top-[150px] w-[420px] h-[224px] rounded-full bg-current opacity-[0.07] blur-3xl rotate-[28deg]" />

            <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 720 520" fill="none">
              <defs>
                <linearGradient id="hero-orbit-stroke" gradientUnits="userSpaceOnUse" x1="95" y1="119" x2="625" y2="401">
                  <stop offset="0" stopColor="currentColor" stopOpacity="0.15" />
                  <stop offset="0.45" stopColor="currentColor" stopOpacity="0.55" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.9" />
                </linearGradient>
                <radialGradient id="hero-orbit-sphere" cx="0.35" cy="0.3" r="0.75">
                  <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
                  <stop offset="0.35" stopColor="currentColor" stopOpacity="0.08" />
                  <stop offset="0.85" stopColor="currentColor" stopOpacity="0.18" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
                </radialGradient>
                <filter id="hero-orbit-blur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" />
                </filter>
              </defs>

              {/* Orbit line with a soft glow underneath */}
              <path d={ORBIT_PATH} stroke="currentColor" strokeOpacity="0.35" strokeWidth="4" filter="url(#hero-orbit-blur)" />
              <path d={ORBIT_PATH} stroke="url(#hero-orbit-stroke)" strokeWidth="1.25" />

              {/* Glass sphere sitting on the orbit */}
              <circle cx="549" cy="223" r="48" fill="url(#hero-orbit-sphere)" />
              <circle cx="549" cy="223" r="48" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
              <ellipse cx="533" cy="203" rx="14" ry="8" fill="#ffffff" fillOpacity="0.35" transform="rotate(-30 533 203)" />

              {/* Direction arrows */}
              <g stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 600 120 Q 650 130 672 178" />
                <path d="M 662.3 171.4 L 672 178 L 673.3 166.4" />
                <path d="M 360 360 Q 315 352 296 320" />
                <path d="M 306.3 325.5 L 296 320 L 296 331.7" />
              </g>
            </svg>

            {/* Dots travelling along the orbit (fixed positions when motion is reduced) */}
            {[
              { size: 'w-2 h-2', delay: '0s', rest: '12%' },
              { size: 'w-1.5 h-1.5', delay: '-30s', rest: '58%' },
              { size: 'w-1 h-1', delay: '-45s', rest: '80%' }
            ].map((dot) => (
              <span
                key={dot.rest}
                className={`absolute left-0 top-0 ${dot.size} rounded-full bg-current shadow-[0_0_10px_currentColor] animate-orbit-travel motion-reduce:animate-none`}
                style={{ offsetPath: `path('${ORBIT_PATH}')`, offsetRotate: '0deg', offsetDistance: dot.rest, animationDelay: dot.delay }}
              />
            ))}
          </div>
        </div>

        <div className="max-w-4xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border mb-6 backdrop-blur-sm opacity-90 border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Activity size={12} className="animate-spin text-emerald-400" />
            <span>{studioStatus}</span>
          </div>

          {/* Editable Studio Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-8">
            Websites & digital products built to last and grow.
          </h1>

          {/* Tagline */}
          <p className={`text-lg sm:text-xl max-w-2xl leading-relaxed mb-10 ${activeTheme.textMuted}`}>
            {studioTagline}
          </p>

          {/* Hero Action Buttons */}
          <div className="flex flex-wrap gap-4 items-center">
            <a
              href="#estimator"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-all shadow-sm ${activeTheme.accent}`}
            >
              <span>Build Project Brief</span>
              <ArrowUpRight size={16} />
            </a>
            <a
              href="#portfolio"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium border transition-all ${activeTheme.border} ${activeTheme.cardBg} hover:border-zinc-500`}
            >
              <span>Explore Portfolio</span>
              <ChevronRight size={16} />
            </a>
          </div>
        </div>

        {/* Minimal Metric Bar */}
        <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t ${activeTheme.border}`}>
          <div>
            <div className="text-2xl font-bold font-mono">1-3 Weeks</div>
            <div className={`text-xs ${activeTheme.textMuted}`}>Typical Delivery Time</div>
            <div className={`text-[10px] italic ${activeTheme.textMuted}`}>
              Larger projects may take longer.
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">2-4</div>
            <div className={`text-xs ${activeTheme.textMuted}`}>Instalment payment options</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">1 Person</div>
            <div className={`text-xs ${activeTheme.textMuted}`}>From first call to launch</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">6+ Platforms</div>
            <div className={`text-xs ${activeTheme.textMuted}`}>	Covered by Site Care</div>
          </div>
        </div>
      </section>

      {/* SECTION 1: SELECTED WORK & CASE STUDIES */}
      <section id="portfolio" className="scroll-mt-16 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Portfolio / Archive</div>
            <h2 className="text-3xl font-bold tracking-tight">Selected Studio Projects</h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Web Dev', 'Product Builds', 'Systems', 'Care Retainers'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded border transition-all ${
                  activeCategory === cat 
                    ? activeTheme.accent 
                    : `${activeTheme.cardBg} ${activeTheme.border} ${activeTheme.textMuted} hover:text-white`
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`group cursor-pointer rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${activeTheme.border} ${activeTheme.cardBg}`}
            >
              {/* Card Image */}
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-1 rounded border backdrop-blur-md ${activeTheme.badge}`}>
                    {project.category}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs uppercase tracking-widest font-mono text-white bg-black/70 px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                    Inspect Project Specs <Maximize2 size={12} />
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className={`text-xs font-mono mb-1 ${activeTheme.textMuted}`}>{project.client}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:underline flex items-center justify-between">
                  <span>{project.title}</span>
                  <ArrowUpRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${activeTheme.textMuted}`}>
                  {project.summary}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-zinc-800/30">
                  {project.tags.map((tag) => (
                    <span key={tag} className={`text-[11px] font-mono px-2 py-0.5 rounded ${activeTheme.badge}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECT DEEP DIVE MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border p-6 md:p-8 shadow-2xl ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`}>
            
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800/50 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <span className={`text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${activeTheme.badge}`}>
                {selectedProject.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-4 mb-1">{selectedProject.title}</h2>
              <p className={`text-sm font-mono ${activeTheme.textMuted}`}>Client Partner: {selectedProject.client}</p>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden mb-6 border border-zinc-800">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Object.entries(selectedProject.stats).map(([key, val]) => (
                <div key={key} className={`p-4 rounded border ${activeTheme.cardBg} ${activeTheme.border}`}>
                  <div className="text-xl font-bold font-mono">{val}</div>
                  <div className={`text-xs capitalize font-mono ${activeTheme.textMuted}`}>{key.replace(/([A-Z])/g, ' $1')}</div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-mono uppercase tracking-wider mb-2 font-bold">Project Scope & Deliverables</h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedProject.deliverables.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-mono uppercase tracking-wider mb-2 font-bold">Technical Execution</h4>
                <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
                  {selectedProject.description}
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-800/40 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className={`px-4 py-2 text-xs font-medium rounded border ${activeTheme.border} hover:bg-zinc-800/20`}
                >
                  Close
                </button>
                <a
                  href="#estimator"
                  onClick={() => setSelectedProject(null)}
                  className={`px-4 py-2 text-xs font-medium rounded ${activeTheme.accent}`}
                >
                  Request Similar Project
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SERVICES & CARE RETAINERS */}
      <section id="services" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/20">
        <div className="max-w-3xl mb-16">
          <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Studio Offerings</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Bespoke Builds & Site Maintenance
          </h2>
          <p className={`text-base leading-relaxed ${activeTheme.textMuted}`}>
            We don't launch sites and walk away. Ongoing care means fewer surprises: updates handled, problems caught early, and a site that stays fast as your business grows.
          </p>
        </div>

        {/* Studio Service Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className={`p-6 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
            <div className="w-10 h-10 rounded border border-zinc-700/50 flex items-center justify-center mb-6">
              <Layout size={20} className={activeTheme.highlight} />
            </div>
            <h3 className="text-lg font-bold mb-2">1. Design</h3>
            <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
              Clear layouts, considered typography and a consistent look, shaped around your business
            </p>
          </div>

          <div className={`p-6 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
            <div className="w-10 h-10 rounded border border-zinc-700/50 flex items-center justify-center mb-6">
              <Code size={20} className={activeTheme.highlight} />
            </div>
            <h3 className="text-lg font-bold mb-2">2. Engineering</h3>
            <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
              Fast, well-built websites and web apps, coded from scratch with no page builders and no bloat.
            </p>
          </div>

          <div className={`p-6 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
            <div className="w-10 h-10 rounded border border-zinc-700/50 flex items-center justify-center mb-6">
              <ShieldCheck size={20} className={activeTheme.highlight} />
            </div>
            <h3 className="text-lg font-bold mb-2">3. Site Maintenance</h3>
            <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
              Updates, security checks and speed tuning after launch, so your site stays reliable without you having to think about it.
            </p>
          </div>
        </div>

{/* Retainer Plans Grid */}
<div className="mb-8">
  <h3 className="text-xl font-bold mb-2">Site Maintenance Care Plans</h3>
  <p className={`text-sm ${activeTheme.textMuted} mb-8`}>
    Ongoing care for custom-built websites, WordPress sites and websites built by Iris & Oak.
  </p>

  {/* Billing period toggle (monthly care tiers only) */}
  <div
    role="group"
    aria-label="Billing period"
    className={`inline-flex p-1 mb-8 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}
  >
    {[
      { key: 'monthly', label: 'Monthly' },
      { key: 'annual', label: 'Annual · save 17%' }
    ].map((option) => (
      <button
        key={option.key}
        type="button"
        aria-pressed={billingPeriod === option.key}
        onClick={() => setBillingPeriod(option.key)}
        className={`px-4 py-2 rounded text-xs font-medium transition-all ${FOCUS_RING} ${
          billingPeriod === option.key ? activeTheme.accent : `${activeTheme.textMuted} hover:opacity-80`
        }`}
      >
        {option.label}
      </button>
    ))}
  </div>

  {/* Three monthly care tiers */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {CARE_PLANS.filter((plan) => plan.type === 'monthly').map((plan) => (
      <div
        key={plan.id}
        className={`relative p-6 sm:p-8 rounded-xl border flex flex-col justify-between transition-all ${
          plan.popular
            ? `ring-2 ring-emerald-500/50 ${activeTheme.cardBg} ${activeTheme.border}`
            : `${activeTheme.cardBg} ${activeTheme.border}`
        }`}
      >
        {plan.popular && (
          <span className="absolute -top-3 right-6 bg-emerald-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Most Popular
          </span>
        )}

        <div>
          <h4 className="text-lg font-bold mb-1">{plan.name}</h4>
          <p className={`text-xs mb-6 ${activeTheme.textMuted}`}>{plan.tagline}</p>

          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono">
                {billingPeriod === 'annual' ? plan.annualMonthlyPrice : plan.price}
              </span>
              <span className={`text-xs ${activeTheme.textMuted}`}>/ month</span>
            </div>
            {billingPeriod === 'annual' && (
              <p className={`text-xs ${activeTheme.textMuted}`}>
                Billed annually at {plan.annualPrice} · Save {plan.annualSaving}
              </p>
            )}
          </div>

          <div className={`my-6 border-t ${activeTheme.border}`} />

          <ul className="space-y-3 mb-6">
            {plan.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-xs">
                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {plan.note && (
            <p className={`text-xs mb-6 ${activeTheme.textMuted}`}>{plan.note}</p>
          )}
        </div>

        <a
          href="#estimator"
          onClick={() =>
            setRetainerInterest(
              `${plan.name} (${plan.price}/month or ${plan.annualPrice}/year)`
            )
          }
          className={`w-full py-2.5 text-center rounded text-xs font-medium transition-all ${
            plan.popular
              ? activeTheme.accent
              : `border ${activeTheme.border} hover:bg-zinc-800/30`
          }`}
        >
          Discuss {plan.name}
        </a>
      </div>
    ))}
  </div>

  {/* One-off Site Check-up option */}
  {CARE_PLANS.filter((plan) => plan.type === 'one-off').map((plan) => (
    <div
      key={plan.id}
      className={`mt-8 p-6 sm:p-8 rounded-xl border ${activeTheme.cardBg} ${activeTheme.border}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-3xl">
          <div className={`text-xs uppercase tracking-wider mb-2 ${activeTheme.textMuted}`}>
            One-off review
          </div>
          <h4 className="text-lg font-bold mb-1">{plan.name}</h4>
          <p className={`text-sm mb-4 ${activeTheme.textMuted}`}>{plan.tagline}</p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {plan.features.map((feat) => (
              <li key={feat} className="flex items-start gap-2 text-xs">
                <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {plan.note && (
            <p className={`text-xs ${activeTheme.textMuted}`}>{plan.note}</p>
          )}
        </div>

        <div className="md:text-right md:min-w-40">
          <div className="text-3xl font-bold font-mono">{plan.price}</div>
          <div className={`text-xs mb-4 ${activeTheme.textMuted}`}>one-off</div>
          <a
            href="#estimator"
            onClick={() => setRetainerInterest(`${plan.name} (${plan.price} one-off)`)}
            className={`inline-block px-5 py-2.5 rounded text-xs font-medium border ${activeTheme.border} hover:bg-zinc-800/30`}
          >
            Ask about a check-up
          </a>
        </div>
      </div>
    </div>
  ))}
</div>
      </section>

      {/* SECTION 3: TECH STACK & PHILOSOPHY */}
      <section id="engineering" className="scroll-mt-16 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Engineering Principles</div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">Modern Stack for Speed, Longevity & Zero Bloat</h2>
            <p className={`text-base leading-relaxed mb-6 ${activeTheme.textMuted}`}>
              We avoid heavy monolithic site builders in favor of composable, ultra-fast tech stacks. Every site is engineered to deliver 95+ Lighthouse scores and smooth, modern user interactions.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-1">
                  <Zap size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Sub-Second Load Performance</h4>
                  <p className={`text-xs ${activeTheme.textMuted}`}>Optimized assets, minimal JS payload, and global CDN distribution.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 mt-1">
                  <Layers size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Headless Content Flexibility</h4>
                  <p className={`text-xs ${activeTheme.textMuted}`}>Empower teams with dynamic CMS tools like Sanity or Dato CMS without risking site layout breaks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stack Pills */}
          <div className={`p-6 sm:p-8 rounded-xl border ${activeTheme.border} ${activeTheme.cardBg}`}>
            <h3 className="text-xs font-mono uppercase tracking-wider mb-6 text-zinc-400 font-bold">Curated Tech Arsenal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TECH_STACK.map((item) => (
                <div key={item.name} className={`p-3 rounded border ${activeTheme.border} bg-zinc-900/30`}>
                  <div className="font-bold text-sm">{item.name}</div>
                  <div className={`text-xs ${activeTheme.textMuted}`}>{item.role}</div>
                  <span className={`inline-block mt-2 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${activeTheme.badge}`}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE PROJECT ESTIMATOR & INQUIRY FORM */}
      <section id="estimator" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Project Estimator</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Estimate Your Studio Scope</h2>
          <p className={`text-sm sm:text-base ${activeTheme.textMuted}`}>
            Select your required deliverables and target timeline to generate a customized project brief for our team.
          </p>
        </div>

        <div className={`max-w-4xl mx-auto p-6 sm:p-10 rounded-xl border shadow-xl ${activeTheme.cardBg} ${activeTheme.border}`}>
          
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/40">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  estimatorStep === step 
                    ? activeTheme.accent 
                    : estimatorStep > step 
                      ? 'bg-emerald-500 text-black' 
                      : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {estimatorStep > step ? '✓' : step}
                </span>
                <span className={`text-xs font-mono hidden sm:inline ${estimatorStep === step ? 'font-bold' : activeTheme.textMuted}`}>
                  {step === 1 ? '1. Scope & Deliverables' : step === 2 ? '2. Budget & Timeline' : '3. Final Details'}
                </span>
              </div>
            ))}
          </div>

          {!formSubmitted ? (
            <div>
              {/* STEP 1: SCOPE SELECTOR */}
              {estimatorStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold">Select Required Scope Items:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: 'Design', desc: 'UI/UX Design, Design System, Wireframing' },
                      { title: 'Development', desc: 'Custom Next.js/Astro Frontend & Headless Integration' },
                      { title: 'Brand System', desc: 'Visual Identity, Typography, Color Palette & Assets' },
                      { title: 'Maintenance Strategy', desc: 'Continuous Site Care & Security SLA Strategy' }
                    ].map((item) => {
                      const isSelected = projectScope.includes(item.title);
                      return (
                        <div
                          key={item.title}
                          onClick={() => toggleScopeOption(item.title)}
                          className={`p-4 rounded border cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500/10' 
                              : `${activeTheme.border} hover:border-zinc-500`
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">{item.title}</span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700'}`}>
                              {isSelected && <Check size={12} className="text-black" />}
                            </div>
                          </div>
                          <p className={`text-xs ${activeTheme.textMuted}`}>{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-zinc-800/40 flex justify-between items-center">
                    <div className="text-xs font-mono">
                      Selected Scope: <span className="text-emerald-400">{projectScope.length} items</span>
                    </div>
                    <button
                      disabled={projectScope.length === 0}
                      onClick={() => setEstimatorStep(2)}
                      className={`px-5 py-2.5 text-xs font-medium rounded transition-all ${
                        projectScope.length > 0 ? activeTheme.accent : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      Continue to Budget & Timeline →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: BUDGET & TIMELINE */}
              {estimatorStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-mono uppercase tracking-wider mb-3 font-bold">Target Investment Range</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['< $5k', '$5k - $10k', '$10k - $20k', '$20k+'].map((range) => (
                        <button
                          key={range}
                          onClick={() => setBudgetRange(range)}
                          className={`p-3 text-xs font-mono rounded border transition-all ${
                            budgetRange === range ? activeTheme.accent : `${activeTheme.border} hover:border-zinc-500`
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-mono uppercase tracking-wider mb-3 font-bold">Target Launch Timeline</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {['2-3 Weeks', '4-6 Weeks', 'Flexible / Ongoing'].map((time) => (
                        <button
                          key={time}
                          onClick={() => setTimeline(time)}
                          className={`p-3 text-xs font-mono rounded border transition-all ${
                            timeline === time ? activeTheme.accent : `${activeTheme.border} hover:border-zinc-500`
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-mono uppercase tracking-wider mb-3 font-bold">Interested in Monthly Care Plan?</h3>
                    <select
                      value={retainerInterest}
                      onChange={(e) => setRetainerInterest(e.target.value)}
                      className={`w-full p-3 rounded text-xs font-mono border ${activeTheme.border} ${activeTheme.bg} ${activeTheme.text}`}
                    >
                      <option value="None">No Retainer Required</option>
                      <option value="Standard Care ($650/mo)">Standard Care ($650/mo)</option>
                      <option value="Growth Care ($1.85k/mo)">Growth Care ($1.85k/mo)</option>
                      <option value="Embedded Partner ($3.8k/mo)">Embedded Partner ($3.8k/mo)</option>
                    </select>
                  </div>

                  {/* Calculated Estimate Box */}
                  <div className="p-4 rounded border border-dashed border-emerald-500/40 bg-emerald-500/5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-mono text-emerald-400 uppercase">Estimated Scope Investment</div>
                      <div className="text-2xl font-bold font-mono">~${estimatedTotal.toLocaleString()}</div>
                    </div>
                    <div className={`text-[11px] text-right ${activeTheme.textMuted}`}>
                      Non-binding estimate <br />
                      Subject to final discovery
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-800/40 flex justify-between">
                    <button
                      onClick={() => setEstimatorStep(1)}
                      className={`px-4 py-2 text-xs font-medium rounded border ${activeTheme.border}`}
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setEstimatorStep(3)}
                      className={`px-5 py-2.5 text-xs font-medium rounded ${activeTheme.accent}`}
                    >
                      Continue to Details →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONTACT & BRIEF GENERATION */}
              {estimatorStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold">Contact & Project Specifics</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={clientDetails.name}
                        onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })}
                        placeholder="Alex Mercer"
                        className={`w-full p-2.5 rounded text-xs border ${activeTheme.border} ${activeTheme.bg}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={clientDetails.email}
                        onChange={(e) => setClientDetails({ ...clientDetails, email: e.target.value })}
                        placeholder="alex@studio.com"
                        className={`w-full p-2.5 rounded text-xs border ${activeTheme.border} ${activeTheme.bg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono mb-1">Company / Project Name</label>
                    <input
                      type="text"
                      value={clientDetails.company}
                      onChange={(e) => setClientDetails({ ...clientDetails, company: e.target.value })}
                      placeholder="Mercer Creative"
                      className={`w-full p-2.5 rounded text-xs border ${activeTheme.border} ${activeTheme.bg}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono mb-1">Project Goals & Overview</label>
                    <textarea
                      rows={4}
                      value={clientDetails.details}
                      onChange={(e) => setClientDetails({ ...clientDetails, details: e.target.value })}
                      placeholder="Briefly describe what you're looking to build or refine..."
                      className={`w-full p-2.5 rounded text-xs border ${activeTheme.border} ${activeTheme.bg}`}
                    />
                  </div>

                  <div className="pt-6 border-t border-zinc-800/40 flex justify-between items-center">
                    <button
                      onClick={() => setEstimatorStep(2)}
                      className={`px-4 py-2 text-xs font-medium rounded border ${activeTheme.border}`}
                    >
                      ← Back
                    </button>
                    <button
                      disabled={!clientDetails.name || !clientDetails.email}
                      onClick={() => setFormSubmitted(true)}
                      className={`px-6 py-2.5 text-xs font-medium rounded flex items-center gap-2 ${
                        clientDetails.name && clientDetails.email ? activeTheme.accent : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      <Send size={14} />
                      <span>Submit Inquiry Brief</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* SUBMITTED CONFIRMATION & FORMATTED BRIEF OUTPUT */
            <div className="py-8 space-y-6">
              <div className="flex items-center gap-3 text-emerald-400 mb-2">
                <CheckCircle2 size={24} />
                <h3 className="text-xl font-bold">Inquiry Brief Compiled!</h3>
              </div>
              <p className={`text-sm ${activeTheme.textMuted}`}>
                Your customized studio brief has been generated below. You can copy this summary directly or send it to your email.
              </p>

              <div className="relative p-4 rounded bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-800 whitespace-pre-wrap overflow-x-auto">
                {generateBriefText()}
                <button
                  onClick={handleCopyBrief}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5 text-[11px]"
                >
                  {copiedBrief ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedBrief ? 'Copied!' : 'Copy Brief'}</span>
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setEstimatorStep(1);
                  }}
                  aria-label="Reset and create another project brief"
                  className={`px-4 py-2 text-xs font-medium rounded border ${activeTheme.border}`}
                >
                  Create Another Brief
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-12 border-t ${activeTheme.border} ${activeTheme.cardBg} transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xs uppercase tracking-wider">{studioName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border ${activeTheme.badge}`}>© {new Date().getFullYear()} Iris &amp; Oak</span>
          </div>
          <p className={`text-xs ${activeTheme.textMuted}`}>
            Built for modern creative developers, designers, and site care specialists.
          </p>
          <div className="flex gap-6 text-xs font-mono">
            <a href="#portfolio" className="hover:underline">Portfolio</a>
            <a href="#services" className="hover:underline">Studio Offerings</a>
            <a href="#estimator" className="hover:underline">Estimator</a>
          </div>
        </div>
      </footer>

      {/* DYNAMIC CONFIGURATOR DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="config-drawer-title"
            className={`w-full max-w-md h-full p-6 sm:p-8 overflow-y-auto border-l shadow-2xl flex flex-col justify-between ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`}
          >
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800/40">
                <div className="flex items-center gap-2">
                  <Sliders size={18} />
                  <h3 id="config-drawer-title" className="font-bold text-base">Studio Configurator</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className={`p-1 rounded hover:bg-zinc-800/40 ${FOCUS_RING}`}
                  aria-label="Close Studio Configurator drawer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-8">
                {/* PALETTE SELECTOR */}
                <div role="group" aria-labelledby="config-theme-label">
                  <span id="config-theme-label" className="block text-xs font-mono uppercase tracking-wider mb-3 font-bold">Colour Theme Preset</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={themeKey === key}
                        onClick={() => setThemeKey(key)}
                        className={`p-3 rounded text-xs text-left border flex items-center justify-between transition-all ${FOCUS_RING} ${
                          themeKey === key ? 'ring-2 ring-emerald-500 border-emerald-500' : activeTheme.border
                        }`}
                      >
                        <span className="font-medium text-[11px]">{theme.name}</span>
                        {themeKey === key && <Check size={12} className="text-emerald-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TYPOGRAPHY SELECTOR */}
                <div role="group" aria-labelledby="config-typography-label">
                  <span id="config-typography-label" className="block text-xs font-mono uppercase tracking-wider mb-3 font-bold">Typography System</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(TYPOGRAPHY_STYLES).map(([key, font]) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={typographyKey === key}
                        disabled={!font.available}
                        onClick={() => setTypographyKey(key)}
                        className={`p-2.5 rounded text-xs border text-center transition-all ${FOCUS_RING} ${
                          !font.available
                            ? `${activeTheme.border} opacity-50 cursor-not-allowed`
                            : typographyKey === key ? 'ring-2 ring-emerald-500 border-emerald-500 font-bold' : activeTheme.border
                        }`}
                      >
                        {font.label}
                        {!font.available && (
                          <span className={`block text-[10px] font-mono uppercase ${activeTheme.textMuted}`}>Unavailable</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* TEXT SIZE */}
                <div role="group" aria-labelledby="config-text-size-label">
                  <span id="config-text-size-label" className="block text-xs font-mono uppercase tracking-wider mb-3 font-bold">Text Size</span>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(TEXT_SIZES).map(([key, size]) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={textSize === key}
                        onClick={() => setTextSize(key)}
                        className={`p-2.5 rounded text-xs border text-center transition-all ${FOCUS_RING} ${
                          textSize === key ? 'ring-2 ring-emerald-500 border-emerald-500 font-bold' : activeTheme.border
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* HIGH CONTRAST */}
                <div>
                  <span id="config-contrast-label" className="block text-xs font-mono uppercase tracking-wider mb-3 font-bold">High Contrast</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={highContrast}
                    aria-labelledby="config-contrast-label"
                    onClick={() => setHighContrast(on => !on)}
                    className={`w-full p-3 rounded text-xs border flex items-center justify-between transition-all ${FOCUS_RING} ${
                      highContrast ? 'ring-2 ring-emerald-500 border-emerald-500' : activeTheme.border
                    }`}
                  >
                    <span className="font-medium text-[11px]">{highContrast ? 'On' : 'Off'}</span>
                    <span aria-hidden="true" className={`relative w-8 h-4 rounded-full transition-colors ${highContrast ? 'bg-emerald-500' : 'bg-zinc-600'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${highContrast ? 'translate-x-4' : ''}`} />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800/40">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className={`w-full py-3 text-xs font-medium rounded ${activeTheme.accent} ${FOCUS_RING}`}
              >
                Apply Studio Configurations
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

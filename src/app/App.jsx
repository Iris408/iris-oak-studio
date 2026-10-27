import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sliders, 
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
  Check, 
  Maximize2, 
  Clock,
  Activity,
  ChevronDown
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

const PORTFOLIO_FILTERS = ['All', 'Web Dev', 'Product Builds', 'Systems', 'Care Retainers'];

// Portfolio projects. `category` shows as the left pill (and drives the filters);
// `status` shows as the right pill.
const SAMPLE_PROJECTS = [
  {
    id: 'kawari-company',
    title: 'Kawari Company',
    status: '',
    category: 'Web Dev',
    client: '',
    summary: 'A calm, minimalist first website built for a safeguarding consultancy with more than 25 years of experience: clear, credible and easy to get in touch.',
    tags: ['Next.js', 'TypeScript', 'CSS', 'React'],
    stats: {},
    details: {
      heading: 'Project scope & deliverables',
      text: 'A clean, minimalist website that clearly presents the company’s expertise, services and gives prospective clients a simple way to get in touch.'
    },
    technicalExecution: 'Designed and built in Webflow, with a responsive layout that adapts to different screen sizes.',
    image: '/images/kawari-company/homepage.png'
  },
  {
    id: 'bloom',
    title: 'Bloom',
    status: 'Demo',
    category: 'Product Builds',
    client: '',
    summary: 'A calm visual planner for everyday routines, designed for neurodivergent users, with no streaks, pressure or falling behind.',
    tags: ['JavaScript', 'Vite', 'FastAPI', 'PostgreSQL', 'Python'],
    stats: {},
    details: {
      heading: 'Features & focus',
      items: [
        'Visual task planning for everyday routines',
        'A calm interface designed for use without streaks or pressure',
        'Everyday mode available in the current demo'
      ]
    },
    technicalExecution: 'Built with a JavaScript and Vite front end, a FastAPI back end and a PostgreSQL database, and set up as a progressive web app (PWA).',
    image: '/images/bloom/overview.png'
  },
  {
    id: 'partspilot',
    title: 'PartsPilot',
    status: 'Prototype',
    category: 'Product Builds',
    client: '',
    summary: 'Automotive inventory management platform for stock tracking, low-stock alerts and clear reporting for teams, all in one place.',
    tags: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker'],
    stats: {},
    details: {
      heading: 'Features & focus',
      items: [
        'Inventory and stock tracking for automotive teams',
        'Low-stock alerts',
        'Category summaries and inventory reporting'
      ]
    },
    technicalExecution: 'Built with a React and TypeScript front end, a FastAPI back end and a PostgreSQL database, with Docker used to containerise the application.',
    image: '/images/partspilot/dashboard.png'
  },
  {
    id: 'accesshub',
    title: 'AccessHub',
    status: 'Prototype',
    category: 'Systems',
    client: '',
    summary: 'One place to manage people, roles and access requests, so teams always know who can see what. Admins, managers and auditors each get the right level of access.',
    tags: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'RBAC'],
    stats: {},
    details: {
      heading: 'Features & focus',
      items: [
        'User and role management',
        'Permission assignment',
        'Access request handling in one place'
      ]
    },
    technicalExecution: 'Built with a React and TypeScript front end, a FastAPI back end and a PostgreSQL database, using role-based access control (RBAC) to manage what each user can see and do.',
    image: '/images/accesshub/dashboard.png'
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
      '18-point check covering speed, search visibility, usability and accessibility',
      'Up to five key pages and customer journeys reviewed',
      'Mobile layout, links and forms tested',
      'Prioritised findings, ranked by impact',
      'Review visible performance and accessibility issues',
      'Prioritised findings and practical recommendations',
      'Report delivered within 5 working days'
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
      'Email support, reply within 2 working days'
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
    price: '£99',
    annualPrice: '£990',
    annualMonthlyPrice: '£82.50',
    annualSaving: '£198',
    period: 'per month',
    features: [
      'Everything in Core Care, plus:',
      'Up to one hour of small, agreed site or content updates each month',
      'Performance checks and reasonable fixes within the included hour',
      'Priority email support, reply within 1 working day'
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
    price: '£139',
    annualPrice: '£1,390',
    annualMonthlyPrice: '£115.83',
    annualSaving: '£278',
    period: 'per month',
    features: [
      'Everything in Growth Care, plus:',
      'Up to three hours of agreed site updates or maintenance work each month',
      'Quarterly review of site needs and recommended next steps',
      'Priority email support, reply within 1 working day'
    ],
    note: 'Larger changes and new features are scoped and quoted separately.',
    popular: false,
    type: 'monthly'
  }
];

const TECH_STACK = [
  { name: 'React', role: 'Interactive User Interfaces', category: 'Engineering' },
  { name: 'Next.js', role: 'Full-Stack Web Applications', category: 'Engineering' },
  { name: 'TypeScript', role: 'Typed JavaScript Development', category: 'Engineering' },
  { name: 'Astro', role: 'Content-Focused Websites', category: 'Engineering' },
  { name: 'Tailwind CSS', role: 'Utility-First Styling', category: 'Design & Code' },
  { name: 'Framer Motion', role: 'Interface Animation', category: 'Design & Code' },
  { name: 'FastAPI', role: 'Python API Development', category: 'Engineering' },
  { name: 'PostgreSQL', role: 'Relational Data Storage', category: 'Infrastructure' },
  { name: 'Docker', role: 'Containerised Development', category: 'Infrastructure' },
  { name: 'Vercel', role: 'Frontend Deployment', category: 'Infrastructure' }
];

// --- STUDIO OFFERINGS ---
// Tabbed categories in the Services section. Site Maintenance links to the existing care plans.
// One description per service, shared by the Studio Offerings tabs and the enquiry form choices
const SERVICE_DESCRIPTIONS = {
  websites: 'A new site, or a fresh start for your existing one.',
  'booking-integrations': 'Connect your site to the tools you already use.',
  'business-tools': 'Automations and dashboards that save you time.',
  'web-apps': 'Built from the ground up for your business, with nothing off the shelf.',
  'care-plans': 'Updates, checks and support after launch.'
};

const OFFERING_CATEGORIES = [
  { id: 'websites', name: 'Websites', positioning: SERVICE_DESCRIPTIONS.websites, Icon: Layout },
  { id: 'booking-integrations', name: 'Booking & Integrations', positioning: SERVICE_DESCRIPTIONS['booking-integrations'], Icon: Layers },
  { id: 'business-tools', name: 'Business Tools', positioning: SERVICE_DESCRIPTIONS['business-tools'], Icon: Zap },
  { id: 'web-apps', name: 'Web Apps', positioning: SERVICE_DESCRIPTIONS['web-apps'], Icon: Server }
];

const CARE_OFFERING = { id: 'care-plans', name: 'Site Maintenance', positioning: SERVICE_DESCRIPTIONS['care-plans'], Icon: ShieldCheck };

// Header dropdown
const OFFERINGS_MENU = [
  { id: 'websites', label: 'Websites' },
  { id: 'booking-integrations', label: 'Booking & Integrations' },
  { id: 'business-tools', label: 'Business Tools' },
  { id: 'web-apps', label: 'Web Apps' },
  { id: 'care-plans', label: 'Site Maintenance' }
];

const WEBSITE_PACKAGES = [
  {
    id: 'foundation',
    name: 'Foundation',
    price: '£395',
    tagline: 'A polished one-page site to get your business online.',
    includesLabel: 'What’s included:',
    features: [
      'One-page website with up to five sections',
      'Styled to your logo, colours and fonts',
      'Contact form, or a link to your existing booking system',
      'Tested on mobile, tablet and desktop before launch',
      'Page title, description and social share image set up',
      'One round of revisions',
      'Launch support for the first 14 days after going live'
    ],
    note: 'Extra sections or pages are quoted separately.',
    readyIn: 'Ready in about 1–2 weeks',
    popular: false
  },
  {
    id: 'signature',
    name: 'Signature',
    price: '£695',
    tagline: 'More room to tell your story, with pages planned around your business.',
    includesLabel: 'Everything in Foundation, plus:',
    features: [
      'Up to three pages, e.g. Home, About and Services',
      'Page content structured around your services and common customer questions',
      'Contact or enquiry form set up to send to your email',
      'Google Search Console set-up and page titles for each page',
      'Google Maps location and social links added',
      'Two rounds of revisions in total',
      'Launch support for the first 14 days after going live'
    ],
    note: 'Additional pages are quoted separately.',
    readyIn: 'Ready in about 2 weeks',
    popular: true
  },
  {
    id: 'bespoke',
    name: 'Bespoke',
    price: '£995',
    tagline: 'A tailored website, designed around your goals.',
    includesLabel: 'Everything in Signature, plus:',
    features: [
      'Up to five pages',
      'Planning session to map page structure and the customer journey',
      'Custom visual direction, with a layout designed for each page',
      'One integration included, e.g. booking, newsletter sign-up or analytics',
      '30-minute handover walkthrough of your new site',
      'Three rounds of revisions in total',
      'Launch support for the first 21 days after going live'
    ],
    note: 'Larger integrations and extra features are scoped and quoted separately.',
    readyIn: 'Ready in about 3–4 weeks',
    popular: false
  }
];

const WEBSITE_FOOTER =
  'Every website is mobile-friendly, built with accessibility in mind and includes launch support. Pay in full or split into 2, 3 or 4 instalments.';

const BOOKING_PACKAGES = [
  {
    id: 'essential-integration',
    name: 'Essential Integration',
    prefix: 'from',
    price: '£250',
    tagline: 'Connect one tool you already use to your website.',
    includesLabel: 'What’s included:',
    features: [
      'One integration, e.g. a booking widget, newsletter sign-up or analytics',
      'Styled to match your site’s look and layout',
      'Tested on mobile, tablet and desktop',
      'Checked end to end, so bookings or sign-ups arrive where they should',
      'Handover notes, so you know how it works'
    ],
    readyIn: 'Ready in about 1 week',
    cta: 'Discuss Essential Integration →'
  },
  {
    id: 'smart-forms',
    name: 'Smart Forms',
    prefix: 'from',
    price: '£450',
    tagline: 'Forms that ask the right questions and send answers where you need them.',
    includesLabel: 'Everything in Essential Integration, plus:',
    features: [
      'A multi-step quote or enquiry form',
      'Conditional questions that adapt to each answer',
      'File uploads where needed, e.g. photos or documents',
      'Responses sent to your email, a spreadsheet, or both',
      'An automatic confirmation email for your customer'
    ],
    readyIn: 'Ready in about 1–2 weeks',
    cta: 'Discuss Smart Forms →'
  },
  {
    id: 'connected-system',
    name: 'Connected System',
    prefix: 'from',
    price: '£950',
    tagline: 'Bookings, payments and follow-ups working together.',
    includesLabel: 'Everything in Smart Forms, plus:',
    features: [
      'Booking with online payment or deposits, e.g. via Stripe',
      'Forms connected to your CRM or business system',
      'Automated follow-up emails or reminders',
      'Up to three tools connected as one flow',
      'A 30-minute handover call by phone or video'
    ],
    readyIn: 'Ready in about 2–3 weeks',
    cta: 'Discuss Connected System →'
  }
];

const BOOKING_FOOTER = {
  groups: [
    { label: 'Bookings:', tools: 'Calendly · Fresha · SimplyBook · OpenTable' },
    { label: 'Payments:', tools: 'Stripe · PayPal' },
    { label: 'Marketing:', tools: 'Mailchimp · Kit · Google Business · Meta Pixel · Analytics' },
    { label: 'Business systems:', tools: 'HubSpot · Pipedrive · Xero · QuickBooks · Google Workspace' }
  ],
  note: 'Using something else? Just ask, as most tools can be connected.'
};

const BUSINESS_PACKAGES = [
  {
    id: 'single-automation',
    name: 'Single Automation',
    prefix: 'from',
    price: '£350',
    tagline: 'One task, handled automatically.',
    includesLabel: 'What’s included:',
    features: [
      'One workflow connecting two or three apps you already use',
      'For example, form entries saved to a spreadsheet with an email notification',
      'Set up in a tool such as Zapier, Make or similar',
      'Tested with real examples before handover',
      'A short written guide explaining how it works'
    ],
    readyIn: 'Ready in about 1 week',
    cta: 'Discuss Single Automation →'
  },
  {
    id: 'workflow-pack',
    name: 'Workflow Pack',
    prefix: 'from',
    price: '£950',
    tagline: 'A set of connected automations for a key part of your business.',
    includesLabel: 'Everything in Single Automation, plus:',
    features: [
      'Up to four linked automations working together',
      'A simple reporting dashboard, e.g. in Google Sheets or Looker Studio',
      'Error alerts, so you know if something stops working',
      'A 30-minute handover call by phone or video'
    ],
    readyIn: 'Ready in about 2–3 weeks',
    cta: 'Discuss Workflow Pack →'
  },
  {
    id: 'operations-toolkit',
    name: 'Operations Toolkit',
    prefix: 'from',
    price: '£2,250',
    tagline: 'Connected tools and dashboards across one area of your business.',
    includesLabel: 'Everything in Workflow Pack, plus:',
    features: [
      'A planning call to map how that area of your business runs today',
      'Automations, tools and dashboards designed as one connected system',
      'Custom templates or simple internal tools where needed',
      'Data tidied and imported from your existing spreadsheets',
      '30 days of support after handover for adjustments'
    ],
    readyIn: 'Ready in about 3–5 weeks',
    cta: 'Discuss Operations Toolkit →'
  }
];

const BUSINESS_TOOLS_FOOTER = {
  groups: [
    { label: 'Automation:', tools: 'Zapier · Make · Airtable' },
    { label: 'Reporting:', tools: 'Google Sheets · Looker Studio' },
    { label: 'Everyday tools:', tools: 'Spreadsheet templates · Small scripts · Custom trackers' }
  ],
  note: 'Using something else? Just ask, as most tools can be connected.'
};

const BUSINESS_TOOLS_WEB_APPS_LINK = { lead: 'Need something bigger, with logins or your own data?', link: 'Explore Web Apps →' };

const WEB_APP_PACKAGES = [
  {
    id: 'discovery',
    name: 'Discovery',
    price: '£450',
    priceNote: 'Credited against your build',
    tagline: 'A clear plan and a fixed quote before any build begins.',
    includesLabel: 'What’s included:',
    features: [
      'A 60-minute planning call (phone or video) to understand your business and goals',
      'Follow-up questions by email to fill in any gaps',
      'Feature list, prioritised into must-haves and later additions',
      'Recommended approach, tools and user journeys',
      'Fixed quote, timeline and written summary sent by email, yours to keep even if you don’t go ahead'
    ],
    readyIn: 'Ready in about 1 week',
    cta: 'Book Discovery ⊹'
  },
  {
    id: 'signature-app',
    name: 'Signature App',
    prefix: 'from',
    price: '£4,500',
    tagline: 'For a focused tool with one clear job.',
    includesLabel: 'Everything in Discovery, plus:',
    features: [
      'One core workflow, e.g. bookings, enquiries or an internal tracker',
      'Up to two user types, e.g. you and your customers',
      'Secure logins and a simple admin dashboard',
      'One integration, e.g. email, calendar or payments',
      'Tested on mobile, tablet and desktop before launch'
    ],
    readyIn: 'Ready in about 4–6 weeks',
    cta: 'Discuss Signature App →'
  },
  {
    id: 'bespoke-app',
    name: 'Bespoke App',
    prefix: 'from',
    price: '£8,500',
    tagline: 'For apps with more moving parts.',
    includesLabel: 'Everything in Signature App, plus:',
    features: [
      'Multiple workflows and user roles',
      'Custom dashboards and reporting',
      'Up to three integrations',
      'Data import from existing spreadsheets or systems',
      'Launch support and a handover walkthrough'
    ],
    readyIn: 'Ready in about 8–10 weeks',
    cta: 'Discuss Bespoke App →'
  },
  {
    id: 'custom-build',
    name: 'Custom Build',
    price: '£15,000+',
    priceNote: 'Quoted after discovery',
    tagline: 'For larger platforms and long-term products',
    includesLabel: 'Everything in Bespoke App, plus:',
    features: [
      'Multi-feature platforms, portals or SaaS-style products',
      'Advanced integrations, payments and automation',
      'Phased delivery, starting with a working first version',
      'A roadmap for future features and growth',
      'Ongoing development support after launch'
    ],
    note: 'Timeline and final price agreed during discovery.',
    cta: 'Discuss Custom Build →'
  }
];

const WEB_APP_EXAMPLES = [
  'Internal dashboards with logins and user roles',
  'Staff tools such as job trackers, stock systems and admin panels',
  'Client portals, secure customer logins and account areas',
  'Larger automation systems with their own interface'
];

// Dialog keyboard handling: focus moves in on open, Escape closes, Tab/Shift+Tab stay inside,
// and focus returns to the element that opened the dialog when it closes.
function useDialogFocus(isOpen, dialogRef, onClose, returnFocusRef) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const getFocusable = () => Array.from(dialogRef.current?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []);
    getFocusable()[0]?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const inside = dialogRef.current.contains(document.activeElement);

      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const opener = returnFocusRef.current;
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      opener?.focus();
    };
  }, [isOpen]);
}

// --- Footer details ---
const STUDIO_AVAILABILITY = 'Booking Projects for Winter';
const CONTACT_EMAIL = 'contact@irisoak.dev';

// Portfolio Partnership round status: 'open' | 'filled' | 'soon'
const PARTNERSHIP_STATUS = 'open';
const PARTNERSHIP_STATUS_LABELS = { open: 'Open', filled: 'Places filled', soon: 'Opening soon' };
// Number of businesses in the current round
const PARTNERSHIP_PLACES = '3';

// --- Enquiry form (submits to /api/enquiry; see api/enquiry.js) ---
// Choice ids match the Studio Offerings ids, so "Discuss…" buttons can preselect them.
const ENQUIRY_NEEDS = [
  { id: 'websites', label: 'Websites', desc: SERVICE_DESCRIPTIONS.websites },
  { id: 'booking-integrations', label: 'Bookings & integrations', desc: SERVICE_DESCRIPTIONS['booking-integrations'] },
  { id: 'business-tools', label: 'Business tools', desc: SERVICE_DESCRIPTIONS['business-tools'] },
  { id: 'web-apps', label: 'Web apps', desc: SERVICE_DESCRIPTIONS['web-apps'] },
  { id: 'care-plans', label: 'Site maintenance', desc: SERVICE_DESCRIPTIONS['care-plans'] },
  { id: 'not-sure', label: 'Not sure yet', desc: 'Tell us what you’re trying to do and we’ll suggest the right fit.' }
];
const ENQUIRY_LAUNCH_OPTIONS = ['ASAP', 'Within a month', '1–3 months', 'Flexible'];
// Optional preference only, never a quote
const ENQUIRY_BUDGET_OPTIONS = ['Under £1,000', '£1,000–£5,000', '£5,000–£15,000', '£15,000+', 'Not sure yet'];
const ENQUIRY_ENDPOINT = '/api/enquiry';
const ENQUIRY_TIMEOUT_MS = 20000;
const EMPTY_ENQUIRY = { name: '', business: '', email: '', message: '', launch: '', budget: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Returns { field: message } for invalid fields; expects already-trimmed values.
const validateEnquiry = (details) => {
  const errors = {};
  if (!details.name) errors.name = 'Enter your name.';
  if (!details.email) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(details.email)) errors.email = 'Enter an email address in the correct format, like name@example.com.';
  return errors;
};

const trimEnquiry = (details) => Object.fromEntries(Object.entries(details).map(([key, value]) => [key, value.trim()]));

// "Signature (£695)", "Smart Forms (from £450)"
const packageLabel = (pkg) => `${pkg.name} (${pkg.prefix ? `${pkg.prefix} ` : ''}${pkg.price})`;

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
  const studioName = "IRIS & OAK";
  const studioTagline = 'We design and build high-precision websites and platforms, and provide ongoing care so you can scale with confidence.';
  const studioStatus = 'Now Booking Projects for Winter';

  // Filtering state
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Enquiry form
  const [enquiry, setEnquiry] = useState(EMPTY_ENQUIRY);
  const [enquiryNeeds, setEnquiryNeeds] = useState([]); // ENQUIRY_NEEDS ids
  const [packageInterest, setPackageInterest] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const errorSummaryRef = useRef(null);
  const enquirySentRef = useRef(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'annual'

  // Studio Offerings tabs + header dropdown
  const [offeringTab, setOfferingTab] = useState('websites');
  const [isOfferingsMenuOpen, setIsOfferingsMenuOpen] = useState(false);
  const offeringsRef = useRef(null);
  const offeringTabRefs = useRef({});
  const offeringsMenuRef = useRef(null);
  const offeringsMenuButtonRef = useRef(null);
  const carePlansRef = useRef(null);

  // Tools we often use
  const toolsGridRef = useRef(null);
  const [toolsRevealed, setToolsRevealed] = useState(false);
  const [toolsRevealDone, setToolsRevealDone] = useState(false);

  const activeTheme = highContrast
    ? { ...COLOR_THEMES[themeKey], ...COLOR_THEMES[themeKey].highContrast }
    : COLOR_THEMES[themeKey];
  const activeFont = TYPOGRAPHY_STYLES[typographyKey];
  // Green status text: emerald-400 lacks contrast on the light themes, so use emerald-700 there
  const successText = themeKey === 'swiss' || themeKey === 'editorial' ? 'text-emerald-700' : 'text-emerald-400';
  const errorText = themeKey === 'swiss' || themeKey === 'editorial' ? 'text-red-700' : 'text-red-400';

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

  useDialogFocus(isDrawerOpen, drawerRef, () => setIsDrawerOpen(false), configButtonRef);

  // Project popup: opened from a card's title button, which gets focus back on close
  const projectDialogRef = useRef(null);
  const projectOpenerRef = useRef(null);
  const projectBackdropPressRef = useRef(false);
  useDialogFocus(!!selectedProject, projectDialogRef, () => setSelectedProject(null), projectOpenerRef);

  // Portfolio Partnership popup (opened from the footer)
  const [isPartnershipOpen, setIsPartnershipOpen] = useState(false);
  const partnershipDialogRef = useRef(null);
  const partnershipOpenerRef = useRef(null);
  const partnershipBackdropPressRef = useRef(false);
  useDialogFocus(isPartnershipOpen, partnershipDialogRef, () => setIsPartnershipOpen(false), partnershipOpenerRef);

  // Move focus to the confirmation once the server has confirmed the enquiry was received
  useEffect(() => {
    if (submitStatus === 'sent') enquirySentRef.current?.focus();
  }, [submitStatus]);

  // Studio Offerings: show a category's tab and bring the offerings into view.
  // `focusTab` moves keyboard focus to the tab (used when arriving from the header dropdown).
  const showOffering = (id, { focusTab = false } = {}) => {
    if (id === CARE_OFFERING.id) {
      carePlansRef.current?.scrollIntoView();
      if (focusTab) carePlansRef.current?.focus({ preventScroll: true });
      return;
    }
    setOfferingTab(id);
    requestAnimationFrame(() => {
      offeringsRef.current?.scrollIntoView();
      if (focusTab) offeringTabRefs.current[id]?.focus({ preventScroll: true });
    });
  };

  // Support links such as /#web-apps by opening the matching tab.
  useEffect(() => {
    const syncFromHash = () => {
      const id = window.location.hash.slice(1);
      if (OFFERING_CATEGORIES.some((c) => c.id === id)) showOffering(id);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  // Header dropdown: close on Escape (returning focus to its button) or on an outside click.
  useEffect(() => {
    if (!isOfferingsMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOfferingsMenuOpen(false);
        offeringsMenuButtonRef.current?.focus();
      }
    };
    const handlePointerDown = (e) => {
      if (!offeringsMenuRef.current?.contains(e.target)) setIsOfferingsMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOfferingsMenuOpen]);

  const handleOfferingsMenuSelect = (e, id) => {
    e.preventDefault();
    setIsOfferingsMenuOpen(false);
    window.history.replaceState(null, '', `#${id}`);
    showOffering(id, { focusTab: true });
  };

  // Arrow keys move between offering tabs (ARIA tabs pattern).
  const handleOfferingTabKeyDown = (e) => {
    const ids = OFFERING_CATEGORIES.map((c) => c.id);
    const index = ids.indexOf(offeringTab);
    const next =
      e.key === 'ArrowRight' ? ids[(index + 1) % ids.length]
      : e.key === 'ArrowLeft' ? ids[(index - 1 + ids.length) % ids.length]
      : e.key === 'Home' ? ids[0]
      : e.key === 'End' ? ids[ids.length - 1]
      : null;
    if (!next) return;
    e.preventDefault();
    setOfferingTab(next);
    offeringTabRefs.current[next]?.focus();
  };

  // Package card shared by Websites and Booking & Integrations.
  // Optional fields: prefix (e.g. "from"), priceNote, note, readyIn, cta (defaults to "Discuss {name}"), popular.
  const renderPackageCard = (pkg, need) => (
    <div
      key={pkg.id}
      className={`relative p-6 sm:p-8 rounded-xl border flex flex-col justify-between transition-all ${
        pkg.popular
          ? `ring-2 ring-emerald-500/50 ${activeTheme.cardBg} ${activeTheme.border}`
          : `${activeTheme.cardBg} ${activeTheme.border}`
      }`}
    >
      {pkg.popular && (
        <span className="absolute -top-3 right-6 bg-emerald-500 text-black font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}

      <div>
        <h4 className="text-lg font-bold mb-1">{pkg.name}</h4>
        <p className={`text-xs mb-6 ${activeTheme.textMuted}`}>{pkg.tagline}</p>
        <div className="text-3xl font-bold font-mono">
          {pkg.prefix && <span className={`text-xs font-sans font-normal ${activeTheme.textMuted}`}>{pkg.prefix} </span>}
          {pkg.price}
        </div>
        {pkg.priceNote && <p className={`text-xs mt-1 ${activeTheme.textMuted}`}>{pkg.priceNote}</p>}

        <div className={`my-6 border-t ${activeTheme.border}`} />

        <p className="text-xs font-bold mb-3">{pkg.includesLabel}</p>
        <ul className="space-y-3 mb-6">
          {pkg.features.map((feat) => (
            <li key={feat} className="flex items-start gap-2 text-xs">
              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>

        {pkg.note && <p className={`text-xs ${pkg.readyIn ? 'mb-2' : 'mb-6'} ${activeTheme.textMuted}`}>{pkg.note}</p>}
        {pkg.readyIn && (
          <p className={`text-xs mb-6 flex items-center gap-1.5 ${activeTheme.textMuted}`}>
            <Clock size={12} aria-hidden="true" className="shrink-0" />
            {pkg.readyIn}
          </p>
        )}
      </div>

      <a
        href="#contact"
        onClick={() => preselectEnquiry({ need, pkg: packageLabel(pkg) })}
        className={`w-full py-2.5 text-center rounded text-xs font-medium transition-all ${
          pkg.popular ? activeTheme.accent : `border ${activeTheme.border} hover:bg-zinc-800/30`
        }`}
      >
        {pkg.cta || `Discuss ${pkg.name}`}
      </a>
    </div>
  );

  // Orbit artwork for a fixed 720×520 stage (coordinates match ORBIT_PATH), drawn in currentColor.
  // Used by the hero background and the Enquire section; `idPrefix` keeps SVG ids unique per use.
  const renderOrbitArtwork = (idPrefix) => (
    <>
      {/* Soft colour haze around the sphere and along the orbit */}
      <div className="absolute left-[380px] top-[93px] w-[260px] h-[260px] rounded-full bg-current opacity-20 blur-3xl animate-orbit-glow motion-reduce:animate-none" />
      <div className="absolute left-[160px] top-[150px] w-[420px] h-[224px] rounded-full bg-current opacity-[0.07] blur-3xl rotate-[28deg]" />

      <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 720 520" fill="none">
        <defs>
          <linearGradient id={`${idPrefix}-stroke`} gradientUnits="userSpaceOnUse" x1="95" y1="119" x2="625" y2="401">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.15" />
            <stop offset="0.45" stopColor="currentColor" stopOpacity="0.55" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id={`${idPrefix}-sphere`} cx="0.35" cy="0.3" r="0.75">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="currentColor" stopOpacity="0.08" />
            <stop offset="0.85" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
          </radialGradient>
          <filter id={`${idPrefix}-blur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Orbit line with a soft glow underneath */}
        <path d={ORBIT_PATH} stroke="currentColor" strokeOpacity="0.35" strokeWidth="4" filter={`url(#${idPrefix}-blur)`} />
        <path d={ORBIT_PATH} stroke={`url(#${idPrefix}-stroke)`} strokeWidth="1.25" />

        {/* Glass sphere sitting on the orbit */}
        <circle cx="549" cy="223" r="48" fill={`url(#${idPrefix}-sphere)`} />
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
    </>
  );

  // Decorative step connector placed in the grid gap after a process card (offset 1px to clear the card border):
  // horizontal (line + chevron, vertically centred on the cards) from md, vertical below md.
  // A soft dot travels along each line; `step` offsets the second connector by half a cycle.
  const renderProcessConnector = (step) => (
    <span aria-hidden="true" className={`pointer-events-none absolute flex items-center justify-center ${activeTheme.highlight}
      left-1/2 top-[calc(100%+1px)] h-8 w-5 -translate-x-1/2 flex-col
      md:left-[calc(100%+1px)] md:top-1/2 md:h-5 md:w-8 md:translate-x-0 md:-translate-y-1/2 md:flex-row`}>
      <span className="absolute bg-current opacity-30 left-1/2 inset-y-0 w-px -translate-x-1/2 md:left-0 md:right-0 md:inset-y-auto md:top-1/2 md:w-auto md:h-px md:translate-x-0 md:-translate-y-1/2" />
      {/* Travelling pulse (vertical below md, horizontal from md); hidden with reduced motion */}
      <span
        style={{ animationDelay: `${step * 2}s` }}
        className="absolute left-1/2 top-0 -ml-[3px] -mt-[3px] w-1.5 h-1.5 rounded-full bg-current opacity-0 animate-connector-pulse-y md:hidden motion-reduce:hidden"
      />
      <span
        style={{ animationDelay: `${step * 2}s` }}
        className="absolute left-0 top-1/2 -ml-[3px] -mt-[3px] w-1.5 h-1.5 rounded-full bg-current opacity-0 animate-connector-pulse-x hidden md:block motion-reduce:hidden md:motion-reduce:hidden"
      />
      <span
        style={{ animationDelay: `${step * 2}s` }}
        className={`relative flex items-center justify-center w-5 h-5 rounded-full border ${activeTheme.border} ${activeTheme.bg} animate-connector-glow motion-reduce:animate-none`}
      >
        <ChevronDown size={12} className="md:hidden" />
        <ChevronRight size={12} className="hidden md:block" />
      </span>
    </span>
  );

  useEffect(() => {
    const grid = toolsGridRef.current;
    if (!grid || typeof IntersectionObserver === 'undefined') {
      setToolsRevealed(true);
      setToolsRevealDone(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setToolsRevealed(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(grid);
    return () => observer.disconnect();
  }, []);

  // Drop the stagger delays once the reveal has played, so hover/focus responds immediately
  useEffect(() => {
    if (!toolsRevealed || toolsRevealDone) return;
    const timer = setTimeout(() => setToolsRevealDone(true), TECH_STACK.length * 70 + 600);
    return () => clearTimeout(timer);
  }, [toolsRevealed, toolsRevealDone]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return SAMPLE_PROJECTS;
    return SAMPLE_PROJECTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const toggleEnquiryNeed = (id) => {
    setEnquiryNeeds((prev) => (prev.includes(id) ? prev.filter((need) => need !== id) : [...prev, id]));
  };

  const updateEnquiry = (field, value) => {
    const next = { ...enquiry, [field]: value };
    setEnquiry(next);
    // After a failed submit, update errors as the visitor corrects fields
    if (submitAttempted) setFormErrors(validateEnquiry(trimEnquiry(next)));
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (submitStatus === 'sending') return; // no duplicate submissions

    const trimmed = trimEnquiry(enquiry);
    const errors = validateEnquiry(trimmed);
    setSubmitAttempted(true);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setSubmitStatus('idle');
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSubmitStatus('sending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ENQUIRY_TIMEOUT_MS);
    try {
      const response = await fetch(ENQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...trimmed,
          needs: ENQUIRY_NEEDS.filter((need) => enquiryNeeds.includes(need.id)).map((need) => need.label),
          package: packageInterest,
          contact_reference: honeypot
        }),
        signal: controller.signal
      });
      const result = await response.json().catch(() => null);
      // Only a server response that explicitly confirms receipt counts as sent
      if (!response.ok || result?.ok !== true) throw new Error('Enquiry not confirmed');
      setSubmitStatus('sent');
    } catch {
      setSubmitStatus('error'); // entries are kept so the visitor can retry
    } finally {
      clearTimeout(timeout);
    }
  };

  // "Discuss…" and care-plan buttons: tick the matching choice and note the package
  const preselectEnquiry = ({ need, pkg }) => {
    if (need) setEnquiryNeeds((prev) => (prev.includes(need) ? prev : [...prev, need]));
    if (pkg) setPackageInterest(pkg);
  };

  return (
    <div className={`min-h-screen ${activeTheme.bg} ${activeTheme.text} ${activeFont.class} transition-colors duration-300 relative selection:bg-zinc-700 selection:text-white`}>
      
      <a
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded focus:text-sm focus:font-medium ${activeTheme.accent} ${FOCUS_RING}`}
      >
        Skip to content
      </a>

      {/* GLOBAL TOP NAVIGATION BAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${activeTheme.border} ${activeTheme.bg}/80 transition-colors`}>
        {/* Tablet and small desktop (md–lg): nav wraps onto its own row; from xl everything sits on one row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-auto md:py-3 xl:h-16 xl:py-0 flex flex-wrap xl:flex-nowrap items-center justify-between gap-y-3">
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div aria-hidden="true" className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
              <a href="/" className="font-bold tracking-wider text-sm uppercase">
                {studioName}
              </a>
            <span className={`hidden md:inline-block text-xs px-2 py-0.5 rounded border ${activeTheme.badge}`}>
              Digital Studio
            </span>
          </div>

          {/* Navigation Items */}
          <nav className={`hidden md:flex order-last xl:order-none w-full xl:w-auto justify-center items-center gap-8 pt-3 xl:pt-0 border-t xl:border-t-0 ${activeTheme.border} text-xs font-medium tracking-wide uppercase`}>
            <a href="#portfolio" className="hover:opacity-70 transition-opacity">Portfolio</a>
            <div ref={offeringsMenuRef} className="relative">
              <button
                ref={offeringsMenuButtonRef}
                type="button"
                aria-expanded={isOfferingsMenuOpen}
                aria-controls="offerings-menu"
                onClick={() => setIsOfferingsMenuOpen((open) => !open)}
                className={`inline-flex items-center gap-1 uppercase tracking-wide hover:opacity-70 transition-opacity rounded ${FOCUS_RING}`}
              >
                Studio Offerings
                <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${isOfferingsMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOfferingsMenuOpen && (
                <ul
                  id="offerings-menu"
                  className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 min-w-[15rem] py-2 rounded-lg border shadow-xl animate-fade-in motion-reduce:animate-none ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`}
                >
                  {OFFERINGS_MENU.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => handleOfferingsMenuSelect(e, item.id)}
                        className={`block px-4 py-2.5 whitespace-nowrap hover:opacity-70 transition-opacity ${FOCUS_RING}`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <a href="#engineering" className="hover:opacity-70 transition-opacity">Engineering</a>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              ref={configButtonRef}
              aria-haspopup="dialog"
              aria-expanded={isDrawerOpen}
              aria-label="Studio Configurator"
              onClick={() => setIsDrawerOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded border transition-all ${activeTheme.accentBorder} ${activeTheme.cardBg} hover:opacity-90`}
            >
              <Sliders size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Studio Configurator</span>
            </button>
            
            <a
              href="#contact"
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${activeTheme.accent}`}
            >
              Enquire
            </a>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* DYNAMIC STUDIO HER0 SECTION */}
      <section className="relative isolate pt-20 pb-16 md:pt-32 md:pb-24 border-b border-dashed border-zinc-800/40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Decorative slow-orbit background (behind content, non-interactive, static with reduced motion) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none select-none absolute inset-0 -z-10 overflow-hidden ${activeTheme.highlight}`}
        >
          {/* Fixed 720×520 stage (matches ORBIT_PATH coordinates), scaled down on smaller screens */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[720px] h-[520px] origin-right scale-[0.55] sm:scale-75 lg:scale-100 opacity-70 md:opacity-100">
            {renderOrbitArtwork('hero-orbit')}
          </div>
        </div>

        <div className="max-w-4xl">
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border mb-6 backdrop-blur-sm opacity-90 border-emerald-500/30 bg-emerald-500/10 ${successText}`}>
            <Activity size={12} aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
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
              href="#contact"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-all shadow-sm ${activeTheme.accent}`}
            >
              <span>Plan your project</span>
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
        <div className={`mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t ${activeTheme.border}`}>
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
      <section id="portfolio" className="scroll-mt-16 md:scroll-mt-28 xl:scroll-mt-16 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Portfolio / Archive</div>
            <h2 className="text-3xl font-bold tracking-tight">Selected Studio Projects</h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={activeCategory === cat}
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
              className={`group relative cursor-pointer rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 motion-reduce:hover:translate-y-0 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-emerald-400 ${activeTheme.border} ${activeTheme.cardBg}`}
            >
              {/* Card Image */}
              <div className="relative aspect-video overflow-hidden bg-zinc-900">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                />
                {project.category && (
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-1 rounded border backdrop-blur-md ${activeTheme.badge}`}>
                      {project.category}
                    </span>
                  </div>
                )}
                {project.status && (
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] uppercase font-mono tracking-wider px-2 py-1 rounded border backdrop-blur-md ${activeTheme.badge}`}>
                      {project.status}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs uppercase tracking-widest font-mono text-white bg-black/70 px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                    Inspect Project Specs <Maximize2 size={12} aria-hidden="true" />
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {project.client && <div className={`text-xs font-mono mb-1 ${activeTheme.textMuted}`}>{project.client}</div>}
                <h3 className={`text-xl font-bold ${project.summary || project.tags.length ? 'mb-3' : ''} group-hover:underline flex items-center justify-between`}>
                  {/* The button's ::after covers the whole card, so the card stays clickable and is keyboard-operable */}
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    onClick={(e) => {
                      projectOpenerRef.current = e.currentTarget;
                      setSelectedProject(project);
                    }}
                    className="text-left cursor-pointer focus:outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    {project.title}
                  </button>
                  <ArrowUpRight size={18} aria-hidden="true" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                {project.summary && (
                  <p className={`text-sm leading-relaxed ${project.tags.length ? 'mb-6' : ''} ${activeTheme.textMuted}`}>
                    {project.summary}
                  </p>
                )}

                {/* Tech Tags */}
                {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-zinc-800/30">
                  {project.tags.map((tag) => (
                    <span key={tag} className={`text-[11px] font-mono px-2 py-0.5 rounded ${activeTheme.badge}`}>
                      {tag}
                    </span>
                  ))}
                </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECT DEEP DIVE MODAL */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in motion-reduce:animate-none"
          // Close on a backdrop click only when the press also started on the backdrop (not a drag out of the popup)
          onMouseDown={(e) => { projectBackdropPressRef.current = e.target === e.currentTarget; }}
          onClick={(e) => {
            if (projectBackdropPressRef.current && e.target === e.currentTarget) setSelectedProject(null);
          }}
        >
          <div
            ref={projectDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border p-6 md:p-8 shadow-2xl ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`}
          >
            
            <button
              type="button"
              aria-label="Close project details"
              onClick={() => setSelectedProject(null)}
              className={`absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800/50 transition-colors ${FOCUS_RING}`}
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {[selectedProject.category, selectedProject.status].filter(Boolean).map((pill) => (
                  <span key={pill} className={`text-xs font-mono uppercase tracking-widest px-2.5 py-1 rounded border ${activeTheme.badge}`}>
                    {pill}
                  </span>
                ))}
              </div>
              <h2 id="project-dialog-title" className="text-2xl sm:text-3xl font-bold mt-4 mb-1">{selectedProject.title}</h2>
              {selectedProject.client && <p className={`text-sm font-mono ${activeTheme.textMuted}`}>Client Partner: {selectedProject.client}</p>}
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden mb-6 border border-zinc-800">
              <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
            </div>

            {Object.keys(selectedProject.stats).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Object.entries(selectedProject.stats).map(([key, val]) => (
                <div key={key} className={`p-4 rounded border ${activeTheme.cardBg} ${activeTheme.border}`}>
                  <div className="text-xl font-bold font-mono">{val}</div>
                  <div className={`text-xs capitalize font-mono ${activeTheme.textMuted}`}>{key.replace(/([A-Z])/g, ' $1')}</div>
                </div>
              ))}
            </div>
            )}

            <div className="space-y-6">
              {selectedProject.details && (
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider mb-2 font-bold">{selectedProject.details.heading}</h3>
                {selectedProject.details.items ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProject.details.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={16} aria-hidden="true" className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
                    {selectedProject.details.text}
                  </p>
                )}
              </div>
              )}

              {selectedProject.technicalExecution && (
              <div>
                <h3 className="text-sm font-mono uppercase tracking-wider mb-2 font-bold">Technical Execution</h3>
                <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
                  {selectedProject.technicalExecution}
                </p>
              </div>
              )}

              <div className="pt-6 border-t border-zinc-800/40 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className={`px-4 py-2 text-xs font-medium rounded border ${activeTheme.border} hover:bg-zinc-800/20`}
                >
                  Close
                </button>
                <a
                  href="#contact"
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
      <section id="services" className="relative py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/20">
        <div className="max-w-3xl lg:max-w-none mb-16">
          <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Studio Offerings</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Build it, connect it, keep it running
          </h2>
          <p className={`text-base leading-relaxed ${activeTheme.textMuted}`}>
            Start with a website, add the tools your business runs on, and keep everything looked after, all with one studio.
          </p>
        </div>

        {/* Studio Offerings: category tabs (Site Maintenance links to the care plans below) */}
        <div ref={offeringsRef} id="offerings" className="mb-20 scroll-mt-20 md:scroll-mt-28 xl:scroll-mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
            <div
              role="tablist"
              aria-label="Studio Offerings"
              onKeyDown={handleOfferingTabKeyDown}
              className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            >
              {OFFERING_CATEGORIES.map((cat) => {
                const selected = offeringTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    ref={(el) => { offeringTabRefs.current[cat.id] = el; }}
                    type="button"
                    role="tab"
                    id={`offering-tab-${cat.id}`}
                    aria-selected={selected}
                    aria-controls={cat.id}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setOfferingTab(cat.id)}
                    className={`p-4 rounded-lg border text-left flex flex-col items-start transition-all ${FOCUS_RING} ${
                      selected
                        ? `ring-2 ring-emerald-500/50 ${activeTheme.cardBg} ${activeTheme.border}`
                        : `${activeTheme.border} hover:opacity-80`
                    }`}
                  >
                    <cat.Icon size={18} aria-hidden="true" className={`mb-3 ${activeTheme.highlight}`} />
                    <span className="block text-sm font-bold">{cat.name}</span>
                    <span className={`block text-xs mt-1 ${activeTheme.textMuted}`}>{cat.positioning}</span>
                  </button>
                );
              })}
            </div>
            <a
              href={`#${CARE_OFFERING.id}`}
              onClick={(e) => {
                e.preventDefault();
                window.history.replaceState(null, '', `#${CARE_OFFERING.id}`);
                showOffering(CARE_OFFERING.id, { focusTab: true });
              }}
              className={`p-4 rounded-lg border border-dashed text-left transition-all hover:opacity-80 ${FOCUS_RING} ${activeTheme.border}`}
            >
              <CARE_OFFERING.Icon size={18} aria-hidden="true" className={`mb-3 ${activeTheme.highlight}`} />
              <span className="flex items-center gap-1 text-sm font-bold">
                {CARE_OFFERING.name}
                <ChevronDown size={14} aria-hidden="true" />
              </span>
              <span className={`block text-xs mt-1 ${activeTheme.textMuted}`}>{CARE_OFFERING.positioning}</span>
            </a>
          </div>

          {/* Websites */}
          <div id="websites" role="tabpanel" aria-labelledby="offering-tab-websites" hidden={offeringTab !== 'websites'} tabIndex={0} className={`rounded-xl ${FOCUS_RING}`}>
            <h3 className="sr-only">Websites</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {WEBSITE_PACKAGES.map((pkg) => renderPackageCard(pkg, 'websites'))}
            </div>
            <p className={`mt-8 text-sm ${activeTheme.textMuted}`}>{WEBSITE_FOOTER}</p>
          </div>

          {/* Booking & Integrations: full package cards plus tools footer */}
          <div id="booking-integrations" role="tabpanel" aria-labelledby="offering-tab-booking-integrations" hidden={offeringTab !== 'booking-integrations'} tabIndex={0} className={`rounded-xl ${FOCUS_RING}`}>
            <h3 className="sr-only">Booking & Integrations</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {BOOKING_PACKAGES.map((pkg) => renderPackageCard(pkg, 'booking-integrations'))}
            </div>
            <div className={`mt-8 p-6 rounded-xl border ${activeTheme.border}`}>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                {BOOKING_FOOTER.groups.map((group) => (
                  <div key={group.label}>
                    <dt className="inline font-bold">{group.label}</dt>{' '}
                    <dd className={`inline ${activeTheme.textMuted}`}>{group.tools}</dd>
                  </div>
                ))}
              </dl>
              <p className={`mt-4 text-xs ${activeTheme.textMuted}`}>{BOOKING_FOOTER.note}</p>
            </div>
          </div>

          {/* Business Tools: full package cards, tools footer and a link to Web Apps */}
          <div id="business-tools" role="tabpanel" aria-labelledby="offering-tab-business-tools" hidden={offeringTab !== 'business-tools'} tabIndex={0} className={`rounded-xl ${FOCUS_RING}`}>
            <h3 className="sr-only">Business Tools</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {BUSINESS_PACKAGES.map((pkg) => renderPackageCard(pkg, 'business-tools'))}
            </div>
            <div className={`mt-8 p-6 rounded-xl border ${activeTheme.border}`}>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3 text-xs">
                {BUSINESS_TOOLS_FOOTER.groups.map((group) => (
                  <div key={group.label}>
                    <dt className="inline font-bold">{group.label}</dt>{' '}
                    <dd className={`inline ${activeTheme.textMuted}`}>{group.tools}</dd>
                  </div>
                ))}
              </dl>
              {/* Bottom row: note on the left, Web Apps link at the bottom right */}
              <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <p className={`text-xs ${activeTheme.textMuted}`}>{BUSINESS_TOOLS_FOOTER.note}</p>
                <p className="text-[12px] text-right">
                  {BUSINESS_TOOLS_WEB_APPS_LINK.lead}{' '}
                  <a
                    href="#web-apps"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.replaceState(null, '', '#web-apps');
                      showOffering('web-apps', { focusTab: true });
                    }}
                    className={`font-medium underline underline-offset-4 hover:opacity-70 rounded ${activeTheme.highlight} ${FOCUS_RING}`}
                  >
                    {BUSINESS_TOOLS_WEB_APPS_LINK.link}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Web Apps */}
          <div id="web-apps" role="tabpanel" aria-labelledby="offering-tab-web-apps" hidden={offeringTab !== 'web-apps'} tabIndex={0} className={`rounded-xl ${FOCUS_RING}`}>
            <h3 className="sr-only">Web Apps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {WEB_APP_PACKAGES.map((pkg) => renderPackageCard(pkg, 'web-apps'))}
            </div>
            <ul className={`mt-8 p-6 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 ${activeTheme.border}`}>
              {WEB_APP_EXAMPLES.map((example) => (
                <li key={example} className="flex items-start gap-2 text-xs">
                  <ChevronRight size={14} aria-hidden="true" className={`shrink-0 mt-0.5 ${activeTheme.highlight}`} />
                  <span className={activeTheme.textMuted}>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

{/* Retainer Plans Grid */}
<div ref={carePlansRef} id="care-plans" tabIndex={-1} className="mb-8 scroll-mt-20 md:scroll-mt-28 xl:scroll-mt-20 focus:outline-none">
  <h3 className="text-3xl sm:text-4xl font-bold mb-2">Site Maintenance Care Plans</h3>
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
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
          href="#contact"
          onClick={() => preselectEnquiry({ need: CARE_OFFERING.id, pkg: `${plan.name} care plan (${plan.price}/month)` })}
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
            href="#contact"
            onClick={() => preselectEnquiry({ need: CARE_OFFERING.id, pkg: `${plan.name} (${plan.price} one-off)` })}
            className={`inline-block px-5 py-2.5 rounded text-xs font-medium border ${activeTheme.border} hover:bg-zinc-800/30`}
          >
            Ask about a check-up
          </a>
        </div>
      </div>
    </div>
  ))}
</div>
        {/* Transition marker centred on the section's bottom border (+0.5px = half the 1px border) */}
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[calc(50%+0.5px)] flex items-center justify-center w-3 h-3">
          <span className="absolute inset-0 rounded-full border border-emerald-500/60 animate-transition-ring motion-reduce:animate-none motion-reduce:opacity-40" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
        </span>
      </section>

      {/* SECTION 3: TECH STACK & PHILOSOPHY */}
      <section id="engineering" className="scroll-mt-16 md:scroll-mt-28 xl:scroll-mt-16 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Engineering Principles</div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">Modern tools, chosen for each project · Fast today, easy to maintain tomorrow</h2>
            <p className={`text-base leading-relaxed mb-6 ${activeTheme.textMuted}`}>
              We build with modern, lightweight tools chosen for each project, with a focus on speed, accessibility and code that’s easy to maintain. Every site is tested on real devices and checked for performance before launch.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-1">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Fast by default</h3>
                  <p className={`text-xs ${activeTheme.textMuted}`}>Optimised images, lightweight code and modern hosting.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 mt-1">
                  <Layers size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Easy to update</h3>
                  <p className={`text-xs ${activeTheme.textMuted}`}>Content you can edit yourself, built so changes don’t break your layout.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stack Pills */}
          <div className={`p-6 sm:p-8 rounded-xl border ${activeTheme.border} ${activeTheme.cardBg}`}>
            <h3 className={`text-xs font-mono uppercase tracking-wider mb-6 font-bold ${activeTheme.textMuted}`}>TOOLS WE OFTEN USE</h3>
            <div ref={toolsGridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TECH_STACK.map((item, index) => (
                <div
                  key={item.name}
                  style={toolsRevealDone ? undefined : { transitionDelay: `${index * 70}ms` }}
                  className={`p-3 rounded border ${activeTheme.border} bg-zinc-900/30 transition-[opacity,transform,box-shadow] duration-500 ease-out hover:-translate-y-0.5 hover:shadow-lg ${
                    toolsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  } motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
                >
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

        {/* Process: Design → Engineering → Site Maintenance */}
        <div className="mt-16">
          <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>How a project comes together</div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">From first idea to long-term care</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`relative p-6 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
              <div className="w-10 h-10 rounded border border-zinc-700/50 flex items-center justify-center mb-6">
                <Layout size={20} className={activeTheme.highlight} />
              </div>
              <h3 className="text-lg font-bold mb-2">1. Design</h3>
              <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
                Clear layouts, considered typography and a consistent look, shaped around your business and your customers.
              </p>
              {renderProcessConnector(0)}
            </div>

            <div className={`relative p-6 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
              <div className="w-10 h-10 rounded border border-zinc-700/50 flex items-center justify-center mb-6">
                <Code size={20} className={activeTheme.highlight} />
              </div>
              <h3 className="text-lg font-bold mb-2">2. Engineering</h3>
              <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
                Fast, well-built websites and web apps, coded from scratch with no page builders and no bloat.
              </p>
              {renderProcessConnector(1)}
            </div>

            <div className={`relative p-6 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
              <div className="w-10 h-10 rounded border border-zinc-700/50 flex items-center justify-center mb-6">
                <ShieldCheck size={20} className={activeTheme.highlight} />
              </div>
              <h3 className="text-lg font-bold mb-2">3. Site Maintenance</h3>
              <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
                Updates, security checks and speed tuning after launch, so your site stays reliable without you having to think about it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ENQUIRY FORM */}
      <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Enquire</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Plan your project</h2>
          <p className={`text-sm sm:text-base ${activeTheme.textMuted}`}>
            Answer a few quick questions and we’ll come back with a clear plan and price, usually within two working days.
          </p>
        </div>

        {/* Below lg: the form alone. From lg: form on the left, decorative orbit on the right. */}
        <div className="max-w-4xl lg:max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_32rem] gap-8 xl:gap-12 items-start">
        <div className={`p-6 sm:p-10 rounded-xl border shadow-xl ${activeTheme.cardBg} ${activeTheme.border}`}>
          {submitStatus === 'sent' ? (
            /* Shown only after the server confirms the enquiry was received */
            <div role="status" className="py-8 flex items-center gap-3">
              <CheckCircle2 size={24} aria-hidden="true" className={successText} />
              <h3 ref={enquirySentRef} tabIndex={-1} className="text-xl font-bold focus:outline-none">
                Thanks, we’ll be in touch within two working days.
              </h3>
            </div>
          ) : (
            <form noValidate onSubmit={handleEnquirySubmit} aria-busy={submitStatus === 'sending'} className="relative space-y-6">
              <p className={`text-xs ${activeTheme.textMuted}`}>Fields marked * are required.</p>

              {submitAttempted && Object.keys(formErrors).length > 0 && (
                <div
                  ref={errorSummaryRef}
                  tabIndex={-1}
                  aria-labelledby="enquiry-error-summary-title"
                  className="p-4 rounded border border-red-500/60 bg-red-500/10 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                >
                  <h3 id="enquiry-error-summary-title" className={`text-sm font-bold mb-2 ${errorText}`}>There’s a problem</h3>
                  <ul className="space-y-1 text-xs">
                    {['name', 'email'].filter((field) => formErrors[field]).map((field) => (
                      <li key={field}>
                        <a
                          href={`#enquiry-${field}`}
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(`enquiry-${field}`)?.focus();
                          }}
                          className={`underline underline-offset-4 ${errorText} ${FOCUS_RING}`}
                        >
                          {formErrors[field]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {packageInterest && (
                <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded border ${activeTheme.border}`}>
                  <p className="text-xs">
                    Package you asked about: <strong>{packageInterest}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => setPackageInterest('')}
                    className={`text-xs underline underline-offset-4 hover:opacity-70 rounded ${FOCUS_RING}`}
                  >
                    Remove<span className="sr-only"> {packageInterest}</span>
                  </button>
                </div>
              )}

              {/* Name and Email side by side from sm; business name / website on its own full-width row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { field: 'name', label: 'Name', type: 'text', autoComplete: 'name', required: true },
                  { field: 'email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
                  { field: 'business', label: 'Business name or current website', type: 'text', autoComplete: 'organization', required: false, wide: true }
                ].map(({ field, label, type, autoComplete, required, wide }) => (
                  <div key={field} className={wide ? 'sm:col-span-2' : undefined}>
                    <label htmlFor={`enquiry-${field}`} className="block text-xs font-mono mb-1">
                      {label}
                      {required ? <span aria-hidden="true"> *</span> : <span className={activeTheme.textMuted}> (optional)</span>}
                    </label>
                    <input
                      id={`enquiry-${field}`}
                      name={field}
                      type={type}
                      autoComplete={autoComplete}
                      required={required}
                      aria-invalid={formErrors[field] ? 'true' : undefined}
                      aria-describedby={formErrors[field] ? `enquiry-${field}-error` : undefined}
                      value={enquiry[field]}
                      onChange={(e) => updateEnquiry(field, e.target.value)}
                      className={`w-full p-2.5 rounded text-xs border ${formErrors[field] ? 'border-red-500' : activeTheme.border} ${activeTheme.bg}`}
                    />
                    {formErrors[field] && (
                      <p id={`enquiry-${field}-error`} className={`text-xs mt-1 ${errorText}`}>
                        <span className="sr-only">Error: </span>{formErrors[field]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* 4. What do you need help with? (checkbox chips: choose any) */}
              <fieldset>
                <legend className="text-xs font-mono mb-1">What do you need help with?</legend>
                <p id="enquiry-needs-hint" className={`text-xs mb-3 ${activeTheme.textMuted}`}>Choose all that apply.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ENQUIRY_NEEDS.map((need) => {
                    const checked = enquiryNeeds.includes(need.id);
                    return (
                      <label
                        key={need.id}
                        className={`relative flex flex-col gap-1 p-4 rounded border cursor-pointer transition-all has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-emerald-400 ${
                          checked ? 'border-emerald-500 bg-emerald-500/10' : `${activeTheme.border} hover:border-zinc-500`
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="needs"
                          value={need.label}
                          checked={checked}
                          onChange={() => toggleEnquiryNeed(need.id)}
                          aria-describedby={`enquiry-need-${need.id}-desc enquiry-needs-hint`}
                          className="sr-only"
                        />
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm">{need.label}</span>
                          <span aria-hidden="true" className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-700'}`}>
                            {checked && <Check size={12} className="text-black" />}
                          </span>
                        </span>
                        <span id={`enquiry-need-${need.id}-desc`} className={`text-xs ${activeTheme.textMuted}`}>{need.desc}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* 5. Tell us about your project */}
              <div>
                <label htmlFor="enquiry-message" className="block text-xs font-mono mb-1">Tell us about your project.</label>
                <textarea
                  id="enquiry-message"
                  name="message"
                  rows={5}
                  value={enquiry.message}
                  onChange={(e) => updateEnquiry('message', e.target.value)}
                  placeholder="What does your business do, and what would you like your site or tool to help with?"
                  className={`w-full p-2.5 rounded text-xs border ${activeTheme.border} ${activeTheme.bg}`}
                />
              </div>

              {/* 6. Launch timeframe and optional budget: side by side from sm (rows shared via subgrid so
                  the dropdowns line up when a label wraps), stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-y-0">
                <div className="sm:grid sm:grid-rows-subgrid sm:row-span-3">
                  <label htmlFor="enquiry-launch" className="block self-end text-xs font-mono mb-1">When would you like to launch?</label>
                  <select
                    id="enquiry-launch"
                    name="launch"
                    value={enquiry.launch}
                    onChange={(e) => updateEnquiry('launch', e.target.value)}
                    className={`w-full p-2.5 rounded text-xs border ${activeTheme.border} ${activeTheme.bg} ${activeTheme.text}`}
                  >
                    <option value="">Select a timeframe</option>
                    {ENQUIRY_LAUNCH_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:grid sm:grid-rows-subgrid sm:row-span-3">
                  <label htmlFor="enquiry-budget" className="block self-end text-xs font-mono mb-1">
                    Do you have a budget in mind?<span className={activeTheme.textMuted}> (optional)</span>
                  </label>
                  <select
                    id="enquiry-budget"
                    name="budget"
                    aria-describedby="enquiry-budget-hint"
                    value={enquiry.budget}
                    onChange={(e) => updateEnquiry('budget', e.target.value)}
                    className={`w-full p-2.5 rounded text-xs border ${activeTheme.border} ${activeTheme.bg} ${activeTheme.text}`}
                  >
                    <option value="">Select a range</option>
                    {ENQUIRY_BUDGET_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <p id="enquiry-budget-hint" className={`text-xs mt-1 ${activeTheme.textMuted}`}>A preference only, not a quote.</p>
                </div>
              </div>

              {/* Honeypot: off-screen, out of the tab order and hidden from assistive technology */}
              <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
                <label htmlFor="enquiry-contact-reference">Leave this field empty</label>
                <input
                  id="enquiry-contact-reference"
                  name="contact_reference"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {submitStatus === 'error' && (
                <p role="alert" className={`text-sm p-3 rounded border border-red-500/60 bg-red-500/10 ${errorText}`}>
                  Sorry, we couldn’t send your enquiry. Your answers are still here, so please try again.
                </p>
              )}

              <div className="pt-6 border-t border-zinc-800/40 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className={`text-xs ${activeTheme.textMuted}`}>
                  <a href="/privacy" className={`underline underline-offset-4 hover:opacity-70 rounded ${FOCUS_RING}`}>
                    We’ll only use your details to reply to your enquiry.
                  </a>
                </p>
                <button
                  type="submit"
                  disabled={submitStatus === 'sending'}
                  className={`px-6 py-2.5 text-xs font-medium rounded flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait ${activeTheme.accent} ${FOCUS_RING}`}
                >
                  {submitStatus === 'sending' ? 'Sending…' : 'Send enquiry'}
                </button>
              </div>
              <p role="status" className="sr-only">{submitStatus === 'sending' ? 'Sending your enquiry…' : ''}</p>
            </form>
          )}
        </div>

        {/* Decorative: the hero's orbit on a faint blueprint grid. Hidden below lg; static with reduced motion. */}
        <div
          aria-hidden="true"
          className={`hidden lg:block lg:sticky lg:top-28 relative aspect-[18/13] overflow-hidden rounded-xl border pointer-events-none select-none ${activeTheme.cardBg} ${activeTheme.border} ${activeTheme.highlight}`}
        >
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '2rem 2rem'
            }}
          />
          <div className="absolute left-1/2 top-1/2 w-[720px] h-[520px] -translate-x-1/2 -translate-y-1/2 scale-[0.58] xl:scale-[0.71]">
            {renderOrbitArtwork('enquire-orbit')}
          </div>
        </div>
        </div>
      </section>
      </main>

      {/* FOOTER */}
      <footer className={`py-12 border-t ${activeTheme.border} ${activeTheme.cardBg} transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-xs uppercase tracking-wider">{studioName}</span>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${activeTheme.badge}`}>
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {STUDIO_AVAILABILITY}
              </span>
            </div>
            <p className={`text-xs ${activeTheme.textMuted}`}>
              Designed, Engineered, Cared for.
            </p>
            <span className={`inline-block text-[10px] px-2 py-0.5 rounded border ${activeTheme.badge}`}>© {new Date().getFullYear()} Iris &amp; Oak</span>
          </div>

          {/* Studio */}
          <nav aria-labelledby="footer-studio-heading">
            <h2 id="footer-studio-heading" className={`text-xs font-mono uppercase tracking-widest mb-3 ${activeTheme.textMuted}`}>Studio</h2>
            <ul className="space-y-2 text-xs font-mono">
              <li><a href="#portfolio" className={`hover:underline rounded ${FOCUS_RING}`}>Portfolio</a></li>
              <li><a href="#services" className={`hover:underline rounded ${FOCUS_RING}`}>Studio Offerings</a></li>
              <li><a href="#engineering" className={`hover:underline rounded ${FOCUS_RING}`}>Engineering</a></li>
              <li className="flex flex-wrap items-center gap-2">
                <button
                  ref={partnershipOpenerRef}
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setIsPartnershipOpen(true)}
                  className={`hover:underline rounded text-left ${FOCUS_RING}`}
                >
                  Portfolio Partnership
                </button>
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${activeTheme.badge}`}>
                  <span className="sr-only">Status: </span>{PARTNERSHIP_STATUS_LABELS[PARTNERSHIP_STATUS]}
                </span>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className={`text-xs font-mono uppercase tracking-widest mb-3 ${activeTheme.textMuted}`}>Contact</h2>
            <ul className="space-y-2 text-xs font-mono">
              <li><a href="#contact" className={`hover:underline rounded ${FOCUS_RING}`}>Enquire</a></li>
              <li><a href={`mailto:${CONTACT_EMAIL}`} className={`hover:underline rounded break-all ${FOCUS_RING}`}>{CONTACT_EMAIL}</a></li>
              <li><a href="/privacy" className={`hover:underline rounded ${FOCUS_RING}`}>Privacy</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* PORTFOLIO PARTNERSHIP POPUP */}
      {isPartnershipOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in motion-reduce:animate-none"
          // Close on a backdrop click only when the press also started on the backdrop
          onMouseDown={(e) => { partnershipBackdropPressRef.current = e.target === e.currentTarget; }}
          onClick={(e) => {
            if (partnershipBackdropPressRef.current && e.target === e.currentTarget) setIsPartnershipOpen(false);
          }}
        >
          <div
            ref={partnershipDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="partnership-dialog-title"
            className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border p-6 md:p-8 shadow-2xl ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`}
          >
            <button
              type="button"
              aria-label="Close Portfolio Partnership details"
              onClick={() => setIsPartnershipOpen(false)}
              className={`absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-800/50 transition-colors ${FOCUS_RING}`}
            >
              <X size={20} aria-hidden="true" />
            </button>

            <h2 id="partnership-dialog-title" className="text-2xl font-bold mb-4 pr-10">Portfolio Partnership</h2>
            <div className={`space-y-4 text-sm leading-relaxed ${activeTheme.textMuted}`}>
              <p>
                Each round, we offer a small number of independent businesses a complimentary website in return for featuring the finished project as a case study.
              </p>
              <p>
                <strong className={activeTheme.text}>Current round: {PARTNERSHIP_STATUS_LABELS[PARTNERSHIP_STATUS]}.</strong>
                {PARTNERSHIP_STATUS !== 'soon' && <> We’re working with <span className="whitespace-nowrap">{PARTNERSHIP_PLACES}</span> local businesses.</>}
              </p>
              <p>
                Want to hear about the next round?{' '}
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    preselectEnquiry({ pkg: 'Portfolio Partnership' });
                    setIsPartnershipOpen(false);
                    // After the popup closes (and returns focus), move on to the enquiry form
                    requestAnimationFrame(() => {
                      window.history.replaceState(null, '', '#contact');
                      document.getElementById('contact')?.scrollIntoView();
                      document.getElementById('enquiry-name')?.focus({ preventScroll: true });
                    });
                  }}
                  className={`font-medium underline underline-offset-4 hover:opacity-70 rounded ${activeTheme.highlight} ${FOCUS_RING}`}
                >
                  Get in touch
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC CONFIGURATOR DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in motion-reduce:animate-none">
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

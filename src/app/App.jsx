import { useState, useEffect, useRef, useCallback, useId } from 'react';
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
  ChevronLeft,
  X,
  Check, 
  Clock,
  ChevronDown
} from 'lucide-react';

// --- PALETTES & THEMES ---
const COLOR_THEMES = {
  monochrome: {
    name: 'Monochrome Dark',
    themeColor: '#09090b', // browser UI colour (meta theme-color)
    scheme: 'dark',
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
    themeColor: '#f5f5f4', // browser UI colour (meta theme-color)
    scheme: 'light',
    bg: 'bg-stone-100',
    text: 'text-stone-900',
    textMuted: 'text-stone-600',
    cardBg: 'bg-white/80',
    border: 'border-stone-200',
    accent: 'bg-red-600 text-white hover:bg-red-700',
    accentBorder: 'border-red-500',
    badge: 'bg-stone-200/80 text-stone-800 border-stone-300',
    highlight: 'text-red-700',
    highContrast: { textMuted: 'text-stone-900', border: 'border-stone-600' }
  },
  cobalt: {
    name: 'Midnight Cobalt',
    themeColor: '#020617', // browser UI colour (meta theme-color)
    scheme: 'dark',
    bg: 'bg-slate-950',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    cardBg: 'bg-slate-900/80',
    border: 'border-slate-800',
    accent: 'bg-indigo-600 text-white hover:bg-indigo-700',
    accentBorder: 'border-indigo-400',
    badge: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/80',
    highlight: 'text-indigo-400',
    highContrast: { textMuted: 'text-slate-200', border: 'border-slate-400' }
  },
  editorial: {
    name: 'Warm Editorial',
    themeColor: '#faf8f5', // browser UI colour (meta theme-color)
    scheme: 'light',
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

const FOCUS_RING = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indicator';

// Focus rings and selected states: emerald-700 on light themes and emerald-400 on dark ones (both at least 3:1).
// RGB channels for the `indicator` / `on-indicator` colours in tailwind.config.js.
const INDICATOR_COLORS = {
  light: { '--indicator': '4 120 87', '--on-indicator': '255 255 255' },
  dark: { '--indicator': '52 211 153', '--on-indicator': '0 0 0' }
};

// --- DISPLAY SETTINGS ---
// Only settings the visitor has chosen are saved; anything not chosen follows their device.
const SETTINGS_STORAGE_KEY = 'iris-oak-display-settings';

// Theme when none is chosen: Midnight Cobalt in dark mode, Warm Editorial otherwise
const DEVICE_THEMES = { light: 'editorial', dark: 'cobalt' };
const DEFAULT_SETTINGS = { typographyKey: 'serif', textSize: 'default' };

// Returns only the saved settings that are still valid.
const loadSavedSettings = () => {
  let saved;
  try {
    saved = JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
  } catch {
    return {};
  }
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};

  const has = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const valid = {};
  if (has(COLOR_THEMES, saved.themeKey)) valid.themeKey = saved.themeKey;
  if (has(TYPOGRAPHY_STYLES, saved.typographyKey) && TYPOGRAPHY_STYLES[saved.typographyKey].available) valid.typographyKey = saved.typographyKey;
  if (has(TEXT_SIZES, saved.textSize)) valid.textSize = saved.textSize;
  if (typeof saved.highContrast === 'boolean') valid.highContrast = saved.highContrast;
  return valid;
};

// Header dropdowns: close on Escape (returning focus to the button) or on a click outside.
function useDropdownDismiss(isOpen, close, containerRef, buttonRef) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
        buttonRef.current?.focus();
      }
    };
    const handlePointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) close();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen, close, containerRef, buttonRef]);
}

// Tracks a media query such as the device's dark mode or contrast setting, including live changes.
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mediaQuery = window.matchMedia(query);
    const update = () => setMatches(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [query]);
  return matches;
}

const FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Portfolio categories, in Portfolio dropdown and /portfolio page order. A category with no projects is hidden.
const PORTFOLIO_CATEGORIES = [
  {
    id: 'client-websites',
    name: 'Client Websites',
    description: 'Websites designed and built for founders and independent businesses'
  },
  {
    id: 'web-apps-tools',
    name: 'Web Apps & Tools',
    description: 'Dashboards, booking systems and internal tools that simplify day-to-day work'
  },
  {
    id: 'product-builds',
    name: 'Product Builds',
    description: 'Self-initiated products exploring real problems, from idea to working prototype'
  },
  {
    id: 'concept-sites',
    name: 'Concept Sites',
    description: 'Design explorations, showing what is possible for different industries'
  }
];

// Portfolio projects. `category` is a PORTFOLIO_CATEGORIES id; on /portfolio it shows as the left image badge.
// `status` (Demo / Prototype) is the right image badge. `eyebrow` (optional) names who the project is for.
// `tags` fill the Tech Stack list in the project popup. `liveUrl` (client sites) and `demoUrl` (product builds)
// add an external link when set. Only add client projects once they're complete and the client has approved featuring them.
// Case-study popup (optional; a project with `caseStudy` uses it instead of details/technicalExecution):
// `mobileImage`/`mobileImageAlt` (a real phone capture, shown beside the desktop image), `quickFacts` ([label, value] pairs),
// `caseStudy` ([heading, text] pairs), `builtWith` (shown above `tags`) and `testimonial` ({ quote, name, role }),
// which renders only when set: add it only once the client has approved the exact wording and attribution.
const SAMPLE_PROJECTS = [
  {
    id: 'kawari-company',
    title: 'The Kawari Company',
    category: 'client-websites',
    status: '',
    liveUrl: 'https://www.kawaricompany.com',
    client: '',
    summary: 'A calm, minimalist first website built for a safeguarding consultancy with more than 25 years of experience: clear, credible and easy to get in touch.',
    tags: ['Next.js', 'TypeScript', 'CSS', 'React'],
    stats: {},
    details: {
      heading: 'Project scope & deliverables',
      text: 'A clean, minimalist website that presents the company’s expertise and services, and gives prospective clients a simple way to get in touch.'
    },
    technicalExecution: 'Built with Next.js and React, with a responsive layout that adapts to different screen sizes.',
    image: '/images/kawari-company/homepage.png',
    imageAlt: 'The Kawari Company homepage: the headline ‘Expert advice. Impacting practice.’ beside a photo of a sunlit stone staircase.',
    // Captured from the live site at 390×844
    mobileImage: '/images/kawari-company/mobile.webp',
    mobileImageAlt: 'The Kawari Company homepage on a phone: the staircase photo above the headline and a ‘Request a Consultation’ button.',
    quickFacts: [
      ['Client', 'The Kawari Company'],
      ['Industry', 'Safeguarding Consultancy'],
      ['Services', 'Design & build'],
      ['Platform', 'Next.js']
    ],
    caseStudy: [
      ['The brief', 'An established consultancy with 25+ years of experience needed its first website, one that felt as credible as its reputation.'],
      ['The approach', 'A calm, editorial design with clear services and a simple route to request a consultation.'],
      ['The result', 'A professional online presence the client can share with confidence.']
    ],
    builtWith: 'Built with Next.js for fast loading, with a layout that adapts to phones, tablets and desktops.',
    testimonial: null
  },
  {
    id: 'maison-vale',
    title: 'Events by Maison Vale',
    category: 'client-websites',
    status: 'In Progress',
    liveUrl: 'https://eventsbymaisonvale.com',
    client: '',
    summary: 'An elegant, editorial website for an events company with almost 30 years of experience in weddings, corporate events and special occasions.',
    tags: ['Squarespace', 'Zapier', 'Resend'],
    stats: {},
    details: {
      heading: 'Project scope & deliverables',
      text: 'A refined, image-led website with dedicated pages for weddings, corporate events and special occasions, each with its own tailored enquiry form. The copy balances warmth with experience, and the special occasions page is written to suit everything from milestone birthdays to funerals.'
    },
    technicalExecution: 'Built on Squarespace so the client can update content themselves, with enquiry forms connected through Zapier and Resend to deliver clear, well-formatted notifications.',
    image: '/images/maison-vale/homepage.png',
    imageAlt: 'Maison Vale Events homepage showing a candlelit reception with tall floral centrepieces.',
    quickFacts: [
      ['Client', 'Events by Maison Vale'],
      ['Industry', 'Weddings & Events'],
      ['Services', 'Design & build'],
      ['Platform', 'Squarespace']
    ],
    caseStudy: [
      ['The brief', 'An events company with almost 30 years of experience needed an elegant website that reflects the care behind every wedding, corporate event and special occasion.'],
      ['The approach', 'A refined, image-led design with dedicated pages for each type of event, warm copy that balances celebration with sensitivity, and tailored enquiry forms for every service.'],
      ['The result', 'A polished online presence that guides each visitor to the right service and makes it easy to start planning.']
    ],
    builtWith: 'Built on Squarespace so the client can update content themselves, with enquiry forms connected through Zapier and Resend, and a layout that adapts to phones, tablets and desktops.',
    testimonial: null
  },
  {
    id: 'bloom',
    title: 'Bloom',
    eyebrow: 'Wellness & routines app',
    category: 'product-builds',
    status: 'Demo',
    demoUrl: 'https://www.bloomapp.uk',
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
    image: '/images/bloom/overview.png',
    imageAlt: 'Bloom landing page: the headline ‘A calmer way to build your day.’ beside a phone showing a day of gentle routines.'
  },
  {
    id: 'partspilot',
    title: 'PartsPilot',
    eyebrow: 'Inventory management',
    category: 'product-builds',
    status: 'Demo',
    demoUrl: 'https://www.partspilot.uk',
    client: '',
    summary: 'Automotive inventory management platform for stock tracking, low-stock alerts and clear reporting for teams, all in one place.',
    tags: ['Python', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker'],
    stats: {},
    details: {
      heading: 'Features & focus',
      items: [
        'Inventory and stock tracking for automotive teams',
        'Low-stock alerts',
        'Category summaries and inventory reporting'
      ]
    },
    technicalExecution: 'Built with a React and TypeScript front end, a Python and FastAPI back end and a PostgreSQL database, with Docker used to containerise the application.',
    image: '/images/partspilot/dashboard.png',
    imageAlt: 'PartsPilot landing page: the headline ‘Smart inventory. Stronger business.’ beside an inventory dashboard with stock figures and a trend chart.'
  },
  {
    id: 'accesshub',
    title: 'AccessHub',
    eyebrow: 'Access management system',
    category: 'product-builds',
    status: 'Demo',
    demoUrl: 'https://accesshub-iris408.vercel.app',
    client: '',
    summary: 'One place to manage people, roles and access requests, so teams always know who can see what. Admins, managers and auditors each get the right level of access.',
    tags: ['Python', 'TypeScript', 'FastAPI', 'PostgreSQL', 'RBAC'],
    stats: {},
    details: {
      heading: 'Features & focus',
      items: [
        'User and role management',
        'Permission assignment',
        'Access request handling in one place'
      ]
    },
    technicalExecution: 'Built with a React and TypeScript front end, a Python and FastAPI back end and a PostgreSQL database, using role-based access control (RBAC) to manage what each user can see and do.',
    image: '/images/accesshub/dashboard.png',
    imageAlt: 'AccessHub sign-in page: the headline ‘A clearer view of who has access.’ above a diagram of admin, manager and viewer/auditor roles, beside a sign-in form.'
  }
];

const projectsInCategory = (categoryId) => SAMPLE_PROJECTS.filter((project) => project.category === categoryId);
const categoryName = (categoryId) => PORTFOLIO_CATEGORIES.find((category) => category.id === categoryId)?.name ?? '';
// Categories with projects (dropdown and page sections)
const VISIBLE_PORTFOLIO_CATEGORIES = PORTFOLIO_CATEGORIES.filter((category) => projectsInCategory(category.id).length > 0);
// A category gets a filter pill only with at least two projects; the filter bar needs at least two such categories
const FILTER_PORTFOLIO_CATEGORIES = VISIBLE_PORTFOLIO_CATEGORIES.filter((category) => projectsInCategory(category.id).length >= 2);
const SHOW_PORTFOLIO_FILTERS = FILTER_PORTFOLIO_CATEGORIES.length >= 2;
// Homepage "Recent Client Work"
const CLIENT_WEBSITE_PROJECTS = projectsInCategory('client-websites');

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
      'Report delivered within 5 business days'
    ],
    note: 'If you start an annual maintenance plan within 14 days, the £149 check-up fee is credited toward it.',
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
      'Email support, reply within 2 business days'
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

// Tools I often use, grouped by what they do for the client
const TOOL_GROUPS = [
  {
    title: 'What you see',
    tools: [
      { name: 'React' },
      { name: 'Next.js' },
      { name: 'TypeScript' },
      { name: 'JavaScript' },
      { name: 'Tailwind CSS' },
      { name: 'Vite' },
      { name: 'Astro' }
    ]
  },
  {
    title: 'Behind the scenes',
    tools: [
      { name: 'Python' },
      { name: 'FastAPI' },
      { name: 'Go' },
      { name: 'Node.js' },
      { name: 'Resend' },
      { name: 'Stripe' }
    ]
  },
  {
    title: 'Your data',
    tools: [
      { name: 'PostgreSQL' },
      { name: 'SQLAlchemy' },
      { name: 'Power BI' },
      { name: 'Alembic' },
      { name: 'SQLite' }
    ]
  },
  {
    title: 'Running & hosting',
    tools: [
      { name: 'Vercel' },
      { name: 'Render' },
      { name: 'Railway' },
      { name: 'Docker' },
      { name: 'GitHub Actions' },
      { name: 'AWS' },
      { name: 'Squarespace' },
      { name: 'Wix' }
    ]
  }
];

// --- STUDIO OFFERINGS ---
// Tabbed categories in the Services section. Site Maintenance links to the existing plans.
// One description per service, shared by the Studio Offerings tabs and the enquiry form choices
const SERVICE_DESCRIPTIONS = {
  websites: 'A new site, or a fresh start for your existing one.',
  'booking-integrations': 'Connect your site to the tools you already use.',
  'business-tools': 'Automations and dashboards that save you time.',
  'web-apps': 'Built from the ground up for your business, with nothing off the shelf.',
  'site-maintenance': 'Updates, checks and support after launch.'
};

const OFFERING_CATEGORIES = [
  { id: 'websites', name: 'Websites', positioning: SERVICE_DESCRIPTIONS.websites, Icon: Layout },
  { id: 'booking-integrations', name: 'Integrations', positioning: SERVICE_DESCRIPTIONS['booking-integrations'], Icon: Layers },
  { id: 'business-tools', name: 'Business Tools', positioning: SERVICE_DESCRIPTIONS['business-tools'], Icon: Zap },
  { id: 'web-apps', name: 'Web Apps', positioning: SERVICE_DESCRIPTIONS['web-apps'], Icon: Server }
];

const CARE_OFFERING = { id: 'site-maintenance', name: 'Site Maintenance', positioning: SERVICE_DESCRIPTIONS['site-maintenance'], Icon: ShieldCheck };

// Header dropdown
const OFFERINGS_MENU = [
  { id: 'websites', label: 'Websites' },
  { id: 'booking-integrations', label: 'Integrations' },
  { id: 'business-tools', label: 'Business Tools' },
  { id: 'web-apps', label: 'Web Apps' },
  { id: 'site-maintenance', label: 'Site Maintenance' }
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
    readyIn: 'Ready in about 1 week',
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
    readyIn: 'Ready in about 1–2 weeks',
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
    readyIn: 'Ready in about 2–3 weeks',
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
    readyIn: 'Ready in 2-3 days',
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
    readyIn: 'Ready in about 4–5 days',
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
    readyIn: 'Ready in about 1–2 weeks',
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
    readyIn: 'Ready in about 1–2 weeks',
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
    readyIn: '',
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

// Dialog handling: focus moves in on open (to `initialFocusRef` if given, else the first control), Escape closes,
// Tab/Shift+Tab stay inside, the rest of the page is inert and doesn't scroll, and on close focus returns to
// `returnFocusRef.current` (read at close time, so a caller can clear it to send focus elsewhere).
function useDialogFocus(isOpen, dialogRef, onClose, returnFocusRef, initialFocusRef) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    // Background: every element outside the dialog's branch becomes inert (no clicks, focus or screen-reader access)
    const inerted = [];
    for (let node = dialog; node?.parentElement && node !== document.body; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node && !sibling.inert && sibling.tagName !== 'SCRIPT') {
          sibling.inert = true;
          inerted.push(sibling);
        }
      }
    }
    // Keep the page still behind the dialog; pad for the scrollbar so the layout doesn't shift
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const previousPadding = root.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;

    const getFocusable = () => Array.from(dialog?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []);
    (initialFocusRef?.current ?? getFocusable()[0])?.focus({ preventScroll: true });

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
      const inside = dialog.contains(document.activeElement);

      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      inerted.forEach((el) => { el.inert = false; });
      root.style.overflow = previousOverflow;
      root.style.paddingRight = previousPadding;
      returnFocusRef.current?.focus();
    };
  }, [isOpen]);
}

// --- Footer details ---
const STUDIO_AVAILABILITY = 'Booking Projects for Winter';

// Portfolio Partnership round status: 'open' | 'filled' | 'soon'
const PARTNERSHIP_STATUS = 'open';
const PARTNERSHIP_STATUS_LABELS = { open: 'Open', filled: 'Places filled', soon: 'Opening soon' };
// Current round's closing date (shown on /portfolio-partnership; nothing expires automatically)
const PARTNERSHIP_DEADLINE = { iso: '2026-11-30', label: '30 November 2026' };
// ?package= value that ticks Websites, notes "Portfolio Partnership" and pre-fills the message on the homepage enquiry form
const PARTNERSHIP_PACKAGE_PARAM = 'portfolio-partnership';
// "Start a similar project" (project popup): starting text for an empty message box, or the line added to a draft
const similarProjectMessage = (project) =>
  `Hi, I’d like to start a project similar to ${project.title}. Here’s a little about my business and what I’m hoping the website will do:`;
const similarProjectLine = (project) => `I’d like to start a project similar to ${project.title}.`;
const PARTNERSHIP_ENQUIRY_MESSAGE = 'Hi, I’m interested in the Portfolio Partnership and would love to hear more. Here’s a little about my business and what I’m hoping the website will do:';

// --- Enquiry form (submits to /api/enquiry; see api/enquiry.js) ---
// Choice ids match the Studio Offerings ids, so "Discuss…" buttons can preselect them.
const ENQUIRY_NEEDS = [
  { id: 'websites', label: 'Websites', desc: SERVICE_DESCRIPTIONS.websites },
  { id: 'booking-integrations', label: 'Integrations', desc: SERVICE_DESCRIPTIONS['booking-integrations'] },
  { id: 'business-tools', label: 'Business Tools', desc: SERVICE_DESCRIPTIONS['business-tools'] },
  { id: 'web-apps', label: 'Web Apps', desc: SERVICE_DESCRIPTIONS['web-apps'] },
  { id: 'site-maintenance', label: 'Site Maintenance', desc: SERVICE_DESCRIPTIONS['site-maintenance'] },
  { id: 'not-sure', label: 'Not sure what you need?', desc: 'Tell me what you’re trying to do, and I’ll suggest the right fit.' }
];
const ENQUIRY_LAUNCH_OPTIONS = ['ASAP', 'Within a month', '1–3 months', 'Flexible', 'To be confirmed'];
const ENQUIRY_BUDGET_OPTIONS = ['Under £1,000', '£1,000–£5,000', '£5,000–£15,000', '£15,000+', 'To be decided'];
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

// --- LOOPING SCROLLERS (portfolio carousel, tool rows) ---
// Categories with at least this many projects loop as a carousel on /portfolio; smaller ones stay a static grid.
const CAROUSEL_MIN_PROJECTS = 3;
const CAROUSEL_INTERVAL_MS = 5000;
const TOOL_ROW_INTERVAL_MS = 2500;
// After the visitor scrolls, swipes or uses the keyboard, automatic movement waits this long before resuming
const MANUAL_SCROLL_PAUSE_MS = 3000;

// Advances a horizontal scroller one item at a time ([data-loop-item] children, in order) and loops forwards only:
// the caller renders copies of the first items after the last one, and once a copy reaches the start the scroller
// jumps to the identical original, so there's no visible backwards slide. Movement pauses while the scroller is
// hovered, focused, scrolled by the visitor or in a background tab. `enabled: false` (reduced motion) turns it off.
// Returns `looping` (true only when the originals overflow, so the caller knows to render the copies) and `active`
// (index of the leading original).
function useLoopingScroller(ref, { count, interval, enabled }) {
  const [looping, setLooping] = useState(false);
  const [active, setActive] = useState(0);

  // Loop only when the original items don't all fit
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) {
      setLooping(false);
      return undefined;
    }
    const measure = () => {
      const items = el.querySelectorAll('[data-loop-item]');
      if (count === 0 || items.length < count) return;
      const style = getComputedStyle(el);
      const contentWidth = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      const last = items[count - 1];
      setLooping(last.offsetLeft + last.offsetWidth - items[0].offsetLeft > contentWidth + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, count, enabled]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !looping) return undefined;
    let hovered = false;
    let focused = false;
    let lastManual = 0;
    let programmatic = false;
    let endTimer;
    const items = () => el.querySelectorAll('[data-loop-item]');
    const position = (index) => {
      const list = items();
      return list[index].offsetLeft - list[0].offsetLeft;
    };
    const nearest = () => {
      const list = items();
      let best = 0;
      let bestDistance = Infinity;
      list.forEach((item, index) => {
        const distance = Math.abs(item.offsetLeft - list[0].offsetLeft - el.scrollLeft);
        if (distance < bestDistance) { bestDistance = distance; best = index; }
      });
      return best;
    };
    const onScrollEnd = () => {
      const index = nearest();
      // A copy is leading: move to the matching original (same picture, so it doesn't show)
      if (index >= count) {
        programmatic = true;
        el.scrollLeft = position(index - count);
        return;
      }
      programmatic = false;
    };
    const onScroll = () => {
      if (!programmatic) lastManual = Date.now();
      setActive(nearest() % count);
      clearTimeout(endTimer);
      endTimer = setTimeout(onScrollEnd, 150);
    };
    const markManual = () => { lastManual = Date.now(); };
    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    const onFocusIn = () => { focused = true; };
    const onFocusOut = (e) => { if (!el.contains(e.relatedTarget)) focused = false; };
    const tick = () => {
      if (hovered || focused || document.hidden || Date.now() - lastManual < MANUAL_SCROLL_PAUSE_MS) return;
      const next = nearest() + 1;
      if (next >= items().length) return;
      programmatic = true;
      el.scrollTo({ left: position(next), behavior: 'smooth' });
    };
    const events = [
      ['scroll', onScroll], ['wheel', markManual], ['touchstart', markManual], ['pointerdown', markManual], ['keydown', markManual],
      ['mouseenter', onEnter], ['mouseleave', onLeave], ['focusin', onFocusIn], ['focusout', onFocusOut]
    ];
    events.forEach(([type, handler]) => el.addEventListener(type, handler, { passive: true }));
    const timer = setInterval(tick, interval);
    return () => {
      clearInterval(timer);
      clearTimeout(endTimer);
      events.forEach(([type, handler]) => el.removeEventListener(type, handler));
    };
  }, [ref, looping, count, interval]);

  return { looping, active };
}

// Copies used for looping are hidden from screen readers and can't be focused
const makeInert = (el) => { if (el) el.inert = true; };

// Case-study screenshots: desktop and phone side by side from sm. Each column is sized by its image's real
// aspect ratio (read once it loads), so both share a height without cropping or stretching.
// On phones they're a swipeable row instead (desktop first), with a position indicator and Previous / Next.
function ScreenshotPair({ desktop, desktopAlt, mobile, mobileAlt, imageClass, controlClass, mutedClass }) {
  const isPhone = useMediaQuery('(max-width: 639px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const scrollerRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [ratios, setRatios] = useState({});
  const record = (key) => (img) => {
    if (img?.complete && img.naturalWidth) {
      const ratio = img.naturalWidth / img.naturalHeight;
      setRatios((current) => (current[key] === ratio ? current : { ...current, [key]: ratio }));
    }
  };
  // The width left after the 1rem gap and each image's 1px borders is shared by aspect ratio, then the borders are
  // added back, so the two images render at exactly the same height. Until both have loaded, a typical 3:1 split.
  const share = ratios.desktop && ratios.mobile ? ratios.desktop / (ratios.desktop + ratios.mobile) : 0.75;
  const columns = `minmax(0, calc((100% - 1rem - 4px) * ${share} + 2px)) minmax(0, 1fr)`;

  // The indicator follows whichever slide is nearest the scroller's left edge, however it got there
  useEffect(() => {
    const el = scrollerRef.current;
    if (!isPhone || !el) return undefined;
    const update = () => {
      const offsets = [...el.children].map((slide) => slide.offsetLeft - el.children[0].offsetLeft);
      const nearest = offsets.reduce((best, offset, i) => (Math.abs(offset - el.scrollLeft) < Math.abs(offsets[best] - el.scrollLeft) ? i : best), 0);
      setIndex(nearest);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    return () => el.removeEventListener('scroll', update);
  }, [isPhone]);

  if (isPhone) {
    const slides = [
      { key: 'desktop', label: 'Desktop', src: desktop, alt: desktopAlt, className: 'w-full' },
      { key: 'mobile', label: 'Mobile', src: mobile, alt: mobileAlt, className: 'w-full max-w-[12rem]' }
    ];
    const goTo = (i) => {
      const el = scrollerRef.current;
      if (!el || i < 0 || i >= slides.length) return;
      el.scrollTo({ left: el.children[i].offsetLeft - el.children[0].offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
    };
    // aria-disabled rather than disabled, so focus stays on the button at either end
    const arrowClass = (disabled) =>
      `inline-flex items-center justify-center w-9 h-9 rounded-full border transition-opacity ${controlClass} ${FOCUS_RING} ${disabled ? 'opacity-40 cursor-default' : 'hover:opacity-80'}`;

    return (
      <div role="region" aria-roledescription="carousel" aria-label="Project screenshots" className="mb-6">
        <div ref={scrollerRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {slides.map((slide, i) => (
            <div key={slide.key} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}: ${slide.label}`} className="shrink-0 w-full snap-start flex items-center justify-center">
              <img ref={record(slide.key)} onLoad={(e) => record(slide.key)(e.currentTarget)} src={slide.src} alt={slide.alt} className={`h-auto ${slide.className} ${imageClass}`} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <button type="button" aria-label="Previous screenshot" aria-disabled={index === 0} onClick={() => goTo(index - 1)} className={arrowClass(index === 0)}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="flex gap-1.5">
              {slides.map((slide, i) => (
                <span key={slide.key} className={`block h-1.5 rounded-full transition-all bg-current ${i === index ? 'w-4' : 'w-1.5 opacity-30'}`} />
              ))}
            </span>
            <span aria-live="polite" className={`text-xs ${mutedClass}`}>{slides[index].label} · {index + 1} of {slides.length}</span>
          </div>
          <button type="button" aria-label="Next screenshot" aria-disabled={index === slides.length - 1} onClick={() => goTo(index + 1)} className={arrowClass(index === slides.length - 1)}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ '--screenshot-columns': columns }} className="grid grid-cols-1 sm:[grid-template-columns:var(--screenshot-columns)] gap-4 items-start mb-6">
      <img ref={record('desktop')} onLoad={(e) => record('desktop')(e.currentTarget)} src={desktop} alt={desktopAlt} className={`w-full h-auto ${imageClass}`} />
      <img ref={record('mobile')} onLoad={(e) => record('mobile')(e.currentTarget)} src={mobile} alt={mobileAlt} className={`w-full max-w-[12rem] sm:max-w-none mx-auto h-auto ${imageClass}`} />
    </div>
  );
}

// Portfolio carousel: two cards at a time from md, one on phones, in a swipeable row that loops 1 → 2 → 3 → 1.
// The leading card gets its hover look while the carousel is moving on its own.
function ProjectCarousel({ label, projects, renderCard }) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const scrollerRef = useRef(null);
  const count = projects.length;
  const { looping, active } = useLoopingScroller(scrollerRef, { count, interval: CAROUSEL_INTERVAL_MS, enabled: !reducedMotion });
  // Two copies cover the two cards visible on desktop
  const slides = looping ? [...projects, ...projects.slice(0, 2)] : projects;

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      {/* Padding leaves room for the highlight's lift and shadow inside the scroll area */}
      <div
        ref={scrollerRef}
        className="-mx-4 px-4 -my-6 py-6 scroll-px-4 flex gap-8 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:thin]"
      >
        {slides.map((project, index) => {
          const isCopy = index >= count;
          return (
            <div
              key={isCopy ? `${project.id}-copy` : project.id}
              data-loop-item=""
              data-project={project.id}
              {...(isCopy
                ? { 'aria-hidden': true, ref: makeInert }
                : { role: 'group', 'aria-roledescription': 'slide', 'aria-label': `${index + 1} of ${count}` })}
              className="grid shrink-0 snap-start w-full md:w-[calc((100%-2rem)/2)]"
            >
              {renderCard(project, { highlighted: looping && index % count === active })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Width of the edge fades on tool rows: no wider than a pill's border and padding, so pill text is never faded
const TOOL_ROW_FADE = '0.75rem';

// Tracks whether a horizontal scroller is at its start and end, so edge fades only show on the side(s) with more.
// `key` re-measures when the scroller's content changes shape.
function useScrollEdges(ref, key) {
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ atStart: el.scrollLeft <= 1, atEnd: el.scrollLeft >= max - 1 });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [ref, key]);

  return edges;
}

const edgeFadeMask = (edges, width = TOOL_ROW_FADE) =>
  `linear-gradient(to right, ${edges.atStart ? '#000' : 'transparent'} 0, #000 ${width}, #000 calc(100% - ${width}), ${edges.atEnd ? '#000' : 'transparent'} 100%)`;

// One "Tools I often use" category: a label and a swipeable row of tool pills that cycles through the tools
// when they don't all fit. Keyboard users can focus the row and scroll it with the arrow keys.
// Soft fades at either edge show there's more to scroll that way (only on the side(s) with more).
function ToolRow({ title, tools, pillClass, labelClass, arrowClass }) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const rowRef = useRef(null);
  const labelId = useId();
  const { looping } = useLoopingScroller(rowRef, { count: tools.length, interval: TOOL_ROW_INTERVAL_MS, enabled: !reducedMotion });
  const items = looping ? [...tools, ...tools] : tools;
  const edges = useScrollEdges(rowRef, looping);
  const fadeMask = edgeFadeMask(edges);

  return (
    <div className="sm:grid sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:items-center sm:gap-3">
      <h4 id={labelId} className={labelClass}>{title}</h4>
      {/* The focus ring sits on this wrapper, outside the faded area, so the fades can't hide it */}
      <div className="mt-2 sm:mt-0 rounded has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indicator">
      <div
        ref={rowRef}
        tabIndex={0}
        role="region"
        aria-labelledby={labelId}
        data-fade-start={!edges.atStart || undefined}
        data-fade-end={!edges.atEnd || undefined}
        style={{ maskImage: fadeMask, WebkitMaskImage: fadeMask }}
        className="py-1 overflow-x-auto snap-x snap-mandatory overscroll-x-contain rounded focus:outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex items-center w-max">
          {items.map((tool, index) => {
            const isCopy = index >= tools.length;
            return (
              <li key={isCopy ? `${tool.name}-copy` : tool.name} data-loop-item="" aria-hidden={isCopy || undefined} className="flex items-center snap-start shrink-0">
                <span className={pillClass}>{tool.name}</span>
                {(looping || index < tools.length - 1) && <span aria-hidden="true" className={`px-1.5 text-xs ${arrowClass}`}>⊹</span>}
              </li>
            );
          })}
        </ul>
      </div>
      </div>
    </div>
  );
}

// `page`: 'home' (index.html), 'portfolio' (/portfolio), 'partnership' (/portfolio-partnership) or 'not-found' (404.html)
export default function App({ page = 'home' }) {
  const isHome = page === 'home';
  // Links to homepage sections work from either page
  const homeHref = (hash) => (isHome ? hash : `/${hash}`);

  // Display settings: the visitor's saved choices, otherwise their device settings (drawer state is not persisted)
  const [savedSettings, setSavedSettings] = useState(loadSavedSettings);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersMoreContrast = useMediaQuery('(prefers-contrast: more)');
  const themeKey = savedSettings.themeKey ?? DEVICE_THEMES[prefersDark ? 'dark' : 'light'];
  const typographyKey = savedSettings.typographyKey ?? DEFAULT_SETTINGS.typographyKey;
  const textSize = savedSettings.textSize ?? DEFAULT_SETTINGS.textSize;
  const highContrast = savedSettings.highContrast ?? prefersMoreContrast;
  const [displayStatus, setDisplayStatus] = useState(''); // announced after a reset
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const configButtonRef = useRef(null);
  const drawerRef = useRef(null);

  // Studio Details
  const studioName = "IRIS & OAK";
  const studioTagline = 'I design and build high-precision websites and platforms, and provide ongoing care so you can scale with confidence.';
  const studioStatus = 'Now Booking Projects for Winter';

  // Filtering state (/portfolio)
  const [activeCategory, setActiveCategory] = useState('all');
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
  const enquiryHeadingRef = useRef(null);
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // 'monthly' | 'annual'
  // Phones show one care plan at a time; this is the one picked (it doesn't change with the billing period)
  const [carePlanId, setCarePlanId] = useState('tier-growth');

  // Below `sm`, the offering tabs become one swipeable row styled like the billing toggle
  const isPhone = useMediaQuery('(max-width: 639px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Studio Offerings tabs + header dropdown
  const [offeringTab, setOfferingTab] = useState('websites');
  const offeringTabListRef = useRef(null);
  const offeringTabEdges = useScrollEdges(offeringTabListRef, isPhone);
  const [isOfferingsMenuOpen, setIsOfferingsMenuOpen] = useState(false);
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false);
  const portfolioMenuRef = useRef(null);
  const portfolioMenuButtonRef = useRef(null);
  const offeringsRef = useRef(null);
  const offeringTabRefs = useRef({});
  const offeringsMenuRef = useRef(null);
  const offeringsMenuButtonRef = useRef(null);
  const carePlansRef = useRef(null);

  // Tools I often use
  const toolsGridRef = useRef(null);
  const [toolsRevealed, setToolsRevealed] = useState(false);
  const [toolsRevealDone, setToolsRevealDone] = useState(false);

  const activeTheme = highContrast
    ? { ...COLOR_THEMES[themeKey], ...COLOR_THEMES[themeKey].highContrast }
    : COLOR_THEMES[themeKey];
  const activeFont = TYPOGRAPHY_STYLES[typographyKey];
  // Green status text: emerald-400 lacks contrast on the light themes, so use emerald-700 there
  const successText = activeTheme.scheme === 'light' ? 'text-emerald-700' : 'text-emerald-400';
  const errorText = activeTheme.scheme === 'light' ? 'text-red-700' : 'text-red-400';

  // Settings apply as soon as they're chosen; there is no separate Apply step
  const chooseSetting = (key, value) => {
    setSavedSettings((prev) => ({ ...prev, [key]: value }));
    setDisplayStatus('');
  };
  const resetDisplaySettings = () => {
    setSavedSettings({});
    setDisplayStatus('Display settings now follow your device.');
  };

  useEffect(() => {
    document.documentElement.style.fontSize = TEXT_SIZES[textSize].value;
  }, [textSize]);

  // Native form controls and scrollbars match the theme
  useEffect(() => {
    document.documentElement.style.colorScheme = activeTheme.scheme;
  }, [activeTheme.scheme]);

  // Browser UI colour follows the active display theme (replaces the light/dark defaults in the HTML)
  useEffect(() => {
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute('content', activeTheme.themeColor));
  }, [activeTheme.themeColor]);

  useEffect(() => {
    try {
      if (Object.keys(savedSettings).length > 0) {
        window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(savedSettings));
      } else {
        window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
      }
    } catch {
      // Storage unavailable (private mode, blocked site data): settings last for this visit only.
    }
  }, [savedSettings]);

  useDialogFocus(isDrawerOpen, drawerRef, () => setIsDrawerOpen(false), configButtonRef);

  // Project popup: opened from a card's title button, which gets focus back on close.
  // Focus starts on the title so the top of the case study is in view.
  const projectDialogRef = useRef(null);
  const projectTitleRef = useRef(null);
  const projectOpenerRef = useRef(null);
  const projectBackdropPressRef = useRef(false);
  useDialogFocus(!!selectedProject, projectDialogRef, () => setSelectedProject(null), projectOpenerRef, projectTitleRef);


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
    selectOfferingTab(id);
    requestAnimationFrame(() => {
      offeringsRef.current?.scrollIntoView();
      if (focusTab) offeringTabRefs.current[id]?.focus({ preventScroll: true });
    });
  };

  // /portfolio: bring a category section into view (and focus its heading) for links such as /portfolio#product-builds
  const showPortfolioCategory = (id, { focus = false } = {}) => {
    if (!VISIBLE_PORTFOLIO_CATEGORIES.some((category) => category.id === id)) return;
    setActiveCategory('all');
    requestAnimationFrame(() => {
      const heading = document.getElementById(`${id}-title`);
      heading?.closest('section')?.scrollIntoView();
      if (focus) heading?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (page !== 'portfolio') return undefined;
    const syncFromHash = () => showPortfolioCategory(window.location.hash.slice(1));
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [page]);

  const handlePortfolioMenuSelect = (e, id) => {
    setIsPortfolioMenuOpen(false);
    if (page !== 'portfolio') return; // follow the link to /portfolio#id
    e.preventDefault();
    window.history.replaceState(null, '', `#${id}`);
    showPortfolioCategory(id, { focus: true });
  };

  // Support links such as /#web-apps by opening the matching tab. Arriving from another page (e.g. /#contact),
  // scroll to the section once it has rendered: the browser's own jump runs before the app has drawn the page.
  useEffect(() => {
    if (!isHome) return undefined;
    const syncFromHash = (initial = false) => {
      const id = window.location.hash.slice(1);
      if (OFFERING_CATEGORIES.some((c) => c.id === id)) showOffering(id);
      else if (initial && id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    };
    syncFromHash(true);
    const handleHashChange = () => syncFromHash();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const closeOfferingsMenu = useCallback(() => setIsOfferingsMenuOpen(false), []);
  const closePortfolioMenu = useCallback(() => setIsPortfolioMenuOpen(false), []);
  useDropdownDismiss(isOfferingsMenuOpen, closeOfferingsMenu, offeringsMenuRef, offeringsMenuButtonRef);
  useDropdownDismiss(isPortfolioMenuOpen, closePortfolioMenu, portfolioMenuRef, portfolioMenuButtonRef);

  const handleOfferingsMenuSelect = (e, id) => {
    setIsOfferingsMenuOpen(false);
    if (!isHome) return; // follow the link to /#id
    e.preventDefault();
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
    selectOfferingTab(next);
    offeringTabRefs.current[next]?.focus();
  };

  // Site Maintenance card beside the offering tabs (after the tab panels on phones)
  const renderCareOfferingLink = () => (
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
  );

  // On phones, scroll the tab row sideways (never the page) so the chosen tab sits clear of the edge fades
  const selectOfferingTab = (id) => {
    setOfferingTab(id);
    const row = offeringTabListRef.current;
    const tab = offeringTabRefs.current[id];
    if (!isPhone || !row || !tab) return;
    const pad = 12;
    const left = tab.offsetLeft - pad;
    const right = tab.offsetLeft + tab.offsetWidth + pad - row.clientWidth;
    const target = left < row.scrollLeft ? left : right > row.scrollLeft ? right : null;
    if (target !== null) row.scrollTo({ left: target, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  // Portfolio card and popup actions: client sites open as "View project", portfolio builds as "See how it works"
  const projectActionLabel = (project) => (project.category === 'client-websites' ? 'View project' : 'See how it works');

  // "Visit live site ↗" for client sites, "View demo ↗" for portfolio builds; nothing without a URL
  const renderExternalProjectLink = (project, className = '') => {
    const href = project.liveUrl || project.demoUrl;
    if (!href) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`underline underline-offset-4 hover:opacity-70 rounded ${FOCUS_RING} ${className}`}
      >
        {project.liveUrl ? 'Visit live site' : 'View demo'}
        <span aria-hidden="true"> ↗</span>
        <span className="sr-only">: {project.title} (opens in a new tab)</span>
      </a>
    );
  };

  // Project card for the homepage and /portfolio. `showCategory` adds the category badge (on /portfolio).
  // `highlighted` gives the card its hover look (used by the carousel for the active project).
  const renderProjectCard = (project, { headingLevel = 3, showCategory = false, highlighted = false } = {}) => {
    const Title = `h${headingLevel}`;
    const badgeClass = `text-[11px] uppercase font-mono tracking-wider px-2 py-1 rounded border shadow-sm ${activeTheme.bg} ${activeTheme.text} ${activeTheme.border}`;
    return (
      <div
        key={project.id}
        className={`group relative cursor-pointer rounded-lg border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 motion-reduce:hover:translate-y-0 has-[button:focus-visible]:outline has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-indicator ${highlighted ? 'shadow-xl -translate-y-1' : ''} ${activeTheme.border} ${activeTheme.cardBg}`}
      >
        {/* Card Image. Badges use the theme's solid background and text colours so they stay readable over any screenshot. */}
        <div className="relative aspect-video overflow-hidden bg-zinc-900">
          <img
            src={project.image}
            alt={project.imageAlt}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100 ${highlighted ? 'scale-105' : ''}`}
          />
          {showCategory && (
            <div className="absolute top-3 left-3">
              <span className={badgeClass}>{categoryName(project.category)}</span>
            </div>
          )}
          {project.status && (
            <div className="absolute top-3 right-3">
              <span className={badgeClass}>{project.status}</span>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6">
          {project.eyebrow && (
            <p className={`text-[11px] font-mono uppercase tracking-widest mb-2 ${activeTheme.textMuted}`}>{project.eyebrow}</p>
          )}
          <Title className="text-xl font-bold group-hover:underline">{project.title}</Title>
          {project.summary && (
            <p className={`text-sm leading-relaxed mt-3 ${activeTheme.textMuted}`}>{project.summary}</p>
          )}

          {/* Actions. The project button's ::after covers the whole card, so the card stays clickable;
              the external link sits above it (relative z-10) so it works on its own. */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-sm font-medium">
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={(e) => {
                projectOpenerRef.current = e.currentTarget;
                setSelectedProject(project);
              }}
              className="inline-flex items-center gap-1 text-left cursor-pointer focus:outline-none after:absolute after:inset-0 after:content-['']"
            >
              {projectActionLabel(project)}
              <span className="sr-only">: {project.title}</span>
              <ChevronRight size={14} aria-hidden="true" />
            </button>
            {renderExternalProjectLink(project, 'relative z-10')}
          </div>
        </div>
      </div>
    );
  };

  // Package card shared by Websites and Integrations.
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
    const timer = setTimeout(() => setToolsRevealDone(true), TOOL_GROUPS.length * 70 + 600);
    return () => clearTimeout(timer);
  }, [toolsRevealed, toolsRevealDone]);


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

  // Bring the enquiry form into view and focus its heading (after a popup has closed and released the page)
  const focusEnquiryForm = () => {
    requestAnimationFrame(() => {
      document.getElementById('contact')?.scrollIntoView();
      enquiryHeadingRef.current?.focus({ preventScroll: true });
    });
  };

  // "Start a similar project": note the project in the message box. An empty box gets the full starting text;
  // a draft is kept as typed, with the project added on its own line (once).
  const prefillSimilarProject = (project) => {
    setEnquiry((prev) => {
      if (prev.message.includes(`similar to ${project.title}`)) return prev;
      const message = prev.message.trim()
        ? `${prev.message.trimEnd()}\n\n${similarProjectLine(project)}`
        : similarProjectMessage(project);
      return { ...prev, message };
    });
  };

  // Enquiry links in the project popup. On the homepage: close the popup and move focus to the form
  // (not back to the card). Elsewhere the link opens the homepage form (?project= pre-fills it there).
  const handleProjectEnquiry = (e, project, { prefill = false } = {}) => {
    if (!isHome) {
      setSelectedProject(null);
      return;
    }
    e.preventDefault();
    if (prefill) prefillSimilarProject(project);
    projectOpenerRef.current = null;
    setSelectedProject(null);
    focusEnquiryForm();
  };

  // Links such as /?project=kawari-company#contact ("Start a similar project" from /portfolio)
  useEffect(() => {
    if (!isHome) return;
    const params = new URLSearchParams(window.location.search);
    const project = SAMPLE_PROJECTS.find((p) => p.caseStudy && p.id === params.get('project'));
    if (!project) return;
    prefillSimilarProject(project);
    window.history.replaceState(null, '', `/${window.location.hash}`);
    focusEnquiryForm();
  }, [isHome]);

  // Links such as /?package=portfolio-partnership#contact (from the Portfolio Partnership page)
  useEffect(() => {
    if (!isHome) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('package') !== PARTNERSHIP_PACKAGE_PARAM) return;
    preselectEnquiry({ need: 'websites', pkg: 'Portfolio Partnership' });
    // Starting text only: the visitor can edit or clear it
    setEnquiry((prev) => (prev.message ? prev : { ...prev, message: PARTNERSHIP_ENQUIRY_MESSAGE }));
    window.history.replaceState(null, '', `/${window.location.hash}`);
  }, [isHome]);

  return (
    <div
      style={INDICATOR_COLORS[activeTheme.scheme]}
      className={`min-h-screen ${activeTheme.bg} ${activeTheme.text} ${activeFont.class} transition-colors duration-300 motion-reduce:transition-none relative selection:bg-zinc-700 selection:text-white`}
    >
      
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
          {/* Phones: the brand takes the room the header controls leave, and the descriptor wraps under the name if it can't fit beside it */}
          <div className="flex flex-1 basis-0 min-w-0 mr-3 md:flex-none md:basis-auto md:mr-0 items-center gap-3 whitespace-nowrap">
            <div aria-hidden="true" className="shrink-0 w-3 h-3 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
            <div className="flex flex-wrap items-baseline gap-x-2 min-w-0">
              <a href="/" className="font-bold tracking-wider text-sm uppercase">
                {studioName}
              </a>
              <span className={`md:hidden text-xs font-normal ${activeTheme.textMuted}`}>Design Studio</span>
            </div>
            <span className={`hidden md:inline-block text-xs px-2 py-0.5 rounded border ${activeTheme.badge}`}>
              Digital Studio
            </span>
          </div>

          {/* Navigation Items */}
          <nav className={`hidden md:flex order-last xl:order-none w-full xl:w-auto justify-center items-center gap-8 pt-3 xl:pt-0 border-t xl:border-t-0 ${activeTheme.border} text-xs font-medium tracking-wide uppercase`}>
            <div ref={portfolioMenuRef} className="relative">
              <button
                ref={portfolioMenuButtonRef}
                type="button"
                aria-expanded={isPortfolioMenuOpen}
                aria-controls="portfolio-menu"
                onClick={() => {
                  setIsOfferingsMenuOpen(false);
                  setIsPortfolioMenuOpen((open) => !open);
                }}
                className={`inline-flex items-center gap-1 uppercase tracking-wide hover:opacity-70 transition-opacity rounded ${FOCUS_RING}`}
              >
                Portfolio
                <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${isPortfolioMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isPortfolioMenuOpen && (
                <ul
                  id="portfolio-menu"
                  className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 w-72 py-2 rounded-lg border shadow-xl animate-fade-in motion-reduce:animate-none ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`}
                >
                  {VISIBLE_PORTFOLIO_CATEGORIES.map((category) => (
                    <li key={category.id}>
                      <a
                        href={`/portfolio#${category.id}`}
                        onClick={(e) => handlePortfolioMenuSelect(e, category.id)}
                        className={`block px-4 py-2.5 hover:opacity-70 transition-opacity ${FOCUS_RING}`}
                      >
                        <span className="block">{category.name}</span>
                        {category.description && (
                          <span className={`block mt-0.5 text-[11px] font-normal normal-case tracking-normal ${activeTheme.textMuted}`}>{category.description}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div ref={offeringsMenuRef} className="relative">
              <button
                ref={offeringsMenuButtonRef}
                type="button"
                aria-expanded={isOfferingsMenuOpen}
                aria-controls="offerings-menu"
                onClick={() => {
                  setIsPortfolioMenuOpen(false);
                  setIsOfferingsMenuOpen((open) => !open);
                }}
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
                        href={homeHref(`#${item.id}`)}
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
            <a href={homeHref('#engineering')} className="hover:opacity-70 transition-opacity">Engineering</a>
          </nav>

          {/* Action Controls */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              ref={configButtonRef}
              aria-haspopup="dialog"
              aria-expanded={isDrawerOpen}
              aria-label="Display settings"
              onClick={() => {
                setDisplayStatus('');
                setIsDrawerOpen(true);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded border transition-all ${activeTheme.accentBorder} ${activeTheme.cardBg} hover:opacity-90 ${FOCUS_RING}`}
            >
              <Sliders size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Display settings</span>
            </button>
            
            <a
              href={homeHref('#contact')}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${activeTheme.accent}`}
            >
              Enquire
            </a>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {isHome && (<>
      {/* DYNAMIC STUDIO HER0 SECTION */}
      <section className="relative isolate pt-20 pb-16 md:pt-32 md:pb-24 border-b border-dashed border-zinc-800/40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Decorative slow-orbit background (behind content, non-interactive, static with reduced motion).
            From xl the orbit moves right by up to --orbit-shift. It moves with its clipping layer into the margin
            beside the centred 80rem container, but never further than that margin (less 10px for a scrollbar),
            so it can't cause sideways scrolling, even with larger text widening the container. Where there's no
            margin, the stage still moves --orbit-nudge past the layer's edge (the artwork stops ~47px short of
            the stage's right edge, so that never clips it). */}
        <div
          aria-hidden="true"
          style={{
            '--orbit-room': 'clamp(0px, (100vw - 80rem) / 2 - 10px, var(--orbit-shift, 0px))',
            right: 'calc(-1 * var(--orbit-room))'
          }}
          className={`pointer-events-none select-none absolute inset-y-0 left-0 -z-10 overflow-hidden xl:[--orbit-nudge:24px] xl:[--orbit-shift:24px] min-[1440px]:[--orbit-shift:80px] min-[1680px]:[--orbit-shift:120px] ${activeTheme.highlight}`}
        >
          {/* Fixed 720×520 stage (matches ORBIT_PATH coordinates), scaled down on smaller screens */}
          <div
            style={{ right: 'calc(-1 * max(0px, var(--orbit-nudge, 0px) - var(--orbit-room)))' }}
            className="absolute top-1/2 -translate-y-1/2 w-[720px] h-[520px] origin-right scale-[0.55] sm:scale-75 lg:scale-100 opacity-70 md:opacity-100"
          >
            {renderOrbitArtwork('hero-orbit')}
          </div>
        </div>

        <div className="max-w-4xl">
          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs rounded-full border mb-6 backdrop-blur-sm opacity-90 border-emerald-500/30 bg-emerald-500/10 ${successText}`}>
            <span aria-hidden="true" className="leading-none">⛇</span>
            <span>{studioStatus}</span>
          </div>

          {/* Editable Studio Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-8 lg:text-balance">
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
              href="/portfolio"
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
            <div className="text-2xl font-bold font-mono">1–4 weeks</div>
            <div className={`text-xs ${activeTheme.textMuted}`}>Typical delivery time</div>
            <div className={`text-[10px] italic ${activeTheme.textMuted}`}>
              Larger projects may take longer.
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">2–4</div>
            <div className={`text-xs ${activeTheme.textMuted}`}>Instalment payment options</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">One contact</div>
            <div className={`text-xs ${activeTheme.textMuted}`}>From first call to launch</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono">6+ platforms</div>
            <div className={`text-xs ${activeTheme.textMuted}`}>Covered by site maintenance</div>
          </div>
        </div>
      </section>

      {/* SECTION 1: RECENT CLIENT WORK (client websites only; everything else is on /portfolio) */}
      <section id="portfolio" className="scroll-mt-16 md:scroll-mt-28 xl:scroll-mt-16 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Portfolio / Archive</div>
            <h2 className="text-3xl font-bold tracking-tight">Recent Client Work</h2>
          </div>
          <a href="/portfolio" className={`inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline rounded ${FOCUS_RING}`}>
            View full portfolio
            <ChevronRight size={14} aria-hidden="true" />
          </a>
        </div>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          {CLIENT_WEBSITE_PROJECTS.map((project) => renderProjectCard(project))}
        </div>
      </section>
      </>)}

      {/* PORTFOLIO PAGE (/portfolio): one section per category that has projects */}
      {page === 'portfolio' && (
      <div className="pt-16 pb-20 md:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Portfolio / Archive</div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Portfolio</h1>
          </div>

          {/* Category Filter Pills (only categories with at least two projects, and only when two or more qualify) */}
          {SHOW_PORTFOLIO_FILTERS && (
          <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
            {[{ id: 'all', name: 'All' }, ...FILTER_PORTFOLIO_CATEGORIES].map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-2 text-xs rounded border transition-all ${FOCUS_RING} ${
                  activeCategory === category.id
                    ? `${activeTheme.accent} border-transparent`
                    : `${activeTheme.cardBg} ${activeTheme.border} ${activeTheme.textMuted} hover:opacity-80`
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          )}
        </div>

        {/* Announces how many projects the filter shows */}
        {SHOW_PORTFOLIO_FILTERS && (
        <p role="status" className="sr-only">
          {(() => {
            const count = activeCategory === 'all' ? SAMPLE_PROJECTS.length : projectsInCategory(activeCategory).length;
            return `Showing ${count} ${count === 1 ? 'project' : 'projects'}`;
          })()}
        </p>
        )}

        <div className="space-y-20">
          {VISIBLE_PORTFOLIO_CATEGORIES
            .filter((category) => activeCategory === 'all' || category.id === activeCategory)
            .map((category) => (
            <section key={category.id} id={category.id} aria-labelledby={`${category.id}-title`} className="scroll-mt-20 md:scroll-mt-32 xl:scroll-mt-20">
              <h2 id={`${category.id}-title`} tabIndex={-1} className="text-2xl font-bold tracking-tight focus:outline-none">{category.name}</h2>
              {category.description && <p className={`text-sm mt-2 ${activeTheme.textMuted}`}>{category.description}</p>}
              {projectsInCategory(category.id).length >= CAROUSEL_MIN_PROJECTS ? (
                <div className="mt-8">
                  <ProjectCarousel
                    label={`${category.name} projects`}
                    projects={projectsInCategory(category.id)}
                    renderCard={(project, options) => renderProjectCard(project, { ...options, showCategory: true })}
                  />
                </div>
              ) : (
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 mt-8">
                  {projectsInCategory(category.id).map((project) => renderProjectCard(project, { showCategory: true }))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
      )}

      {/* PORTFOLIO PARTNERSHIP PAGE (/portfolio-partnership) */}
      {page === 'partnership' && (
      <div className="pt-16 pb-24 md:pt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Partnership</div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Portfolio Partnership</h1>

        {/* Deadline. No automatic expiry: update PARTNERSHIP_DEADLINE (and PARTNERSHIP_STATUS) by hand when the round closes */}
        <p className={`mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-l-4 border ${activeTheme.border} ${activeTheme.cardBg} text-sm font-medium`}>
          <span aria-hidden="true" className="w-2 h-2 shrink-0 rounded-full bg-emerald-500" />
          <span>
            Current Round: Open until <time dateTime={PARTNERSHIP_DEADLINE.iso} className="font-bold whitespace-nowrap">{PARTNERSHIP_DEADLINE.label}</time>
          </span>
        </p>

        <p className="mt-8 text-lg sm:text-xl leading-relaxed">
          A website for your business, a case study for mine. 
          <br />Each round, I build websites for two independent
          businesses with my <em>design and development fee waived</em>.
        </p>

        <ul className="mt-10 grid gap-4">
          <li className={`p-5 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
            <p className="text-base leading-relaxed">
              <strong className={`font-bold ${activeTheme.highlight}`}>Included:</strong> A three-page Signature website, designed, built and launched with you.
            </p>
          </li>
          <li className={`p-5 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}>
            <p className="text-base leading-relaxed">
              <strong className={`font-bold ${activeTheme.highlight}`}>You cover:</strong> Your domain, hosting and any paid tools, plus permission for me to feature the finished site as a case study.
            </p>
          </li>
          <li className={`p-5 rounded-lg border border-dashed ${activeTheme.border}`}>
            <p className={`text-base leading-relaxed ${activeTheme.textMuted}`}>
              <strong className={`font-bold ${activeTheme.text}`}>Not a good fit</strong> if you need an online shop or more than three pages.
            </p>
          </li>
        </ul>

        <p className={`mt-10 text-base leading-relaxed ${activeTheme.textMuted}`}>
          Tell me a little about your business, and I’ll send you the full details.
        </p>
        {/* Opens the homepage enquiry form with Websites ticked and "Portfolio Partnership" noted as the package */}
        <a
          href={`/?package=${PARTNERSHIP_PACKAGE_PARAM}#contact`}
          className={`inline-flex items-center gap-2 mt-6 px-6 py-3 rounded text-sm font-medium transition-all shadow-sm ${activeTheme.accent} ${FOCUS_RING}`}
        >
          Apply for this round
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      )}

      {/* NOT FOUND PAGE (404.html) */}
      {page === 'not-found' && (
      <div className="pt-16 pb-24 md:pt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Decorative character: a puzzled acorn (theme colour via currentColor) */}
        <svg viewBox="0 0 160 180" aria-hidden="true" focusable="false" className={`mx-auto w-32 h-36 sm:w-40 sm:h-44 ${activeTheme.highlight}`}>
          <path d="M80 44 Q83 28 98 22" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M28 74 Q80 18 132 74 Q132 86 120 88 L40 88 Q28 86 28 74 Z" fill="currentColor" fillOpacity="0.85" />
          <path d="M44 66 Q80 44 116 66 M38 78 Q80 58 122 78" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" fill="none" />
          <path d="M42 88 Q38 142 80 162 Q122 142 118 88 Z" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2.5" />
          <path d="M55 104 Q63 98 71 102 M89 102 Q97 98 105 104" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="63" cy="115" r="5" fill="currentColor" />
          <circle cx="97" cy="115" r="5" fill="currentColor" />
          <ellipse cx="80" cy="136" rx="6" ry="7" stroke="currentColor" strokeWidth="3" fill="none" />
          <path d="M136 24 Q136 14 146 14 Q156 14 156 24 Q156 31 147 34 L147 40 M147 48 L147 49" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
        <p className={`mt-8 text-xs uppercase font-mono tracking-widest ${activeTheme.textMuted}`}>Error 404</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">Page not found</h1>
        <p className={`mt-4 text-base leading-relaxed ${activeTheme.textMuted}`}>
          Sorry, the page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/" className={`inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium shadow-sm ${activeTheme.accent} ${FOCUS_RING}`}>
            Back to the homepage
          </a>
          <a href="/#contact" className={`inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium border ${activeTheme.border} ${activeTheme.cardBg} hover:opacity-80 ${FOCUS_RING}`}>
            Make an enquiry
          </a>
        </div>
      </div>
      )}

      {/* PROJECT DEEP DIVE MODAL. Projects with `caseStudy` get the case-study layout; others keep scope, technical and stack sections. */}
      {selectedProject && (() => {
        const project = selectedProject;
        const isCaseStudy = !!project.caseStudy;
        // Light editorial section labels (the site's type, not bold mono)
        const sectionLabel = `text-xs uppercase tracking-[0.12em] font-medium ${activeTheme.textMuted}`;
        const tagList = (
          <ul className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li key={tag} className={`text-xs px-2.5 py-1 rounded border ${activeTheme.badge}`}>{tag}</li>
            ))}
          </ul>
        );
        return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in motion-reduce:animate-none"
          // Close on a backdrop click or tap only when the press also started on the backdrop
          // (not a text selection or drag that began inside the popup)
          onPointerDown={(e) => { projectBackdropPressRef.current = e.target === e.currentTarget; }}
          onClick={(e) => {
            if (projectBackdropPressRef.current && e.target === e.currentTarget) setSelectedProject(null);
          }}
        >
          <div
            ref={projectDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-dialog-title"
            className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto overscroll-contain rounded-xl border p-6 md:p-8 shadow-2xl ${activeTheme.bg} ${activeTheme.border} ${activeTheme.text}`}
          >
            
            <button
              type="button"
              aria-label="Close project details"
              onClick={() => setSelectedProject(null)}
              className={`absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-800/50 transition-colors ${FOCUS_RING}`}
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="mb-6 pr-12">
              {project.eyebrow && (
                <p className={sectionLabel}>{project.eyebrow}</p>
              )}
              <h2 ref={projectTitleRef} tabIndex={-1} id="project-dialog-title" className="text-2xl sm:text-3xl font-bold mt-2 mb-1 focus:outline-none">{project.title}</h2>
              {project.status && (
                <p className={sectionLabel}>{project.status}</p>
              )}
              {project.client && <p className={`text-sm ${activeTheme.textMuted}`}>Client Partner: {project.client}</p>}
              {/* Case studies show the live-site link with the footer actions instead */}
              {!isCaseStudy && (project.liveUrl || project.demoUrl) && (
                <div className="mt-4 text-sm font-medium">{renderExternalProjectLink(project)}</div>
              )}
            </div>

            {/* Images: desktop and phone screenshots when there's a phone capture, otherwise the desktop one alone,
                shown at its own proportions */}
            {project.mobileImage ? (
              <ScreenshotPair
                key={project.id}
                desktop={project.image}
                desktopAlt={project.imageAlt}
                mobile={project.mobileImage}
                mobileAlt={project.mobileImageAlt}
                imageClass={`rounded-lg border ${activeTheme.border}`}
                controlClass={`${activeTheme.border} ${activeTheme.cardBg}`}
                mutedClass={activeTheme.textMuted}
              />
            ) : (
              <div className="rounded-lg overflow-hidden mb-6 border border-zinc-800">
                <img src={project.image} alt={project.imageAlt} className="block w-full h-auto" />
              </div>
            )}

            {project.quickFacts && (
              <dl className={`grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 py-5 mb-8 border-y ${activeTheme.border}`}>
                {project.quickFacts.map(([label, value]) => (
                  <div key={label}>
                    <dt className={sectionLabel}>{label}</dt>
                    <dd className="mt-1 text-sm">{value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {Object.keys(project.stats).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Object.entries(project.stats).map(([key, val]) => (
                <div key={key} className={`p-4 rounded border ${activeTheme.cardBg} ${activeTheme.border}`}>
                  <div className="text-xl font-bold font-mono">{val}</div>
                  <div className={`text-xs capitalize font-mono ${activeTheme.textMuted}`}>{key.replace(/([A-Z])/g, ' $1')}</div>
                </div>
              ))}
            </div>
            )}

            <div className="space-y-8">
              {isCaseStudy ? (<>
                <div className="space-y-6">
                  {project.caseStudy.map(([heading, text]) => (
                    <div key={heading} className="sm:grid sm:grid-cols-[9rem_1fr] sm:gap-6">
                      <h3 className={`${sectionLabel} sm:pt-1`}>{heading}</h3>
                      <p className="mt-2 sm:mt-0 text-base leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>

                {(project.builtWith || project.tags.length > 0) && (
                <div>
                  <h3 className={`${sectionLabel} mb-2`}>How it’s built</h3>
                  {project.builtWith && <p className={`text-sm leading-relaxed mb-3 ${activeTheme.textMuted}`}>{project.builtWith}</p>}
                  {project.tags.length > 0 && tagList}
                </div>
                )}

                {/* Rendered only with a client-approved quote and attribution in the project data */}
                {project.testimonial?.quote && (
                  <figure className={`pl-5 border-l-2 ${activeTheme.border}`}>
                    <blockquote className="text-lg leading-relaxed italic">
                      <p>“{project.testimonial.quote}”</p>
                    </blockquote>
                    {project.testimonial.name && (
                      <figcaption className={`mt-3 text-sm ${activeTheme.textMuted}`}>
                        {project.testimonial.name}{project.testimonial.role && `, ${project.testimonial.role}`}
                      </figcaption>
                    )}
                  </figure>
                )}
              </>) : (<>
              {project.details && (
              <div>
                <h3 className={`${sectionLabel} mb-2`}>{project.details.heading}</h3>
                {project.details.items ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {project.details.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={16} aria-hidden="true" className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
                    {project.details.text}
                  </p>
                )}
              </div>
              )}

              {project.technicalExecution && (
              <div>
                <h3 className={`${sectionLabel} mb-2`}>Technical Execution</h3>
                <p className={`text-sm leading-relaxed ${activeTheme.textMuted}`}>
                  {project.technicalExecution}
                </p>
              </div>
              )}

              {/* Tech Stack: native <details>, so it opens with Enter/Space and announces its expanded state */}
              {project.tags.length > 0 && (
              <details className={`group/stack rounded border ${activeTheme.border}`}>
                <summary className={`flex items-center justify-between gap-2 px-4 py-3 rounded cursor-pointer list-none [&::-webkit-details-marker]:hidden ${sectionLabel} ${FOCUS_RING}`}>
                  Tech Stack
                  <ChevronDown size={16} aria-hidden="true" className="transition-transform group-open/stack:rotate-180 motion-reduce:transition-none" />
                </summary>
                <div className="px-4 pb-4">{tagList}</div>
              </details>
              )}
              </>)}

              {/* Footer actions: in reading (and Tab) order; they wrap, and stack full-width on narrow screens */}
              {(() => {
                const closeButton = (
                  <button
                    type="button"
                    onClick={() => setSelectedProject(null)}
                    className={`sm:ml-auto px-4 py-2.5 text-sm font-medium rounded border text-center ${activeTheme.border} hover:bg-zinc-800/20 ${FOCUS_RING}`}
                  >
                    Close
                  </button>
                );
                return (
                  <div className={`pt-6 border-t ${activeTheme.border} flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3`}>
                    {isCaseStudy ? (<>
                      <a
                        href={isHome ? '#contact' : `/?project=${project.id}#contact`}
                        onClick={(e) => handleProjectEnquiry(e, project, { prefill: true })}
                        className={`px-5 py-2.5 text-sm font-medium rounded text-center ${activeTheme.accent} ${FOCUS_RING}`}
                      >
                        Start a similar project
                      </a>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2.5 text-sm font-medium rounded border text-center ${activeTheme.border} hover:bg-zinc-800/20 ${FOCUS_RING}`}
                        >
                          Visit live site<span aria-hidden="true"> ↗</span>
                          <span className="sr-only">: {project.title} (opens in a new tab)</span>
                        </a>
                      )}
                      {closeButton}
                    </>) : (<>
                      {closeButton}
                      <a
                        href={homeHref('#contact')}
                        onClick={(e) => handleProjectEnquiry(e, project)}
                        className={`px-4 py-2.5 text-sm font-medium rounded text-center ${activeTheme.accent} ${FOCUS_RING}`}
                      >
                        Request Similar Project
                      </a>
                    </>)}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        );
      })()}

      {isHome && (<>
      {/* SECTION 2: SERVICES & SITE MAINTENANCE */}
      <section id="studio-offerings" className="relative py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-zinc-800/20">
        <div className="max-w-3xl lg:max-w-none mb-16">
          <div className={`text-xs uppercase font-mono tracking-widest mb-2 ${activeTheme.textMuted}`}>Studio Offerings</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Build it, connect it, keep it running
          </h2>
          <p className={`text-base leading-relaxed ${activeTheme.textMuted}`}>
            Start with a website, add the tools your business runs on, and keep everything looked after, all with one studio.
          </p>
        </div>

        {/* Studio Offerings: category tabs (Site Maintenance links to the plans below).
            Phones get one swipeable row, styled like the billing toggle, with the Site Maintenance link after the panels. */}
        <div ref={offeringsRef} id="offerings" className="mb-20 scroll-mt-20 md:scroll-mt-28 xl:scroll-mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6 sm:mb-10">
            <div className={isPhone ? `min-w-0 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}` : 'sm:col-span-2 lg:col-span-4'}>
            <div
              ref={offeringTabListRef}
              role="tablist"
              aria-label="Studio Offerings"
              onKeyDown={handleOfferingTabKeyDown}
              style={isPhone ? { maskImage: edgeFadeMask(offeringTabEdges), WebkitMaskImage: edgeFadeMask(offeringTabEdges) } : undefined}
              className={isPhone
                ? 'relative flex gap-1 p-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'}
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
                    aria-labelledby={`offering-tab-${cat.id}-name`}
                    aria-describedby={`offering-tab-${cat.id}-desc`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => selectOfferingTab(cat.id)}
                    className={isPhone
                      ? `shrink-0 whitespace-nowrap px-4 py-2 rounded text-xs font-medium transition-all ${FOCUS_RING} ${
                        selected ? activeTheme.accent : `${activeTheme.textMuted} hover:opacity-80`
                      }`
                      : `p-4 rounded-lg border text-left flex flex-col items-start transition-all ${FOCUS_RING} ${
                        selected
                          ? `ring-2 ring-indicator ${activeTheme.cardBg} ${activeTheme.border}`
                          : `${activeTheme.border} hover:opacity-80`
                      }`}
                  >
                    {!isPhone && <cat.Icon size={18} aria-hidden="true" className={`mb-3 ${activeTheme.highlight}`} />}
                    <span id={`offering-tab-${cat.id}-name`} className={isPhone ? 'block' : 'block text-sm font-bold'}>{cat.name}</span>
                    <span id={`offering-tab-${cat.id}-desc`} className={isPhone ? 'hidden' : `block text-xs mt-1 ${activeTheme.textMuted}`}>{cat.positioning}</span>
                  </button>
                );
              })}
            </div>
            </div>
            {!isPhone && renderCareOfferingLink()}
          </div>

          {/* Websites */}
          <div id="websites" role="tabpanel" aria-labelledby="offering-tab-websites-name" hidden={offeringTab !== 'websites'} tabIndex={0} className={`rounded-xl ${FOCUS_RING}`}>
            <h3 className="sr-only">Websites</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {WEBSITE_PACKAGES.map((pkg) => renderPackageCard(pkg, 'websites'))}
            </div>
            <p className={`mt-8 text-sm ${activeTheme.textMuted}`}>{WEBSITE_FOOTER}</p>
          </div>

          {/* Integrations: full package cards plus tools footer */}
          <div id="booking-integrations" role="tabpanel" aria-labelledby="offering-tab-booking-integrations-name" hidden={offeringTab !== 'booking-integrations'} tabIndex={0} className={`rounded-xl ${FOCUS_RING}`}>
            <h3 className="sr-only">Integrations</h3>
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
          <div id="business-tools" role="tabpanel" aria-labelledby="offering-tab-business-tools-name" hidden={offeringTab !== 'business-tools'} tabIndex={0} className={`rounded-xl ${FOCUS_RING}`}>
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
          <div id="web-apps" role="tabpanel" aria-labelledby="offering-tab-web-apps-name" hidden={offeringTab !== 'web-apps'} tabIndex={0} className={`rounded-xl ${FOCUS_RING}`}>
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

{/* Site Maintenance Plans Grid */}
<div ref={carePlansRef} id="site-maintenance" tabIndex={-1} className="mb-8 scroll-mt-20 md:scroll-mt-28 xl:scroll-mt-20 focus:outline-none">
  <h3 className="text-3xl sm:text-4xl font-bold mb-2">Site Maintenance Plans</h3>
  <p className={`text-sm ${activeTheme.textMuted} mb-8`}>
    Ongoing care for custom-built websites, WordPress sites and websites built by Iris & Oak.
  </p>

  {/* Billing period toggle (monthly care tiers only); phones also pick one plan to show */}
  <div className="flex flex-col items-start gap-3 mb-8">
  <div
    role="group"
    aria-label="Billing period"
    className={`inline-flex p-1 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}
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
  <div
    role="group"
    aria-label="Care plan"
    className={`sm:hidden inline-flex p-1 rounded-lg border ${activeTheme.border} ${activeTheme.cardBg}`}
  >
    {CARE_PLANS.filter((plan) => plan.type === 'monthly').map((plan) => (
      <button
        key={plan.id}
        type="button"
        aria-pressed={carePlanId === plan.id}
        aria-controls={`care-plan-${plan.id}`}
        onClick={() => setCarePlanId(plan.id)}
        className={`px-4 py-2 rounded text-xs font-medium transition-all ${FOCUS_RING} ${
          carePlanId === plan.id ? activeTheme.accent : `${activeTheme.textMuted} hover:opacity-80`
        }`}
      >
        {plan.name}
      </button>
    ))}
  </div>
  </div>

  {/* Three monthly care tiers */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    {CARE_PLANS.filter((plan) => plan.type === 'monthly').map((plan) => (
      <div
        key={plan.id}
        id={`care-plan-${plan.id}`}
        className={`relative p-6 sm:p-8 rounded-xl border ${carePlanId === plan.id ? 'flex' : 'hidden sm:flex'} flex-col justify-between transition-all ${
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
          onClick={() => preselectEnquiry({ need: CARE_OFFERING.id, pkg: `${plan.name} maintenance plan (${plan.price}/month)` })}
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
            <h2 className="text-3xl font-bold tracking-tight mb-6">Fast today, easy to maintain tomorrow</h2>
            <p className={`text-base leading-relaxed mb-6 ${activeTheme.textMuted}`}>
              I build with modern, lightweight tools chosen for each project, with a focus on speed, accessibility and code that’s easy to maintain. Every site is tested on real devices and checked for performance before launch.
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

          {/* Tools I often use: one compact, swipeable row of pills per category */}
          <div className={`p-5 sm:p-6 rounded-xl border ${activeTheme.border} ${activeTheme.cardBg}`}>
            <h3 className={`text-xs font-mono uppercase tracking-wider mb-4 font-bold ${activeTheme.textMuted}`}>TOOLS I OFTEN USE</h3>
            <div ref={toolsGridRef} className="space-y-4 sm:space-y-3">
              {TOOL_GROUPS.map((group, index) => (
                <div
                  key={group.title}
                  style={toolsRevealDone ? undefined : { transitionDelay: `${index * 70}ms` }}
                  className={`transition-[opacity,transform] duration-500 ease-out ${
                    toolsRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                  } motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none`}
                >
                  <ToolRow
                    title={group.title}
                    tools={group.tools}
                    labelClass="text-[11px] font-mono uppercase tracking-widest font-bold"
                    pillClass={`inline-block px-3 py-1 rounded-full border text-sm whitespace-nowrap ${activeTheme.border} ${activeTheme.bg}`}
                    arrowClass={activeTheme.textMuted}
                  />
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
          <h2 ref={enquiryHeadingRef} tabIndex={-1} className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 focus:outline-none">Plan your project</h2>
          <p className={`text-sm sm:text-base ${activeTheme.textMuted}`}>
            Tell me a little about your project, and I'll come back with a clear plan and price, within three business days.
          </p>
        </div>

        {/* Below lg: the form alone. From lg: form on the left, decorative orbit on the right. */}
        <div className="max-w-4xl lg:max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_32rem] gap-8 xl:gap-12 items-start">
        <div className={`p-6 sm:p-10 rounded-xl border shadow-xl ${activeTheme.cardBg} ${activeTheme.border}`}>
          {submitStatus === 'sent' ? (
            /* Shown only after the server confirms the enquiry was received */
            <div role="status" className="py-8 flex items-center gap-3">
              <CheckCircle2 size={24} aria-hidden="true" className={successText} />
              <h3 ref={enquirySentRef} tabIndex={-1} className="text-lg font-bold focus:outline-none">
                Thanks, I’ll be in touch within three business days.
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
                  { field: 'email', label: 'Email Address', required: true },
                  { field: 'business', label: 'Business Name or Current Website', type: 'text', autoComplete: 'organization', required: false, wide: true }
                ].map(({ field, label, type, autoComplete, required, wide }) => (
                  <div key={field} className={wide ? 'sm:col-span-2' : undefined}>
                    <label htmlFor={`enquiry-${field}`} className="block text-xs font-mono mb-1">
                      {label}
                      {required ? <span aria-hidden="true"> *</span> : <span className={activeTheme.textMuted}> (Optional)</span>}
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

              {/* 4. What can I help with? (checkbox chips: choose any) */}
              <fieldset>
                <legend className="text-xs font-mono mb-1">What can I help with?</legend>
                <p id="enquiry-needs-hint" className={`text-xs mb-3 ${activeTheme.textMuted}`}>Choose all that apply.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ENQUIRY_NEEDS.map((need) => {
                    const checked = enquiryNeeds.includes(need.id);
                    return (
                      <label
                        key={need.id}
                        className={`relative flex flex-col gap-1 p-4 rounded border cursor-pointer transition-all has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indicator ${
                          checked ? 'border-indicator bg-indicator/10' : `${activeTheme.border} hover:border-zinc-500`
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
                          <span aria-hidden="true" className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center ${checked ? 'bg-indicator border-indicator' : 'border-zinc-700'}`}>
                            {checked && <Check size={12} className="text-on-indicator" />}
                          </span>
                        </span>
                        <span id={`enquiry-need-${need.id}-desc`} className={`text-xs ${activeTheme.textMuted}`}>{need.desc}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* 5. Tell me about your project */}
              <div>
                <label htmlFor="enquiry-message" className="block text-xs font-mono mb-1">Tell me about your project.</label>
                <textarea
                  id="enquiry-message"
                  name="message"
                  rows={5}
                  value={enquiry.message}
                  onChange={(e) => updateEnquiry('message', e.target.value)}
                  placeholder="What does your business do, and what would you like your website or tool to help with?"
                  className={`w-full p-2.5 rounded text-xs border ${activeTheme.border} ${activeTheme.bg}`}
                />
              </div>

              {/* 6. Launch timeframe and optional budget: side by side from sm (rows shared via subgrid so
                  the dropdowns line up when a label wraps), stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-y-0">
                <div className="sm:grid sm:grid-rows-subgrid sm:row-span-3">
                  <label htmlFor="enquiry-launch" className="block self-end text-xs font-mono mb-1">
                    When would you like to launch?<span className={activeTheme.textMuted}> (Optional)</span>
                  </label>
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
                    Do you have a budget in mind?<span className={activeTheme.textMuted}> (Optional)</span>
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
                  Sorry, your enquiry couldn't be sent. Your answers are still here, so please try again.
                </p>
              )}

              <div className="pt-6 border-t border-zinc-800/40 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className={`text-xs ${activeTheme.textMuted}`}>
                  <a href="/privacy" className={`underline underline-offset-4 hover:opacity-70 rounded ${FOCUS_RING}`}>
                    Your details will only be used to reply to your enquiry.
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
      </>)}
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
          </div>

          {/* Studio */}
          <nav aria-labelledby="footer-studio-heading">
            <h2 id="footer-studio-heading" className={`text-xs font-mono uppercase tracking-widest mb-3 ${activeTheme.textMuted}`}>Studio</h2>
            <ul className="space-y-2 text-xs font-mono">
              <li><a href="/portfolio" className={`hover:underline rounded ${FOCUS_RING}`}>Portfolio</a></li>
              <li><a href={homeHref('#studio-offerings')} className={`hover:underline rounded ${FOCUS_RING}`}>Studio Offerings</a></li>
              <li><a href={homeHref('#engineering')} className={`hover:underline rounded ${FOCUS_RING}`}>Engineering</a></li>
              <li className="flex flex-wrap items-center gap-2">
                <a
                  href="/portfolio-partnership"
                  aria-current={page === 'partnership' ? 'page' : undefined}
                  className={`hover:underline rounded ${FOCUS_RING}`}
                >
                  Portfolio Partnership
                </a>
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
              <li><a href={homeHref('#contact')} className={`hover:underline rounded ${FOCUS_RING}`}>Enquire</a></li>
              <li><a href="/privacy" className={`hover:underline rounded ${FOCUS_RING}`}>Privacy</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright: last line of the page */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className={`mt-10 pt-6 border-t text-xs ${activeTheme.border} ${activeTheme.textMuted}`}>© {new Date().getFullYear()} Iris &amp; Oak</p>
        </div>
      </footer>

      {/* DISPLAY SETTINGS DRAWER */}
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
                  <Sliders size={18} aria-hidden="true" />
                  <h3 id="config-drawer-title" className="font-bold text-base">Display settings</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className={`p-1 rounded hover:bg-zinc-800/40 ${FOCUS_RING}`}
                  aria-label="Close display settings"
                >
                  <X size={18} aria-hidden="true" />
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
                        onClick={() => chooseSetting('themeKey', key)}
                        className={`p-3 rounded text-xs text-left border flex items-center justify-between transition-all ${FOCUS_RING} ${
                          themeKey === key ? 'ring-2 ring-indicator border-indicator' : activeTheme.border
                        }`}
                      >
                        <span className="font-medium text-[11px]">{theme.name}</span>
                        {themeKey === key && <Check size={12} aria-hidden="true" className="text-indicator" />}
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
                        onClick={() => chooseSetting('typographyKey', key)}
                        className={`p-2.5 rounded text-xs border text-center transition-all ${FOCUS_RING} ${
                          !font.available
                            ? `${activeTheme.border} opacity-50 cursor-not-allowed`
                            : typographyKey === key ? 'ring-2 ring-indicator border-indicator font-bold' : activeTheme.border
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
                        onClick={() => chooseSetting('textSize', key)}
                        className={`p-2.5 rounded text-xs border text-center transition-all ${FOCUS_RING} ${
                          textSize === key ? 'ring-2 ring-indicator border-indicator font-bold' : activeTheme.border
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
                    onClick={() => chooseSetting('highContrast', !highContrast)}
                    className={`w-full p-3 rounded text-xs border flex items-center justify-between transition-all ${FOCUS_RING} ${
                      highContrast ? 'ring-2 ring-indicator border-indicator' : activeTheme.border
                    }`}
                  >
                    <span className="font-medium text-[11px]">{highContrast ? 'On' : 'Off'}</span>
                    <span aria-hidden="true" className={`relative w-8 h-4 rounded-full transition-colors ${highContrast ? 'bg-indicator' : 'bg-zinc-600'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${highContrast ? 'translate-x-4' : ''}`} />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800/40">
              <p className={`text-xs mb-3 ${activeTheme.textMuted}`}>
                Changes apply straight away. Anything you haven’t chosen follows your device’s settings.
              </p>
              <button
                type="button"
                onClick={resetDisplaySettings}
                className={`w-full py-3 text-xs font-medium rounded border transition-opacity hover:opacity-80 ${activeTheme.border} ${FOCUS_RING}`}
              >
                Reset to device settings
              </button>
              <p role="status" className={`text-xs mt-3 min-h-[1rem] ${successText}`}>{displayStatus}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

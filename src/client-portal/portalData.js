// SAMPLE DATA — Fernhill Hair Studio, its contact and fernhill-studio.example are fictional.
// Continues the Website Care Report sample: Site Check-up completed 27 September 2026.
// Statuses: 'complete' (green), 'input' (amber, client input needed), 'scheduled' (neutral).

export const CLIENT = {
  business: 'Fernhill Hair Studio',
  website: 'www.fernhill-studio.example',
  contact: 'Priya Shah',
  initials: 'PS',
  plan: 'Growth Care',
  planSince: '2 October 2026',
  today: 'Monday 5 October 2026'
};

export const STATUS_SUMMARY = [
  { id: 'site', label: 'Website', value: 'Online', detail: 'Checked today, 09:21', tone: 'complete' },
  { id: 'plan', label: 'Care plan', value: 'Growth Care', detail: 'Since 2 Oct 2026', tone: 'neutral' },
  { id: 'next', label: 'Next scheduled work', value: '8 Oct 2026', detail: 'Booking plugin update', tone: 'neutral' },
  { id: 'input', label: 'Waiting on you', value: '2 items', detail: 'See Upcoming work', tone: 'input' }
];

export const SITE_HEALTH = [
  { id: 'online', label: 'Website online', detail: 'Loading normally for visitors', status: 'complete' },
  { id: 'ssl', label: 'Security certificate', detail: 'Renewed · auto-renewal now on', status: 'complete' },
  { id: 'backups', label: 'Backups', detail: 'Last backup today, 15:03', status: 'complete' },
  { id: 'updates', label: 'Updates', detail: 'Booking plugin update awaiting your approval', status: 'input' }
];

export const RECENT_ACTIVITY = [
  {
    id: 'ssl',
    date: '3 Oct 2026',
    title: 'Security certificate auto-renewal turned on',
    detail: 'Fixed the urgent item from your Site Check-up. Your certificate now renews automatically.',
    status: 'complete'
  },
  {
    id: 'plan',
    date: '2 Oct 2026',
    title: 'Growth Care plan started',
    detail: 'Annual plan. Your £149 Site Check-up fee was credited toward it.',
    status: 'complete'
  },
  {
    id: 'check-up',
    date: '27 Sep 2026',
    title: 'Site Check-up completed',
    detail: '8 changes made and 4 recommendations shared in your Website Care Report.',
    status: 'complete'
  }
];

export const UPCOMING_WORK = [
  {
    id: 'booking-plugin',
    date: '8 Oct 2026',
    title: 'Booking plugin update',
    detail: 'We’ll update it on a staging copy first. Please review the new booking layout before it goes live.',
    status: 'input',
    statusLabel: 'Approval needed',
    action: 'Review on staging'
  },
  {
    id: 'hero-image',
    date: 'When we receive your photo',
    title: 'Lighter homepage hero image',
    detail: 'Send us the original photo and we’ll export a lighter version without visible quality loss.',
    status: 'input',
    statusLabel: 'Photo needed',
    action: 'Upload photo'
  },
  {
    id: 'monthly-check',
    date: '2 Nov 2026',
    title: 'Monthly care check',
    detail: 'Updates, backup check, security and uptime checks, and testing key pages and forms.',
    status: 'scheduled',
    statusLabel: 'Scheduled'
  }
];

export const TIMELINE = [
  { id: 't1', when: '27 Sep', title: 'Site Check-up completed', detail: 'Website Care Report shared.', state: 'done' },
  { id: 't2', when: '2 Oct', title: 'Growth Care started', detail: 'Ongoing monthly care begins.', state: 'done' },
  { id: 't3', when: '3 Oct', title: 'Security certificate fixed', detail: 'Auto-renewal turned on.', state: 'done' },
  { id: 't4', when: '8 Oct', title: 'Booking plugin update', detail: 'Staging review, then go live after your approval.', state: 'next' },
  { id: 't5', when: '2 Nov', title: 'First monthly care check', detail: 'Monthly summary sent afterwards.', state: 'later' }
];

export const MESSAGES = [
  {
    id: 'm1',
    from: 'iris-oak',
    author: 'Iris & Oak',
    time: 'Fri 2 Oct, 16:20',
    text: 'Welcome to Growth Care! Your SSL auto-renewal is our first job — we’ll confirm once it’s switched on.'
  },
  {
    id: 'm2',
    from: 'client',
    author: 'Priya Shah',
    time: 'Fri 2 Oct, 17:05',
    text: 'Thanks! I’ve added you as a user in our hosting account so you can do it.'
  },
  {
    id: 'm3',
    from: 'iris-oak',
    author: 'Iris & Oak',
    time: 'Sat 3 Oct, 10:12',
    text: 'Done — auto-renewal is on and the certificate has renewed. Next up is the booking plugin update on Thursday 8 October.'
  },
  {
    id: 'm4',
    from: 'iris-oak',
    author: 'Iris & Oak',
    time: 'Today, 09:15',
    text: 'When you have a moment, could you send the original homepage photo? Then we can make the lighter version.'
  }
];

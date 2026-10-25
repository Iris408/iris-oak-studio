// SAMPLE DATA — Fernhill Hair Studio and fernhill-studio.example are fictional.
// Statuses: 'complete' (green), 'recommended' (amber), 'urgent' (red).

export const REPORT = {
  client: 'Fernhill Hair Studio',
  website: 'www.fernhill-studio.example',
  service: 'Site Check-up (one-off)',
  completedOn: '27 September 2026',
  overview:
    "Your Site Check-up has been completed. We've reviewed the key areas that keep your website secure, stable and performing well. Below is a summary of what we checked, what we changed and why, plus what we recommend next.",
  overviewAttention: "One item needs attention before 9 October 2026."
};

export const MAINTENANCE_CHECKS = [
  {
    id: 'updates',
    title: 'Updates',
    status: 'complete',
    headline: 'Up to date',
    summary: 'WordPress core, theme and plugins reviewed.',
    details:
      "WordPress core, the active theme and 6 of 7 plugins are on their latest stable versions. The booking plugin is intentionally held back; see Work Completed."
  },
  {
    id: 'security',
    title: 'Security',
    status: 'urgent',
    headline: 'Action needed',
    summary: 'SSL certificate expires 9 October 2026.',
    details:
      "No malware or suspicious login activity found. Your SSL certificate expires on 9 October 2026 and automatic renewal is switched off in your hosting account. If it lapses, visitors will see a security warning."
  },
  {
    id: 'backups',
    title: 'Backups',
    status: 'complete',
    headline: 'Up to date',
    summary: 'Latest backup verified.',
    details:
      "Daily backups are running. We restored the latest backup to a private staging copy to confirm it works."
  },
  {
    id: 'performance',
    title: 'Performance',
    status: 'recommended',
    headline: 'Improved',
    summary: 'Further improvement recommended.',
    details:
      "Mobile page speed improved from 62 to 81. The homepage hero image (3.4 MB) is now the largest item on the page; replacing it with a lighter version is recommended."
  },
  {
    id: 'forms',
    title: 'Forms & Functionality',
    status: 'complete',
    headline: 'Working',
    summary: 'Contact and booking forms tested.',
    details:
      "Test submissions sent from desktop and mobile. All arrived, and confirmation emails were delivered to both you and the test customer."
  },
  {
    id: 'devices',
    title: 'Mobile & Browser',
    status: 'complete',
    headline: 'Checked',
    summary: 'Looks good across key devices.',
    details:
      "Key pages checked in Safari on iPhone, Chrome on Android, and Chrome, Safari and Firefox on desktop. No layout issues found."
  }
];

export const WORK_COMPLETED = [
  {
    id: 'updates',
    title: 'Plugin & Core Updates',
    status: 'complete',
    statusLabel: 'Completed',
    checked: 'WordPress core, the active theme and all 7 plugins against their latest stable releases.',
    changed: ['Updated WordPress core to the latest minor release', 'Updated the theme and 6 plugins'],
    unchanged: 'The booking plugin stays on its current version.',
    why: "Its latest release changes the booking page layout, so your approval would be required first before the update. A full backup was taken before any updates."
  },
  {
    id: 'performance',
    title: 'Performance Optimisation',
    status: 'complete',
    statusLabel: 'Completed',
    checked: 'Page speed on the homepage, services and booking pages, on mobile and desktop.',
    changed: ['Compressed 24 gallery images', 'Turned on page caching', 'Removed 2 unused scripts loading on every page'],
    unchanged: 'The homepage hero image.',
    why: "It is your main brand photo. A lighter version should be made from the original file so the quality isn't degraded."
  },
  {
    id: 'forms',
    title: 'Form Testing',
    status: 'complete',
    statusLabel: 'Completed',
    checked: 'Contact and booking forms on desktop and mobile, including confirmation emails.',
    changed: [],
    unchanged: 'Both forms and their email settings.',
    why: "Every test submission arrived and confirmation emails were delivered, so no changes were needed."
  },
  {
    id: 'security',
    title: 'Security Review & Clean-up',
    status: 'urgent',
    statusLabel: 'Action needed',
    checked: 'Login activity, user accounts, malware scan, SSL certificate and database.',
    changed: ['Removed 2 inactive admin accounts', 'Deleted 3 deactivated plugins', 'Optimised the database tables'],
    unchanged: 'SSL certificate settings.',
    why: "Renewal is managed in your hosting account, which we don’t have access to. See Recommendations & Next Steps."
  }
];

export const RECOMMENDATIONS = [
  {
    id: 'ssl',
    status: 'urgent',
    title: 'Turn on SSL auto-renewal',
    description:
      'Your certificate expires on 9 October 2026. Turn on auto-renewal in your hosting control panel, or you can provide us with contributor/ developer access and we’ll do it for you.',
    timing: 'Before 9 October 2026'
  },
  {
    id: 'booking-plugin',
    status: 'recommended',
    title: 'Approve the booking plugin update',
    description:
      'We’ll apply it to a staging copy first so you can check the new booking layout before it goes live.',
    timing: 'Within the next month'
  },
  {
    id: 'hero-image',
    status: 'recommended',
    title: 'Replace the homepage hero image',
    description:
      'Send us the original photo and we’ll export a lighter version (under 500 KB) without visible quality loss.',
    timing: 'Within the next month'
  },
  {
    id: 'ongoing-care',
    status: 'recommended',
    title: 'Consider ongoing care',
    description:
      'Monthly updates, backup checks and testing would catch issues like the SSL renewal early. If you start an annual care plan within 14 days, the £149 check-up fee is credited toward it.',
    timing: 'By 11 October 2026'
  }
];

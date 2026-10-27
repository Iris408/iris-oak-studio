import { Analytics } from '@vercel/analytics/react';

// Vercel Web Analytics, with a visitor opt-out saved in this browser's local storage.
// Data is only collected when the site is deployed on Vercel with Web Analytics enabled
// for the project; elsewhere the script fails to load and nothing is sent.

export const ANALYTICS_OPT_OUT_KEY = 'iris-oak-analytics-opt-out';

export const isAnalyticsOptedOut = () => {
  try {
    return window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === 'true';
  } catch {
    return false;
  }
};

// Returns false if the browser blocks saving the preference.
export const setAnalyticsOptOut = (optedOut) => {
  try {
    if (optedOut) window.localStorage.setItem(ANALYTICS_OPT_OUT_KEY, 'true');
    else window.localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
    return isAnalyticsOptedOut() === optedOut;
  } catch {
    return false;
  }
};

// Checked for every event, so opting out (or back in) applies immediately without a reload.
export const analyticsBeforeSend = (event) => (isAnalyticsOptedOut() ? null : event);

export function SiteAnalytics() {
  return <Analytics beforeSend={analyticsBeforeSend} />;
}

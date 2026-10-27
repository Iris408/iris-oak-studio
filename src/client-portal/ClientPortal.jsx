import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Activity,
  CalendarClock,
  Wrench,
  ListChecks,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Mail,
  ArrowRight
} from 'lucide-react';
import { CLIENT, STATUS_SUMMARY, SITE_HEALTH, RECENT_ACTIVITY, UPCOMING_WORK, TIMELINE, MESSAGES } from './portalData';

const STATUS = {
  complete: {
    label: 'Complete',
    Icon: CheckCircle2,
    text: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600'
  },
  input: {
    label: 'Your input needed',
    Icon: AlertTriangle,
    text: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-900 border-amber-200',
    dot: 'bg-amber-500'
  },
  scheduled: {
    label: 'Scheduled',
    Icon: Clock,
    text: 'text-stone-600',
    badge: 'bg-stone-100 text-stone-700 border-stone-200',
    dot: 'bg-stone-400'
  }
};

const NAV = [
  { href: '#overview', label: 'Overview', Icon: LayoutDashboard },
  { href: '#messages', label: 'Messages', Icon: MessageSquare },
  { href: '#health', label: 'Site health', Icon: Activity },
  { href: '#upcoming', label: 'Upcoming work', Icon: CalendarClock },
  { href: '#activity', label: 'Recent maintenance', Icon: Wrench },
  { href: '#timeline', label: 'Timeline', Icon: ListChecks }
];

// At xl, Recent maintenance and Timeline share one card as tabs.
const HISTORY_TABS = [
  { id: 'activity', label: 'Recent maintenance' },
  { id: 'timeline', label: 'Timeline' }
];

const FOCUS_RING = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600';
const CARD = 'bg-white rounded-xl border border-stone-200 shadow-sm';
// At xl the dashboard fits one screen: cards become flex columns, and a card's body scrolls
// internally only if its content doesn't fit.
const FIT_CARD = 'xl:flex xl:flex-col xl:min-h-0';
const FIT_BODY = 'xl:flex-1 xl:min-h-0 xl:overflow-y-auto';
// Recent maintenance / Timeline: their own cards below xl, panels inside the shared tab card at xl.
const HISTORY_PANEL = `${CARD} p-5 sm:p-6 xl:p-0 xl:border-0 xl:shadow-none xl:rounded-none xl:bg-transparent xl:flex-1 ${FIT_CARD}`;
const SAMPLE_NOTICE = 'Sample only: this portal isn’t connected, so nothing is sent or saved.';

function StatusBadge({ status, label }) {
  const { Icon, badge, label: defaultLabel } = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${badge}`}>
      <Icon size={13} aria-hidden="true" />
      {label || defaultLabel}
    </span>
  );
}

function SectionHeading({ id, children, aside, className = '' }) {
  return (
    <div className={`flex items-center justify-between gap-4 mb-4 xl:mb-3 xl:shrink-0 ${className}`}>
      <h2 id={id} className="font-serif text-2xl xl:text-xl text-stone-900">{children}</h2>
      {aside}
    </div>
  );
}

function SampleNotice({ show }) {
  return (
    <p role="status" aria-live="polite" className={`text-xs text-amber-900 ${show ? 'mt-1.5' : ''}`}>
      {show ? SAMPLE_NOTICE : ''}
    </p>
  );
}

export default function ClientPortal() {
  const [draft, setDraft] = useState('');
  const [emailCopies, setEmailCopies] = useState(true);
  // Which area last showed the "sample only" notice: 'message' | 'email' | upcoming item id
  const [noticeFor, setNoticeFor] = useState(null);
  const [historyTab, setHistoryTab] = useState('activity');
  const threadRef = useRef(null);

  // When the thread scrolls inside its panel (xl), open it at the latest message.
  useEffect(() => {
    const thread = threadRef.current;
    if (thread) thread.scrollTop = thread.scrollHeight;
  }, []);

  return (
    <div className="min-h-screen xl:h-screen xl:min-h-[720px] flex flex-col bg-[#F7F6F3] text-stone-800 font-sans">
      {/* Sample notice */}
      <div className="bg-amber-100 text-amber-950 text-xs text-center px-4 py-2 shrink-0">
        <strong className="font-semibold">Sample client portal</strong> · Visual demonstration only.
      </div>

      <div className="lg:flex flex-1 xl:min-h-0">
        {/* Sidebar (top bar on small screens) */}
        <aside className="lg:w-60 xl:w-16 min-[1400px]:w-60 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen xl:static xl:h-auto bg-[#F1EFEA] border-b lg:border-b-0 lg:border-r border-stone-200 flex flex-col">
          <div className="px-5 xl:px-2 min-[1400px]:px-5 pt-5 pb-3 lg:pt-7 lg:pb-6">
            {/* Compact monogram while the sidebar is an icon rail (1280–1399px) */}
            <span aria-hidden="true" className="hidden xl:block min-[1400px]:hidden text-center font-serif text-lg text-stone-900">I&O</span>
            <span className="block xl:sr-only min-[1400px]:not-sr-only font-serif text-2xl leading-none text-stone-900">Iris & Oak</span>
            <span className="block xl:sr-only min-[1400px]:not-sr-only text-[10px] tracking-[0.3em] uppercase text-stone-600 mt-1">Client portal</span>
          </div>

          <nav aria-label="Portal sections" className="px-3 pb-3 lg:pb-0 overflow-x-auto">
            <ul className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
              {NAV.map(({ href, label, Icon }, index) => (
                <li key={href}>
                  <a
                    href={href}
                    aria-current={index === 0 ? 'page' : undefined}
                    title={label}
                    onClick={() => {
                      const tab = HISTORY_TABS.find((t) => `#${t.id}` === href);
                      if (tab) setHistoryTab(tab.id);
                    }}
                    className={`flex items-center xl:justify-center min-[1400px]:justify-start gap-3 px-3 py-2 rounded-lg text-sm whitespace-nowrap ${FOCUS_RING} ${
                      index === 0 ? 'bg-stone-200/70 font-semibold text-stone-900' : 'text-stone-700 hover:bg-stone-200/50'
                    }`}
                  >
                    <Icon size={17} aria-hidden="true" className="shrink-0" />
                    <span className="xl:sr-only min-[1400px]:not-sr-only">{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden lg:flex items-center xl:justify-center min-[1400px]:justify-start gap-3 mt-auto px-5 xl:px-2 min-[1400px]:px-5 py-5 border-t border-stone-200">
            <span className="w-10 h-10 rounded-full bg-stone-700 text-white text-sm font-semibold flex items-center justify-center" aria-hidden="true">
              {CLIENT.initials}
            </span>
            <span className="min-w-0 xl:sr-only min-[1400px]:not-sr-only">
              <span className="block text-sm font-medium text-stone-900">{CLIENT.contact}</span>
              <span className="block text-xs text-stone-600 truncate">{CLIENT.business}</span>
            </span>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-10 xl:px-8 py-6 lg:py-8 xl:py-5 xl:flex xl:flex-col xl:min-h-0">
          {/* Page header + status summary (one row at xl) */}
          <div className="xl:shrink-0 xl:flex xl:items-end xl:justify-between xl:gap-8">
            <header id="overview" className="scroll-mt-4 shrink-0">
              <p className="text-sm text-stone-500 mb-2 xl:mb-1">
                Client portal <span aria-hidden="true" className="mx-1.5">/</span> Overview
              </p>
              <h1 className="font-serif text-3xl sm:text-5xl xl:text-4xl text-stone-900 leading-tight">{CLIENT.business}</h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 xl:mt-1 text-sm text-stone-600">
                <span className="inline-flex items-center gap-1.5">
                  <Globe size={15} aria-hidden="true" />
                  {CLIENT.website}
                </span>
                <span>{CLIENT.today}</span>
              </div>
            </header>

            <dl className="mt-6 xl:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x divide-stone-200 xl:flex-1 xl:max-w-3xl">
              {STATUS_SUMMARY.map((item) => (
                <div key={item.id} className="lg:px-5 first:lg:pl-0">
                  <dt className="text-sm text-stone-500">{item.label}</dt>
                  <dd className="mt-1 xl:mt-0.5">
                    {item.tone === 'neutral' ? (
                      <span className="text-lg font-semibold text-stone-900">{item.value}</span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 text-lg font-semibold ${STATUS[item.tone].text}`}>
                        {React.createElement(STATUS[item.tone].Icon, { size: 18, 'aria-hidden': true })}
                        {item.value}
                      </span>
                    )}
                    <span className="block text-xs text-stone-500">{item.detail}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/*
            Below xl: one column in reading order (health, messages, upcoming, activity, timeline).
            At xl: overview area (site health above upcoming work + history tabs) beside messages.
            Wrappers use `contents` below xl so their cards join the single-column grid and can be ordered.
          */}
          <div className="mt-8 xl:mt-5 grid grid-cols-1 gap-6 xl:gap-4 xl:grid-cols-[minmax(0,1fr)_22rem] xl:grid-rows-[minmax(0,1fr)] xl:flex-1 xl:min-h-0">
            <div className="contents xl:flex xl:flex-col xl:gap-4 xl:min-h-0">
              {/* Site health */}
              <section aria-labelledby="health" className={`${CARD} p-5 sm:p-6 xl:p-4 order-1 xl:order-none xl:shrink-0 scroll-mt-4`}>
                <SectionHeading id="health">Site health</SectionHeading>
                <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-1 gap-5 xl:gap-3">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 xl:px-3 xl:py-2.5 flex gap-3">
                    <CheckCircle2 size={22} className="text-emerald-700 shrink-0" aria-hidden="true" />
                    <div className="xl:flex xl:flex-wrap xl:items-baseline xl:gap-x-2">
                      <p className="font-semibold text-emerald-900 xl:text-sm">Your website is online and running normally</p>
                      <p className="text-sm text-emerald-900/80 mt-1 xl:mt-0">
                        No urgent issues. Two items are waiting on you before we can continue; see Upcoming work.
                      </p>
                    </div>
                  </div>
                  <ul className="divide-y divide-stone-100 xl:divide-y-0 xl:grid xl:grid-cols-4 xl:gap-x-4 xl:gap-y-2.5">
                    {SITE_HEALTH.map((item) => {
                      const s = STATUS[item.status];
                      return (
                        <li key={item.id} className="flex items-start gap-3 xl:gap-2 py-2.5 xl:py-0 first:pt-0 last:pb-0">
                          <s.Icon size={17} className={`${s.text} shrink-0 mt-0.5`} aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-900">
                              {item.label}
                              <span className="sr-only"> — {s.label}</span>
                            </p>
                            <p className="text-xs text-stone-600">{item.detail}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>

              <div className="contents xl:grid xl:grid-cols-2 xl:grid-rows-[minmax(0,1fr)] xl:gap-4 xl:flex-1 xl:min-h-0">
                {/* Upcoming work */}
                <section aria-labelledby="upcoming" className={`${CARD} ${FIT_CARD} p-5 sm:p-6 xl:p-4 order-3 xl:order-none scroll-mt-4`}>
                  <SectionHeading id="upcoming">Upcoming work</SectionHeading>
                  <ul className={`divide-y divide-stone-100 ${FIT_BODY}`}>
                    {UPCOMING_WORK.map((item) => (
                      <li key={item.id} className="py-4 xl:py-3 first:pt-0 last:pb-0">
                        {/* At xl the inner wrapper becomes `contents`, so date and button share the top row */}
                        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center xl:gap-x-3 xl:gap-y-1">
                          <p className="text-xs font-medium text-stone-500 sm:w-32 xl:w-auto shrink-0 sm:pt-1 xl:pt-0 xl:col-start-1 xl:row-start-1">{item.date}</p>
                          <div className="min-w-0 flex-1 xl:contents">
                            <div className="flex flex-wrap items-center gap-2 mb-1 xl:mb-0 xl:col-span-2">
                              <h3 className="font-semibold text-stone-900 xl:text-sm">{item.title}</h3>
                              <StatusBadge status={item.status} label={item.statusLabel} />
                            </div>
                            <p className="text-sm text-stone-600 xl:col-span-2">{item.detail}</p>
                            {item.action && (
                              <div className="mt-3 xl:mt-0 xl:col-start-2 xl:row-start-1">
                                <button
                                  type="button"
                                  onClick={() => setNoticeFor(item.id)}
                                  className={`inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 xl:py-1 text-sm font-medium text-stone-800 hover:bg-stone-50 ${FOCUS_RING}`}
                                >
                                  {item.action}
                                  <ArrowRight size={14} aria-hidden="true" />
                                </button>
                              </div>
                            )}
                            {item.action && (
                              <div className="xl:col-span-2">
                                <SampleNotice show={noticeFor === item.id} />
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* History: Recent maintenance + Timeline (separate cards below xl, tabs at xl) */}
                <div className={`contents xl:flex xl:flex-col xl:min-h-0 xl:bg-white xl:rounded-xl xl:border xl:border-stone-200 xl:shadow-sm xl:p-4`}>
                  <div role="tablist" aria-label="Maintenance history" className="hidden xl:flex xl:shrink-0 gap-1 mb-3 border-b border-stone-200">
                    {HISTORY_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={historyTab === tab.id}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => setHistoryTab(tab.id)}
                        className={`-mb-px px-3 py-2 font-serif text-lg whitespace-nowrap border-b-2 rounded-t ${FOCUS_RING} ${
                          historyTab === tab.id ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Recent maintenance */}
                  <section
                    id="panel-activity"
                    aria-labelledby="activity"
                    className={`${HISTORY_PANEL} order-4 xl:order-none scroll-mt-4 ${historyTab === 'activity' ? '' : 'xl:hidden'}`}
                  >
                    <SectionHeading id="activity" className="xl:sr-only">Recent maintenance</SectionHeading>
                    <ul className={`divide-y divide-stone-100 ${FIT_BODY}`}>
                      {RECENT_ACTIVITY.map((item) => (
                        <li key={item.id} className="py-4 xl:py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row xl:flex-col sm:items-start gap-2 sm:gap-4 xl:gap-1">
                          <p className="text-xs font-medium text-stone-500 sm:w-32 xl:w-auto shrink-0 sm:pt-1 xl:pt-0">{item.date}</p>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold text-stone-900 xl:text-sm">{item.title}</h3>
                              <StatusBadge status={item.status} />
                            </div>
                            <p className="text-sm text-stone-600">{item.detail}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Timeline */}
                  <section
                    id="panel-timeline"
                    aria-labelledby="timeline"
                    className={`${HISTORY_PANEL} order-5 xl:order-none scroll-mt-4 ${historyTab === 'timeline' ? '' : 'xl:hidden'}`}
                  >
                    <SectionHeading id="timeline" className="xl:sr-only">Timeline</SectionHeading>
                    <ol className={`relative ${FIT_BODY}`}>
                      {TIMELINE.map((step, index) => (
                        <li key={step.id} className="relative flex gap-4 pb-5 xl:pb-4 last:pb-0">
                          {index < TIMELINE.length - 1 && (
                            <span className="absolute left-[5.4rem] top-4 bottom-0 w-px bg-stone-300" aria-hidden="true" />
                          )}
                          <span className="w-16 shrink-0 text-xs text-stone-500 pt-0.5">{step.when}</span>
                          <span
                            aria-hidden="true"
                            className={`relative z-10 mt-1 w-3 h-3 rounded-full shrink-0 ${
                              step.state === 'done'
                                ? 'bg-emerald-600'
                                : step.state === 'next'
                                  ? 'bg-white border-2 border-amber-500'
                                  : 'bg-white border-2 border-stone-300'
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-stone-900">
                              {step.title}
                              <span className="sr-only">
                                {step.state === 'done' ? ' — done' : step.state === 'next' ? ' — next' : ' — planned'}
                              </span>
                            </p>
                            <p className="text-xs text-stone-600">{step.detail}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                </div>
              </div>
            </div>

            {/* Messages (primary communication) + email alternative */}
            <section aria-labelledby="messages" className="order-2 xl:order-none space-y-4 xl:space-y-0 xl:flex xl:flex-col xl:gap-4 xl:min-h-0 scroll-mt-4">
              <div className={`${CARD} ${FIT_CARD} p-5 sm:p-6 xl:p-4 xl:flex-1`}>
                <SectionHeading
                  id="messages"
                  aside={<span className="text-xs text-stone-500">Usually replies within one working day</span>}
                >
                  Messages
                </SectionHeading>

                <ol ref={threadRef} aria-label="Conversation with Iris & Oak" className={`space-y-4 xl:space-y-3 mb-5 xl:mb-3 xl:pr-1 ${FIT_BODY}`}>
                  {MESSAGES.map((msg) => {
                    const mine = msg.from === 'client';
                    return (
                      <li key={msg.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 xl:py-2 text-sm leading-relaxed ${
                            mine ? 'bg-[#1C2420] text-white rounded-br-sm' : 'bg-stone-100 text-stone-800 rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          {msg.author} · <time>{msg.time}</time>
                        </p>
                      </li>
                    );
                  })}
                </ol>

                <form
                  className="xl:shrink-0"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setNoticeFor('message');
                  }}
                >
                  <label htmlFor="portal-message" className="block text-sm font-medium text-stone-900 mb-1.5">
                    Message Iris & Oak
                  </label>
                  <textarea
                    id="portal-message"
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Write a message…"
                    className={`w-full rounded-lg border border-stone-300 bg-white p-3 xl:p-2.5 text-sm placeholder:text-stone-400 xl:h-[4.5rem] xl:resize-none ${FOCUS_RING}`}
                  />
                  <label className="mt-3 xl:mt-2 flex items-center gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={emailCopies}
                      onChange={(e) => setEmailCopies(e.target.checked)}
                      className="w-4 h-4 accent-[#1C2420]"
                    />
                    Email me when Iris & Oak replies
                  </label>
                  <button
                    type="submit"
                    className={`mt-4 xl:mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1C2420] text-white py-3 xl:py-2.5 text-sm font-medium hover:bg-[#2A3530] ${FOCUS_RING}`}
                  >
                    <Send size={16} aria-hidden="true" />
                    Send message
                  </button>
                  <SampleNotice show={noticeFor === 'message'} />
                </form>
              </div>

              {/* Email alternative */}
              <div className={`${CARD} p-5 xl:p-4 xl:shrink-0`}>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-stone-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900">Prefer email?</p>
                    <p className="text-xs text-stone-600 mt-0.5">
                      You can contact us by email instead. Replies reach you the same way.
                    </p>
                    <button
                      type="button"
                      onClick={() => setNoticeFor('email')}
                      className={`mt-3 xl:mt-2 inline-flex items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 xl:py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50 ${FOCUS_RING}`}
                    >
                      Email Iris & Oak instead
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                    <SampleNotice show={noticeFor === 'email'} />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <footer className="mt-10 xl:mt-3 pt-6 xl:pt-0 border-t xl:border-t-0 border-stone-200 text-center text-xs text-stone-500 xl:shrink-0">
            Iris & Oak Design Studio· Sample client portal.
          </footer>
        </main>
      </div>
    </div>
  );
}

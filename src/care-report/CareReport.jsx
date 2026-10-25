import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  Download,
  ArrowRight,
  Globe,
  CalendarCheck,
  Activity,
  Wrench,
  ListChecks,
  Database,
  ChevronDown
} from 'lucide-react';
import { REPORT, MAINTENANCE_CHECKS, WORK_COMPLETED, RECOMMENDATIONS } from './reportData';

// Each status pairs a colour with an icon shape and a text label, so it never relies on colour alone.
const STATUS = {
  complete: {
    label: 'Complete',
    Icon: CheckCircle2,
    text: 'text-emerald-700',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconWrap: 'bg-emerald-50 text-emerald-700'
  },
  recommended: {
    label: 'Recommended',
    Icon: AlertTriangle,
    text: 'text-amber-700',
    badge: 'bg-amber-50 text-amber-900 border-amber-200',
    iconWrap: 'bg-amber-50 text-amber-700'
  },
  urgent: {
    label: 'Urgent',
    Icon: OctagonAlert,
    text: 'text-red-700',
    badge: 'bg-red-50 text-red-800 border-red-200',
    iconWrap: 'bg-red-50 text-red-700'
  }
};

const FOCUS_RING = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600';

function StatusBadge({ status, label }) {
  const { Icon, badge, label: defaultLabel } = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${badge}`}>
      <Icon size={13} aria-hidden="true" />
      {label || defaultLabel}
    </span>
  );
}

function SummaryCard({ Icon, label, value, valueClass = 'text-stone-900', note, noteClass = 'text-stone-500' }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <Icon size={20} className="text-stone-700 mb-3" aria-hidden="true" />
      <div className="text-sm text-stone-600">{label}</div>
      <div className={`text-xl font-semibold ${valueClass}`}>{value}</div>
      {note && <div className={`text-xs mt-0.5 ${noteClass}`}>{note}</div>}
    </div>
  );
}

export default function CareReport() {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const changesMade = WORK_COMPLETED.reduce((total, item) => total + item.changed.length, 0);
  const urgentCount = RECOMMENDATIONS.filter((r) => r.status === 'urgent').length;

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-stone-800 font-sans">
      {/* Sample notice */}
      <div className="bg-amber-50 text-amber-950 text-xs text-center px-4 py-2">
        <strong className="font-semibold">Sample report</strong> · For demonstration only.
      </div>

      {/* Header */}
      <header className="bg-[#1F1E1D] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <span className="font-mono text-xl uppercase">Iris & Oak</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="hidden sm:inline text-stone-300">Maintenance Report</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
              Completed
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1F1E1D] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-20 grid md:grid-cols-[1fr_minmax(0,22rem)] gap-8 items-center">
          <div>
            <h1 className="font-serif text-3xl sm:text-5xl leading-tight mb-3">Your Website Care Report</h1>
            <p className="text-lg sm:text-xl mb-4">{REPORT.client}</p>
            <ul className="space-y-2 text-sm text-stone-300 mb-8">
              <li className="flex items-center gap-2">
                <Globe size={15} aria-hidden="true" />
                {REPORT.website}
              </li>
              <li className="flex items-start gap-2">
                <CalendarCheck size={15} className="mt-0.5" aria-hidden="true" />
                <span>
                  <span className="text-white">Completed on {REPORT.completedOn}</span>
                  <span className="block text-xs">{REPORT.service}</span>
                </span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                title="Opens your browser's print dialog. Choose “Save as PDF”."
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white text-stone-900 text-sm font-medium hover:bg-stone-100 ${FOCUS_RING}`}
              >
                Download PDF
                <Download size={15} aria-hidden="true" />
              </button>
              <a
                href="/#studio-offerings"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-white/40 text-sm font-medium hover:bg-white/10 ${FOCUS_RING}`}
              >
                Need ongoing support?
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Decorative panel in place of the mockup photo */}
          <div
            aria-hidden="true"
            className="hidden md:flex h-56 rounded-2xl bg-gradient-to-br from-[#3A4A40] via-[#2A3530] to-[#1C2420] border border-white/10 items-end p-6"
          >
            <span className="font-serif text-2xl leading-tight text-white/70">
              Fernhill
              <span className="block text-xs tracking-[0.3em] uppercase font-sans text-white/50 mt-1">Hair Studio</span>
            </span>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        {/* Summary cards */}
        <div className="-mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <SummaryCard
            Icon={CheckCircle2}
            label="Overall Health"
            value="Good"
            valueClass="text-emerald-700"
            note={`${urgentCount} urgent item`}
            noteClass="text-red-700 font-medium"
          />
          <SummaryCard Icon={Wrench} label="Changes Made" value={changesMade} />
          <SummaryCard Icon={ListChecks} label="Recommendations" value={RECOMMENDATIONS.length} note={`${urgentCount} urgent`} />
          <SummaryCard Icon={Database} label="Backups" value="Up to date" note="Restore tested" />
        </div>

        {/* Overview */}
        <section className="mt-12" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="font-serif text-2xl sm:text-3xl text-stone-900 mb-3">Overview</h2>
          <p className="text-sm sm:text-base leading-relaxed text-stone-600 max-w-3xl">
            {REPORT.overview} <strong>{REPORT.overviewAttention}</strong>
          </p>
        </section>

        {/* Maintenance Checks */}
        <section className="mt-12" aria-labelledby="checks-heading">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 id="checks-heading" className="font-serif text-2xl sm:text-3xl text-stone-900">Maintenance Checks</h2>
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-controls={MAINTENANCE_CHECKS.map((c) => `check-details-${c.id}`).join(' ')}
              onClick={() => setDetailsOpen((open) => !open)}
              className={`inline-flex items-center gap-1.5 shrink-0 text-sm font-medium text-stone-700 hover:text-stone-950 rounded print:hidden ${FOCUS_RING}`}
            >
              {detailsOpen ? 'Hide details' : 'View all details'}
              <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {MAINTENANCE_CHECKS.map((check) => {
              const s = STATUS[check.status];
              return (
                <li key={check.id} className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
                  <div className="flex items-start gap-3">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.iconWrap}`}>
                      <s.Icon size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm text-stone-600">{check.title}</h3>
                        <StatusBadge status={check.status} />
                      </div>
                      <p className={`font-semibold ${s.text}`}>{check.headline}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{check.summary}</p>
                      <p
                        id={`check-details-${check.id}`}
                        hidden={!detailsOpen}
                        className="text-xs leading-relaxed text-stone-700 mt-3 pt-3 border-t border-stone-100 print:block"
                      >
                        {check.details}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Work Completed */}
        <section className="mt-12" aria-labelledby="work-heading">
          <h2 id="work-heading" className="font-serif text-2xl sm:text-3xl text-stone-900 mb-1">Work Completed</h2>
          <p className="text-sm text-stone-600 mb-6">What we checked, what we changed, what we left unchanged, and why.</p>

          <ol className="relative">
            {WORK_COMPLETED.map((item, index) => (
              <li key={item.id} className="relative pl-14 pb-8 last:pb-0">
                {index < WORK_COMPLETED.length - 1 && (
                  <span className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-stone-300" aria-hidden="true" />
                )}
                <span className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#2E3833] text-white text-xs font-semibold flex items-center justify-center">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <h3 className="font-semibold text-stone-900">{item.title}</h3>
                    <StatusBadge status={item.status} label={item.statusLabel} />
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-x-4 gap-y-3 text-sm">
                    <dt className="font-medium text-stone-500">Checked</dt>
                    <dd className="text-stone-700">{item.checked}</dd>

                    <dt className="font-medium text-stone-500">Changed</dt>
                    <dd className="text-stone-700">
                      {item.changed.length > 0 ? (
                        <ul className="space-y-1">
                          {item.changed.map((change) => (
                            <li key={change} className="flex items-start gap-2">
                              <CheckCircle2 size={14} className="text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'No changes needed'
                      )}
                    </dd>

                    <dt className="font-medium text-stone-500">Left unchanged</dt>
                    <dd className="text-stone-700">{item.unchanged}</dd>

                    <dt className="font-medium text-stone-500">Why</dt>
                    <dd className="text-stone-700">{item.why}</dd>
                  </dl>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Recommendations & Next Steps */}
        <section className="mt-12" aria-labelledby="next-heading">
          <h2 id="next-heading" className="font-serif text-2xl sm:text-3xl text-stone-900 mb-1">Recommendations & Next Steps</h2>
          <p className="text-sm text-stone-600 mb-6">Listed in order of priority.</p>

          <ul className="space-y-3">
            {RECOMMENDATIONS.map((rec) => {
              const s = STATUS[rec.status];
              return (
                <li
                  key={rec.id}
                  className={`bg-white rounded-xl border border-stone-200 shadow-sm p-5 border-l-4 ${
                    rec.status === 'urgent' ? 'border-l-red-600' : 'border-l-amber-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.iconWrap}`}>
                      <s.Icon size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-stone-900">{rec.title}</h3>
                        <StatusBadge status={rec.status} />
                      </div>
                      <p className="text-sm text-stone-600">{rec.description}</p>
                    </div>
                    <div className={`text-xs font-medium sm:text-right sm:w-36 shrink-0 ${s.text}`}>{rec.timing}</div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 rounded-xl bg-[#1C2420] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
            <div>
              <p className="font-serif text-xl">Questions about this report?</p>
              <p className="text-sm text-stone-300">Reply to the email and we'll get back to you within 1 business day, or explore ongoing maintenance plans.</p>
            </div>
            <a
              href="/#studio-offerings"
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-white text-stone-900 text-sm font-medium hover:bg-stone-100 shrink-0 ${FOCUS_RING}`}
            >
              View plans
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500 px-4">
        <Activity size={12} className="inline mr-1 -mt-0.5" aria-hidden="true" />
        Prepared by Iris & Oak · Sample report
      </footer>
    </div>
  );
}

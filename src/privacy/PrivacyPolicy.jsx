import { useState } from 'react';
import { isAnalyticsOptedOut, setAnalyticsOptOut } from '../analytics.jsx';

const CONTACT_EMAIL = 'contact@irisoak.dev';
const FOCUS_RING = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400';
const LINK = `underline underline-offset-4 hover:opacity-70 rounded ${FOCUS_RING}`;

const Email = () => (
  <a href={`mailto:${CONTACT_EMAIL}`} className={LINK}>{CONTACT_EMAIL}</a>
);

function Section({ id, title, children }) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <h2 id={id} className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">{title}</h2>
      {children}
    </section>
  );
}

function Provider({ name, children }) {
  return (
    <div className="space-y-3 p-5 rounded-lg border border-zinc-800 bg-zinc-900/60">
      <h3 className="text-base font-bold text-zinc-100">{name}</h3>
      {children}
    </div>
  );
}

const List = ({ children }) => <ul className="list-disc pl-5 space-y-1.5">{children}</ul>;

// Lets visitors opt out of (or back into) Vercel Web Analytics in this browser.
function AnalyticsPreference() {
  const [optedOut, setOptedOut] = useState(isAnalyticsOptedOut);
  const [saveFailed, setSaveFailed] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const toggle = () => {
    const next = !optedOut;
    if (setAnalyticsOptOut(next)) {
      setOptedOut(next);
      setSaveFailed(false);
      setAnnouncement(next ? 'You have opted out of analytics on this browser.' : 'Analytics is turned back on for this browser.');
    } else {
      setSaveFailed(true);
      setAnnouncement('');
    }
  };

  return (
    <div className="mt-2 p-5 rounded-lg border border-zinc-800 bg-zinc-900/60 space-y-3">
      <h3 className="text-base font-bold text-zinc-100">Analytics preference</h3>
      <p id="analytics-preference-status">
        Analytics is currently <strong className="text-zinc-100">{optedOut ? 'off' : 'on'}</strong> for this browser.
      </p>
      <button
        type="button"
        onClick={toggle}
        aria-describedby="analytics-preference-status"
        className={`px-4 py-2 rounded text-sm font-medium border border-zinc-600 hover:bg-zinc-800 ${FOCUS_RING}`}
      >
        {optedOut ? 'Turn analytics back on' : 'Opt out of analytics'}
      </button>
      {saveFailed && (
        <p role="alert" className="text-sm text-red-400">
          Your browser didn’t allow this preference to be saved, so it couldn’t be changed. Check that site data is allowed for this website and try again.
        </p>
      )}
      <p role="status" className="sr-only">{announcement}</p>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans">
      <header className="border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <a href="/" className={`font-bold tracking-wider text-sm uppercase text-zinc-100 ${FOCUS_RING} rounded`}>Iris &amp; Oak</a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-12 space-y-4">
          <p className="text-xs uppercase font-mono tracking-widest text-zinc-400">Privacy</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">Privacy Policy</h1>
          <p className="text-base leading-relaxed">
            This Privacy Policy explains how Iris &amp; Oak collects, uses and handles personal information when you visit
            the website, submit an enquiry or become a client.
          </p>
          {/* CONFIRM: publication date for this revision */}
          <p className="text-sm text-zinc-400">Last updated: 27 October 2026</p>
        </div>

        <div className="space-y-12 text-sm sm:text-base leading-relaxed">
          <Section id="responsible" title="1. Who is responsible for your information?">
            <p>
              Iris &amp; Oak is responsible for the personal information collected through this website and through direct
              enquiries relating to its services.
            </p>
            <p>
              If you have a question about this Privacy Policy or how your information is handled, you can contact Iris &amp; Oak
              at <Email />.
            </p>
          </Section>

          <Section id="collect" title="2. Information I may collect">
            <p>When you submit an enquiry through the contact form on this website, I collect the information you provide:</p>
            <List>
              <li>Your name</li>
              <li>Your business name or current website, if you include it</li>
              <li>Your email address</li>
              <li>The options you select under “What do you need help with?”</li>
              <li>Your preferred launch timeframe, if you choose one</li>
              <li>Your budget range, if you choose one (a preference only, not a quote)</li>
              <li>The package you asked about, if you reached the form from a package or care-plan button on the website</li>
              <li>The details you share about your business, website or project</li>
            </List>
            <p>
              If you reach the contact form from the Portfolio Partnership information on this website, your enquiry is marked
              as a Portfolio Partnership enquiry.
            </p>
            <p>If you email Iris &amp; Oak directly, I will receive the information you include in your email.</p>
            <p>
              If you become a client, I may also collect information reasonably required to manage the project, communicate with
              you, prepare estimates or invoices and receive payment.
            </p>
          </Section>

          <Section id="use" title="3. How your information is used">
            <p>I may use your personal information to:</p>
            <List>
              <li>Review and respond to your enquiry</li>
              <li>Send you an automatic email confirming your enquiry was received</li>
              <li>Consider whether your business is a good fit for the Portfolio Partnership, if you enquire about it</li>
              <li>Discuss your project or requirements with you</li>
              <li>Prepare estimates, proposals or invoices</li>
              <li>Provide services that you have requested</li>
              <li>Communicate with you about an active project</li>
              <li>Maintain appropriate business and financial records</li>
              <li>Meet applicable legal, accounting or tax obligations</li>
              <li>Protect the website and business from misuse or security issues</li>
            </List>
            <p>
              Enquiries submitted through the website are sent by email, as described in section 5. The website itself does not
              save enquiry details to a database.
            </p>
            <p>
              If you take part in the Portfolio Partnership, the completed website may be featured as a portfolio case study. You
              will approve the final case-study content before it is published.
            </p>
            <p>
              Information submitted through an enquiry will not be added to a marketing mailing list simply because you contacted
              Iris &amp; Oak.
            </p>
          </Section>

          <Section id="lawful-basis" title="4. Lawful basis for using your information">
            <p>Iris &amp; Oak only uses personal information where there is an appropriate lawful basis for doing so.</p>
            <p>
              Depending on the circumstances, this may include processing that is necessary to take steps at your request before
              entering into a contract, processing required to perform a contract with you, compliance with legal obligations, or
              legitimate interests in operating and protecting the business.
            </p>
          </Section>

          <Section id="services" title="5. Services that may process your information">
            <p>
              Iris &amp; Oak uses third-party services to operate the website and provide business services. Where relevant, these
              providers may process limited personal information on behalf of Iris &amp; Oak or as part of providing their own
              services.
            </p>

            <Provider name="Vercel">
              {/* CONFIRM: the site is deployed on Vercel's Pro plan (no Vercel project settings are stored in this repository) */}
              <p>
                The Iris &amp; Oak website is hosted on Vercel’s Pro plan. Vercel may process technical information as part of
                hosting, securing and delivering the website, and it runs the server function that sends enquiry emails.
              </p>
              {/* CONFIRM: Web Analytics is enabled for the Vercel project. Until it is, no analytics data is collected. */}
              <p>
                Iris &amp; Oak also uses Vercel Web Analytics to understand how the website is used and to help improve its content,
                performance and user experience. The analytics service provides aggregated website statistics such as page views,
                referring websites, approximate geographic location, browser, operating system and device type. See section 8.
              </p>
            </Provider>

            <Provider name="Resend">
              <p>When you submit the enquiry form, Resend is used to send two emails:</p>
              <List>
                <li>
                  A notification to Iris &amp; Oak containing the details you submitted, with your email address set as the
                  reply-to address.
                </li>
                <li>
                  A short confirmation email to the email address you provide, letting you know your enquiry was received. It uses
                  fixed wording and does not repeat your message or the other details you submitted.
                </li>
              </List>
              <p>The confirmation email is only sent after the notification to Iris &amp; Oak has been accepted for delivery.</p>
              {/* CONFIRM: the account is on Resend's Free plan */}
              <p>
                Iris &amp; Oak uses Resend’s Free plan. On this plan, Resend states that it keeps the content of these emails, along
                with delivery events and logs, for 30 days. It stores this information in the United States.
              </p>
            </Provider>

            <Provider name="Google Workspace">
              {/* CONFIRM: the enquiry inbox (ENQUIRY_TO_EMAIL) is the Iris & Oak Google Workspace mailbox */}
              <p>
                Enquiry notification emails are received and stored in the Iris &amp; Oak Google Workspace mailbox, where they are
                kept for the period described in section 7.
              </p>
            </Provider>

            <Provider name="Stripe">
              <p>
                If you become a client, Stripe may be used for services such as estimates, invoicing and payment processing.
                Information required for those services may be processed by Stripe under its own privacy terms.
              </p>
              <p>Iris &amp; Oak does not currently collect card details directly through the public website.</p>
            </Provider>

            <Provider name="Squarespace">
              <p>
                Squarespace is currently used in connection with the Iris &amp; Oak domain and DNS management. The website itself is
                hosted separately on Vercel.
              </p>
            </Provider>

            <p>
              Other service providers may be introduced where reasonably necessary to operate Iris &amp; Oak. This Privacy Policy
              will be updated where appropriate if the way personal information is handled materially changes.
            </p>
          </Section>

          <Section id="international" title="6. International processing">
            <p>
              Vercel and Resend both state that their primary data processing takes place in the United States, and Google
              Workspace data may be processed in other countries. Information processed by these providers, including enquiry
              emails, is therefore likely to be processed outside the United Kingdom.
            </p>
            {/* CONFIRM: depends on the Vercel Pro plan above */}
            <p>
              Vercel’s data processing terms apply to the Pro plan used for this website. They include the EU Standard
              Contractual Clauses and, for transfers from the United Kingdom, the UK International Data Transfer Addendum.
            </p>
            <p>
              Resend’s data processing terms apply to every Resend account, including the Free plan used by Iris &amp; Oak. Resend
              states that transfers from the United Kingdom are covered by the UK Addendum to the EU Standard Contractual Clauses.
            </p>
            {/*
              CONFIRM: Check that the Google Workspace data processing terms have been accepted in the Admin console
              (Account > Account settings > Legal and compliance). Until then, the sentence below describes Google's
              published terms, not a confirmed safeguard for the Iris & Oak account.
            */}
            <p>
              Google states that Google Workspace data may be processed in any country where Google or its subprocessors maintain
              facilities. Google’s published data processing terms state that transfers of UK personal data to the United States
              rely on Google’s certification to the UK Extension to the EU-U.S. Data Privacy Framework, with Standard Contractual
              Clauses provided for where no such alternative transfer solution applies.
            </p>
            <p>
              Where personal information is transferred internationally by other providers, appropriate safeguards will be used
              where required by applicable data protection law.
            </p>
          </Section>

          <Section id="retention" title="7. How long information is kept">
            <p>
              The website does not store enquiry submissions in a database. Your enquiry exists only as the emails described in
              section 5.
            </p>
            <p>
              Enquiry emails for general enquiries that do not become client projects will be deleted from the Iris &amp; Oak
              Google Workspace mailbox no later than 9 months after the last meaningful communication, unless there is a
              legitimate reason to retain the information for longer.
            </p>
            <p>
              Separately, copies of the enquiry notification and confirmation emails held by Resend are kept for 30 days, as
              described in section 5.
            </p>
            <p>
              If you become a client, some information may need to be retained for longer where necessary for project records,
              contracts, accounting, tax, dispute resolution or other legal obligations.
            </p>
            <p>Information that is no longer reasonably required will be deleted or otherwise securely disposed of where appropriate.</p>
          </Section>

          <Section id="cookies" title="8. Cookies, analytics and browser storage">
            <p>This website does not set cookies.</p>
            <p>
              Iris &amp; Oak uses Vercel Web Analytics to understand how visitors use this website and to help improve its content,
              performance and user experience.
            </p>
            <p>
              Vercel states that Web Analytics does not use third-party cookies. It provides Iris &amp; Oak with aggregated
              statistics such as page views, referring websites, approximate geographic location, browser, operating system and
              device type.
            </p>
            <p>
              Instead of a cookie, Vercel identifies visits using a hash created from the incoming request. Vercel states that
              visitor sessions are automatically discarded after 24 hours, and that Web Analytics does not collect identifiers that
              track visitors across different websites.
            </p>
            <p>
              Analytics information is used only to understand website usage and improve the Iris &amp; Oak website. It is not used
              for behavioural advertising or cross-site advertising tracking.
            </p>
            <p>
              You can object to the use of Vercel Web Analytics on this website using the control below. While you are opted out,
              analytics events from your browser are cancelled before they are sent to Vercel.
            </p>
            <p>This website saves a small amount of information in your browser’s local storage on this device:</p>
            <List>
              <li>
                Your Studio Configurator preferences (colour theme, typography, text size and high-contrast setting), so the
                homepage can remember how you like it displayed.
              </li>
              <li>Your analytics choice, if you use the control below.</li>
            </List>
            <p>
              This information stays in your browser. It is not sent to Iris &amp; Oak, and clearing your browser’s site data will
              remove it.
            </p>
            <AnalyticsPreference />
          </Section>

          <Section id="rights" title="9. Your data protection rights">
            <p>
              Depending on the circumstances and the lawful basis being relied upon, UK data protection law may give you rights
              relating to your personal information.
            </p>
            <p>These may include the right to:</p>
            <List>
              <li>Ask for access to personal information held about you</li>
              <li>Ask for inaccurate information to be corrected</li>
              <li>Ask for your information to be deleted in certain circumstances</li>
              <li>Ask for the use of your information to be restricted</li>
              <li>Object to certain uses of your information</li>
              <li>Request data portability where the right applies</li>
            </List>
            <p>
              Not every right applies in every situation. If you would like to make a request or ask a question about your
              information, contact <Email />.
            </p>
          </Section>

          <Section id="object" title="10. Your right to object">
            <div className="space-y-4 p-5 rounded-lg border border-emerald-500/40 bg-emerald-500/5">
              <p>
                Where Iris &amp; Oak relies on legitimate interests to process your personal information, you may have the right
                to object to that processing.
              </p>
              <p>To raise an objection, contact <Email />.</p>
            </div>
          </Section>

          <Section id="complaints" title="11. Complaints">
            <p>
              If you have concerns about how Iris &amp; Oak has handled your personal information, please contact me first so that
              I can investigate the issue.
            </p>
            <p>You also have the right to raise a concern with the UK Information Commissioner’s Office (ICO).</p>
            <p>
              You can find information about making a data protection complaint through the{' '}
              <a
                href="https://ico.org.uk/make-a-complaint/data-protection-complaints/"
                target="_blank"
                rel="noreferrer"
                className={LINK}
              >
                Information Commissioner’s Office<span className="sr-only"> (opens in a new tab)</span>
              </a>
              .
            </p>
          </Section>

          <Section id="changes" title="12. Changes to this policy">
            <p>
              This Privacy Policy may be updated as Iris &amp; Oak develops, new services are introduced or the way personal
              information is handled changes.
            </p>
            <p>The latest version will be published on this page together with its most recent update date.</p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-sm">
          <a href="/" className={LINK}>← Return to Iris &amp; Oak</a>
        </div>
      </footer>
    </div>
  );
}

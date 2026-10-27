// Vercel Serverless Function: POST /api/enquiry
// Receives the homepage enquiry form and, via Resend, sends:
//   1. a notification to the studio with the submitted details, then
//   2. only if (1) was accepted, a confirmation email to the visitor.
//
// Required environment variables (set in Vercel project settings, never in browser code):
//   RESEND_API_KEY      Resend API key
//   ENQUIRY_TO_EMAIL    Inbox that receives enquiries (also the Reply-To on the confirmation)
//   ENQUIRY_FROM_EMAIL  Sender on a domain verified in Resend, e.g. "Iris & Oak <enquiries@example.com>"
//
// Responds { ok: true, confirmationSent } only after Resend accepts the notification;
// confirmationSent reports whether Resend also accepted the confirmation. Otherwise { ok: false, ... }.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NEEDS = ['Websites', 'Bookings & integrations', 'Business tools', 'Web apps', 'Site maintenance', 'Not sure yet'];
const LAUNCH_OPTIONS = ['ASAP', 'Within a month', '1–3 months', 'Flexible'];
const BUDGET_OPTIONS = ['Under £1,000', '£1,000–£5,000', '£5,000–£15,000', '£15,000+', 'Not sure yet'];
const MAX_LENGTH = { name: 100, business: 200, email: 254, message: 5000, package: 200 };

const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
// Single-line fields must not contain line breaks (keeps the subject and summary tidy)
const oneLine = (value) => value.replace(/[\r\n]+/g, ' ');

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const body = parseBody(req);
  if (!body) return res.status(400).json({ ok: false, error: 'Invalid request' });

  // Honeypot: real visitors never fill this in. Accept quietly so bots get no signal, but send nothing.
  if (clean(body.contact_reference, 200)) return res.status(200).json({ ok: true });

  const enquiry = {
    name: oneLine(clean(body.name, MAX_LENGTH.name)),
    business: oneLine(clean(body.business, MAX_LENGTH.business)),
    email: oneLine(clean(body.email, MAX_LENGTH.email)),
    message: clean(body.message, MAX_LENGTH.message),
    launch: LAUNCH_OPTIONS.includes(body.launch) ? body.launch : '',
    budget: BUDGET_OPTIONS.includes(body.budget) ? body.budget : '',
    needs: Array.isArray(body.needs) ? body.needs.filter((need) => NEEDS.includes(need)) : [],
    package: oneLine(clean(body.package, MAX_LENGTH.package))
  };

  const errors = {};
  if (!enquiry.name) errors.name = 'Enter your name.';
  if (!enquiry.email) errors.email = 'Enter your email address.';
  else if (!EMAIL_PATTERN.test(enquiry.email)) errors.email = 'Enter an email address in the correct format.';
  if (Object.keys(errors).length > 0) return res.status(400).json({ ok: false, errors });

  const { RESEND_API_KEY, ENQUIRY_TO_EMAIL, ENQUIRY_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !ENQUIRY_TO_EMAIL || !ENQUIRY_FROM_EMAIL) {
    console.error('Enquiry endpoint is not configured: missing Resend environment variables');
    return res.status(500).json({ ok: false, error: 'Enquiry service is not configured' });
  }

  const text = [
    `Name: ${enquiry.name}`,
    `Business / website: ${enquiry.business || 'Not provided'}`,
    `Email: ${enquiry.email}`,
    `Needs help with: ${enquiry.needs.join(', ') || 'Not specified'}`,
    `Package asked about: ${enquiry.package || 'None'}`,
    `Launch: ${enquiry.launch || 'Not specified'}`,
    `Budget (preference only, not a quote): ${enquiry.budget || 'Not specified'}`,
    '',
    'Project:',
    enquiry.message || 'No details provided.'
  ].join('\n');

  const sendEmail = async (email, label) => {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email)
      });
      // Log status only: never log the visitor's details
      if (!response.ok) console.error(`Resend rejected the ${label} email (status ${response.status})`);
      return response.ok;
    } catch {
      console.error(`Could not reach Resend to send the ${label} email`);
      return false;
    }
  };

  // 1. Notification to the studio
  const notified = await sendEmail(
    {
      from: ENQUIRY_FROM_EMAIL,
      to: [ENQUIRY_TO_EMAIL],
      reply_to: enquiry.email,
      subject: `New enquiry from ${enquiry.name}`,
      text
    },
    'enquiry notification'
  );
  if (!notified) return res.status(502).json({ ok: false, error: 'Enquiry could not be sent' });

  // 2. Confirmation to the visitor, sent only once the studio notification was accepted.
  // Fixed wording with none of the submitted content, so the form can't be used to send
  // arbitrary messages to other people's addresses.
  const confirmationSent = await sendEmail(
    {
      from: ENQUIRY_FROM_EMAIL,
      to: [enquiry.email],
      reply_to: ENQUIRY_TO_EMAIL,
      subject: 'We’ve received your enquiry',
      text: [
        'Thanks for getting in touch with Iris & Oak.',
        '',
        'We’ve received your enquiry and will be in touch within two working days.',
        '',
        'If you didn’t send this enquiry, you can ignore this email.',
        '',
        'Iris & Oak'
      ].join('\n')
    },
    'enquiry confirmation'
  );

  // The enquiry has been received either way; confirmationSent reports the visitor email honestly.
  return res.status(200).json({ ok: true, confirmationSent });
}

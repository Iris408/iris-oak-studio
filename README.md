# Iris & Oak Studio

The public studio website for Iris & Oak, showcasing client work, digital product prototypes, systems projects and website care services.

## Portfolio

- Web Dev: completed client websites
- Product Design: PartsPilot prototype and Bloom demo
- Systems: AccessHub prototype

Portfolio samples use fictional client information. They are demonstrations, not live client systems.

## Run locally

Install dependencies:

    npm install

Start the development server:

    npm run dev

## Build

    npm run build

## Browser tests

Builds the site and runs the headless Chrome suites (project popups and phone layout). Needs Node 22+ and Chrome; see `tests/browser/README.md`.

    npm run test:browser

## Enquiry endpoint tests

Runs `api/enquiry.js` with Resend stubbed out, so no email is sent and no API key is needed. Checks the confirmation email's template variables, including the greeting name.

    npm run test:enquiry

## Project structure

- `src/app/` — main studio website
- `src/portfolio/` — full portfolio page (`/portfolio`), rendered by the same app
- `src/care-report/` — standalone Website Care Report sample
- `src/client-portal/` — standalone Client Portal Dashboard sample
- `public/` — static assets, including fonts and images
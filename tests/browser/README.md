# Browser tests

Headless Chrome checks against the production build, served locally with the same clean URLs and redirects as `vercel.json`. Nothing is deployed and no enquiry is sent: the enquiry request is stubbed in the browser.

- `modal.test.mjs` checks the project popups. It covers:
  - the Kawari and Maison Vale case studies, with their approved copy;
  - every project's images in the single-image and two-image layouts: each image loads, keeps its proportions and leaves no empty column;
  - the phone screenshot carousel at 320, 375 and 390px: both images reachable by Previous / Next, keyboard and swipe, the indicator following the image in view, vertical scrolling and Escape still working;
  - focus, keyboard and dismissal behaviour;
  - "Start a similar project" and "Request Similar Project";
  - the Display settings drawer and the Portfolio Partnership pre-fill.
- `mobile.test.mjs` checks the phone layout at 320, 375 and 390px, in light and dark themes. It covers:
  - the header brand;
  - the swipeable Studio Offerings row, for every category, by tap, swipe and keyboard;
  - the Care plan selector, for all six plan and billing combinations;
  - that tablet and desktop layouts are unchanged at 640, 768 and 1280px.

## Requirements

- Node 22 or newer (the tests use Node's built-in `WebSocket`).
- Google Chrome or Chromium. It's found automatically in the usual install locations. Otherwise, set `CHROME_PATH` to the executable.

## Run

Build, then run both suites:

    npm run test:browser

If `dist/` is already built and up to date, you can run without rebuilding. To run one suite on its own, name it:

    node tests/browser/run.mjs
    node tests/browser/run.mjs modal

To run a suite against a server you started yourself:

    node tests/browser/serve.mjs 4173
    node tests/browser/modal.test.mjs http://127.0.0.1:4173/

Each check prints `PASS` or `FAIL`. A suite exits non-zero if anything fails. `PORT` changes the port the runner uses (default 4173).

## Screenshots

Screenshots are off by default. To save them, set `SHOTS_DIR`. The folder `tests/browser/screenshots/` is git-ignored:

    SHOTS_DIR=tests/browser/screenshots npm run test:browser

## Updating the tests

The modal suite checks each case study's content word for word, using the `CASE_STUDIES` entries near the top of `modal.test.mjs`. When approved copy changes in `src/app/App.jsx`, update those entries to match.

// Project popup checks against the built site: the Kawari and Maison Vale case studies, images in the single-image and
// two-image layouts for every project, the shared dialog behaviour, the enquiry handoff, and other callers
// (Bloom, Display settings drawer, Portfolio Partnership prefill). No enquiry is ever sent: fetch is stubbed.
// Usage: node tests/browser/modal.test.mjs <baseUrl>   (see tests/browser/README.md)
import { launch, reporter, screenshotter, sleep } from './browser.mjs';

const BASE = process.argv[2] || 'http://localhost:4173/';
const { check, error, finish } = reporter();
const browser = await launch();
const { send, evaluate, consoleErrors, failedRequests } = browser;
const shot = screenshotter(send);

const media = (dark) => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
const viewport = (w, h, mobile = false) => send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
const load = async (path) => { await send('Page.navigate', { url: 'about:blank' }); await sleep(100); await send('Page.navigate', { url: new URL(path, BASE).href }); await sleep(1300); };
const key = async (k, code, vk, { shift = false, text } = {}) => {
  const modifiers = shift ? 8 : 0;
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk, modifiers, ...(text ? { text } : {}) });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk, modifiers });
};
const tab = (shift = false) => key('Tab', 'Tab', 9, { shift });
const mouse = async (type, x, y, extra = {}) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1, ...extra });
const clickAt = async (x, y) => { await mouse('mousePressed', x, y); await mouse('mouseReleased', x, y); await sleep(250); };
const dialogOpen = () => evaluate(`!!document.querySelector('[role=dialog][aria-labelledby="project-dialog-title"]')`);
const active = () => evaluate(`(() => { const a = document.activeElement; return { tag: a.tagName, text: a.textContent.replace(/\\s+/g, ' ').trim().slice(0, 80), id: a.id, opener: a.dataset.testOpener || '', inDialog: !!a.closest('[role=dialog]') }; })()`);
// Opens a project's popup from its card the way a keyboard user would, marking the exact opener
const openProject = async (title) => {
  const found = await evaluate(`(() => {
    document.querySelectorAll('[data-test-opener]').forEach(el => delete el.dataset.testOpener);
    const b = [...document.querySelectorAll('button[aria-haspopup=dialog]')].find(b => b.textContent.includes(${JSON.stringify(title)}) && !b.closest('[inert]'));
    if (!b) return false;
    b.dataset.testOpener = 'yes'; b.scrollIntoView({ block: 'center' }); b.focus(); return true;
  })()`);
  if (!found) throw new Error(`no card button for ${title}`);
  await sleep(150); await key('Enter', 'Enter', 13, { text: '\r' }); await sleep(500);
};
const stubFetch = () => evaluate(`(() => { window.__posts = []; const f = window.fetch; window.fetch = (u, o) => { if (String(u).includes('/api/enquiry')) { window.__posts.push(u); return Promise.resolve(new Response('{"ok":true}')); } return f(u, o); }; })()`);
const setField = (sel, value) => evaluate(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)}); el.dispatchEvent(new Event('input', { bubbles: true })); })()`);
const panelRect = () => evaluate(`(() => { const r = document.querySelector('[role=dialog][aria-labelledby="project-dialog-title"]').getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
const contrast = (sel) => evaluate(`(() => {
  const el = document.querySelector(${JSON.stringify(sel)});
  const rgb = (c) => c.match(/[\\d.]+/g).map(Number);
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  let bgEl = el; let bg = getComputedStyle(bgEl).backgroundColor;
  while (bgEl && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) { bgEl = bgEl.parentElement; bg = bgEl ? getComputedStyle(bgEl).backgroundColor : 'rgb(255,255,255)'; }
  const a = lum(rgb(getComputedStyle(el).color)); const b = lum(rgb(bg));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
})()`);
// Waits for the popup's images to finish loading, then reports each one's size, natural proportions and layout.
// `contentW` is the width of the popup's content area (the h2's container), to spot an empty column.
const popupImages = async () => {
  await evaluate(`Promise.all([...document.querySelectorAll('[role=dialog] img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })))`);
  await sleep(250);
  return evaluate(`(() => { const d = document.querySelector('[role=dialog]');
    const contentW = d.querySelector('h2').parentElement.getBoundingClientRect().width;
    return [...d.querySelectorAll('img')].map(i => { const r = i.getBoundingClientRect();
      return { src: i.getAttribute('src'), alt: i.alt, loaded: i.complete && i.naturalWidth > 0, w: r.width, h: r.height, top: r.top, bottom: r.bottom, left: r.left,
        nat: i.naturalWidth / i.naturalHeight, fit: getComputedStyle(i).objectFit, contentW }; }); })()`);
};
// Images sit inside 1px borders (the single image's wrapper, or each image's own), so widths allow for 2px of border
const fills = (width, contentW) => Math.abs(width - contentW) <= 2.5;
const proportional = (imgs) => imgs.every((i) => i.loaded && i.h > 0 && Math.abs(i.w / i.h - i.nat) < 0.02 && i.fit === 'fill');
// Case-study content, read the same way for each project
const caseStudyContent = () => evaluate(`(() => { const d = document.querySelector('[role=dialog]'); const norm = (t) => t.replace(/\\s+/g, ' ').trim();
  const dl = d.querySelector('dl');
  return {
    facts: dl ? [...dl.querySelectorAll(':scope > div')].map(x => [norm(x.querySelector('dt').textContent), norm(x.querySelector('dd').textContent)]) : null,
    factTops: dl ? [...dl.querySelectorAll(':scope > div')].map(x => Math.round(x.getBoundingClientRect().top)) : [],
    dlAfterImages: !!dl && dl.getBoundingClientRect().top >= Math.max(...[...d.querySelectorAll('img')].map(i => i.getBoundingClientRect().bottom)),
    h3s: [...d.querySelectorAll('h3')].map(h => norm(h.textContent)),
    paras: [...d.querySelectorAll('h3 + p')].map(p => norm(p.textContent)),
    tags: [...d.querySelectorAll('h3 + p + ul li')].map(li => norm(li.textContent)),
    text: norm(d.textContent),
    details: d.querySelectorAll('details').length,
    quote: d.querySelectorAll('blockquote, figure').length,
    actions: [...d.querySelectorAll('div.border-t > a, div.border-t > button')].map(x => norm(x.textContent)),
    live: (() => { const ls = [...d.querySelectorAll('a')].filter(x => x.textContent.includes('Visit live site')); return ls[0] && { href: ls[0].href, target: ls[0].target, rel: ls[0].rel, count: ls.length }; })()
  }; })()`);

// Current approved content
const CASE_STUDIES = {
  kawari: {
    title: 'The Kawari Company',
    id: 'kawari-company',
    images: ['/images/kawari-company/homepage.png', '/images/kawari-company/mobile.webp'],
    facts: [['Client', 'The Kawari Company'], ['Industry', 'Safeguarding Consultancy'], ['Services', 'Design & build'], ['Platform', 'Next.js']],
    paras: [
      'An established consultancy with 25+ years of experience needed its first website, one that felt as credible as its reputation.',
      'A calm, editorial design with clear services and a simple route to request a consultation.',
      'A professional online presence the client can share with confidence.',
      'Built with Next.js for fast loading, with a layout that adapts to phones, tablets and desktops.'
    ],
    tags: ['Next.js', 'TypeScript', 'CSS', 'React'],
    liveUrl: 'https://www.kawaricompany.com/'
  },
  maisonVale: {
    title: 'Events by Maison Vale',
    id: 'maison-vale',
    images: ['/images/maison-vale/homepage.png'],
    facts: [['Client', 'Events by Maison Vale'], ['Industry', 'Weddings & Events'], ['Services', 'Design & build'], ['Platform', 'Squarespace']],
    paras: [
      'An events company with almost 30 years of experience needed an elegant website that reflects the care behind every wedding, corporate event and special occasion.',
      'A refined, image-led design with dedicated pages for each type of event, warm copy that balances celebration with sensitivity, and tailored enquiry forms for every service.',
      'A polished online presence that guides each visitor to the right service and makes it easy to start planning.',
      'Built on Squarespace so the client can update content themselves, with enquiry forms connected through Zapier and Resend, and a layout that adapts to phones, tablets and desktops.'
    ],
    tags: ['Squarespace', 'Zapier', 'Resend'],
    liveUrl: 'https://eventsbymaisonvale.com/'
  }
};
const HEADINGS = ['The brief', 'The approach', 'The result', 'How it’s built'];
const KAWARI = CASE_STUDIES.kawari.title;
const MAISON_VALE = CASE_STUDIES.maisonVale.title;
const DRAFT = 'We run a small bakery in Leeds.';
const lineFor = (title) => `I’d like to start a project similar to ${title}.`;
const fullFor = (title) => `Hi, I’d like to start a project similar to ${title}. Here’s a little about my business and what I’m hoping the website will do:`;

const checkCaseStudy = async (study) => {
  const c = await caseStudyContent();
  const label = study.title;
  check(`${label}: quick facts are the four approved label/value pairs`, JSON.stringify(c.facts) === JSON.stringify(study.facts), JSON.stringify(c.facts));
  check(`${label}: quick facts directly under the images, four columns on desktop`, c.dlAfterImages && new Set(c.factTops).size === 1, JSON.stringify(c.factTops));
  check(`${label}: section headings The brief, The approach, The result, How it’s built`, JSON.stringify(c.h3s) === JSON.stringify(HEADINGS), JSON.stringify(c.h3s));
  check(`${label}: case study and build copy match the approved content`, JSON.stringify(c.paras) === JSON.stringify(study.paras), JSON.stringify(c.paras));
  check(`${label}: stack tags from the project data, under the paragraph`, JSON.stringify(c.tags) === JSON.stringify(study.tags), JSON.stringify(c.tags));
  check(`${label}: old scope section, Technical Execution and Tech Stack accordion removed`, !/Project scope|Technical Execution|Tech Stack/i.test(c.text) && c.details === 0, c.text.slice(0, 200));
  check(`${label}: no performance figures or invented results`, !/\d+\s?%|score|Lighthouse|enquir(y|ies) (up|increase)/i.test(c.text));
  check(`${label}: no testimonial section without an approved quote`, c.quote === 0);
  check(`${label}: footer actions Start a similar project, Visit live site ↗, Close`, JSON.stringify(c.actions) === JSON.stringify(['Start a similar project', `Visit live site ↗: ${label} (opens in a new tab)`, 'Close']), JSON.stringify(c.actions));
  check(`${label}: live-site link uses the project URL, announces the new tab, safe rel, shown once`, c.live?.href === study.liveUrl && c.live.target === '_blank' && /noopener/.test(c.live.rel) && c.live.count === 1, JSON.stringify(c.live));
};

try {
  await media(false); await viewport(1280, 900);

  // ---------- 1. Kawari popup content (desktop, two images) ----------
  await load('/'); await stubFetch();
  await openProject(KAWARI);
  check('popup opens from the card', await dialogOpen());
  const { root } = await send('DOM.getDocument', { depth: 0 });
  const { nodeId } = await send('DOM.querySelector', { nodeId: root.nodeId, selector: '[role=dialog][aria-labelledby="project-dialog-title"]' });
  const ax = (await send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false })).nodes[0];
  check('dialog named by its title, modal', ax.role?.value === 'dialog' && ax.name?.value === KAWARI && (await evaluate(`document.querySelector('[role=dialog]').getAttribute('aria-modal')`)) === 'true', `${ax.role?.value} / ${ax.name?.value}`);
  let a = await active();
  check('focus starts on the title (top of the case study)', a.tag === 'H2' && a.id === 'project-dialog-title', JSON.stringify(a));
  check('popup opens scrolled to the top', (await evaluate(`document.querySelector('[role=dialog]').scrollTop`)) === 0);

  let imgs = await popupImages();
  check('Kawari: two images, desktop then phone capture, both loaded', imgs.length === 2 && imgs.every((i) => i.loaded) && JSON.stringify(imgs.map((i) => i.src)) === JSON.stringify(CASE_STUDIES.kawari.images), JSON.stringify(imgs.map((i) => [i.src, i.loaded])));
  check('Kawari: images have concise, distinct alt text', imgs.every((i) => i.alt.length > 20 && i.alt.length < 140) && imgs[0].alt !== imgs[1].alt && /phone/.test(imgs[1].alt), JSON.stringify(imgs.map((i) => i.alt)));
  check('Kawari: aspect ratios preserved (no crop, no stretch)', proportional(imgs), JSON.stringify(imgs.map((i) => [i.w / i.h, i.nat, i.fit])));
  check('Kawari: side by side, desktop takes most of the width', Math.abs(imgs[0].top - imgs[1].top) < 2 && imgs[1].left > imgs[0].left && imgs[0].w > 3 * imgs[1].w, JSON.stringify(imgs.map((i) => [i.left, i.top, i.w])));
  check('Kawari: both images share a height', Math.abs(imgs[0].h - imgs[1].h) < 1.5, JSON.stringify(imgs.map((i) => i.h)));
  check('Kawari: the pair fills the content width (no empty column)', fills(imgs[1].left + imgs[1].w - imgs[0].left, imgs[0].contentW), JSON.stringify(imgs.map((i) => [i.left, i.w, i.contentW])));
  await checkCaseStudy(CASE_STUDIES.kawari);

  // Editorial headings: site type, not bold mono; readable contrast
  const style = await evaluate(`(() => { const h = document.querySelector('[role=dialog] h3'); const s = getComputedStyle(h); const body = getComputedStyle(document.querySelector('#root > div'));
    return { family: s.fontFamily, bodyFamily: body.fontFamily, weight: s.fontWeight, spacing: parseFloat(s.letterSpacing) / parseFloat(s.fontSize), dtFamily: getComputedStyle(document.querySelector('[role=dialog] dt')).fontFamily }; })()`);
  check('section labels use the site’s editorial font, weight ≤ 500, restrained spacing', style.family === style.bodyFamily && style.dtFamily === style.bodyFamily && !/mono/i.test(style.family) && Number(style.weight) <= 500 && style.spacing <= 0.15, JSON.stringify(style));
  for (const [dark, label] of [[false, 'light'], [true, 'dark']]) {
    await media(dark); await sleep(250);
    const ratios = { label: await contrast('[role=dialog] h3'), dt: await contrast('[role=dialog] dt'), body: await contrast('[role=dialog] h3 + p'), tag: await contrast('[role=dialog] h3 + p + ul li') };
    check(`${label}: modal text contrast ≥ 4.5:1`, Object.values(ratios).every((r) => r >= 4.5), JSON.stringify(ratios));
  }
  await media(false); await sleep(250);
  await shot('kawari-1280-light');

  // ---------- 2. Background, scroll lock, focus trap ----------
  const bg = await evaluate(`({ header: document.querySelector('header').closest('[inert]') !== null, main: [...document.querySelectorAll('section')].every(s => s.closest('[inert]')), dialogInert: !!document.querySelector('[role=dialog]').closest('[inert]'), overflow: document.documentElement.style.overflow })`);
  check('background inert, dialog not; page scroll locked', bg.header && bg.main && !bg.dialogInert && bg.overflow === 'hidden', JSON.stringify(bg));
  const y0 = await evaluate(`scrollY`);
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 20, y: 450, deltaX: 0, deltaY: 600 }); await sleep(300);
  check('wheel over the backdrop leaves the page still', (await evaluate(`scrollY`)) === y0);
  const focusables = await evaluate(`[...document.querySelector('[role=dialog]').querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].map(e => e.textContent.replace(/\\s+/g, ' ').trim() || e.getAttribute('aria-label'))`);
  const seen = [];
  for (let i = 0; i < focusables.length + 1; i++) { await tab(); await sleep(60); seen.push(await active()); }
  check('Tab visits every popup control in order, then wraps to the first', seen.slice(0, focusables.length).every((s) => s.inDialog) && seen[focusables.length].inDialog && seen[0].text === seen[focusables.length].text
    && seen.slice(0, focusables.length).map((s) => s.text || 'x').join('|').includes('Start a similar project|Visit live site'), JSON.stringify(seen.map((s) => s.text)));
  check('first Tab from the title goes to Start a similar project', seen[0].text === 'Start a similar project', JSON.stringify(seen[0]));
  await evaluate(`document.querySelector('[aria-label="Close project details"]').focus()`);
  await tab(true); await sleep(60);
  a = await active();
  check('Shift+Tab from the first control (×) wraps to Close', a.inDialog && a.text === 'Close', JSON.stringify(a));
  check('keyboard focus ring visible on Close', await evaluate(`getComputedStyle(document.activeElement).outlineStyle === 'solid'`));

  // ---------- 3. Clicks, selection and scrolling inside stay open ----------
  let p = await panelRect();
  await clickAt(p.x + p.w / 2, p.y + 220);
  check('click inside the panel keeps it open', await dialogOpen());
  // Text selection drag from inside the panel out onto the backdrop
  await mouse('mousePressed', p.x + 60, p.y + 120); await mouse('mouseMoved', p.x - 40, p.y + 40, { buttons: 1 }); await mouse('mouseReleased', p.x - 40, p.y + 40); await sleep(250);
  check('selection drag ending on the backdrop keeps it open', await dialogOpen());
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: p.x + p.w / 2, y: p.y + 200, deltaX: 0, deltaY: 400 }); await sleep(400);
  check('scrolling inside the panel keeps it open, page still', (await dialogOpen()) && (await evaluate(`scrollY`)) === y0);

  // ---------- 4. Dismissal and focus restoration ----------
  await clickAt(8, 8);
  a = await active();
  check('backdrop click closes; focus returns to the exact card control', !(await dialogOpen()) && a.opener === 'yes', JSON.stringify(a));
  check('after close: page interactive and scrollable again', await evaluate(`!document.querySelector('[inert]:not([data-loop-item])') && document.documentElement.style.overflow === ''`));
  await openProject(KAWARI);
  await key('Escape', 'Escape', 27); await sleep(250);
  a = await active();
  check('Escape closes; focus returns to the card control', !(await dialogOpen()) && a.opener === 'yes', JSON.stringify(a));
  await openProject(KAWARI);
  await evaluate(`document.querySelector('[aria-label="Close project details"]').focus()`); await key('Enter', 'Enter', 13, { text: '\r' }); await sleep(250);
  a = await active();
  check('× control closes; focus returns to the card control', !(await dialogOpen()) && a.opener === 'yes', JSON.stringify(a));
  await openProject(KAWARI);
  await evaluate(`[...document.querySelectorAll('[role=dialog] button')].find(b => b.textContent.trim() === 'Close').click()`); await sleep(250);
  a = await active();
  check('Close button closes; focus returns to the card control', !(await dialogOpen()) && a.opener === 'yes', JSON.stringify(a));

  // ---------- 5. Start a similar project, with an existing draft ----------
  await setField('#enquiry-name', 'Test Visitor');
  await setField('#enquiry-message', DRAFT);
  await openProject(KAWARI);
  await evaluate(`[...document.querySelectorAll('[role=dialog] a')].find(x => x.textContent.trim() === 'Start a similar project').focus()`);
  await key('Enter', 'Enter', 13, { text: '\r' }); await sleep(700);
  const handoff = await evaluate(`({ open: !!document.querySelector('[role=dialog]'), focus: document.activeElement.textContent, message: document.getElementById('enquiry-message').value, name: document.getElementById('enquiry-name').value,
    headingTop: Math.round(document.getElementById('contact').getBoundingClientRect().top), posts: window.__posts.length, form: !!document.querySelector('#contact form') })`);
  check('Start a similar project closes the popup and focuses the enquiry heading', !handoff.open && handoff.focus === 'Plan your project', JSON.stringify(handoff));
  check('enquiry form scrolled into view', Math.abs(handoff.headingTop) < 120, handoff.headingTop);
  check('draft kept; project added on its own line', handoff.message === `${DRAFT}\n\n${lineFor(KAWARI)}` && handoff.name === 'Test Visitor', JSON.stringify(handoff.message));
  check('nothing submitted; the form still needs the visitor to send it', handoff.posts === 0 && handoff.form);
  await openProject(KAWARI);
  await evaluate(`[...document.querySelectorAll('[role=dialog] a')].find(x => x.textContent.trim() === 'Start a similar project').click()`); await sleep(600);
  check('choosing it again doesn’t repeat the line', (await evaluate(`document.getElementById('enquiry-message').value`)) === `${DRAFT}\n\n${lineFor(KAWARI)}`);
  await setField('#enquiry-message', `${DRAFT}\n\n${lineFor(KAWARI)} Edited by me.`);
  check('pre-filled text stays editable', (await evaluate(`document.getElementById('enquiry-message').value`)).endsWith('Edited by me.'));

  // Empty box gets the full starting text
  await load('/'); await stubFetch();
  await openProject(KAWARI);
  await evaluate(`[...document.querySelectorAll('[role=dialog] a')].find(x => x.textContent.trim() === 'Start a similar project').click()`); await sleep(600);
  check('empty message box gets the full starting text', (await evaluate(`document.getElementById('enquiry-message').value`)) === fullFor(KAWARI), await evaluate(`document.getElementById('enquiry-message').value`));

  // ---------- 6. Maison Vale case study (desktop, single image) ----------
  await load('/'); await stubFetch();
  await openProject(MAISON_VALE);
  a = await active();
  check('Maison Vale: popup opens, focus starts on the title', (await dialogOpen()) && a.id === 'project-dialog-title', JSON.stringify(a));
  imgs = await popupImages();
  check('Maison Vale: one image (the desktop screenshot), loaded', imgs.length === 1 && imgs[0].loaded && imgs[0].src === CASE_STUDIES.maisonVale.images[0], JSON.stringify(imgs.map((i) => [i.src, i.loaded])));
  check('Maison Vale: no reference to a missing phone image', !(await evaluate(`[...document.querySelectorAll('[role=dialog] img')].some(i => /mobile/.test(i.getAttribute('src')))`)));
  check('Maison Vale: aspect ratio preserved (no crop, no stretch)', proportional(imgs), JSON.stringify(imgs.map((i) => [i.w / i.h, i.nat, i.fit])));
  check('Maison Vale: single image fills the content width (no empty column)', fills(imgs[0].w, imgs[0].contentW), JSON.stringify(imgs.map((i) => [i.w, i.contentW])));
  await checkCaseStudy(CASE_STUDIES.maisonVale);
  await shot('maison-vale-1280');
  await key('Escape', 'Escape', 27); await sleep(250);
  check('Maison Vale: Escape closes, focus back on its card', !(await dialogOpen()) && (await active()).opener === 'yes');
  await setField('#enquiry-message', DRAFT);
  await openProject(MAISON_VALE);
  await evaluate(`[...document.querySelectorAll('[role=dialog] a')].find(x => x.textContent.trim() === 'Start a similar project').click()`); await sleep(700);
  const mvEnq = await evaluate(`({ open: !!document.querySelector('[role=dialog]'), focus: document.activeElement.textContent, message: document.getElementById('enquiry-message').value, posts: window.__posts.length })`);
  check('Maison Vale: Start a similar project keeps the draft, adds its line, focuses the form, sends nothing', !mvEnq.open && mvEnq.focus === 'Plan your project' && mvEnq.message === `${DRAFT}\n\n${lineFor(MAISON_VALE)}` && mvEnq.posts === 0, JSON.stringify(mvEnq));

  // ---------- 7. From /portfolio ----------
  await load('/portfolio');
  await openProject(KAWARI);
  const href = await evaluate(`[...document.querySelectorAll('[role=dialog] a')].find(x => x.textContent.trim() === 'Start a similar project').getAttribute('href')`);
  check('/portfolio: link goes to the homepage form with the project noted', href === '/?project=kawari-company#contact', href);
  await evaluate(`[...document.querySelectorAll('[role=dialog] a')].find(x => x.textContent.trim() === 'Start a similar project').click()`); await sleep(1800);
  const fromPortfolio = await evaluate(`({ url: location.pathname + location.search + location.hash, message: document.getElementById('enquiry-message')?.value, focus: document.activeElement.textContent })`);
  check('/portfolio → homepage form pre-filled, URL tidied, heading focused', fromPortfolio.url === '/#contact' && fromPortfolio.message === fullFor(KAWARI) && fromPortfolio.focus === 'Plan your project', JSON.stringify(fromPortfolio));
  await load('/?project=maison-vale#contact');
  check('?project=maison-vale pre-fills its starting text', (await evaluate(`document.getElementById('enquiry-message').value`)) === fullFor(MAISON_VALE), await evaluate(`document.getElementById('enquiry-message').value`));
  await load('/?project=bloom#contact');
  check('?project= ignores projects without a case study', (await evaluate(`document.getElementById('enquiry-message').value`)) === '');
  await load('/?project=<script>#contact');
  check('?project= ignores unknown values', (await evaluate(`document.getElementById('enquiry-message').value`)) === '');

  // ---------- 8. Other callers of the shared popup ----------
  await load('/portfolio');
  await openProject('Bloom');
  const bl = await evaluate(`(() => { const d = document.querySelector('[role=dialog]'); return { h3s: [...d.querySelectorAll('h3')].map(h => h.textContent), items: d.querySelectorAll('h3 + ul li').length, demo: [...d.querySelectorAll('a')].some(x => x.textContent.includes('View demo')),
    details: d.querySelectorAll('details').length, actions: [...d.querySelectorAll('div.border-t > a, div.border-t > button')].map(x => x.textContent.trim()) }; })()`);
  check('Bloom: Features & focus list, Technical Execution, Tech Stack and View demo kept', JSON.stringify(bl.h3s) === '["Features & focus","Technical Execution"]' && bl.items === 3 && bl.demo && bl.details === 1, JSON.stringify(bl));
  check('Bloom: Close + Request Similar Project', JSON.stringify(bl.actions) === '["Close","Request Similar Project"]', JSON.stringify(bl.actions));
  await evaluate(`document.querySelector('[role=dialog] details summary').click()`); await sleep(150);
  check('Bloom: Tech Stack still opens', await evaluate(`document.querySelector('[role=dialog] details').open && document.querySelectorAll('[role=dialog] details li').length > 0`));
  await clickAt(8, 8);
  check('Bloom: backdrop click closes, focus back on its card', !(await dialogOpen()) && (await active()).opener === 'yes');
  await openProject('Bloom');
  await evaluate(`[...document.querySelectorAll('[role=dialog] a')].find(x => x.textContent.trim() === 'Request Similar Project').click()`); await sleep(1800);
  const blEnq = await evaluate(`({ url: location.pathname + location.hash, message: document.getElementById('enquiry-message')?.value })`);
  check('Bloom: Request Similar Project goes to the homepage form and adds no text', blEnq.url === '/#contact' && blEnq.message === '', JSON.stringify(blEnq));

  // Display settings drawer (shared hook)
  await load('/');
  await evaluate(`document.querySelector('header button[aria-haspopup=dialog]').focus()`); await key('Enter', 'Enter', 13, { text: '\r' }); await sleep(400);
  const dr = await evaluate(`({ open: !!document.querySelector('[aria-labelledby="config-drawer-title"]'), inert: !!document.querySelector('header').closest('[inert]'), overflow: document.documentElement.style.overflow, focusIn: !!document.activeElement.closest('[role=dialog]') })`);
  check('Display settings drawer: opens with focus inside, background inert, page locked', dr.open && dr.inert && dr.overflow === 'hidden' && dr.focusIn, JSON.stringify(dr));
  await key('Escape', 'Escape', 27); await sleep(250);
  const drClosed = await evaluate(`({ open: !!document.querySelector('[role=dialog]'), focus: document.activeElement.getAttribute('aria-label'), inert: !!document.querySelector('header').closest('[inert]'), overflow: document.documentElement.style.overflow })`);
  check('Display settings drawer: Escape closes, focus back on its button, page restored', !drClosed.open && drClosed.focus === 'Display settings' && !drClosed.inert && drClosed.overflow === '', JSON.stringify(drClosed));

  // Portfolio Partnership prefill still works
  await load('/?package=portfolio-partnership#contact');
  const pp = await evaluate(`({ needs: [...document.querySelectorAll('input[name=needs]')].filter(i => i.checked).map(i => i.value), pkg: document.getElementById('contact').innerText.includes('Portfolio Partnership'), message: document.getElementById('enquiry-message').value })`);
  check('Portfolio Partnership link: Websites ticked, package noted, message pre-filled', JSON.stringify(pp.needs) === '["Websites"]' && pp.pkg && pp.message.startsWith('Hi, I’m interested in the Portfolio Partnership'), JSON.stringify(pp));

  // ---------- 9. Every project's images, desktop and phone ----------
  for (const [width, height, mobile] of [[1280, 900, false], [375, 740, true]]) {
    await viewport(width, height, mobile);
    await load('/portfolio');
    const titles = [KAWARI, MAISON_VALE, 'Bloom', 'PartsPilot', 'AccessHub'];
    const found = await evaluate(`${JSON.stringify(titles)}.filter(t => [...document.querySelectorAll('button[aria-haspopup=dialog]')].some(b => !b.closest('[inert]') && b.textContent.includes(t)))`);
    check(`${width}px: all five projects found on /portfolio`, found.length === titles.length, JSON.stringify(found));
    for (const title of titles) {
      await openProject(title);
      imgs = await popupImages();
      const pair = imgs.length === 2;
      check(`${width}px ${title}: every image loads with alt text`, imgs.length >= 1 && imgs.every((i) => i.loaded && i.alt.length > 0), JSON.stringify(imgs.map((i) => [i.src, i.loaded])));
      check(`${width}px ${title}: proportions kept (no crop, no stretch)`, proportional(imgs), JSON.stringify(imgs.map((i) => [i.w / i.h, i.nat, i.fit])));
      if (!pair) {
        check(`${width}px ${title}: single image fills the content width`, fills(imgs[0].w, imgs[0].contentW), JSON.stringify([imgs[0].w, imgs[0].contentW]));
      } else if (!mobile) {
        check(`${width}px ${title}: pair side by side at one height, filling the width`, Math.abs(imgs[0].top - imgs[1].top) < 2 && Math.abs(imgs[0].h - imgs[1].h) < 1.5 && fills(imgs[1].left + imgs[1].w - imgs[0].left, imgs[0].contentW), JSON.stringify(imgs.map((i) => [i.left, i.top, i.w, i.h, i.contentW])));
      } else {
        check(`${width}px ${title}: pair stacked, phone capture below`, imgs[1].top >= imgs[0].bottom && fills(imgs[0].w, imgs[0].contentW), JSON.stringify(imgs.map((i) => [i.top, i.bottom, i.w])));
      }
      await key('Escape', 'Escape', 27); await sleep(250);
    }
  }

  // ---------- 10. Mobile popup behaviour ----------
  await viewport(375, 740, true);
  await load('/'); await stubFetch();
  await openProject(KAWARI);
  const m = await evaluate(`(() => { const d = document.querySelector('[role=dialog]'); const r = (e) => e.getBoundingClientRect();
    const facts = [...d.querySelectorAll('dl > div')].map(x => Math.round(r(x).top));
    const actions = [...d.querySelectorAll('div.border-t > a, div.border-t > button')].map(x => ({ w: Math.round(r(x).width), top: Math.round(r(x).top) }));
    return { facts, actions, scrollable: d.scrollHeight > d.clientHeight, noXOverflow: d.scrollWidth <= d.clientWidth, pageX: document.documentElement.scrollWidth <= innerWidth }; })()`);
  check('mobile: quick facts in two columns', m.facts.length === 4 && m.facts[0] === m.facts[1] && m.facts[2] === m.facts[3] && m.facts[2] > m.facts[0], JSON.stringify(m.facts));
  check('mobile: footer actions stacked full width', m.actions.length === 3 && new Set(m.actions.map((x) => x.w)).size === 1 && m.actions[0].top < m.actions[1].top && m.actions[1].top < m.actions[2].top, JSON.stringify(m.actions));
  check('mobile: long content scrolls inside the popup, no sideways overflow', m.scrollable && m.noXOverflow && m.pageX, JSON.stringify(m));
  await shot('kawari-375-top');
  // Keyboard reaches every action on mobile, each scrolled into view inside the popup
  const reach = [];
  for (let i = 0; i < 6; i++) {
    await tab(); await sleep(120);
    reach.push(await evaluate(`(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const d = document.querySelector('[role=dialog]').getBoundingClientRect(); return { text: a.textContent.replace(/\\s+/g, ' ').trim().slice(0, 30), visible: r.top >= d.top - 1 && r.bottom <= d.bottom + 1 }; })()`));
  }
  check('mobile: Tab reaches Start, Visit live site and Close, each in view', ['Start a similar project', 'Visit live site', 'Close'].every((t) => reach.some((r) => r.text.startsWith(t) && r.visible)), JSON.stringify(reach));
  const docY = await evaluate(`scrollY`);
  await evaluate(`document.querySelector('[role=dialog]').scrollTop = 99999`); await sleep(200);
  check('mobile: popup scrolls to its last action; page stays put', (await evaluate(`(() => { const d = document.querySelector('[role=dialog]'); const last = [...d.querySelectorAll('div.border-t > button')].pop().getBoundingClientRect(); return last.bottom <= d.getBoundingClientRect().bottom + 1; })()`)) && (await evaluate(`scrollY`)) === docY);
  await shot('kawari-375-bottom');
  // Touch: a tap inside stays open, a tap on the backdrop closes
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  const tap = async (x, y) => { await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(400); };
  p = await panelRect();
  await tap(p.x + p.w / 2, p.y + 100);
  check('mobile: tap inside the panel keeps it open', await dialogOpen());
  await tap(p.x + p.w / 2, Math.min(p.y + p.h + 6, 736));
  if ((p.y + p.h + 6) >= 740) await tap(Math.max(2, p.x - 6), p.y + 40);
  check('mobile: tap on the backdrop closes, focus back on the card', !(await dialogOpen()) && (await active()).opener === 'yes', JSON.stringify(p));
  await send('Emulation.setTouchEmulationEnabled', { enabled: false });

  await media(true); await openProject(KAWARI); await shot('kawari-375-dark'); await key('Escape', 'Escape', 27); await sleep(200);
  await viewport(1280, 900); await openProject(KAWARI); await shot('kawari-1280-dark'); await key('Escape', 'Escape', 27);

  check('no console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
  check('no failed requests (no missing images)', failedRequests.length === 0, failedRequests.join(' | '));
} catch (e) {
  error(e);
} finally {
  browser.close();
  process.exit(finish());
}

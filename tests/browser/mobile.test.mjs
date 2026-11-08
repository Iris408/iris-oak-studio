// Phone layout checks against the built site: the header brand, the swipeable Studio Offerings row and the
// Care plan selector at 320, 375 and 390px (light and dark), plus wider screens keeping their layouts.
// Usage: node tests/browser/mobile.test.mjs <baseUrl>   (see tests/browser/README.md)
import { launch, reporter, screenshotter, sleep } from './browser.mjs';

const URL_ = process.argv[2] || 'http://localhost:4173/';
const { check, error, finish } = reporter();
const browser = await launch();
const { send, consoleErrors, failedRequests } = browser;
const ev = browser.evaluate;
const shot = screenshotter(send);
const viewport = async (width, height = 800, mobile = true) => {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile });
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 1 });
};
const media = (dark) => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
const load = async () => { await send('Page.navigate', { url: URL_ }); await sleep(1200); };
const tap = async (x, y) => {
  await send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await sleep(250);
};
const key = async (k, code, vk, shift = false) => {
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code, windowsVirtualKeyCode: vk, modifiers: shift ? 8 : 0 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk, modifiers: shift ? 8 : 0 });
  await sleep(150);
};
const rect = (sel) => ev(`(() => { const r = document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect(); return r && { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; })()`);
const noPageOverflow = () => ev(`document.documentElement.scrollWidth <= window.innerWidth`);
const TABS = ['websites', 'booking-integrations', 'business-tools', 'web-apps'];
const PLANS = {
  core: { id: 'tier-core', name: 'Core', monthly: '£59', annual: '£49.17', billed: 'Billed annually at £590 · Save £118' },
  growth: { id: 'tier-growth', name: 'Growth', monthly: '£99', annual: '£82.50', billed: 'Billed annually at £990 · Save £198' },
  priority: { id: 'tier-priority', name: 'Priority', monthly: '£139', annual: '£115.83', billed: 'Billed annually at £1,390 · Save £278' }
};
const btnIn = (group, label) => `[...document.querySelectorAll('[role=group][aria-label="${group}"] button')].find(b => b.textContent.trim().startsWith(${JSON.stringify(label)}))`;
const visibleCards = () => ev(`[...document.querySelectorAll('[id^="care-plan-tier-"]')].filter(c => c.getClientRects().length).map(c => c.id.replace('care-plan-', ''))`);

try {
  for (const dark of [false, true]) {
    for (const width of [320, 375, 390]) {
      const tag = `${width}${dark ? ' dark' : ''}`;
      await media(dark); await viewport(width); await load();

      // ---- 1. Brand
      const brand = await ev(`(() => {
        const a = document.querySelector('header a[href="/"]'); const d = a.parentElement.querySelector('span');
        const ctr = document.querySelector('header [aria-label="Display settings"]').parentElement;
        const ar = a.getBoundingClientRect(), dr = d.getBoundingClientRect(), cr = ctr.getBoundingClientRect();
        const hr = document.querySelector('header > div').getBoundingClientRect();
        const as = getComputedStyle(a), ds = getComputedStyle(d);
        return { text: d.textContent, dVisible: d.getClientRects().length > 0, sameLine: Math.abs(ar.bottom - dr.bottom) < 3,
          dRight: dr.right, aRight: ar.right, ctrLeft: cr.left, ctrRight: cr.right, ctrTop: cr.top, hTop: hr.top, hHeight: hr.height,
          aSize: parseFloat(as.fontSize), dSize: parseFloat(ds.fontSize), aWeight: +as.fontWeight, dWeight: +ds.fontWeight,
          dColor: ds.color, aColor: as.color };
      })()`);
      check(`[${tag}] brand descriptor "Design Studio" shown`, brand.dVisible && brand.text === 'Design Studio', JSON.stringify(brand));
      check(`[${tag}] descriptor smaller and lighter`, brand.dSize < brand.aSize && brand.dWeight < brand.aWeight && brand.dColor !== brand.aColor, JSON.stringify(brand));
      if (width >= 375) check(`[${tag}] descriptor on the same line`, brand.sameLine, JSON.stringify(brand));
      else console.log(`INFO  [${tag}] descriptor ${brand.sameLine ? 'on the same line' : 'wrapped under the name'}`);
      check(`[${tag}] brand clears header controls (≥8px gap)`, Math.max(brand.dRight, brand.aRight) + 8 <= brand.ctrLeft, JSON.stringify(brand));
      check(`[${tag}] controls stay on the header row, inside the gutter`, brand.hHeight === 64 && brand.ctrRight <= width - 16 + 0.5, JSON.stringify(brand));
      check(`[${tag}] no page-wide horizontal overflow (top)`, await noPageOverflow());
      if (!dark) await shot(`header-${width}`, { x: 0, y: 0, width, height: 64 });

      // ---- 2. Services row
      const row = await ev(`(() => {
        const list = document.querySelector('[role=tablist][aria-label="Studio Offerings"]');
        const tabs = [...list.querySelectorAll('[role=tab]')];
        return { display: getComputedStyle(list).display, tops: [...new Set(tabs.map(t => Math.round(t.getBoundingClientRect().top)))].length,
          overflows: list.scrollWidth > list.clientWidth, names: tabs.map(t => t.querySelector('[id$="-name"]').textContent.trim()),
          selected: tabs.filter(t => t.getAttribute('aria-selected') === 'true').map(t => t.id) };
      })()`);
      check(`[${tag}] services in a single row`, row.display === 'flex' && row.tops === 1, JSON.stringify(row));
      check(`[${tag}] all four categories in order`, JSON.stringify(row.names) === JSON.stringify(['Websites', 'Integrations', 'Business Tools', 'Web Apps']), JSON.stringify(row.names));
      check(`[${tag}] Websites selected by default`, JSON.stringify(row.selected) === '["offering-tab-websites"]', JSON.stringify(row.selected));
      console.log(`INFO  [${tag}] row ${row.overflows ? 'overflows (swipeable)' : 'fits without scrolling'}`);

      // Place the row 120px below the top of the viewport
      await ev(`window.scrollTo(0, document.querySelector('[role=tablist][aria-label="Studio Offerings"]').getBoundingClientRect().top + scrollY - 120)`);
      await sleep(200);
      if (!dark) await shot(`services-${width}-default`, null);

      for (const tabId of [...TABS.slice(1), TABS[0]]) {
        const before = await ev(`({ y: scrollY, top: document.querySelector('[role=tablist][aria-label="Studio Offerings"]').getBoundingClientRect().top })`);
        // Tap the visible part of the tab (swipe the row first if it's out of view)
        let r = await rect(`#offering-tab-${tabId}`);
        const lr = await rect('[role=tablist][aria-label="Studio Offerings"]');
        if (r.x > lr.r - 20 || r.r < lr.x + 20) {
          await ev(`document.querySelector('[role=tablist][aria-label="Studio Offerings"]').scrollLeft += ${r.x - lr.x - 20}`); await sleep(150);
          r = await rect(`#offering-tab-${tabId}`);
        }
        const tx = Math.min(Math.max(r.x + 10, lr.x + 10), lr.r - 10);
        await tap(tx, r.y + r.h / 2);
        await sleep(400);
        const after = await ev(`({ y: scrollY, top: document.querySelector('[role=tablist][aria-label="Studio Offerings"]').getBoundingClientRect().top })`);
        const state = await ev(`(() => {
          const list = document.querySelector('[role=tablist][aria-label="Studio Offerings"]');
          const tab = document.getElementById('offering-tab-${tabId}'); const panel = document.getElementById('${tabId}');
          const tr = tab.getBoundingClientRect(), lr = list.getBoundingClientRect(), pr = panel.getBoundingClientRect();
          const others = [...list.querySelectorAll('[role=tab]')].filter(t => t !== tab);
          return { selected: tab.getAttribute('aria-selected'), panelShown: !panel.hidden && panel.getClientRects().length > 0,
            othersHidden: ${JSON.stringify(TABS)}.filter(i => i !== '${tabId}').every(i => document.getElementById(i).hidden),
            inView: tr.left >= lr.left - 0.5 && tr.right <= lr.right + 0.5,
            gap: pr.top - list.parentElement.getBoundingClientRect().bottom,
            selBg: getComputedStyle(tab).backgroundColor, otherBg: getComputedStyle(others[0]).backgroundColor,
            selColor: getComputedStyle(tab).color, otherColor: getComputedStyle(others[0]).color };
        })()`);
        check(`[${tag}] tap ${tabId}: selected and its panel shown`, state.selected === 'true' && state.panelShown && state.othersHidden, JSON.stringify(state));
        check(`[${tag}] tap ${tabId}: panel directly under the row`, state.gap >= 0 && state.gap <= 32, JSON.stringify(state));
        check(`[${tag}] tap ${tabId}: page doesn't jump`, Math.abs(after.y - before.y) < 1 && Math.abs(after.top - before.top) < 1, `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
        check(`[${tag}] tap ${tabId}: selected tab fully in view and visually distinct`, state.inView && state.selBg !== state.otherBg && state.selColor !== state.otherColor, JSON.stringify(state));
        check(`[${tag}] tap ${tabId}: no page-wide horizontal overflow`, await noPageOverflow());
        if (!dark && width === 375) await shot(`services-${width}-${tabId}`, null);
      }

      // Swipe the row with a touch gesture
      if (row.overflows) {
        await ev(`document.querySelector('[role=tablist][aria-label="Studio Offerings"]').scrollLeft = 0`); await sleep(150);
        const lr = await rect('[role=tablist][aria-label="Studio Offerings"]');
        await send('Input.synthesizeScrollGesture', { x: Math.round(lr.x + lr.w * 0.7), y: Math.round(lr.y + lr.h / 2), xDistance: -150, yDistance: 0, gestureSourceType: 'touch', speed: 800 });
        await sleep(300);
        const sl = await ev(`document.querySelector('[role=tablist][aria-label="Studio Offerings"]').scrollLeft`);
        check(`[${tag}] row scrolls sideways with a swipe`, sl > 20, `scrollLeft ${sl}`);
        const fade = await ev(`document.querySelector('[role=tablist][aria-label="Studio Offerings"]').style.maskImage`);
        check(`[${tag}] edge fade shows on the side with more`, fade.includes('transparent'), fade);
        check(`[${tag}] no page-wide horizontal overflow after swipe`, await noPageOverflow());
      }

      // Keyboard: arrows move through every tab and keep it in view; Tab moves into the panel
      await ev(`document.getElementById('offering-tab-websites').click()`); await sleep(100);
      await ev(`document.getElementById('offering-tab-websites').focus()`);
      for (const tabId of [...TABS.slice(1), TABS[0]]) {
        await key('ArrowRight', 'ArrowRight', 39); await sleep(300);
        const k = await ev(`(() => { const a = document.activeElement; const list = a.parentElement; const tr = a.getBoundingClientRect(), lr = list.getBoundingClientRect();
          return { id: a.id, sel: a.getAttribute('aria-selected'), inView: tr.left >= lr.left - 0.5 && tr.right <= lr.right + 0.5, outline: getComputedStyle(a).outlineStyle, panel: !document.getElementById('${tabId}').hidden }; })()`);
        check(`[${tag}] ArrowRight reaches ${tabId}, selected, in view, focus visible`, k.id === `offering-tab-${tabId}` && k.sel === 'true' && k.inView && k.outline === 'solid' && k.panel, JSON.stringify(k));
      }
      await key('End', 'End', 35);
      check(`[${tag}] End key selects Web Apps`, await ev(`document.activeElement.id === 'offering-tab-web-apps'`));
      await key('Tab', 'Tab', 9);
      check(`[${tag}] Tab moves from the row into the panel`, await ev(`document.activeElement.id === 'web-apps'`), await ev(`document.activeElement.id`));
      await key('Home', 'Home', 36);
      await ev(`document.getElementById('offering-tab-websites').click()`); await sleep(100);

      const care = await ev(`({ links: document.querySelectorAll('a[href="#site-maintenance"]').length })`);
      check(`[${tag}] Site Maintenance shortcut card not rendered (no focus stop)`, care.links === 0, JSON.stringify(care));

      // ---- 3. Care selector
      await ev(`document.getElementById('site-maintenance').scrollIntoView()`); await sleep(200);
      const ord = await ev(`(() => { const b = document.querySelector('[role=group][aria-label="Billing period"]').getBoundingClientRect(); const p = document.querySelector('[role=group][aria-label="Care plan"]').getBoundingClientRect(); return { below: p.top >= b.bottom, pr: p.right, br: b.right }; })()`);
      check(`[${tag}] Care plan selector shown below Monthly / Annual`, ord.below && ord.pr <= width - 16 && ord.br <= width - 16, JSON.stringify(ord));
      check(`[${tag}] plan options are Core / Growth / Priority`, (await ev(`[...document.querySelectorAll('[role=group][aria-label="Care plan"] button')].map(b => b.textContent.trim()).join('/')`)) === 'Core/Growth/Priority');
      check(`[${tag}] Growth and Monthly selected on first load`, (await ev(`${btnIn('Care plan', 'Growth')}.getAttribute('aria-pressed') === 'true' && ${btnIn('Billing period', 'Monthly')}.getAttribute('aria-pressed') === 'true'`)) && JSON.stringify(await visibleCards()) === '["tier-growth"]', JSON.stringify(await visibleCards()));

      const verifyCombo = async (billing, planKey, how) => {
        const p = PLANS[planKey];
        const s = await ev(`(() => { const card = document.getElementById('care-plan-${p.id}');
          const price = card.querySelector('.text-3xl').textContent.trim();
          const billed = [...card.querySelectorAll('p')].map(x => x.textContent.trim()).find(t => t.startsWith('Billed annually')) || null;
          const discuss = [...card.querySelectorAll('a[href="#contact"]')].map(a => a.textContent.trim());
          const pressed = (g) => [...document.querySelectorAll('[role=group][aria-label="' + g + '"] button')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.trim());
          return { price, billed, perMonth: card.textContent.includes('/ month'), discuss, plan: pressed('Care plan'), bill: pressed('Billing period') }; })()`);
        const cards = await visibleCards();
        const expPrice = billing === 'annual' ? p.annual : p.monthly;
        const expBilled = billing === 'annual' ? p.billed : null;
        const ok = JSON.stringify(cards) === JSON.stringify([p.id]) && s.price === expPrice && s.billed === expBilled && s.perMonth
          && JSON.stringify(s.discuss) === JSON.stringify([`Discuss ${p.name}`]) && JSON.stringify(s.plan) === JSON.stringify([p.name])
          && s.bill.length === 1 && s.bill[0].toLowerCase().startsWith(billing);
        check(`[${tag}] ${billing} + ${p.name} (${how}): only that card, ${expPrice}${expBilled ? ', billed annually' : ''}`, ok, JSON.stringify({ cards, ...s }));
        check(`[${tag}] ${billing} + ${p.name}: no page-wide horizontal overflow`, await noPageOverflow());
      };

      // All six combinations: switch plans within a billing period, then switch billing and check the plan is kept
      for (const billing of ['monthly', 'annual']) {
        await ev(`${btnIn('Billing period', billing === 'monthly' ? 'Monthly' : 'Annual')}.click()`); await sleep(100);
        for (const planKey of ['core', 'growth', 'priority']) {
          const b = await ev(`(() => { const r = ${btnIn('Care plan', PLANS[planKey].name)}.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
          await tap(b.x, b.y);
          await verifyCombo(billing, planKey, 'plan tapped');
        }
      }
      // Billing switch keeps the selected plan (Priority is selected now)
      await ev(`${btnIn('Billing period', 'Monthly')}.click()`); await sleep(100);
      await verifyCombo('monthly', 'priority', 'billing switched');
      await ev(`${btnIn('Care plan', 'Core')}.click()`); await sleep(100);
      await ev(`${btnIn('Billing period', 'Annual')}.click()`); await sleep(100);
      await verifyCombo('annual', 'core', 'billing switched');
      if (!dark) await shot(`care-${width}-annual-core`, null);

      // Keyboard: Tab from Annual reaches the plan buttons; Enter and Space select; focus ring shows
      await ev(`${btnIn('Billing period', 'Annual')}.focus()`);
      await key('Tab', 'Tab', 9);
      check(`[${tag}] Tab from Annual reaches Core`, await ev(`document.activeElement.textContent.trim() === 'Core'`), await ev(`document.activeElement.textContent`));
      await key('Tab', 'Tab', 9);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); await sleep(150);
      check(`[${tag}] Enter on Growth selects it, focus ring visible`, (await ev(`document.activeElement.getAttribute('aria-pressed') === 'true' && document.activeElement.textContent.trim() === 'Growth' && getComputedStyle(document.activeElement).outlineStyle === 'solid'`)) && JSON.stringify(await visibleCards()) === '["tier-growth"]');
      await key('Tab', 'Tab', 9);
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: ' ' });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 }); await sleep(150);
      check(`[${tag}] Space on Priority selects it`, JSON.stringify(await visibleCards()) === '["tier-priority"]');
      await verifyCombo('annual', 'priority', 'keyboard');

      // Discuss link still pre-selects the enquiry
      await ev(`document.querySelector('#care-plan-tier-priority a[href="#contact"]').click()`); await sleep(800);
      check(`[${tag}] Discuss Priority still pre-selects Site Maintenance`, await ev(`document.querySelector('input[name=needs][value="site-maintenance"], input[name=needs][value="Site Maintenance"]')?.checked === true`), await ev(`[...document.querySelectorAll('input[name=needs]')].map(i => i.value + ':' + i.checked).join(',')`));

      check(`[${tag}] no page-wide horizontal overflow (whole page)`, await noPageOverflow(), await ev(`document.documentElement.scrollWidth`));
    }
  }

  // ---- Wider screens keep their layout
  for (const [width, mobile] of [[640, true], [768, false], [1280, false]]) {
    const tag = `${width}`;
    await media(false); await viewport(width, 900, mobile); await load();
    const d = await ev(`(() => {
      const a = document.querySelector('header a[href="/"]'); const desc = a.parentElement.querySelector('span');
      const badge = [...document.querySelectorAll('header span')].find(s => s.textContent.trim() === 'Digital Studio');
      const list = document.querySelector('[role=tablist][aria-label="Studio Offerings"]');
      const tabs = [...list.querySelectorAll('[role=tab]')];
      const cards = [...document.querySelectorAll('[id^="care-plan-tier-"]')].filter(c => c.getClientRects().length).length;
      const careLink = document.querySelector('a[href="#site-maintenance"]');
      return { descHidden: desc.getClientRects().length === 0, badge: !!badge && badge.getClientRects().length > 0,
        listDisplay: getComputedStyle(list).display, icons: tabs.every(t => t.querySelector('svg')),
        descs: tabs.every(t => t.querySelector('[id$="-desc"]').getClientRects().length > 0),
        cols: getComputedStyle(list).gridTemplateColumns.split(' ').length,
        careInGrid: !!careLink && careLink.parentElement === list.parentElement.parentElement && careLink.getClientRects().length > 0,
        planGroupHidden: document.querySelector('[role=group][aria-label="Care plan"]').getClientRects().length === 0,
        cards, overflow: document.documentElement.scrollWidth <= innerWidth };
    })()`);
    if (width >= 768) check(`[${tag}] brand: descriptor hidden, "Digital Studio" badge shown`, d.descHidden && d.badge, JSON.stringify(d));
    check(`[${tag}] offering tabs keep the card grid with icons and descriptions`, d.listDisplay === 'grid' && d.icons && d.descs && d.careInGrid, JSON.stringify(d));
    check(`[${tag}] all three care cards shown, no plan selector`, d.cards === 3 && d.planGroupHidden, JSON.stringify(d));
    check(`[${tag}] no page-wide horizontal overflow`, d.overflow);
    if (width === 1280) {
      check(`[${tag}] 4 tab columns`, d.cols === 4, JSON.stringify(d));
      for (const sel of ['header', '#offerings', '#site-maintenance']) {
        const r = await ev(`(() => { const el = document.querySelector('${sel}'); el.scrollIntoView(); const r = el.getBoundingClientRect(); return { x: 0, y: r.top + scrollY, width: innerWidth, height: Math.min(r.height, 4000) }; })()`);
        await ev(`scrollTo(0,0)`); await sleep(150);
        await shot(`desktop-${sel.replace('#', '')}`, r);
      }
    }
  }

  check('no console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
  check('no failed requests', failedRequests.length === 0, failedRequests.join(' | '));
} catch (e) {
  error(e);
} finally {
  browser.close();
  process.exit(finish());
}

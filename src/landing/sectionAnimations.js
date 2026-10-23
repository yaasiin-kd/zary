// Scroll-triggered animations for the landing page sections.
// Each one plays when its section comes into view and resets once it has fully left the screen.

const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
const easeOut = (p) => 1 - Math.pow(1 - p, 3);

export function mountSectionAnimations(root) {
  let disposed = false;
  const cleanups = [];
  const hasIO = 'IntersectionObserver' in window;
  const q = (sel) => root.querySelector(sel);
  const qa = (el, sel) => Array.from(el.querySelectorAll(sel));

  const wait = (ms, alive) => new Promise((r) => {
    const t = setTimeout(() => r(!disposed && alive()), ms);
    cleanups.push(() => clearTimeout(t));
  });
  const tween = (dur, cb, alive) => new Promise((res) => {
    const s = performance.now();
    const f = (n) => {
      if (disposed || !alive()) { res(false); return; }
      const p = Math.min(1, (n - s) / dur);
      cb(easeOut(p));
      if (p < 1) requestAnimationFrame(f); else res(true);
    };
    requestAnimationFrame(f);
  });

  function replay(el, ctl, th = 0.35) {
    if (!el) return;
    ctl.reset();
    if (!hasIO) { ctl.play(() => !disposed); return; }
    let id = 0, playing = false;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio >= th && !playing) {
          playing = true;
          const my = ++id;
          ctl.play(() => !disposed && my === id);
        } else if (!e.isIntersecting && playing) {
          playing = false; id++; ctl.reset();
        }
      });
    }, { threshold: [0, th] });
    io.observe(el);
    cleanups.push(() => io.disconnect());
  }

  // October story numbers
  const ledger = q('#ledger');
  const lNums = qa(ledger, '[data-count]');
  replay(ledger, {
    reset: () => lNums.forEach((n) => { n.textContent = '0'; }),
    play: (alive) => tween(1300, (p) => lNums.forEach((n) => { n.textContent = fmt(+n.dataset.count * p); }), alive),
  }, 0.5);

  // Expense search typing
  const ps = q('#pan-search');
  const term = ps.querySelector('[data-type]');
  const full = term.dataset.type;
  const rows = qa(ps, '.row');
  const res = ps.querySelector('[data-results]');
  replay(ps, {
    reset: () => { term.textContent = ''; term.classList.add('typing'); rows.forEach((r) => r.classList.add('pre')); res.classList.add('pre'); },
    play: async (alive) => {
      if (!(await wait(250, alive))) return;
      for (const ch of full) { term.textContent += ch; if (!(await wait(110, alive))) return; }
      term.classList.remove('typing');
      if (!(await wait(180, alive))) return;
      for (const r of rows) { r.classList.remove('pre'); if (!(await wait(130, alive))) return; }
      res.classList.remove('pre');
    },
  });

  // Budget bars
  const pb = q('#pan-budget');
  const bars = qa(pb, '.bar i');
  const targets = bars.map((b) => b.style.width);
  const bNums = qa(pb, '[data-count]');
  const notice = pb.querySelector('.notice');
  replay(pb, {
    reset: () => { bars.forEach((b) => { b.style.width = '0'; }); bNums.forEach((n) => { n.textContent = '0'; }); notice.classList.add('pre'); },
    play: async (alive) => {
      bars.forEach((b, i) => { const t = setTimeout(() => { if (alive()) b.style.width = targets[i]; }, i * 150); cleanups.push(() => clearTimeout(t)); });
      tween(1100, (p) => bNums.forEach((n) => { n.textContent = fmt(+n.dataset.count * p); }), alive);
      if (!(await wait(1200, alive))) return;
      notice.classList.remove('pre');
    },
  });

  // Transfer
  const px = q('#pan-xfer');
  const vals = qa(px, '[data-from]');
  const deltas = qa(px, '.acct-d');
  const done = px.querySelector('.done');
  const arrow = px.querySelector('.arrow');
  replay(px, {
    reset: () => {
      vals.forEach((v) => { v.textContent = fmt(+v.dataset.from) + '\u00a0F'; });
      deltas.forEach((d) => d.classList.add('pre')); done.classList.add('pre'); arrow.classList.remove('go');
    },
    play: async (alive) => {
      if (!(await wait(350, alive))) return;
      void arrow.offsetWidth; arrow.classList.add('go');
      const ok = await tween(950, (p) => vals.forEach((v) => {
        const a = +v.dataset.from, b = +v.dataset.to;
        v.textContent = fmt(a + (b - a) * p) + '\u00a0F';
      }), alive);
      if (!ok) return;
      deltas.forEach((d) => d.classList.remove('pre'));
      if (!(await wait(220, alive))) return;
      done.classList.remove('pre');
    },
  });

  // Sign-in code and live timers
  const po = q('#pan-otp');
  const cells = qa(po, '.code span');
  const otpT = q('#otp-time');
  const sessT = q('#sess-time');
  let ticker = null;
  const stopTicker = () => { if (ticker) { clearInterval(ticker); ticker = null; } };
  cleanups.push(stopTicker);
  replay(po, {
    reset: () => {
      stopTicker();
      cells.forEach((c) => { c.textContent = ''; c.classList.remove('on', 'pop'); });
      otpT.textContent = '01:42'; sessT.textContent = '60';
    },
    play: async (alive) => {
      if (!(await wait(250, alive))) return;
      for (let i = 0; i < cells.length - 1; i++) {
        cells[i].classList.add('on');
        if (!(await wait(220, alive))) return;
        cells[i].textContent = cells[i].dataset.d; cells[i].classList.remove('on'); cells[i].classList.add('pop');
      }
      cells[cells.length - 1].classList.add('on');
      let left = 102, sess = 60;
      ticker = setInterval(() => {
        if (!alive()) { stopTicker(); return; }
        left = left > 0 ? left - 1 : 120; sess = sess > 0 ? sess - 1 : 60;
        otpT.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0');
        sessT.textContent = String(sess);
      }, 1000);
    },
  });

  // Steps and quote
  const steps = q('#steps');
  replay(steps, { reset: () => steps.classList.add('pre'), play: () => steps.classList.remove('pre') });
  const bq = q('#big-quote');
  replay(bq, { reset: () => bq.classList.add('pre'), play: () => bq.classList.remove('pre') }, 0.5);

  return () => { disposed = true; cleanups.forEach((f) => f()); };
}

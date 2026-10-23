import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import '../styles/landing.css';
import Icon from '../components/icons.jsx';
import { CTA_RINGS, CTA_RINGS_INNER, CTA_WAVES, NOTE_LINES } from './guilloche.js';
import { mountHeroScene } from './heroScene.js';
import { mountSectionAnimations } from './sectionAnimations.js';

const HEADLINE = 'Know where every franc goes.';
const QUOTE = '“I used to dread checking my account at the end of the month. Now I open Zary with my morning coffee. It takes thirty seconds and I know exactly where I stand.”';

const FAQ = [
  ['Is Zary free?', 'Yes. Every feature on this page is free to use, and there are no ads.'],
  ['Which currencies can I use?', 'Zary shows amounts in West African CFA francs by default. You can switch to euros, US dollars or British pounds in your profile settings.'],
  ['How does sign-in work?', 'After your email and password, Zary asks for a six-digit code. If you step away, it signs you out after a few minutes of inactivity and warns you a minute before.'],
  ['Can I get my data out?', 'Yes. Export your expenses as a CSV file from the Expenses page and open it in any spreadsheet.'],
  ['Does it work on my phone?', 'Yes. Zary adapts to any screen. On a phone the navigation moves to the bottom of the screen, within reach of your thumb.'],
  ['Can I look around before creating an account?', 'Yes. Sign in with demo@zary.app and the password demo123.'],
];

const Lines = ({ items }) => items.map((l, i) => <path key={i} d={l.d} fill="none" stroke={l.stroke} strokeWidth={l.w} />);

function Brand() {
  return <a className="brand" href="#top" aria-label="Zary home"><Logo /></a>;
}

export default function Landing() {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const tagRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    document.title = 'Zary: know where every franc goes';
    const paintBody = () => { document.body.style.background = getComputedStyle(root).getPropertyValue('--paper').trim(); };
    paintBody();
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (mq && mq.addEventListener) mq.addEventListener('change', paintBody);

    const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const showTag = () => tagRef.current && tagRef.current.classList.add('show');
    const stopHero = mountHeroScene({ host: heroRef.current, canvas: canvasRef.current, reduce, onIntroDone: showTag });
    if (!stopHero) showTag();
    const stopSections = reduce ? null : mountSectionAnimations(root);

    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener('change', paintBody);
      if (stopHero) stopHero();
      if (stopSections) stopSections();
      if (tagRef.current) tagRef.current.classList.remove('show');
    };
  }, []);

  return (
    <div className="lp" ref={rootRef}>
      <header className="top">
        <div className="wrap top-in">
          <Brand />
          <nav className="links" aria-label="Page sections">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">Questions</a>
          </nav>
          <Link className="btn btn-primary btn-sm" to="/app" data-testid="nav-open-app">Open Zary</Link>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <h1 id="hero-title" aria-label={HEADLINE}>
                {HEADLINE.split(' ').map((w, i) => (
                  <span key={i}>
                    <span className="w" aria-hidden="true"><span style={{ '--i': i }}>{w}</span></span>
                    {i < HEADLINE.split(' ').length - 1 ? ' ' : ''}
                  </span>
                ))}
              </h1>
              <p className="lede">Zary keeps your expenses, budgets and savings in one calm place, so the end of the month never catches you off guard.</p>
              <div className="actions">
                <Link className="btn btn-primary" to="/app" data-testid="hero-open-app">Open Zary</Link>
                <a className="btn btn-ghost" href="#features">See what it does</a>
              </div>
              <p className="fine">Free to use. Try the demo account or create your own in two minutes.</p>
            </div>
            <div className="hero-art" id="hero-art" ref={heroRef}>
              <canvas id="hero-canvas" ref={canvasRef} role="img" aria-label="A banknote showing a total balance of 1 240 000 F CFA, with a stack of coins" />
              <div className="note" role="img" aria-label="Balance card showing a total of 1 240 000 F CFA">
                <svg className="guilloche" viewBox="0 0 560 270" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><Lines items={NOTE_LINES} /></svg>
                <div className="note-body">
                  <div className="note-top"><span>Total balance</span><span className="seal" aria-hidden="true">F</span></div>
                  <div className="note-amt">1&#8239;240&#8239;000<small>F CFA</small></div>
                  <div className="note-foot"><span>Main 940&#8239;000 and Savings 300&#8239;000</span><span>Updated just now</span></div>
                </div>
              </div>
              <div className="alert-tag" ref={tagRef}>
                <span className="alert-dot" aria-hidden="true" />
                <div style={{ flex: 1 }}>
                  <div className="alert-t">Food budget at 78%</div>
                  <div className="alert-s">62&#8239;400 of 80&#8239;000 F, 9 days left</div>
                  <div className="alert-bar"><i /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ledger" id="ledger">
          <div className="wrap">
            <p>In October, Amara earned <b><span data-count="450000">450&#8239;000</span>&nbsp;F</b>, spent <b><span data-count="123500">123&#8239;500</span>&nbsp;F</b> across six categories and moved <b><span data-count="50000">50&#8239;000</span>&nbsp;F</b> to savings. She saw each of those numbers the day it happened.</p>
          </div>
        </section>

        <section className="sec" id="features">
          <div className="wrap">
            <div className="sec-head">
              <h2>What Zary does for your month</h2>
              <p>Record what you spend, keep each category in check, put money aside and keep your account yours.</p>
            </div>

            <article className="feature">
              <div className="f-copy">
                <h3>Every expense, findable in seconds</h3>
                <p>Log what you spend with a category and an amount, mark the ones that repeat each month, and search your history by name. Export it all to a spreadsheet whenever you need it.</p>
              </div>
              <div className="panel" id="pan-search" aria-hidden="true">
                <div className="search">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.868-3.834zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" /></svg>
                  <strong data-type="market">market</strong>
                </div>
                <div className="rows">
                  <div className="row"><span>Lunch at the market</span><span className="cat">Food</span><span className="amt neg">&minus;3&#8239;500 F</span></div>
                  <div className="row"><span>Fabric, Grand marché</span><span className="cat">Other</span><span className="amt neg">&minus;12&#8239;000 F</span></div>
                  <div className="row"><span>Fish for the week</span><span className="cat">Food</span><span className="amt neg">&minus;6&#8239;500 F</span></div>
                </div>
                <div className="panel-foot"><span data-results="">3 results</span><span className="chip"><Icon name="download" size={13} />Export CSV</span></div>
              </div>
            </article>

            <article className="feature">
              <div className="f-copy">
                <h3>Budgets that warn you early</h3>
                <p>Give each category a monthly limit. Bars fill as you spend and turn amber at 75%, so you can adjust before the month runs out.</p>
              </div>
              <div className="panel" id="pan-budget" aria-hidden="true">
                <div className="bud"><div className="bud-top"><span>Food</span><span><span data-count="62400">62&#8239;400</span> of 80&#8239;000 F</span></div><div className="bar"><i className="warn" style={{ width: '78%' }} /></div></div>
                <div className="bud"><div className="bud-top"><span>Transport</span><span><span data-count="16800">16&#8239;800</span> of 40&#8239;000 F</span></div><div className="bar"><i style={{ width: '42%' }} /></div></div>
                <div className="bud"><div className="bud-top"><span>Utilities</span><span><span data-count="9000">9&#8239;000</span> of 30&#8239;000 F</span></div><div className="bar"><i style={{ width: '30%' }} /></div></div>
                <div className="notice">You’ve used 78% of your food budget with 9 days left this month.</div>
              </div>
            </article>

            <article className="feature">
              <div className="f-copy">
                <h3>Savings in two taps</h3>
                <p>Move money from your main account to savings whenever you choose. Both balances and your transfer history update the moment you confirm.</p>
              </div>
              <div className="panel" id="pan-xfer" aria-hidden="true">
                <div className="xfer">
                  <div className="acct"><div className="acct-l">Main account</div><div className="acct-v" data-from="940000" data-to="890000">890&#8239;000&nbsp;F</div><div className="acct-d neg">&minus;50&#8239;000 F</div></div>
                  <div className="arrow"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8h11M9 4l4 4-4 4" /></svg></div>
                  <div className="acct"><div className="acct-l">Savings account</div><div className="acct-v" data-from="300000" data-to="350000">350&#8239;000&nbsp;F</div><div className="acct-d pos">+50&#8239;000 F</div></div>
                </div>
                <div className="done"><Icon name="check" size={16} />Transfer successful</div>
              </div>
            </article>

            <article className="feature">
              <div className="f-copy">
                <h3>Sign-in that protects you</h3>
                <p>Every sign-in asks for a one-time code, and Zary signs you out after a few minutes away. A banner gives you a minute’s warning first.</p>
              </div>
              <div className="panel" id="pan-otp" aria-hidden="true">
                <div className="code">
                  {['4', '8', '2', '9', '1'].map((d, i) => <span key={i} data-d={d}>{d}</span>)}
                  <span className="on" />
                </div>
                <div className="timer">Code expires in <span id="otp-time">01:42</span></div>
                <div className="session"><span>Session expires in <span id="sess-time">60</span> seconds</span><span className="chip">Stay logged in</span></div>
              </div>
            </article>
          </div>
        </section>

        <section className="sec" id="how">
          <div className="wrap">
            <div className="sec-head"><h2>From sign-up to your first budget in three steps</h2></div>
            <ol className="steps" id="steps">
              <li style={{ '--i': 0 }}><span className="num">1</span><h3>Create your account</h3><p>Add your name and email, then confirm it’s you with a six-digit code.</p></li>
              <li style={{ '--i': 1 }}><span className="num">2</span><h3>Set your budgets</h3><p>Choose a monthly limit for food, transport, utilities and the rest. Change them anytime.</p></li>
              <li style={{ '--i': 2 }}><span className="num">3</span><h3>Track as you go</h3><p>Log expenses as they happen and move money to savings. Your dashboard updates instantly.</p></li>
            </ol>
          </div>
        </section>

        <section className="sec">
          <div className="wrap quote">
            <figure>
              <blockquote className="big" id="big-quote">
                {QUOTE.split(' ').map((w, i) => <span key={i}><span className="qw" style={{ '--i': i }}>{w}</span>{' '}</span>)}
              </blockquote>
              <figcaption className="who"><span className="av">AK</span><span><span className="who-n">Amara K.</span><br /><span className="who-r">Freelance designer, Lomé</span></span></figcaption>
            </figure>
            <div className="small-quotes">
              <figure className="sq">
                <blockquote><p>“The amber bar on my food budget changed how I shop. I see it coming now.”</p></blockquote>
                <figcaption className="who"><span className="av">MD</span><span><span className="who-n">Marc D.</span><br /><span className="who-r">Software engineer, Abidjan</span></span></figcaption>
              </figure>
              <figure className="sq">
                <blockquote><p>“Setup took less than five minutes and I was tracking from the first day.”</p></blockquote>
                <figcaption className="who"><span className="av">SA</span><span><span className="who-n">Selin A.</span><br /><span className="who-r">Marketing manager, Dakar</span></span></figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="sec" id="faq">
          <div className="wrap">
            <div className="sec-head"><h2>Questions people ask</h2></div>
            <div className="faq">
              {FAQ.map(([qn, a]) => (
                <details key={qn}><summary>{qn}<span className="plus" aria-hidden="true" /></summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta">
          <svg className="guilloche" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <g id="cta-rings"><Lines items={CTA_RINGS} /></g>
            <g id="cta-rings2"><Lines items={CTA_RINGS_INNER} /></g>
            <g><Lines items={CTA_WAVES} /></g>
          </svg>
          <div className="cta-in">
            <div>
              <h2>Start next month with a clear picture</h2>
              <p>Open Zary, set your budgets and log your first expense today.</p>
            </div>
            <Link className="btn btn-light" to="/app" data-testid="cta-open-app">Open Zary</Link>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <Brand />
          <nav aria-label="Footer">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">Questions</a>
            <Link to="/app">Open Zary</Link>
          </nav>
          <span>© 2026 Zary</span>
        </div>
      </footer>
    </div>
  );
}

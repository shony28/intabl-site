(() => {
  'use strict';
  const id = 'G-LD77VMCPGV';
  const key = 'intabl_analytics_consent_v1';
  const allowed = ['intabl.com', 'www.intabl.com'];
  if (!allowed.includes(location.hostname)) return;
  let consent = null;
  try { consent = localStorage.getItem(key); } catch (_) {}
  let started = false;
  window.dataLayer = window.dataLayer || [];
  const tag = function () { window.dataLayer.push(arguments); };
  const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  tag('consent', 'default', denied);
  function start() {
    if (started) return;
    started = true;
    window['ga-disable-' + id] = false;
    tag('consent', 'update', { ...denied, analytics_storage: 'granted' });
    tag('js', new Date());
    tag('config', id, {
      page_location: location.origin + location.pathname,
      page_referrer: '',
      page_title: location.pathname === '/guide.html' ? 'Посібник intabl' : 'Intabl',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: location.hostname,
      cookie_expires: 60 * 60 * 24 * 90
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  function event(name) {
    if (consent === 'granted') tag('event', name, { send_to: id });
  }
  const panel = document.createElement('section');
  panel.className = 'analytics-consent';
  panel.setAttribute('aria-label', 'Налаштування аналітики');
  panel.innerHTML = '<strong>Допоможете покращити intabl?</strong><p>За вашою згодою Google Analytics використовуватиме cookies, щоб рахувати відвідування та натискання кнопок. Відмова не впливає на роботу сайту. Вибір можна змінити внизу сторінки. <a href="https://policies.google.com/privacy?hl=uk" target="_blank" rel="noopener noreferrer">Політика Google ↗</a></p><div><button type="button" data-choice="denied">Без аналітики</button><button type="button" data-choice="granted">Дозволити аналітику</button></div>';
  panel.hidden = consent === 'granted' || consent === 'denied';
  document.body.append(panel);
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.textContent = 'Налаштування аналітики';
  (document.querySelector('footer') || document.body).append(settings);
  settings.addEventListener('click', () => { panel.hidden = false; panel.querySelector('button').focus(); });
  panel.addEventListener('click', e => {
    const button = e.target.closest('[data-choice]');
    if (!button) return;
    consent = button.dataset.choice;
    try { localStorage.setItem(key, consent); } catch (_) {}
    panel.hidden = true;
    if (consent === 'granted') {
      if (started) { window['ga-disable-' + id] = false; tag('consent', 'update', { ...denied, analytics_storage: 'granted' }); }
      else start();
    } else {
      window['ga-disable-' + id] = true;
      if (started) tag('consent', 'update', denied);
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.trim().split('=')[0];
        if (name === '_ga' || name.startsWith('_ga_')) {
          for (const domain of ['', '; Domain=' + location.hostname, '; Domain=.' + location.hostname]) {
            document.cookie = name + '=; Max-Age=0; Path=/' + domain + '; SameSite=Lax; Secure';
          }
        }
      }
    }
    settings.focus();
  });
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch (_) { return; }
    if (url.hostname === 'docs.google.com' && url.pathname.endsWith('/copy')) event('template_open');
    else if (url.hostname === 'admin.intabl.com') event('admin_open');
    else if (url.hostname === 't.me' && url.pathname === '/shonyrecords') event('contact_telegram');
    else if (url.hostname === 'www.youtube.com' || url.hostname === 'youtu.be' || url.hash === '#video') event('video_guide_open');
  });
  if (consent === 'granted') start();
})();

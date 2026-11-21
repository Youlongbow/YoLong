// RAVEN / GA4. Only load on approved production hosts after a real GA4 ID is set.
// All navigation uses full document loads; one page_view is recorded for each route.
const GA4_ID = /^G-[A-Z0-9]{6,}$/;

export function analyticsEnabled(config, hostname) {
  const id = String(config?.measurementId || '').trim().toUpperCase();
  const hosts = Array.isArray(config?.enabledHosts) ? config.enabledHosts : [];
  return GA4_ID.test(id) && hosts.includes(hostname);
}

export function initGoogleAnalytics(config, {lang = 'zh', section = 'home'} = {}) {
  if (!analyticsEnabled(config, window.location.hostname)) return false;
  if (window.__ravenGa4Initialized) return true;
  window.__ravenGa4Initialized = true;

  const id = String(config.measurementId).trim().toUpperCase();
  const pagePath = window.location.pathname;
  const pageLocation = window.location.origin + pagePath;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  const send = (...args) => window.gtag(...args);

  send('js', new Date());
  // Manual page_view: the app sets the correct bilingual page title after loading its content.
  send('config', id, {
    send_page_view: false,
    allow_google_signals: false,
    page_location: pageLocation,
    page_path: pagePath,
    page_title: document.title
  });
  send('event', 'page_view', {
    page_title: document.title,
    page_location: pageLocation,
    page_path: pagePath,
    content_group: section,
    language: lang
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  script.referrerPolicy = 'strict-origin-when-cross-origin';
  document.head.appendChild(script);

  // Only explicit, business-relevant actions. Never send typed search terms, form
  // content, email addresses, personal identifiers or arbitrary link query strings.
  document.addEventListener('click', event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    let destination;
    try { destination = new URL(href, window.location.href); }
    catch { return; }
    const params = {content_group: section, language: lang, link_domain: destination.hostname || ''};
    if (anchor.closest('.switch')) {
      send('event', 'language_switch', {
        ...params, target_language: destination.pathname.includes('/en/') ? 'en' : 'zh'
      });
    } else if (destination.protocol === 'mailto:') {
      send('event', 'contact_click', params);
    } else if (anchor.closest('.profile-buy-menu')) {
      send('event', 'book_retailer_click', params);
    } else if (destination.origin !== window.location.origin) {
      send('event', 'outbound_resource_click', params);
    }
  }, {capture: true});
  return true;
}

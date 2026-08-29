'use client';

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function shouldTrackPath(pathname: string): boolean {
  if (!pathname) return false;
  return !pathname.startsWith('/admin') && !pathname.startsWith('/api') && !pathname.startsWith('/_next');
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let visitorId = localStorage.getItem('corpicia_visitor_id');
  if (!visitorId) {
    visitorId = generateId();
    localStorage.setItem('corpicia_visitor_id', visitorId);
  }
  return visitorId;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = sessionStorage.getItem('corpicia_session_id');
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem('corpicia_session_id', sessionId);
  }
  return sessionId;
}

function getBrowserInfo() {
  if (typeof window === 'undefined') return { browser: 'unknown', os: 'unknown', device_type: 'unknown' };
  const ua = navigator.userAgent;
  let browser = 'unknown';
  let os = 'unknown';
  let device_type = 'desktop';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('SamsungBrowser')) browser = 'Samsung Internet';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  else if (ua.includes('Edge') || ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('X11')) os = 'UNIX';
  else if (ua.includes('Linux')) os = 'Linux';
  if (ua.includes('Android')) os = 'Android';
  if (ua.includes('like Mac OS X')) os = 'iOS';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) device_type = 'tablet';
  else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) device_type = 'mobile';
  return { browser, os, device_type };
}

function getUtmParams() {
  if (typeof window === 'undefined') return {};
  const savedUtmsStr = sessionStorage.getItem('corpicia_utms');
  const savedUtms = savedUtmsStr ? JSON.parse(savedUtmsStr) : null;
  const params = new URLSearchParams(window.location.search);
  const currentUtms = {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    utm_term: params.get('utm_term') || undefined,
  };
  if (currentUtms.utm_source || currentUtms.utm_medium) {
    sessionStorage.setItem('corpicia_utms', JSON.stringify(currentUtms));
    return currentUtms;
  }
  return savedUtms || {};
}

export type TrackEventPayload = {
  event_name: string;
  page_path?: string;
  entity_type?: string;
  entity_id?: string;
  landing_page?: string;
  metadata?: Record<string, any>;
  engagement_seconds?: number;
  button_location?: string;
};

let isTracking = false;
const eventQueue: TrackEventPayload[] = [];

async function processQueue() {
  if (isTracking || eventQueue.length === 0 || typeof window === 'undefined') return;
  isTracking = true;
  try {
    const event = eventQueue.shift();
    if (!event) return;
    const { browser, os, device_type } = getBrowserInfo();
    const utms = getUtmParams();
    let landingPage = sessionStorage.getItem('corpicia_landing_page');
    let firstReferrer = sessionStorage.getItem('corpicia_first_referrer');
    if (!landingPage) {
      landingPage = window.location.pathname;
      sessionStorage.setItem('corpicia_landing_page', landingPage);
      const ref = document.referrer;
      firstReferrer = ref && !ref.includes(window.location.hostname) ? ref : 'direct';
      sessionStorage.setItem('corpicia_first_referrer', firstReferrer || '');
    }
    const payload = {
      ...event,
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      page_path: event.page_path || window.location.pathname,
      device_type,
      browser,
      operating_system: os,
      screen_width: window.innerWidth,
      referrer: firstReferrer && firstReferrer !== 'direct' ? firstReferrer : undefined,
      landing_page: landingPage,
      ...utms,
      metadata: event.metadata || {},
    };
    await fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } finally {
    isTracking = false;
    if (eventQueue.length > 0) setTimeout(processQueue, 100);
  }
}

export function trackEvent(payload: TrackEventPayload) {
  if (typeof window === 'undefined') return;
  eventQueue.push(payload);
  processQueue();
}

function pushDataLayer(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export function trackWhatsAppClick(source: string, identifier: string) {
  if (typeof window === 'undefined') return;
  pushDataLayer({
    event: 'whatsapp_click',
    event_category: 'lead',
    event_label: source,
    button_location: source,
    entity_id: identifier,
    page_path: window.location.pathname,
  });
  trackEvent({ event_name: 'whatsapp_click', page_path: window.location.pathname, button_location: source, entity_id: identifier, metadata: { source, identifier } });
}

export function trackProductView(productName: string, productSlug: string) {
  if (typeof window === 'undefined') return;
  trackEvent({ event_name: 'product_view', page_path: window.location.pathname, entity_type: 'product', entity_id: String(productSlug), metadata: { product_name: productName, product_slug: productSlug } });
}

export function trackAddToBudget(productName: string, productSlug: string, quantity: number) {
  if (typeof window === 'undefined') return;
  trackEvent({ event_name: 'quote_item_added', page_path: window.location.pathname, entity_type: 'product', entity_id: String(productSlug), metadata: { product_name: productName, product_slug: productSlug, quantity } });
}

export function trackBannerClick(entityId: string, buttonLocation: string, metadata: any = {}) {
  if (typeof window === 'undefined') return;
  trackEvent({ event_name: 'banner_click', page_path: window.location.pathname, entity_type: 'banner', entity_id: String(entityId), button_location: buttonLocation, metadata });
}

export function trackServiceView(entityId: string, metadata: any = {}) {
  if (typeof window === 'undefined') return;
  trackEvent({ event_name: 'service_view', page_path: window.location.pathname, entity_type: 'service', entity_id: String(entityId), metadata });
}

export function trackQuoteStarted() {
  if (typeof window === 'undefined') return;
  const key = 'corpicia_quote_started';
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, 'true');
  pushDataLayer({ event: 'quote_started', page_path: window.location.pathname });
  trackEvent({ event_name: 'quote_started', page_path: window.location.pathname, entity_type: 'quote' });
}

export function trackQuoteSubmitted(quoteId: string, itemsCount: number, total?: number) {
  if (typeof window === 'undefined') return;
  pushDataLayer({ event: 'quote_submitted', quote_id: quoteId, items_count: itemsCount, value: total, currency: 'PYG', page_path: window.location.pathname });
  trackEvent({ event_name: 'quote_submitted', page_path: window.location.pathname, entity_type: 'quote', entity_id: String(quoteId), metadata: { items_count: itemsCount, total_estimado: total } });
}

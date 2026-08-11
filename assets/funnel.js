(() => {
  'use strict';

  const keys = {
    visitor: 'stackbrief_visitor_v1',
    attribution: 'stackbrief_attribution_v1',
    quiz: 'stackbrief_quiz_v2',
    result: 'stackbrief_result_v2',
    events: 'stackbrief_events_v1'
  };

  function read(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // Private browsing and storage restrictions should not block the quiz.
    }
  }

  function makeId(prefix) {
    const random = window.crypto?.randomUUID
      ? window.crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    return `${prefix}-${random}`;
  }

  function visitorId() {
    const existing = read(keys.visitor);
    if (existing?.id) return existing.id;
    const visitor = { id: makeId('SBV'), createdAt: new Date().toISOString() };
    write(keys.visitor, visitor);
    return visitor.id;
  }

  function currentTouch() {
    const params = new URLSearchParams(window.location.search);
    const campaign = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
      const value = params.get(key);
      if (value) campaign[key] = value.slice(0, 240);
    });
    return {
      capturedAt: new Date().toISOString(),
      landingPage: `${window.location.pathname}${window.location.search}`.slice(0, 600),
      referrer: document.referrer.slice(0, 600),
      campaign
    };
  }

  function attribution() {
    const existing = read(keys.attribution);
    const touch = currentTouch();
    const hasCampaign = Object.keys(touch.campaign).length > 0;
    const hasUsefulReferrer = touch.referrer && !touch.referrer.includes(window.location.hostname);
    if (!existing) {
      const initial = { firstTouch: touch, lastTouch: touch };
      write(keys.attribution, initial);
      return initial;
    }
    if (hasCampaign || hasUsefulReferrer) {
      existing.lastTouch = touch;
      write(keys.attribution, existing);
    }
    return existing;
  }

  function track(name, properties = {}) {
    const event = {
      name,
      properties: {
        visitorId: visitorId(),
        path: window.location.pathname,
        ...properties
      },
      occurredAt: new Date().toISOString()
    };
    const queue = read(keys.events, []);
    queue.push(event);
    write(keys.events, queue.slice(-100));

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...event.properties });
    if (typeof window.posthog?.capture === 'function') window.posthog.capture(name, event.properties);
    if (typeof window.plausible === 'function') window.plausible(name, { props: event.properties });
    if (typeof window.va === 'function') window.va('event', { name, data: event.properties });
    window.dispatchEvent(new CustomEvent('stackbrief:event', { detail: event }));
    return event;
  }

  window.StackBriefFunnel = {
    version: '1.0.0',
    makeId,
    visitorId,
    attribution,
    track,
    getQuizSession: () => read(keys.quiz),
    saveQuizSession: (session) => write(keys.quiz, session),
    clearQuizSession: () => remove(keys.quiz),
    getResult: () => read(keys.result),
    saveResult: (result) => write(keys.result, result),
    clearResult: () => remove(keys.result)
  };

  attribution();
})();

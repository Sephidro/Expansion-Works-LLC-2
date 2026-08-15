(() => {
  'use strict';

  const form = document.querySelector('[data-service-form]');
  if (!form) return;

  const funnel = window.StackBriefFunnel;
  const status = document.querySelector('[data-apply-status]');
  const params = new URLSearchParams(window.location.search);
  let started = false;

  funnel?.track('service_page_viewed', {
    source: params.get('from') || 'direct',
    fit: params.get('fit') || '',
    briefId: params.get('brief') || ''
  });

  form.addEventListener('focusin', () => {
    if (started) return;
    started = true;
    funnel?.track('dfy_application_started', { source: params.get('from') || 'direct' });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'SENDING FOR REVIEW...';
    if (status) status.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Form submission failed');
      funnel?.track('dfy_inquiry_confirmed', {
        source: params.get('from') || 'direct',
        fit: params.get('fit') || '',
        briefId: params.get('brief') || ''
      });
      form.innerHTML = `
        <div class="service-form-success field-wide" role="status">
          <span>REQUEST RECEIVED</span>
          <h3>I have the evidence you sent.</h3>
          <p>Expect a yes, no, or missing-evidence reply within one business day. I will not make you book a call before I decide whether the economics deserve one.</p>
        </div>`;
    } catch (error) {
      funnel?.track('dfy_inquiry_failed', { source: params.get('from') || 'direct' });
      if (status) status.textContent = 'The request did not send. Try again or email xavier.brandmanager@gmail.com.';
      submit.disabled = false;
      submit.textContent = 'TRACE MY LAST 10 INQUIRIES →';
    }
  });
})();

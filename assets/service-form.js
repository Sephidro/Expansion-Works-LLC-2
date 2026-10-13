(() => {
  'use strict';
  const form = document.querySelector('[data-service-form]');
  if (!form) return;
  const funnel = window.StackBriefFunnel;
  const status = document.querySelector('[data-apply-status]');
  const params = new URLSearchParams(window.location.search);
  let started = false;
  const updateIntent = () => {
    const labels = { implementation: 'Request my scope →', review: 'Request the review →', diagnostic: 'Ask about a diagnostic →' };
    form.querySelector('button[type="submit"]').textContent = labels[form.elements.intent.value] || labels.implementation;
  };
  document.querySelectorAll('[data-intent]').forEach(link => link.addEventListener('click', () => { form.elements.intent.value = link.dataset.intent; updateIntent(); }));
  form.elements.intent.addEventListener('change', updateIntent);
  updateIntent();
  funnel?.track('service_page_viewed', { source: params.get('from') || 'direct', fit: params.get('fit') || '', briefId: params.get('brief') || '' });
  form.addEventListener('focusin', () => { if (!started) { started = true; funnel?.track('dfy_application_started', { source: params.get('from') || 'direct' }); } });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const submit = form.querySelector('button[type="submit"]');
    const original = submit.textContent;
    const intent = form.elements.intent?.value || 'implementation';
    submit.disabled = true; submit.textContent = 'Sending…'; if (status) status.textContent = '';
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Form submission failed');
      funnel?.track('dfy_inquiry_submitted', { source: params.get('from') || 'direct', briefId: params.get('brief') || '', intent });
      funnel?.track('dfy_inquiry_confirmed', { source: params.get('from') || 'direct', fit: params.get('fit') || '', briefId: params.get('brief') || '', intent });
      if (intent === 'review') funnel?.track('build_review_requested', { source: params.get('from') || 'direct', briefId: params.get('brief') || '' });
      form.innerHTML = `<div class="service-form-success field-wide" role="status"><h3>Inquiry received.</h3><p>${intent === 'review' ? 'I’ll confirm the review details and send the payment and booking instructions.' : 'I’ll review the fit and follow up about scope and next steps.'}</p></div>`;
    } catch {
      funnel?.track('dfy_inquiry_failed', { source: params.get('from') || 'direct' });
      if (status) status.textContent = 'Could not send. Try again or email xavier.brandmanager@gmail.com.';
      submit.disabled = false; submit.textContent = original;
    }
  });
})();

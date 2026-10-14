(() => {
  'use strict';
  const form = document.querySelector('[data-onboarding-form]');
  if (!form) return;
  const status = document.querySelector('[data-onboarding-status]');
  const funnel = window.StackBriefFunnel;
  let fit;
  try { fit = JSON.parse(localStorage.getItem('repair_fit_v1')); } catch { /* Allow onboarding from another device. */ }
  const hidden = (name,value) => { const input=document.createElement('input');input.type='hidden';input.name=name;input.value=String(value ?? '');form.append(input); };
  if (['2026-10-13.1','2026-10-13.2','2026-10-14.1'].includes(fit?.version)) {
    hidden('fit_id',fit.fitId);hidden('fit_answers',JSON.stringify(fit.answers));hidden('terms_reviewed_at',fit.termsReviewedAt);hidden('terms_version',fit.termsVersion);
    const brief=funnel?.getResult();
    if(brief && brief.briefId===fit.briefId) {hidden('stackbrief_id',brief.briefId);hidden('stackbrief_summary',brief.portableBrief);hidden('stackbrief_attribution',JSON.stringify(brief.attribution));}
  }
  // Browser state, a return URL, or a posted form cannot assert paid status.
  form.addEventListener('submit', async event => {
    event.preventDefault();if(!form.reportValidity())return;
    const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Sending…';status.textContent='';
    try {
      const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
      if(!response.ok)throw new Error('Send failed');
      funnel?.track('repair_onboarding_submitted',{fitId:fit?.fitId || '',briefId:fit?.briefId || ''});
      form.innerHTML='<div role="status"><h2>Project details received.</h2><p>Next: match your Square payment to the confirmed order and arrange account access.</p></div>';
    } catch {status.textContent='Could not send. Try again or email xavier.brandmanager@gmail.com.';button.disabled=false;button.textContent='Send my project details →';}
  });
})();

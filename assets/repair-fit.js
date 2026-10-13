(() => {
  'use strict';
  const form = document.querySelector('[data-repair-fit]');
  const output = document.querySelector('[data-repair-result]');
  if (!form || !output) return;
  const { questions, evaluate, version } = window.RepairFitRules;
  const funnel = window.StackBriefFunnel;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const brief = funnel?.getResult();
  const params = new URLSearchParams(location.search);
  const attached = params.get('from') === 'stackbrief' && brief && (!params.get('brief') || params.get('brief') === brief.briefId);
  const state = { version, index: 0, answers: {}, fitId: funnel?.makeId('FIT') || `FIT-${Date.now().toString(36)}`, briefId: attached ? brief.briefId : '' };
  try { const saved = JSON.parse(localStorage.getItem('repair_fit_v1')); if (saved?.version === version) { if (typeof saved.fitId === 'string') state.fitId = saved.fitId; for (const q of questions) { const a = q.answers.find(a => a.value === saved.answers?.[q.id]); if (a) state.answers[q.id] = a.value; } } } catch { /* Storage is optional. */ }
  const save = () => { try { localStorage.setItem('repair_fit_v1', JSON.stringify(state)); } catch { /* Browser-only qualification still works. */ } };
  function render() {
    const q = questions[state.index];
    form.innerHTML = `<p class="question-note">Step ${state.index + 1} of ${questions.length}</p><fieldset><legend>${escape(q.title)}</legend>${q.note ? `<p>${escape(q.note)}</p>` : ''}${q.answers.map(a => `<label class="fit-option"><input type="radio" name="${q.id}" value="${a.value}" required ${state.answers[q.id] === a.value ? 'checked' : ''}><span>${escape(a.label)}</span></label>`).join('')}</fieldset><div class="hero-actions">${state.index ? '<button type="button" class="quiz-back" data-fit-back>← Back</button>' : ''}<button class="button" type="submit">${state.index === questions.length - 1 ? 'See my next step →' : 'Continue →'}</button></div>`;
    form.querySelector('[data-fit-back]')?.addEventListener('click', () => { state.index--; render(); });
    const legend = form.querySelector('legend'); legend.setAttribute('tabindex','-1'); legend.focus({preventScroll:true});
  }
  function showResult() {
    const result = evaluate(state.answers);
    if (result.status === 'incomplete') return;
    form.hidden = true; output.hidden = false; save();
    funnel?.track('repair_fit_completed', { fitId: state.fitId, briefId: state.briefId, fit: result.status, rulesetVersion: version });
    if (result.status === 'qualified') {
      output.innerHTML = `<h3>This looks like a fit. Confirm your setup.</h3><p>$4,000 total. $2,000 deposit after your page, tools, scope, and start date are confirmed. Final $2,000 after agreed tests pass.</p><form class="setup-form" action="https://formspree.io/f/xeewjjlv" method="POST" data-setup-form><input type="hidden" name="_subject" value="Customer Journey Repair: setup confirmation before deposit"><input type="hidden" name="source" value="repair-4000 setup confirmation"><input type="hidden" name="payment_status" value="unpaid"><input class="hp" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true"><label>Your name<input name="name" autocomplete="name" required maxlength="150"></label><label>Your email<input type="email" name="email" autocomplete="email" required></label><label>Your inquiry page<input type="url" name="website" placeholder="https://" required maxlength="1000"></label><label>Your current tools<input name="systems" placeholder="Website, inbox, booking or CRM tools" required maxlength="300"></label><label>Preferred start date<input type="date" name="preferred_start" required></label><button class="button" type="submit">Confirm my setup →</button><p class="setup-note">Xavier reviews compatibility and availability, then sends your written order summary and Square deposit link. This is not a paid booking. <a href="/privacy">Privacy</a> · <a href="/repair-terms">Order terms</a></p><p class="setup-status" data-setup-status role="status"></p></form><button type="button" class="quiz-back" data-edit-fit>Change my answers</button>`;
      const setup = output.querySelector('[data-setup-form]');
      setup.addEventListener('submit', async event => {
        event.preventDefault(); if (!setup.reportValidity()) return;
        const button=setup.querySelector('button[type="submit"]');
        const status=setup.querySelector('[data-setup-status]');
        button.disabled=true;button.textContent='Sending…';status.textContent='';
        const data=new FormData(setup);
        data.set('fit_id',state.fitId);data.set('fit_answers',JSON.stringify(state.answers));data.set('ruleset_version',version);
        if(attached) {data.set('stackbrief_id',brief.briefId);data.set('stackbrief_summary',brief.portableBrief);}
        try {
          const response=await fetch(setup.action,{method:'POST',body:data,headers:{Accept:'application/json'}});
          if(!response.ok) throw new Error('Send failed');
          funnel?.track('repair_setup_submitted',{fitId:state.fitId,briefId:state.briefId,package:'repair-4000'});
          setup.innerHTML='<div role="status"><h3>Setup details received.</h3><p>Xavier will confirm compatibility, scope, and the start date by email. Your $2,000 deposit link comes with that written confirmation.</p></div>';
        } catch {status.textContent='Could not send. Try again or email xavier.brandmanager@gmail.com.';button.disabled=false;button.textContent='Confirm my setup →';}
      });
    } else {
      const reasons = {
        demand: 'Your next step is finding demand, not paying for a process repair.',
        evidence: 'Get a clearer picture before paying for implementation.',
        budget: 'Start with the free fix while you plan the budget.',
        authority: 'Share the scope with the person who can approve it.',
        timing: 'Use the free materials now. Return when you are ready to onboard.',
        scope: 'Your project needs its scope confirmed first.'
      };
      const steps = result.route === 'demand'
        ? ['Keep the inquiry process that already works.', 'Track relevant visits or outreach conversations and the inquiries they create.', 'Ask good-fit customers how they found you and why they acted.']
        : result.route === 'authority'
          ? ['Share this page with the person approving the $4,000 repair.', 'Review the problem and included scope together.', 'Include the approver in setup confirmation before committing.']
          : ['Test your contact or booking step.', 'Record each inquiry, its owner, and response deadline.', 'Check overdue items each business day.'];
      output.innerHTML = `<h3>${escape(reasons[result.route])}</h3><p>Use a small, measurable next step before paying for a larger repair.</p><ol>${steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol><a class="button" href="/tools/inquiry-first-aid">Get the free starter →</a><p><a href="/stackbrief">Find your first fix with StackBrief →</a></p>${['scope','authority'].includes(result.route) ? '<p><a href="mailto:xavier.brandmanager@gmail.com?subject=Customer%20Journey%20Repair%20scope">Discuss scope or shared approval →</a></p>' : ''}${result.route === 'demand' ? '<p><a href="/guides/where-leads-come-from">Read the demand guide →</a></p>' : ''}<button type="button" class="quiz-back" data-edit-fit>Change my answers</button>`;
    }
    output.querySelector('[data-edit-fit]').addEventListener('click', () => { output.hidden = true; form.hidden = false; state.index = 0; render(); });
    output.querySelector('h3').setAttribute('tabindex','-1'); output.querySelector('h3').focus({preventScroll:true});
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    const q = questions[state.index]; state.answers[q.id] = new FormData(form).get(q.id); save();
    if (state.index === questions.length - 1) showResult(); else { state.index++; render(); }
  });
  render();
})();

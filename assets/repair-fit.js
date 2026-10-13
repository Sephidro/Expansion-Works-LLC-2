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
      output.innerHTML = `<h3>You match the standard repair package.</h3><p>$4,000 total. $2,000 deposit. Final $2,000 after the agreed tests pass.</p><p>Next: secure Square payment, then project setup.</p><div data-deposit-step></div><button type="button" class="quiz-back" data-edit-fit>Change my answers</button>`;
      const step = output.querySelector('[data-deposit-step]');
      step.innerHTML = `<p><a href="/repair-terms">Read the included scope, support, and deposit terms</a>.</p><label class="fit-option"><input type="checkbox" data-terms-reviewed><span>I have reviewed the scope and deposit terms.</span></label><button class="button" type="button" data-deposit-button disabled>Pay the $2,000 deposit →</button>`;
      const button = step.querySelector('[data-deposit-button]');
      step.querySelector('[data-terms-reviewed]').addEventListener('change', event => { button.disabled = !event.target.checked; });
      button.addEventListener('click', () => {
        state.termsReviewedAt = new Date().toISOString(); state.termsVersion = '2026-10-13.1'; save();
        funnel?.track('deposit_checkout_started', { fitId: state.fitId, briefId: state.briefId, package: 'repair-4000', amount: 2000 });
        location.assign('https://square.link/u/m1VsIYO7');
      });
    } else {
      const reasons = {
        demand: 'Your next step is finding demand, not paying for a process repair.',
        evidence: 'Get a clearer picture before paying for implementation.',
        budget: 'Start with the free fix while you plan the budget.',
        authority: 'Share the scope with the person who can approve it.',
        timing: 'Use the free materials now. Return when you are ready to onboard.',
        scope: 'The standard package does not cover a full rebuild or an undefined project.'
      };
      const steps = result.route === 'demand'
        ? ['Keep the inquiry process that already works.', 'Track relevant visits or outreach conversations and the inquiries they create.', 'Ask good-fit customers how they found you and why they acted.']
        : result.route === 'authority'
          ? ['Save the $4,000 package scope and payment terms.', 'Add one real inquiry showing the missed handoff.', 'Share it with the decision-maker before committing.']
          : ['Test your contact or booking step.', 'Record each inquiry, its owner, and response deadline.', 'Check overdue items each business day.'];
      output.innerHTML = `<h3>${escape(reasons[result.route])}</h3><p>Use a small, measurable next step before paying for a larger repair.</p><ol>${steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol><a class="button" href="/tools/inquiry-first-aid">Get the free starter →</a><p><a href="/stackbrief">Find your first fix with StackBrief →</a></p>${result.route === 'demand' ? '<p><a href="/guides/where-leads-come-from">Read the demand guide →</a></p>' : ''}<button type="button" class="quiz-back" data-edit-fit>Change my answers</button>`;
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

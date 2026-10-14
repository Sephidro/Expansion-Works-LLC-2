(() => {
  'use strict';
  const menu = document.querySelector('[data-menu]');
  const toggle = document.querySelector('[data-menu-toggle]');
  toggle?.addEventListener('click', () => { toggle.setAttribute('aria-expanded', String(menu.classList.toggle('open'))); });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.classList.remove('open'); toggle?.setAttribute('aria-expanded', 'false'); }));
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;
  const { version: rulesetVersion, questions, evaluate } = window.StackBriefRules;
  const funnel = window.StackBriefFunnel;
  const stage = quiz.querySelector('[data-quiz-stage]');
  const progress = document.querySelector('[data-progress]');
  const progressLabel = document.querySelector('[data-progress-label]');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state = { index: 0, answers: {}, startedAt: new Date().toISOString(), completedAt: '', briefId: '', completed: false, rulesetVersion };
  const saved = funnel?.getQuizSession();
  if (saved?.rulesetVersion === rulesetVersion && Number.isInteger(saved.index) && saved.index >= 0 && saved.index <= questions.length) {
    const validAnswers = Object.fromEntries(questions.flatMap(q => {
      const match = q.answers.find(a => a.value === saved.answers?.[q.id]?.value);
      return match ? [[q.id, match]] : [];
    }));
    let validIndex = 0;
    while (validIndex < questions.length && validAnswers[questions[validIndex].id]) validIndex++;
    Object.assign(state, { answers: validAnswers, index: Math.min(saved.index, validIndex), startedAt: saved.startedAt || state.startedAt, briefId: saved.briefId || '', completedAt: saved.completedAt || '', completed: Boolean(saved.completed && validIndex === questions.length && saved.index === questions.length) });
    funnel?.track(state.completed ? 'quiz_result_revisited' : 'quiz_resumed', { rulesetVersion, briefId: state.briefId });
  } else funnel?.track('quiz_started', { rulesetVersion });
  const persist = () => funnel?.saveQuizSession({ ...state });
  function focusHeading() { const h = stage.querySelector('h2'); h?.setAttribute('tabindex','-1'); h?.focus({ preventScroll: true }); }
  function renderQuestion(focus = false) {
    quiz.classList.remove('has-result');
    const question = questions[state.index];
    progress.style.width = `${state.index / questions.length * 100}%`;
    progressLabel.textContent = `QUESTION ${String(state.index + 1).padStart(2,'0')} / 09`;
    stage.innerHTML = `<div class="question-count">${state.index + 1}</div><h2 class="question-title">${escape(question.title)}</h2>${question.note ? `<p class="question-note">${escape(question.note)}</p>` : ''}<div class="answer-grid">${question.answers.map(a => `<button class="answer-option" type="button" data-answer="${a.value}" aria-pressed="${state.answers[question.id]?.value === a.value}"><strong>${escape(a.label)}</strong></button>`).join('')}</div>${state.index ? '<button class="quiz-back" type="button" data-back>← Previous question</button>' : ''}`;
    stage.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
      state.answers[question.id] = question.answers.find(a => a.value === button.dataset.answer);
      state.index++;
      state.completed = false;
      state.completedAt = '';
      persist();
      funnel?.track('quiz_answered', { rulesetVersion, questionId: question.id, answer: button.dataset.answer, questionNumber: state.index });
      if (state.index === questions.length) renderResult(); else renderQuestion(true);
    }));
    stage.querySelector('[data-back]')?.addEventListener('click', () => { state.index--; persist(); renderQuestion(true); });
    if (focus) focusHeading();
  }
  async function copy(text, button) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement('textarea'); field.value = text; field.style.position = 'fixed'; field.style.opacity = '0'; document.body.append(field); field.select();
        const copied = document.execCommand('copy'); field.remove(); if (!copied) throw new Error('Clipboard unavailable');
      }
      button.textContent = 'Copied';
    } catch { button.textContent = 'Copy unavailable. Select the text or download it.'; }
  }
  function download(text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'My-StackBrief.txt'; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function renderResult() {
    const r = evaluate(state.answers);
    state.briefId ||= funnel?.makeId('SBB') || `SBB-${Date.now().toString(36)}`;
    state.completedAt ||= new Date().toISOString();
    const portableBrief = ['STACKBRIEF', r.title, r.action, '', 'YOUR ANSWERS', ...r.evidence.map(e => `${e.question}\n${e.answer}`), '', r.materialTitle, r.material, '', 'TEST', r.test, '', 'KEEP', r.keep, '', r.caution, r.upgrade, '', 'Based on your answers, not an inspection of your website or CRM. No sales or revenue prediction.', 'https://stackbriefxp.vercel.app/stackbrief'].filter(v => v !== undefined).join('\n');
    const data = { briefId: state.briefId, rulesetVersion, visitorId: funnel?.visitorId() || '', route: r.route, planKey: r.key, planTitle: r.title, constraint: { key: r.key, label: r.title, title: r.title }, recommendations: [], qualifiedForReview: r.paidFit, answers: state.answers, portableBrief, attribution: funnel?.attribution() || {}, startedAt: state.startedAt, completedAt: state.completedAt };
    funnel?.saveResult(data);
    if (!state.completed) funnel?.track('quiz_completed', { briefId: state.briefId, rulesetVersion, route: r.route, planKey: r.key, implementationPreference: state.answers.involvement.value });
    state.completed = true; persist();
    quiz.classList.add('has-result'); progress.style.width = '100%'; progressLabel.textContent = 'YOUR FIRST ACTION';
    const href = `/sales?from=stackbrief&brief=${encodeURIComponent(state.briefId)}&fit=${r.key}#apply`;
    stage.innerHTML = `<h2 class="result-title">${escape(r.title)}</h2><p class="result-reason">${escape(r.action)}</p><p class="diagnostic-boundary">Based on your answers.</p><details class="diagnostic-why"><summary>Why this result?</summary><ul>${r.evidence.map(e => `<li><strong>${escape(e.question)}</strong><br>${escape(e.answer)}</li>`).join('')}</ul></details><section class="repair-material"><h3>${escape(r.materialTitle)}</h3><button class="button button-small" type="button" data-copy-material>Copy these materials</button><details class="scan-details"><summary>Read and edit the materials</summary><p>Replace the brackets with your details.</p><pre tabindex="0">${escape(r.material)}</pre></details></section><div class="result-grid"><details class="result-block scan-details"><summary>Test the fix</summary><p>${escape(r.test)}</p><p>With fewer than five real inquiries, extend observation. Workflow tests do not prove a sales lift.</p></details><details class="result-block scan-details"><summary>Keep what works</summary><p>${escape(r.keep)}</p><p>${escape(r.upgrade)}</p></details></div>${r.caution ? `<p class="diagnostic-boundary">${escape(r.caution)}</p>` : ''}${r.paidFit ? `<section class="ascension-box is-qualified"><h3>Here, let me just do it.</h3><p>I build, connect, and test the path. Your team handles prospects.</p><p>Customer Journey Repair: all six follow-up workflows for $4,000. Check your fit before the $2,000 deposit.</p><a class="button" href="${href}" data-dfy-link>Check my fit →</a></section>` : '<p class="diagnostic-boundary">Use this yourself first. These answers do not establish a fit for a full installation.</p>'}<div class="result-actions"><button type="button" data-copy-brief>Copy my result</button><button type="button" data-download>Download my result</button><button type="button" data-edit>Change my answers</button><button type="button" data-restart>Start over</button></div>`;
    stage.querySelector('[data-copy-material]').addEventListener('click', e => copy(r.material,e.currentTarget));
    stage.querySelector('[data-copy-brief]').addEventListener('click', e => copy(portableBrief,e.currentTarget));
    stage.querySelector('[data-download]').addEventListener('click', () => download(portableBrief));
    stage.querySelector('[data-edit]').addEventListener('click', () => { state.index = 0; state.completed = false; persist(); renderQuestion(true); });
    stage.querySelector('[data-restart]').addEventListener('click', () => {
      Object.assign(state, { index: 0, answers: {}, startedAt: new Date().toISOString(), completedAt: '', briefId: '', completed: false });
      funnel?.clearQuizSession(); funnel?.clearResult(); funnel?.track('quiz_restarted',{rulesetVersion}); renderQuestion(true);
    });
    stage.querySelector('[data-dfy-link]')?.addEventListener('click', () => funnel?.track('dfy_handoff_clicked',{briefId: state.briefId, planKey: r.key, route: r.route, constraint: r.key}));
    focusHeading();
  }
  if (state.completed && state.index === questions.length) renderResult(); else renderQuestion();
})();

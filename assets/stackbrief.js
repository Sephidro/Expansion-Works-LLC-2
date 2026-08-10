(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  const quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;

  const stage = quiz.querySelector('[data-quiz-stage]');
  const progress = quiz.querySelector('[data-progress]');
  const progressLabel = quiz.querySelector('[data-progress-label]');

  const questions = [
    {
      id: 'stage',
      kicker: 'BUSINESS STAGE',
      title: 'Which description is closest to your business right now?',
      answers: [
        { value: 'starting', score: 0, label: 'Starting or rebuilding', detail: 'The offer is still being proven or repositioned.' },
        { value: 'steady', score: 1, label: 'Booked, but inconsistent', detail: 'Clients exist, but the pipeline still depends on you remembering everything.' },
        { value: 'scaling', score: 3, label: 'Past $100K and growing', detail: 'Volume, handoffs, or complexity are starting to expose gaps.' }
      ]
    },
    {
      id: 'leads',
      kicker: 'MONTHLY LEAD FLOW',
      title: 'How many real inquiries enter the business in a typical month?',
      answers: [
        { value: 'low', score: 0, label: 'Fewer than 5', detail: 'The priority is clarity and demand, not heavy automation.' },
        { value: 'medium', score: 1, label: 'About 5 to 20', detail: 'A lightweight pipeline can prevent good opportunities from going cold.' },
        { value: 'high', score: 3, label: 'More than 20', detail: 'Manual routing and follow-up are likely becoming expensive.' }
      ]
    },
    {
      id: 'tools',
      kicker: 'CURRENT STACK',
      title: 'What happens after someone raises their hand?',
      answers: [
        { value: 'manual', score: 0, label: 'Inbox, notes, and memory', detail: 'It works until several opportunities arrive at once.' },
        { value: 'patchwork', score: 2, label: 'Several tools, loosely connected', detail: 'Information gets copied, lost, or trapped between apps.' },
        { value: 'connected', score: 2, label: 'A connected system exists', detail: 'The question is whether it is still the right system.' }
      ]
    },
    {
      id: 'bottleneck',
      kicker: 'ACTIVE BOTTLENECK',
      title: 'Where does the current setup fail most often?',
      answers: [
        { value: 'offer', score: 0, label: 'The website does not explain the offer', detail: 'Visitors do not understand why they should take the next step.' },
        { value: 'scattered', score: 1, label: 'Leads and context are scattered', detail: 'You cannot see the full pipeline in one place.' },
        { value: 'followup', score: 2, label: 'Follow-up depends on memory', detail: 'Interested people wait too long or disappear entirely.' },
        { value: 'admin', score: 3, label: 'Admin is stealing delivery time', detail: 'Manual handoffs and updates are now an operating cost.' }
      ]
    },
    {
      id: 'ownership',
      kicker: 'IMPLEMENTATION STYLE',
      title: 'How much of this system do you want to build yourself?',
      answers: [
        { value: 'diy', score: 0, label: 'I can build it', detail: 'Give me the order, reasoning, and guardrails.' },
        { value: 'guided', score: 1, label: 'I can handle a guided setup', detail: 'I want clear instructions and a short list of decisions.' },
        { value: 'done', score: 2, label: 'I do not want another tool project', detail: 'If the economics make sense, I want it installed for me.' }
      ]
    }
  ];

  const plans = {
    essentials: {
      label: 'STACK 01 // ESSENTIALS',
      title: 'Keep the stack light',
      reason: 'Your next gain is more likely to come from a clearer offer and a reliable next step than from buying a complex CRM or automation platform.',
      doNow: ['One clear website path', 'Lead capture + booking', 'Simple payment or proposal flow'],
      later: ['Email follow-up after demand is consistent', 'CRM when active leads outgrow one view'],
      skip: ['Enterprise CRM', 'Multi-step automation', 'Full analytics suite']
    },
    pipeline: {
      label: 'STACK 02 // PIPELINE',
      title: 'Build one reliable path',
      reason: 'You have enough opportunity for dropped context and inconsistent follow-up to cost money. The stack should make every inquiry visible without becoming a second job.',
      doNow: ['Clear website + lead source', 'Lightweight CRM pipeline', 'Booking + three-touch follow-up'],
      later: ['Proposal and payment handoff', 'Source and close-rate reporting'],
      skip: ['Enterprise feature bundles', 'Automation across every task', 'A second system of record']
    },
    growth: {
      label: 'STACK 03 // GROWTH SYSTEM',
      title: 'Connect the handoffs',
      reason: 'At your volume, fragmented data and manual transitions can become a real operating cost. The goal is one source of truth and automation only where repetition is proven.',
      doNow: ['CRM as the source of truth', 'Routing + follow-up automation', 'Booking, proposal, and payment handoffs'],
      later: ['Long-term nurture', 'Team permissions + advanced reporting'],
      skip: ['Another isolated tool', 'Rebuilding everything at once', 'Automation without an owner']
    }
  };

  const state = { index: 0, answers: {} };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function updateProgress() {
    const current = Math.min(state.index + 1, questions.length);
    progress.style.width = `${(current / questions.length) * 100}%`;
    progressLabel.textContent = `QUESTION ${String(current).padStart(2, '0')} / ${String(questions.length).padStart(2, '0')}`;
  }

  function renderQuestion() {
    const question = questions[state.index];
    updateProgress();
    stage.innerHTML = `
      <p class="question-kicker">${escapeHtml(question.kicker)}</p>
      <h3 class="question-title">${escapeHtml(question.title)}</h3>
      <div class="answer-grid">
        ${question.answers.map((answer) => `
          <button class="answer-option" type="button" data-answer="${escapeHtml(answer.value)}">
            <strong>${escapeHtml(answer.label)}</strong>
            <span>${escapeHtml(answer.detail)}</span>
          </button>
        `).join('')}
      </div>
      ${state.index > 0 ? '<button class="quiz-back" type="button" data-back>← Previous question</button>' : ''}
    `;

    stage.querySelectorAll('[data-answer]').forEach((button) => {
      button.addEventListener('click', () => {
        const answer = question.answers.find((item) => item.value === button.dataset.answer);
        state.answers[question.id] = answer;
        state.index += 1;
        if (state.index < questions.length) renderQuestion();
        else renderResult();
      });
    });

    const back = stage.querySelector('[data-back]');
    if (back) back.addEventListener('click', () => {
      state.index -= 1;
      renderQuestion();
    });
  }

  function pickPlan() {
    const total = Object.values(state.answers).reduce((sum, answer) => sum + answer.score, 0);
    const isGrowth = state.answers.stage.value === 'scaling' || state.answers.leads.value === 'high' || total >= 9;
    const isPipeline = state.answers.leads.value === 'medium' || ['scattered', 'followup', 'admin'].includes(state.answers.bottleneck.value) || total >= 4;
    if (isGrowth) return { key: 'growth', score: total };
    if (isPipeline) return { key: 'pipeline', score: total };
    return { key: 'essentials', score: total };
  }

  function list(items) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function renderResult() {
    progress.style.width = '100%';
    progressLabel.textContent = 'INITIAL BRIEF COMPLETE';
    const selection = pickPlan();
    const plan = plans[selection.key];
    const summary = [
      plan.label,
      `Stage: ${state.answers.stage.label}`,
      `Leads: ${state.answers.leads.label}`,
      `Current stack: ${state.answers.tools.label}`,
      `Bottleneck: ${state.answers.bottleneck.label}`,
      `Ownership: ${state.answers.ownership.label}`
    ].join(' | ');

    stage.innerHTML = `
      <div class="result-header">
        <div><p class="result-tier">${escapeHtml(plan.label)}</p><h3 class="result-title">${escapeHtml(plan.title)}</h3></div>
        <div class="result-score" aria-label="Complexity score ${selection.score}">${String(selection.score).padStart(2, '0')}</div>
      </div>
      <p class="result-reason">${escapeHtml(plan.reason)}</p>
      <div class="result-grid">
        <div class="result-block"><h4>DO NOW</h4>${list(plan.doNow)}</div>
        <div class="result-block"><h4>ADD LATER</h4>${list(plan.later)}</div>
        <div class="result-block"><h4>SKIP FOR NOW</h4>${list(plan.skip)}</div>
      </div>
      <div class="save-box">
        <h4>Save the brief and get the beta follow-up.</h4>
        <p>Leave your email for the detailed setup notes and relevant factual updates. No generic software-news drip.</p>
        <form class="save-form" action="https://formspree.io/f/xeewjjlv" method="POST" data-save-form>
          <input type="email" name="email" autocomplete="email" placeholder="you@business.com" aria-label="Work email" required>
          <input type="hidden" name="source" value="StackBrief homepage beta">
          <input type="hidden" name="stackbrief_result" value="${escapeHtml(summary)}">
          <input type="hidden" name="_subject" value="New StackBrief beta lead">
          <button class="button" type="submit">Save my StackBrief →</button>
        </form>
        <p class="form-status" data-form-status aria-live="polite"></p>
      </div>
      <div class="result-actions">
        ${state.answers.ownership.value === 'done' || selection.key === 'growth' ? '<a href="/sales">I want this installed for me →</a>' : '<a href="/sales">See the done-for-you option →</a>'}
        <button type="button" data-restart>Retake the brief</button>
      </div>
    `;

    const restart = stage.querySelector('[data-restart]');
    restart.addEventListener('click', () => {
      state.index = 0;
      state.answers = {};
      renderQuestion();
    });

    const form = stage.querySelector('[data-save-form]');
    const status = stage.querySelector('[data-form-status]');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      submit.textContent = 'SAVING...';
      status.textContent = '';
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Form submission failed');
        form.innerHTML = '<p class="form-status">SAVED. I’ll use this result to send only the next relevant decision.</p>';
      } catch (error) {
        status.textContent = 'That did not save. Try again or use the done-for-you page to contact me directly.';
        submit.disabled = false;
        submit.textContent = 'SAVE MY STACKBRIEF →';
      }
    });
  }

  renderQuestion();
})();

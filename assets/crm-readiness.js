(() => {
  'use strict';

  const form = document.querySelector('[data-crm-test]');
  const result = document.querySelector('[data-crm-result]');
  if (!form || !result) return;

  const funnel = window.StackBriefFunnel;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  const outcomes = {
    sheet: {
      code: 'KEEP THE SPREADSHEET',
      title: 'Your current system has not earned a replacement.',
      summary: 'The evidence does not show enough repeated visibility, ownership, or follow-up failure to justify CRM overhead yet.',
      test: 'For 14 days, keep one row per active opportunity with an owner, stage, next action, and next-action date. Review rows with no next action twice per week.',
      wrong: 'This result becomes wrong when follow-up slips repeatedly, more than one person needs the same context, or you cannot scan every active opportunity in 60 seconds.',
      skip: ['A CRM migration', 'Workflow automation', 'A second place to track the same people'],
      cta: 'Build the rest of my lean stack',
      href: '/stackbrief?utm_source=crm_breakpoint&utm_medium=result&utm_campaign=keep_sheet'
    },
    process: {
      code: 'FIX THE PROCESS FIRST',
      title: 'The missing system is a decision, not a database.',
      summary: 'Your answers show uncertainty about the leak or its economics. Installing software now would automate assumptions you have not tested.',
      test: 'For 14 days, record every qualified inquiry, first useful response time, current stage, owner, next action, and outcome. Do not add automation during the test.',
      wrong: 'This result becomes wrong if the process is already defined and the real failure is that people cannot execute it at the current volume.',
      skip: ['A feature comparison', 'A full-funnel rebuild', 'Revenue-at-risk estimates without recorded outcomes'],
      cta: 'Diagnose the full lead path',
      href: '/stackbrief?utm_source=crm_breakpoint&utm_medium=result&utm_campaign=fix_process'
    },
    crm: {
      code: 'INSTALL A LIGHTWEIGHT CRM',
      title: 'The spreadsheet is beginning to fail at follow-through.',
      summary: 'You have enough repeated visibility or follow-up friction for one shared pipeline to remove a demonstrated problem. Buy discipline, not a feature arsenal.',
      test: 'Create one pipeline with no more than six stages. Require an owner, next action, and date on every open opportunity. Measure adoption and stalled deals for 14 days before adding automation.',
      wrong: 'This result becomes wrong if one person can still see every opportunity and the real failure is demand, offer clarity, or proposal quality.',
      skip: ['Complex marketing automation', 'A platform chosen for future headcount', 'Migrating client delivery before the sales path works'],
      cta: 'Choose the smallest fitting system',
      href: '/stackbrief?utm_source=crm_breakpoint&utm_medium=result&utm_campaign=light_crm'
    },
    connected: {
      code: 'CONNECT THE LEAD SYSTEM',
      title: 'Your problem is bigger than storing contacts.',
      summary: 'Volume, handoffs, or duplicate entry suggest the lead path is breaking between tools and people. A CRM alone will give the failure a new interface.',
      test: 'Map the last 10 qualified inquiries from first touch to recorded outcome. Mark every handoff, delay, copied field, missing owner, and unrecorded next action before choosing software.',
      wrong: 'This result becomes wrong if the last 10 inquiries moved cleanly and the perceived complexity is not causing delays, lost context, or missed follow-up.',
      skip: ['A CRM-only purchase', 'Rebuilding every tool at once', 'Automation without an accountable owner'],
      cta: 'Trace my last 10 inquiries',
      href: '/sales?from=crm-breakpoint&fit=connected#apply'
    }
  };

  function choose(values, score, unknowns) {
    if (unknowns >= 2 || (Number(values.economics) === 0 && score < 8)) return 'process';
    if (score >= 12 || (Number(values.people) >= 2 && score >= 9)) return 'connected';
    if (score >= 6) return 'crm';
    return 'sheet';
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const values = Object.fromEntries(data.entries());
    const score = Object.values(values).reduce((total, value) => total + Number(value), 0);
    const unknowns = form.querySelectorAll('input[data-unknown]:checked').length;
    const outcomeKey = choose(values, score, unknowns);
    const outcome = outcomes[outcomeKey];
    const economicSignal = Number(values.economics) === 3;

    result.innerHTML = `
      <div class="breakpoint-result-topline"><span>YOUR BREAKPOINT</span><b>${escapeHtml(outcome.code)}</b></div>
      <h3>${escapeHtml(outcome.title)}</h3>
      <p class="breakpoint-result-summary">${escapeHtml(outcome.summary)}</p>
      ${economicSignal ? '<p class="economic-signal"><strong>ECONOMIC SIGNAL</strong> One preventable missed engagement could outweigh normal software cost. That does not prove the loss was preventable. It means the failure deserves measurement.</p>' : ''}
      <div class="breakpoint-result-grid">
        <article><span>RUN THIS 14-DAY TEST</span><p>${escapeHtml(outcome.test)}</p></article>
        <article><span>WHAT WOULD MAKE THIS WRONG</span><p>${escapeHtml(outcome.wrong)}</p></article>
        <article><span>DO NOT BUY YET</span><ul>${outcome.skip.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article>
      </div>
      <div class="breakpoint-result-actions">
        <a class="button" href="${escapeHtml(outcome.href)}">${escapeHtml(outcome.cta)} →</a>
        <button type="button" data-copy-result>Copy this result</button>
        <button type="button" data-reset-result>Retake the test</button>
      </div>
      <p class="legal-note">This is a rules-based decision aid. It does not predict revenue or prove that software caused a business outcome.</p>`;
    result.hidden = false;
    form.hidden = true;
    funnel?.track('crm_breakpoint_completed', { outcome: outcomeKey, score, unknowns, economicSignal });
    result.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });

    result.querySelector('[data-reset-result]').addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      result.hidden = true;
      result.innerHTML = '';
      funnel?.track('crm_breakpoint_restarted');
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    const copy = result.querySelector('[data-copy-result]');
    copy.addEventListener('click', async () => {
      const text = `${outcome.code}\n${outcome.title}\n\nWhy: ${outcome.summary}\n\n14-day test: ${outcome.test}\n\nWhat would make this wrong: ${outcome.wrong}\n\nGenerated at https://stackbriefxp.vercel.app/crm-or-spreadsheet-for-consultants`;
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = 'Copied';
      } catch (error) {
        copy.textContent = 'Copy unavailable';
      }
    });
  });
})();

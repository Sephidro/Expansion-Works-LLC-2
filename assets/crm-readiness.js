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
      title: 'Keep the spreadsheet for now.',
      summary: 'You can still see the active opportunities, keep ownership clear, and follow up without adding CRM upkeep.',
      test: 'For 14 days, keep one row per active opportunity with an owner, stage, next action, and next-action date. Review rows with no next action twice per week.',
      wrong: 'Recheck this when follow-up slips repeatedly, more than one person needs the same context, or you cannot scan every active opportunity in 60 seconds.',
      skip: ['A CRM migration', 'Workflow automation', 'A second place to track the same people'],
      cta: 'Build the rest of my lean stack',
      href: '/stackbrief?utm_source=crm_breakpoint&utm_medium=result&utm_campaign=keep_sheet'
    },
    process: {
      code: 'FIX THE PROCESS FIRST',
      title: 'Write down the process before you buy a CRM.',
      summary: 'You still need to find where leads stall and what one missed engagement costs. Track that first, then choose the software.',
      test: 'For 14 days, record every qualified inquiry, first useful response time, current stage, owner, next action, and outcome. Do not add automation during the test.',
      wrong: 'Recheck this if the process is already clear and people cannot keep up with it at the current volume.',
      skip: ['A feature comparison', 'A full-funnel rebuild', 'Revenue-at-risk estimates without recorded outcomes'],
      cta: 'Diagnose the full lead path',
      href: '/stackbrief?utm_source=crm_breakpoint&utm_medium=result&utm_campaign=fix_process'
    },
    crm: {
      code: 'INSTALL A LIGHTWEIGHT CRM',
      title: 'Move the active opportunities into one shared CRM.',
      summary: 'Follow-up is slipping or opportunities are getting hard to see. One shared pipeline can keep the work in front of you.',
      test: 'Create one pipeline with no more than six stages. Require an owner, next action, and date on every open opportunity. Measure adoption and stalled deals for 14 days before adding automation.',
      wrong: 'Recheck this if one person can still see every opportunity and the real issue is demand, offer clarity, or proposal quality.',
      skip: ['Complex marketing automation', 'A platform chosen for future headcount', 'Migrating client delivery before the sales path works'],
      cta: 'Choose the smallest fitting system',
      href: '/stackbrief?utm_source=crm_breakpoint&utm_medium=result&utm_campaign=light_crm'
    },
    connected: {
      code: 'CONNECT THE LEAD SYSTEM',
      title: 'Connect the handoffs around one shared record.',
      summary: 'Volume, handoffs, or duplicate entry are making leads harder to track between tools and people. The CRM needs to connect those steps.',
      test: 'Map the last 10 qualified inquiries from first touch to recorded outcome. Mark every handoff, delay, copied field, missing owner, and unrecorded next action before choosing software.',
      wrong: 'Recheck this if the last 10 inquiries moved cleanly without delays, lost context, or missed follow-up.',
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
      <div class="breakpoint-result-topline"><span>YOUR RESULT</span><b>${escapeHtml(outcome.code)}</b></div>
      <h3>${escapeHtml(outcome.title)}</h3>
      <p class="breakpoint-result-summary">${escapeHtml(outcome.summary)}</p>
      ${economicSignal ? '<p class="economic-signal"><strong>ONE-CLIENT MATH</strong> One normal engagement could cost more than the software. Measure how often the failure happens before you buy.</p>' : ''}
      <div class="breakpoint-result-grid">
        <article><span>RUN THIS 14-DAY TEST</span><p>${escapeHtml(outcome.test)}</p></article>
        <article><span>RECHECK THIS RESULT WHEN</span><p>${escapeHtml(outcome.wrong)}</p></article>
        <article><span>DO NOT BUY YET</span><ul>${outcome.skip.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></article>
      </div>
      <div class="breakpoint-result-actions">
        <a class="button" href="${escapeHtml(outcome.href)}">${escapeHtml(outcome.cta)} →</a>
        <button type="button" data-copy-result>Copy this result</button>
        <button type="button" data-reset-result>Retake the test</button>
      </div>
      <p class="legal-note">This tool uses the six answers above. It cannot predict revenue or prove what caused a lost deal.</p>`;
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

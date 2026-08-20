(() => {
  'use strict';

  const funnel = window.StackBriefFunnel;
  const params = new URLSearchParams(window.location.search);
  if (!funnel || params.get('from') !== 'stackbrief') return;

  const result = funnel.getResult();
  const requestedBrief = params.get('brief');
  if (!result || (requestedBrief && result.briefId !== requestedBrief)) return;

  const panel = document.querySelector('[data-stackbrief-handoff]');
  const form = document.querySelector('[data-service-form]');
  if (!panel || !form) return;

  const title = document.createElement('h3');
  title.textContent = result.constraint
    ? `Your “${result.constraint.title}” StackBrief is attached.`
    : `Your “${result.planTitle}” StackBrief is attached.`;
  const summary = document.createElement('p');
  summary.textContent = result.constraint
    ? 'I already have the client value, lead volume, first problem to fix, and 14-day test. Start with anything the brief missed or anything that has changed.'
    : `I already have your answers and ${result.recommendations.length} system decisions. Start with anything the brief missed or anything that has changed.`;
  const list = document.createElement('ul');
  if (result.constraint) {
    const item = document.createElement('li');
    item.textContent = result.constraint.label;
    list.appendChild(item);
  } else {
    result.recommendations.forEach((recommendation) => {
      const item = document.createElement('li');
      item.textContent = `${recommendation.layer}: ${recommendation.product}`;
      list.appendChild(item);
    });
  }
  panel.append(title, summary, list);
  panel.hidden = false;

  function addHidden(name, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value ?? '');
    form.appendChild(input);
  }

  const source = form.querySelector('input[name="source"]');
  if (source) source.value = 'StackBrief qualified implementation handoff';
  addHidden('stackbrief_id', result.briefId);
  addHidden('stackbrief_ruleset', result.rulesetVersion);
  addHidden('stackbrief_route', result.route);
  addHidden('stackbrief_level', result.planKey);
  addHidden('stackbrief_constraint', result.constraint?.label || '');
  addHidden('stackbrief_client_value', result.answers.value?.label || '');
  addHidden('stackbrief_monthly_good_fit_volume', result.answers.volume?.label || '');
  addHidden('stackbrief_last_stall', result.answers.stall?.label || '');
  addHidden('stackbrief_goal', result.answers.goal?.label);
  addHidden('stackbrief_symptom', result.answers.symptom?.label);
  addHidden('stackbrief_implementation_preference', result.answers.involvement?.label);
  addHidden('stackbrief_products', result.recommendations.map((item) => item.product).join(' | '));
  addHidden('stackbrief_summary', result.portableBrief);
  addHidden('stackbrief_attribution', JSON.stringify(result.attribution));

  funnel.track('dfy_page_viewed', { briefId: result.briefId, planKey: result.planKey, route: result.route });
})();

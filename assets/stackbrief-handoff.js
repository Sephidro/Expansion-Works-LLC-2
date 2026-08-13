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
  title.textContent = `I already have your “${result.planTitle}” StackBrief.`;
  const summary = document.createElement('p');
  summary.textContent = `Your answers and ${result.recommendations.length} system decisions are attached to this inquiry. You do not need to explain everything again.`;
  const list = document.createElement('ul');
  result.recommendations.forEach((recommendation) => {
    const item = document.createElement('li');
    item.textContent = `${recommendation.layer}: ${recommendation.product}`;
    list.appendChild(item);
  });
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
  addHidden('stackbrief_goal', result.answers.goal?.label);
  addHidden('stackbrief_symptom', result.answers.symptom?.label);
  addHidden('stackbrief_implementation_preference', result.answers.involvement?.label);
  addHidden('stackbrief_products', result.recommendations.map((item) => item.product).join(' | '));
  addHidden('stackbrief_summary', result.portableBrief);
  addHidden('stackbrief_attribution', JSON.stringify(result.attribution));

  funnel.track('dfy_page_viewed', { briefId: result.briefId, planKey: result.planKey, route: result.route });
  form.addEventListener('submit', () => {
    funnel.track('dfy_inquiry_submitted', { briefId: result.briefId, planKey: result.planKey, route: result.route });
  });
})();

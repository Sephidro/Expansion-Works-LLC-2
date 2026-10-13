(() => {
  'use strict';
  const options = choices => choices.map(([value, label]) => ({ value, label }));
  const questions = [
    { id: 'need', title: 'Which problem is happening now?', answers: options([
      ['response', 'Inquiries wait because replies or ownership are inconsistent'],
      ['booking', 'Interested people struggle to book or take the next step'],
      ['proposal', 'Proposals or follow-up depend on someone remembering'],
      ['routing', 'Details get lost between our form, inbox, and other tools'],
      ['demand', 'Our process works. We need more people finding us'],
      ['unknown', 'None of these, or I am not sure yet']
    ]) },
    { id: 'budget', title: 'Can you fund the $4,000 repair?', note: '$2,000 deposit. Final $2,000 after the agreed tests pass.', answers: options([
      ['ready', 'Yes. The full $4,000 is available'],
      ['approval', 'The budget needs approval'],
      ['no', 'Not right now']
    ]) },
    { id: 'authority', title: 'Can you approve the work and arrange account access?', answers: options([
      ['yes', 'Yes. I can authorize both'],
      ['shared', 'Another person must approve it'],
      ['research', 'I am researching for someone else']
    ]) },
    { id: 'timing', title: 'When could you provide access and approve the changes?', answers: options([
      ['now', 'I am ready to begin onboarding'],
      ['month', 'Within the next 30 days'],
      ['later', 'Later, or I am still exploring']
    ]) },
    { id: 'scope', title: 'Does the standard package fit your project?', note: 'One service, one inquiry path, up to two existing systems. Your team handles prospects.', answers: options([
      ['yes', 'Yes. We need one defined path repaired'],
      ['larger', 'We need a full rebuild, migration, or custom application'],
      ['unknown', 'I cannot confirm that yet']
    ]) }
  ];
  function evaluate(answers) {
    const value = id => typeof answers[id] === 'string' ? answers[id] : answers[id]?.value;
    const missing = questions.filter(q => !q.answers.some(a => a.value === value(q.id))).map(q => q.id);
    if (missing.length) return { status: 'incomplete', missing };
    const reasons = [];
    if (['demand','unknown'].includes(value('need'))) reasons.push(value('need') === 'demand' ? 'demand' : 'evidence');
    if (value('budget') !== 'ready') reasons.push('budget');
    if (value('authority') !== 'yes') reasons.push('authority');
    if (value('timing') === 'later') reasons.push('timing');
    if (value('scope') !== 'yes') reasons.push('scope');
    const route = reasons[0] || 'qualified';
    return { status: reasons.length ? 'free' : 'qualified', route, reasons, need: value('need'), price: 4000, deposit: 2000, balance: 2000 };
  }
  window.RepairFitRules = { version: '2026-10-13.1', questions, evaluate };
})();

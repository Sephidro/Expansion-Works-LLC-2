import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('../assets/stackbrief-rules.js', import.meta.url),'utf8'), context);
const { questions, evaluate, version } = context.window.StackBriefRules;
const baseline = { volume: 'medium', value: '5to10', entry: 'working', capture: 'record', response: 'reliable', owner: 'explicit', followup: 'working', visible: 'yes', involvement: 'dfy' };
function answers(overrides = {}) {
  const values = { ...baseline, ...overrides };
  return Object.fromEntries(questions.map(q => {
    const answer = q.answers.find(a => a.value === values[q.id]);
    assert.ok(answer, `Invalid fixture ${q.id}: ${values[q.id]}`);
    return [q.id, answer];
  }));
}
const fixtures = [
  ['healthy', {}, false],
  ['entry', { entry: 'broken' }, true],
  ['entry', { entry: 'none', volume: 'none' }, false],
  ['entry', { entry: 'unclear', owner: 'shared' }, true],
  ['capture', { capture: 'missing' }, true],
  ['capture', { capture: 'scattered', response: 'delayed' }, true],
  ['response', { response: 'delayed' }, true],
  ['response', { owner: 'unset' }, true],
  ['response', { response: 'receipt', visible: 'no' }, true],
  ['booking', { followup: 'booking' }, true],
  ['followup', { followup: 'proposal' }, true],
  ['unsafe', { followup: 'unsafe', entry: 'broken' }, true],
  ['demand', { volume: 'none' }, false],
  ['demand', { volume: 'low' }, false],
  ['visibility', { capture: 'unknown', visible: 'unknown', owner: 'unknown' }, false],
  ['visibility', { visible: 'no' }, false],
  ['unknown', { volume: 'unknown', entry: 'unknown', response: 'unknown', owner: 'unknown', followup: 'unknown' }, false],
  ['response', { owner: 'shared', volume: 'low' }, false]
];
for (const [key, change, paid] of fixtures) {
  const r = evaluate(answers(change));
  assert.equal(r.key,key);
  assert.equal(r.paidFit,paid);
  for (const field of ['title','action','keep','materialTitle','material','test','upgrade']) assert.ok(r[field]?.length, `${key} lacks ${field}`);
  assert.ok(r.evidence.length, `${key} lacks evidence`);
}
// Commercial qualification must not change the free recommendation or materials.
for (const q of questions.filter(q => ['value','involvement'].includes(q.id))) {
  const first = evaluate(answers({ response:'delayed' }));
  for (const option of q.answers) {
    const r = evaluate(answers({ response:'delayed', [q.id]:option.value }));
    assert.equal(r.key,first.key); assert.equal(r.material,first.material);
  }
}
// No repair upsell with unknown demand, low value, DIY preference, or healthy process.
for (const change of [{volume:'unknown'}, {value:'under2'}, {value:'unknown'}, {involvement:'simple'}, {involvement:'team'}]) assert.equal(evaluate(answers({response:'delayed',...change})).paidFit,false);
assert.equal(questions.length,9);
assert.equal(version,'2026-10-13.1');
const quiz = fs.readFileSync(new URL('../assets/stackbrief.js',import.meta.url),'utf8');
assert.ok(!quiz.includes('fetch('), 'Assessment must not depend on a network API');
assert.ok(!quiz.includes('setTimeout(renderResult'), 'No fake scan delay');
assert.ok(quiz.includes('data-copy-material') && quiz.includes('data-download'));
assert.ok(quiz.includes('encodeURIComponent(state.briefId)'));
assert.ok(!quiz.includes('encodeURIComponent(state.answers'));
console.log(`${fixtures.length} routing fixtures passed; qualification independence, materials, versioning, and offline boundaries passed.`);

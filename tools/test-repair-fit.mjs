import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../assets/repair-fit-rules.js',import.meta.url),'utf8'),context);
const {questions,evaluate}=context.window.RepairFitRules;
let checked=0, qualified=0;
function walk(index, answers) {
 if(index<questions.length) {const q=questions[index];for(const a of q.answers)walk(index+1,{...answers,[q.id]:a.value});return;}
 const r=evaluate(answers);checked++;
 const expected=['response','booking','proposal','routing'].includes(answers.need)&&answers.budget==='ready'&&answers.authority==='yes'&&['now','month'].includes(answers.timing)&&answers.scope==='yes';
 assert.equal(r.status,expected?'qualified':'free');
 if(expected) {qualified++;assert.equal(r.deposit,2000);assert.equal(r.price,4000);assert.equal(r.balance,2000);} else assert.ok(r.reasons.length);
}
walk(0,{});assert.equal(qualified,8);assert.equal(evaluate({}).status,'incomplete');
assert.equal(evaluate({need:'response',budget:'forged',authority:'yes',timing:'now',scope:'yes'}).status,'incomplete');
const html=fs.readFileSync(new URL('../sales.html',import.meta.url),'utf8');
assert.ok(!html.includes('what happens after an inquiry, and what do you want changed'));
assert.ok(!html.includes('data-service-form'));
assert.ok(html.includes('data-repair-fit'));
console.log(`${checked} BANT combinations passed; only ${qualified} fit all criteria. Missing and invalid answers cannot qualify.`);

const ui=fs.readFileSync(new URL('../assets/repair-fit.js',import.meta.url),'utf8');
assert.ok(!ui.includes('location.assign'));
assert.ok(ui.includes('data-setup-form'));
assert.ok(ui.includes('name="payment_status" value="unpaid"'));
assert.ok(ui.includes('https://formspree.io/f/xeewjjlv'));
assert.ok(ui.includes("data.set('fit_answers'"));
assert.ok(!ui.includes('checkout is not open'));
const onboard=fs.readFileSync(new URL('../assets/repair-onboarding.js',import.meta.url),'utf8');
assert.ok(!onboard.includes("payment_status', 'paid"));
assert.ok(fs.readFileSync(new URL('../onboarding.html',import.meta.url),'utf8').includes('name="payment_status" value="unverified"'));

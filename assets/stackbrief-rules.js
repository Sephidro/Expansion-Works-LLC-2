(() => {
  'use strict';
  const version = '2026-10-13.1';
  const q = (id, title, choices, note = '') => ({ id, title, note, answers: choices.map(([value, label]) => ({ value, label })) });
  const questions = [
    q('volume', 'How many good-fit inquiries did you receive in the last 30 days?', [['none','None yet'],['low','1–4'],['medium','5–20'],['high','More than 20'],['unknown','I do not track this']], 'Count inquiries, bookings, or serious referrals. Not visitors.'),
    q('value', 'What do you usually collect from one new customer in the first 90 days?', [['under2','Under $2,000'],['2to5','$2,000–$4,999'],['5to10','$5,000–$9,999'],['10to25','$10,000–$24,999'],['25plus','$25,000 or more'],['unknown','I do not know']]),
    q('entry', 'Have you tried the next step a visitor takes on your page?', [['working','Yes. It is clear and works'],['unclear','Yes. The next step is hard to find'],['broken','Yes. The form, button, or booking link fails'],['none','There is no clear way to inquire yet'],['unknown','I have not tested it']], 'Try the actual button or form. A good-looking page can still have a broken next step.'),
    q('capture', 'Where does a new inquiry land?', [['record','One shared record with the details'],['inbox','An inbox someone checks'],['scattered','Several places we check separately'],['missing','We have found inquiries that never reached the team'],['unknown','I am not sure']]),
    q('response', 'What happens before the first useful reply?', [['reliable','A team member responds within our stated window'],['delayed','The wait varies. Sometimes two days or more'],['receipt','A receipt goes out, but a useful reply can be missed'],['unknown','We do not track it']], 'A receipt confirms delivery. A useful reply answers the need or explains the next step.'),
    q('owner', 'Who owns the next action on a new inquiry?', [['explicit','A named person with a deadline'],['memory','Usually me, when I remember'],['shared','Whoever sees it first'],['unset','No owner or deadline is assigned'],['unknown','I do not know']]),
    q('followup', 'What happens after the first useful reply?', [['working','The next step is tracked; reminders stop when they reply or book'],['booking','People have told us the booking step is confusing or fails'],['proposal','Proposals have no set follow-up date'],['adhoc','We follow up when we remember'],['unsafe','Reminders sometimes continue after a reply, booking, or opt-out'],['unknown','I cannot tell from our records']]),
    q('visible', 'Can you find each open inquiry, its owner, and its next action?', [['yes','Yes, in one place'],['no','No. We search inboxes or rely on memory'],['unknown','I am not sure what is still open']]),
    q('involvement', 'How would you like to handle a useful fix?', [['simple','Give me the materials. I will do it'],['team','My team can do it'],['setup','Set it up, then hand it over'],['dfy','Build and connect it for us'],['unknown','Show me the result first']])
  ];
  const tracker = 'Inquiry ID | Received at | Source | Contact | Owner | Response due | First useful response at | Status | Next action | Next action due | Outcome';
  const modules = {
    entry: {
      title: 'Make the next step clear and working.',
      action: 'Choose one action for this page. Test it on your phone before sending more traffic.',
      keep: 'Keep the site platform. These answers do not justify a rebuild.',
      materialTitle: 'Page and form repair checklist',
      material: 'Button: Ask about [service]\nUnder the button: Tell us [essential detail]. [Team] will reply within [realistic business-day window].\n\n1. Put the action beside the service description.\n2. Ask only for details needed for the next step.\n3. Label required fields and show clear errors.\n4. Submit a test inquiry on phone and desktop.\n5. Check the inbox or record and the confirmation.\n6. Name the person responsible for the reply.',
      test: 'Run one complete test on phone and desktop. Both must reach the team with the right details and next action.',
      upgrade: 'Ask for help if the page, form, and receiving system need repairs you cannot make safely.', evidenceIds: ['entry'], repair: true
    },
    capture: {
      title: 'Give inquiries one dependable destination.',
      action: 'List the active sources. For each, choose where the inquiry goes and who checks it.',
      keep: 'Keep working sources. Connect or simplify the handoff before changing platforms.',
      materialTitle: 'Source-to-owner checklist',
      material: 'Source | Destination | Owner | Check time | Backup | Failure signal\n[Website form] | [Shared inbox or record] | [Name] | [Times] | [Name or absence plan] | [Visible error or missing test]\n\nTest each source with a labeled test contact. Check that the details arrive. If a source cannot connect, document who enters the inquiry manually. Never assume DMs are captured.',
      test: 'Submit one test through every source. Record arrival, owner, and next action. Fix any missing handoff before adding automation.',
      upgrade: 'Connect capture and routing if manual transfer repeatedly fails at your actual volume.', evidenceIds: ['capture'], repair: true
    },
    response: {
      title: 'Give each inquiry an owner and a response deadline.',
      action: 'Name the owner, choose a response window the team can keep, and make overdue inquiries visible.',
      keep: 'Keep your form and inbox while you test the routine.',
      materialTitle: 'Confirmation and ownership kit',
      material: 'Subject: We received your inquiry about [service]\n\nHi [first name],\nThanks for getting in touch. [Team or owner] will reply with the next step within [realistic response window]. Our response hours are [days, hours, time zone].\nIf there is a deadline we should know about, reply here.\n[Name / Business]\n\nOWNERSHIP\nPrimary owner: [Name]\nBackup or absence plan: [Name / plan]\nInbox checks: [Times]\nUseful response due: [Window]\nOverdue action: [Person] checks [list] at [time].\n\nRECORD\n' + tracker + '\n\nA receipt is not a useful response. Log those separately. Use the existing form confirmation or send the template manually until delivery is tested.',
      test: 'Test the owner and backup. For 14 days, record every inquiry and useful response. Count overdue replies. Divide on-time replies by inquiries whose deadline has passed.',
      upgrade: 'Connect owner alerts and deadlines if the manual routine keeps slipping.', evidenceIds: ['response','owner'], repair: true
    },
    booking: {
      title: 'Make booking easy to finish.',
      action: 'Test the full booking step with a team member. Remove the specific obstacle they encounter.',
      keep: 'Keep the calendar if settings or wording fix the problem.',
      materialTitle: 'Booking copy and test checklist',
      material: 'Choose a time for [meeting purpose].\nWe will cover [topic]. Allow [duration]. Times are shown in [time zone or visitor-local time].\nIf none work, email [address].\n\nCHECK\n1. Link opens on phone and desktop.\n2. Available times and time zone are clear.\n3. Required questions are relevant.\n4. Confirmation reaches both people.\n5. Reschedule and cancel links work.\n6. Booked status stops booking reminders.',
      test: 'Book, reschedule, and cancel a test appointment. Check both calendars, messages, record status, and reminder exits.',
      upgrade: 'Get help if booking status cannot reach the inquiry record or stop reminders.', evidenceIds: ['followup'], repair: true
    },
    followup: {
      title: 'Give follow-up a date and an ending.',
      action: 'Set the next action when the proposal or reply goes out. Use a short, relevant sequence with clear exits.',
      keep: 'Start with scheduled tasks and saved messages. A new CRM is not required.',
      materialTitle: 'Editable follow-up schedule',
      material: 'Use only for an existing inquiry or proposal where follow-up is appropriate. Adjust timing to the agreed decision date.\n\nDAY 2\nHi [name], did you get the [proposal / next-step details]? Happy to clarify anything about [their stated need].\n\nDAY 5\nHi [name], is [project] still on your list? Reply with the timing you are working toward so we can agree on a next step.\n\nDAY 10\nHi [name], I will close this follow-up for now. If the timing changes, reply here and we can pick it up.\n\nSTOP\nAny reply: pause the sequence and assign the team a task.\nBooking: stop booking reminders.\nOpt-out, decline, won, or closed: stop the sequence.\nDeferred: agree on a future date, not an endless drip.\nNo response by Day 10: end the sequence; record no decision.\nCheck status immediately before sending, including queued messages. If replies cannot be detected, use a human check before each message.',
      test: 'Test a reply, booking, opt-out, and closed outcome before using automation. Then observe 14 days of due tasks and exits. Count completed tasks and unwanted sends.',
      upgrade: 'Automate once the timing and stop rules work and manual tasks are hard to maintain.', evidenceIds: ['followup'], repair: true
    },
    unsafe: {
      title: 'Stop reminders that outlive the conversation.',
      action: 'Pause the affected sequence until replies, bookings, and opt-outs stop queued and future messages.',
      keep: 'Keep other working flows. Repair this sequence before extending it.',
      materialTitle: 'Stop-rule checklist',
      material: 'Reply → pause; assign a human next action.\nBooked → stop booking reminders.\nOpt-out → stop messages in the affected channel.\nWon, declined, or closed → stop the sequence.\nDeferred → agree on a new date.\n\nTest each exit with a test contact. Check already queued sends and future enrollment. If status cannot be detected reliably, require a team member to check it before every send.',
      test: 'Use test contacts for each exit. No stopped contact should receive another included reminder. Keep the flow paused if any test fails.',
      upgrade: 'Ask for a repair if status changes are not reaching the sending tool.', evidenceIds: ['followup'], repair: true
    },
    visibility: {
      title: 'Put open inquiries and next actions in one list.',
      action: 'Reconstruct the last five inquiries. Record what you know and leave unknown outcomes blank.',
      keep: 'Use a shared sheet or existing CRM. Do not migrate yet.',
      materialTitle: 'Opportunity tracker',
      material: tracker + '\n\nStatuses: New, Waiting on us, Waiting on prospect, Booked, Proposal sent, Closed.\nOutcomes: Won, Lost, Not a fit, Deferred, No decision.\n\nEach open row needs an owner, next action, and due date. Review due rows each business day. Do not call an unanswered inquiry lost without evidence.',
      test: 'For 14 days, enter each inquiry. Check whether every open row has an owner and dated next action. Use actual records to locate the first repeated problem.',
      upgrade: 'Consider connections when keeping this list current becomes unreliable.', evidenceIds: ['capture','visible','followup'], repair: false
    },
    demand: {
      title: 'Find out whether people reach the next step.',
      action: 'Track discovery and inquiries before paying for a large system repair.',
      keep: 'Keep one clear contact path and a basic inquiry list.',
      materialTitle: 'Demand and traffic check',
      material: 'Week | Source | Relevant visits or outreach conversations | Inquiries | Bookings | Known outcomes\n\n1. Test the contact path once.\n2. Record available visitor and source counts. Unknown is not zero.\n3. Record every inquiry and where it came from.\n4. Ask people in your intended market: What prompted you to look for help? What would make the next step worth taking?\n5. Compare acquisition activity with inquiries. Few inquiries alone do not identify a conversion problem.',
      test: 'Observe 30 days. Low relevant traffic points toward acquisition work. Visits without inquiries warrant investigation of fit, message, and next-step friction. Use counts, not a revenue-loss estimate.',
      upgrade: 'Investigate acquisition or offer fit first. A full implementation is not supported by inquiry volume alone.', evidenceIds: ['volume'], repair: false
    },
    unknown: {
      title: 'Get a baseline before choosing a repair.',
      action: 'Run one test inquiry and record the path. Then observe real inquiries for 14 days.',
      keep: 'Keep the tools until you can name a specific problem.',
      materialTitle: 'One-inquiry trace',
      material: 'Source: [Where it started]\nSubmitted at: [Time]\nReached: [Inbox or record]\nOwner: [Name]\nConfirmation at: [Time or none]\nUseful reply at: [Time or unknown]\nNext action and due date: [Action / date]\nOutcome: [Known result or unknown]\n\nUse a test contact first. Record missing information without guessing. Repeat for the next real inquiries.',
      test: 'Locate the first step that fails or cannot be reconstructed. A test contact checks the system, not buyer demand.',
      upgrade: 'If the records need substantial investigation, request a separately scoped diagnostic.', evidenceIds: ['volume','entry','capture','response','followup','visible'], repair: false
    },
    healthy: {
      title: 'No clear repair is supported by these answers.',
      action: 'Keep the process. Run a periodic check instead of buying a replacement.',
      keep: 'Keep the current pages, tools, and ownership routine.',
      materialTitle: 'Monthly journey check',
      material: '1. Submit a test inquiry.\n2. Check capture, confirmation, and assigned owner.\n3. Confirm the next action and due date.\n4. Test booking and reminder exits where used.\n5. Review overdue tasks and unknown outcomes.\n6. Record failures, fixes, and the next test date.',
      test: 'Repeat monthly and after tool changes. These answers do not measure sales performance or prove every path works.',
      upgrade: 'Get help only when a specific test or real inquiry shows a problem.', evidenceIds: ['entry','capture','response','owner','followup','visible'], repair: false
    }
  };
  function evaluate(answers) {
    const a = id => answers[id]?.value;
    let key;
    // Specific reported defects outrank uncertainty. Demand and paid fit are separate.
    if (a('followup') === 'unsafe') key = 'unsafe';
    else if (['broken','unclear','none'].includes(a('entry'))) key = 'entry';
    else if (['missing','scattered'].includes(a('capture'))) key = 'capture';
    else if (['delayed','receipt'].includes(a('response')) || ['memory','shared','unset'].includes(a('owner'))) key = 'response';
    else if (a('followup') === 'booking') key = 'booking';
    else if (['proposal','adhoc'].includes(a('followup'))) key = 'followup';
    else if (a('volume') === 'none' || a('volume') === 'low') key = 'demand';
    else if (a('capture') === 'unknown' || ['no','unknown'].includes(a('visible'))) key = 'visibility';
    else if (['volume','entry','response','owner','followup'].some(id => !a(id) || a(id) === 'unknown')) key = 'unknown';
    else key = 'healthy';
    const module = modules[key];
    const evidence = module.evidenceIds.filter(id => answers[id] && (key === 'healthy' || a(id) !== 'unknown')).map(id => ({ question: questions.find(q => q.id === id).title, answer: answers[id].label }));
    const demandKnown = ['medium','high'].includes(a('volume'));
    const paidFit = module.repair && demandKnown && ['5to10','10to25','25plus'].includes(a('value')) && ['setup','dfy'].includes(a('involvement'));
    return { ...module, key, evidence, paidFit, route: a('volume') === 'none' ? 'starter' : 'working', caution: !demandKnown && module.repair ? 'Fix this reported issue, but inquiry volume does not support a full installation yet. Traffic and demand may also need work.' : '' };
  }
  window.StackBriefRules = { version, questions, evaluate };
})();

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
  const progress = document.querySelector('[data-progress]');
  const progressLabel = document.querySelector('[data-progress-label]');
  const catalog = window.StackBriefCatalog;
  const productCatalog = catalog?.products || {};
  const verifiedDate = catalog?.verifiedDate || 'Verify before purchase';
  const rulesetVersion = '2026-08-15.1';
  const funnel = window.StackBriefFunnel;

  const commonQuestions = [
    {
      id: 'stage',
      kicker: 'WHERE YOU ARE NOW',
      title: 'Which one feels most like the business today?',
      note: 'Pick the closest answer. It does not need to describe you perfectly.',
      answers: [
        { value: 'idea', label: 'I’m turning an idea or skill into an offer', detail: 'The business is still taking shape.' },
        { value: 'first', label: 'My offer is ready. I need my first customers', detail: 'I know what I want to sell, but demand is not consistent yet.' },
        { value: 'inconsistent', label: 'I get customers, but not consistently', detail: 'Some months work. Others feel like starting over.' },
        { value: 'working', label: 'Business is working, but the process is messy', detail: 'Customers exist. Too much still depends on memory and manual work.' },
        { value: 'growth', label: 'We have steady demand and the system is becoming a problem', detail: 'Volume, handoffs, or team access now affect the work.' },
        { value: 'rebuilding', label: 'I’m rebuilding or changing direction', detail: 'The business exists, but the offer, audience, or way the business works is changing.' }
      ]
    },
    {
      id: 'channel',
      kicker: 'HOW PEOPLE FIND YOU',
      title: 'How do people usually hear about you?',
      answers: [
        { value: 'unknown', label: 'I don’t have enough customers to know yet', detail: 'That is normal. We will keep the recommendation flexible.' },
        { value: 'referral', label: 'Referrals or networking', detail: 'People usually arrive already knowing something about me.' },
        { value: 'social', label: 'Social media, videos, or online communities', detail: 'Most discovery begins with content, a profile, or a direct message.' },
        { value: 'search', label: 'Google, articles, or my website', detail: 'People find information while actively researching a problem.' },
        { value: 'outbound', label: 'I contact potential customers directly', detail: 'Email, messages, partnerships, or direct outreach create opportunities.' },
        { value: 'mixed', label: 'Several of these', detail: 'The business needs to support more than one path.' }
      ]
    },
    {
      id: 'nextstep',
      kicker: 'THE NEXT STEP',
      title: 'When someone becomes interested, what should they be able to do?',
      note: 'Choose the most important action. The stack should make this easy before doing anything fancy.',
      answers: [
        { value: 'contact', label: 'Contact or message me', detail: 'They need one easy way to start a conversation.' },
        { value: 'book', label: 'Book a call or meeting', detail: 'Qualified people should be able to choose a time.' },
        { value: 'qualify', label: 'Answer a few questions before we talk', detail: 'I need context before deciding whether a conversation makes sense.' },
        { value: 'buy', label: 'Buy something immediately', detail: 'Payment and delivery should happen without manual work.' },
        { value: 'list', label: 'Download something or join my email list', detail: 'I want to build a relationship before asking for a larger commitment.' },
        { value: 'multiple', label: 'Choose between several paths', detail: 'Different visitors need bookings, purchases, content, events, or other actions.' },
        { value: 'unknown', label: 'I’m not sure yet', detail: 'We will favor a simple path that can change later.' }
      ]
    },
    {
      id: 'current',
      kicker: 'WHAT HAPPENS NOW',
      title: 'What usually happens after someone shows interest?',
      answers: [
        { value: 'none', label: 'I haven’t received enough interest yet', detail: 'The first job is creating a dependable way to start conversations.' },
        { value: 'inbox', label: 'I reply from email or direct messages', detail: 'The process works as long as I remember everything.' },
        { value: 'sheet', label: 'I use notes or a spreadsheet to keep track', detail: 'There is one basic view, but most follow-up is manual.' },
        { value: 'crm_rough', label: 'I have a CRM, but I don’t use it consistently', detail: 'The software exists. The habit or setup has not stuck.' },
        { value: 'crm_working', label: 'I have a working CRM or follow-up process', detail: 'Interested people have a dependable place to go.' },
        { value: 'team', label: 'A team member handles it', detail: 'The next question is whether everyone can see the same information.' },
        { value: 'unknown', label: 'Honestly, I’m not sure where everything goes', detail: 'If you cannot find it quickly, visibility needs work.' }
      ]
    },
    {
      id: 'symptom',
      kicker: 'WHAT YOU NOTICE',
      title: 'Which of these feels most familiar?',
      note: 'Choose the problem you can see happening now.',
      answers: [
        { value: 'message', label: 'People do not understand what I offer', detail: 'Rewrite the message on the current site before replacing the software.' },
        { value: 'conversion', label: 'People visit, but rarely take the next step', detail: 'The page or inquiry process may be making the next step too hard.' },
        { value: 'scattered', label: 'Inquiries arrive in too many different places', detail: 'Important context is spread across inboxes, messages, notes, or tools.' },
        { value: 'followup', label: 'Follow-up is slower or less consistent than it should be', detail: 'Interested people can cool off before the next response.' },
        { value: 'admin', label: 'I repeat the same emails and admin work constantly', detail: 'A proven repeated task may finally deserve automation.' },
        { value: 'disconnected', label: 'My tools do not share information properly', detail: 'Moving information between systems is becoming part of the job.' },
        { value: 'early', label: 'I’m too early to know what is broken', detail: 'We will build only the minimum needed to learn.' },
        { value: 'planning', label: 'Nothing is obviously broken. I’m preparing for growth', detail: 'We will avoid replacing things without a measured reason.' }
      ]
    },
    {
      id: 'involvement',
      kicker: 'YOUR RELATIONSHIP WITH TECH',
      title: 'How involved do you want to be with the technology?',
      answers: [
        { value: 'simple', label: 'Give me the simplest thing I can manage myself', detail: 'I do not want the software to become another job.' },
        { value: 'learn', label: 'I’m willing to learn if the payoff is worth it', detail: 'A moderate learning curve is fine when the reason is clear.' },
        { value: 'setup', label: 'I can manage it after someone sets it up correctly', detail: 'I want the system built around my business before I take over.' },
        { value: 'team', label: 'Someone on my team can own it', detail: 'One person can be responsible for data, workflows, and upkeep.' },
        { value: 'dfy', label: 'I want someone else to build and connect it', detail: 'My time is better spent selling, delivering, or running the business.' },
        { value: 'unknown', label: 'I’m not sure', detail: 'We will show the ownership tradeoff in the result.' }
      ]
    },
    {
      id: 'goal',
      kicker: 'THE NEXT 90 DAYS',
      title: 'What would you most like to have working?',
      answers: [
        { value: 'first', label: 'Get my first customers', detail: 'Create one credible path from discovery to conversation.' },
        { value: 'inquiries', label: 'Turn more visitors into inquiries', detail: 'Make the offer and next step easier to understand and complete.' },
        { value: 'faster', label: 'Respond to interested people faster', detail: 'Reduce the delay between interest and the first useful response.' },
        { value: 'track', label: 'Stop losing track of opportunities', detail: 'See every active conversation and its next action.' },
        { value: 'sell', label: 'Sell and deliver something automatically', detail: 'Let payment, access, and follow-up happen without manual delivery.' },
        { value: 'time', label: 'Reduce repetitive admin', detail: 'Give repeated work back to the system after the process is clear.' },
        { value: 'team', label: 'Give my team one process to follow', detail: 'Give the team one shared process and one place to see it.' },
        { value: 'unknown', label: 'I need help identifying the priority', detail: 'StackBrief will show you where to start.' }
      ]
    }
  ];

  const homebaseAnswers = [
    { value: 'none', label: 'I do not have a real website yet', detail: 'Social profiles or word of mouth may be doing the job for now.' },
    { value: 'social', label: 'A social profile or link page', detail: 'Most people see a lightweight mobile-first page.' },
    { value: 'wix', label: 'Wix, Squarespace, or another website builder', detail: 'I use a hosted click-and-drag platform.' },
    { value: 'wordpress', label: 'WordPress', detail: 'My site uses hosting, a theme, and plugins.' },
    { value: 'other', label: 'A custom site or something else', detail: 'It does not fit the common builder options.' },
    { value: 'unknown', label: 'I’m not sure what it was built with', detail: 'StackBrief can still decide what the site needs to do.' }
  ];

  const routeQuestions = {
    starter: [
      {
        id: 'offer', kicker: 'WHAT YOU ARE BUILDING', title: 'What are you planning to offer first?', answers: [
          { value: 'service', label: 'A service, consulting, or coaching', detail: 'Most sales will begin with a conversation or booking.' },
          { value: 'digital', label: 'Downloads, courses, or other digital products', detail: 'People should be able to pay and receive something automatically.' },
          { value: 'hybrid', label: 'Services plus products, events, or memberships', detail: 'The website may need to support more than one kind of transaction.' },
          { value: 'content', label: 'Content that people can find over time', detail: 'Searchable articles, resources, or education are central to the plan.' },
          { value: 'unknown', label: 'I’m still figuring that out', detail: 'We will avoid locking you into a complicated platform.' }
        ]
      },
      { id: 'homebase', kicker: 'YOUR CURRENT HOME BASE', title: 'What are you currently using online?', answers: homebaseAnswers }
    ],
    working: [
      {
        id: 'volume', kicker: 'A NORMAL MONTH', title: 'About how many people show real interest in working with you?', note: 'An inquiry, application, booking, or serious direct message counts. Website visitors do not.', answers: [
          { value: 'sporadic', label: 'Some months none, some months a few', detail: 'There is not a dependable normal month yet.' },
          { value: 'low', label: 'About 1 to 4', detail: 'One person can usually see every active opportunity.' },
          { value: 'medium', label: 'About 5 to 20', detail: 'A lightweight pipeline can prevent good opportunities from going cold.' },
          { value: 'high', label: 'More than 20', detail: 'Manual routing and follow-up may now carry a real cost.' },
          { value: 'unknown', label: 'I do not track this yet', detail: 'Start counting this for the next 30 days.' }
        ]
      },
      { id: 'homebase', kicker: 'YOUR CURRENT HOME BASE', title: 'Where do interested people go to learn more?', answers: homebaseAnswers }
    ],
    growth: [
      {
        id: 'volume', kicker: 'QUALIFIED DEMAND', title: 'How many serious inquiries or sales opportunities enter the business in a typical month?', answers: [
          { value: 'low', label: 'Fewer than 5', detail: 'Complexity may come from deal value or handoffs rather than volume.' },
          { value: 'medium', label: 'About 5 to 20', detail: 'Pipeline discipline and response speed can materially affect results.' },
          { value: 'high', label: 'More than 20', detail: 'Routing, ownership, and automation may now justify their cost.' },
          { value: 'unknown', label: 'We do not have a dependable count', detail: 'Start with a dependable count.' }
        ]
      },
      {
        id: 'handoffs', kicker: 'OWNERSHIP + HANDOFFS', title: 'How many people touch an opportunity before it becomes a customer?', answers: [
          { value: 'solo', label: 'Only me', detail: 'The system should remove memory work without creating team-level overhead.' },
          { value: 'helper', label: 'Me and one other person', detail: 'Both people need the same context and a clear next action.' },
          { value: 'several', label: 'Several people or departments', detail: 'Ownership, permissions, and stage definitions now matter.' },
          { value: 'system', label: 'We already have a defined process', detail: 'The decision is whether the current system supports it reliably.' },
          { value: 'unknown', label: 'It changes or is not clearly defined', detail: 'Choose one owner before adding automation.' }
        ]
      }
    ]
  };

  const establishedQuestions = [
    {
      id: 'value', kicker: 'WHAT ONE CLIENT IS WORTH', title: 'What is one normal new client worth in the first 90 days?',
      note: 'Use a normal engagement, not the biggest contract you have ever sold.', answers: [
        { value: 'under2', label: 'Under $2,000', detail: 'A paid build may be difficult to justify from one preventable loss.' },
        { value: '2to5', label: '$2,000 to $4,999', detail: 'The leak needs enough volume or repeated admin cost to justify a larger fix.' },
        { value: '5to10', label: '$5,000 to $9,999', detail: 'One preventable loss could outweigh normal setup and software cost.' },
        { value: '10to25', label: '$10,000 to $24,999', detail: 'Track every active opportunity and its next step.' },
        { value: '25plus', label: '$25,000 or more', detail: 'A few stalled opportunities can put a large amount of revenue on hold.' },
        { value: 'unknown', label: 'I do not know', detail: 'Work out this number before buying a large system.' }
      ]
    },
    {
      id: 'volume', kicker: 'REAL DEMAND', title: 'How many good-fit prospects raise their hands in a normal month?',
      note: 'Count serious inquiries, applications, bookings, or referrals. Do not count website visitors.', answers: [
        { value: 'low', label: '1 to 4', detail: 'One person may still be able to see every live opportunity.' },
        { value: 'medium', label: '5 to 20', detail: 'A clear list and follow-up schedule can now affect meaningful revenue.' },
        { value: 'high', label: 'More than 20', detail: 'Routing, ownership, and response time deserve measurement every week.' },
        { value: 'unknown', label: 'I do not track this', detail: 'Start counting serious inquiries each month.' }
      ]
    },
    {
      id: 'stall', kicker: 'ONE REAL EPISODE', title: 'Think of the last strong prospect who went quiet. Where did momentum stop?',
      note: 'Concrete recall is more useful than rating the process in general.', answers: [
        { value: 'inquiry', label: 'After the first inquiry or referral', detail: 'The first useful response may have been late, vague, or missing.' },
        { value: 'booking', label: 'During qualification or booking', detail: 'The path to a useful conversation may be asking too much or giving too little.' },
        { value: 'aftercall', label: 'After the first call', detail: 'The next action may not have had one owner and one date.' },
        { value: 'proposal', label: 'After the proposal', detail: 'The decision was left open without a defined follow-up path.' },
        { value: 'nurture', label: 'They were interested, but not ready yet', detail: 'A real opportunity may have been treated as a final no.' },
        { value: 'handoff', label: 'During an internal handoff', detail: 'Context or ownership disappeared between people or tools.' },
        { value: 'unknown', label: 'I cannot reconstruct what happened', detail: 'Your system should let you find this answer.' }
      ]
    },
    {
      id: 'response', kicker: 'FIRST RESPONSE', title: 'How quickly does a new inquiry receive a useful human response?',
      answers: [
        { value: 'hour', label: 'Usually within one hour', detail: 'Response time is probably working well enough.' },
        { value: 'day', label: 'Usually the same business day', detail: 'The response habit is reasonably strong.' },
        { value: 'nextday', label: 'Usually the next business day', detail: 'Some buyers may already be in another conversation.' },
        { value: 'longer', label: 'Two days or longer', detail: 'Measure this delay for the next 14 days.' },
        { value: 'unknown', label: 'I do not track it', detail: 'Measure before claiming response time is fine.' }
      ]
    },
    {
      id: 'visible', kicker: 'OPEN OPPORTUNITIES', title: 'Can you list every open opportunity and its next action in 60 seconds?',
      answers: [
        { value: 'yes', label: 'Yes, from one dependable place', detail: 'The current list is easy to scan and update.' },
        { value: 'mostly', label: 'Mostly, after checking a few places', detail: 'The system works, but context is beginning to scatter.' },
        { value: 'no', label: 'No, some of it lives in memory or inboxes', detail: 'Some active opportunities are hard to find.' },
        { value: 'unknown', label: 'I am not sure what counts as open', detail: 'Define what “open” means before choosing software.' }
      ]
    },
    {
      id: 'owner', kicker: 'NEXT-STEP OWNERSHIP', title: 'Who owns the next step after a call or proposal?',
      answers: [
        { value: 'explicit', label: 'One named person with a date', detail: 'Ownership is explicit and testable.' },
        { value: 'memory', label: 'Usually me, when I remember', detail: 'Follow-up stops when your attention moves elsewhere.' },
        { value: 'shared', label: 'It depends on who is available', detail: 'Shared responsibility may mean nobody owns the deadline.' },
        { value: 'system', label: 'The process assigns it automatically', detail: 'The system may already handle ownership reliably.' },
        { value: 'unknown', label: 'It is not clearly defined', detail: 'Ownership should be resolved before deeper automation.' }
      ]
    },
    {
      id: 'noresponse', kicker: 'WHEN THEY DO NOT REPLY', title: 'What happens when a good-fit prospect does not answer?',
      answers: [
        { value: 'sequence', label: 'A defined follow-up sequence runs', detail: 'Follow-up keeps moving without relying on memory.' },
        { value: 'once', label: 'I follow up once', detail: 'Some decisions may need more context or timing.' },
        { value: 'adhoc', label: 'I follow up when I remember', detail: 'Timing depends on attention rather than a visible process.' },
        { value: 'none', label: 'Usually nothing', detail: 'Silence is being treated as a final decision.' },
        { value: 'unknown', label: 'It varies too much to say', detail: 'The process cannot be measured consistently yet.' }
      ]
    },
    {
      id: 'involvement', kicker: 'WHO SHOULD RUN THE FIX', title: 'How do you want the first fix handled?',
      answers: [
        { value: 'simple', label: 'Give me the test. I will run it myself', detail: 'The plan needs to be simple enough to run yourself.' },
        { value: 'learn', label: 'I will build it if the reason is clear', detail: 'A defined process and moderate setup are acceptable.' },
        { value: 'setup', label: 'Set it up correctly, then hand it to me', detail: 'The system needs an experienced first build and a clear handoff.' },
        { value: 'team', label: 'Someone on my team will own it', detail: 'Ownership can be named before implementation.' },
        { value: 'dfy', label: 'Build and connect it for us', detail: 'Your time is better spent selling, delivering, or leading.' },
        { value: 'unknown', label: 'I need to see the problem first', detail: 'Choose who owns the fix after the first problem is clear.' }
      ]
    }
  ];

  const plans = {
    essentials: {
      code: '01', label: 'STACK 01 // ESSENTIALS', title: 'Make the next step obvious',
      reason: 'Start with one clear path from interest to action, then track every real conversation in one place.',
      doNow: ['Give the website one job', 'Give interested people one useful next step', 'Track every active conversation in one place'],
      later: ['Add a CRM when opportunities become hard to scan', 'Automate only after the same task repeats reliably'],
      skip: ['An all-in-one platform without an owner', 'A large stack before consistent demand', 'Features purchased for a future business']
    },
    pipeline: {
      code: '02', label: 'STACK 02 // RELIABLE PIPELINE', title: 'Stop relying on memory',
      reason: 'You have enough real inquiries to need one visible list and scheduled follow-up. Put every opportunity in one place and make the first response hard to miss.',
      doNow: ['Send every inquiry to one dependable destination', 'Keep one visible pipeline', 'Make the first follow-up automatic or impossible to forget'],
      later: ['Connect proposal, payment, and onboarding', 'Add source and close-rate reporting'],
      skip: ['A second place to track the same leads', 'Automating every task', 'Migrating without a measured reason']
    },
    growth: {
      code: '03', label: 'STACK 03 // CONNECTED GROWTH', title: 'Connect the handoffs',
      reason: 'More than one tool or person touches each opportunity now. Give every lead one visible record, one owner, and one next step before adding more automation.',
      doNow: ['Give one person ownership of the system', 'Connect capture, CRM, and follow-up', 'Measure response time and movement between stages'],
      later: ['Add long-term nurture', 'Build permissions, exceptions, and deeper reporting'],
      skip: ['An ownerless all-in-one platform', 'Rebuilding everything at once', 'Automation nobody knows how to fix']
    }
  };

  const state = {
    index: 0,
    answers: {},
    startedAt: new Date().toISOString(),
    completedAt: '',
    briefId: '',
    wasCompleted: false
  };

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function routeKey() {
    const value = state.answers.stage?.value;
    if (['idea', 'first'].includes(value)) return 'starter';
    if (value === 'growth') return 'growth';
    return 'working';
  }

  function questionFlow() {
    if (!state.answers.stage) return [commonQuestions[0], ...establishedQuestions];
    if (routeKey() === 'starter') return [...commonQuestions, ...routeQuestions.starter];
    return [commonQuestions[0], ...establishedQuestions];
  }

  function persistSession(completed = false) {
    funnel?.saveQuizSession({
      rulesetVersion,
      index: state.index,
      answers: state.answers,
      startedAt: state.startedAt,
      completedAt: state.completedAt,
      briefId: state.briefId,
      completed
    });
  }

  async function copyText(value, button) {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    const original = button.textContent;
    button.textContent = 'Brief copied';
    window.setTimeout(() => { button.textContent = original; }, 1800);
  }

  function updateProgress() {
    const flow = questionFlow();
    const current = Math.min(state.index + 1, flow.length);
    progress.style.width = `${(state.index / flow.length) * 100}%`;
    progressLabel.textContent = `QUESTION ${String(current).padStart(2, '0')} / ${String(flow.length).padStart(2, '0')}`;
  }

  function renderQuestion() {
    quiz.classList.remove('is-processing', 'has-result');
    const flow = questionFlow();
    const question = flow[state.index];
    updateProgress();
    stage.innerHTML = `
      <div class="question-count">${String(state.index + 1).padStart(2, '0')}</div>
      <h2 class="question-title">${escapeHtml(question.title)}</h2>
      <p class="question-kicker">${escapeHtml(question.kicker)}</p>
      ${question.note ? `<p class="question-note">${escapeHtml(question.note)}</p>` : ''}
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
        if (question.id === 'stage') state.answers = { stage: answer };
        else state.answers[question.id] = answer;
        state.index += 1;
        persistSession(false);
        funnel?.track('quiz_answered', {
          rulesetVersion,
          questionId: question.id,
          answer: answer.value,
          questionNumber: state.index,
          route: routeKey()
        });
        if (state.index < questionFlow().length) renderQuestion();
        else renderAnalysis();
      });
    });

    const back = stage.querySelector('[data-back]');
    if (back) back.addEventListener('click', () => {
      state.index -= 1;
      renderQuestion();
    });
  }

  function pickPlan() {
    const answer = (id) => state.answers[id]?.value;
    if (routeKey() !== 'starter') {
      const connectedSignal = answer('volume') === 'high'
        && (['handoff'].includes(answer('stall')) || ['shared', 'unknown'].includes(answer('owner')) || answer('visible') === 'no');
      const pipelineSignal = ['medium', 'high'].includes(answer('volume'))
        || ['no', 'unknown'].includes(answer('visible'))
        || ['memory', 'shared', 'unknown'].includes(answer('owner'))
        || ['adhoc', 'none', 'unknown'].includes(answer('noresponse'));
      if (connectedSignal) return 'growth';
      if (pipelineSignal) return 'pipeline';
      return 'essentials';
    }
    const growthSignal = routeKey() === 'growth'
      && (answer('volume') === 'high' || ['admin', 'disconnected', 'followup'].includes(answer('symptom')))
      && ['team', 'dfy', 'setup'].includes(answer('involvement'));
    const pipelineSignal = ['medium', 'high'].includes(answer('volume'))
      || ['scattered', 'followup', 'admin', 'disconnected'].includes(answer('symptom'))
      || ['crm_rough', 'team'].includes(answer('current'))
      || ['track', 'faster', 'team', 'time'].includes(answer('goal'));
    if (growthSignal) return 'growth';
    if (pipelineSignal) return 'pipeline';
    return 'essentials';
  }

  function pickConstraint() {
    const answer = (id) => state.answers[id]?.value;
    const label = (id) => state.answers[id]?.label || 'Not answered';
    let key = 'measurement';

    if (answer('stall') === 'inquiry' || ['longer', 'unknown'].includes(answer('response'))) key = 'response';
    if (answer('stall') === 'booking') key = 'booking';
    if (['aftercall', 'proposal', 'nurture'].includes(answer('stall')) || answer('visible') === 'no') key = 'visibility';
    if (answer('stall') === 'handoff' || ['shared', 'unknown'].includes(answer('owner'))) key = 'ownership';
    if (answer('stall') === 'unknown' || answer('visible') === 'unknown') key = 'measurement';

    const constraints = {
      response: {
        label: 'FIRST FIX // RESPONSE DELAY',
        title: 'Good-fit interest is waiting too long for a useful human response.',
        reason: 'New inquiries are waiting too long for a useful response. Give each one a next step and a named owner, then measure the change for 14 days.',
        unproven: 'Track whether faster responses produce more qualified conversations before rebuilding the website.',
        fix: ['Route every serious inquiry to one visible destination', 'Set a deadline for the first useful human response', 'Name the person who owns the next action', 'Record what happened after the response'],
        measures: ['Median first useful response time', 'Inquiries with an owner and next action', 'Qualified conversations started', 'Inquiries with no recorded outcome'],
        skip: ['A full website rebuild', 'Long nurture automation', 'A second lead source'],
        upgrade: 'Upgrade when volume makes the response deadline unreliable or more than one person needs the same inquiry context.'
      },
      booking: {
        label: 'FIRST FIX // QUALIFICATION PATH',
        title: 'The path from interest to a useful conversation is losing momentum.',
        reason: 'Prospects are stalling before or during booking. Check whether the questions, scheduling step, or missing context asks for too much too soon.',
        unproven: 'Check the current path before replacing the calendar, form, or traffic source.',
        fix: ['Choose the one useful next step for a good-fit buyer', 'Remove questions that do not change the decision', 'Explain what happens after submission', 'Track started, completed, booked, and attended separately'],
        measures: ['Started-to-completed inquiry rate', 'Completed-to-booked rate', 'Booking no-show rate', 'Time from inquiry to confirmed next step'],
        skip: ['A generic contact form', 'More form fields for curiosity', 'A CRM migration before the path is tested'],
        upgrade: 'Upgrade when qualification rules are stable and manual routing repeatedly delays the next step.'
      },
      visibility: {
        label: 'FIRST FIX // OPEN OPPORTUNITIES',
        title: 'Active opportunities become unreliable once they leave the conversation.',
        reason: 'You cannot see every open opportunity, follow-up, and post-call next step from one dependable place.',
        unproven: 'Run the 14-day test before buying a CRM, rebuilding the website, or adding automation.',
        fix: ['Put every active opportunity in one view', 'Require an owner, stage, next action, and next-action date', 'Review opportunities with no next action twice per week', 'Record a final outcome instead of letting deals disappear'],
        measures: ['Active opportunities with a next action and date', 'Median first-response time', 'Stalled conversations reopened', 'Qualified opportunities with no recorded outcome'],
        skip: ['A website rebuild', 'Omnichannel automation', 'A larger CRM before the current process is used consistently'],
        upgrade: 'Upgrade when more than one person needs the same context, opportunities become difficult to scan, or the proven follow-up process can no longer be executed manually.'
      },
      ownership: {
        label: 'FIRST FIX // HANDOFF OWNERSHIP',
        title: 'The next step loses an owner when the opportunity changes hands.',
        reason: 'The next step loses an owner when people or tools hand off the opportunity. Give each handoff one person and one deadline.',
        unproven: 'Start with a clear handoff rule. Add automation only if people cannot keep the rule at the current volume.',
        fix: ['Name one owner at every stage', 'Require a next action and deadline before a handoff closes', 'Keep the full context in one visible record', 'Create an exception queue for anything the normal path cannot route'],
        measures: ['Handoffs with a named owner', 'Handoffs with a next-action date', 'Time between stages', 'Opportunities returned for missing context'],
        skip: ['Ownerless automation', 'Rebuilding every tool at once', 'A platform nobody is accountable for'],
        upgrade: 'Upgrade when the handoff rule works manually but volume or permissions make execution unreliable.'
      },
      measurement: {
        label: 'FIRST FIX // MISSING RECORDS',
        title: 'The business cannot yet reconstruct where good-fit opportunities stop moving.',
        reason: 'Trace the last 10 opportunities from first interest to a recorded outcome before buying software.',
        unproven: 'A leak may exist, but the records are too incomplete to show where it happens.',
        fix: ['List the last 10 good-fit prospects', 'Record first response, owner, stage, next action, and outcome', 'Mark where momentum stopped', 'Review the pattern before choosing a tool'],
        measures: ['Opportunities with a complete history', 'Opportunities with a recorded outcome', 'First-response time', 'Most common point of stall'],
        skip: ['A revenue-at-risk forecast', 'A platform comparison', 'Automation based on an assumed bottleneck'],
        upgrade: 'Upgrade only after the same failure appears often enough that a tool can remove a measured cost.'
      }
    };

    const constraint = { key, ...constraints[key] };
    constraint.evidence = [
      `Normal client value: ${label('value')}`,
      `Good-fit prospects per month: ${label('volume')}`,
      `Last strong prospect stalled: ${label('stall')}`,
      `First useful response: ${label('response')}`,
      `Open opportunities: ${label('visible')}`,
      `Next-step owner: ${label('owner')}`
    ];
    return constraint;
  }

  function baseRecommendation(overrides) {
    return {
      status: 'DO NOW', commercial: 'DIRECT PRODUCT LINK',
      noBuy: 'Keep the current tool if it already performs this job reliably.',
      experience: 'This choice comes from the answers in your brief.',
      sourceLabel: 'Verify current facts', ...overrides
    };
  }

  function recommendProduct(key, overrides) {
    const product = productCatalog[key];
    if (!product) throw new Error(`Missing StackBrief catalog product: ${key}`);
    return baseRecommendation({
      product: product.name,
      cost: product.cost,
      experience: product.experience,
      url: product.url,
      sourceUrl: product.sourceUrl,
      commercial: product.commercial,
      ...overrides
    });
  }

  function pickWebsite() {
    const answer = (id) => state.answers[id]?.value;
    const homebase = answer('homebase');
    const tooUnclearToChoose = answer('nextstep') === 'unknown'
      && answer('channel') === 'unknown'
      && (!homebase || homebase === 'unknown');
    const existingFit = (homebase === 'wordpress' && answer('channel') === 'search')
      || (homebase === 'wix' && answer('nextstep') === 'multiple')
      || (homebase === 'social' && ['buy', 'list'].includes(answer('nextstep')));
    const noWebsiteProblem = routeKey() === 'growth' && !['message', 'conversion'].includes(answer('symptom'));
    const messageProblem = homebase && homebase !== 'none' && answer('symptom') === 'message';

    if (tooUnclearToChoose) {
      return baseRecommendation({
        layer: 'FRONT DOOR', product: 'Define the first customer path', status: 'PAUSE',
        summary: 'First decide how people will discover you and the one action they should take next. Then choose the website platform.',
        fit: 'Use a temporary page or current profile while testing the offer and customer path.',
        avoid: 'Do not let a platform’s feature list decide the business model for you.',
        cost: 'No platform purchase recommended', alternative: 'Revisit Wix, Beacons, or WordPress after the first path is clear.',
        noBuy: 'Buy nothing yet.', experience: 'Answer those two questions before you choose a platform.',
        url: '', sourceUrl: '', commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
      });
    }

    if (existingFit || noWebsiteProblem || messageProblem) {
      return baseRecommendation({
        layer: 'FRONT DOOR', product: 'Keep the current website', status: 'KEEP',
        summary: messageProblem ? 'Rewrite the promise and next step on the current site before considering a rebuild.' : 'Keep the current platform while you test the next fix.',
        fit: 'The current front door can be improved while preserving what already works.',
        avoid: 'Reconsider only when a measured limitation blocks conversion, publishing, delivery, or team ownership.',
        cost: 'No new platform cost', alternative: 'Run a focused conversion and handoff audit first.',
        noBuy: 'Keep the current website.', experience: 'The current site can stay while you test the earlier fix.',
        url: '', sourceUrl: '', commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
      });
    }

    if (['buy', 'list'].includes(answer('nextstep')) || (routeKey() === 'starter' && answer('channel') === 'social')) {
      return recommendProduct('beacons', {
        layer: 'FRONT DOOR',
        summary: 'A social-first page, digital delivery, selling, and email follow-up can live in one lightweight system.',
        fit: 'Best when traffic begins on social or the first offer needs simple payment and automatic delivery.',
        avoid: 'Avoid as the primary home when searchable long-form content or a desktop-first experience drives acquisition.',
        alternative: 'Wix if the business needs a broader hybrid website.',
        noBuy: 'Keep the current link page if it already captures and follows up with buyers.',
      });
    }

    if (answer('channel') === 'search' || answer('offer') === 'content') {
      return recommendProduct('wordpressElementor', {
        layer: 'FRONT DOOR',
        summary: 'This combination offers publishing control and a visual editing layer for a content-led site.',
        fit: 'Best when organic content, ownership, and design flexibility justify ongoing maintenance.',
        avoid: 'Avoid when nobody will manage hosting, updates, plugins, security, and performance.',
        alternative: 'Wix if you want less maintenance and can give up some publishing control.',
        noBuy: 'Keep the existing site until it stops you from publishing the content you need.',
      });
    }

    return recommendProduct('wix', {
      layer: 'FRONT DOOR',
      summary: 'Wix is the strongest fit here because the business needs a clear website with useful functions and a manageable learning curve.',
      fit: 'Best for service businesses using bookings, events, content, memberships, donations, or moderate commerce.',
      avoid: 'Avoid when maximum design control matters more than convenience. Complex layouts still deserve a manual mobile review.',
      alternative: 'Beacons for social-first selling; WordPress + Elementor for content control.',
      noBuy: 'Do not migrate if the existing builder already supports the required jobs without workarounds.',
    });
  }

  function pickInquiry(website) {
    const answer = (id) => state.answers[id]?.value;
    const nativePlatform = ['Beacons', 'Wix', 'WordPress + Elementor'].includes(website.product);
    const captureProblem = ['conversion', 'scattered'].includes(answer('symptom')) || answer('nextstep') === 'qualify';

    if (website.status === 'PAUSE') {
      return baseRecommendation({
        layer: 'INQUIRY ROUTE', product: 'Choose one next action', status: 'PAUSE',
        summary: 'A form tool cannot be selected until you know whether the visitor should contact, book, apply, buy, or join a list.',
        fit: 'Write the first customer path in plain language before configuring software.',
        avoid: 'Do not build a generic contact form just to make the page feel complete.',
        cost: 'No form purchase recommended', alternative: 'Use direct email or messages temporarily while learning what people ask for.',
        noBuy: 'Buy nothing yet.', experience: 'Choose the form’s job before choosing its vendor.',
        url: '', sourceUrl: '', commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
      });
    }

    if (nativePlatform && !captureProblem) {
      return baseRecommendation({
        layer: 'INQUIRY ROUTE', product: `${website.product} native capture`, status: 'USE WHAT YOU HAVE',
        summary: 'Keep capture inside the selected platform first. Add another form product only when a specific routing limitation appears.',
        fit: 'Use clear choices that let visitors identify why they are reaching out.',
        avoid: 'Do not send every visitor into one unrestricted “contact us” message box.',
        cost: 'Included within the selected platform and plan limits', alternative: 'Formspree if a custom form becomes necessary.',
        noBuy: 'No additional form subscription is justified yet.', experience: `Expansion Works has implemented structured capture inside ${website.product} workflows.`,
        url: '', sourceUrl: website.sourceUrl, commercial: 'INCLUDED WITH THE WEBSITE PLATFORM'
      });
    }

    if (!captureProblem && ['crm_working', 'team'].includes(answer('current'))) {
      return baseRecommendation({
        layer: 'INQUIRY ROUTE', product: 'Keep the current capture tool', status: 'KEEP',
        summary: 'Keep the current form while submissions reach the right person and system.', fit: 'Keep it while submissions reach the correct person and system reliably.',
        avoid: 'Change only if routing, qualification, spam, or response time is measurably failing.', cost: 'No new tool cost',
        alternative: 'Restructure the questions before replacing the backend.', noBuy: 'Keep the current form.',
        experience: 'Question structure and routing can improve without changing vendors.', url: '', sourceUrl: '', commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
      });
    }

    return recommendProduct('formspree', {
      layer: 'INQUIRY ROUTE',
      summary: 'Formspree supplies a lightweight backend for a structured custom form without forcing a full CRM or server build.',
      fit: 'Best when you control the page and want inquiries delivered reliably with purposeful fields.',
      avoid: 'Avoid adding it when the current builder or CRM already handles forms and routing well.',
      alternative: 'Use the website platform’s native form when it supports the required routing.',
      noBuy: 'Use the existing form if it supports structured choices and dependable delivery.',
    });
  }

  function pickPipeline(planKey) {
    const answer = (id) => state.answers[id]?.value;
    const highLevelEligible = planKey === 'growth' && answer('volume') === 'high'
      && ['team', 'dfy'].includes(answer('involvement'))
      && ['admin', 'disconnected', 'followup'].includes(answer('symptom'))
      && ['several', 'system'].includes(answer('handoffs'));
    const currentCRMIsEnough = answer('current') === 'crm_working'
      && !['scattered', 'followup', 'admin', 'disconnected'].includes(answer('symptom'));

    if (currentCRMIsEnough) {
      return baseRecommendation({
        layer: 'PIPELINE + FOLLOW-UP', product: 'Keep the current CRM', status: 'KEEP',
        summary: 'Keep the current CRM. Fix the earlier problem before considering a migration.',
        fit: 'Keep the current CRM while improving the message, offer path, or measurement.',
        avoid: 'Do not use a new platform as a substitute for a process decision.', cost: 'No migration cost',
        alternative: 'Audit stages and response time before comparing vendors.', noBuy: 'Keep the current CRM.',
        experience: 'No CRM migration is justified by the answers provided.', url: '', sourceUrl: '', commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
      });
    }

    if (highLevelEligible) {
      return recommendProduct('highLevel', {
        layer: 'PIPELINE + FOLLOW-UP',
        summary: 'Your volume, repeated workflow, and named owner can justify one platform for the pipeline, messaging, calendars, and automation.',
        fit: 'Best when one owner can maintain CRM data, routing, campaigns, agents, calendars, and workflow exceptions.',
        avoid: 'Do not buy it when nobody owns the system or fewer tools can handle the proven workflow.',
        alternative: 'HubSpot when you need a dependable CRM without the wider automation workload.',
        noBuy: 'Keep the current stack if the manual cost has not been measured.',
      });
    }

    if (['pipeline', 'growth'].includes(planKey)) {
      return recommendProduct('hubspot', {
        layer: 'PIPELINE + FOLLOW-UP',
        summary: 'Use one visible pipeline without taking on HighLevel’s wider setup and maintenance.',
        fit: 'Best for centralizing contacts, deals, tasks, meeting links, and basic email tracking before advanced automation.',
        avoid: 'Avoid paid upgrades until a specific limit blocks a valuable repeated process.',
        alternative: 'HighLevel later if volume grows and a dedicated operator owns broader automation.',
        noBuy: 'A disciplined spreadsheet still wins when one person can see every active opportunity.',
      });
    }

    return recommendProduct('sheetsGmail', {
      layer: 'PIPELINE + FOLLOW-UP', status: 'START SCRAPPY',
      summary: 'At this stage, one clear list and a consistent follow-up habit matter more than buying a CRM.',
      fit: 'Best when one person can still scan every active opportunity in one simple view.',
      avoid: 'Upgrade when opportunities become hard to scan, more people need access, or follow-up repeatedly slips.',
      alternative: 'HubSpot Free CRM when active opportunities outgrow the sheet.', noBuy: 'Do not buy CRM software yet.',
    });
  }

  function recommendationCard(item) {
    const productLink = item.url
      ? `<a class="product-cta" href="${escapeHtml(item.url)}" target="_blank" rel="${item.commercial.startsWith('REFERRAL') ? 'sponsored noopener' : 'noopener'}" data-product-link data-product="${escapeHtml(item.product)}" data-layer="${escapeHtml(item.layer)}">Visit ${escapeHtml(item.product)} <span aria-hidden="true">↗</span></a>` : '';
    const sourceLink = item.sourceUrl
      ? `<a class="source-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(item.sourceLabel)} <span aria-hidden="true">↗</span></a>` : '';
    return `
      <article class="product-decision">
        <div class="product-decision-topline"><span>${escapeHtml(item.layer)}</span><b>${escapeHtml(item.status)}</b></div>
        <h4>${escapeHtml(item.product)}</h4>
        <p class="product-summary">${escapeHtml(item.summary)}</p>
        <dl>
          <div><dt>WHY THIS FITS</dt><dd>${escapeHtml(item.fit)}</dd></div>
          <div><dt>WHEN IT BECOMES WRONG</dt><dd>${escapeHtml(item.avoid)}</dd></div>
          <div><dt>WHAT IT COSTS NOW</dt><dd>${escapeHtml(item.cost)}</dd></div>
          <div><dt>WHY I WOULD USE IT HERE</dt><dd>${escapeHtml(item.experience)}</dd></div>
          <div><dt>NEXT BEST OPTION</dt><dd>${escapeHtml(item.alternative)}</dd></div>
          <div><dt>KEEP WHAT YOU HAVE IF...</dt><dd>${escapeHtml(item.noBuy)}</dd></div>
        </dl>
        <div class="product-meta"><span>FACTS CHECKED ${escapeHtml(verifiedDate.toUpperCase())}</span><span>${escapeHtml(item.commercial)}</span></div>
        <div class="product-links">${productLink}${sourceLink}</div>
      </article>`;
  }

  function list(items) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function renderAnalysis() {
    quiz.classList.add('is-processing');
    progress.style.width = '100%';
    progressLabel.textContent = 'BUILDING YOUR STACKBRIEF';
    const steps = [
      'Reading what is true in the business today…',
      'Finding the first place buyers stall…',
      'Checking whether the current tools can stay…',
      'Matching complexity to the person who will own it…',
      'Identifying what should remain manual…',
      'Putting the next decisions in order…'
    ];
    stage.innerHTML = `
      <div class="analysis-shell">
        <div class="analysis-orbit" aria-hidden="true"><span>XP</span><i></i><b></b></div>
        <h2>Turning your answers into a decision order.</h2>
        <p class="question-kicker">STACKBRIEF // ANALYSIS</p>
        <p class="analysis-message" data-analysis-message>${escapeHtml(steps[0])}</p>
        <div class="analysis-track"><i data-analysis-progress></i></div>
        <p class="analysis-truth">StackBrief is checking your answers against a fixed set of rules.</p>
      </div>`;
    const message = stage.querySelector('[data-analysis-message]');
    const meter = stage.querySelector('[data-analysis-progress]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delay = reducedMotion ? 90 : 560;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      meter.style.width = `${Math.min((index / steps.length) * 100, 100)}%`;
      if (index < steps.length) {
        message.textContent = steps[index];
      } else {
        window.clearInterval(timer);
        window.setTimeout(renderResult, reducedMotion ? 20 : 300);
      }
    }, delay);
  }

  function renderResult() {
    quiz.classList.remove('is-processing');
    quiz.classList.add('has-result');
    progress.style.width = '100%';
    progressLabel.textContent = 'INITIAL BRIEF COMPLETE';
    const planKey = pickPlan();
    const plan = plans[planKey];
    const established = routeKey() !== 'starter';
    const constraint = established ? pickConstraint() : null;
    const website = established ? null : pickWebsite();
    const recommendations = established ? [] : [website, pickInquiry(website), pickPipeline(planKey)];
    const flow = questionFlow();
    const recommendationSummary = recommendations.map((item) => `${item.layer}: ${item.product} (${item.status})`).join(' | ');
    const answerSummary = flow.map((question) => `${question.kicker}: ${state.answers[question.id].label}`).join(' | ');
    const summary = `${constraint?.label || plan.label} | ${recommendationSummary} | ${answerSummary}`;
    if (!state.briefId) state.briefId = funnel?.makeId('SBB') || `SBB-${Date.now().toString(36)}`;
    if (!state.completedAt) state.completedAt = new Date().toISOString();
    const portableBrief = established ? [
      `STACKBRIEF | ${constraint.label}`, constraint.title, constraint.reason, '',
      'WHAT YOUR ANSWERS POINT TO', ...constraint.evidence, '',
      'WHAT TO CHECK BEFORE YOU SPEND', constraint.unproven, '',
      'FIX IN THE NEXT 7 DAYS', ...constraint.fix.map((item) => `- ${item}`), '',
      'MEASURE FOR 14 DAYS', ...constraint.measures.map((item) => `- ${item}`), '',
      'DO NOT BUY YET', ...constraint.skip.map((item) => `- ${item}`), '',
      'UPGRADE WHEN', constraint.upgrade, '',
      'Generated at https://stackbriefxp.vercel.app/stackbrief',
      'This plan tells you what to test first. It cannot predict revenue.'
    ].join('\n') : [
      `STACKBRIEF | ${plan.label}`, plan.title, plan.reason, '',
      ...recommendations.flatMap((item) => [
        `${item.layer}: ${item.product} | ${item.status}`, `Why: ${item.summary}`, `Disqualifier: ${item.avoid}`,
        `No-buy path: ${item.noBuy}`, `Cost fact checked ${verifiedDate}: ${item.cost}`, ''
      ]),
      'Generated at https://stackbriefxp.vercel.app/stackbrief',
      'Verify current vendor prices, limits, and terms before purchasing.'
    ].join('\n');
    const answersRecord = Object.fromEntries(flow.map((question) => [question.id, {
      value: state.answers[question.id].value,
      label: state.answers[question.id].label
    }]));
    const resultData = {
      briefId: state.briefId,
      rulesetVersion,
      visitorId: funnel?.visitorId() || '',
      route: routeKey(),
      planKey,
      planTitle: constraint?.title || plan.title,
      constraint: constraint ? { key: constraint.key, label: constraint.label, title: constraint.title } : null,
      recommendations: recommendations.map((item) => ({ layer: item.layer, product: item.product, status: item.status })),
      answers: answersRecord,
      portableBrief,
      attribution: funnel?.attribution() || {},
      startedAt: state.startedAt,
      completedAt: state.completedAt
    };
    funnel?.saveResult(resultData);
    persistSession(true);
    if (!state.wasCompleted) {
      funnel?.track('quiz_completed', {
        briefId: state.briefId,
        rulesetVersion,
        route: routeKey(),
        planKey,
        goal: answersRecord.goal?.value || constraint?.key || '',
        implementationPreference: answersRecord.involvement?.value,
        products: resultData.recommendations.map((item) => item.product).join(' | ')
      });
      state.wasCompleted = true;
    }
    const valueQualified = ['5to10', '10to25', '25plus'].includes(state.answers.value?.value);
    const demandQualified = ['medium', 'high'].includes(state.answers.volume?.value);
    const painQualified = established && constraint.key !== 'measurement'
      && (['no', 'unknown'].includes(state.answers.visible?.value)
        || ['memory', 'shared', 'unknown'].includes(state.answers.owner?.value)
        || ['nextday', 'longer', 'unknown'].includes(state.answers.response?.value)
        || ['aftercall', 'proposal', 'nurture', 'handoff'].includes(state.answers.stall?.value));
    const paidFit = established && valueQualified && demandQualified && painQualified;
    const implementationTitle = paidFit
      ? 'Want me to turn this into the working version?'
      : 'Run the 14-day test before you hire anyone.';
    const implementationBody = paidFit
      ? 'Send me this brief and the last 90 days of lead movement. I’ll tell you whether I should build the full path, make a smaller repair, or tell you to keep the money.'
      : established
        ? 'Run the 14-day test first. If good-fit opportunities are still disappearing without an owner, next action, or recorded outcome, come back with the numbers.'
        : 'Prove one path from interest to conversation before paying for implementation. Use the tool decisions below and keep the system as small as the current demand.';
    const implementationCTA = paidFit ? 'Show me how you’d build this →' : 'Review the 14-day test →';
    const implementationHref = paidFit
      ? `/sales?from=stackbrief&brief=${encodeURIComponent(state.briefId)}&fit=${encodeURIComponent(planKey)}#apply`
      : '#diagnostic-evidence';

    const resultTier = constraint?.label || plan.label;
    const resultTitle = constraint?.title || plan.title;
    const resultReason = constraint?.reason || plan.reason;
    const actionGrid = established ? `
      <div class="result-block"><h4>FIX IN 7 DAYS</h4>${list(constraint.fix)}</div>
      <div class="result-block"><h4>MEASURE FOR 14 DAYS</h4>${list(constraint.measures)}</div>
      <div class="result-block"><h4>DO NOT BUY YET</h4>${list(constraint.skip)}</div>` : `
      <div class="result-block"><h4>DO NOW</h4>${list(plan.doNow)}</div>
      <div class="result-block"><h4>ADD LATER</h4>${list(plan.later)}</div>
      <div class="result-block"><h4>SKIP FOR NOW</h4>${list(plan.skip)}</div>`;
    const decisionDetail = established ? `
      <div class="diagnostic-evidence" id="diagnostic-evidence">
        <div class="product-brief-heading"><p>WHY THIS WAS YOUR RESULT</p><span>Based on the answers you gave</span></div>
        <article>
          <h4>What your answers point to</h4>
          ${list(constraint.evidence)}
        </article>
        <article>
          <h4>What to check before you spend money</h4>
          <p>${escapeHtml(constraint.unproven)}</p>
        </article>
        <article>
          <h4>What would justify an upgrade</h4>
          <p>${escapeHtml(constraint.upgrade)}</p>
        </article>
        <p class="legal-note">One normal client is worth ${escapeHtml(state.answers.value.label)} in the first 90 days. Use that number to judge the size of the problem. It is not a recovery forecast.</p>
      </div>` : `
      <div class="product-brief" id="diagnostic-evidence">
        <div class="product-brief-heading"><p>THE TOOL DECISIONS</p><span>Chosen from your answers before any affiliate link is considered</span></div>
        ${recommendations.map(recommendationCard).join('')}
        <p class="legal-note">Recommendations are educational. Verify current prices, limits, and terms with each vendor before purchasing.</p>
      </div>`;

    stage.innerHTML = `
      <div class="result-header">
        <div><p class="result-tier">${escapeHtml(resultTier)}</p><h2 class="result-title">${escapeHtml(resultTitle)}</h2></div>
        <div class="result-score" aria-label="Stack level ${plan.code}">${plan.code}</div>
      </div>
      <p class="result-reason">${escapeHtml(resultReason)}</p>
      <div class="result-grid">${actionGrid}</div>
      <section class="ascension-box ${paidFit ? 'is-qualified' : 'is-diy'}">
        <h3>${escapeHtml(implementationTitle)}</h3>
        <p>${escapeHtml(implementationBody)}</p>
        <div class="ascension-actions">
          <a class="button" href="${escapeHtml(implementationHref)}" ${paidFit ? 'data-dfy-link' : ''}>${escapeHtml(implementationCTA)}</a>
          <a href="#diagnostic-evidence">Review why StackBrief chose this</a>
        </div>
        <small>${paidFit ? 'This StackBrief goes with you. I will already have your answers and 14-day test.' : 'Run the test and bring back the numbers before paying anyone to automate the problem.'}</small>
      </section>
      ${decisionDetail}
      <div class="save-box">
        <h4>Want a second opinion before you spend?</h4>
        <p>Send me this StackBrief. During beta, I’ll review it myself and tell you what I would keep or change.</p>
        <form class="save-form" action="https://formspree.io/f/xeewjjlv" method="POST" data-save-form>
          <input type="email" name="email" autocomplete="email" placeholder="you@business.com" aria-label="Work email" required>
          <input type="hidden" name="source" value="StackBrief manual beta review">
          <input type="hidden" name="stackbrief_result" value="${escapeHtml(summary)}">
          <input type="hidden" name="stackbrief_id" value="${escapeHtml(state.briefId)}">
          <input type="hidden" name="stackbrief_ruleset" value="${escapeHtml(rulesetVersion)}">
          <input type="hidden" name="stackbrief_route" value="${escapeHtml(routeKey())}">
          <input type="hidden" name="stackbrief_level" value="${escapeHtml(planKey)}">
          <input type="hidden" name="stackbrief_goal" value="${escapeHtml(answersRecord.goal?.label || '')}">
          <input type="hidden" name="stackbrief_implementation_preference" value="${escapeHtml(answersRecord.involvement?.label || '')}">
          <input type="hidden" name="stackbrief_products" value="${escapeHtml(resultData.recommendations.map((item) => item.product).join(' | '))}">
          <input type="hidden" name="stackbrief_attribution" value="${escapeHtml(JSON.stringify(resultData.attribution))}">
          <input type="hidden" name="stackbrief_started_at" value="${escapeHtml(state.startedAt)}">
          <input type="hidden" name="stackbrief_completed_at" value="${escapeHtml(state.completedAt)}">
          <input type="hidden" name="_subject" value="New StackBrief beta review request">
          <button class="button" type="submit">Pressure-test my brief →</button>
        </form>
        <p class="form-status" data-form-status aria-live="polite"></p>
      </div>
      <div class="result-actions">
        <a href="/crm-or-spreadsheet-for-consultants">Find out if I need a CRM →</a>
        <button type="button" data-copy-brief>Copy my brief</button>
        <button type="button" data-restart>Retake the brief</button>
      </div>`;

    stage.querySelector('[data-restart]').addEventListener('click', () => {
      state.index = 0;
      state.answers = {};
      state.startedAt = new Date().toISOString();
      state.completedAt = '';
      state.briefId = '';
      state.wasCompleted = false;
      funnel?.clearQuizSession();
      funnel?.clearResult();
      funnel?.track('quiz_restarted', { rulesetVersion });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      renderQuestion();
    });
    const copyBrief = stage.querySelector('[data-copy-brief]');
    copyBrief.addEventListener('click', () => copyText(portableBrief, copyBrief));
    stage.querySelectorAll('[data-product-link]').forEach((link) => {
      link.addEventListener('click', () => {
        funnel?.track('recommendation_clicked', {
          briefId: state.briefId,
          planKey,
          product: link.dataset.product,
          layer: link.dataset.layer
        });
      });
    });
    const dfyLink = stage.querySelector('[data-dfy-link]');
    if (dfyLink) dfyLink.addEventListener('click', () => {
      funnel?.track('dfy_handoff_clicked', { briefId: state.briefId, planKey, route: routeKey(), constraint: constraint?.key || '' });
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
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Form submission failed');
        funnel?.track('lead_captured', { briefId: state.briefId, planKey, route: routeKey(), source: 'manual_beta_review' });
        form.innerHTML = '<p class="form-status">RECEIVED. I have your exact StackBrief and will review it manually.</p>';
      } catch (error) {
        status.textContent = 'That did not save. Try again or use the done-for-you page to contact me directly.';
        submit.disabled = false;
        submit.textContent = 'PRESSURE-TEST MY BRIEF →';
      }
    });
  }

  const savedSession = funnel?.getQuizSession();
  if (savedSession?.rulesetVersion === rulesetVersion && savedSession.answers && Number.isInteger(savedSession.index)) {
    state.answers = savedSession.answers;
    state.index = Math.min(savedSession.index, questionFlow().length);
    state.startedAt = savedSession.startedAt || state.startedAt;
    state.completedAt = savedSession.completedAt || '';
    state.briefId = savedSession.briefId || '';
    state.wasCompleted = Boolean(savedSession.completed);
    funnel?.track(savedSession.completed ? 'quiz_result_revisited' : 'quiz_resumed', {
      briefId: state.briefId,
      rulesetVersion,
      questionNumber: Math.min(state.index + 1, questionFlow().length),
      route: routeKey()
    });
  } else {
    funnel?.track('quiz_started', { rulesetVersion });
  }

  if (state.wasCompleted && state.index >= questionFlow().length) renderResult();
  else renderQuestion();
})();

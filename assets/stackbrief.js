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
  const verifiedDate = 'August 11, 2026';

  const questions = [
    {
      id: 'stage',
      kicker: 'BUSINESS STAGE',
      title: 'Which description is closest to the business right now?',
      answers: [
        { value: 'starting', score: 0, label: 'Starting or rebuilding', detail: 'The offer is still being proven or repositioned.' },
        { value: 'steady', score: 1, label: 'Selling, but inconsistent', detail: 'Clients exist, but the pipeline still depends heavily on you.' },
        { value: 'growing', score: 2, label: 'Past $100K and growing', detail: 'The offer works and operating gaps are becoming visible.' },
        { value: 'established', score: 3, label: 'Established and adding capacity', detail: 'Volume, handoffs, or team access now affect revenue.' }
      ]
    },
    {
      id: 'leads',
      kicker: 'MONTHLY LEAD FLOW',
      title: 'How many real inquiries enter the business in a typical month?',
      answers: [
        { value: 'low', score: 0, label: 'Fewer than 5', detail: 'Clarity and demand matter more than heavy automation.' },
        { value: 'medium', score: 1, label: 'About 5 to 20', detail: 'A lightweight pipeline can stop good opportunities going cold.' },
        { value: 'high', score: 3, label: 'More than 20', detail: 'Manual routing and follow-up may now carry a real cost.' }
      ]
    },
    {
      id: 'channel',
      kicker: 'DISCOVERY PATH',
      title: 'Where are your best prospects most likely to discover you?',
      answers: [
        { value: 'social', score: 0, label: 'Social media or a creator profile', detail: 'Most people arrive from a post, video, bio, or direct message.' },
        { value: 'search', score: 1, label: 'Search, articles, or educational content', detail: 'People need to find and evaluate useful information over time.' },
        { value: 'referral', score: 0, label: 'Referrals, networking, or outbound', detail: 'The site mostly validates trust and gives warm prospects a next step.' },
        { value: 'mixed', score: 1, label: 'A mix of channels', detail: 'The site must support several paths without becoming confusing.' }
      ]
    },
    {
      id: 'sitejob',
      kicker: 'WEBSITE JOB',
      title: 'What must the website actually do to earn its keep?',
      answers: [
        { value: 'credibility', score: 0, label: 'Explain the offer and book calls', detail: 'A focused credibility site and clear inquiry path are enough.' },
        { value: 'digital', score: 1, label: 'Sell and deliver digital offers', detail: 'Freebies, downloads, courses, or low-ticket products need delivery.' },
        { value: 'hybrid', score: 2, label: 'Handle several kinds of business', detail: 'Services plus events, content, memberships, donations, or commerce.' },
        { value: 'content', score: 2, label: 'Build a searchable content library', detail: 'Publishing control and long-term organic discovery are priorities.' }
      ]
    },
    {
      id: 'current',
      kicker: 'WHAT EXISTS NOW',
      title: 'Which description best matches the current setup?',
      answers: [
        { value: 'none', score: 0, label: 'No dependable site or system', detail: 'The business needs a useful front door before it needs a tech stack.' },
        { value: 'siteonly', score: 1, label: 'A site plus inbox and memory', detail: 'The site exists, but inquiry handling is mostly manual.' },
        { value: 'wordpress', score: 1, label: 'WordPress and a collection of plugins', detail: 'It works, but maintenance, speed, or integrations may be messy.' },
        { value: 'allinone', score: 1, label: 'Wix, Beacons, or another all-in-one', detail: 'Several jobs already happen inside one platform.' },
        { value: 'connected', score: 2, label: 'A CRM or connected workflow exists', detail: 'The question is whether it still fits, not whether software exists.' }
      ]
    },
    {
      id: 'bottleneck',
      kicker: 'ACTIVE BOTTLENECK',
      title: 'Where does the current setup fail most often?',
      answers: [
        { value: 'offer', score: 0, label: 'People do not understand the offer', detail: 'More software will not fix unclear positioning or a weak next step.' },
        { value: 'inquiry', score: 1, label: 'The inquiry form attracts the wrong people', detail: 'Visitors need structured ways to identify the problem they want solved.' },
        { value: 'scattered', score: 2, label: 'Lead context is scattered', detail: 'You cannot see the full pipeline or history in one place.' },
        { value: 'followup', score: 2, label: 'Follow-up depends on memory', detail: 'Interested people wait too long or disappear entirely.' },
        { value: 'admin', score: 3, label: 'Admin is stealing delivery time', detail: 'Repeated handoffs and updates are now an operating cost.' }
      ]
    },
    {
      id: 'ownership',
      kicker: 'SYSTEM OWNERSHIP',
      title: 'Who will own this system after it is installed?',
      answers: [
        { value: 'simple', score: 0, label: 'Me, but it must stay simple', detail: 'You will maintain the basics but do not want another technical hobby.' },
        { value: 'learner', score: 1, label: 'Me, and I will learn it', detail: 'A moderate learning curve is acceptable if the payoff is clear.' },
        { value: 'operator', score: 3, label: 'A team member or technical operator', detail: 'Someone will be responsible for data, workflows, and upkeep.' },
        { value: 'none', score: 1, label: 'Nobody yet', detail: 'The system must remain light or ownership must be part of the project.' }
      ]
    },
    {
      id: 'foundation',
      kicker: 'BUSINESS FOUNDATION',
      title: 'What is the current business-formation situation?',
      answers: [
        { value: 'evaluating', score: 0, label: 'I am evaluating whether to form an entity', detail: 'The right answer depends on state, risk, tax, and operating needs.' },
        { value: 'manual', score: 1, label: 'Formed, but I manage compliance myself', detail: 'Reminders and filings still depend on you.' },
        { value: 'handled', score: 0, label: 'Formed and already handled', detail: 'There is no reason to switch without a specific problem.' },
        { value: 'unsure', score: 0, label: 'I am not sure what I need', detail: 'A quiz should not invent a legal answer from incomplete information.' }
      ]
    }
  ];

  const plans = {
    essentials: {
      label: 'STACK 01 // ESSENTIALS',
      title: 'Keep the stack light',
      reason: 'Your next gain is more likely to come from a clearer offer and a reliable next step than from buying a complex CRM or automation platform.',
      doNow: ['One clear website job', 'Structured inquiry path', 'Simple follow-up you will actually use'],
      later: ['CRM after active opportunities outgrow one view', 'Automation after a repeated handoff is proven'],
      skip: ['HighLevel without an owner', 'A site rebuild without a clear failure', 'Enterprise feature bundles']
    },
    pipeline: {
      label: 'STACK 02 // PIPELINE',
      title: 'Build one reliable path',
      reason: 'You have enough opportunity for dropped context and inconsistent follow-up to cost money. The stack should make every inquiry visible without becoming a second job.',
      doNow: ['Classify inquiries by buyer problem', 'Keep one visible pipeline', 'Make the first follow-up automatic or unavoidable'],
      later: ['Proposal and payment handoff', 'Source and close-rate reporting'],
      skip: ['A second system of record', 'Automation across every task', 'Migrating tools without a measured reason']
    },
    growth: {
      label: 'STACK 03 // GROWTH SYSTEM',
      title: 'Connect the handoffs',
      reason: 'At your volume, fragmented data and manual transitions can become a real operating cost. The goal is one source of truth and automation only where repetition is proven.',
      doNow: ['Assign one system owner', 'Connect capture, CRM, and follow-up', 'Measure response and stage conversion'],
      later: ['Long-term nurture', 'Team permissions and advanced reporting'],
      skip: ['An ownerless all-in-one platform', 'Rebuilding everything at once', 'Automation without exception handling']
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
    const isGrowth = ['growing', 'established'].includes(state.answers.stage.value)
      && (state.answers.leads.value === 'high' || ['followup', 'admin'].includes(state.answers.bottleneck.value));
    const isPipeline = state.answers.leads.value === 'medium'
      || ['scattered', 'followup', 'admin'].includes(state.answers.bottleneck.value)
      || total >= 9;
    if (isGrowth) return { key: 'growth', score: total };
    if (isPipeline) return { key: 'pipeline', score: total };
    return { key: 'essentials', score: total };
  }

  function baseRecommendation(overrides) {
    return {
      status: 'DO NOW',
      confidence: 'MEDIUM CONFIDENCE',
      commercial: 'DIRECT LINK • NO ACTIVE COMMISSION',
      noBuy: 'Keep the current tool if it already performs this job reliably.',
      experience: 'No operator-specific evidence is being claimed for this decision.',
      sourceLabel: 'Verify current facts',
      ...overrides
    };
  }

  function pickWebsite() {
    const { channel, sitejob, current, bottleneck } = state.answers;
    const currentFits = current.value === 'connected'
      || (current.value === 'wordpress' && sitejob.value === 'content')
      || (current.value === 'allinone' && ['digital', 'hybrid'].includes(sitejob.value));

    if (currentFits && bottleneck.value !== 'offer') {
      return baseRecommendation({
        layer: 'FRONT DOOR',
        product: 'Keep the current website',
        status: 'KEEP',
        confidence: 'HIGH CONFIDENCE',
        summary: 'Nothing in your answers justifies a platform migration. Fix the inquiry path or handoff before replacing the site.',
        fit: 'The current platform already matches the main job you selected.',
        avoid: 'Reconsider only when a measured limitation blocks conversion, publishing, or delivery.',
        cost: 'No new platform cost',
        alternative: 'Run a focused conversion audit before buying another builder.',
        noBuy: 'This is the no-buy recommendation.',
        experience: 'This recommendation deliberately avoids creating unnecessary migration work.',
        url: '',
        sourceUrl: '',
        commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
      });
    }

    if (sitejob.value === 'digital' || (channel.value === 'social' && sitejob.value === 'credibility')) {
      return baseRecommendation({
        layer: 'FRONT DOOR',
        product: 'Beacons',
        confidence: 'HIGH CONFIDENCE',
        summary: 'A social-first page, offer delivery, selling, and email follow-up can live in one lightweight system.',
        fit: 'Best when traffic starts on social and you have a free or paid digital offer to deliver.',
        avoid: 'Avoid as the primary site when searchable long-form content or a desktop-first experience drives acquisition.',
        cost: 'Free plan; paid plans start at $10/month',
        alternative: 'Wix if the business needs a broader hybrid website.',
        noBuy: 'Keep your current link-in-bio page if it already captures and follows up with buyers.',
        experience: 'Expansion Works uses Beacons regularly for lightweight sites, digital delivery, and email follow-up.',
        url: 'https://beacons.ai/signup?c=expworks',
        sourceUrl: 'https://beacons.ai/i/pricing',
        commercial: 'REFERRAL LINK • MAY EARN 25% OF A QUALIFYING PAID PLAN'
      });
    }

    if (sitejob.value === 'content' || channel.value === 'search') {
      return baseRecommendation({
        layer: 'FRONT DOOR',
        product: 'WordPress + Elementor',
        summary: 'This combination offers publishing control and a visual editing layer for a content-led site.',
        fit: 'Best when organic content, ownership, and design flexibility justify ongoing maintenance.',
        avoid: 'Avoid when nobody will manage hosting, updates, plugins, security, and performance.',
        cost: 'WordPress is open source; hosting varies; Elementor paid plans start at $49/year',
        alternative: 'Wix if operational simplicity matters more than publishing control.',
        noBuy: 'Keep an existing site until content production, not platform choice, becomes the bottleneck.',
        experience: 'Expansion Works has built multiple WordPress sites and treats plugin load, upkeep, and performance as ongoing costs.',
        url: 'https://elementor.com/',
        sourceUrl: 'https://elementor.com/pricing/'
      });
    }

    return baseRecommendation({
      layer: 'FRONT DOOR',
      product: 'Wix',
      summary: 'Wix is the strongest fit here because the site must combine credibility with several built-in business functions.',
      fit: 'Best for a hybrid service business using bookings, events, content, memberships, donations, or moderate commerce.',
      avoid: 'Avoid when maximum design control matters more than convenience. Wix now creates a mobile-friendly version automatically, but complex layouts still deserve a manual mobile review.',
      cost: 'Free plan available; a paid plan is needed for a custom domain and removal of Wix branding',
      alternative: 'Beacons for a social-first digital-offer business; WordPress + Elementor for content control.',
      noBuy: 'Do not migrate if your existing builder already supports the required jobs without workarounds.',
      experience: 'Expansion Works currently supports client sites on Wix and previously ran an ecommerce site on the platform.',
      url: 'https://www.wix.com/',
      sourceUrl: 'https://www.wix.com/plans',
      commercial: 'DIRECT LINK • AFFILIATE APPLICATION PENDING'
    });
  }

  function pickInquiry(website) {
    const { current, bottleneck } = state.answers;

    if (current.value === 'connected' && bottleneck.value !== 'inquiry') {
      return baseRecommendation({
        layer: 'INQUIRY ROUTE',
        product: 'Keep the current capture tool',
        status: 'KEEP',
        confidence: 'HIGH CONFIDENCE',
        summary: 'Your answers do not show a capture problem. Changing forms would add migration work without a defined gain.',
        fit: 'Keep it while submissions reliably reach the correct owner and system.',
        avoid: 'Change only if routing, spam, qualification, or response time is measurably failing.',
        cost: 'No new tool cost',
        alternative: 'Restructure the questions before replacing the backend.',
        noBuy: 'This is the no-buy recommendation.',
        experience: 'No vendor change is required to restructure the questions and routing.',
        url: '',
        sourceUrl: '',
        commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
      });
    }

    if (['Beacons', 'Wix'].includes(website.product)) {
      return baseRecommendation({
        layer: 'INQUIRY ROUTE',
        product: `${website.product} native capture`,
        status: 'USE WHAT YOU HAVE',
        confidence: 'HIGH CONFIDENCE',
        summary: 'Keep capture inside the selected platform first. Add another form product only when a specific routing limitation appears.',
        fit: 'Use structured problem choices, then reveal a message field only after buyer intent is established.',
        avoid: 'Do not send every visitor into one unrestricted “contact us” message box.',
        cost: 'Included within the selected platform and plan limits',
        alternative: 'Formspree if you later move to a custom or static page.',
        noBuy: 'No additional form subscription is justified yet.',
        experience: `Expansion Works has implemented structured capture inside ${website.product} workflows.`,
        url: website.url,
        sourceUrl: website.sourceUrl,
        commercial: website.commercial
      });
    }

    return baseRecommendation({
      layer: 'INQUIRY ROUTE',
      product: 'Formspree',
      summary: 'Formspree supplies a lightweight backend for a custom form without forcing a full CRM or server build.',
      fit: 'Best for custom or static sites where you control the fields and want submissions delivered reliably.',
      avoid: 'Avoid adding it when your existing builder or CRM already handles forms and routing well.',
      cost: 'Free tier includes 50 submissions per month; paid limits and features vary',
      alternative: 'HubSpot Forms when submissions should enter a CRM immediately.',
      noBuy: 'Use the existing native form if it supports structured fields, routing, and adequate filtering.',
      experience: 'Expansion Works currently uses Formspree for its own website forms.',
      url: 'https://formspree.io/',
      sourceUrl: 'https://help.formspree.io/articles/account-management/account-limits'
    });
  }

  function pickPipeline() {
    const { stage, leads, current, bottleneck, ownership } = state.answers;
    const needsPipeline = leads.value !== 'low' || ['scattered', 'followup', 'admin'].includes(bottleneck.value);
    const highLevelEligible = leads.value === 'high'
      && ['growing', 'established'].includes(stage.value)
      && ['operator'].includes(ownership.value)
      && ['followup', 'admin'].includes(bottleneck.value);

    if (current.value === 'connected' && bottleneck.value === 'offer') {
      return baseRecommendation({
        layer: 'PIPELINE + FOLLOW-UP',
        product: 'Keep the current CRM',
        status: 'KEEP',
        confidence: 'HIGH CONFIDENCE',
        summary: 'The current failure is offer clarity. A CRM migration cannot repair a message prospects do not understand.',
        fit: 'Keep the existing source of truth while the front-end problem is corrected.',
        avoid: 'Do not use a new platform as a substitute for positioning work.',
        cost: 'No migration cost',
        alternative: 'Audit pipeline stages only after the offer path is clear.',
        noBuy: 'This is the no-buy recommendation.',
        experience: 'The observed failure is upstream of the CRM, so migration would not solve it.',
        url: '',
        sourceUrl: '',
        commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
      });
    }

    if (highLevelEligible) {
      return baseRecommendation({
        layer: 'PIPELINE + FOLLOW-UP',
        product: 'HighLevel',
        confidence: 'HIGH CONFIDENCE',
        summary: 'Your volume, repeated workflow pain, and named operator make an all-in-one automation platform defensible.',
        fit: 'Best when one owner can maintain CRM data, routing, campaigns, agents, calendars, and workflow exceptions.',
        avoid: 'Do not buy it when nobody owns the system or when fewer tools can handle the proven workflow.',
        cost: 'Plans start at $97/month; phone, messaging, email, and AI usage can add cost',
        alternative: 'HubSpot when CRM discipline matters more than an agency-style automation arsenal.',
        noBuy: 'Keep the current stack if manual cost has not been measured and assigned to a repeated workflow.',
        experience: 'Expansion Works used HighLevel to train a question-answering chatbot, capture interested prospects, and route human follow-up during a three-month organizational trial.',
        url: 'https://www.gohighlevel.com/',
        sourceUrl: 'https://www.gohighlevel.com/pricing',
        commercial: 'DIRECT LINK • NO ACTIVE COMMISSION'
      });
    }

    if (needsPipeline) {
      return baseRecommendation({
        layer: 'PIPELINE + FOLLOW-UP',
        product: 'HubSpot Free CRM',
        summary: 'A real pipeline is justified, but your answers do not justify HighLevel-level complexity.',
        fit: 'Best for centralizing contacts, deals, tasks, meeting links, and basic email tracking before advanced automation.',
        avoid: 'Avoid paid upgrades until a specific limit blocks a valuable, repeated process.',
        cost: 'Free CRM supports up to 2 users and 1,000 contacts; premium products add cost',
        alternative: 'HighLevel later if volume grows and a dedicated operator owns broader automation.',
        noBuy: 'A disciplined spreadsheet still wins if lead volume is low and one person can see every active opportunity.',
        experience: 'Expansion Works has used HubSpot for email campaigns, CRM segmentation, and follow-up tracking.',
        url: 'https://www.hubspot.com/products/crm',
        sourceUrl: 'https://www.hubspot.com/products/crm',
        commercial: 'DIRECT LINK • AFFILIATE PROGRAM EXISTS, NO TRACKING LINK ACTIVE'
      });
    }

    return baseRecommendation({
      layer: 'PIPELINE + FOLLOW-UP',
      product: 'Google Sheet + Gmail',
      status: 'START SCRAPPY',
      confidence: 'HIGH CONFIDENCE',
      summary: 'At this volume, visibility and a consistent follow-up habit matter more than buying a CRM.',
      fit: 'Best when one person owns fewer than five monthly inquiries and can maintain one simple view.',
      avoid: 'Upgrade when opportunities become hard to scan, multiple people need access, or follow-up repeatedly slips.',
      cost: 'No additional software purchase for an existing Google account; usage limits apply',
      alternative: 'HubSpot Free CRM when active opportunities outgrow the sheet.',
      noBuy: 'Do not buy CRM software yet.',
      experience: 'Expansion Works has built and operated multiple lightweight lead pipelines and follow-up systems with Google Sheets, Gmail, and Apps Script.',
      url: 'https://workspace.google.com/products/sheets/',
      sourceUrl: 'https://developers.google.com/apps-script/guides/services/quotas',
      commercial: 'NON-AFFILIATE RECOMMENDATION'
    });
  }

  function pickFoundation() {
    const { foundation } = state.answers;

    if (foundation.value === 'handled') {
      return baseRecommendation({
        layer: 'BUSINESS FOUNDATION',
        product: 'Keep the current arrangement',
        status: 'KEEP',
        confidence: 'HIGH CONFIDENCE',
        summary: 'Your formation and compliance needs are already handled. There is no reason to switch providers without a defined failure.',
        fit: 'Review the arrangement annually and when the business changes states, owners, or structure.',
        avoid: 'Do not migrate for a bundled starter website or an affiliate promotion.',
        cost: 'No change recommended',
        alternative: 'Compare providers only when service, privacy, filing, or support becomes a problem.',
        noBuy: 'This is the no-buy recommendation.',
        experience: 'No vendor change is being recommended.',
        url: '',
        sourceUrl: '',
        commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
      });
    }

    if (foundation.value === 'manual') {
      return baseRecommendation({
        layer: 'BUSINESS FOUNDATION',
        product: 'Northwest Registered Agent check',
        status: 'COMPARE',
        confidence: 'MEDIUM CONFIDENCE',
        summary: 'A managed registered-agent or compliance service may be useful if annual administration is a repeated burden.',
        fit: 'Compare what Northwest handles in your state against your current provider and the filings you still perform yourself.',
        avoid: 'Do not switch until service scope, renewal cost, state fees, and remaining owner duties are written down.',
        cost: 'Formation is advertised at $39 plus state fees; registered-agent and other services have separate pricing',
        alternative: 'Keep filing directly if the work is infrequent, understood, and reliably calendared.',
        noBuy: 'Maintaining the current arrangement is valid if it is not actually failing.',
        experience: 'Expansion Works has not used Northwest yet. This remains a researched option supported by a positive second-hand operator report.',
        url: 'https://www.northwestregisteredagent.com/',
        sourceUrl: 'https://www.northwestregisteredagent.com/llc',
        commercial: 'DIRECT LINK • AFFILIATE APPLICATION PENDING'
      });
    }

    if (foundation.value === 'evaluating') {
      return baseRecommendation({
        layer: 'BUSINESS FOUNDATION',
        product: 'Compare DIY filing with Northwest',
        status: 'CHECK FIRST',
        confidence: 'LOW CONFIDENCE',
        summary: 'Formation is a state-specific legal and tax decision. StackBrief does not have enough information to tell you to create an entity.',
        fit: 'Northwest becomes relevant only after you decide an entity is appropriate and want help with formation or registered-agent work.',
        avoid: 'Do not form an entity solely because a formation company bundles a website, email, or phone line.',
        cost: 'DIY state fees vary; Northwest advertises formation at $39 plus state fees',
        alternative: 'File directly with the state after appropriate legal or tax guidance.',
        noBuy: 'Remaining a sole proprietor may be valid in some situations; get state-specific guidance.',
        experience: 'Expansion Works has not used Northwest yet. The affiliate application is pending and does not affect this comparison.',
        url: 'https://www.northwestregisteredagent.com/llc',
        sourceUrl: 'https://www.northwestregisteredagent.com/llc',
        commercial: 'DIRECT LINK • AFFILIATE APPLICATION PENDING'
      });
    }

    return baseRecommendation({
      layer: 'BUSINESS FOUNDATION',
      product: 'Do not buy a formation service yet',
      status: 'PAUSE',
      confidence: 'HIGH CONFIDENCE',
      summary: 'Uncertainty is not a reason to let a software quiz make a legal decision for you.',
      fit: 'Clarify state, business structure, ownership, liability, and tax questions first.',
      avoid: 'Avoid “one-click” formation pitches that blur government fees and ongoing owner responsibilities.',
      cost: 'No purchase recommended',
      alternative: 'Use official state resources and qualified legal or tax guidance.',
      noBuy: 'This is the no-buy recommendation.',
      experience: 'No vendor recommendation is made without the missing legal and tax context.',
      url: '',
      sourceUrl: '',
      commercial: 'NO PRODUCT PURCHASE RECOMMENDED'
    });
  }

  function recommendationCard(item) {
    const productLink = item.url
      ? `<a class="product-cta" href="${escapeHtml(item.url)}" target="_blank" rel="${item.commercial.startsWith('REFERRAL') ? 'sponsored noopener' : 'noopener'}">Visit ${escapeHtml(item.product)} <span aria-hidden="true">↗</span></a>`
      : '';
    const sourceLink = item.sourceUrl
      ? `<a class="source-link" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(item.sourceLabel)} <span aria-hidden="true">↗</span></a>`
      : '';

    return `
      <article class="product-decision">
        <div class="product-decision-topline">
          <span>${escapeHtml(item.layer)}</span>
          <b>${escapeHtml(item.status)}</b>
        </div>
        <h4>${escapeHtml(item.product)}</h4>
        <p class="product-summary">${escapeHtml(item.summary)}</p>
        <dl>
          <div><dt>FIT</dt><dd>${escapeHtml(item.fit)}</dd></div>
          <div><dt>DISQUALIFIER</dt><dd>${escapeHtml(item.avoid)}</dd></div>
          <div><dt>CURRENT COST FACT</dt><dd>${escapeHtml(item.cost)}</dd></div>
          <div><dt>OPERATOR NOTE</dt><dd>${escapeHtml(item.experience)}</dd></div>
          <div><dt>RUNNER-UP</dt><dd>${escapeHtml(item.alternative)}</dd></div>
          <div><dt>NO-BUY PATH</dt><dd>${escapeHtml(item.noBuy)}</dd></div>
        </dl>
        <div class="product-meta">
          <span>${escapeHtml(item.confidence)}</span>
          <span>FACTS CHECKED ${escapeHtml(verifiedDate.toUpperCase())}</span>
          <span>${escapeHtml(item.commercial)}</span>
        </div>
        <div class="product-links">${productLink}${sourceLink}</div>
      </article>
    `;
  }

  function list(items) {
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function renderResult() {
    progress.style.width = '100%';
    progressLabel.textContent = 'INITIAL BRIEF COMPLETE';
    const selection = pickPlan();
    const plan = plans[selection.key];
    const website = pickWebsite();
    const recommendations = [website, pickInquiry(website), pickPipeline(), pickFoundation()];
    const recommendationSummary = recommendations.map((item) => `${item.layer}: ${item.product} (${item.status})`).join(' | ');
    const answerSummary = questions.map((question) => `${question.kicker}: ${state.answers[question.id].label}`).join(' | ');
    const summary = `${plan.label} | ${recommendationSummary} | ${answerSummary}`;

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
      <div class="product-brief">
        <div class="product-brief-heading">
          <p>YOUR PRODUCT-LEVEL BRIEF</p>
          <span>Rules-based beta • no pay-to-rank</span>
        </div>
        ${recommendations.map(recommendationCard).join('')}
        <p class="legal-note">Business-formation information is educational, not legal or tax advice. Verify all prices, limits, and terms with the vendor before purchasing.</p>
      </div>
      <div class="save-box">
        <h4>Save this exact brief.</h4>
        <p>Leave your email for the implementation order and future alerts tied to these decisions. No generic software-news drip.</p>
        <form class="save-form" action="https://formspree.io/f/xeewjjlv" method="POST" data-save-form>
          <input type="email" name="email" autocomplete="email" placeholder="you@business.com" aria-label="Work email" required>
          <input type="hidden" name="source" value="StackBrief product-level beta">
          <input type="hidden" name="stackbrief_result" value="${escapeHtml(summary)}">
          <input type="hidden" name="_subject" value="New StackBrief product decision lead">
          <button class="button" type="submit">Save my StackBrief →</button>
        </form>
        <p class="form-status" data-form-status aria-live="polite"></p>
      </div>
      <div class="result-actions">
        ${state.answers.ownership.value === 'none' || ['growth'].includes(selection.key) ? '<a href="/sales">Have Expansion Works install it →</a>' : '<a href="/sales">See the done-for-you option →</a>'}
        <a href="/tools/better-inquiry-form">Build a better inquiry form →</a>
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
        form.innerHTML = '<p class="form-status">SAVED. Your full product brief was attached to this request.</p>';
      } catch (error) {
        status.textContent = 'That did not save. Try again or use the done-for-you page to contact me directly.';
        submit.disabled = false;
        submit.textContent = 'SAVE MY STACKBRIEF →';
      }
    });
  }

  renderQuestion();
})();

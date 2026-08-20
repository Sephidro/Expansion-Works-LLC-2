(() => {
  const form = document.querySelector('[data-inquiry-config]');
  const output = document.querySelector('[data-inquiry-output]');
  if (!form || !output) return;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    })[character]);
  }

  function actionCopy(value) {
    return {
      consultation: 'Request a consultation',
      quote: 'Request a project estimate',
      booking: 'Request an appointment',
      application: 'Start an eligibility review',
      information: 'Ask about this service'
    }[value];
  }

  function businessCopy(value) {
    return {
      consulting: 'project',
      coaching: 'goal',
      creative: 'project',
      local: 'appointment',
      event: 'request'
    }[value];
  }

  function backendDecision(data) {
    if (data.routing === 'crm' || data.volume === 'high') {
      return {
        name: 'HubSpot Forms first; evaluate HighLevel only with a dedicated operator',
        reason: 'The inquiry must enter a visible pipeline, and the volume can justify structured ownership. HighLevel remains disqualified when nobody owns the workflows.'
      };
    }
    if (data.platform === 'custom') {
      return {
        name: 'Formspree',
        reason: 'Use a simple form backend for the custom site. Your current volume does not need a full CRM just to receive inquiries.'
      };
    }
    if (data.platform === 'wordpress' && data.volume === 'medium') {
      return {
        name: 'HubSpot Free CRM + WordPress integration',
        reason: 'You have enough inquiry volume to benefit from a visible contact and deal history, and HubSpot can be connected to WordPress.'
      };
    }
    if (['wix', 'beacons'].includes(data.platform)) {
      return {
        name: `Use ${data.platform === 'wix' ? 'Wix' : 'Beacons'} native capture`,
        reason: 'Use the form already included with the site. Add another product only when routing, qualification, or follow-up needs something it cannot do.'
      };
    }
    return {
      name: 'Use the current builder’s native form first',
      reason: 'Use the form already included with the site. Move to a separate backend when the process becomes hard to see or route.'
    };
  }

  function starterHtml(data) {
    const project = businessCopy(data.business_type);
    const problems = [data.problem_1, data.problem_2, data.problem_3];
    const action = data.platform === 'custom'
      ? 'https://formspree.io/f/YOUR_FORM_ID'
      : '/YOUR-FORM-HANDLER';

    return `<form action="${action}" method="POST">
  <fieldset>
    <legend>What would you like help with?</legend>
${problems.map((problem, index) => `    <label><input type="radio" name="buyer_problem" value="problem-${index + 1}" required> ${problem}</label>`).join('\n')}
    <label><input type="radio" name="buyer_problem" value="partnership-or-other"> Partnership, media, or another request</label>
  </fieldset>

  <label>Your name <input name="name" autocomplete="name" required></label>
  <label>Work email <input type="email" name="email" autocomplete="email" required></label>
  <label>What outcome would make this ${project} successful?
    <textarea name="desired_outcome" rows="4" required></textarea>
  </label>
  <label>Anything else we should know? (Optional)
    <textarea name="additional_context" rows="3"></textarea>
  </label>
  <button type="submit">${actionCopy(data.primary_action)}</button>
</form>`;
  }

  async function copyCode(button, code) {
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'COPIED';
    } catch (error) {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      button.textContent = 'COPIED';
    }
    window.setTimeout(() => { button.textContent = 'COPY STARTER HTML'; }, 1800);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const backend = backendDecision(data);
    const code = starterHtml(data);
    const problems = [data.problem_1, data.problem_2, data.problem_3];
    const routing = data.routing === 'several'
      ? 'Route each buyer-problem choice to its responsible person. Send “partnership or other” to a separate low-priority inbox.'
      : data.routing === 'crm'
        ? 'Create the contact first, store the selected buyer problem, then create or update the corresponding deal or opportunity.'
        : 'Send qualified service requests to the primary owner. Filter “partnership or other” into a separate label or inbox.';

    output.innerHTML = `
      <div class="output-heading"><span>OUTPUT // GENERATED</span><h3>Your structured inquiry route</h3></div>
      <div class="output-block">
        <h4>01 // FIRST QUESTION</h4>
        <p>Ask: <strong>“What would you like help with?”</strong></p>
        <ul>${problems.map((problem) => `<li>${escapeHtml(problem)}</li>`).join('')}<li>Partnership, media, or another request</li></ul>
      </div>
      <div class="output-block">
        <h4>02 // FIELD ORDER</h4>
        <ol><li>Buyer problem</li><li>Name and work email</li><li>Desired outcome</li><li>Optional additional context</li><li>Relevant qualification field only if it changes the response</li></ol>
      </div>
      <div class="output-block output-recommendation">
        <h4>03 // BACKEND DECISION</h4>
        <strong>${escapeHtml(backend.name)}</strong>
        <p>${escapeHtml(backend.reason)}</p>
      </div>
      <div class="output-block">
        <h4>04 // ROUTING</h4>
        <p>${escapeHtml(routing)}</p>
      </div>
      <div class="output-code">
        <div><h4>STARTER HTML</h4><button type="button" data-copy-code>COPY STARTER HTML</button></div>
        <pre><code>${escapeHtml(code)}</code></pre>
        <p>Replace the clearly marked form-handler value before publishing. Add your privacy notice, consent language, spam controls, and accessibility testing.</p>
      </div>
      <div class="output-next">
        <p>The form starts the conversation. Next, decide where the inquiry is stored, who owns it, and how quickly follow-up starts.</p>
        <a href="/#stackbrief">Build the full StackBrief →</a>
        <a href="/sales">Have Expansion Works implement it →</a>
      </div>
    `;

    const copyButton = output.querySelector('[data-copy-code]');
    copyButton.addEventListener('click', () => copyCode(copyButton, code));
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

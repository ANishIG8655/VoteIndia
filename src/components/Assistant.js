/**
 * Unified Assistant Component: UI + Logic
 */
import { indiaElections, modes, getPersonalizedData } from '../electionData.js';

/**
 * Parses markdown-lite
 */
const parseMarkdown = (text) => {
  return text
    .replace(/^### (.*?)$/gm, '<h3 style="color: var(--chakra); font-size: 1.1rem; margin: 1.2rem 0 0.6rem 0; border-bottom: 2px solid var(--saffron); padding-bottom: 0.2rem; display: block; font-family: \'Outfit\';">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 style="color: var(--chakra); font-size: 1.25rem; margin: 1.5rem 0 0.75rem 0; font-family: \'Outfit\';">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--chakra); font-weight: 800;">$1</strong>')
    .replace(/• (.*?)\n/g, '<div style="margin-bottom: 0.4rem; padding-left: 1rem; border-left: 2px solid var(--saffron);">$1</div>');
};

export const addMessage = (text, isUser = false) => {
  const messages = document.getElementById('assistant-messages');
  if (!messages) return;

  const msg = document.createElement('div');
  msg.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
  msg.innerHTML = parseMarkdown(text);
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
};

export const showOptions = (options, profile) => {
  const container = document.getElementById('quick-replies');
  if (!container) return;
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = opt.label || opt;
    btn.onclick = () => {
      addMessage(opt.label || opt, true);
      handleAssistantInput(opt.id || opt, profile);
    };
    container.appendChild(btn);
  });
};

/**
 * Master Input Handler
 */
export const handleAssistantInput = (id, profile) => {
  if (id === 'process') {
    addMessage("The election process in India is managed by the ECI. Let's walk through it.");
    renderExplainer(0, profile);
  } else if (id.startsWith('explainer_step_')) {
    renderExplainer(parseInt(id.split('_').pop()), profile);
  } else if (id === 'my_constituency') {
    if (!profile || !profile.state) {
      addMessage("⚠️ Please update your profile to see personalized data.");
    } else {
      const data = getPersonalizedData(profile.state, profile.constituency);
      addMessage(`📍 **Insights for ${profile.constituency}**\n\n${data.prospects}`);
      showOptions([{id: 'manifesto', label: 'View Manifestos'}], profile);
    }
  } else if (id === 'past') {
    addMessage(`### 🏆 Past Election Results\n\n**2024 General Election**\n• Status: Completed\n• Majority: NDA Coalition (293 seats)\n• Oppn: INDIA Alliance (234 seats)\n\n**2019 General Election**\n• Status: Completed\n• Majority: BJP-led NDA (353 seats)\n• Turnout: 67.4% (Highest ever)`);
    showOptions([{id: 'menu', label: 'Back to Menu'}], profile);
  } else if (id === 'upcoming') {
    addMessage(`### 📅 Upcoming Elections 2026\n\n**State Assemblies (May 2026)**\n• Tamil Nadu (234 Seats)\n• West Bengal (294 Seats)\n• Kerala (140 Seats)\n• Assam (126 Seats)\n\n**General Election**\n• Expected: 2029`);
    showOptions([{id: 'menu', label: 'Back to Menu'}], profile);
  } else if (id === 'trends') {
    addMessage(`### 📈 Current Trend Analysis\n\n**1. Youth Surge**\nFirst-time voters (18-22) are prioritizing job security over traditional identity politics.\n\n**2. Women Voters**\nSilent voting bloc determining results through participation in welfare-driven schemes.\n\n**3. Federalism**\nRegional parties strengthening their hold in southern and eastern states.`);
    showOptions([{id: 'menu', label: 'Back to Menu'}], profile);
  } else if (id === 'manifesto') {
    addMessage(`### 📑 Manifesto Comparison 2026\n\n**BJP (Nationalist Platform)**\n• Focus: Infrastructure (Bullet Trains, Highways)\n• Welfare: Free Ration & Ayushman Bharat Expansion\n\n**INC (Justice Platform)**\n• Focus: Job Guarantees (Apprenticeship Rights)\n• Welfare: Financial aid for women & Caste Census\n\n**Regional Blocs (Federal Focus)**\n• Focus: State autonomy & Regional Language promotion\n• Welfare: Direct cash transfers for farmers`);
    showOptions([{id: 'menu', label: 'Back to Menu'}], profile);
  } else if (id === 'menu') {
    addMessage("How else can I help you today?");
    showOptions(modes, profile);
  } else {
    addMessage("I can help with voting, results, or manifestos.");
    showOptions(modes, profile);
  }
};

const renderExplainer = (index, profile) => {
  const p = indiaElections.process[index];
  addMessage(`### Step ${index+1}: ${p.step}\n${p.what}`);
  const next = [];
  if (index < indiaElections.process.length - 1) next.push({id: `explainer_step_${index+1}`, label: 'Next Step'});
  next.push({id: 'process', label: 'Restart'});
  next.push({id: 'menu', label: 'Back to Menu'});
  showOptions(next, profile);
};

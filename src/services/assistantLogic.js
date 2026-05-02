/**
 * AI Assistant Logic & Response Controller
 */

import { indiaElections, modes, getPersonalizedData } from '../electionData.js';
import { createMessageBubble } from '../components/AssistantUI.js';

let explainerStepIndex = 0;

/**
 * Handles all user inputs/button clicks in the Assistant
 */
export const handleAssistantInput = (id, currentUserProfile, showOptions, addMessage) => {
  if (id === 'process') {
    addMessage(`QuickLinks:
1. Election Explainer 
2. Trends & Scenario Analysis

---

### **Overview**
The election process in India is a highly structured journey managed by the **Election Commission of India (ECI)**. It ensures fair choice for both **Lok Sabha** (Central) and **Vidhan Sabha** (State).

Let's walk through it step-by-step.`);
    explainerStepIndex = 0;
    renderExplainer(0, addMessage, showOptions);
  } else if (id.startsWith('explainer_step_')) {
    const index = parseInt(id.split('_').pop());
    explainerStepIndex = index;
    renderExplainer(index, addMessage, showOptions);
  } else if (id === 'explainer_jump_voting') {
    explainerStepIndex = 4; // Voting is step 5 (index 4)
    renderExplainer(4, addMessage, showOptions);
  } else if (id === 'explainer_timeline') {
    const timeline = indiaElections.process.map((s, i) => `**${i+1}. ${s.step}**`).join('\n');
    addMessage(`📅 **Full Election Journey**\n\n${timeline}\n\nShall we deep dive into any specific stage?`);
    showOptions(indiaElections.process.map((s, i) => ({ id: `explainer_step_${i}`, label: s.step })));
  } else if (id === 'past') {
    const results = indiaElections.pastResults.map(r => `• **${r.year} ${r.type}**: ${r.turnout} Turnout (${r.status})`).join('\n');
    addMessage(`🏆 **Historical Election Data**\n\n${results}\n\nWould you like a deeper analysis or manifesto comparisons?`);
    showOptions([{id: 'trends', label: 'Trend Analysis'}, {id: 'manifesto', label: 'Manifesto Comparison'}]);
  } else if (id === 'upcoming') {
    addMessage(`📅 **Upcoming Schedule**\n\nI've updated your dashboard widget with the latest expected dates. Currently, major state assembly elections are slated for late 2026.`);
    showOptions([{id: 'process', label: 'Understand the Process'}, {id: 'manifesto', label: 'View Manifestos'}]);
  } else if (id === 'manifesto') {
    const manifestos = indiaElections.manifestos.map(m => `<strong style="color: var(--green)">${m.category}</strong>: ${m.point}`).join('\n\n');
    addMessage(`📜 **Manifesto Key Themes**\n\nComparing major party focus areas:\n\n${manifestos}\n\nWant to see how these themes influence voting trends?`);
    showOptions([{id: 'trends', label: 'Trend Analysis'}, {id: 'past', label: 'View Past Results'}]);
  } else if (id === 'my_constituency') {
    if (!currentUserProfile || !currentUserProfile.state || !currentUserProfile.constituency) {
      addMessage(`⚠️ Please update your profile (click your name in the top right) with your State and Constituency to get personalized data.`);
    } else {
      const data = getPersonalizedData(currentUserProfile.state, currentUserProfile.constituency);
      const candidateList = data.candidates.map(c => `• **${c.name}** (${c.party}): Focus on *${c.focus}*`).join('\n');
      
      addMessage(`📍 **Personalized Insights for ${currentUserProfile.constituency}, ${currentUserProfile.state}**\n\n**Candidates & Local Focus:**\n${candidateList}\n\n**Local Manifesto Highlights:**\n${data.manifestoHighlight}\n\n**State & National Impact:**\n${data.prospects}`);
      showOptions([{id: 'manifesto', label: 'National Manifestos'}, {id: 'trends', label: 'Overall Trends'}]);
    }
  } else if (id === 'trends') {
    const trends = indiaElections.trends.map(t => `<strong style="color: var(--chakra)">${t.title}</strong>\n${t.insight}`).join('\n\n');
    addMessage(`📈 **Data-Driven Trends & Analysis**\n\n${trends}\n\nWould you like a quick breakdown or a detailed analysis of a specific mode?`);
    showOptions([{id: 'process', label: 'Process Breakdown'}, {id: 'upcoming', label: 'Upcoming Schedule'}]);
  } else {
    addMessage(`I can help with that—do you want to learn about:\n1. Voting process\n2. Election timeline\n3. How results are counted\n4. Election systems?`);
    showOptions(modes);
  }
};

/**
 * Renders a specific step of the Election Explainer
 */
export const renderExplainer = (index, addMessage, showOptions) => {
  const p = indiaElections.process[index];
  let imageTag = '';
  if (p.image) {
    imageTag = `<img src="${p.image}" alt="Visualization of ${p.step}: ${p.what}" style="width: 100%; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">`;
  }

  const content = `
${imageTag}
### **Step ${index + 1}: ${p.step}**
• **What happens:** ${p.what}
• **Who is involved:** ${p.who}
• **Why it matters:** ${p.why}
`;
  addMessage(content);
  
  const nextOptions = [];
  if (index > 0) nextOptions.push({ id: `explainer_step_${index - 1}`, label: '← Previous Step' });
  if (index < indiaElections.process.length - 1) nextOptions.push({ id: `explainer_step_${index + 1}`, label: 'Continue Step-by-Step' });
  if (index !== 4) nextOptions.push({ id: 'explainer_jump_voting', label: 'Jump to Voting (EVM/VVPAT)' });
  
  nextOptions.push({ id: 'explainer_timeline', label: 'View Full Timeline' });
  nextOptions.push({ id: 'trends', label: 'Explore Trends' });
  
  showOptions(nextOptions);
};

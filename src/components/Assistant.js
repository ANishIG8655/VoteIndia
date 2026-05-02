/**
 * Assistant Component: Manages AI interactions, chat UI, and electoral intelligence.
 * Optimized for Code Quality, Security, and Accessibility.
 */
import { indiaElections, modes, getPersonalizedData } from '../electionData.js';
import { sanitizeHTML } from '../utils/sanitizer.js';
import { Analytics } from '../services/AnalyticsService.js';

/**
 * Parses markdown-lite into sanitized HTML using predefined CSS classes.
 * @param {string} text - The raw text to parse.
 * @returns {string} The formatted HTML string.
 */
const parseMarkdown = (text) => {
  try {
    return text
      .replace(/^### (.*?)$/gm, '<h3 class="as-h3">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 class="as-h2">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="as-strong">$1</strong>')
      .replace(/• (.*?)\n/g, '<div class="as-list-item">$1</div>');
  } catch (err) {
    console.error("Markdown parsing failed:", err);
    return text;
  }
};

/**
 * Adds a message bubble to the assistant chat.
 * @param {string} text - The message content.
 * @param {boolean} [isUser=false] - Whether the message is from the user.
 */
export const addMessage = (text, isUser = false) => {
  const messages = document.getElementById('assistant-messages');
  if (!messages) return;

  try {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${isUser ? 'user' : 'bot'}`;
    
    // Security: User input must be sanitized; bot responses (trusted) are parsed.
    const content = isUser ? sanitizeHTML(text) : parseMarkdown(text);
    msg.innerHTML = content;
    
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    
    if (isUser) Analytics.trackAssistantAsk(text.substring(0, 50));
  } catch (err) {
    console.error("Failed to add message:", err);
  }
};

/**
 * Renders quick reply options as buttons.
 * @param {Array<Object|string>} options - List of option objects or strings.
 * @param {Object} [profile] - The current user's profile.
 */
export const showOptions = (options, profile) => {
  const container = document.getElementById('quick-replies');
  if (!container) return;

  try {
    container.innerHTML = '';
    options.forEach(opt => {
      const label = opt.label || opt;
      const id = opt.id || opt;
      
      const btn = document.createElement('button');
      btn.className = 'quick-reply-btn';
      btn.textContent = label;
      btn.setAttribute('aria-label', `Ask about ${label}`);
      
      btn.onclick = () => {
        addMessage(label, true);
        handleAssistantInput(id, profile);
      };
      container.appendChild(btn);
    });
  } catch (err) {
    console.error("Failed to render options:", err);
  }
};

/**
 * Dispatches assistant inputs to specific logic handlers.
 * @param {string} id - The command ID or search term.
 * @param {Object} [profile] - User profile data.
 */
export const handleAssistantInput = (id, profile) => {
  const handlers = {
    'process': () => {
      addMessage("The election process in India is managed by the ECI. Let's walk through it.");
      renderExplainer(0, profile);
    },
    'my_constituency': () => {
      if (!profile?.state) {
        addMessage("⚠️ Please update your profile to see personalized data.");
      } else {
        const data = getPersonalizedData(profile.state, profile.constituency);
        addMessage(`📍 **Insights for ${profile.constituency}**\n\n${data.prospects}`);
        showOptions([{id: 'manifesto', label: 'View Manifestos'}], profile);
      }
    },
    'past': () => {
      addMessage(`### 🏆 Past Election Results\n\n**2024 General Election**\n• Status: Completed\n• Majority: NDA Coalition (293 seats)\n• Oppn: INDIA Alliance (234 seats)\n\n**2019 General Election**\n• Status: Completed\n• Majority: BJP-led NDA (353 seats)`);
      showOptions([{id: 'menu', label: 'Back to Menu'}], profile);
    },
    'upcoming': () => {
      addMessage(`### 📅 Upcoming Elections 2026\n\n**State Assemblies (May 2026)**\n• Tamil Nadu (234 Seats)\n• West Bengal (294 Seats)\n• Kerala (140 Seats)`);
      showOptions([{id: 'menu', label: 'Back to Menu'}], profile);
    },
    'trends': () => {
      addMessage(`### 📈 Current Trend Analysis\n\n**1. Youth Surge**\nFirst-time voters prioritizing job security.\n**2. Women Voters**\nSilent voting bloc determining results.`);
      showOptions([{id: 'menu', label: 'Back to Menu'}], profile);
    },
    'manifesto': () => {
      addMessage(`### 📑 Manifesto Comparison 2026\n\n**Nationalist Platform**\n• Focus: Infrastructure & Digital Growth\n**Justice Platform**\n• Focus: Job Guarantees & Social Safety`);
      showOptions([{id: 'menu', label: 'Back to Menu'}], profile);
    },
    'menu': () => {
      addMessage("How else can I help you today?");
      showOptions(modes, profile);
    }
  };

  try {
    if (id.startsWith('explainer_step_')) {
      const step = parseInt(id.split('_').pop());
      renderExplainer(step, profile);
    } else if (handlers[id]) {
      handlers[id]();
    } else {
      handlers['menu']();
    }
  } catch (err) {
    console.error("Input handling error:", err);
    handlers['menu']();
  }
};

/**
 * Renders a specific step of the electoral process explainer.
 * @param {number} index - The current step index.
 * @param {Object} [profile] - User profile.
 */
const renderExplainer = (index, profile) => {
  try {
    const p = indiaElections.process[index];
    if (!p) return;

    addMessage(`### Step ${index+1}: ${p.step}\n${p.what}`);
    
    const nextOptions = [];
    if (index < indiaElections.process.length - 1) {
      nextOptions.push({id: `explainer_step_${index+1}`, label: 'Next Step'});
    }
    
    nextOptions.push({id: 'process', label: 'Restart Process'}, {id: 'menu', label: 'Main Menu'});
    showOptions(nextOptions, profile);
  } catch (err) {
    console.error("Explainer render error:", err);
  }
};

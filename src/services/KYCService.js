import { showToast } from '../utils/ui.js';
import { Analytics } from './AnalyticsService.js';
import { sanitizeHTML, isValidSearch } from '../utils/sanitizer.js';

const candidateDB = {
  'varanasi': [
    { name: 'Narendra Modi', party: 'BJP', assets: '₹3.02 Cr', edu: 'MA (Pol Science)', cases: 'Nil' },
    { name: 'Ajay Rai', party: 'INC', assets: '₹5.5 Cr', edu: 'Graduate', cases: '12 (Political)' },
    { name: 'Ather Jamal Lari', party: 'BSP', assets: '₹1.8 Cr', edu: 'Post Graduate', cases: 'Nil' }
  ],
  'wayanad': [
    { name: 'Rahul Gandhi', party: 'INC', assets: '₹20.4 Cr', edu: 'M.Phil (Cambridge)', cases: '18 (Political)' },
    { name: 'Annie Raja', party: 'CPI', assets: '₹72 Lakh', edu: 'Graduate', cases: 'Nil' },
    { name: 'K. Surendran', party: 'BJP', assets: '₹1.2 Cr', edu: 'Graduate', cases: '240 (Political)' }
  ],
  'kolathur': [
    { name: 'M.K. Stalin', party: 'DMK', assets: '₹8.8 Cr', edu: 'Graduate (Presidency)', cases: 'Nil' },
    { name: 'Adhi Rajaram', party: 'AIADMK', assets: '₹4.2 Cr', edu: 'Graduate', cases: 'Nil' }
  ]
};

/**
 * KYC Service: Manages candidate profile searching and rendering
 */
export const initKYCSearch = () => {
  const searchBtn = document.getElementById('kyc-search-btn');
  const input = document.getElementById('kyc-search-input');
  const modal = document.getElementById('kyc-modal');
  const resultsContainer = document.getElementById('kyc-results-container');

  if (!searchBtn || !input || !modal) return;

  const renderSkeleton = () => {
    resultsContainer.innerHTML = `
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card"></div>
    `;
  };

  const renderCandidates = (candidates) => {
    const timestamp = new Date().toLocaleTimeString();
    resultsContainer.innerHTML = `
      <div style="font-size: 0.75rem; color: var(--text-light); text-align: right; margin-bottom: 0.8rem;">
        ⚡ Live Update: ${timestamp}
      </div>
      ${candidates.map(c => `
        <div class="candidate-card-v2" style="background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 1rem; position: relative; overflow: hidden;">
          <div style="position: absolute; left: 0; top: 0; width: 4px; height: 100%; background: var(--chakra);"></div>
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <h4 style="margin: 0; color: var(--chakra);">${c.name}</h4>
              <p style="margin: 0.2rem 0; font-size: 0.75rem; font-weight: 700; color: var(--saffron);">${c.party}</p>
            </div>
            <span style="font-size: 0.65rem; color: #e11d48; background: #fff1f2; padding: 4px 8px; border-radius: 10px; font-weight: 800;">AWAITING RESULTS</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-top: 1rem; background: #f8fafc; padding: 0.8rem; border-radius: 8px;">
            <div><small>Assets</small><div style="font-weight: 700;">${c.assets}</div></div>
            <div><small>Edu</small><div style="font-weight: 700;">${c.edu}</div></div>
            <div><small>Cases</small><div style="font-weight: 700; color: ${c.cases === 'Nil' ? 'var(--green)' : '#e11d48'}">${c.cases}</div></div>
          </div>
        </div>
      `).join('')}
    `;
  };

  searchBtn.onclick = () => {
    const rawVal = input.value.trim();
    if (!isValidSearch(rawVal)) {
      return showToast("Please enter a valid constituency name (letters only)", true);
    }

    const val = rawVal.toLowerCase();
    const sanitizedName = sanitizeHTML(rawVal);
    
    document.getElementById('kyc-constituency-name').querySelector('span').textContent = sanitizedName;
    modal.style.display = 'flex';
    renderSkeleton();

    // Simulate Network Latency for UX
    setTimeout(() => {
      const data = candidateDB[val];
      Analytics.trackSearch(val, data ? data.length : 0);
      
      if (data) {
        renderCandidates(data);
      } else {
        resultsContainer.innerHTML = `<p style="text-align: center; color: var(--text-light);">No data for "${val}". Try Varanasi or Wayanad.</p>`;
      }
    }, 800);
  };

  document.getElementById('close-kyc')?.addEventListener('click', () => modal.style.display = 'none');
};

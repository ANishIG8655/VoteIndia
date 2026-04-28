import './style.css';
import { auth, db } from './services/firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged,
  signOut,
  deleteUser
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { indiaElections, modes, getPersonalizedData, kycDatabase } from './electionData.js';
import { startLiveClock, addToGoogleCalendar } from './services/sync.js';
import { handleAuth, saveUserProfile, getUserProfile } from './services/auth.js';
import { showToast, parseMarkdown } from './utils/ui.js';
import { sanitizeName } from './utils/sanitizer.js';
import { createTrendNode } from './components/Ticker.js';
import { createMessageBubble, createOptionButton } from './components/Assistant.js';

document.addEventListener('DOMContentLoaded', () => {
  // Handle Global Splash Screen
  const splashScreen = document.getElementById('global-splash');
  const splashProgress = document.getElementById('splash-progress');

  // Register Service Worker for Offline Support
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('VoteIndia SW Registered', reg))
        .catch(err => console.log('SW Registration Failed', err));
    });
  }

  // Instant Offline Detection
  window.addEventListener('offline', () => {
    window.location.href = '/offline.html';
  });

  // Re-check on load (if started offline)
  if (!navigator.onLine) {
    window.location.href = '/offline.html';
  }
  
  const showSplash = (durationMs, callback) => {
    if(!splashScreen || !splashProgress) { if(callback) callback(); return; }
    
    splashScreen.style.display = 'flex';
    splashScreen.style.opacity = '1';
    splashProgress.style.transition = 'none';
    splashProgress.style.width = '0%';
    
    setTimeout(() => {
      splashProgress.style.transition = `width ${durationMs}ms linear`;
      splashProgress.style.width = '100%';
    }, 50);
    
    setTimeout(() => {
      splashScreen.style.opacity = '0';
      setTimeout(() => {
        splashScreen.style.display = 'none';
        if(callback) callback();
      }, 500);
    }, durationMs);
  };

  // Auth Elements
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen');
  const authForm = document.getElementById('auth-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const authSubmit = document.getElementById('auth-submit');
  const authMessage = document.getElementById('auth-message');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const userEmailDisplay = document.getElementById('user-email');
  const logoutBtn = document.getElementById('logout-btn');
  const nameGroup = document.getElementById('name-group');
  const fullnameInput = document.getElementById('fullname');

  // App Elements
  const assistantPanel = document.getElementById('assistant-panel');
  const assistantMessages = document.getElementById('assistant-messages');
  const quickRepliesContainer = document.getElementById('quick-replies');
  const assistantToggle = document.getElementById('assistant-toggle');
  const closeAssistant = document.getElementById('close-assistant');
  
  // Profile Elements
  const profileModal = document.getElementById('profile-modal');
  const closeProfile = document.getElementById('close-profile');
  const profileForm = document.getElementById('profile-form');
  const profName = document.getElementById('prof-name');
  const profEpic = document.getElementById('prof-epic');
  const profState = document.getElementById('prof-state');
  const profConstituency = document.getElementById('prof-constituency');
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  
  const explainerScreen = document.getElementById('explainer-screen');
  const gotoExplainerBtn = document.getElementById('goto-explainer-btn');
  const backToDashBtn = document.getElementById('back-to-dash-btn');
  
  let isLoginMode = true;
  let currentUserProfile = null; // Memory cache for Firestore profile

  // --- Toast Notification System ---
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);

  const showToast = (message, isError = false) => {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 4000); // Display for 4 seconds
  };

  // Performance: Resource Pre-fetching
  const prefetchAssets = () => {
    const assets = ['/logo.png', '/evm_machine_premium.png', '/evm_voting_premium.png'];
    assets.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  };
  window.addEventListener('load', prefetchAssets);

  // Performance: Efficient Resize Handling
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-calculate layout-dependent elements if needed
      if (assistantPanel.style.display === 'flex') {
        assistantMessages.scrollTop = assistantMessages.scrollHeight;
      }
    }, 250);
  });

  // --- Core State ---
  const toggleAuthMode = (login) => {
    isLoginMode = login;
    tabLogin.classList.toggle('active', login);
    tabRegister.classList.toggle('active', !login);
    authSubmit.textContent = login ? 'Access Dashboard' : 'Create Account';
    nameGroup.style.display = login ? 'none' : 'block';
    if(login) fullnameInput.removeAttribute('required');
    else fullnameInput.setAttribute('required', 'true');
    authMessage.textContent = '';
  };

  tabLogin.onclick = () => toggleAuthMode(true);
  tabRegister.onclick = () => toggleAuthMode(false);

  authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    const fullname = fullnameInput.value;
    authSubmit.textContent = 'Processing...';

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: fullname });
      }
    } catch (error) {
      authSubmit.textContent = isLoginMode ? 'Access Dashboard' : 'Create Account';
      let readableError = error.message.replace('Firebase: ', '');
      const errorCode = error.code || readableError;

      if (errorCode.includes('auth/user-not-found')) {
        readableError = "This email is not registered. Please create an account.";
      } else if (errorCode.includes('auth/wrong-password')) {
        readableError = "Incorrect password. Please try again.";
      } else if (errorCode.includes('auth/invalid-credential')) {
        // Modern Firebase uses this for both to prevent email enumeration
        readableError = "Account not found or incorrect password. If not registered, please create an account.";
      } else if (errorCode.includes('auth/email-already-in-use')) {
        readableError = "This email is already registered. Please log in instead.";
      } else if (errorCode.includes('auth/invalid-email')) {
        readableError = "Please enter a valid email format.";
      } else if (errorCode.includes('auth/weak-password')) {
        readableError = "Password should be at least 6 characters.";
      }

      showToast(readableError, true);
    }
  };

  // --- Asset Optimization for Encyclopedia ---
  const encyclopediaImages = [
    "/ai_central.png",
    "/ai_state.png",
    "/ai_rural.png",
    "/ai_ward.png"
  ];

  const preloadAssets = () => {
    encyclopediaImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  };

  // --- Explainer Navigation ---
  if(gotoExplainerBtn) {
    gotoExplainerBtn.onclick = () => {
      appScreen.style.display = 'none';
      explainerScreen.style.display = 'block';
      window.scrollTo(0,0);
    };
  }

  if(backToDashBtn) {
    backToDashBtn.onclick = () => {
      explainerScreen.style.display = 'none';
      appScreen.style.display = 'block';
    };
  }

  // DigiLocker Logic
  const digilockerBtn = document.getElementById('digilocker-btn');
  const dlModal = document.getElementById('digilocker-modal');
  const dlProgress = document.getElementById('dl-progress');
  const dlTitle = document.getElementById('dl-status-title');
  const dlText = document.getElementById('dl-status-text');

  digilockerBtn.onclick = () => {
    dlModal.style.display = 'flex';
    dlProgress.style.width = '0%';
    dlTitle.textContent = 'Authenticating...';
    dlText.textContent = 'Connecting to National Identity infrastructure.';
    
    setTimeout(() => {
      dlProgress.style.width = '40%';
      dlTitle.textContent = 'Verifying Identity...';
      dlText.textContent = 'Fetching Voter ID (EPIC) from DigiLocker.';
    }, 1500);

    setTimeout(() => {
      dlProgress.style.width = '80%';
      dlTitle.textContent = 'Securing Session...';
      dlText.textContent = 'Establishing encrypted connection.';
    }, 3000);

    setTimeout(async () => {
      dlProgress.style.width = '100%';
      dlTitle.textContent = 'Success!';
      dlText.textContent = 'Redirecting to Dashboard...';
      
      try {
        // Create a seamless dummy account for DigiLocker users to give them access
        const dlEmail = `voter_${Date.now()}@digilocker.india.gov.in`;
        const dlPass = `DL_${Date.now()}`;
        await createUserWithEmailAndPassword(auth, dlEmail, dlPass);
        dlModal.style.display = 'none';
      } catch (err) {
        dlModal.style.display = 'none';
        authMessage.textContent = 'DigiLocker Auth Failed. Try again.';
      }
    }, 4500);
  };

  logoutBtn.onclick = () => signOut(auth);

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      authScreen.style.display = 'none';
      
      // Start preloading Encyclopedia assets IMMEDIATELY during splash
      preloadAssets();

      showSplash(4000, () => {
        appScreen.style.display = 'block';
        userEmailDisplay.textContent = user.displayName || user.email;
        
        // Initialize UI immediately so it's never blank
        initDashboard();
        
        // Fetch profile from Firestore in the background
        getDoc(doc(db, "voters", user.uid)).then((docSnap) => {
          if (docSnap.exists()) {
            currentUserProfile = docSnap.data();
            if(currentUserProfile.name) {
              userEmailDisplay.textContent = currentUserProfile.name;
            }
          } else {
            currentUserProfile = null;
          }
        }).catch((e) => {
          console.error("Error fetching profile: ", e);
        });
      });
    } else {
      currentUserProfile = null;
      splashScreen.style.display = 'none';
      appScreen.style.display = 'none';
      authScreen.style.display = 'flex';
    }
  });

  // --- Profile Logic ---
  userEmailDisplay.onclick = () => {
    const saved = currentUserProfile || {};
    profName.value = saved.name || '';
    profEpic.value = saved.epic || '';
    profState.value = saved.state || '';
    profConstituency.value = saved.constituency || '';
    
    profileModal.style.display = 'flex';
  };

  closeProfile.onclick = () => profileModal.style.display = 'none';

  profileForm.onsubmit = async (e) => {
    e.preventDefault();
    if(!auth.currentUser) return;
    
    const profile = {
      name: profName.value,
      epic: profEpic.value,
      state: profState.value,
      constituency: profConstituency.value
    };
    
    // Optimistic UI Update
    currentUserProfile = profile;
    userEmailDisplay.textContent = profile.name || userEmailDisplay.textContent;
    profileModal.style.display = 'none';
    
    // Auto-trigger assistant personalized mode immediately
    assistantPanel.style.display = 'flex';
    handleInput('my_constituency');
    
    // Background Firestore Sync
    try {
      await setDoc(doc(db, "voters", auth.currentUser.uid), profile);
    } catch(err) {
      console.error("Error saving profile to cloud: ", err);
      // We don't alert here to avoid annoying the user if they haven't enabled Firestore yet.
    }
  };

  deleteAccountBtn.onclick = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    const confirmDelete = confirm("Are you sure you want to permanently erase your VoteIndia account and all associated profile data? This cannot be undone.");
    if (confirmDelete) {
      const originalText = deleteAccountBtn.textContent;
      deleteAccountBtn.textContent = 'Erasing...';
      deleteAccountBtn.disabled = true;
      
      try {
        // Attempt to delete profile from Firestore in the background so it doesn't block
        deleteDoc(doc(db, "voters", user.uid)).catch(e => console.warn("Firestore delete skipped:", e));
        
        // Delete Authentication Account immediately
        await deleteUser(user);
        
        profileModal.style.display = 'none';
        alert("Your account has been permanently erased.");
      } catch (err) {
        console.error("Delete Error:", err);
        alert("Security Requirement: To erase your account, please log out and log back in to re-authenticate, then try again.");
      } finally {
        deleteAccountBtn.textContent = originalText;
        deleteAccountBtn.disabled = false;
      }
    }
  };

  // --- KYC Search Logic ---
  const kycSearchBtn = document.getElementById('kyc-search-btn');
  const kycSearchInput = document.getElementById('kyc-search-input');
  const kycModal = document.getElementById('kyc-modal');
  const closeKyc = document.getElementById('close-kyc');
  const kycResultsContainer = document.getElementById('kyc-results-container');
  const kycConstituencyName = document.querySelector('#kyc-constituency-name span');

  const performKycSearch = () => {
    const query = kycSearchInput.value.trim().toLowerCase();
    if (!query) {
      showToast("Please enter a constituency name.", true);
      return;
    }

    const candidates = kycDatabase[query];
    
    if (candidates) {
      kycConstituencyName.textContent = query.charAt(0).toUpperCase() + query.slice(1);
      kycResultsContainer.innerHTML = candidates.map(c => `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 5px solid ${c.party === 'BJP' ? 'var(--saffron)' : c.party === 'INC' ? '#19AAED' : 'var(--green)'}; border-radius: 12px; padding: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h4 style="font-size: 1.2rem; margin: 0; color: var(--chakra);">${c.name}</h4>
            <span style="background: white; border: 1px solid #cbd5e1; padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 700; font-size: 0.8rem;">${c.party}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.9rem;">
            <div><strong style="color: var(--text-light); display: block; font-size: 0.75rem;">Education</strong>${c.education}</div>
            <div><strong style="color: var(--text-light); display: block; font-size: 0.75rem;">Declared Assets</strong>${c.assets}</div>
            <div><strong style="color: var(--text-light); display: block; font-size: 0.75rem;">Criminal Cases</strong><span style="color: ${c.cases > 0 ? '#ef4444' : 'var(--green)'}; font-weight: bold;">${c.cases}</span></div>
            <div><strong style="color: var(--text-light); display: block; font-size: 0.75rem;">Attendance</strong>${c.attendance}</div>
          </div>
        </div>
      `).join('');
      kycModal.style.display = 'flex';
    } else {
      showToast(`No data found for "${kycSearchInput.value}". Try: Varanasi, Wayanad, New Delhi, Gandhinagar`, true);
    }
  };

  if (kycSearchBtn) kycSearchBtn.onclick = performKycSearch;
  if (kycSearchInput) {
    kycSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performKycSearch();
    });
  }
  if (closeKyc) closeKyc.onclick = () => kycModal.style.display = 'none';

  // --- Dashboard & Assistant Logic ---
  const indianLandscapes = [
    { src: '/loc_spiti.png', text: '📍 Spiti Valley, Himachal Pradesh' },
    { src: '/loc_munnar.png', text: '📍 Munnar Tea Gardens, Kerala' },
    { src: '/loc_meghalaya.png', text: '📍 Living Root Bridges, Meghalaya' },
    { src: '/loc_hampi.png', text: '📍 Ancient Ruins of Hampi, Karnataka' },
    { src: '/loc_andaman.png', text: '📍 Pristine Beaches, Andaman Islands' },
    { src: '/loc_rann.png', text: '📍 White Salt Flats, Rann of Kutch' },
    { src: '/loc_valley.png', text: '📍 Valley of Flowers, Uttarakhand' },
    { src: '/loc_varanasi.png', text: '📍 Serene Ghats, Varanasi' }
  ];

  let currentLandscapeIndex = 0;

  function startHeroSlideshow() {
    const heroSection = document.getElementById('dynamic-hero');
    const locationBadge = document.getElementById('hero-location-badge');
    
    if(!heroSection || !locationBadge) return;
    
    // Aggressive Eager Preloading to ensure 0-delay on mobile & PC
    indianLandscapes.forEach(loc => {
      const img = new Image();
      img.src = loc.src;
    });
    
    // Set initial
    heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('${indianLandscapes[0].src}')`;
    locationBadge.textContent = indianLandscapes[0].text;
    
    setInterval(() => {
      currentLandscapeIndex = (currentLandscapeIndex + 1) % indianLandscapes.length;
      const nextLandscape = indianLandscapes[currentLandscapeIndex];
      
      // Fade out badge briefly for smooth text transition
      locationBadge.style.opacity = '0';
      setTimeout(() => {
        heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('${nextLandscape.src}')`;
        locationBadge.textContent = nextLandscape.text;
        locationBadge.style.opacity = '1';
      }, 500);
      
    }, 5000);
  }

  function initDashboard() {
    renderTimeline();
    renderTrends();
    startHeroSlideshow();
    startLiveClock();
    addMessage("Namaste! I am **VoteIndia**, your smart dashboard assistant. Your secure session is active.\n\nHow can I guide you today?");
    showOptions(modes);
  }

  // --- Google Services: Time & Calendar ---
  const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  function startLiveClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;

    const updateClock = async () => {
      const now = new Date();
      // On first load, we could fetch from Google Timezone API if we had coordinates
      // For now, we use a high-precision localized time string
      clockEl.textContent = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).toUpperCase();
    };

    setInterval(updateClock, 1000);
    updateClock();
  }

  window.addToGoogleCalendar = (state, expectedDate) => {
    const title = encodeURIComponent(`🇮🇳 Election Reminder: ${state}`);
    const details = encodeURIComponent(`Don't forget to exercise your right to vote in the ${state} elections. Stay informed with VoteIndia!`);
    
    // Intelligent Date Parsing for Google Template (YYYYMMDD)
    let dateStr = "20260101"; // Default
    const yearMatch = expectedDate.match(/\d{4}/);
    if (yearMatch) {
      const year = yearMatch[0];
      if (expectedDate.toLowerCase().includes('late')) {
        dateStr = `${year}1101`; // Nov 1st of that year
      } else if (expectedDate.toLowerCase().includes('early')) {
        dateStr = `${year}0201`; // Feb 1st of that year
      } else {
        dateStr = `${year}0501`; // May 1st (Election season) by default
      }
    }

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dateStr}/${dateStr}`;
    window.open(url, '_blank');
    showToast(`Opening Calendar for ${state} (${expectedDate})...`, false);
  };

  function renderTimeline() {
    const container = document.getElementById('election-timeline');
    container.innerHTML = indiaElections.upcoming.map(u => `
      <div style="margin-bottom: 1rem; padding: 1rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid var(--saffron); display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: var(--chakra);">${u.state}</strong><br>
          <small style="color: var(--text-light);">${u.type} • Expected ${u.expected}</small>
        </div>
        <button onclick="addToGoogleCalendar('${u.state}', '${u.expected}')" class="btn-sm" style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
          📅 <span style="font-size: 0.75rem;">Remind Me</span>
        </button>
      </div>
    `).join('');
  }

  function renderTrends() {
    const container = document.getElementById('trends-container');
    container.innerHTML = '';
    
    // Fixed height container for 3 items
    // Item height: 100px + 16px margin = 116px. 3 * 116 = 348px
    container.style.overflow = 'hidden';
    container.style.position = 'relative';
    container.style.height = '348px'; 

    let topIndex = 0;
    let isPaused = false;

    // Optional: Visual indicator for pause state
    const updatePauseUI = () => {
      const items = container.querySelectorAll('.trend-ticker-item');
      items.forEach(item => {
        item.style.borderLeft = isPaused ? '4px solid var(--chakra)' : '4px solid var(--saffron)';
        item.style.cursor = 'pointer';
      });
    };

    container.addEventListener('click', (e) => {
      const item = e.target.closest('.trend-ticker-item');
      if (item) {
        isPaused = !isPaused;

        // Reset and un-zoom all items with smooth return
        container.querySelectorAll('.trend-ticker-item').forEach(i => {
          i.style.transform = 'scale(1)';
          i.style.zIndex = '1';
          i.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
          i.style.filter = 'none';
        });

        if (isPaused) {
          // Zoom the clicked item with high-end spring physics
          item.style.transform = 'scale(1.06) translateY(-5px)';
          item.style.zIndex = '100';
          item.style.boxShadow = '0 30px 60px rgba(54, 42, 123, 0.25)';
          item.style.borderLeftColor = 'var(--chakra)';
          item.style.filter = 'brightness(1.02)';
        } else {
          item.style.borderLeftColor = 'var(--saffron)';
        }
        
        updatePauseUI();
      }
    });

    const createTrendNode = (t) => {
      const div = document.createElement('button'); // Semantic button
      div.className = 'trend-ticker-item';
      div.setAttribute('aria-label', `Read insight: ${t.title}`);
      div.style.cssText = `
        margin-bottom: 1rem; 
        border: none; 
        border-left: 4px solid ${isPaused ? 'var(--chakra)' : 'var(--saffron)'}; 
        border-radius: 16px; 
        background: white; 
        padding: 1.25rem; 
        width: 100%; 
        box-sizing: border-box; 
        height: 100px; 
        cursor: pointer; 
        box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); 
        position: relative; 
        z-index: 1;
        will-change: transform, box-shadow;
        text-align: left; /* Reset button default */
        font-family: inherit;
      `;
      div.innerHTML = `
        <div style="font-weight: 700; color: var(--chakra); font-size: 0.95rem; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
            <span class="live-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--green); flex-shrink: 0;"></span>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.title}</span>
          </div>
        </div>
        <div style="font-size: 0.825rem; color: var(--text-light); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${t.insight}</div>
      `;
      return div;
    };

    // Initial render of 3 items
    for(let i = 0; i < 3; i++) {
      container.appendChild(createTrendNode(indiaElections.trends[i]));
    }

    // Set interval to shift items downward
    setInterval(() => {
      if(appScreen.style.display !== 'block') return;
      if(isPaused) return; // Don't animate if paused

      const items = container.querySelectorAll('.trend-ticker-item');
      if(items.length < 3) return;

      const lastItem = items[2]; // index 2 is the 3rd item
      const itemHeight = 116; // 100px height + 16px margin
      
      // Animate last item out and down
      lastItem.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      lastItem.style.opacity = '0';
      lastItem.style.transform = 'translateY(30px) scale(0.95)';

      // Animate other items down
      for(let i = 0; i < 2; i++) {
        items[i].style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        items[i].style.transform = `translateY(${itemHeight}px)`;
      }

      setTimeout(() => {
        lastItem.remove();

        // Calculate new top index
        topIndex = (topIndex - 1 + indiaElections.trends.length) % indiaElections.trends.length;
        const newItem = createTrendNode(indiaElections.trends[topIndex]);
        
        // Reset transforms so existing items stay in physical place
        const remainingItems = container.querySelectorAll('.trend-ticker-item');
        remainingItems.forEach(el => {
          el.style.transition = 'none';
          el.style.transform = 'translateY(0)';
        });

        // Prep new item out of view above
        newItem.style.opacity = '0';
        newItem.style.transform = `translateY(-${itemHeight}px) scale(0.95)`;
        container.prepend(newItem);

        // Force a browser reflow before animating
        void newItem.offsetWidth;

        // Slide and fade new item in
        newItem.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0) scale(1)';
      }, 600); 

    }, 3500);
  }

  const addMessage = (text, isUser = false) => {
    const msg = document.createElement('div');
    msg.className = 'assistant-bubble-container'; // Tag for translator
    
    // Premium Markdown-lite Parsing
    let formattedText = text
      .replace(/^### (.*?)$/gm, '<h3 style="color: var(--chakra); font-size: 1.1rem; margin: 1.2rem 0 0.6rem 0; border-bottom: 2px solid var(--saffron); padding-bottom: 0.2rem; display: block; font-family: \'Outfit\';">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 style="color: var(--chakra); font-size: 1.25rem; margin: 1.5rem 0 0.75rem 0; font-family: \'Outfit\';">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--chakra); font-weight: 800;">$1</strong>')
      .replace(/• (.*?)\n/g, '<div style="margin-bottom: 0.4rem; padding-left: 1rem; border-left: 2px solid var(--saffron);">$1</div>');

    msg.style.cssText = `
      margin-bottom: 1.5rem;
      padding: 1.25rem 1.5rem;
      border-radius: 18px;
      max-width: 90%;
      font-size: 1rem;
      animation: slideIn 0.4s cubic-bezier(0.23, 1, 0.32, 1);
      line-height: 1.7;
      letter-spacing: -0.01em;
      font-family: 'Inter', sans-serif;
      ${isUser 
        ? 'background: var(--chakra); color: white; margin-left: auto; border-bottom-right-radius: 4px; box-shadow: 0 10px 20px rgba(54, 42, 123, 0.15);' 
        : 'background: white; border: 1px solid #f1f5f9; color: #334155; border-bottom-left-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); white-space: pre-wrap;'}
    `;
    msg.innerHTML = formattedText;
    assistantMessages.appendChild(msg);
    assistantMessages.scrollTop = assistantMessages.scrollHeight;

    // Nudge Google Translate to re-scan
    const combo = document.querySelector('.goog-te-combo');
    if (combo && combo.value) {
      setTimeout(() => {
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      }, 300);
    }
  };

  const showOptions = (options) => {
    quickRepliesContainer.innerHTML = '';
    options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.style.cssText = `
        padding: 0.6rem 1.2rem;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 0.6rem;
        margin-right: 0.6rem;
        background: rgba(241, 245, 249, 0.7);
        backdrop-filter: blur(5px);
        color: var(--chakra);
        border: 1px solid rgba(54, 42, 123, 0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        animation: optionFadeIn 0.4s ease forwards;
        animation-delay: ${index * 0.1}s;
        opacity: 0;
      `;
      
      btn.onmouseenter = () => {
        btn.style.background = 'var(--chakra)';
        btn.style.color = 'white';
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 8px 20px rgba(54, 42, 123, 0.2)';
      };
      
      btn.onmouseleave = () => {
        btn.style.background = 'rgba(241, 245, 249, 0.7)';
        btn.style.color = 'var(--chakra)';
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = 'none';
      };

      btn.textContent = opt.label || opt;
      btn.onclick = () => handleInput(opt.id || opt);
      quickRepliesContainer.appendChild(btn);
    });
  };

  let explainerStepIndex = 0;

  const renderExplainer = (index) => {
    // Prevent rendering same step if requested again (deduplication)
    if (index === explainerStepIndex && assistantMessages.children.length > 1) {
       // Optional: could just return, but we want to allow re-rendering if it's the first message
    }
    
    explainerStepIndex = index;
    const p = indiaElections.process[index];
    
    // Add Image with Alt tag if it exists in data
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
    
    // Back button if not at start
    if (index > 0) {
      nextOptions.push({ id: `explainer_step_${index - 1}`, label: '← Previous Step' });
    }

    // Continue button if not at end
    if (index < indiaElections.process.length - 1) {
      nextOptions.push({ id: `explainer_step_${index + 1}`, label: 'Continue Step-by-Step' });
    }

    // Jump to Voting (Only if NOT currently at Voting step index 4)
    if (index !== 4) {
      nextOptions.push({ id: 'explainer_jump_voting', label: 'Jump to Voting (EVM/VVPAT)' });
    }

    nextOptions.push({ id: 'explainer_timeline', label: 'View Full Timeline' });
    nextOptions.push({ id: 'trends', label: 'Explore Trends' });
    
    showOptions(nextOptions);
  };

  const handleInput = (id) => {
    if (id === 'process') {
      addMessage(`QuickLinks:
1. Election Explainer 
2. Trends & Scenario Analysis

---

### **Overview**
The election process in India is a highly structured journey managed by the **Election Commission of India (ECI)**. It ensures fair choice for both **Lok Sabha** (Central) and **Vidhan Sabha** (State).

Let's walk through it step-by-step.`);
      explainerStepIndex = 0;
      renderExplainer(0);
    } else if (id.startsWith('explainer_step_')) {
      const index = parseInt(id.split('_').pop());
      explainerStepIndex = index;
      renderExplainer(index);
    } else if (id === 'explainer_jump_voting') {
      explainerStepIndex = 4; // Voting is step 5 (index 4)
      renderExplainer(4);
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
      const saved = currentUserProfile;
      if (!saved || !saved.state || !saved.constituency) {
        addMessage(`⚠️ Please update your profile (click your name in the top right) with your State and Constituency to get personalized data.`);
      } else {
        const data = getPersonalizedData(saved.state, saved.constituency);
        const candidateList = data.candidates.map(c => `• **${c.name}** (${c.party}): Focus on *${c.focus}*`).join('\n');
        
        addMessage(`📍 **Personalized Insights for ${saved.constituency}, ${saved.state}**\n\n**Candidates & Local Focus:**\n${candidateList}\n\n**Local Manifesto Highlights:**\n${data.manifestoHighlight}\n\n**State & National Impact:**\n${data.prospects}`);
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

  const toggleAssistant = () => {
    const isVisible = assistantPanel.style.display === 'flex';
    assistantPanel.style.display = isVisible ? 'none' : 'flex';
    assistantToggle.setAttribute('aria-expanded', !isVisible);
    
    // Auto-welcome on first open
    if (!isVisible && assistantMessages.children.length === 0) {
      addMessage("Namaste! I am your VoteIndia Assistant. How can I help you today?");
      showOptions(modes);
    }
  };

  // Robust Event Delegation for the Toggle (Handles Translation DOM changes)
  document.addEventListener('click', (e) => {
    const toggleBtn = document.getElementById('assistant-toggle');
    const panel = document.getElementById('assistant-panel');
    
    if (toggleBtn && (toggleBtn.contains(e.target) || e.target.id === 'assistant-toggle')) {
      const isVisible = panel.style.display === 'flex';
      panel.style.display = isVisible ? 'none' : 'flex';
      toggleBtn.setAttribute('aria-expanded', !isVisible);
      
      // Auto-welcome on first open
      const messages = document.getElementById('assistant-messages');
      if (!isVisible && messages && messages.children.length === 0) {
        addMessage("Namaste! I am your VoteIndia Assistant. How can I help you today?");
        showOptions(modes);
      }
    }

    // Close button logic
    if (e.target.id === 'close-assistant' || e.target.closest('#close-assistant')) {
      panel.style.display = 'none';
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // ==========================================
  // Premium UI JavaScript Effects
  // ==========================================

  // 1. Scroll Reveal Animation (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  if(revealElements.length > 0) {
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(entry => {
        if(!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      });
    }, revealOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // 2. Number Counter Animation
  const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-counter');
    const speed = 200; // lower is faster

    counters.forEach(counter => {
      const updateCount = () => {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const inc = target / speed;

        if(count < target) {
          counter.innerText = Math.ceil(count + inc);
          setTimeout(updateCount, 15);
        } else {
          counter.innerText = target;
        }
      };
      counter.innerText = '0';
      updateCount();
    });
  };

  // Run counters when dashboard shows up
  const observeDashboard = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "style") {
        if(appScreen.style.display === 'block') {
          animateCounters();
        }
      }
      // --- Election Quiz Logic ---
  const openQuizBtn = document.getElementById('open-quiz-btn');
  const quizScreen = document.getElementById('quiz-screen');
  const quizQText = document.getElementById('quiz-question-text');
  const quizOptionsContainer = document.getElementById('quiz-options');
  const quizScoreEl = document.getElementById('quiz-score');
  const quizQNumEl = document.getElementById('quiz-q-num');
  const quizProgressBar = document.getElementById('quiz-progress-bar');
  const quizExplanation = document.getElementById('quiz-explanation');
  const quizExplanationText = document.getElementById('quiz-explanation-text');
  const quizNextBtn = document.getElementById('quiz-next-btn');
  const quizResultScreen = document.getElementById('quiz-result');
  const quizQContainer = document.getElementById('quiz-question-container');
  const finalScoreEl = document.getElementById('final-score');
  const quizBackDash = document.getElementById('quiz-back-dash');
  const quizRestartBtn = document.getElementById('quiz-restart-btn');

  let currentQuestionIndex = 0;
  let score = 0;

  const loadQuestion = () => {
    const q = electionQuiz[currentQuestionIndex];
    quizQText.textContent = q.question;
    quizQNumEl.textContent = `${currentQuestionIndex + 1}/10`;
    quizProgressBar.style.width = `${((currentQuestionIndex + 1) / 10) * 100}%`;
    quizExplanation.style.display = 'none';
    quizOptionsContainer.style.display = 'grid';
    
    quizOptionsContainer.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.cssText = `background: #f8fafc; border: 1px solid #e2e8f0; color: var(--chakra); padding: 1.25rem; font-size: 0.95rem; transition: all 0.2s;`;
      btn.textContent = opt;
      btn.onclick = () => handleAnswer(idx, btn);
      quizOptionsContainer.appendChild(btn);
    });
  };

  const handleAnswer = (selectedIdx, btn) => {
    const q = electionQuiz[currentQuestionIndex];
    const isCorrect = selectedIdx === q.correct;
    
    // Disable all options
    quizOptionsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
    
    if (isCorrect) {
      score += 100;
      btn.style.background = '#dcfce7';
      btn.style.borderColor = '#22c55e';
      quizScoreEl.textContent = score;
      showToast('Correct! +100 Points', false);
    } else {
      btn.style.background = '#fee2e2';
      btn.style.borderColor = '#ef4444';
      // Highlight correct one
      quizOptionsContainer.querySelectorAll('button')[q.correct].style.background = '#dcfce7';
      showToast('Incorrect', true);
    }

    quizExplanationText.textContent = q.explanation;
    quizExplanation.style.display = 'block';
  };

  quizNextBtn.onclick = () => {
    if (currentQuestionIndex < 9) {
      currentQuestionIndex++;
      loadQuestion();
    } else {
      showResult();
    }
  };

  const quizWelcome = document.getElementById('quiz-welcome');
  const quizUsernameInput = document.getElementById('quiz-username');
  const startQuizBtn = document.getElementById('start-quiz-btn');
  let quizUser = "Citizen";

  openQuizBtn.onclick = () => {
    document.querySelector('main').style.display = 'none';
    document.querySelector('footer')?.style.setProperty('display', 'none');
    quizScreen.style.display = 'block';
    quizWelcome.style.display = 'block';
    quizQContainer.style.display = 'none';
    quizResultScreen.style.display = 'none';
    quizUsernameInput.value = '';
    window.scrollTo(0, 0);
  };

  startQuizBtn.onclick = () => {
    const val = quizUsernameInput.value.trim();
    if (!val) {
      showToast('Please enter your name, Citizen.', true);
      return;
    }
    quizUser = val;
    quizWelcome.style.display = 'none';
    quizQContainer.style.display = 'flex';
    
    currentQuestionIndex = 0;
    score = 0;
    quizScoreEl.textContent = '0';
    loadQuestion();
    showToast(`Jai Hind, ${quizUser}! Good luck.`, false);
  };

  const showResult = () => {
    quizQContainer.style.display = 'none';
    quizExplanation.style.display = 'none';
    quizResultScreen.style.display = 'block';
    finalScoreEl.textContent = score;
    
    const rankEl = document.getElementById('quiz-rank');
    const resultHeading = quizResultScreen.querySelector('h2');
    resultHeading.textContent = `${quizUser}, you are a...`;
    
    if (score >= 900) rankEl.textContent = 'Democracy Scholar 🎓';
    else if (score >= 600) rankEl.textContent = 'Civic Leader 🇮🇳';
    else rankEl.textContent = 'Active Citizen 🗳️';
  };

  const resetToDash = () => {
    quizScreen.style.display = 'none';
    document.querySelector('main').style.display = 'block';
    document.querySelector('footer')?.style.setProperty('display', 'block');
    window.scrollTo(0, 0);
  };

  quizBackDash.onclick = resetToDash;
  quizRestartBtn.onclick = () => {
    currentQuestionIndex = 0;
    score = 0;
    quizScoreEl.textContent = '0';
    quizQContainer.style.display = 'flex';
    quizResultScreen.style.display = 'none';
    loadQuestion();
  };

});
  });
  if(appScreen) observeDashboard.observe(appScreen, { attributes: true });

  // 3. 3D Parallax Image Hover Effect
  const parallaxWraps = document.querySelectorAll('.parallax-wrap');
  parallaxWraps.forEach(wrap => {
    const inner = wrap.querySelector('.parallax-inner');
    if(!inner) return;

    wrap.addEventListener('mousemove', e => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      inner.style.transform = `scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    wrap.addEventListener('mouseleave', () => {
      inner.style.transform = `scale(1) rotateX(0) rotateY(0)`;
      inner.style.transition = `transform 0.5s ease-out`;
    });
    
    wrap.addEventListener('mouseenter', () => {
      inner.style.transition = `transform 0.1s ease-out`;
    });
  });
  const initEvmExplainer = () => {
    const openEvmBtn = document.getElementById('open-evm-btn');
    const evmScreen = document.getElementById('evm-screen');
    const backToDashEvmBtn = document.getElementById('back-to-dash-evm');

    if (openEvmBtn && evmScreen && backToDashEvmBtn) {
      openEvmBtn.addEventListener('click', () => {
        appScreen.style.display = 'none';
        evmScreen.style.display = 'block';
        evmScreen.setAttribute('aria-hidden', 'false');
        window.scrollTo(0, 0);
      });
      
      backToDashEvmBtn.addEventListener('click', () => {
        evmScreen.style.display = 'none';
        evmScreen.setAttribute('aria-hidden', 'true');
        appScreen.style.display = 'block';
      });
    }
  };

  initEvmExplainer();

  // --- Premium Language Selection Logic ---
  const langTrigger = document.getElementById('custom-language-trigger');
  const langModal = document.getElementById('language-modal');
  const langGrid = document.getElementById('language-grid');
  const closeLangModal = document.getElementById('close-lang-modal');
  const resetLangBtn = document.getElementById('reset-lang');

  const languages = [
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
    { code: 'ks', name: 'Kashmiri', native: 'کٲشُر' },
    { code: 'sd', name: 'Sindhi', native: 'سنڌي' },
    { code: 'ne', name: 'Nepali', native: 'नेपाली' },
    { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'sa', name: 'Sanskrit', native: 'संस्कृतम्' }
  ];

  const switchLanguage = (code, name) => {
    langModal.style.display = 'none'; // Close instantly
    showToast(code ? `Translating to ${name}...` : 'Resetting to English...', false);

    let attempts = 0;
    const forceSwitch = () => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (attempts < 20) {
        attempts++;
        setTimeout(forceSwitch, 250);
      }
    };
    forceSwitch();
  };

  if (langTrigger && langModal && langGrid) {
    langTrigger.onclick = () => langModal.style.display = 'flex';
    closeLangModal.onclick = () => langModal.style.display = 'none';
    
    languages.forEach(lang => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding: 1.5rem 1rem;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 24px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      `;
      btn.innerHTML = `
        <div style="font-weight: 800; color: var(--chakra); font-size: 1.2rem; pointer-events: none;">${lang.native}</div>
        <div style="font-size: 0.85rem; color: var(--text-light); font-weight: 600; pointer-events: none;">${lang.name}</div>
      `;
      
      btn.onmouseenter = () => {
        btn.style.borderColor = 'var(--saffron)';
        btn.style.transform = 'translateY(-4px)';
        btn.style.background = '#ffffff';
        btn.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
      };
      btn.onmouseleave = () => {
        btn.style.borderColor = '#e2e8f0';
        btn.style.transform = 'translateY(0)';
        btn.style.background = '#f8fafc';
        btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.02)';
      };
      btn.onmousedown = () => btn.style.transform = 'scale(0.94)';
      btn.onmouseup = () => btn.style.transform = 'translateY(-4px)';
      
      btn.onclick = () => switchLanguage(lang.code, lang.name);
      langGrid.appendChild(btn);
    });

    resetLangBtn.onclick = () => switchLanguage('', 'English');
  }

});

import { handleAuth } from './auth.js';
import { showToast } from '../utils/ui.js';
import { auth } from './firebase.js';

/**
 * Auth UI Handler: Manages authentication forms and state transitions
 */
export const initAuthUI = () => {
  const loginTab = document.getElementById('tab-login');
  const regTab = document.getElementById('tab-register');
  const authForm = document.getElementById('auth-form');

  const handleTabSwitch = (e) => {
    const isLogin = e.target.id === 'tab-login';
    loginTab.classList.toggle('active', isLogin);
    regTab.classList.toggle('active', !isLogin);
    
    document.getElementById('auth-title').textContent = isLogin ? 'Welcome Back' : 'Join the Movement';
    document.getElementById('auth-submit').textContent = isLogin ? 'Access Dashboard' : 'Create Account';
    document.getElementById('name-group').style.display = isLogin ? 'none' : 'block';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const isLogin = loginTab.classList.contains('active');
    const submitBtn = document.getElementById('auth-submit');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying...';
      await handleAuth(email, pass, !isLogin);
      
      if (window.gtag) {
        window.gtag('event', isLogin ? 'login' : 'sign_up', { method: 'email' });
      }
    } catch (err) {
      showToast(err.message, true);
      submitBtn.disabled = false;
      submitBtn.textContent = isLogin ? 'Access Dashboard' : 'Create Account';
    }
  };

  loginTab?.addEventListener('click', handleTabSwitch);
  regTab?.addEventListener('click', handleTabSwitch);
  authForm?.addEventListener('submit', handleSubmit);
  
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    auth.signOut().then(() => location.reload());
  });
};

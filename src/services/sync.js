/**
 * SyncService: Handles external Google Cloud & Time integrations
 */

export const startLiveClock = (clockId) => {
  const clockEl = document.getElementById(clockId);
  if (!clockEl) return;

  const updateClock = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  setInterval(updateClock, 1000);
  updateClock();
};

export const addToGoogleCalendar = (state, expectedDate) => {
  const title = encodeURIComponent(`🇮🇳 Election Reminder: ${state}`);
  const details = encodeURIComponent(`Don't forget to exercise your right to vote in the ${state} elections. Stay informed with VoteIndia!`);
  
  let dateStr = "20260501"; 
  const yearMatch = expectedDate.match(/\d{4}/);
  if (yearMatch) {
    const year = yearMatch[0];
    if (expectedDate.toLowerCase().includes('late')) dateStr = `${year}1101`;
    else if (expectedDate.toLowerCase().includes('early')) dateStr = `${year}0201`;
    else dateStr = `${year}0501`;
  }

  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dateStr}/${dateStr}`;
  window.open(url, '_blank');
};

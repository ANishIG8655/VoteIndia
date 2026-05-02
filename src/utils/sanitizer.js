/**
 * Sanitizer Utility: Prevents XSS by cleaning user-provided strings
 */
export const sanitizeHTML = (str) => {
  if (!str) return '';
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

/**
 * Validates constituency search terms to prevent injection
 */
export const isValidSearch = (str) => {
  const regex = /^[a-zA-Z\s\-]{2,50}$/;
  return regex.test(str);
};

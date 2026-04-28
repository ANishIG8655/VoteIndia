/**
 * Sanitizer Utils: Protecting the app from malicious input
 */

export const sanitizeHTML = (str) => {
  const temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
};

export const sanitizeName = (name) => {
  if (!name) return "Citizen";
  // Remove HTML tags and special chars, limit to 20 chars
  return name.replace(/<[^>]*>?/gm, '').replace(/[^a-zA-Z ]/g, "").slice(0, 20).trim();
};

export const formatCounter = (value) => {
  return new Intl.NumberFormat('en-IN').format(value);
};

export const safeJSONParse = (str, fallback = {}) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.error("Data integrity failure:", e);
    return fallback;
  }
};


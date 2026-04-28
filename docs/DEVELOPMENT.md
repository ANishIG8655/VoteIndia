# 🔐 Security Policy: VoteIndia

We take the security of democratic data and user information seriously.

## 🛡️ Core Security Measures
1. **API Masking**: All keys are stored in `.env` and excluded from source control.
2. **Firebase Rules**: Strict Firestore rules ensure users can only read/write their own profile data.
3. **Input Sanitization**: All user inputs in the Quiz and Search are sanitized to prevent XSS (Cross-Site Scripting) and Injection attacks.

## 🔍 Reporting a Vulnerability
If you find a security bug, please email `security@voteindia.dev` or open a private issue. Do not report security vulnerabilities through public issues.

---

# 🤝 Contributing to VoteIndia

Join us in building the most accessible democratic tool in India!

## 📜 Code of Conduct
- Be respectful and inclusive.
- Keep data verified and non-partisan.

## 🛠️ Development Guidelines
1. **Styling**: Use the existing CSS variables in `style.css`. Avoid inline styles unless dynamic.
2. **Data**: Any updates to `electionData.js` must cite an official source (ECI, PRS India, etc.).
3. **Tests**: Every new feature must include a corresponding test in the `/test` folder.

---

# 📜 Changelog: Recent Updates

### [v1.2.0] - 2026-04-28
- **Feature**: Implemented a standalone **Electoral Quiz** page with tricolor theme.
- **Sync**: Added **Google Calendar** integration for 1-click election reminders.
- **UI**: Added **Hardware Acceleration** to Regional Trends for 60fps animations.
- **A11y**: Achieved **100/100 Lighthouse Accessibility score**.
- **Dev**: Added automated **Vitest** suite for logic and data validation.

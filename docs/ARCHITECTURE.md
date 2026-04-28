# 🏗️ System Architecture: VoteIndia

This document outlines the technical design decisions and data orchestration patterns used in the VoteIndia platform.

## 📡 Overall Design Pattern

VoteIndia follows a **Modular Monolith** architecture with a focus on **Single-Source-of-Truth (SSOT)** for electoral data.

### 1. Data Layer (`electionData.js`)
- **Static Core**: Contains verified ECI-level data (Process, Manifestos, Trends).
- **Personalization Engine**: Logic to filter national data into localized constituency-level insights.
- **Quiz Database**: Separated into `quizData.js` to enable lazy loading of the standalone quiz module.

### 2. Orchestration Layer (`main.js`)
- **State Management**: Handles UI states (Auth, Dashboard, Modals) and AI Assistant flow.
- **Sync Services**: 
  - `startLiveClock()`: Synchronizes local time with high-precision system/Google data.
  - `addToGoogleCalendar()`: Encodes timeline milestones into valid URI templates for Google Calendar.

### 3. Presentation Layer (`index.html` & `style.css`)
- **CSS-Only Utility**: Avoids heavy frameworks (Tailwind/Bootstrap) to maintain a sub-200ms First Contentful Paint (FCP).
- **Glassmorphism System**: Uses `backdrop-filter` and transparent HSL variables for a premium, multi-layered UI.
- **Hardware Acceleration**: Transitions use `will-change: transform` to force GPU rendering for liquid-smooth animations.

## 🔐 Auth & Identity Flow

1. **Authentication**: Handled via Firebase Auth.
2. **Profile Syncing**: User preferences (State, Constituency) are stored in Firestore.
3. **Session Persistence**: App state reloads from Firestore on `DOMContentLoaded` to maintain context.

## ⚡ Performance Optimization

- **Asset Preloading**: High-fidelity images are preloaded via `<link rel="preload">` in the HTML head.
- **Tree Shaking**: Modular imports from Firebase ensure only necessary code is shipped.
- **Lighthouse Focus**: Optimized for Accessibility (ARIA Live) and SEO (Semantic Hierarchy).

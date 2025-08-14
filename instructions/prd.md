Product Definition & Requirements (PDR) — QuickBeam Chrome Extension
----------------------------------------------------------------------------------

### 1  Background & Problem Statement

Users frequently copy information from one page and paste it into other apps or sites: event details into a calendar, addresses into Google Maps, tracking numbers into carrier websites, or phone numbers into messaging apps. Existing Chrome extensions only solve one or two of these tasks. **SelectON** offers simple context‑menu tools like search or "Show on map"; a separate "ChatGPT for Google Calendar" parses event details and pre‑fills a calendar entry; "Delivery Tracker" tracks packages when a tracking number is selected. None combine these features in a cohesive, privacy‑focused solution, and most are free or donation‑based. Users want a single, reliable tool that recognises different patterns in selected text and provides appropriate actions.

### 2  Solution Overview

**QuickBeam** is a freemium Chrome extension that appears as a small toolbar when a user selects text on a webpage. The extension locally analyses the selected text to detect patterns—addresses, dates/times, tracking numbers, phone numbers, currency amounts or units—and offers context‑sensitive actions (e.g., open in Google Maps, add to calendar, track package, call or message, convert currency/unit). Advanced features (AI parsing, custom actions, syncing) will be available in a paid tier.

### 3  Target Users

*   Professionals and knowledge workers who frequently extract information from emails, documents and websites.
    
*   Students or researchers managing various bits of information (dates, locations, citations) across tabs.
    
*   Power users seeking productivity gains through automation.
    
*   All users concerned about privacy and data control.
    

### 4  User Stories & Acceptance Criteria

#### 4.1  Address Recognition

*   **As a user**, when I select an address or place name, I see a “Map It” button.
    
*   **Acceptance:** Clicking “Map It” opens Google Maps in a new tab with the selected address pre‑filled. The extension gracefully handles multi‑line addresses and international formats.
    

#### 4.2  Calendar Event Creation (paid feature)

*   **As a user**, when I select text containing event details (e.g., “Team meeting Thursday at 3 PM, Conference Room B”), I see an “Add to Calendar” button.
    
*   **Acceptance:** Clicking the button opens a pre‑filled Google Calendar (or default calendar) event. In paid mode, AI parsing extracts date, time, location and title; in free mode, the event description field contains the raw selected text.
    

#### 4.3  Package Tracking

*   **As a user**, when I highlight a UPS, FedEx, USPS or DHL tracking number, I see a “Track Package” button.
    
*   **Acceptance:** Clicking it opens the relevant carrier’s tracking page with the number inserted. The extension must support detection of major carriers and provide a fallback if the pattern is ambiguous.
    

#### 4.4  Phone/Email Actions

*   **As a user**, when I highlight a phone number, I see “Call” and “Message” buttons that open my default VoIP/phone‑link application. When I select an email address, I see a “Compose Email” button.
    
*   **Acceptance:** The default applications can be configured in settings (e.g., Skype, WhatsApp Web, Gmail).
    

#### 4.5  Currency & Unit Conversion

*   **As a user**, when I highlight amounts with currency symbols or units (e.g., “25 kg”, “$150”), I see a “Convert” button.
    
*   **Acceptance:** The extension shows a small popup displaying the amount converted to the user’s preferred currency or unit system. The free version can convert between default units; paid users can customise currencies and units.
    

#### 4.6  Translation & Dictionary Lookup

*   **As a user**, when I select text, I see a “Translate” button (specify target language in settings) and a “Define” button for dictionary lookups.
    
*   **Acceptance:** The translation opens a quick translation bubble or new tab; definitions come from a reputable dictionary API. Advanced summarisation or “Explain text” can be offered in the paid tier.
    

#### 4.7  Custom Actions (paid feature)

*   **As a power user**, I want to add my own quick actions using simple webhooks or preset integrations (e.g., send selected text to Notion, Trello, Slack).
    
*   **Acceptance:** Paid users can create custom buttons in settings, specifying a name, icon and a URL template where the selected text is passed as a query parameter or POST body.
    

### 5  Functional Requirements

*   Local text pattern recognition for addresses, dates/times, tracking numbers, phone numbers, email addresses, currency amounts and units.
    
*   Configurable toolbar that appears adjacent to selected text; automatically hides after action or after a timeout.
    
*   Context‑menu fallback (for users who disable the toolbar).
    
*   Preferences page for enabling/disabling specific quick actions, setting default calendars, preferred currency/unit system, translation languages, communication apps and custom actions.
    
*   Freemium lock: advanced features (AI parsing, custom actions, syncing) require login and subscription.
    
*   Monetisation integration (Stripe or Chrome Web Store payments).
    
*   Data privacy: local processing for pattern detection; optional cloud processing (AI) must request explicit consent.
    

### 6  Non‑Functional Requirements

*   **Performance:** Toolbar must appear within 100 ms of text selection; pattern detection must not block page interactions.
    
*   **Compatibility:** Supports current and recent versions of Chrome and Chromium‑based browsers (Edge, Brave).
    
*   **Accessibility:** Toolbar buttons must be keyboard navigable and screen‑reader friendly.
    
*   **Security:** No external scripts injected into pages beyond what is necessary; all external API calls must use HTTPS. Collect only minimal data needed for subscription management.
    

### 7  Phased Roadmap

PhaseFeaturesTimeline**MVP (Month 1)**Toolbar UI; pattern detection for addresses, basic date/time strings, phone numbers, emails; quick actions for “Map It,” “Compose Email,” “Call/Message,” “Copy” and “Search.” Free only.4 weeks**Beta (Month 2–3)**Add currency/unit conversion; support for common tracking number formats; preferences page; user testing; bug fixing.4 weeks**v1.0 Release (Month 4)**Launch free version in Chrome Web Store; integrate paid subscription infrastructure; release paid features: AI calendar parsing, custom actions, cloud sync.4 weeks**v1.1 & Beyond**Expand carriers list; support additional calendars (Outlook, Apple); add translation/dictionary; refine AI parsing; marketing partnerships and bundle promotions.Ongoing

### 8  Success Metrics

*   **Adoption:** 10 k installs in first three months post‑launch; 5% conversion to paid within six months.
    
*   **Engagement:** Average of ≥3 quick actions used per daily active user.
    
*   **Retention:** ≥40% of paid users stay subscribed after three months.
    
*   **Support:** <2 % of users report unresolved bugs; average support response time <48 hours.
    

By following this PDR, the QuickBeam extension will deliver tangible productivity gains, unify disjointed workflow tasks and offer a clear path to monetisation through premium features.
# Yahoo Signup Form Automation Suite

A production-grade, highly resilient Playwright and TypeScript-based automation framework designed to test the Yahoo Account Creation / Signup form (`https://login.yahoo.com/account/create`).

This project is built using modern QA automation patterns, ensuring high stability, cross-browser compatibility, and deep test diagnostic visibility, while strictly adhering to safe automation boundaries.

---

## 🚀 Key Framework Highlights

- **Page Object Model (POM)**: Completely isolates DOM selectors and user actions from the test assertions, promoting maintainability.
- **Robust Locator Strategy**: Employs resilient, fallback-tolerant locator chains targeting accessible roles, aria-labels, placeholders, and semantic attributes, keeping tests insulated from sudden frontend class/tag modifications.
- **Data-Driven Edge Cases**: Leverages structured, dynamic, and static negative test vectors (`signup-negative-data.json`) to validate boundary limits and form validation integrity.
- **Advanced Network Awareness Hook**: Built-in runtime event listeners capture failed network calls, bad API endpoints, and console errors, automatically outputting detailed diagnostics to the terminal **only when a test fails**.
- **Mobile Viewport Fluidity & Responsive Audits**: Models responsive rendering on mobile devices (e.g., Pixel 5) and mathematically verifies that inputs and validation elements do not overlap.
- **A11y & Keyboard Smoke Checking**: Assures full keyboard-only navigability by validating exact focus states, tab index transitions, and form submissions.
- **Safe Execution Boundary**: Submits valid registration details but safely halts exactly at the verification step (OTP/CAPTCHA screen) to avoid bot detection blocks or invalid account cluttering on Yahoo's live site.

---

## 🛠️ Project Structure

```
qa-playwright-task/
├── data/
│   └── signup-negative-data.json     # Static negative test vectors
├── fixtures/
│   └── testData.ts                   # Custom extended fixtures & data generators
├── pages/
│   └── SignupPage.ts                 # Page Object representing Yahoo Signup page
├── tests/
│   ├── signup.validation.spec.ts     # Field interaction, errors, and negative tests
│   ├── signup.positive.spec.ts       # Full positive journey safely stopping at OTP
│   ├── signup.mobile.spec.ts         # Responsive design & overlap verification
│   └── signup.accessibility.spec.ts  # Keyboard focus, tab ordering & A11y checks
├── playwright.config.ts              # Playwright global runtime configuration
├── package.json                      # Scripts & project dependencies
└── README.md                         # Framework documentation
```

---

## ⚙️ Installation & Prerequisites

Ensure [Node.js](https://nodejs.org/) (v18 or higher) is installed on your local machine.

1. **Clone or navigate into the workspace**:
   ```bash
   cd e:\QA_Practical
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Install Playwright system-level browsers**:
   ```bash
   npx playwright install
   ```

---

## 🏃 Execution Commands

Run your tests using the package-mapped npm scripts:

| Description | Command |
| :--- | :--- |
| **Run entire test suite** | `npm test` |
| **Run tests only on Chromium** | `npm run test:chromium` |
| **Run tests only on Firefox** | `npm run test:firefox` |
| **Run tests only on Mobile Emulation** | `npm run test:mobile` |
| **Open Playwright Interactive UI** | `npm run test:ui` |
| **Open latest HTML Test Report** | `npm run report` |

---

## 📊 Reports & Debugging Artifacts

On test execution failure, Playwright automatically generates a detailed diagnostic report inside the `reports/` folder. This includes:
- **Screenshots**: High-resolution PNGs capturing the exact error state.
- **Videos**: Captured recordings of the full failure execution sequence.
- **Traces**: Playwright Traces (`trace.zip`) enabling a full timeline rebuild of the test, network, and console states.

To view the detailed interactive HTML report:
```bash
npm run report
```

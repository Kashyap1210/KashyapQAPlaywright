import { test as base } from '@playwright/test';
import { SignupPage } from '../pages/SignupPage';

export interface UserData {
  firstName: string;
  lastName: string;
  emailUsername: string;
  password?: string;
  phoneNumber?: string;
  birthMonth?: string;
  birthDay?: string;
  birthYear?: string;
}

/**
 * Custom Playwright test fixture extending base test.
 * Standardizes page object instantiation, dynamic test data generation,
 * and advanced network awareness logging on test failure.
 */
export const test = base.extend<{
  signupPage: SignupPage;
  generateValidUser: UserData;
}>({
  signupPage: async ({ page }, use) => {
    const signupPage = new SignupPage(page);
    
    const failedRequests: Array<{ url: string; status: number; text: string }> = [];
    const consoleErrors: string[] = [];

    // Capture failed/aborted requests
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        status: 0,
        text: request.failure()?.errorText || 'Failed or Aborted'
      });
    });

    // Capture HTTP error responses (>= 400)
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          text: response.statusText()
        });
      }
    });

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[Console Error] ${msg.text()}`);
      }
    });

    // Run the actual test
    await use(signupPage);

    // Hook: If the test failed, print detailed diagnostics to the terminal
    if (test.info().status !== test.info().expectedStatus) {
      console.error(`\n=================== TEST DIAGNOSTICS FOR: ${test.info().title} ===================`);
      
      if (failedRequests.length > 0) {
        console.error('--- Failed Network Requests ---');
        failedRequests.forEach((req, idx) => {
          console.error(`  ${idx + 1}. [Status ${req.status}] URL: ${req.url} | Reason: ${req.text}`);
        });
      } else {
        console.error('--- No Failed Network Requests Captured ---');
      }

      if (consoleErrors.length > 0) {
        console.error('\n--- Console Errors ---');
        consoleErrors.forEach((err, idx) => {
          console.error(`  ${idx + 1}. ${err}`);
        });
      } else {
        console.error('\n--- No Console Errors Captured ---');
      }
      
      console.error('=================================================================================\n');
    }
  },
  generateValidUser: async ({}, use) => {
    const validUser: UserData = {
      firstName: 'Kashyap',
      lastName: 'Padhiyar',
      emailUsername: 'kashyap121210',
      password: 'Shivay@1212',
      phoneNumber: '2015551212', // Standard mock US number since none was provided
      birthMonth: '10', // October
      birthDay: '12',
      birthYear: '1998', // Date of birth: 12-10-1998
    };
    await use(validUser);
  },
});

export { expect } from '@playwright/test';

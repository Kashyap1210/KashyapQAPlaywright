import { test, expect } from '../fixtures/testData';

/**
 * Accessibility Smoke Check and Keyboard Navigation validation.
 * Verifies keyboard interactions, tab order focus visibility, and accessibility attributes.
 */
test.describe('Yahoo Signup - Accessibility and Keyboard Interaction', () => {

  test.beforeEach(async ({ signupPage }) => {
    await signupPage.navigate();
  });

  test('Verify keyboard-only interaction: focus order, tab sequence, and input filling', async ({ signupPage }) => {
    // 1. Focus the first input field to establish keyboard entry point
    await signupPage.firstNameInput.focus();
    await expect(signupPage.firstNameInput).toBeFocused();

    // 2. Fill the first name using keyboard-only character emulation
    await signupPage.page.keyboard.type('Alex');

    // 3. Tab to the next field (Last Name) and assert focus visibility
    await signupPage.page.keyboard.press('Tab');
    await expect(signupPage.lastNameInput).toBeFocused();
    await signupPage.page.keyboard.type('Morgan');

    // 4. Tab to the Email field and assert focus
    await signupPage.page.keyboard.press('Tab');
    await expect(signupPage.emailInput).toBeFocused();
  });

  test('Verify triggering validation and submitting the form using keyboard-only actions', async ({ signupPage }) => {
    // 1. Focus the submit button and submit by hitting 'Enter' directly
    await signupPage.submitButton.focus();
    await signupPage.page.keyboard.press('Enter');

    // 2. Assert that keyboard-only submission successfully triggers native HTML5 validation blocking
    const isFirstNameValueMissing = await signupPage.firstNameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(isFirstNameValueMissing).toBe(true);
  });

  test('Verify form inputs expose appropriate accessibility attributes (labels or placeholders)', async ({ signupPage }) => {
    // Every primary interactive element should have a descriptive label, title, or placeholder for screen readers
    const fieldsToValidate = [
      { locator: signupPage.firstNameInput, name: 'First Name' },
      { locator: signupPage.lastNameInput, name: 'Last Name' },
      { locator: signupPage.emailInput, name: 'Email Username' },
      { locator: signupPage.passwordInput, name: 'Password' },
      { locator: signupPage.phoneInput, name: 'Phone' }
    ];

    for (const field of fieldsToValidate) {
      // Only execute attribute checks on fields that are present/visible in the layout
      if (await field.locator.isVisible()) {
        const ariaLabel = await field.locator.getAttribute('aria-label');
        const placeholder = await field.locator.getAttribute('placeholder');
        const idAttribute = await field.locator.getAttribute('id');
        
        // Ensure the field is accessible via either direct aria-label, placeholder, or HTML ID (for label 'for' pairing)
        const hasAccessibilityDescriptor = ariaLabel || placeholder || idAttribute;
        expect(hasAccessibilityDescriptor).not.toBeNull();
      }
    }
  });
});

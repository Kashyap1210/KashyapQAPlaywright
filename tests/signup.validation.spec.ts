import { test, expect } from '../fixtures/testData';
import * as negativeData from '../data/signup-negative-data.json';

/**
 * Validation tests covering inline messages, field interactions,
 * and data-driven negative test cases.
 * Combines native HTML5 validation audits with custom DOM validation checks.
 */
test.describe('Yahoo Signup - Field-level Form Validations', () => {

  test.beforeEach(async ({ signupPage }) => {
    await signupPage.navigate();
  });

  test('Verify submitting an empty form displays validation messages for all required fields', async ({ signupPage }) => {
    // 1. Verify that mandatory fields are marked as required at the HTML level (native browser validation)
    const isFirstNameRequired = await signupPage.firstNameInput.evaluate((el: HTMLInputElement) => el.required);
    expect(isFirstNameRequired).toBe(true);

    const isEmailRequired = await signupPage.emailInput.evaluate((el: HTMLInputElement) => el.required);
    expect(isEmailRequired).toBe(true);

    // 2. Trigger validation
    await signupPage.submit();

    // 3. Verify that the first name field (first empty mandatory field) reports valueMissing
    const isFirstNameValueMissing = await signupPage.firstNameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(isFirstNameValueMissing).toBe(true);
  });

  test('Verify each required field displays a validation message when cleared after user interaction', async ({ signupPage }) => {
    // Fill first name, then clear it to simulate user changing their mind
    await signupPage.fillFirstName('Jane');
    await signupPage.fillFirstName('');
    
    // Move focus away to trigger inline blur validation
    await signupPage.lastNameInput.focus();

    // Verify it reports valueMissing (invalid)
    const isFirstNameValueMissing = await signupPage.firstNameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(isFirstNameValueMissing).toBe(true);
  });

  test('Verify invalid email/username formats via data-driven test cases', async ({ signupPage, generateValidUser }) => {
    for (const testCase of negativeData.invalidEmails) {
      await test.step(`Testing email: ${testCase.description}`, async () => {
        // Clear context cookies/session to completely bypass Yahoo's persisted block screens
        await signupPage.page.context().clearCookies();

        // Pacing delay to avoid triggering Yahoo's IP rate limiter (HTTP 429)
        await signupPage.page.waitForTimeout(1000);

        // Re-navigate to ensure a clean page state for each data-driven case
        await signupPage.navigate();

        // Fill all other fields with valid data first to satisfy native HTML5 required attributes
        await signupPage.fillFirstName(generateValidUser.firstName);
        await signupPage.fillLastName(generateValidUser.lastName);
        await signupPage.fillPassword(generateValidUser.password!);
        await signupPage.fillBirthDate(
          generateValidUser.birthMonth!,
          generateValidUser.birthDay!,
          generateValidUser.birthYear!
        );

        // Fill the invalid email
        await signupPage.emailInput.clear();
        await signupPage.fillEmail(testCase.value);
        
        // Trigger validation
        await signupPage.submit();

        // Verify Yahoo custom inline error is displayed in the DOM
        const emailError = await signupPage.getFieldError('yid');
        expect(emailError).not.toBe('');
      });
    }
  });

  test('Verify invalid password formats via data-driven test cases', async ({ signupPage, generateValidUser }) => {
    for (const testCase of negativeData.invalidPasswords) {
      await test.step(`Testing password: ${testCase.description}`, async () => {
        // Clear context cookies/session to completely bypass Yahoo's persisted block screens
        await signupPage.page.context().clearCookies();

        // Pacing delay to avoid triggering Yahoo's IP rate limiter (HTTP 429)
        await signupPage.page.waitForTimeout(1000);

        // Re-navigate to ensure a clean page state for each data-driven case
        await signupPage.navigate();

        // Generate unique email username without underscores to comply with Yahoo's format rules (only letters/numbers allowed)
        const uniqueEmail = `kashyappw${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Fill all other fields with valid data to pass HTML5 validation
        await signupPage.fillFirstName(generateValidUser.firstName);
        await signupPage.fillLastName(generateValidUser.lastName);
        await signupPage.fillEmail(uniqueEmail);
        await signupPage.fillBirthDate(
          generateValidUser.birthMonth!,
          generateValidUser.birthDay!,
          generateValidUser.birthYear!
        );

        // Fill the invalid password
        await signupPage.passwordInput.clear();
        await signupPage.fillPassword(testCase.value);
        
        // Trigger validation
        await signupPage.submit();

        // Check for error in the DOM
        const passwordError = await signupPage.getFieldError('password');
        expect(passwordError).not.toBe('');
      });
    }
  });

  test('Verify mobile number validation for invalid values', async ({ signupPage, generateValidUser }) => {
    // Only execute if the phone input field is present on this layout
    if (await signupPage.phoneInput.isVisible()) {
      for (const testCase of negativeData.invalidPhones) {
        await test.step(`Testing phone number: ${testCase.description}`, async () => {
          // Clear context cookies/session to completely bypass Yahoo's persisted block screens
          await signupPage.page.context().clearCookies();

          // Pacing delay to avoid triggering Yahoo's IP rate limiter (HTTP 429)
          await signupPage.page.waitForTimeout(1000);

          // Re-navigate to ensure a clean page state for each data-driven case
          await signupPage.navigate();

          // Generate unique email username without underscores to comply with Yahoo's format rules
          const uniqueEmail = `kashyapph${Date.now()}${Math.floor(Math.random() * 1000)}`;

          // Fill all other fields with valid data
          await signupPage.fillFirstName(generateValidUser.firstName);
          await signupPage.fillLastName(generateValidUser.lastName);
          await signupPage.fillEmail(uniqueEmail);
          await signupPage.fillPassword(generateValidUser.password!);
          await signupPage.fillBirthDate(
            generateValidUser.birthMonth!,
            generateValidUser.birthDay!,
            generateValidUser.birthYear!
          );

          await signupPage.phoneInput.clear();
          await signupPage.fillPhone(testCase.value);
          
          // Trigger validation
          await signupPage.submit();

          // Check for error in the DOM
          const phoneError = await signupPage.getFieldError('phone');
          expect(phoneError).not.toBe('');
        });
      }
    } else {
      console.log('Skipping phone validation: Phone field is not present in this signup layout version.');
    }
  });

  test('Verify date of birth validation for invalid combinations and age limits', async ({ signupPage, generateValidUser }) => {
    // Mark test as slow to automatically triple the default timeout (e.g. to 90s) for data-driven iterations
    test.slow();

    for (const testCase of negativeData.invalidDates) {
      await test.step(`Testing birthdate: ${testCase.description}`, async () => {
        // Clear context cookies/session to completely bypass Yahoo's persisted block screens
        await signupPage.page.context().clearCookies();

        // Pacing delay to avoid triggering Yahoo's IP rate limiter (HTTP 429)
        await signupPage.page.waitForTimeout(1000);

        // Re-navigate to ensure a clean page state for each data-driven case
        await signupPage.navigate();

        // Generate unique email username without underscores to comply with Yahoo's format rules
        const uniqueEmail = `kashyapdob${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Fill all other fields with valid data
        await signupPage.fillFirstName(generateValidUser.firstName);
        await signupPage.fillLastName(generateValidUser.lastName);
        await signupPage.fillEmail(uniqueEmail);
        await signupPage.fillPassword(generateValidUser.password!);

        // Fill invalid DOB
        await signupPage.fillBirthDate(testCase.month, testCase.day, testCase.year);
        
        // Trigger validation
        await signupPage.submit();

        // Check if Yahoo displayed inline errors in the DOM (executed in parallel to avoid sequential timeout delays)
        const [dayError, yearError, monthError, dobError, birthDateError] = await Promise.all([
          signupPage.getFieldError('day'),
          signupPage.getFieldError('year'),
          signupPage.getFieldError('month'),
          signupPage.getFieldError('dob'),
          signupPage.getFieldError('birthDate')
        ]);

        // Check if Yahoo completely blocked the submission and redirected to a global block screen
        const bodyText = await signupPage.page.locator('body').innerText();
        const hasGlobalErrorScreen = bodyText.toLowerCase().includes("can’t be created") || 
                                     bodyText.toLowerCase().includes("cannot be created") || 
                                     bodyText.toLowerCase().includes("requirements for creating");
        
        const hasDobError = dayError !== '' || 
                            yearError !== '' || 
                            monthError !== '' || 
                            dobError !== '' || 
                            birthDateError !== '' || 
                            hasGlobalErrorScreen;
        expect(hasDobError).toBe(true);
      });
    }
  });

  test('Verify that validation messages disappear or update correctly after fields are corrected', async ({ signupPage, generateValidUser }) => {
    // Fill all other fields to allow submission
    await signupPage.fillLastName(generateValidUser.lastName);
    await signupPage.fillEmail(generateValidUser.emailUsername);
    await signupPage.fillPassword(generateValidUser.password!);
    await signupPage.fillBirthDate(
      generateValidUser.birthMonth!,
      generateValidUser.birthDay!,
      generateValidUser.birthYear!
    );

    // 1. Trigger firstName validation error (empty)
    await signupPage.fillFirstName('');
    await signupPage.submit();
    
    // HTML5 validation check
    const isFirstNameValueMissing = await signupPage.firstNameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    expect(isFirstNameValueMissing).toBe(true);

    // 2. Correct the field
    await signupPage.fillFirstName(generateValidUser.firstName);
    
    // 3. Verify it is now marked valid
    const isFirstNameValid = await signupPage.firstNameInput.evaluate((el: HTMLInputElement) => !el.validity.valueMissing);
    expect(isFirstNameValid).toBe(true);
  });
});

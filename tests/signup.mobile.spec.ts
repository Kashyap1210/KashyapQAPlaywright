import { test, expect } from '../fixtures/testData';

/**
 * Mobile responsive layout validation.
 * Emulates mobile devices to verify form adaptability, non-overlap, and usability.
 */
test.describe('Yahoo Signup - Responsive Mobile Viewport', () => {

  test('Verify mobile viewport handles form elements, inputs, and validation messages without overlap', async ({ signupPage, generateValidUser }) => {
    // 1. Navigate to the signup page
    await signupPage.navigate();

    // 2. Verify all primary fields are fully visible
    await expect(signupPage.firstNameInput).toBeVisible();
    await expect(signupPage.lastNameInput).toBeVisible();
    await expect(signupPage.emailInput).toBeVisible();
    await expect(signupPage.submitButton).toBeVisible();

    // 3. Programmatic overlap check using element bounding boxes
    const firstNameBox = await signupPage.firstNameInput.boundingBox();
    const lastNameBox = await signupPage.lastNameInput.boundingBox();
    const emailBox = await signupPage.emailInput.boundingBox();

    if (firstNameBox && lastNameBox) {
      // Last name field must render below the first name field vertically
      expect(lastNameBox.y).toBeGreaterThanOrEqual(firstNameBox.y + firstNameBox.height);
    }
    
    if (lastNameBox && emailBox) {
      // Email field must render below the last name field vertically
      expect(emailBox.y).toBeGreaterThanOrEqual(lastNameBox.y + lastNameBox.height);
    }

    // 4. Fill details to verify mobile touch interactivity and trigger custom validation
    await signupPage.fillFirstName(generateValidUser.firstName);
    await signupPage.fillLastName(generateValidUser.lastName);
    await signupPage.fillEmail('a'); // Invalid email username to trigger custom inline JS error
    await signupPage.fillPassword(generateValidUser.password!);
    await signupPage.fillBirthDate(
      generateValidUser.birthMonth!,
      generateValidUser.birthDay!,
      generateValidUser.birthYear!
    );

    // Submit form (triggers Yahoo's custom inline validation error for email)
    await signupPage.submit();

    // 5. Verify mobile validation errors render without layout breaks or overlaps
    const emailError = await signupPage.getFieldError('yid');
    expect(emailError).not.toBe('');

    const errorLocator = signupPage.page.locator(
      `#reg-error-userId, #reg-error-yid, [id$="-error"][id*="userId"], .error-msg`
    ).first();
    
    const errorBox = await errorLocator.boundingBox();
    const submitBox = await signupPage.submitButton.boundingBox();

    if (errorBox && submitBox) {
      // Submit button must not overlap or mask the validation message
      expect(submitBox.y).toBeGreaterThanOrEqual(errorBox.y + errorBox.height);
    }
  });
});

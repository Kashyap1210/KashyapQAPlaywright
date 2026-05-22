import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model representing the Yahoo Account Creation / Signup page.
 * Strictly separates elements/locators and actions from test assertions.
 */
export class SignupPage {
  readonly page: Page;

  // Semantic and fallback-resilient Locators
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordToggle: Locator;
  readonly countryCodeSelect: Locator;
  readonly phoneInput: Locator;
  readonly birthMonthSelect: Locator;
  readonly birthDayInput: Locator;
  readonly birthYearInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Resilient CSS selectors supporting multiple iterations of Yahoo UI
    this.firstNameInput = page.locator('#usernamereg-firstName, input[name="firstName"]').first();
    this.lastNameInput = page.locator('#usernamereg-lastName, input[name="lastName"]').first();
    this.emailInput = page.locator('#usernamereg-yid, #usernamereg-userId, input[name="yid"], input[name="userId"]').first();
    this.passwordInput = page.locator('#usernamereg-password, input[name="password"]').first();
    this.showPasswordToggle = page.locator('.password-toggle, button.show-password, button.toggle-password, [data-action="show-password"]').first();
    this.countryCodeSelect = page.locator('select[name="shortName"], select[name="phoneCountryCode"], select.country-code-select').first();
    this.phoneInput = page.locator('#usernamereg-phone, input[name="phone"]').first();
    
    // Date of Birth fields
    this.birthMonthSelect = page.locator('#usernamereg-month, select[name="mm"], input[name="mm"]').first();
    this.birthDayInput = page.locator('#usernamereg-day, input[name="dd"]').first();
    this.birthYearInput = page.locator('#usernamereg-year, input[name="yyyy"]').first();

    // Submit Action Button
    this.submitButton = page.locator('#reg-submit-button, button[name="signup"], button[type="submit"]').first();
  }

  /**
   * Navigate directly to the correct account creation page
   */
  async navigate() {
    await this.page.goto(
      'https://login.yahoo.com/account/create?.intl=us&.lang=en-US&src=ym&activity=mail-direct&pspid=159600001&.done=https%3A%2F%2Fmail.yahoo.com%2Fd&specId=yidregsimplified',
      { waitUntil: 'load' }
    );
    // Explicitly wait for key form elements to be visible ensuring SPA hydration is complete
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Enter the first name
   */
  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
    await this.firstNameInput.press('Tab');
  }

  /**
   * Enter the last name
   */
  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
    await this.lastNameInput.press('Tab');
  }

  /**
   * Enter the desired email username
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
    await this.emailInput.press('Tab');
  }

  /**
   * Enter the password
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
    await this.passwordInput.press('Tab');
  }

  /**
   * Click show/hide password toggle if visible
   */
  async togglePasswordVisibility() {
    if (await this.showPasswordToggle.isVisible()) {
      await this.showPasswordToggle.click();
    }
  }

  /**
   * Select a country code option by value (e.g., 'US', 'IN')
   */
  async selectCountryCode(countryCodeValue: string) {
    if (await this.countryCodeSelect.isVisible()) {
      await this.countryCodeSelect.selectOption({ value: countryCodeValue });
    }
  }

  /**
   * Enter the mobile phone number if visible
   */
  async fillPhone(phone: string) {
    if (await this.phoneInput.isVisible()) {
      await this.phoneInput.fill(phone);
      await this.phoneInput.press('Tab');
    }
  }

  /**
   * Fills birth date fields if visible.
   * Dynamically handles both select dropdowns and text input fields for month.
   */
  async fillBirthDate(monthValue: string, day: string, year: string) {
    if (await this.birthMonthSelect.isVisible()) {
      const tagName = await this.birthMonthSelect.evaluate(el => el.tagName.toLowerCase());
      if (tagName === 'select') {
        await this.birthMonthSelect.selectOption({ value: monthValue });
      } else {
        await this.birthMonthSelect.fill(monthValue);
        await this.birthMonthSelect.press('Tab');
      }
    }
    if (await this.birthDayInput.isVisible()) {
      await this.birthDayInput.fill(day);
      await this.birthDayInput.press('Tab');
    }
    if (await this.birthYearInput.isVisible()) {
      await this.birthYearInput.fill(year);
      await this.birthYearInput.press('Tab');
    }
  }

  /**
   * Disables browser-native HTML5 validation on the form,
   * forcing Yahoo's custom JavaScript engine to validate empty submissions and generate DOM error messages.
   */
  async enableCustomValidationOnly() {
    if (await this.page.locator('form').first().isVisible()) {
      await this.page.locator('form').first().evaluate(form => form.setAttribute('novalidate', 'novalidate'));
    }
  }

  /**
   * Submits the signup form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Fetches the dynamic inline error message text associated with a specific field.
   * Leverages ARIA description, sibling nodes, or specific error container IDs.
   */
  async getFieldError(fieldId: string): Promise<string> {
    // Map field IDs to handle alternate names used in Yahoo DOM (e.g. 'yid' -> 'userId')
    let id = fieldId;
    if (id === 'yid') {
      id = 'userId';
    }

    const errorLocator = this.page.locator(
      `#reg-error-${id}, #${id}-error, [id$="-error"][id*="${id}"], .error-msg`
    ).first();
    
    try {
      // Robustly wait for the error to become visible (with a safe 3s threshold)
      await errorLocator.waitFor({ state: 'visible', timeout: 3000 });
      const text = await errorLocator.textContent();
      return text ? text.trim() : '';
    } catch {
      // If the error does not appear within 3s, return empty string safely
      return '';
    }
  }

  /**
   * Verifies if any visible error message exists on the page
   */
  async hasAnyVisibleError(): Promise<boolean> {
    const globalErrors = this.page.locator('.error-msg, [id$="-error"]');
    const count = await globalErrors.count();
    for (let i = 0; i < count; i++) {
      if (await globalErrors.nth(i).isVisible()) {
        return true;
      }
    }
    return false;
  }
}

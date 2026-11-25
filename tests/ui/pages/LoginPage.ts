import { type Locator, type Page } from '@playwright/test';
import { LoginLocators } from '../locators/LoginLocators';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByTestId(LoginLocators.Username);
    this.password = page.getByTestId(LoginLocators.Password);
    this.loginButton = page.getByTestId(LoginLocators.LoginButton);
    this.error = page.getByTestId(LoginLocators.Error);
  }

  async open() {
    await this.page.goto('/');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}

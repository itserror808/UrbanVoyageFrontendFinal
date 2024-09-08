// login-page.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {OAuthService} from "../../services/oauth.service";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  rememberMe: boolean = false;
  isLoggedIn: boolean = false;
  message: string | null = null;
  messageType: 'success' | 'error' = 'success';
  loading: boolean = false;

  constructor(private authService: AuthService, private router: Router ,private oauthService: OAuthService) {
    this.isLoggedIn = this.authService.isLoggedIn();

  }

  maxAttempts: number = 5;
  lockoutTime: number = 600; // 10 minutes in seconds
  lockedEmails: { [email: string]: { attempts: number, lockoutEnd: number } } = {};
  currentLockoutTimer: any;

  ngOnInit() {
    this.loadLockedEmails();
  }

  ngOnDestroy() {
    if (this.currentLockoutTimer) {
      clearInterval(this.currentLockoutTimer);
    }
  }

  loadLockedEmails() {
    const storedEmails = localStorage.getItem('lockedEmails');
    if (storedEmails) {
      this.lockedEmails = JSON.parse(storedEmails);
      this.cleanupExpiredLockouts();
    }
  }

  saveLockedEmails() {
    localStorage.setItem('lockedEmails', JSON.stringify(this.lockedEmails));
  }

  cleanupExpiredLockouts() {
    const now = new Date().getTime();
    for (const email in this.lockedEmails) {
      if (this.lockedEmails[email].lockoutEnd < now) {
        delete this.lockedEmails[email];
      }
    }
    this.saveLockedEmails();
  }

  isEmailLocked(email: string): boolean {
    return this.lockedEmails[email] && this.lockedEmails[email].lockoutEnd > new Date().getTime();
  }

  getRemainingLockoutTime(email: string): number {
    if (this.isEmailLocked(email)) {
      return Math.ceil((this.lockedEmails[email].lockoutEnd - new Date().getTime()) / 1000);
    }
    return 0;
  }

  lockEmail(email: string): void {
    const lockoutEnd = new Date().getTime() + this.lockoutTime * 1000;
    this.lockedEmails[email] = { attempts: this.maxAttempts, lockoutEnd };
    this.saveLockedEmails();
    this.showMessage(`Too many failed attempts for ${email}. Account locked for 10 minutes.`, 'error');
    this.startLockoutTimer(email);
  }

  startLockoutTimer(email: string): void {
    if (this.currentLockoutTimer) {
      clearInterval(this.currentLockoutTimer);
    }
    this.currentLockoutTimer = setInterval(() => {
      const remainingTime = this.getRemainingLockoutTime(email);
      if (remainingTime <= 0) {
        clearInterval(this.currentLockoutTimer);
        delete this.lockedEmails[email];
        this.saveLockedEmails();
        this.showMessage(`Lockout period for ${email} has ended. You can try logging in again.`, 'success');
      }
    }, 1000);
  }

  formatCountdown(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }


  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    // Reset message
    this.message = null;

    // Validate fields
    if (!this.email.trim()) {
      this.showMessage('Please enter your email address.', 'error');
      return;
    }

    if (!this.password.trim()) {
      this.showMessage('Please enter your password.', 'error');
      return;
    }

    // If validation passes, proceed with login
    this.loading = true;
    console.log('Attempting login with email:', this.email);

    this.authService.login(this.email, this.password, this.rememberMe).subscribe(
      (response) => {
        console.log('Login successful:', response);

        console.log('User ID:', response.id);
        console.log('First Name:', response.firstName);
        console.log('Last Name:', response.lastName);
        console.log('Email:', response.email);
        console.log('Phone Number:', response.phoneNumber);
        console.log('Username:', response.username);
        console.log('Token:', response.token);

        // Convert roles array to a list for easier iteration
        const rolesList = response.roles;
        let isAdmin = rolesList.includes("ROLE_ADMIN");
        this.authService.setAdminStatus(isAdmin); // <---------- this one


        // Determine the redirection route based on the presence of "ROLE_ADMIN"
        let redirectTo = '/routes'; // Default route for non-admins
        if (isAdmin) {
          redirectTo = '/backoffice';
        }

        this.loading = false;
        this.showMessage('Login successful!', 'success');
        this.isLoggedIn = true;
        if (this.lockedEmails[this.email]) {
          delete this.lockedEmails[this.email];
          this.saveLockedEmails();
        }
        this.router.navigate([redirectTo]);

      },
      (error) => {
        this.loading = false;
        console.error('Login failed:', error);

        if (!this.lockedEmails[this.email]) {
          this.lockedEmails[this.email] = { attempts: 0, lockoutEnd: 0 };
        }
        this.lockedEmails[this.email].attempts++;

        if (this.lockedEmails[this.email].attempts >= this.maxAttempts) {
          this.lockEmail(this.email);
        } else {
          this.saveLockedEmails();
          this.showMessage(`Login failed. ${this.maxAttempts - this.lockedEmails[this.email].attempts} attempts remaining for ${this.email}.`, 'error');
        }
      }
    );


  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.showMessage('Logged out successfully!', 'success');

    this.router.navigate(['/login']);

  }

  showPasswordReset: boolean= false;

  showForgotPassword(): void {
    this.showPasswordReset = true ;
  }

  hideForgotPassword(){
    this.showPasswordReset = false ;
  }

  toggleRememberMe() {
    this.rememberMe = !this.rememberMe;
  }


  loginWithFacebook(): void {
    this.showMessage('Facebook login not implemented yet.', 'error');
  }

  loginWithGoogle(): void {
    this.oauthService.initiateGoogleLogin();
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    // Optionally, you can set a timer to clear the message after a few seconds
    setTimeout(() => this.closeMessage(), 5000); // Clear message after 5 seconds
  }

  closeMessage(): void {
    this.message = null;
  }



}

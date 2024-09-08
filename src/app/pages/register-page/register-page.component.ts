// register-page.component.ts
import { Component } from '@angular/core';
import { AuthService } from "../../services/auth.service";

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phoneNumber: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;


  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showVerification: boolean = false;

  message: string | null = null;
  messageType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register(): void {
    this.message = null; // Reset message before validation
    this.loading = true;


    if (!this.firstName) {
      this.loading = false;

      this.message = 'First name is required';
      this.messageType = 'error';
      return;
    }

    if (!this.lastName) {
      this.loading = false;

      this.message = 'Last name is required';
      this.messageType = 'error';
      return;
    }

    if (!this.email) {
      this.loading = false;

      this.message = 'Email is required';
      this.messageType = 'error';
      return;
    }

    if (!this.phoneNumber) {
      this.loading = false;

      this.message = 'Phone number is required';
      this.messageType = 'error';
      return;
    }

    if (!this.password) {
      this.loading = false;

      this.message = 'Password is required';
      this.messageType = 'error';
      return;
    }

    if (!this.confirmPassword) {
      this.loading = false;

      this.message = 'Confirm Password is required';
      this.messageType = 'error';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.loading = false;

      this.message = 'Passwords do not match';
      this.messageType = 'error';
      return;
    }

    // Check for existing user before registration
    this.authService.checkUserExists(this.email, this.phoneNumber).subscribe(
      (response) => {
        if (response.emailExists) {
          this.loading = false;
          this.message = 'Email is already in use';
          this.messageType = 'error';
          return;
        }
        if (response.phoneExists) {
          this.loading = false;
          this.message = 'Phone number is already in use';
          this.messageType = 'error';
          return;
        }

        // If no duplicates, proceed with registration
        this.proceedWithRegistration();
      },
      (error) => {
        this.loading = false;
        this.message = 'Error checking user existence: ' + error.error;
        this.messageType = 'error';
      }
    );
  }



  private proceedWithRegistration(): void {
    const user = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      password: this.password
    };

    this.authService.register(user).subscribe(
      (response) => {
        this.message = 'Registration successful! Please check your email for the verification code.';
        this.messageType = 'success';
        this.loading = false;
        this.showVerification = true;
      },
      (error) => {
        this.loading = false;
        this.message = 'Registration failed: ' + error.error;
        this.messageType = 'error';
      }
    );
  }

  onVerificationComplete(): void {
    this.message = 'Email verified successfully!';
    this.messageType = 'success';
    // Redirect to login or dashboard here
  }



  registerWithFacebook(): void {
    this.message = 'Facebook login not implemented yet.';
    this.messageType = 'error';
  }

  registerWithGoogle(): void {
    this.message = 'Google login not implemented yet.';
    this.messageType = 'error';
  }

  closeMessage(){
    this.message = null ;
  }


}

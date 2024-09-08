import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ResetPasswordService } from '../../services/reset-password.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.css']
})
export class ResetPasswordPageComponent implements OnInit {
  resetForm: FormGroup;
  currentStep = 1;
  userEmail: string = '';
  maskedPhoneNumber: string = '';
  loading: boolean = false;
  message: string | null = null;
  messageType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private resetPasswordService: ResetPasswordService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      digit1: ['', [Validators.required, Validators.maxLength(1)]],
      digit2: ['', [Validators.required, Validators.maxLength(1)]],
      digit3: ['', [Validators.required, Validators.maxLength(1)]],
      digit4: ['', [Validators.required, Validators.maxLength(1)]],
      digit5: ['', [Validators.required, Validators.maxLength(1)]],
      digit6: ['', [Validators.required, Validators.maxLength(1)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.resetForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.resetForm.get('confirmPassword')?.updateValueAndValidity();
    });
    this.resetForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.resetForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  @Output() closeReset = new EventEmitter<void>();


  closeResetPassword(): void {
    this.closeReset.emit();
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    if (newPassword !== confirmPassword) {
      g.get('confirmPassword')?.setErrors({ 'passwordMismatch': true });
      return { 'passwordMismatch': true };
    } else {
      g.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  onSubmitEmail() {
    if (this.resetForm.get('email')?.valid) {
      this.loading = true;
      this.resetPasswordService.checkEmail(this.resetForm.get('email')?.value).subscribe(
        (response) => {
          this.loading = false;
          this.userEmail = response.email;
          this.maskedPhoneNumber = response.maskedPhoneNumber;
          this.currentStep = 2;
        },
        (error) => {
          this.loading = false;
          console.error('Email not found', error);
          this.showMessage('Email not found. Please try again.', 'error');
        }
      );
    } else {
      this.showMessage('Please enter a valid email address.', 'error');
    }
  }

  confirmUser() {
    this.loading = true;
    this.resetPasswordService.sendOTP(this.userEmail).subscribe(
      () => {
        this.loading = false;
        this.currentStep = 3;
      },
      (error) => {
        this.loading = false;
        console.error('Failed to send OTP', error);
        this.showMessage('Failed to send OTP. Please try again.', 'error');
      }
    );
  }

  onDigitInput(event: any, isLast: boolean) {
    const input = event.target;
    if (input.value.length === 1) {
      if (!isLast) {
        input.nextElementSibling?.focus();
      } else {
        input.blur();
      }
    } else if (input.value.length === 0) {
      if (input.previousElementSibling) {
        input.previousElementSibling.focus();
      }
    }
  }

  isOtpValid(): boolean {
    return ['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6'].every(
      digit => this.resetForm.get(digit)?.value?.length === 1
    );
  }

  verifyOTP() {
    if (this.isOtpValid()) {
      const otp = ['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6']
        .map(digit => this.resetForm.get(digit)?.value)
        .join('');

      this.loading = true;
      this.resetPasswordService.verifyOTP(this.userEmail, otp).subscribe(
        () => {
          this.loading = false;
          this.currentStep = 4;
        },
        (error) => {
          this.loading = false;
          console.error('Invalid OTP', error);
          this.showMessage('Invalid OTP. Please try again.', 'error');
        }
      );
    } else {
      this.showMessage('Please enter a valid 6-digit OTP.', 'error');
    }
  }

  onSubmit() {
    if (this.resetForm.valid && this.currentStep === 4) {
      if (this.resetForm.get('newPassword')?.value !== this.resetForm.get('confirmPassword')?.value) {
        this.showMessage('Passwords do not match.', 'error');
        return;
      }
      this.loading = true;
      this.resetPasswordService.resetPassword(this.userEmail, this.resetForm.get('newPassword')?.value).subscribe(
        (response: string) => {
          this.loading = false;
          console.log('Password reset response:', response);
          this.currentStep = 5; // Success state
          this.showMessage('Your password has been successfully reset!', 'success');
        },
        (error) => {
          this.loading = false;
          console.error('Failed to reset password', error);
          this.showMessage('Failed to reset password. Please try again.', 'error');
        }
      );
    } else {
      this.showMessage('Please fill in all required fields correctly.', 'error');
    }
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
  }

  closeMessage() {
    this.message = null;
  }

  goToLogin() {
    this.closeResetPassword();
    this.router.navigate(['/login']);
  }
}

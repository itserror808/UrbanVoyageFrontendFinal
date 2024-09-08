// verify-email.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent {
  @Input() email!: string;
  @Output() verificationComplete = new EventEmitter<void>();

  verifyForm: FormGroup;
  message: string | null = null;
  messageType: 'success' | 'error' = 'success';
  loading: boolean = false;


  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.verifyForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.maxLength(1)]],
      digit2: ['', [Validators.required, Validators.maxLength(1)]],
      digit3: ['', [Validators.required, Validators.maxLength(1)]],
      digit4: ['', [Validators.required, Validators.maxLength(1)]],
      digit5: ['', [Validators.required, Validators.maxLength(1)]],
      digit6: ['', [Validators.required, Validators.maxLength(1)]]
    });
  }

  onDigitInput(event: any, nextInput: any) {
    if (event.target.value.length === 1) {
      nextInput.focus();
    }
  }

  verifyEmail() {
    this.loading = true;
    if (this.verifyForm.invalid) {
      this.loading = false;
      this.showMessage('Please enter a valid 6-digit verification code.', 'error');
      return;
    }

    const verificationCode = Object.values(this.verifyForm.value).join('');

    this.authService.verifyEmail(this.email, verificationCode).subscribe(
      (response) => {
        this.loading = false;
        this.showMessage('Email verified successfully!', 'success');
        this.verificationComplete.emit();
        this.router.navigate(['/login']);

      },
      (error) => {
        this.loading = false;
        this.showMessage('Verification failed: ' + error.error, 'error');
      }
    );
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
  }

  closeMessage() {
    this.message = null;
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { ReservationService } from '../../services/reservation.service';
import { SharedDataService } from '../../services/shared-data.service';

@Component({
  selector: 'app-cancel-payment',
  template: '<p>Cancelling payment...</p>'
})
export class CancelPaymentComponent implements OnInit {
  constructor(
    private paymentService: PaymentService,
    private reservationService: ReservationService,
    private sharedDataService: SharedDataService,
    private router: Router
  ) {}

  ngOnInit() {
    const sessionId = localStorage.getItem('stripeSessionId');
    if (sessionId) {
      this.handlePaymentCancellation(sessionId);
    } else {
      console.error('No session ID found');
      this.router.navigate(['/booking']);
    }
  }

  handlePaymentCancellation(sessionId: string) {
    this.paymentService.handlePaymentCancellation(sessionId).subscribe({
      next: () => {
        console.log('Payment cancelled');
        this.deleteReservation();
      },
      error: (error) => {
        console.error('Error cancelling payment:', error);
        this.deleteReservation();
      }
    });
  }

  deleteReservation() {
    const reservationId = this.sharedDataService.getSelectedReservation()?.reservationID;
    if (reservationId) {
      this.reservationService.deleteReservation(reservationId).subscribe({
        next: () => {
          console.log('Reservation deleted due to payment cancellation');
          localStorage.removeItem('stripeSessionId');
          this.router.navigate(['/booking'], { queryParams: { cancelled: true } });
        },
        error: (error) => {
          console.error('Error deleting reservation:', error);
          this.router.navigate(['/booking'], { queryParams: { error: true } });
        }
      });
    } else {
      this.router.navigate(['/booking'], { queryParams: { error: true } });
    }
  }
}

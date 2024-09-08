import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { Passenger } from '../../models/passenger.model';
import { PassengerService } from '../../services/passenger.service';
import {PaymentService} from "../../services/payment.service";
import {SharedDataService} from "../../services/shared-data.service";
import {ReservationService} from "../../services/reservation.service";

@Component({
  selector: 'app-success-payment',
  templateUrl: './success-payment.component.html',
  styleUrls: ['./success-payment.component.css']
})
export class SuccessPaymentComponent implements OnInit{
  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private sharedDataService: SharedDataService,
    private reservationService: ReservationService,

  ) {}

  ngOnInit() {
    let sessionId = localStorage.getItem('stripeSessionId');

    // If not in localStorage, try to get from URL
    if (!sessionId) {
      const urlParams = new URLSearchParams(window.location.search);
      sessionId = urlParams.get('session_id');
    }

    if (sessionId) {
      this.confirmPayment(sessionId);
    } else {
      console.error('No session ID found');
      alert('Payment confirmation failed. Please try again.');
      this.router.navigate(['/booking']);
    }
  }

  confirmPayment(sessionId: string) {
    this.paymentService.confirmPayment(sessionId).subscribe({
      next: (response) => {
        console.log('Payment confirmed:', response);
        // Clear the session ID from localStorage
        localStorage.removeItem('stripeSessionId');
        // Update reservation status to CONFIRMED
        this.updateReservationStatus('CONFIRMED');
        // Redirect to a confirmation page
        this.router.navigate(['/success']);
      },
      error: (error) => {
        console.error('Error confirming payment:', error);
        // Update reservation status to CANCELLED
        this.updateReservationStatus('CANCELLED');
        // Handle the error (show message to user, redirect, etc.)
        this.router.navigate(['/booking']);
      }
    });
  }

  updateReservationStatus(status: string) {
    const reservationId = this.sharedDataService.getSelectedReservation()?.reservationID;
    if (reservationId) {
      this.reservationService.updateReservationStatus(reservationId, status).subscribe({
        next: (updatedReservation) => {
          console.log('Reservation status updated:', updatedReservation);
        },
        error: (error) => {
          console.error('Error updating reservation status:', error);
        }
      });
    }
  }
}

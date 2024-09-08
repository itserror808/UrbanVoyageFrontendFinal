import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { PassengerService } from '../../services/passenger.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { Passenger } from '../../models/passenger.model';
import { Reservation } from '../../models/reservation.model';
import {SharedDataService} from "../../services/shared-data.service";
import {PaymentService} from "../../services/payment.service";

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {
  passengerTickets: Passenger[] = [];
  showChangeScheduleModal: boolean = false;
  selectedTicket: Passenger | null = null;
  newScheduleDate: string = '';
  loading: boolean = false;

  selectedPassenger: Passenger | null = null;


  showDatePicker = false;
  currentMonth: Date = new Date();
  calendarDays: number[] = [];
  daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  showRefundModal: boolean = false;
  refundMotif: string = '';

  message: string | null = null;
  messageType: 'success' | 'error' = 'success';


  constructor(
    private passengerService: PassengerService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private sharedDataService: SharedDataService,
    private paymentService: PaymentService,
    private cdr: ChangeDetectorRef  // Add this

  ) {}

  ngOnInit() {
    this.selectedPassenger = this.sharedDataService.getSelectedPassenger();
    this.loadPassengerTickets();
    this.generateCalendar();
  }

  loadPassengerTickets() {
    this.loading = true;
    this.authService.getCurrentUserId().subscribe(userId => {
      if (userId) {
        this.passengerService.getPassengersByUserId(userId).subscribe(
          tickets => {
            this.loading = false;
            console.log('Raw tickets data:', tickets);
            this.passengerTickets = this.passengerService.transformPassengerData(tickets);
            console.log('Loaded passenger tickets:', this.passengerTickets);
            this.cdr.detectChanges();
          },
          error => {
            this.loading = false;
            console.error('Error fetching passenger tickets:', error);
            this.cdr.detectChanges();
          }
        );
      }
    });
  }





  requestRefund(ticket: Passenger) {
    this.selectedTicket = ticket;
    this.showRefundModal = true;
  }

  submitRefundRequest() {
    if (this.selectedTicket && this.refundMotif) {
      this.paymentService.createRefundRequest(this.selectedTicket.reservationId, this.refundMotif).subscribe(
        result => {
          console.log('Refund request created:', result);


          this.showMessage("Refund request submitted successfully. An admin will review your request." , 'success');

          this.showRefundModal = false;
          this.refundMotif = '';
          this.selectedTicket = null;
          this.loadPassengerTickets(); // Reload tickets to reflect the new status
        },
        error => {
          console.error('Error creating refund request:', error);

          this.showMessage("Failed to submit refund request. Please try again later." , 'error');

        }
      );
    }
  }

  closeRefundModal() {
    this.showRefundModal = false;
    this.refundMotif = '';
    this.selectedTicket = null;
  }

  // Add this helper method to check if the status is valid
  private isValidStatus(status: string): status is Passenger['status'] {
    return ['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUND_APPROVED', 'REFUND_REJECTED', 'REFUND_REQUESTED', 'REFUNDED'].includes(status);
  }

  openChangeScheduleModal(ticket: Passenger) {
    this.selectedTicket = ticket;
    this.newScheduleDate = ticket.departureTime;
    this.showChangeScheduleModal = true;
  }

  closeChangeScheduleModal() {
    this.showChangeScheduleModal = false;
    this.selectedTicket = null;
    this.newScheduleDate = '';
  }

  changeSchedule() {
    if (this.selectedTicket && this.newScheduleDate) {
      this.reservationService.updateReservationSchedule(this.selectedTicket.reservationId, this.newScheduleDate).subscribe(
        updatedReservation => {
          console.log('Schedule updated:', updatedReservation);
          this.loadPassengerTickets(); // Reload tickets after update
          this.closeChangeScheduleModal();
        },
        error => {
          console.error('Error updating schedule:', error);
        }
      );
    }
  }




  openDatePicker(ticket: any) {
    this.showDatePicker = true;
    this.selectedTicket = ticket;
    this.currentMonth = new Date(ticket.departureTime);
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    this.calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push(0);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push(i);
    }
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectDate(day: number, ticket: any) {
    const newDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
    ticket.departureTime = newDate;
    this.showDatePicker = false;
    // Here you would typically call a service to update the ticket's date
    console.log(`Updated ticket ${ticket.id} to new date: ${newDate}`);
  }

  isSelectedDate(day: number): boolean {
    if (!this.selectedTicket) return false;
    const ticketDate = new Date(this.selectedTicket.departureTime);
    return (
      day === ticketDate.getDate() &&
      this.currentMonth.getMonth() === ticketDate.getMonth() &&
      this.currentMonth.getFullYear() === ticketDate.getFullYear()
    );
  }

  isCurrentMonth(day: number): boolean {
    const today = new Date();
    return (
      this.currentMonth.getMonth() === today.getMonth() &&
      this.currentMonth.getFullYear() === today.getFullYear() &&
      day >= today.getDate()
    );
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'REFUND_REJECTED':
        return 'bx bx-x text-red-600';
      case 'REFUNDED':
        return 'bx bx-check text-green-600';
      case 'REFUND_REQUESTED':
        return 'bx bx-time text-yellow-600';
      default:
        return '';
    }
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => this.closeMessage(), 5000); // Clear message after 5 seconds
  }

  closeMessage(): void {
    this.message = null;
  }


}

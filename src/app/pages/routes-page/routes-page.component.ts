import {Component, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, forkJoin, of, Subscription, switchMap, tap} from 'rxjs';
import { Schedule } from 'src/app/models/schedule.model';
import { Route } from 'src/app/models/route.model';
import { RouteService } from 'src/app/services/route.service';
import { ScheduleService } from 'src/app/services/schedule.service';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/app/services/shared-data.service';
import {AuthService} from "../../services/auth.service";
import {ReservationService} from "../../services/reservation.service";
import {map} from "rxjs/operators";
import { locations } from 'src/app/data/locations.data';
import {DistanceService} from "../../services/distance.service";
import {MoroccoMapComponent} from "../../components/morocco-map/morocco-map.component";


interface AgencyLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-routes-page',
  templateUrl: './routes-page.component.html',
  styleUrls: ['./routes-page.component.css'],
})



export class RoutesPageComponent implements OnInit {
  @ViewChild(MoroccoMapComponent) mapComponent!: MoroccoMapComponent;

  isOneWay: boolean = true;
  travelingWithPet: boolean = false;
  departureCity: string = '';
  arrivalCity: string = '';
  distance: number = 0 ;

  schedules: (Schedule & { availableSeats: number })[] = [];
  noRoutesFound: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  searchPerformed: boolean = false;

  message:string | null = null ;
  messageType: 'success' | 'error' = 'success';

  loading: boolean = false;




  locations = locations;


  selectedSchedule: Schedule | null = null;


  constructor(
    private routeService: RouteService,
    private scheduleService: ScheduleService,
    private reservationService: ReservationService,
    private router: Router,
    private sharedDataService: SharedDataService,
    private authService: AuthService,
    private distanceService: DistanceService,

  ) {}

  isLoggedIn: boolean = false;
  isClient: boolean = false;
  private loginSubscription: Subscription = new Subscription();


  isOpen = false;
  selectedCity = '';

  isDepartureOpen = false;
  isArrivalOpen = false;

  toggleDepartureDropdown() {
    this.isDepartureOpen = !this.isDepartureOpen;
    if (this.isDepartureOpen) this.isArrivalOpen = false;
  }

  toggleArrivalDropdown() {
    this.isArrivalOpen = !this.isArrivalOpen;
    if (this.isArrivalOpen) this.isDepartureOpen = false;
  }

  selectDepartureCity(city: string) {
    this.departureCity = city;
    this.isDepartureOpen = false;
  }

  selectArrivalCity(city: string) {
    this.arrivalCity = city;
    this.isArrivalOpen = false;
  }

  isMapModalOpen: boolean = false;




  onCitiesSelected(event: { departure: string, arrival: string, distance: number }) {
    this.departureCity = event.departure;
    this.arrivalCity = event.arrival;
    this.distance = event.distance;
  }

  openMapModal() {
    this.showTraffic = false;
    this.isMapModalOpen = true;
  }

  closeMapModal() {
    this.isMapModalOpen = false;
  }

  showTraffic :boolean = false;


  formatPrice(price: number | undefined): string {
    return price !== undefined ? price.toFixed(2) : '0.00';
  }

  ngOnInit() {
    this.selectedSchedule = this.sharedDataService.getSelectedSchedule();
    this.generateCalendar();

    this.loginSubscription.add(
      this.authService.hasRole('ROLE_CLIENT').subscribe(
        isClient => {
          this.isClient = isClient;
          console.log('Client role updated:', this.isClient);
        }
      )
    );
    this.loginSubscription = this.authService.isLoggedIn$.subscribe(
      isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        console.log('Login state updated:', this.isLoggedIn);
      }
    );
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }


  searchRoutes(): void {
    this.loading = true;
    this.showTraffic = true ;
    this.errorMessage = '';
    this.noRoutesFound = false;
    this.schedules = [];
    this.searchPerformed = true;

    console.log('Searching for routes:', this.departureCity, this.arrivalCity, this.travelDate);

    this.routeService.findByDepartureAndArrival(this.departureCity, this.arrivalCity).subscribe({
      next: (routes) => {
        console.log('Routes found:', routes);
        if (routes.length === 0) {
          this.noRoutesFound = true;
          this.loading = false;
        } else {
          this.generateSchedulesForRoute(routes[0]);
        }
      },
      error: (error) => {
        console.error('Error fetching routes:', error);
        this.handleError(error);
      }
    });
    this.schedules.forEach(schedule => {
      this.reservationService.getAvailableSeats(schedule.route.routeID, schedule.departureTime)
        .subscribe(
          availableSeats => {
            schedule.availableSeats = availableSeats;
          },
          error => {
            console.error('Error fetching available seats:', error);
            schedule.availableSeats = 0; // Set to 0 if there's an error
          }
        );
    });
  }

  isScheduleAvailable(schedule: Schedule & { availableSeats: number }): boolean {
    return schedule.availableSeats > 0;
  }

  private generateSchedulesForRoute(route: Route): void {
    this.scheduleService.generateSchedulesForDay(route, new Date(this.travelDate)).subscribe({
      next: (generatedSchedules) => {
        this.schedules = generatedSchedules;
        console.log('Generated schedules:', this.schedules);
        if (this.schedules.length === 0) {
          this.noRoutesFound = true;
        } else {
          // Fetch available seats for each schedule
          this.fetchAvailableSeatsForSchedules();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error generating schedules:', error);
        this.handleError(error);
      }
    });
  }


  private fetchAvailableSeatsForSchedules(): void {
    this.schedules.forEach(schedule => {
      this.reservationService.getAvailableSeats(schedule.route.routeID, schedule.departureTime)
        .subscribe(
          availableSeats => {
            schedule.availableSeats = availableSeats;
          },
          error => {
            console.error('Error fetching available seats:', error);
            schedule.availableSeats = 0; // Set to 0 if there's an error
          }
        );
    });
  }

  private loadSchedulesForRoutes(routes: Route[]): void {
    const scheduleObservables = routes.map(route =>
      this.scheduleService.getSchedulesByRouteId(route.routeID)
    );

    forkJoin(scheduleObservables).subscribe({
      next: (scheduleArrays) => {
        console.log('All schedules:', scheduleArrays);
        this.schedules = scheduleArrays.flat().filter(schedule =>
          this.isSameDay(new Date(schedule.departureTime), new Date(this.travelDate))
        );
        console.log('Filtered schedules:', this.schedules);
        if (this.schedules.length === 0) {
          this.noRoutesFound = true;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching schedules:', error);
        this.handleError(error);
      }
    });
  }
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }
  formatTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private handleError(error: any): void {
    this.loading = false;
    this.message = "An error occurred while fetching data. Please try again.";
    this.messageType="error";
    console.error('Error:', error);
  }

  formatDuration(duration: string): string {
    const [hours, minutes] = duration.split(':');
    return `${hours}h ${minutes}min`;
  }



  travelDate: Date = new Date();
  showDatePicker: boolean = false;
  currentMonth: Date = new Date();
  calendarDays: number[] = [];
  daysOfWeek: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  openDatePicker() {
    this.showDatePicker = !this.showDatePicker;
    if (this.showDatePicker) {
      this.currentMonth = new Date(this.travelDate);
      this.generateCalendar();
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

  selectDate(day: number) {
    if (this.isCurrentMonth(day)) {
      this.travelDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
      this.showDatePicker = false;
    }
  }

  isSelectedDate(day: number): boolean {
    return this.travelDate.getDate() === day &&
      this.travelDate.getMonth() === this.currentMonth.getMonth() &&
      this.travelDate.getFullYear() === this.currentMonth.getFullYear();
  }

  isCurrentMonth(day: number): boolean {
    return day !== 0;
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






  bookSchedule(schedule: Schedule): void {
    if (!this.isLoggedIn) {
      this.message = "Please log in to book a trip.";
      this.messageType = "error";
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    if (!schedule) {
      console.error('Attempted to book a null schedule');
      return;
    }

    console.log('route-page: Selected Schedule->', schedule);
    this.createReservation(schedule);
  }

  private createReservation(schedule: Schedule): void {
    this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        if (!userId) {
          console.error('User not logged in');
          this.router.navigate(['/login']);
          return of(null);
        }

        const departureLocation = this.findLocation(schedule.route.departureCity);
        const arrivalLocation = this.findLocation(schedule.route.arrivalCity);

        if (!departureLocation || !arrivalLocation) {
          console.error('Location not found');
          this.message = "Error: Location not found";
          this.messageType = "error";
          return of(null);
        }

        // Calculate distance
        const distance = this.distanceService.calculateDistance(
          departureLocation.lat,
          departureLocation.lng,
          arrivalLocation.lat,
          arrivalLocation.lng
        );

        const reservationDTO = {
          userId: userId,
          routeId: schedule.route.routeID,
          departureTime: schedule.departureTime,
          departureLat: departureLocation.lat,
          departureLng: departureLocation.lng,
          arrivalLat: arrivalLocation.lat,
          arrivalLng: arrivalLocation.lng,
          distance: distance,
          seatType: 'STANDARD',
          status: 'PENDING'
        };

        console.log('Reservation DTO:', reservationDTO);
        return this.reservationService.createReservation(reservationDTO);
      })
    ).subscribe({
      next: (reservation) => {
        if (reservation) {
          console.log('Reservation created:', reservation);
          this.sharedDataService.setSelectedReservation(reservation);
          this.sharedDataService.setSelectedSchedule(schedule);
          this.router.navigate(['/booking']);
        } else {
          console.error('No reservation returned');
          this.message = "Error creating reservation. Please try again.";
          this.messageType = "error";
        }
      },
      error: (error) => {
        console.error('Error in reservation process:', error);
        if (error.status === 400) {
          this.message = error.error || "Bad request. Please check your input.";
        } else if (error.status === 500) {
          this.message = "Server error. Please try again later.";
        } else {
          this.message = "Error creating reservation. Please try again.";
        }
        this.messageType = "error";
      }
    });
  }

  private findLocation(cityName: string): AgencyLocation | undefined {
    return locations.find(location => location.name.toLowerCase() === cityName.toLowerCase());
  }

  private updateAvailableSeats(schedule: Schedule): void {
    const newAvailableSeats = schedule.availableSeats - 1;
    this.scheduleService.updateAvailableSeats(schedule.scheduleID, newAvailableSeats).subscribe({
      next: (updatedSchedule) => {
        console.log('Available seats updated:', updatedSchedule);
        this.router.navigate(['/booking']);
      },
      error: (error) => {
        console.error('Error updating available seats:', error);
        // You may still want to navigate to booking, as the reservation was created
        this.router.navigate(['/booking']);
      }
    });
  }

  onSearchRoutes() {
    this.searchRoutes();
    this.closeMapModal();
  }
}

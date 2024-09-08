import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { RouteService } from '../../services/route.service';
import { ScheduleService } from '../../services/schedule.service';
import { ReservationService } from '../../services/reservation.service';
import { UserService } from '../../services/user.service';
import { Route } from '../../models/route.model';
import { Schedule } from '../../models/schedule.model';
import { Reservation } from "../../models/reservation.model";
import {DistanceService} from "../../services/distance.service";
import {PricingService} from "../../services/pricing.service";
import {RefundService} from "../../services/refund.service";
import {Passenger} from "../../models/passenger.model";
import { locations } from 'src/app/data/locations.data';
import {Contact} from "../../models/contact.model";
import {ContactService} from "../../services/contact.service";
import { AuthService } from 'src/app/services/auth.service';
import {DestinationService} from "../../services/destination.service";
import {Sponsor} from "../../models/sponsor.model";
import {SponsorService} from "../../services/sponsor.service";
import {FAQ} from "../../models/faq.model";
import {FaqService} from "../../services/faq.service";


declare var google: any;



declare global {
  interface Window {
    initMap: () => void;
  }
}

interface Statistics {
  totalUsers: number;
  totalPassengers: number;
  reservationsPerMonth: number[];
}

@Component({
  selector: 'app-backoffice-page',
  templateUrl: './backoffice-page.component.html',
  styleUrls: ['./backoffice-page.component.css']
})
export class BackofficePageComponent implements OnInit {

  activeTab: 'routes' | 'schedules' | 'reservations' | 'refunds' | 'messages' | 'website'  = 'routes';
  tabs: ('routes' | 'schedules' | 'reservations' | 'messages' | 'refunds' | 'website')[] = ['routes', 'schedules', 'reservations', 'refunds' ,'website' , 'messages'];
  refundRequests: any[] = [];
  routes: Route[] = [];
  schedules: Schedule[] = [];
  reservations: Reservation[] = [];
  statistics: Statistics = { totalUsers: 0, totalPassengers: 0, reservationsPerMonth: [] };
  message: string | null = null;
  messageType: 'success' | 'error' = 'success';
  isEditingRoute: boolean = false;
  isEditingSchedule: boolean = false;
  editingRoute: Route | null = null;
  editingSchedule: Schedule | null = null;
  editingSponsor: Sponsor | null = null;
  editingFAQ: FAQ | null = null;

  seatType: 'STANDARD' | 'PREMIUM' | 'VIP' = 'STANDARD' ;

  showDateTimePicker: 'new' | 'edit' | null = null;
  selectedTime: string = '';

  loading: boolean = false;

  locations = locations;

  unreadMessage:number = 0;



  openDateTimePicker(type: 'new' | 'edit'): void {
    this.showDateTimePicker = type;
    const currentDate = type === 'new' ? this.newSchedule.departureTime : this.editingSchedule?.departureTime;
    if (currentDate) {
      const date = new Date(currentDate);
      this.selectedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      this.selectedTime = '00:00';
    }
  }

  updateDateTime(type: 'new' | 'edit'): void {
    const [hours, minutes] = this.selectedTime.split(':');
    let date = type === 'new' ? new Date(this.newSchedule.departureTime || new Date()) : new Date(this.editingSchedule?.departureTime || new Date());

    // Set the time while preserving the timezone offset
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    // Format the date as ISO string but preserve the local time
    const isoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();

    if (type === 'new') {
      this.newSchedule.departureTime = isoString;
    } else {
      if (this.editingSchedule) {
        this.editingSchedule.departureTime = isoString;
      }
    }
  }



// Note: Some addresses and coordinates are approximations. Always verify for accuracy.



  newRoute: Partial<Route> = {};

  newSchedule: Partial<Schedule> & { departureCity?: string, arrivalCity?: string } = {
    departureTime: new Date().toISOString(),
    availableSeats: 50,
    route: {} as Route
  };

  userChart?: Chart;
  reservationChart?: Chart;

  cityDistances: { [key: string]: { [key: string]: number } } = {};
  private distanceMatrixService: any;

  private googleMapsLoadedPromise!: Promise<void>;

  constructor(
    private routeService: RouteService,
    private scheduleService: ScheduleService,
    private reservationService: ReservationService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private distanceService: DistanceService,
    private pricingService: PricingService,
    private refundService: RefundService,
    private contactService: ContactService,
    private destinationService: DestinationService,
    private sponsorService: SponsorService,
    private faqService: FaqService,

  ) {
    this.initializeCityDistances();
    this.newSchedule = {
      availableSeats: 50,
    };
    this.googleMapsLoadedPromise = Promise.resolve();
  }



  ngOnInit(): void {
    console.log('Initial newSchedule:', this.newSchedule);

    this.loadRoutes();
    this.loadSchedules();
    // this.loadStatistics();
    this.initializeGoogleMaps();
    this.loadReservations();
    this.loadRefundRequests();
    this.loadContactMessages();
    this.loadDestinations();
    this.loadUnreadMessageCount();
    this.loadSponsors();
    this.loadFAQs();

  }

  /*
  ngAfterViewInit(): void {
    if (this.activeTab === 'statistics') {
      setTimeout(() => this.initializeCharts(), 0);
    }
  }*/

  private googleMapsLoaded = false;

  initializeGoogleMaps(): void {
    this.googleMapsLoadedPromise = new Promise<void>((resolve) => {
      if (window.google && window.google.maps) {
        this.initializeDistanceMatrixService();
        resolve();
        return;
      }

      if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCDjOf_9XM-mSZ9h4Hv9ukO5YCCBIrxIHc&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        // Handle the error appropriately
      };

      window.initMap = () => {
        this.initializeDistanceMatrixService();
        this.googleMapsLoaded = true;
        resolve();
      };

      document.head.appendChild(script);
    });
  }

  private initializeDistanceMatrixService(): void {
    if (window.google && window.google.maps) {
      this.distanceMatrixService = new google.maps.DistanceMatrixService();
    } else {
      console.error('Google Maps API not loaded');
      // Handle this error state appropriately
    }
  }



  initializeCityDistances(): void {
    this.locations.forEach(city1 => {
      this.cityDistances[city1.name] = {};
      this.locations.forEach(city2 => {
        if (city1.name !== city2.name) {
          const distance = this.distanceService.calculateDistance(city1.lat, city1.lng, city2.lat, city2.lng);
          this.cityDistances[city1.name][city2.name] = Math.round(distance);
        }
      });
    });
  }

  currentPage: number = 1;
  itemsPerPage: number = 10;

  // ... existing code ...

  get paginatedRoutes(): Route[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.routes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get paginatedSchedules(): Schedule[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.schedules.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get paginatedReservations(): Reservation[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.reservations.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get paginatedRefundRequests(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.refundRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }



  messages: Contact[] = [];
  contactCurrentPage: number = 1;
  contactTotalItems: number = 0;
  contactItemsPerPage: number = 12; // Set this to 12 as per your requirement

  get paginatedContactMessages(): Contact[] {
    const startIndex = (this.contactCurrentPage - 1) * this.contactItemsPerPage;
    return this.messages.slice(startIndex, startIndex + this.contactItemsPerPage);
  }




  totalItems: number = 0;
  totalPages: number = 0;

  searchDepartureCity: string = '';
  searchArrivalCity: string = '';

  onSearch(): void {
    this.currentPage = 0; // Reset to first page when searching
    this.loadRoutes();
  }

  loadRoutes(): void {
    this.loading = true;
    this.routeService.searchRoutes(this.searchDepartureCity, this.searchArrivalCity, this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.loading = false;
        this.routes = response.routes;
        this.currentPage = response.currentPage;
        this.totalItems = response.totalItems;
        this.totalPages = response.totalPages;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error searching routes:', error);
        this.showMessage('Error searching routes: ' + (error.message || 'Unknown error'), 'error');
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadRoutes();
  }

  loadSchedules(): void {
    this.loading=true;
    this.scheduleService.getSchedules().subscribe({
      next: (schedules) => {
        this.loading=false;
        this.schedules = schedules;
        this.currentPage = 1; // Reset to first page when reloading data
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading=false;
        console.error('Error loading schedules:', error);
        this.showMessage('Error loading schedules: ' + (error.message || 'Unknown error'), 'error');
      }
    });
  }

  /*
  loadStatistics(): void {
    this.loading=true;
    this.userService.getAllUsers().subscribe({

      next: (users) => {
        this.loading=false;

        this.statistics.totalUsers = users.length;
        this.statistics.totalPassengers = users.filter(user => user.hasReservations).length;

        // Calculate reservations per month (dummy data for example)
        this.statistics.reservationsPerMonth = Array(12).fill(0).map(() => Math.floor(Math.random() * 100));

        if (this.activeTab === 'statistics') {
          this.initializeCharts();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading=false;

        this.showMessage('Error loading statistics: ' + error.message, 'error');
      }
    });
  }*/

  initializeCharts(): void {
    const teal500 = '#06b6d4';
    const teal400 = '#22d3ee';

    const userChartConfig: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: ['Total Users', 'Total Passengers'],
        datasets: [{
          data: [this.statistics.totalUsers, this.statistics.totalPassengers],
          backgroundColor: [teal500, teal400]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'User Distribution'
          }
        },
        aspectRatio: 2
      }
    };

    const reservationChartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Reservations per Month',
          data: this.statistics.reservationsPerMonth,
          borderColor: teal500,
          backgroundColor: teal400,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Monthly Reservations'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };

    if (this.userChart) {
      this.userChart.destroy();
    }
    if (this.reservationChart) {
      this.reservationChart.destroy();
    }

    this.userChart = new Chart('userChart', userChartConfig);
    this.reservationChart = new Chart('reservationChart', reservationChartConfig);
  }

  addRoute(): void {
    console.log('Adding schedule:', this.newSchedule);

    if (!this.newRoute.departureCity || !this.newRoute.arrivalCity) {
      this.message = "Please select both departure and arrival cities.";
      this.messageType="error";
      return;
    }

    const distance = this.cityDistances[this.newRoute.departureCity][this.newRoute.arrivalCity];
    if (distance === undefined) {
      this.message = "Distance not found for the selected cities.";
      this.messageType="error";
      return;
    }

    this.newRoute.distance = distance;

    this.routeService.addRoute(this.newRoute as Route).subscribe({

      next: (route) => {
        this.routes.push(route);
        this.newRoute = {};
        this.loadRoutes(); // Reload routes to ensure consistency
        this.message = "Route added successfully";
        this.messageType="success";

      },
      error: (error) => {
        console.error('Error adding route:', error);
        this.message = "Error adding route: " + (error.message || 'Unknown error');
        this.messageType="error";
      }
    });
  }

  updateRoute(): void {
    if (!this.editingRoute || !this.editingRoute.departureCity || !this.editingRoute.arrivalCity) {
      this.message = "Invalid route data. Please check all fields.";
      this.messageType="error";
      return;
    }

    const distance = this.cityDistances[this.editingRoute.departureCity][this.editingRoute.arrivalCity];
    if (distance === undefined) {
      this.message = "Distance not found for the selected cities.";
      this.messageType="error";
      return;
    }

    this.editingRoute.distance = distance;

    this.routeService.updateRoute(this.editingRoute).subscribe({
      next: (updatedRoute) => {
        const index = this.routes.findIndex(r => r.routeID === updatedRoute.routeID);
        if (index !== -1) {
          this.routes[index] = updatedRoute;
        }
        this.message = "Route updated successfully";
        this.messageType="success";
        this.closeRouteEditForm();
        this.loadRoutes(); // Reload routes to ensure consistency
      },
      error: (error) => {
        console.error('Error updating route:', error);
        this.message = 'Error updating route: ' + (error.message || 'Unknown error');
        this.messageType="error";

      }
    });
  }

  deleteRoute(routeID: number): void {



    this.routeService.deleteRoute(routeID).subscribe({
      next: () => {
        this.routes = this.routes.filter(r => r.routeID !== routeID);
        this.message = "Route deleted successfully";
        this.messageType="success";
        this.loadRoutes(); // Reload routes to ensure consistency
      },
      error: (error) => {
        console.error('Error deleting route:', error);
        if (error.status === 400) {
          this.message = "Cannot delete route with active schedules";
          this.messageType="error";
        } else {
          this.message = "Error deleting route: " + (error.message || 'Unknown error');
          this.messageType="error";
        }
      }
    });
  }

  addSchedule(): void {
    if (!this.newSchedule.departureCity || !this.newSchedule.arrivalCity || !this.newSchedule.departureTime || this.newSchedule.availableSeats === undefined) {
      this.message = "Please fill in all required fields.";
      this.messageType = "error";
      return;
    }

    console.log('Searching for route:', this.newSchedule.departureCity, this.newSchedule.arrivalCity);

    // Use the findByDepartureAndArrival method to get the route
    this.routeService.findByDepartureAndArrival(this.newSchedule.departureCity, this.newSchedule.arrivalCity)
      .subscribe({
        next: (routes: Route[]) => {
          console.log('Found routes:', routes);

          if (routes.length === 0) {
            this.message = "No route found for the selected cities. Please add the route first.";
            this.messageType = "error";
            return;
          }

          const route = routes[0]; // Assume the first route is the one we want

          this.calculateTravelTime(this.newSchedule.departureCity, this.newSchedule.arrivalCity).then(travelTimeSeconds => {
            const departureTime = new Date(this.newSchedule.departureTime!);
            // Adjust for timezone offset
            const timezoneOffset = departureTime.getTimezoneOffset() * 60000;
            const adjustedDepartureTime = new Date(departureTime.getTime() - timezoneOffset);

            const arrivalTime = new Date(adjustedDepartureTime.getTime() + travelTimeSeconds * 1000);

            const distanceFromDepartureToArrival = route.distance; // Use the distance from the route

            const schedulePrice = this.pricingService.calculateTicketPrice(distanceFromDepartureToArrival, this.seatType);

            const scheduleToAdd: Omit<Schedule, 'scheduleID'> = {
              route: route,
              departureTime: adjustedDepartureTime.toISOString(),
              arrivalTime: arrivalTime.toISOString(),
              availableSeats: this.newSchedule.availableSeats || 50,
              duration: null,
              schedulePrice: schedulePrice,
              seatType: 'STANDARD'
            };

            this.scheduleService.addSchedule(scheduleToAdd).subscribe({
              next: (schedule) => {
                this.schedules.push(schedule);
                this.newSchedule = {
                  departureCity: '',
                  arrivalCity: '',
                  departureTime: new Date().toISOString(),
                  availableSeats: 50,
                  route: {} as Route
                };
                this.message = "Schedule added successfully";
                this.messageType = "success";
                this.loadSchedules();
              },
              error: (error) => {
                console.error('Error adding schedule:', error);
                this.message = 'Error adding schedule: ' + (error.message || 'Unknown error');
                this.messageType = "error";
              }
            });
          }).catch(error => {
            this.message = 'Error calculating travel time: ' + error;
            this.messageType = "error";
          });
        },
        error: (error) => {
          console.error('Error finding route:', error);
          this.message = 'Error finding route: ' + (error.message || 'Unknown error');
          this.messageType = "error";
        }
      });
  }

  updateSchedule(): void {
    if (!this.editingSchedule || !this.editingSchedule.scheduleID) {
      this.message = 'No valid schedule is currently being edited';
      this.messageType = "error";
      return;
    }

    let routeId: number | undefined;
    if (typeof this.editingSchedule.route === 'number') {
      routeId = this.editingSchedule.route;
    } else if (this.editingSchedule.route && 'routeID' in this.editingSchedule.route) {
      routeId = this.editingSchedule.route.routeID;
    }

    if (routeId === undefined) {
      this.message = 'Invalid route data for this schedule';
      this.messageType = "error";
      return;
    }

    const route = this.routes.find(r => r.routeID === routeId);
    if (!route) {
      this.message = 'Route not found for this schedule';
      this.messageType = "error";
      return;
    }

    this.calculateTravelTime(route.departureCity, route.arrivalCity).then(travelTimeSeconds => {
      const departureTime = new Date(this.editingSchedule!.departureTime);
      // Adjust for timezone offset
      const timezoneOffset = departureTime.getTimezoneOffset() * 60000;
      const adjustedDepartureTime = new Date(departureTime.getTime() - timezoneOffset);

      const arrivalTime = new Date(adjustedDepartureTime.getTime() + travelTimeSeconds * 1000);

      const distanceFromDepartureToArrival = this.cityDistances[route.departureCity][route.arrivalCity];
      const schedulePrice = this.pricingService.calculateTicketPrice(distanceFromDepartureToArrival, this.seatType);

      const scheduleToUpdate: Schedule = {
        scheduleID: this.editingSchedule!.scheduleID,
        route: { routeID: routeId } as Route,
        departureTime: adjustedDepartureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        availableSeats: this.editingSchedule!.availableSeats,
        duration: null,
        schedulePrice: schedulePrice,
        seatType: 'STANDARD'
      };

      this.scheduleService.updateSchedule(scheduleToUpdate).subscribe({
        next: (updatedSchedule) => {
          const index = this.schedules.findIndex(s => s.scheduleID === updatedSchedule.scheduleID);
          if (index !== -1) {
            this.schedules[index] = updatedSchedule;
          }
          this.message = 'Schedule updated successfully';
          this.messageType = "success";
          this.closeScheduleEditForm();
          this.loadSchedules();
        },
        error: (error) => {
          console.error('Error updating schedule:', error);
          this.message = 'Error updating schedule: ' + (error.message || 'Unknown error');
          this.messageType = "error";
        }
      });
    }).catch(error => {
      this.message = 'Error calculating travel time: ' + error;
      this.messageType = "error";
    });
  }

  formatDateToLocalISO(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  deleteSchedule(scheduleID: number): void {

    this.scheduleService.deleteSchedule(scheduleID).subscribe({
      next: () => {
        this.schedules = this.schedules.filter(s => s.scheduleID !== scheduleID);
        this.message = 'Schedule deleted successfully.' ;
        this.messageType="success";
        this.loadSchedules(); // Reload schedules to ensure consistency
      },
      error: (error) => {
        console.error('Error deleting schedule:', error);
        this.message = 'Error deleting schedule: ' + (error.message || 'Unknown error') ;
        this.messageType="error";
      }
    });
  }

  loadReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (reservations) => {
        console.log('Received reservations:', reservations);
        this.currentPage = 1; // Reset to first page when reloading data
        this.reservations = reservations.map(reservation => {
          console.log('Processing reservation:', reservation);
          return {
            ...reservation,
            id: reservation.id || reservation.reservationID // Check if the ID is under a different property name
          };
        });
        console.log('Processed reservations:', this.reservations);
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
      }
    });
  }

  updateReservationStatus(reservation: Reservation, newStatus: string): void {
    this.reservationService.updateReservationStatus(reservation.reservationID, newStatus).subscribe({
      next: (updatedReservation) => {
        console.log('Reservation updated successfully:', updatedReservation);
        // Update the reservation in your local array
        const index = this.reservations.findIndex(r => r.reservationID === updatedReservation.reservationID);
        if (index !== -1) {
          this.reservations[index] = updatedReservation;
        }
        this.showMessage(`Reservation ${newStatus.toLowerCase()} successfully`, 'success');
      },
      error: (error) => {
        console.error('Error updating reservation:', error);
        this.showMessage(error.message, 'error');
      }
    });
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.message = message;
    this.messageType = type;
    setTimeout(() => this.closeMessage(), 5000); // Clear message after 5 seconds
  }

  closeMessage(): void {
    this.message = null;
  }

  openRouteEditForm(route: Route): void {
    this.editingRoute = { ...route };
    this.isEditingRoute = true;
  }

  closeRouteEditForm(): void {
    this.editingRoute = null;
    this.isEditingRoute = false;
  }

  openScheduleEditForm(schedule: Schedule): void {
    this.editingSchedule = { ...schedule };

    let routeId: number | undefined;
    if (typeof this.editingSchedule.route === 'number') {
      routeId = this.editingSchedule.route;
    } else if (this.editingSchedule.route && 'routeID' in this.editingSchedule.route) {
      routeId = this.editingSchedule.route.routeID;
    }

    if (routeId !== undefined) {
      const route = this.routes.find(r => r.routeID === routeId);
      if (route) {
        this.calculateTravelTime(route.departureCity, route.arrivalCity).then(travelTimeSeconds => {
          if (this.editingSchedule) {
            const departureTime = new Date(this.editingSchedule.departureTime);
            const arrivalTime = new Date(departureTime.getTime() + travelTimeSeconds * 1000);

            this.editingSchedule.departureTime = departureTime.toISOString();
            this.editingSchedule.arrivalTime = arrivalTime.toISOString();
          }
        }).catch(error => {
          this.showMessage('Error calculating travel time: ' + error, 'error');
        });
      }
    }

    this.isEditingSchedule = true;
  }

  closeScheduleEditForm(): void {
    this.editingSchedule = null;
    this.isEditingSchedule = false;
  }

  setActiveTab(tab: 'routes' | 'schedules' | 'reservations'  | 'messages' | 'refunds' | 'website'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    /*
    if (tab === 'statistics') {
      setTimeout(() => this.initializeCharts(), 0);
    } else if (tab === 'refunds') {
      this.loadRefundRequests();
    }*/
  }

  getTabIcon(tab: string): string {
    switch (tab) {
      case 'routes':
        return 'directions';
      case 'schedules':
        return 'schedule';
      case 'reservations':
        return 'book';
      case 'statistics':
        return 'bar_chart';
      case 'website':
        return 'web';
      case 'messages':
        return 'mail';
      case 'refunds':
        return 'undo';
      default:
        return 'error';
    }
  }

  loadRefundRequests() {
    this.refundService.getRefundRequests().subscribe(
      (requests) => {
        this.refundRequests = requests;
      },
      (error) => {
        console.error('Error loading refund requests', error);
        // Handle error (show message to user, etc.)
      }
    );
  }

  selectedMessage: Contact | null = null;


  closeMessageDetails() {
    this.selectedMessage = null;
  }

  approveRefund(request: Passenger) {
    if (request.id != null) {
      this.refundService.approveRefund(request.id).subscribe(
        () => {
          request.status = "REFUND_APPROVED";
          // Optionally, reload all requests or update the local array
        },
        (error) => {
          console.error('Error approving refund', error);
          // Handle error (show message to user, etc.)
        }
      );
    }else{
      console.log("request.id = null")
    }
  }

  rejectRefund(request: Passenger) {
    if (request.id != null) {
      this.refundService.rejectRefund(request.id).subscribe(
        () => {
          request.status = 'REFUND_REJECTED';
          // Optionally, reload all requests or update the local array
        },
        (error) => {
          console.error('Error rejecting refund', error);
          // Handle error (show message to user, etc.)
        }
      );
    }else{
      console.log("request.id = null")
    }
  }


  calculateTravelTime(origin: string | undefined, destination: string | undefined): Promise<number> {
    return new Promise((resolve, reject) => {
      const originLocation = this.locations.find(loc => loc.name === origin);
      const destLocation = this.locations.find(loc => loc.name === destination);

      if (!originLocation || !destLocation) {
        reject('Location not found');
        return;
      }

      const distance = this.distanceService.calculateDistance(
        originLocation.lat, originLocation.lng,
        destLocation.lat, destLocation.lng
      );

      // Assume an average speed of 60 km/h
      const averageSpeed = 60; // km/h
      const travelTimeHours = distance / averageSpeed;
      const travelTimeSeconds = Math.round(travelTimeHours * 3600); // Convert hours to seconds

      resolve(travelTimeSeconds);
    });
  }


  addOrUpdateRoute(): void {
    if (!this.newRoute.departureCity || !this.newRoute.arrivalCity) {
      this.showMessage("Please select both departure and arrival cities.", "error");
      return;
    }

    const distance = this.cityDistances[this.newRoute.departureCity][this.newRoute.arrivalCity];
    if (distance === undefined) {
      this.showMessage("Distance not found for the selected cities.", "error");
      return;
    }

    this.newRoute.distance = distance;

    // Check if the route already exists
    const existingRoute = this.routes.find(r =>
      r.departureCity === this.newRoute.departureCity &&
      r.arrivalCity === this.newRoute.arrivalCity
    );

    if (existingRoute) {
      // Update existing route
      this.routeService.updateRoute({...existingRoute, ...this.newRoute}).subscribe({
        next: (updatedRoute) => {
          const index = this.routes.findIndex(r => r.routeID === updatedRoute.routeID);
          if (index !== -1) {
            this.routes[index] = updatedRoute;
          }
          this.showMessage("Route updated successfully", "success");
          this.newRoute = {};
        },
        error: (error) => {
          console.error('Error updating route:', error);
          this.showMessage("Error updating route: " + (error.message || 'Unknown error'), "error");
        }
      });
    } else {
      // Add new route
      this.routeService.addRoute(this.newRoute as Route).subscribe({
        next: (route) => {
          this.routes.push(route);
          this.showMessage("Route added successfully", "success");
          this.newRoute = {};
        },
        error: (error) => {
          console.error('Error adding route:', error);
          this.showMessage("Error adding route: " + (error.message || 'Unknown error'), "error");
        }
      });
    }
  }


  createAllRoutes(): void {
    this.loading = true;
    const createdRoutes: Set<string> = new Set();
    const existingRouteKeys: Set<string> = new Set(
      this.routes.map(route => `${route.departureCity}-${route.arrivalCity}`)
    );
    const routePromises: Promise<void>[] = [];
    const errors: string[] = [];

    console.log(`Starting to create routes. Total locations: ${this.locations.length}`);

    for (let i = 0; i < this.locations.length; i++) {
      for (let j = 0; j < this.locations.length; j++) {
        if (i !== j) {
          const departureCity = this.locations[i].name;
          const arrivalCity = this.locations[j].name;
          const routeKey = `${departureCity}-${arrivalCity}`;

          console.log(`Processing route: ${routeKey}`);

          if (createdRoutes.has(routeKey) || existingRouteKeys.has(routeKey)) {
            console.log(`Skipping ${routeKey} - already exists`);
            continue;
          }

          if (!this.cityDistances[departureCity] || !this.cityDistances[departureCity][arrivalCity]) {
            console.log(`Skipping ${routeKey} - distance data missing`);
            errors.push(`Missing distance data for ${routeKey}`);
            continue;
          }

          const distance = this.cityDistances[departureCity][arrivalCity];

          const newRoute: Partial<Route> = {
            departureCity: departureCity,
            arrivalCity: arrivalCity,
            distance: distance,
            boughtTicket: 0
          };

          const routePromise = new Promise<void>((resolve, reject) => {
            this.routeService.addRoute(newRoute as Route).subscribe({
              next: (route) => {
                console.log(`Route added: ${departureCity} to ${arrivalCity}`);
                this.routes.push(route);
                createdRoutes.add(routeKey);
                existingRouteKeys.add(routeKey);
                resolve();
              },
              error: (error) => {
                console.error(`Error adding route from ${departureCity} to ${arrivalCity}:`, error);
                errors.push(`Failed to add route ${routeKey}: ${error.message}`);
                reject(error);
              }
            });
          });

          routePromises.push(routePromise);
        }
      }
    }

    Promise.all(routePromises).then(() => {
      console.log('All routes processed');
      this.loadRoutes();
      this.loading = false;
      if (errors.length > 0) {
        console.error('Errors encountered:', errors);
        // You might want to display these errors to the user
      }
    }).catch((error) => {
      console.error('Error creating routes:', error);
      this.loading = false;
    });
  }



  contact: Contact[] = [];

  unreadMessages: Contact[] = [];

  filteredMessages: Contact[] = [];

  // ... rest of the component ...

  loadContactMessages() {
    this.contactService.getAllMessages().subscribe(
      (messages) => {
        // Sort messages to show unread first
        this.messages = messages.sort((a, b) => (a.read === b.read) ? 0 : a.read ? 1 : -1);
        this.contactTotalItems = messages.length;
        this.contactCurrentPage = 1;
        this.updateFilteredMessages();
      },
      (error) => {
        console.error('Error loading contact messages', error);
        this.showMessage('Error loading contact messages', 'error');
      }
    );
  }

  updateFilteredMessages() {
    const startIndex = (this.contactCurrentPage - 1) * this.contactItemsPerPage;
    const endIndex = startIndex + this.contactItemsPerPage;
    this.filteredMessages = this.messages.slice(startIndex, endIndex);
  }

  onContactPageChange(page: number): void {
    this.contactCurrentPage = page;
    this.updateFilteredMessages();
  }



  loadUnreadMessageCount() {
    this.contactService.getUnreadMessageCount().subscribe(
      (count) => {
        this.unreadMessageCount = count;
      },
      (error) => {
        console.error('Error loading unread message count', error);
      }
    );
  }

  openMessageDetails(message: Contact) {
    this.selectedMessage = message;
    if (!message.read && message.id !== undefined) {
      this.contactService.markAsRead(message.id).subscribe(
        () => {
          message.read = true;
          this.loadUnreadMessageCount();
          this.updateFilteredMessages(); // Re-filter to update order
        },
        (error) => {
          console.error('Error marking message as read', error);
        }
      );
    }
  }
  deleteContactMessage(id: number | undefined) {
    if (id === undefined) {
      console.error('Cannot delete message with undefined id');
      return;
    }
    this.contactService.deleteMessage(id).subscribe(
      () => {
        this.messages = this.messages.filter((message) => message.id !== id);
        this.contactTotalItems = this.messages.length;
        this.updateFilteredMessages();
        this.loadUnreadMessageCount();

        console.log('Message deleted successfully');
      },
      (error) => console.error('Error deleting message', error)
    );
  }

  destinations: any[] = [];
  currentDestination: any = {};
  selectedFile: File | null = null;

  loadDestinations() {
    this.destinationService.getDestinations().subscribe(
      data => this.destinations = data,
      error => console.error('Error fetching destinations', error)
    );
  }

  selectedFilePreview: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFilePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  unreadMessageCount: number = 0;
  removeFileSelected(event: any) {
    this.selectedFile = null;
  }

  onSubmit() {
    if(!this.currentDestination.title || !this.currentDestination.description || !this.selectedFile){
      this.message = "All fields are required";
      this.messageType = "error";
      return;
    }
    this.loading = true;
    const formData = new FormData();
    formData.append('title', this.currentDestination.title);
    formData.append('description', this.currentDestination.description);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.currentDestination.id) {
      this.destinationService.updateDestination(this.currentDestination.id, formData).subscribe(
        response => {
          console.log('Destination updated successfully', response);
          this.message = 'Destination updated successfully';
          this.messageType = 'success';
          this.resetForm();
          this.loadDestinations();
          this.loading = false;
        },
        error => {
          console.error('Error updating destination', error);
          this.message = 'Error updating destination';
          this.messageType = 'error';
          this.loading = false;
        }
      );
    } else {
      this.destinationService.createDestination(formData).subscribe(
        response => {
          console.log('Destination added successfully', response);
          this.message = 'Destination added successfully';
          this.messageType = 'success';
          this.resetForm();
          this.loadDestinations();
          this.loading = false;
        },
        error => {
          console.error('Error adding destination', error);
          this.message = 'Error adding destination';
          this.messageType = 'error';
          this.loading = false;
        }
      );
    }
  }

  editDestination(destination: any) {
    this.currentDestination = { ...destination };
    const element = document.getElementById('homepagedestinationmanagement');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  deleteDestination(id: number) {
    if (confirm('Are you sure you want to delete this destination?')) {
      this.loading = true;
      this.destinationService.deleteDestination(id).subscribe(
        () => {
          console.log('Destination deleted successfully');
          this.message = 'Destination deleted successfully';
          this.messageType = 'success';
          this.loadDestinations();
          this.loading = false;
        },
        error => {
          console.error('Error deleting destination', error);
          this.message = 'Error deleting destination';
          this.messageType = 'error';
          this.loading = false;
        }
      );
    }
  }

  resetForm() {
    this.currentDestination = {};
    this.selectedFile = null;
  }




  sponsors: Sponsor[] = [];
  newSponsor: Sponsor = { name: '', imageUrl: '', website: '' };


  loadSponsors(): void {
    this.sponsorService.getSponsors().subscribe(
      sponsors => this.sponsors = sponsors,
      error => console.error('Error loading sponsors:', error)
    );
  }

  sponsorLoading : boolean = false;

  addSponsor(): void {
    this.sponsorLoading=true;
    if(!this.newSponsor.name || !this.newSponsor.website || !this.newSponsor.imageUrl){
      this.sponsorLoading = false;
      this.showMessage("Please fill all sponsor fields.",'error');
      return ;
    }
    this.sponsorService.createSponsor(this.newSponsor).subscribe(
      sponsor => {
        this.sponsors.push(sponsor);
        this.newSponsor = { name: '', imageUrl: '', website: '' };
        this.sponsorLoading = false;

        this.showMessage("Sponsor added successfully.",'success');

      },
      error => {
        this.showMessage("Error adding sponsor.",'error');
        this.sponsorLoading = false;
      }

  );
  }

  updateSponsor(sponsor: Sponsor): void {
    this.editingSponsor = sponsor;
    this.newSponsor = { ...sponsor };
  }

  addOrUpdateSponsor(): void {
    this.sponsorLoading = true;
    if(!this.newSponsor.name || !this.newSponsor.website || !this.newSponsor.imageUrl){
      this.sponsorLoading = false;
      this.showMessage("Please fill all sponsor fields.",'error');
      return;
    }

    if (this.editingSponsor) {
      // Update existing sponsor
      this.sponsorService.updateSponsor(this.editingSponsor.id!, this.newSponsor).subscribe(
        updatedSponsor => {
          const index = this.sponsors.findIndex(s => s.id === updatedSponsor.id);
          if (index !== -1) {
            this.sponsors[index] = updatedSponsor;
          }
          this.resetSponsorForm();
          this.showMessage("Sponsor updated successfully.",'success');
        },
        error => {
          this.showMessage("Error updating sponsor.",'error');
        }
      ).add(() => this.sponsorLoading = false);
    } else {
      // Add new sponsor
      this.sponsorService.createSponsor(this.newSponsor).subscribe(
        sponsor => {
          this.sponsors.push(sponsor);
          this.resetSponsorForm();
          this.showMessage("Sponsor added successfully.",'success');
        },
        error => {
          this.showMessage("Error adding sponsor.",'error');
        }
      ).add(() => this.sponsorLoading = false);
    }
  }

  resetSponsorForm(): void {
    this.newSponsor = { name: '', imageUrl: '', website: '' };
    this.editingSponsor = null;
  }



  deleteSponsor(id: number): void {
    this.sponsorService.deleteSponsor(id).subscribe(
      () => {
        this.sponsors = this.sponsors.filter(sponsor => sponsor.id !== id);
      },
      error => console.error('Error deleting sponsor:', error)
    );
  }


  faqs: FAQ[] = [];
  newFAQ: FAQ = { question: '', answer: '', isOpen: false };
  faqLoading = false;



  loadFAQs() {
    console.log('Loading FAQs...');
    this.faqService.getAllFAQs().subscribe({
      next: (faqs) => {
        this.faqs = faqs;
        console.log('FAQs loaded:', JSON.stringify(this.faqs));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading FAQs:', error);
      }
    });
  }

  addFAQ(): void {
    console.log('Adding new FAQ:', JSON.stringify(this.newFAQ));
    if (!this.newFAQ.question || !this.newFAQ.answer) {
      console.error('Question or answer is empty');
      return;
    }
    this.faqLoading = true;
    this.faqService.createFAQ(this.newFAQ).subscribe({
      next: (createdFAQ) => {
        console.log('FAQ added successfully:', JSON.stringify(createdFAQ));
        this.faqs.push(createdFAQ);
        this.newFAQ = { question: '', answer: '', isOpen: false };
        this.faqLoading = false;
        console.log('Updated faqs array:', JSON.stringify(this.faqs));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error adding FAQ:', error);
        this.faqLoading = false;
      }
    });
  }



  startEditingFAQ(faq: FAQ) {
    this.editingFAQ = faq;
    this.newFAQ = { ...faq };
  }

  editFAQ(faq: FAQ) {
    const updatedFAQ: FAQ = { ...faq };
    this.faqService.updateFAQ(faq.id!, updatedFAQ).subscribe({
      next: (updatedFAQ) => {
        const index = this.faqs.findIndex(f => f.id === updatedFAQ.id);
        if (index !== -1) {
          this.faqs[index] = updatedFAQ;
        }
        this.showMessage('FAQ updated successfully', 'success');
        this.resetFAQForm();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating FAQ:', error);
        this.showMessage('Failed to update FAQ', 'error');
      }
    });
  }

  addOrUpdateFAQ(): void {
    this.faqLoading = true;
    if(!this.newFAQ.question || !this.newFAQ.answer){
      this.faqLoading = false;
      this.showMessage("Please fill all FAQ fields.",'error');
      return;
    }

    if (this.editingFAQ) {
      // Update existing FAQ
      this.faqService.updateFAQ(this.editingFAQ.id!, this.newFAQ).subscribe({
        next: (updatedFAQ) => {
          const index = this.faqs.findIndex(f => f.id === updatedFAQ.id);
          if (index !== -1) {
            this.faqs[index] = updatedFAQ;
          }
          this.resetFAQForm();
          this.showMessage("FAQ updated successfully.",'success');
        },
        error: (error) => {
          console.error('Error updating FAQ:', error);
          this.showMessage("Error updating FAQ.",'error');
        }
      }).add(() => this.faqLoading = false);
    } else {
      // Add new FAQ
      this.faqService.createFAQ(this.newFAQ).subscribe({
        next: (createdFAQ) => {
          this.faqs.push(createdFAQ);
          this.resetFAQForm();
          this.showMessage("FAQ added successfully.",'success');
        },
        error: (error) => {
          console.error('Error adding FAQ:', error);
          this.showMessage("Error adding FAQ.",'error');
        }
      }).add(() => this.faqLoading = false);
    }
  }

  resetFAQForm(): void {
    this.newFAQ = { question: '', answer: '', isOpen: false };
    this.editingFAQ = null;
  }

  deleteFAQ(id: number) {
    this.faqService.deleteFAQ(id).subscribe({
      next: () => {
        this.faqs = this.faqs.filter(faq => faq.id !== id);
        this.showMessage('FAQ deleted successfully', 'success');
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting FAQ:', error);
        this.showMessage('Failed to delete FAQ', 'error');
      }
    });
  }

}

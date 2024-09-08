import { Component, OnInit } from '@angular/core';
import { Schedule } from 'src/app/models/schedule.model';
import { ScheduleService } from 'src/app/services/schedule.service';
import {RouteService} from "../../services/route.service";


@Component({
  selector: 'app-schedules-page',
  templateUrl: './schedules-page.component.html',
  styleUrls: ['./schedules-page.component.css']
})
export class SchedulesPageComponent implements OnInit {
  schedules: Schedule[] = [];
  filteredSchedules: Schedule[] = [];
  paginatedSchedules: Schedule[] = [];
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  filterText: string = '';
  loading: boolean = false;

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10;


  constructor(private scheduleService: ScheduleService) {}

  ngOnInit() {
    this.loadTopSchedules();
  }

  loadSchedules() {
    this.loading = true;
    this.scheduleService.getSchedules().subscribe({
      next: (data) => {
        this.loading = false;
        this.schedules = data;
        this.filteredSchedules = [...this.schedules];
        this.sortSchedules();
        this.updatePaginatedSchedules();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching schedules:', error);
      }
    });
  }

  loadTopSchedules() {
    this.loading = true;
    this.scheduleService.getTopSchedules().subscribe({
      next: (data) => {
        this.loading = false;
        this.schedules = this.removeDuplicateSchedules(data);
        this.filteredSchedules = [...this.schedules];
        this.sortSchedules();
        this.updatePaginatedSchedules();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching schedules:', error);
      }
    });
  }

  removeDuplicateSchedules(schedules: Schedule[]): Schedule[] {
    const uniqueRoutes = new Map<string, Schedule>();
    schedules.forEach(schedule => {
      const routeKey = `${schedule.route.departureCity}-${schedule.route.arrivalCity}`;
      if (!uniqueRoutes.has(routeKey) || schedule.route.boughtTicket > uniqueRoutes.get(routeKey)!.route.boughtTicket) {
        uniqueRoutes.set(routeKey, schedule);
      }
    });
    return Array.from(uniqueRoutes.values()).sort((a, b) => b.route.boughtTicket - a.route.boughtTicket);
  }


  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortSchedules();
  }

  sortSchedules() {
    this.filteredSchedules.sort((a: any, b: any) => {
      const aValue = this.getNestedProperty(a, this.sortColumn);
      const bValue = this.getNestedProperty(b, this.sortColumn);
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined) ? o[key] : null, obj);
  }

  updatePaginatedSchedules() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSchedules = this.filteredSchedules.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePaginatedSchedules();
  }

  applyFilter() {
    this.filteredSchedules = this.schedules.filter(schedule =>
      schedule.route.departureCity.toLowerCase().includes(this.filterText.toLowerCase()) ||
      schedule.route.arrivalCity.toLowerCase().includes(this.filterText.toLowerCase())
    );
    this.sortSchedules();
    this.currentPage = 1; // Reset to first page when filtering
    this.updatePaginatedSchedules();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'bx bx-sort';
    return this.sortDirection === 'asc' ? 'bx bx-sort-up' : 'bx bx-sort-down';
  }

  formatTime(dateTimeString: string): string {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(duration: string): string {
    const [hours, minutes] = duration.split(':');
    return `${hours}h ${minutes}min`;
  }




}

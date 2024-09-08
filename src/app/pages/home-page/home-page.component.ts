import {Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener} from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from "rxjs";
import { map } from "rxjs/operators";
import { ScheduleService } from "../../services/schedule.service";
import { DestinationService } from "../../services/destination.service";
import { AuthService } from "../../services/auth.service";
import { ImageService } from "../../services/image.service";
import { Schedule } from "../../models/schedule.model";
import {RouteService} from "../../services/route.service";
import {locations} from "../../data/locations.data";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, OnDestroy, AfterViewInit {
  searchResults: string[] = [];
  destinations?: any[];
  isAdmin = false;
  backgroundImage = 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  showModal = false;
  selectedFile: File | null = null;
  selectedFileName: string | null = null;
  isLoadingImage = false;
  isLoading = false;

  private searchTerms = new Subject<string>();
  private subscriptions = new Subscription();

  constructor(
    private scheduleService: ScheduleService,
    private destinationService: DestinationService,
    private authService: AuthService,
    private imageService: ImageService,
    private routeService: RouteService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadBackgroundImage();
    this.loadDestinations();
    this.setupSearch();
    this.checkAdminStatus();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTerms.next(searchTerm);
  }

  editImage() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFile = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0] as File;
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }

  resetFileInput() {
    this.selectedFile = null;
    this.selectedFileName = null;
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }


  uploadImage() {
    if (this.selectedFile) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);

      this.imageService.uploadBackgroundImage(formData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.preloadImage(response.imageUrl).then(() => {
            this.backgroundImage = response.imageUrl;
            this.closeModal();
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error uploading image:', error);
        }
      });
    }
  }

  truncateBackgroundImages() {
    this.isLoading = true;
    this.imageService.truncateBackgroundImages().subscribe({
      next: () => {
        this.isLoading = false;
        this.loadBackgroundImage();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error truncating background images', error);
      }
    });
  }

  private loadBackgroundImage() {
    this.isLoadingImage = true;
    this.imageService.getBackgroundImage().subscribe({
      next: (response: any) => {
        if (response?.imageUrl) {
          this.preloadImage(response.imageUrl).then(() => {
            this.backgroundImage = response.imageUrl;
            this.isLoadingImage = false;
          });
        } else {
          this.setDefaultBackgroundImage();
        }
      },
      error: () => this.setDefaultBackgroundImage()
    });
  }

  private loadDestinations() {
    this.destinationService.getDestinations().subscribe({
      next: (data) => this.destinations = data,
      error: (error) => console.error('Error fetching destinations', error)
    });
  }

  private setupSearch() {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.scheduleService.getSchedules().pipe(
        map(schedules => this.getUniqueArrivalCities(schedules, term))
      ))
    ).subscribe(filteredCities => {
      this.searchResults = filteredCities;
    });
  }

  private checkAdminStatus() {
    this.subscriptions.add(
      this.authService.getUserRoles().subscribe(roles => {
        this.isAdmin = roles.includes('ROLE_ADMIN');
      })
    );
  }

  private getUniqueArrivalCities(schedules: Schedule[], searchTerm: string): string[] {
    return [...new Set(schedules
      .map(schedule => schedule.route?.arrivalCity)
      .filter(city => city && city.toLowerCase().includes(searchTerm.toLowerCase()))
    )];
  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.src = url;
    });
  }

  private setDefaultBackgroundImage() {
    this.backgroundImage = 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    this.isLoadingImage = false;
  }



  @ViewChild('compactHeader') compactHeader!: ElementRef;

  isHeaderHidden = false;
  isCompactHeaderVisible = false;
  lastScrollTop = 0;
  scrollThreshold = 100; // Adjust this value to change when the compact header appears

  ngAfterViewInit() {
    this.compactHeader.nativeElement.style.display = 'none';
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const st = window.pageYOffset || document.documentElement.scrollTop;

    if (st > this.lastScrollTop) {
      // Scrolling down
      this.isHeaderHidden = true;
      if (st > this.scrollThreshold) {
        this.showCompactHeader();
      }
    } else {
      // Scrolling up
      this.isHeaderHidden = false;
      if (st <= this.scrollThreshold) {
        this.hideCompactHeader();
      }
    }

    this.lastScrollTop = st <= 0 ? 0 : st;
  }

  showCompactHeader() {
    this.compactHeader.nativeElement.style.display = 'block';
    setTimeout(() => {
      this.isCompactHeaderVisible = true;
    }, 50);
  }

  hideCompactHeader() {
    this.isCompactHeaderVisible = false;
    setTimeout(() => {
      this.compactHeader.nativeElement.style.display = 'none';
    }, 300);
  }


  departureCity: string = '';
  arrivalCity: string = '';

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


  protected readonly locations = locations;
}

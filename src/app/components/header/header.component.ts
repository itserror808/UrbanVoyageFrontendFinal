import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { Router, NavigationEnd, Event } from "@angular/router";
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isSidebarOpen: boolean = false;
  isLoggedIn: boolean = false;
  message: string | null = null;
  messageType: 'success' | 'error' = 'success';

  private subscriptions: Subscription = new Subscription();

  isAdmin: boolean = false;
  isClient: boolean = false;
  private clientSubscription: Subscription | undefined;
  private adminSubscription: Subscription | undefined;

  currentRoute: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn = this.authService.isLoggedIn();

    // Subscribe to router events to track the current route
    this.subscriptions.add(
      this.router.events.pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      })
    );
  }

  ngOnInit() {
    this.subscriptions.add(
      this.authService.getUserRoles().subscribe(
        roles => {
          console.log('Roles updated in HeaderComponent:', roles);
          this.isClient = roles.includes('ROLE_CLIENT');
          this.isAdmin = roles.includes('ROLE_ADMIN');
          console.log('Is client:', this.isClient);
          console.log('Is admin:', this.isAdmin);
        }
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }


  closeSidebar() {
    this.isSidebarOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.message = "Log out successfully"
    this.messageType = 'success';

    this.router.navigate(['/login']);
  }

  closeMessage() {
    this.message = null;
  }

  closelogout() {
    this.closeSidebar();
    this.logout();
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }


}

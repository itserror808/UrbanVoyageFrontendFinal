import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {HomePageComponent} from "./pages/home-page/home-page.component";
import {AuthPageComponent} from "./pages/auth-page/auth-page.component";
import {RoutesPageComponent} from "./pages/routes-page/routes-page.component";
import {BookingPageComponent} from "./pages/booking-page/booking-page.component";
import {SchedulesPageComponent} from "./pages/schedules-page/schedules-page.component";
import {OurServicePageComponent} from "./pages/our-service-page/our-service-page.component";
import {ContactPageComponent} from "./pages/contact-page/contact-page.component";
import {RegisterPageComponent} from "./pages/register-page/register-page.component";
import {LoginPageComponent} from "./pages/login-page/login-page.component";
import {VerifyEmailComponent} from "./pages/verify-email/verify-email.component";
import {BackofficePageComponent} from "./pages/backoffice-page/backoffice-page.component";
import { AdminGuard } from './guards/admin.guard';
import { UnauthorizedPageComponent } from './pages/unauthorized-page/unauthorized-page.component';
import {SuccessPaymentComponent} from "./pages/success-payment/success-payment.component";
import {CancelPaymentComponent} from "./pages/cancel-payment/cancel-payment.component";
import {ClientDashboardComponent} from "./pages/client-dashboard/client-dashboard.component";
import {ClientGuard} from "./guards/client.guard";
import {OAuthRedirectComponent} from "./components/oauth-redirect/oauth-redirect/oauth-redirect.component";
import {ResetPasswordPageComponent} from "./pages/reset-password-page/reset-password-page.component";
import {LandingAnimationComponent} from "./objects/landing-animation/landing-animation.component";
import {MoroccoSVGComponent} from "./objects/morocco-svg/morocco-svg.component";

const routes: Routes = [
  { path: '', component: HomePageComponent, title: 'Home' },
  { path: 'homepage', component: HomePageComponent, title: 'Home' },
  { path: 'routes', component: RoutesPageComponent, title: 'Routes' },
  { path: 'booking', component: BookingPageComponent, title: 'Booking' },
  { path: 'schedules', component: SchedulesPageComponent, title: 'Schedules' },
  { path: 'services', component: OurServicePageComponent, title: 'Our Services' },
  { path: 'contact', component: ContactPageComponent, title: 'About Us' },
  { path: 'login', component: LoginPageComponent, title: 'Login' },
  { path: 'register', component: RegisterPageComponent, title: 'Register' },
  { path: 'auth', component: AuthPageComponent, title: 'Authentication' },
  { path: 'verify-email', component: VerifyEmailComponent, title: 'Verify Email' },
  { path: 'backoffice', component: BackofficePageComponent, canActivate: [AdminGuard], title: 'Back Office' },
  { path: 'unauthorized', component: UnauthorizedPageComponent, title: 'Unauthorized' },
  { path: 'success', component: SuccessPaymentComponent, title: 'Payment Successful' },
  { path: 'cancel', component: CancelPaymentComponent, title: 'Payment Cancelled' },
  { path: 'client-space', component: ClientDashboardComponent, canActivate: [ClientGuard], title: 'Client Space' },
  { path: 'oauth2/redirect', component: OAuthRedirectComponent, title: 'OAuth Redirect' },
  { path: 'reset-password', component: ResetPasswordPageComponent, title: 'Reset Password' },


  // ... other routes ...
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})


export class AppRoutingModule { }

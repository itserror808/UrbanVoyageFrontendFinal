 import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {RouterOutlet} from "@angular/router";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HomePageComponent } from './pages/home-page/home-page.component';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { HeaderComponent } from './components/header/header.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { DarkModeToggleComponent } from './objects/dark-mode-toggle/dark-mode-toggle.component';
import { FooterComponent } from './components/footer/footer.component';
import { RoutesPageComponent } from './pages/routes-page/routes-page.component';
import { BookingPageComponent } from './pages/booking-page/booking-page.component';
import { SchedulesPageComponent } from './pages/schedules-page/schedules-page.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import {OurServicePageComponent} from "./pages/our-service-page/our-service-page.component";
import { ContactPageComponent } from './pages/contact-page/contact-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { OurLocationMapComponent } from './components/our-location-map/our-location-map.component';
import { SponsorsComponent } from './components/sponsors/sponsors.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import {AuthInterceptor} from "./services/auth.interceptor";
import { MessageComponent } from './components/message/message.component';
import { LoadingSpinnerComponent } from './objects/loading-spinner/loading-spinner.component';
import { BackofficePageComponent } from './pages/backoffice-page/backoffice-page.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { UnauthorizedPageComponent } from './pages/unauthorized-page/unauthorized-page.component';
import {AuthService} from "./services/auth.service";
import {PaymentComponent} from "./components/payment/payment.component";
import { SuccessPaymentComponent } from './pages/success-payment/success-payment.component';
import { CancelPaymentComponent } from './pages/cancel-payment/cancel-payment.component';
import {ClientDashboardComponent} from "./pages/client-dashboard/client-dashboard.component";
import {CustomPaginatorComponent} from "./objects/custom-paginator/custom-paginator.component";
import { OAuthRedirectComponent } from './components/oauth-redirect/oauth-redirect/oauth-redirect.component';
import {AutoTranslateDirective} from "./services/auto-translate.directive";
import { LanguageSelectorComponent } from './objects/language-selector/language-selector.component';
import {ImageService} from "./services/image.service";
import { ResetPasswordPageComponent } from './pages/reset-password-page/reset-password-page.component';
import { MoroccoMapComponent } from './components/morocco-map/morocco-map.component';
import { LandingAnimationComponent } from './objects/landing-animation/landing-animation.component';
import { UrbanVoyage3DComponent } from './objects/urban-voyage3-d/urban-voyage3-d.component';
import { MoroccoSVGComponent } from './objects/morocco-svg/morocco-svg.component';

export function initializeApp() {
  return () => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  };
}


@NgModule({ declarations: [
        AppComponent,
        HomePageComponent,
        AuthPageComponent,
        HeaderComponent,
        DarkModeToggleComponent,
        FooterComponent,
        RoutesPageComponent,
        BookingPageComponent,
        SchedulesPageComponent,
        OurServicePageComponent,
        CarouselComponent,
        ContactPageComponent,
        LoginPageComponent,
        RegisterPageComponent,
        OurLocationMapComponent,
        SponsorsComponent,
        VerifyEmailComponent,
        MessageComponent,
        LoadingSpinnerComponent,
        BackofficePageComponent,
        UnauthorizedPageComponent,
        PaymentComponent,
        SuccessPaymentComponent,
        CancelPaymentComponent,
        ClientDashboardComponent,
        CustomPaginatorComponent,
        OAuthRedirectComponent,
        AutoTranslateDirective,
        LanguageSelectorComponent,
        ResetPasswordPageComponent,
        MoroccoMapComponent,
        LandingAnimationComponent,
        UrbanVoyage3DComponent,
        MoroccoSVGComponent,
    ],
    bootstrap: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA], imports: [BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        RouterOutlet,
        GoogleMapsModule], providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AuthService],
            multi: true
        },
        ImageService,
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }

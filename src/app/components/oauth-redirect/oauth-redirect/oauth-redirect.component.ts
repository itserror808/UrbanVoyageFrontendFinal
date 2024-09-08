// src/app/components/oauth-redirect/oauth-redirect.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {OAuthService} from "../../../services/oauth.service";
import {AuthService} from "../../../services/auth.service";
// In oauth-redirect.component.ts

@Component({
  selector: 'app-oauth-redirect',
  template: '<p>Processing login...</p>'
})
export class OAuthRedirectComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}


  // In OAuthRedirectComponent
  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.authService.handleOAuthLogin(token);
      this.authService.hasRole('ROLE_CLIENT').subscribe(isClient => {
        if (isClient) {
          this.router.navigate(['/routes']);
        } else {
          this.router.navigate(['/']);
        }
      });
    }
  }
}

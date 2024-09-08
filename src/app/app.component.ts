import {Component, OnInit} from '@angular/core';
import * as AOS from 'aos';
import {TitleService} from "./services/title.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'UrbanVoyageFrontend';
  constructor(private titleService: TitleService) {
    this.showLanding = !sessionStorage.getItem('animationShown');
  }

  ngOnInit() {
    AOS.init();
    this.titleService.init();

  }

  showLanding: boolean;

  onAnimationComplete() {
    this.showLanding = false;
    sessionStorage.setItem('animationShown', 'true');
  }




}

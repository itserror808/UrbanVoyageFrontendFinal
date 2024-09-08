import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-landing-animation',
  templateUrl: './landing-animation.component.html',
  styleUrls: ['./landing-animation.component.css']
})
export class LandingAnimationComponent implements OnInit {
  @Output() animationComplete = new EventEmitter<void>();

  ngOnInit() {
    this.startAnimation();
  }

  startAnimation() {
    setTimeout(() => {
      this.animationComplete.emit();
    }, 5000); // Animation duration set to 5 seconds
  }
}

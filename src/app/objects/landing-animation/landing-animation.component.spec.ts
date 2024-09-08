import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingAnimationComponent } from './landing-animation.component';

describe('LandingAnimationComponent', () => {
  let component: LandingAnimationComponent;
  let fixture: ComponentFixture<LandingAnimationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandingAnimationComponent]
    });
    fixture = TestBed.createComponent(LandingAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

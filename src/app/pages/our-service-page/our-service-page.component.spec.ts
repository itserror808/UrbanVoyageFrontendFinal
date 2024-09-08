import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurServicePageComponent } from './our-service-page.component';

describe('OurServicePageComponent', () => {
  let component: OurServicePageComponent;
  let fixture: ComponentFixture<OurServicePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OurServicePageComponent]
    });
    fixture = TestBed.createComponent(OurServicePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

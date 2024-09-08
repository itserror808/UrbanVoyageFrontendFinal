import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurLocationMapComponent } from './our-location-map.component';

describe('OurLocationMapComponent', () => {
  let component: OurLocationMapComponent;
  let fixture: ComponentFixture<OurLocationMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OurLocationMapComponent]
    });
    fixture = TestBed.createComponent(OurLocationMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

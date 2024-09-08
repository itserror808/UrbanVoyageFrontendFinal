import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulesPageComponent } from './schedules-page.component';

describe('SchedulesPageComponent', () => {
  let component: SchedulesPageComponent;
  let fixture: ComponentFixture<SchedulesPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchedulesPageComponent]
    });
    fixture = TestBed.createComponent(SchedulesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

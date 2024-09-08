import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackofficePageComponent } from './backoffice-page.component';

describe('BackofficePageComponent', () => {
  let component: BackofficePageComponent;
  let fixture: ComponentFixture<BackofficePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BackofficePageComponent]
    });
    fixture = TestBed.createComponent(BackofficePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

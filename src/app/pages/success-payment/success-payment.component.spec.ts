import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessPaymentComponent } from './success-payment.component';

describe('SuccessPaymentComponent', () => {
  let component: SuccessPaymentComponent;
  let fixture: ComponentFixture<SuccessPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuccessPaymentComponent]
    });
    fixture = TestBed.createComponent(SuccessPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

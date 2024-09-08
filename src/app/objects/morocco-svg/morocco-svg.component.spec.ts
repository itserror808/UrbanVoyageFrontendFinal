import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoroccoSVGComponent } from './morocco-svg.component';

describe('MoroccoSVGComponent', () => {
  let component: MoroccoSVGComponent;
  let fixture: ComponentFixture<MoroccoSVGComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoroccoSVGComponent]
    });
    fixture = TestBed.createComponent(MoroccoSVGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

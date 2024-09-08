import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoroccoMapComponent } from './morocco-map.component';

describe('MoroccoMapComponent', () => {
  let component: MoroccoMapComponent;
  let fixture: ComponentFixture<MoroccoMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoroccoMapComponent]
    });
    fixture = TestBed.createComponent(MoroccoMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

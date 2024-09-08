import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrbanVoyage3DComponent } from './urban-voyage3-d.component';

describe('UrbanVoyage3DComponent', () => {
  let component: UrbanVoyage3DComponent;
  let fixture: ComponentFixture<UrbanVoyage3DComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UrbanVoyage3DComponent]
    });
    fixture = TestBed.createComponent(UrbanVoyage3DComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

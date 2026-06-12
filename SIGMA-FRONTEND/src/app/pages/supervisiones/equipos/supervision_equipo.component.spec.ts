import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionEquipoComponent } from './supervision_equipo.component';

describe('SupervisionEquipoComponent', () => {
  let component: SupervisionEquipoComponent;
  let fixture: ComponentFixture<SupervisionEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisionEquipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupervisionEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

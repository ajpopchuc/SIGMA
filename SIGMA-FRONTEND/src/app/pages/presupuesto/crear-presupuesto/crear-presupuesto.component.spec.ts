import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPresupuestoComponent } from './crear-presupuesto.component';

describe('CrearPresupuestoComponent', () => {
  let component: CrearPresupuestoComponent; 
  let fixture: ComponentFixture<CrearPresupuestoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPresupuestoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPresupuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

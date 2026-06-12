import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearAjustePresupuestosComponent } from './crear-ajustepresupuestos.component';

describe('CrearPresupuestoComponent', () => {
  let component: CrearAjustePresupuestosComponent; 
  let fixture: ComponentFixture<CrearAjustePresupuestosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAjustePresupuestosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearAjustePresupuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

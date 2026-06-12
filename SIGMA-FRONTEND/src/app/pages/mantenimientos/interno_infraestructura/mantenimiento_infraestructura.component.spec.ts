import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoInfraestructuraComponent } from './mantenimiento_infraestructura.component';

describe('MantenimientoInfraestructuraComponent', () => {
  let component: MantenimientoInfraestructuraComponent;
  let fixture: ComponentFixture<MantenimientoInfraestructuraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoInfraestructuraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MantenimientoInfraestructuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

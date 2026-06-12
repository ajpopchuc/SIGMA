import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoEquipoComponent } from './mantenimiento_equipo.component';

describe('MantenimientoEquipoComponent', () => {
  let component: MantenimientoEquipoComponent;
  let fixture: ComponentFixture<MantenimientoEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoEquipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MantenimientoEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearMantenimientoEquipoComponent } from './crear-mantenimiento_equipo.component';

describe('CrearMantenimientoEquipoComponent', () => {
  let component: CrearMantenimientoEquipoComponent;
  let fixture: ComponentFixture<CrearMantenimientoEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearMantenimientoEquipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearMantenimientoEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

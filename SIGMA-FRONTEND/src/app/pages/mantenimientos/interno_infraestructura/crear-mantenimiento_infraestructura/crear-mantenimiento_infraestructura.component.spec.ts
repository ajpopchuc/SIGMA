import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearMantenimientoInfraestructuraComponent } from './crear-mantenimiento_infraestructura.component';

describe('CrearMantenimientoInfraestructuraComponent', () => {
  let component: CrearMantenimientoInfraestructuraComponent;
  let fixture: ComponentFixture<CrearMantenimientoInfraestructuraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearMantenimientoInfraestructuraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearMantenimientoInfraestructuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearMantenimientoExternoComponent } from './crear-mantenimiento_externo.component';

describe('CrearMantenimientoExternoComponent', () => {
  let component: CrearMantenimientoExternoComponent;
  let fixture: ComponentFixture<CrearMantenimientoExternoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearMantenimientoExternoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearMantenimientoExternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

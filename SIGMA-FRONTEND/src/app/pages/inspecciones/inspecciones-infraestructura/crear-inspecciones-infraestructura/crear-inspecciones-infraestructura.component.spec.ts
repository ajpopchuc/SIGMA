import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearInspeccionesInfraestructuraComponent } from './crear-inspecciones-infraestructura.component';

describe('CrearInspeccionesInfraestructuraComponent', () => {
  let component: CrearInspeccionesInfraestructuraComponent;
  let fixture: ComponentFixture<CrearInspeccionesInfraestructuraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearInspeccionesInfraestructuraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearInspeccionesInfraestructuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

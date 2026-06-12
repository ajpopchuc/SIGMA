import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearInspeccionesEquiposComponent } from './crear-inspecciones-equipos.component';

describe('CrearInspeccionesEquiposComponent', () => {
  let component: CrearInspeccionesEquiposComponent;
  let fixture: ComponentFixture<CrearInspeccionesEquiposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearInspeccionesEquiposComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearInspeccionesEquiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

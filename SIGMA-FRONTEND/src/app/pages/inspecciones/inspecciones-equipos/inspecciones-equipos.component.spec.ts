import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspeccionesEquiposComponent } from './inspecciones-equipos.component';

describe('InspeccionesEquiposComponent', () => {
  let component: InspeccionesEquiposComponent;
  let fixture: ComponentFixture<InspeccionesEquiposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspeccionesEquiposComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspeccionesEquiposComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspeccionesInfraestructuraComponent } from './inspecciones-infraestructura.component';

describe('InspeccionesInfraestructuraComponent', () => {
  let component: InspeccionesInfraestructuraComponent;
  let fixture: ComponentFixture<InspeccionesInfraestructuraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspeccionesInfraestructuraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspeccionesInfraestructuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

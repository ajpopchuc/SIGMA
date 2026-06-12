import { TestBed } from '@angular/core/testing';

import { InspeccionesInfraestructuraService } from './inspecciones-infraestructura.service';

describe('InspeccionesInfraestructuraService', () => {
  let service: InspeccionesInfraestructuraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InspeccionesInfraestructuraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

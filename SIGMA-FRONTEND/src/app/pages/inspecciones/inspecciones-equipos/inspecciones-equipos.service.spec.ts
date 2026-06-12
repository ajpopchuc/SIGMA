import { TestBed } from '@angular/core/testing';

import { InspeccionesEquiposService } from './inspecciones-equipos.service';

describe('InspeccionesEquiposService', () => {
  let service: InspeccionesEquiposService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InspeccionesEquiposService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

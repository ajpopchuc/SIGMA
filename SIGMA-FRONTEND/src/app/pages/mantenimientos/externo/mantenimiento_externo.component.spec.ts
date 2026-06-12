import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MantenimientoExternoComponent } from './mantenimiento_externo.component';

describe('MantenimientoExternoComponent', () => {
  let component: MantenimientoExternoComponent;
  let fixture: ComponentFixture<MantenimientoExternoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MantenimientoExternoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MantenimientoExternoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

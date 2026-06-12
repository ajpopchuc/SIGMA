import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ajustePresupuestosComponent } from './ajustepresupuestos.component';

describe('PresupuestoComponent', () => {
  let component: ajustePresupuestosComponent;
  let fixture: ComponentFixture<ajustePresupuestosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ajustePresupuestosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ajustePresupuestosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

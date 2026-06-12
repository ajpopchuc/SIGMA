import { ComponentFixture, TestBed } from '@angular/core/testing';
import { tableroPresupuestoComponent } from './tableroPresupuesto.component';

describe('ProveedorComponent', () => {
  let component: tableroPresupuestoComponent;
  let fixture: ComponentFixture<tableroPresupuestoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [tableroPresupuestoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(tableroPresupuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReporteGastoTotalComponent } from './gasto_total.component';

describe('ReporteGastoTotalComponent', () => {
  let component: ReporteGastoTotalComponent;
  let fixture: ComponentFixture<ReporteGastoTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteGastoTotalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReporteGastoTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

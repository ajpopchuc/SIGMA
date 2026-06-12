import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HorasHombreComponent } from './horas_hombre.component';

describe('ActividadesUsuarioComponent', () => {
  let component: HorasHombreComponent;
  let fixture: ComponentFixture<HorasHombreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HorasHombreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HorasHombreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

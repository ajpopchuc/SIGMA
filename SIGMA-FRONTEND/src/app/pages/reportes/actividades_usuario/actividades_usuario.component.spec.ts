import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActividadesUsuarioComponent } from './actividades_usuario.component';

describe('ActividadesUsuarioComponent', () => {
  let component: ActividadesUsuarioComponent;
  let fixture: ComponentFixture<ActividadesUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActividadesUsuarioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ActividadesUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

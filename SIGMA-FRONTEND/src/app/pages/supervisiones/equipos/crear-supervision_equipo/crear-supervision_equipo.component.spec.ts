import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearSupervisionEquipoComponent } from './crear-supervision_equipo.component';

describe('CrearSupervisionEquipoComponent', () => {
  let component: CrearSupervisionEquipoComponent;
  let fixture: ComponentFixture<CrearSupervisionEquipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearSupervisionEquipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearSupervisionEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

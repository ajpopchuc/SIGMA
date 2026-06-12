import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionInfraestructuraComponent } from './supervision_infraestructura.component';

describe('SupervisionEquipoComponent', () => {
  let component: SupervisionInfraestructuraComponent;
  let fixture: ComponentFixture<SupervisionInfraestructuraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupervisionInfraestructuraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SupervisionInfraestructuraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

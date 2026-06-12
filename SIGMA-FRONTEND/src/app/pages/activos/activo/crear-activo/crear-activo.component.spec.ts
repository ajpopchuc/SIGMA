import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearActivoComponent } from './crear-activo.component';

describe('CrearActivoComponent', () => {
  let component: CrearActivoComponent;
  let fixture: ComponentFixture<CrearActivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearActivoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearActivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

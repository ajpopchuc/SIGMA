import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarInstalacionesComponent } from './editar-instalaciones.component';

describe('EditarInstalacionesComponent', () => {
  let component: EditarInstalacionesComponent;
  let fixture: ComponentFixture<EditarInstalacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarInstalacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarInstalacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCampusComponent } from './editar-campus.component';

describe('EditarCampusComponent', () => {
  let component: EditarCampusComponent;
  let fixture: ComponentFixture<EditarCampusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarCampusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarCampusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

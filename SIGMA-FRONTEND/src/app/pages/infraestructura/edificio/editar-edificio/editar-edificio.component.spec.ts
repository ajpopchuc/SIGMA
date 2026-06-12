import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEdificioComponent } from './editar-edificio.component';

describe('EditarEdificioComponent', () => {
  let component: EditarEdificioComponent;
  let fixture: ComponentFixture<EditarEdificioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarEdificioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEdificioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

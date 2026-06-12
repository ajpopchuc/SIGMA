import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCampusComponent } from './crear-campus.component';

describe('CrearCampusComponent', () => {
  let component: CrearCampusComponent;
  let fixture: ComponentFixture<CrearCampusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCampusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearCampusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEdificioComponent } from './crear-edificio.component';

describe('CrearEdificioComponent', () => {
  let component: CrearEdificioComponent;
  let fixture: ComponentFixture<CrearEdificioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearEdificioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearEdificioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

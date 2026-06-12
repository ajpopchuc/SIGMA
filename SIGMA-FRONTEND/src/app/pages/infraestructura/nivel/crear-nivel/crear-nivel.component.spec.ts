import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearNivelComponent } from './crear-nivel.component';

describe('CrearNivelComponent', () => {
  let component: CrearNivelComponent;
  let fixture: ComponentFixture<CrearNivelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearNivelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearNivelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

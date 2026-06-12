import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearAjusteRecursosComponent } from './crear-ajuste_recursos.component';

describe('CrearAjusteRecursosComponent', () => {
  let component: CrearAjusteRecursosComponent; 
  let fixture: ComponentFixture<CrearAjusteRecursosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAjusteRecursosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearAjusteRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

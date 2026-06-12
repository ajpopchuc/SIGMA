import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ajusteRecursosComponent } from './ajuste_recursos.component';

describe('ajusteRecursosComponent', () => {
  let component: ajusteRecursosComponent;
  let fixture: ComponentFixture<ajusteRecursosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ajusteRecursosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ajusteRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

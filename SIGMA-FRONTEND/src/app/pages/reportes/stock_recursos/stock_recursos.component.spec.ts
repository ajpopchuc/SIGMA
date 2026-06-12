import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockRecursosComponent } from './stock_recursos.component';

describe('StockRecursosComponent', () => {
  let component: StockRecursosComponent;
  let fixture: ComponentFixture<StockRecursosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockRecursosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

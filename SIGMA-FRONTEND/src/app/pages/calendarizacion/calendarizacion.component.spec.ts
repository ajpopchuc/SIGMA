import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarizacionComponent } from './calendarizacion.component';
import { FullCalendarModule } from '@fullcalendar/angular';

describe('ProveedorComponent', () => {
  let component: CalendarizacionComponent;
  let fixture: ComponentFixture<CalendarizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarizacionComponent, FullCalendarModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the calendar component', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarProveedorComponent } from './editar-proveedores.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ProveedorService } from '../proveedores.service';

describe('EditarProveedorComponent', () => {
  let component: EditarProveedorComponent;
  let fixture: ComponentFixture<EditarProveedorComponent>;
  let proveedorService: jasmine.SpyObj<ProveedorService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ProveedorService', ['actualizarProveedor']);
    
    await TestBed.configureTestingModule({
      imports: [
        EditarProveedorComponent,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ProveedorService, useValue: spy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarProveedorComponent);
    component = fixture.componentInstance;
    proveedorService = TestBed.inject(ProveedorService) as jasmine.SpyObj<ProveedorService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values', () => {
    expect(component.proveedorForm.get('nombre_proveedor')?.value).toBe('');
    expect(component.proveedorForm.get('nombre_persona_contacto')?.value).toBe('');
    expect(component.proveedorForm.get('correo_contacto')?.value).toBe('');
    expect(component.proveedorForm.get('pbx')?.value).toBe('');
    expect(component.proveedorForm.get('telefono_persona_contacto')?.value).toBe('');
    expect(component.proveedorForm.get('direccion')?.value).toBe('');
    expect(component.proveedorForm.get('descripcion')?.value).toBe('');
    expect(component.proveedorForm.get('tipo_proveedor')?.value).toBe('');
    expect(component.proveedorForm.get('estado')?.value).toBe('Activo');
  });

  it('should have invalid form when empty', () => {
    expect(component.proveedorForm.valid).toBeFalsy();
  });
});
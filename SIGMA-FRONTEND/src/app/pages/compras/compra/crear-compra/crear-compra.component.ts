import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService } from '../compra.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-compra',
  standalone: true,
  templateUrl: './crear-compra.component.html',
  styleUrls: ['./crear-compra.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class CrearCompraComponent implements OnInit {
  compraForm: FormGroup;
  recursos: { id: number, nombre: string, precio: number, area:string }[] = [];
  recursosOriginales: { id: number, nombre: string, precio: number, area: string }[] = []; // Lista original de recursos
  proveedores: { id: number, nombre_proveedor: string }[] = [];
  isSaving: boolean = false; // Variable para controlar el estado de guardado

  constructor(
    private fb: FormBuilder,
    private compraService: CompraService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.compraForm = this.fb.group({
      id_proveedor: ['', Validators.required],
      total: [''],
      tipoCompra: ['recursos', Validators.required], // Default value 'recursos'
      fecha_factura: ['', Validators.required],
      area: ['', Validators.required],
      no_factura: ['', Validators.required],
      serie_factura: ['', Validators.required],
      otras_compras: [''],
      items: this.fb.array([this.createItem()],)
    });
  }

  ngOnInit() {
    this.loadProveedores();
    this.loadRecursos();
    const userId = localStorage.getItem('userId');

    // Suscribirse al cambio de valor del área
    this.compraForm.get('area')?.valueChanges.subscribe((selectedArea) => {
      if (selectedArea) {
        this.filterRecursosByArea(selectedArea);
      }
    });

    this.compraForm.get('tipoCompra')?.valueChanges.subscribe(value => {
      if (value === 'otras') {
        this.items.clear(); // Clear recursos items when switching to otras_compras
      } else if (value === 'recursos') {
        this.compraForm.patchValue({ otras_compras: '' }); // Clear otras_compras when switching to recursos
      }
    });
    
  }

  private filterRecursosByArea(area: string) {
    // Filtrar los recursos según el área seleccionada
    this.recursos = this.recursosOriginales.filter(r => r.area === area);
  }

  private loadProveedores() {
    this.compraService.getProveedor('Activo').subscribe({
      next: (response) => {
        
        if (response && response.data) {
          this.proveedores = response.data;
          
          if (this.proveedores.length === 0) {
            Swal.fire('Advertencia', 'No hay proveedores activos disponibles', 'warning');
          }
        } else {
          console.error('Formato de respuesta inesperado:', response);
          Swal.fire('Error', 'Error en el formato de datos de proveedores', 'error');
        }
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        Swal.fire('Error', 'No se pudieron cargar los proveedores', 'error');
      }
    });
  }
  
  private loadRecursos() {
    this.compraService.getRecurso('Activo').subscribe({
      next: (response) => {
        if (response && response.data) {
          this.recursos = response.data; // Cargar todos los recursos inicialmente
          this.recursosOriginales = [...response.data]; // Guardar una copia de la lista original
        }
      },
      error: (error) => {
        console.error('Error al cargar recursos:', error);
        // Agregar más detalles al error
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error completo:', error);
        Swal.fire('Error', 'No se pudieron cargar los recursos', 'error');
      }
    });
  }

  createItem(): FormGroup {
    return this.fb.group({
      id_recurso: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      // unidad de medida
      unidad_medida: ['', Validators.required],
      precio_unitario: [0, Validators.required],
      nuevo_precio: [null], // Nuevo campo opcional
      total: [0, Validators.required]
    });
  }

  get items(): FormArray {
    return this.compraForm.get('items') as FormArray;
  }

  onRecursoSelect(index: number) {
    const control = this.items.at(index);
    const selectedRecurso = this.recursos.find(r => r.id == control.get('id_recurso')?.value);

    if (selectedRecurso) {
      control.get('precio_unitario')?.enable();  //posible error
      control.patchValue({
        precio_unitario: selectedRecurso.precio,
        total: selectedRecurso.precio * control.get('cantidad')?.value
      });
    }

    this.calculateTotal();
  }

  updateTotalPrice(index: number) {
    const control = this.items.at(index);
    const precioOriginal = control.get('precio_unitario')?.value || 0;
    const nuevoPrecio = control.get('nuevo_precio')?.value || precioOriginal;
    const cantidad = control.get('cantidad')?.value || 0;
  
    const total = nuevoPrecio * cantidad;
    
    control.patchValue({ 
      total: total
    });
  
    this.calculateTotal();
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
    this.calculateTotal();
  }

  calculateTotal() {
    const itemsArray = this.items.value as { total: number }[];
    const total = itemsArray.reduce((sum, item) => sum + (parseFloat(item.total.toString()) || 0), 0);
    this.compraForm.patchValue({ total: total });
  }

  onSubmit() {
    if (this.compraForm.valid) {
      this.isSaving = true; // Activar estado de guardado
      const userId = localStorage.getItem('userId');

      let formData: any = {
      ...this.compraForm.value,
      id_usuario: userId,
    };

    // Handle items based on purchase type
    if (this.compraForm.get('tipoCompra')?.value === 'recursos' || 
        this.compraForm.get('tipoCompra')?.value === 'mixta') {
      formData.items = this.items.controls.map((itemControl) => {
        const itemValue = itemControl.value;
        return {
          ...itemValue,
          nuevo_precio: itemValue.nuevo_precio && itemValue.nuevo_precio !== itemValue.precio_unitario 
            ? itemValue.nuevo_precio 
            : undefined
        };
      });
    }

    const total = typeof this.compraForm.get('total')?.value === 'string' 
      ? this.convertTotalToNumber(this.compraForm.get('total')?.value) 
      : this.compraForm.get('total')?.value;

    formData.total = total;
  
      this.compraService.createCompra(formData).subscribe(
        (response) => {
          this.isSaving = false; // Desactivar estado de guardado
          Swal.fire('Compra creada', 'La compra ha sido registrada con éxito', 'success');
          this.router.navigate(['/compras']);
        },
        (error) => {
          this.isSaving = false; // Desactivar estado de guardado
          Swal.fire('Error', 'Ocurrió un error al registrar la compra: ' + error.error.message, 'error');
        }
      );
    } else {
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos', 'error');
    }
  }

  cancelar(): void {
    this.router.navigate(['/compras']);
  }

  private convertTotalToNumber(total: string): number {
    // Eliminar cualquier carácter que no sea número, coma o punto
    const cleanedValue = total.replace(/[^0-9,.]/g, '');
  
    // Convertir a número eliminando las comas
    return parseFloat(cleanedValue.replace(/,/g, ''));
  }

  onTotalInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
  
    // Eliminar cualquier carácter que no sea número, coma o punto
    value = value.replace(/[^0-9,.]/g, '');
  
    // Validar el formato y limpiar el valor
    value = this.cleanTotalValue(value);
  
    // Actualizar el valor en el formulario
    this.compraForm.get('total')?.setValue(value, { emitEvent: false });
  }

  private cleanTotalValue(value: string): string {
    // Eliminar múltiples comas o puntos
    value = value.replace(/(,.*?),(.*,)?/, '$1'); // Solo una coma
    value = value.replace(/(\..*?)\.(.*\.)?/, '$1'); // Solo un punto
  
    // Asegurar que la coma sea el separador de miles y el punto el separador decimal
    const parts = value.split('.');
    if (parts.length > 1) {
      // Si hay un punto, solo permitir dos decimales
      parts[1] = parts[1].slice(0, 2);
      value = parts.join('.');
    }
  
    return value;
  }



}
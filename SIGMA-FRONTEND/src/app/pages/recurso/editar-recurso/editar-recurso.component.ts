import { Component, OnInit, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecursoService } from '../recurso.service';
import Swal from 'sweetalert2';
declare var KTWizard: any;
declare var KTUtil: any;

@Component({
  selector: 'app-editar-recurso',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-recurso.component.html',
  styleUrls: ['./editar-recurso.component.css']
})
export class EditarRecursosComponent implements OnInit, AfterViewInit {
  recursosForm: FormGroup;
  recurso: any;
  recursoId: number;
  private _wizardObj: any;
  private _formEl: any;

  constructor(
    private fb: FormBuilder,
    private recursoService: RecursoService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.recursosForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      codigo: ['', [Validators.required]],
      area: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      existencias: [0, [Validators.required, Validators.min(0)]],
      existencias_minimas: [0, [Validators.required, Validators.min(0)]],
      existencias_maximas: [1, [Validators.required, Validators.min(1)]],
      precio: [0, [Validators.required]],
      estado: ['Activo', [Validators.required]]
    });
  
    const navigation = this.router.getCurrentNavigation();
    this.recurso = navigation?.extras?.state?.['recurso'];
    this.recursoId = this.recurso?.id || 0;
  
  }

  ngOnInit(): void {
    if (this.recurso) {
      this.recursosForm.patchValue({
        nombre: this.recurso.nombre,
        codigo: this.recurso.codigo,
        area: this.recurso.area,
        descripcion: this.recurso.descripcion,
        existencias: this.recurso.existencias,
        existencias_minimas: this.recurso.existencias_minimas,
        existencias_maximas: this.recurso.existencias_maximas,
        precio: this.recurso.precio,
        estado: this.recurso.estado
      });
    }
  }

  ngAfterViewInit(): void {
    this.initWizard();
  }

  isSaving: boolean = false;

  private initWizard() {
    this._wizardObj = new KTWizard('kt_wizard', {
      startStep: 1,
      clickableSteps: false
    });

    this._formEl = KTUtil.getById('kt_form');

    this._wizardObj.on('change', (wizard: any) => {
      if (wizard.getStep() > wizard.getNewStep()) {
        return; // Skip if stepped back
      }
      const step = wizard.getStep();

      // Validate form on each step
      if (step === 1) {
        const nombre = this.recursosForm.value.nombre;
        const area = this.recursosForm.value.area;
        const codigo = this.recursosForm.value.codigo;
        const descripcion = this.recursosForm.value.descripcion;
        const existencias = this.recursosForm.value.existencias;
        const existencias_minimas = this.recursosForm.value.existencias_minimas;
        const existencias_maximas = this.recursosForm.value.existencias_maximas;
        const precio = this.recursosForm.value.precio;
        const estado = this.recursosForm.value.estado;

        if (!nombre || !codigo || !descripcion || existencias==null || existencias_minimas==null || !existencias_maximas || !estado || !area) {
          wizard.stop(); // Stop navigation
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese todos los datos obligatorios. (marcados con *)'
          });
          return;
        }
      }
    });

    this.isSaving = false; 

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.recursosForm.valid) {
        // Imprimir en consola el valor del formulario antes de enviar
        this.isSaving = true; 
        this.recursosForm.get('precio')?.setValue(this.convertPriceToNumber(this.recursosForm.value.precio));
        this.recursoService.actualizarRecurso(this.recursoId, this.recursosForm.value).subscribe(
          (response) => {
            this.isSaving = false; 
            if (response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Recurso',
                text: 'Recurso modificado correctamente'
              });

              // Redirigir y pasar la información del recurso
              this.router.navigate(['/recursos']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al modificar el recurso: '
              });
              this.router.navigate(['/recursos']);
            }
          },
          (error) => {
            this.isSaving = false; 
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ha ocurrido un error al modificar el recurso: '
            });
            this.router.navigate(['/recursos']);
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, revise los errores en su formulario'
        });
      }
    });
  }

  onSubmit() {
    this._wizardObj.goTo(3);
    this._wizardObj.submit();
  }

  mostrarMensaje(mensaje: string): void {
    alert(mensaje);
  }

  cancelar(): void {
    this.router.navigate(['/recursos']);
  }

  private convertPriceToNumber(precio: string): number {
    // Eliminar cualquier carácter que no sea número, coma o punto
    const cleanedValue = precio.replace(/[^0-9,.]/g, '');

    // Convertir a número eliminando las comas
    return parseFloat(cleanedValue.replace(/,/g, ''));
  }

  onPriceInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    // Eliminar cualquier carácter que no sea número, coma o punto
    value = value.replace(/[^0-9,.]/g, '');

    // Validar el formato y limpiar el valor
    value = this.cleanPriceValue(value);

    // Actualizar el valor en el formulario
    this.recursosForm.get('precio')?.setValue(value, { emitEvent: false });
  }

  private cleanPriceValue(value: string): string {
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

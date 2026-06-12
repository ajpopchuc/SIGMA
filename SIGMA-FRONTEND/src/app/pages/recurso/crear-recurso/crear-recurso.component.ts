import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RecursoService } from '../recurso.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

declare var KTWizard: any; 
declare var KTUtil: any; 

@Component({
  selector: 'app-crear-recurso',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-recurso.component.html',
  styleUrls: ['./crear-recurso.component.css'] // Corrected styleUrl to styleUrls
})
export class CrearRecursoComponent implements AfterViewInit {
  private _wizardObj: any;
  private _formEl: any;
  recursoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private RecursoService: RecursoService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.recursoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(100)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      area: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      existencias: ['', [Validators.required, Validators.min(0)]],
      existencias_minimas: ['', [Validators.required, Validators.min(0)]],
      existencias_maximas: ['', [Validators.required, Validators.min(1)]],
      precio: ['', [Validators.required]],
      estado: [{ value: 'Activo', disabled: true }, [Validators.required, Validators.maxLength(50)]],
    });
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
        const codigo = this.recursoForm.value.codigo;
        const nombre = this.recursoForm.value.nombre;
        const area = this.recursoForm.value.area;
        const precio = this.recursoForm.value.precio;
        const descripcion = this.recursoForm.value.descripcion;
        const enExistencias = this.recursoForm.value.existencias;
        const existencias_minimas = this.recursoForm.value.existencias_minimas;
        const existencias_maximas = this.recursoForm.value.existencias_maximas;

        if (!codigo || !nombre || !descripcion || enExistencias==null || existencias_minimas==null || !existencias_maximas || !area) {
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
      if (this.recursoForm.valid) {
        this.isSaving = true; 
        this.recursoForm.get('precio')?.setValue(this.convertPriceToNumber(this.recursoForm.value.precio));
        this.RecursoService.crearRecurso(this.recursoForm.value).subscribe(
          
          (response) => {
            this.isSaving = false; 
            if (response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Recurso creado correctamente.'
              });
              this.router.navigate(['/recursos']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ha ocurrido un error al crear el recurso: ${response.error}`
              });
            }
          },
          (error) => {
            this.isSaving = false; 
            console.log(error)
            let errorMessage = 'Ha ocurrido un error al crear el recurso: \n';
            
            // Iteramos sobre el objeto de errores
            Object.keys(error.error.errors).forEach((field) => {
              // Obtenemos el array de errores para cada campo
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`; // Añadimos cada mensaje al string
              });
            });
          
            // Mostrar el mensaje concatenado en Swal
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, corrija los errores en su formulario.'
        });
      }
    });
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
    this.recursoForm.get('precio')?.setValue(value, { emitEvent: false });
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

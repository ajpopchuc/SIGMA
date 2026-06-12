import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ajustePresupuestosService } from '../ajustepresupuestos.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

declare var KTWizard: any; 
declare var KTUtil: any; 

@Component({
  selector: 'app-crear-ajustepresupuestos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-ajustepresupuestos.component.html',
  styleUrls: ['./crear-ajustepresupuestos.component.css'] // Corrected styleUrl to styleUrls
})
export class CrearAjustePresupuestosComponent implements AfterViewInit {
  private _wizardObj: any;
  private _formEl: any;
  ajustePresupuestosForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ajustePresupuestosService: ajustePresupuestosService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.ajustePresupuestosForm = this.fb.group({
      area: ['',[Validators.required]],
      cantidad: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      motivo: ['',[Validators.required]],
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
        const area = this.ajustePresupuestosForm.value.area;
        const cantidad = this.ajustePresupuestosForm.value.cantidad;
        const tipo = this.ajustePresupuestosForm.value.tipo;

        if ( !cantidad || !tipo || !area) {
          wizard.stop(); // Stop navigation
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese datos válidos.'
          });
          return;
        }
      }
    });

    this.isSaving = false; 

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.ajustePresupuestosForm.valid) {
        this.isSaving = true; 
        this.ajustePresupuestosForm.get('cantidad')?.setValue(this.convertPriceToNumber(this.ajustePresupuestosForm.get('cantidad')?.value.toString()));
        this.ajustePresupuestosService.crearAjustePresupuestos(this.ajustePresupuestosForm.value).subscribe(
          (response) => {
            this.isSaving = false; 
            if (response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Ajuste de presupuestos creado correctamente.'
              });
              this.router.navigate(['/ajustePresupuestos']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ha ocurrido un error al crear el ajuste de presupuestos: ${response.error}`
              });
            }
          },
          (error) => {
            this.isSaving = false; 
            let errorMessage = 'Ha ocurrido un error al crear el ajuste de presupuestos: \n';
            
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
    this.router.navigate(['/ajustePresupuestos']);
  }

  private convertPriceToNumber(cantidad: string): number {
    // Eliminar cualquier carácter que no sea número, coma o punto
    const cleanedValue = cantidad.replace(/[^0-9,.]/g, '');

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
    this.ajustePresupuestosForm.get('cantidad')?.setValue(value, { emitEvent: false });
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

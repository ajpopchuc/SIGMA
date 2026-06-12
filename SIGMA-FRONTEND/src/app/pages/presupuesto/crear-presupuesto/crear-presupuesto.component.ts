import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PresupuestoService } from '../presupuesto.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

declare var KTWizard: any; 
declare var KTUtil: any; 

@Component({
  selector: 'app-crear-presupuesto',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-presupuesto.component.html',
  styleUrls: ['./crear-presupuesto.component.css'] // Corrected styleUrl to styleUrls
})
export class CrearPresupuestoComponent implements AfterViewInit {
  private _wizardObj: any;
  private _formEl: any;
  presupuestoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private PresupuestoService: PresupuestoService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // 1 de enero del presente año
    const endDate = new Date(currentYear, 11, 1); // 1 de diciembre del presente año

    this.presupuestoForm = this.fb.group({ 
      area: ['',[Validators.required]],
      monto_presupuesto: ['',[Validators.required, Validators.min(0)]],
      fecha_inicio: [startDate.toISOString().split('T')[0], [Validators.required]],
      fecha_fin: [endDate.toISOString().split('T')[0], [Validators.required]],
      periodo: ['',[Validators.required]],
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
        const area = this.presupuestoForm.value.area;
        const monto_presupuesto = this.presupuestoForm.value.monto_presupuesto;
        const fecha_inicio = this.presupuestoForm.value.fecha_inicio;
        const fecha_fin = this.presupuestoForm.value.fecha_fin;
        const periodo = this.presupuestoForm.value.periodo;

        if (!monto_presupuesto || !fecha_inicio || !fecha_fin || !area || !periodo) {
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
      if (this.presupuestoForm.valid) {
        this.isSaving = true; 
        this.presupuestoForm.get('monto_presupuesto')?.setValue(this.convertPriceToNumber(this.presupuestoForm.value.monto_presupuesto));
        this.PresupuestoService.crearPresupuesto(this.presupuestoForm.value).subscribe(
          (response) => {
            this.isSaving = false; 
            if (response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Presupuesto creado correctamente.'
              });
              this.router.navigate(['/presupuesto']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ha ocurrido un error al crear el presupuesto: ${response.error}`
              });
            }
          },
          (error) => {
            this.isSaving = false; 
            let errorMessage = 'Ha ocurrido un error al crear el presupuesto: \n';
            
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
    this.router.navigate(['/presupuesto']);
  }

  private convertPriceToNumber(monto_presupuesto: string): number {
    // Eliminar cualquier carácter que no sea número, coma o punto
    const cleanedValue = monto_presupuesto.replace(/[^0-9,.]/g, '');

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
    this.presupuestoForm.get('monto_presupuesto')?.setValue(value, { emitEvent: false });
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


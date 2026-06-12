import { Component, OnInit, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CampusService } from '../campus.service';
import Swal from 'sweetalert2';
declare var KTWizard: any;
declare var KTUtil: any;

@Component({
  selector: 'app-editar-campus',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-campus.component.html',
  styleUrls: ['./editar-campus.component.css']
})
export class EditarCampusComponent implements OnInit, AfterViewInit {
  campusForm: FormGroup;
  campus: any;
  campusId: number;
  private _wizardObj: any;
  private _formEl: any;
  isSaving: boolean = false;

  constructor(
    private fb: FormBuilder,
    private campusService: CampusService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.campusForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
    });
  
    const navigation = this.router.getCurrentNavigation();
    this.campus = navigation?.extras?.state?.['campus'];
    this.campusId = this.campus?.id || 0;
  
  }

  ngOnInit(): void {
    if (this.campus) {
      this.campusForm.patchValue({
        nombre: this.campus.nombre,
        descripcion: this.campus.descripcion,
      });
    }
  }

  ngAfterViewInit(): void {
    this.initWizard();
  }

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
        const nombre = this.campusForm.value.nombre;
        const descripcion = this.campusForm.value.descripcion;

        if (!nombre || !descripcion) {
          wizard.stop(); // Stop navigation
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un nombre y descripción válidos.'
          });
          return;
        }
      }
    });

    

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.campusForm.valid) {
        // Imprimir en consola el valor del formulario antes de enviar
        this.isSaving = true;
        this.campusService.actualizarCampus(this.campusId, this.campusForm.value).subscribe(
          (response) => {
            if (response.status === 200) {
              this.isSaving = false;
              Swal.fire({
                icon: 'success',
                title: 'Campus',
                text: 'Campus modificado correctamente'
              });

              // Redirigir y pasar la información del campus
              this.router.navigate(['/campus']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al modificar el campus: '
              });
              this.router.navigate(['/campus']);
            }
          },
          (error) => {
            this.isSaving = false;
            let errorMessage = 'Ha ocurrido un error al editar el campus: \n';
            
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
          text: 'Por favor, revise los errores en su formulario'
        });
      }
    });
  }

  onSubmit() {
    this._wizardObj.goTo(3);
    this._wizardObj.submit();
  }

  cancelar(): void {
    this.router.navigate(['/campus']);
  }
}

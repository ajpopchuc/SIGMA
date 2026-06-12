import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AjusteRecursosService } from '../ajuste_recursos.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

declare var KTWizard: any; 
declare var KTUtil: any; 

@Component({
  selector: 'app-crear-ajuste_recursos',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-ajuste_recursos.component.html',
  styleUrls: ['./crear-ajuste_recursos.component.css'] // Corrected styleUrl to styleUrls
})
export class CrearAjusteRecursosComponent implements AfterViewInit {
  private _wizardObj: any;
  private _formEl: any;
  ajusteRecursosForm: FormGroup;
  recursos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private ajusteRecursosService: AjusteRecursosService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.ajusteRecursosForm = this.fb.group({
      id_recurso: ['', [Validators.required]],
      cantidad: ['', [Validators.required]],
      tipo: ['', [Validators.required]],
      motivo: ['',[Validators.required]],
    });    
  }


  ngAfterViewInit(): void {
    this.fetchRecursos();
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
        const id_recurso = this.ajusteRecursosForm.get('id_recurso')?.value;
        const cantidad = this.ajusteRecursosForm.get('cantidad')?.value;
        const tipo = this.ajusteRecursosForm.get('tipo')?.value;
        const motivo = this.ajusteRecursosForm.get('motivo')?.value;


        if (id_recurso === '' || cantidad === '' || tipo === '' || motivo === '') {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese todos los datos obligatorios. (marcados con *)'
          });
          wizard.stop(); // Don't go to the next step
        }
      }
    });

    this.isSaving = false; 

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.ajusteRecursosForm.valid) {
        this.isSaving = true; 
        this.ajusteRecursosService.crearAjusteRecursos(this.ajusteRecursosForm.value).subscribe(
          (response) => {
            this.isSaving = false; 
            if (response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Ajuste de recursos creado correctamente.'
              });
              this.router.navigate(['/ajusteRecursos']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ha ocurrido un error al crear el ajuste de recursos: ${response.message}`
              });
            }
          },
          (error) => {
            this.isSaving = false; 
            let errorMessage = 'Ha ocurrido un error al crear el ajuste de recursos: \n';
            
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

  fetchRecursos(): void {
    this.ajusteRecursosService.getRecursos().subscribe(
      (data) => {
        this.recursos = data;
      },
      (error) => {
        console.error('Error fetching recursos:', error);
      }
    );
  }
  
  getRecursoNombre(id: any): string {
    const recurso = this.recursos.find(r => r.id == id); // Use '==' for type coercion
    return recurso ? recurso.nombre : '';
  }

  cancelar(): void {
    this.router.navigate(['/ajusteRecursos']);
  }
}

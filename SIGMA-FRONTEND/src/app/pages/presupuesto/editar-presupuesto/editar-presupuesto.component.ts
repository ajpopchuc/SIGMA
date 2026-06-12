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
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      precio: [0, [Validators.required, Validators.min(0)]],
      existencias: [0, [Validators.required, Validators.min(0)]],
      existencias_minimas: [0, [Validators.required, Validators.min(0)]],
      existencias_maximas: [0, [Validators.required, Validators.min(0)]],
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
        descripcion: this.recurso.descripcion,
        precio: this.recurso.precio,
        existencias: this.recurso.existencias,
        existencias_minimas: this.recurso.existencias_minimas,
        existencias_maximas: this.recurso.existencias_maximas,
        estado: this.recurso.estado
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
        const nombre = this.recursosForm.value.nombre;
        const descripcion = this.recursosForm.value.descripcion
        const precio = this.recursosForm.value.precio;
        const existencias = this.recursosForm.value.existencias;
        const existencias_minimas = this.recursosForm.value.existencias_minimas;
        const existencias_maximas = this.recursosForm.value.existencias_maximas;
        const estado = this.recursosForm.value.estado;

        if (!nombre || !descripcion || !precio || !existencias || !existencias_minimas || !existencias_maximas || !estado) {
          wizard.stop(); // Stop navigation
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese datos validos'
          });
          return;
        }
      }
    });

    

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.recursosForm.valid) {
        // Imprimir en consola el valor del formulario antes de enviar

        this.recursoService.actualizarRecurso(this.recursoId, this.recursosForm.value).subscribe(
          (response) => {
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
}

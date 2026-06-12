import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProveedorService } from '../proveedores.service'; // Asegúrate de que el servicio está correctamente importado
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { co } from '@fullcalendar/core/internal-common';


declare var KTWizard: any;
declare var KTUtil: any;

@Component({
  selector: 'app-crear-proveedor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-proveedores.component.html',
  styleUrls: ['./crear-proveedores.component.css'] // Corrected styleUrl to styleUrls
})
export class CrearProveedorComponent implements AfterViewInit {
  private _wizardObj: any;
  private _formEl: any;
  proveedorForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private proveedorService: ProveedorService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.proveedorForm = this.fb.group({
      nombre_proveedor: ['', [Validators.required, Validators.maxLength(100)]],
      nombre_persona_contacto: ['', [Validators.required, Validators.maxLength(100)]],
      correo_contacto: ['', [Validators.email, Validators.maxLength(100)]],
      pbx: [''],
      telefono_persona_contacto: ['', [Validators.required]],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.maxLength(300)]],
      tipo_proveedor: ['', [Validators.required, Validators.maxLength(50)]],
      estado: [{ value: 'Activo', disabled: true }, [Validators.required]]
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
        return; // Skip if stepping back
      }

      const step = wizard.getStep();
      if (step === 1) {
        const nombreProveedor = this.proveedorForm.value.nombre_proveedor;
        const nombreContacto = this.proveedorForm.value.nombre_persona_contacto;
        const telefonoContacto = this.proveedorForm.value.telefono_persona_contacto;
        const direccion = this.proveedorForm.value.direccion;
        const tipo_proveedor = this.proveedorForm.value.tipo_proveedor;

        if (!nombreProveedor || !nombreContacto || !telefonoContacto || !direccion || !tipo_proveedor) {
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
      if (this.proveedorForm.valid) {
        this.isSaving = true; 
        this.proveedorService.crearProveedor(this.proveedorForm.value).subscribe(
          (response) => {
            this.isSaving = false; 
            if (response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Proveedor creado correctamente.'
              });
              this.router.navigate(['/proveedores']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ha ocurrido un error al crear el proveedor: ${response.error}`
              });
            }
          },
          (error) => {
            this.isSaving = false; 
            let errorMessage = 'Ha ocurrido un error al crear el proveedor: \n';

            Object.keys(error.error.errors).forEach((field) => {
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`;
              });
            });

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
    this.router.navigate(['/proveedores']);
  }
}

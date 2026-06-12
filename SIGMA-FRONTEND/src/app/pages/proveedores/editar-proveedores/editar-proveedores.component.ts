import { Component, OnInit, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProveedorService } from '../proveedores.service';
import Swal from 'sweetalert2';
declare var KTWizard: any;
declare var KTUtil: any;

@Component({
  selector: 'app-editar-proveedor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-proveedores.component.html',
  styleUrls: ['./editar-proveedores.component.css']
})
export class EditarProveedorComponent implements OnInit, AfterViewInit {
  proveedorForm: FormGroup;
  proveedor: any;
  proveedorId: number;
  private _wizardObj: any;
  private _formEl: any;

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
      correo_contacto: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      pbx: ['', [Validators.required, Validators.pattern('^[0-9]{8}$'), Validators.minLength(8), Validators.maxLength(8)]],
      telefono_persona_contacto: ['', [Validators.required,  Validators.pattern('^[0-9]{8}$'), Validators.minLength(8), Validators.maxLength(8)]],
      direccion: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],
      tipo_proveedor: ['', [Validators.required, Validators.maxLength(50)]],
      estado: ['Activo', [Validators.required]]
    });
  
    const navigation = this.router.getCurrentNavigation();
    this.proveedor = navigation?.extras?.state?.['proveedor'];
    this.proveedorId = this.proveedor?.id || 0;
  }

  ngOnInit(): void {
    if (this.proveedor) {
      this.proveedorForm.patchValue({
        nombre_proveedor: this.proveedor.nombre_proveedor,
        nombre_persona_contacto: this.proveedor.nombre_persona_contacto,
        correo_contacto: this.proveedor.correo_contacto,
        pbx: this.proveedor.pbx,
        telefono_persona_contacto: this.proveedor.telefono_persona_contacto,
        direccion: this.proveedor.direccion,
        descripcion: this.proveedor.descripcion,
        tipo_proveedor: this.proveedor.tipo_proveedor,
        estado: this.proveedor.estado
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
        const {
          nombre_proveedor,
          nombre_persona_contacto,
          correo_contacto,
          pbx,
          telefono_persona_contacto,
          direccion,
          descripcion,
          tipo_proveedor,
          estado
        } = this.proveedorForm.value;

        if (!nombre_proveedor || !nombre_persona_contacto || !correo_contacto || !pbx || 
            !telefono_persona_contacto || !direccion || !descripcion || 
            !tipo_proveedor) {
          wizard.stop(); // Stop navigation
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, complete todos los campos requeridos'
          });
          return;
        }
      }
    });

    this.isSaving = false; 

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.proveedorForm.valid) {
        this.isSaving = true; 
        this.proveedorService.actualizarProveedor(this.proveedorId, this.proveedorForm.value).subscribe(
          (response) => {
            this.isSaving = false; 
            if (response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Proveedor',
                text: 'Proveedor modificado correctamente'
              });
              this.router.navigate(['/proveedores']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al modificar el proveedor'
              });
              this.router.navigate(['/proveedores']);
            }
          },
          (error) => {
            this.isSaving = false; 
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ha ocurrido un error al modificar el proveedor'
            });
            this.router.navigate(['/proveedores']);
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
    this.router.navigate(['/proveedores']);
  }
}
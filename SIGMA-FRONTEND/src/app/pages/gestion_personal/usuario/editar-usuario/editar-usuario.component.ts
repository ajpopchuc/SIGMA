import { Component, OnInit, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../usuario.service';
import Swal from 'sweetalert2';

declare var KTWizard: any;
declare var KTUtil: any;

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class EditarUsuarioComponent implements OnInit, AfterViewInit {
  usuarioForm: FormGroup;
  usuario: any;
  usuarioId: number;
  private _wizardObj: any;
  private _formEl: any;
  roles: any[] = [];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo_electronico: ['', [Validators.required, Validators.email]],
      usuario: ['', Validators.required],
      rol: ['', Validators.required],
    });
    const navigation = this.router.getCurrentNavigation();
    this.usuario = navigation?.extras?.state?.['usuario'];
    this.usuarioId = this.usuario?.id || 0;
  }

  ngOnInit(): void {
    this.fetchRoles();
    if (this.usuario) {
      this.usuarioForm.patchValue({
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        correo_electronico: this.usuario.correo_electronico,
        usuario: this.usuario.usuario,
        rol: this.usuario.id_rol,
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
      if (step === 1) {
        // Validaciones o lógica específica para el paso 1
      } else if (step === 2) {
        // Validaciones o lógica específica para el paso 2
      }
    });

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.usuarioForm.valid) {
        this.usuarioService.actualizarUsuario(this.usuarioId, this.usuarioForm.value).subscribe(
          (response) => {
            if (response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Usuario',
                text: 'Usuario modificado correctamente'
              });
              this.router.navigate(['/usuarios']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al modificar el usuario: ' + response.message
              });
            }
          },
          (error) => {
            let errorMessage = 'Ha ocurrido un error al crear el usuario: \n';
            
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
    this._wizardObj.goTo(3); // Navegar a la página de confirmación
    this._wizardObj.submit();
  }

  fetchRoles(): void {
    this.usuarioService.getRoles().subscribe(
      (data) => {
        this.roles = data.data;
      },
      (error) => {
        console.error('Error fetching suppliers:', error);
      }
    );
  }

  getRolNombre(): string {
    const rolId = this.usuarioForm.value.rol;
    const rolSeleccionado = this.roles.find(rol => rol.id == rolId);
    return rolSeleccionado ? rolSeleccionado.nombre : 'Sin rol';
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }
}

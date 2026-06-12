import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../usuario.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


declare var KTWizard: any; // Declara la variable para evitar errores de TypeScript
declare var KTUtil: any; // Declara la variable para evitar errores de TypeScript

@Component({
  selector: 'app-crear-usuario', 
  standalone: true,
  templateUrl: './crear-usuario.component.html',
  styleUrls: ['./crear-usuario.component.css'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class CrearUsuarioComponent{
  private _wizardObj: any;
  private _formEl: any;
  roles: any[] = [];

  ngAfterViewInit(): void {
    this.initWizard();
    this.fetchRoles(); 
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

      // Validar el formulario en cada paso
      if (step === 1) {
        const nombre = this.usuarioForm.value.nombre;
        const nombreTieneNumero = /\d/.test(nombre);
        const apellido = this.usuarioForm.value.apellido;
        const apellidoTieneNumero = /\d/.test(apellido);
        const correo = this.usuarioForm.value.correo_electronico;
        const correoVerdadero = /\S+@\S+\.\S+/.test(correo);
        if (!nombre || nombreTieneNumero) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un nombre válido'
          });
          return;
        }
        if (!apellido || apellidoTieneNumero) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un apellido válido'
          });
          return;
        }
        if (!correoVerdadero || !correo) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un correo electrónico válido'
          });
          return;
        }
      }
      if (step === 2) {
        if (!this.usuarioForm.value.usuario) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un usuario válido'
          });
          return;
        }
        if (!this.usuarioForm.value.contraseña) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese una contraseña válida'
          });
          return;
        }
        if (!this.usuarioForm.value.rol) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, seleccione un rol'
          });
          return;
        }
      }
    });


    
    this.isSaving = false; 
    this._wizardObj.on('submit', (wizard: any) => {
      if (this.usuarioForm.valid) {
        this.isSaving = true; 
        this.usuarioService.crearUsuario(this.usuarioForm.value).subscribe(
          (response) => {
            this.isSaving = false; 
            if(response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Usuario',
                text: 'Usuario creado correctamente'
              });
              this.router.navigate(['/usuarios']);
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al crear el usuario' + response.message
              });
            }
          },
          (error) => {
            this.isSaving = false; 
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
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, tiene errores en su formulario'
        });
      }
    });
  }

  usuarioForm: FormGroup;

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
      contraseña: ['', Validators.required],
      rol: ['', Validators.required],
    });
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

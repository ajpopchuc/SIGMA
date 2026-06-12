import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EdificioService } from '../edificio.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

declare var KTWizard: any; 
declare var KTUtil: any; 

@Component({
  selector: 'app-crear-edificio',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-edificio.component.html',
  styleUrls: ['./crear-edificio.component.css'] // Cambiado de styleUrl a styleUrls
})
export class CrearEdificioComponent implements AfterViewInit, OnInit {
  private _wizardObj: any;
  private _formEl: any;
  edificioForm: FormGroup;
  campuses: any[] = []; // Nueva variable para almacenar los campus
  campusSeleccionado: string = '';
  isSaving: boolean = false;
  constructor(
    private fb: FormBuilder,
    private edificiosService: EdificioService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.edificioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],  
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],  
      id_campus: ['', [Validators.required, Validators.pattern("^[1-9][0-9]*$")]],  
    });    
  }

  ngOnInit(): void {
    this.getCampus(); // Cargar campus al inicializar el componente
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
        const nombre = this.edificioForm.value.nombre;
        const descripcion = this.edificioForm.value.descripcion;
        const id_campus  = this.edificioForm.value.id_campus;
        if (!nombre  || !descripcion || !id_campus) {
          wizard.stop(); // Stop navigation
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, llene todos los campos.'
          });
          return;
        }
      }
    });

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.edificioForm.valid) {
        this.isSaving = true;
        this.edificiosService.crearEdificios(this.edificioForm.value).subscribe(
          (response) => {
            if (response.status === 200) {
              this.isSaving = false;
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Edificio creado correctamente.'
              });
              this.router.navigate(['/edificios']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ha ocurrido un error al crear el edificio: ${response.error}`
              });
            }
          },
          (error) => {
            this.isSaving = false;
            let errorMessage = 'Ha ocurrido un error al crear el edificio: \n';
            
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
  
  getCampusNombre(id: number): string {
    const campus = this.campuses.find(c => c.id === id);
    return campus ? campus.nombre : 'Campus no encontrado';
  }
  
  getCampus(): void {
    this.edificiosService.getCampus().subscribe(
      (data) => {
        this.campuses = data; // Asignar los campus a la variable
      },
      (error) => {
        console.error('Error al cargar campus:', error);
      }
    );
  }

  onCampusChange(event: any) {
    const campusId = event.target.value;
    const campus = this.campuses.find(c => c.id === +campusId);
    this.campusSeleccionado = campus ? campus.nombre : '';
  }

  cancelar(): void {
    this.router.navigate(['/edificios']);
  }
}

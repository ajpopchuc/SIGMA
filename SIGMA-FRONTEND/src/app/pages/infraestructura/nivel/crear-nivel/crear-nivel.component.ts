import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NivelService } from '../nivel.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

declare var KTWizard: any; 
declare var KTUtil: any; 

@Component({
  selector: 'app-crear-nivel',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-nivel.component.html',
  styleUrls: ['./crear-nivel.component.css']
})
export class CrearNivelComponent implements AfterViewInit, OnInit {
  private _wizardObj: any;
  private _formEl: any;
  nivelForm: FormGroup;
  edificios: any[] = []; // Lista de edificios
  campus: any[] = []; // Lista de campus
  edificiosFiltrados: any[] = []; // Edificios filtrados por campus seleccionado
  campusSeleccionado: string = ''; // ID del campus seleccionado
  edificioSeleccionado: string = ''; // Nombre del edificio seleccionado
  isSaving: boolean = false;
  constructor(
    private fb: FormBuilder,
    private nivelService: NivelService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.nivelForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],  
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],  
      id_edificio: ['', [Validators.required, Validators.pattern("^[1-9][0-9]*$")]],  
    });    
  }

  ngOnInit(): void {
    this.getEdificios(); // Cargar edificios al inicializar el componente
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
        const nombre = this.nivelForm.value.nombre;
        const descripcion = this.nivelForm.value.descripcion;
        const id_edificio = this.nivelForm.value.id_edificio;

        if (!nombre || !descripcion || !id_edificio) {
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
      if (this.nivelForm.valid) {
        this.isSaving = true;
        this.nivelService.crearNiveles(this.nivelForm.value).subscribe(
          (response) => {
            if (response.status === 200) {
              this.isSaving = false;
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Nivel creado correctamente.'
              });
              this.router.navigate(['/niveles']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ha ocurrido un error al crear el nivel: ${response.error}`
              });
            }
          },
          (error) => {
            this.isSaving = false;
            let errorMessage = 'Ha ocurrido un error al crear el nivel: \n';
            
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

  getEdificios(): void {
    this.nivelService.getEdificios().subscribe(
      (data) => {
        this.edificios = data.edificios; // Asignar edificios a la variable
        this.campus = this.getUniqueCampuses(this.edificios); // Obtener campus únicos
      },
      (error) => {
        console.error('Error al cargar edificios:', error);
      }
    );
  }

  getUniqueCampuses(edificios: any[]): any[] {
    const campusMap = new Map();
    edificios.forEach(edificio => {
      if (!campusMap.has(edificio.campues_id)) {
        campusMap.set(edificio.campues_id, {
          id: edificio.campues_id,
          nombre: edificio.campues_nombre
        });
      }
    });
    return Array.from(campusMap.values());
  }

  onCampusChange(event: any) {
    const campusId = event.target.value;
    const campus = this.campus.find(c => c.id == campusId);
    this.campusSeleccionado = campus ? campus.nombre : ''; // Actualiza el campus seleccionado
    this.edificiosFiltrados = this.edificios.filter(edificio => edificio.campues_id == campusId);
    this.edificioSeleccionado = ''; // Reinicia la selección de edificio
  }

  onEdificioChange(event: any) {
    const edificioId = event.target.value;
    const edificio = this.edificiosFiltrados.find(e => e.id_edificio == edificioId);
    this.edificioSeleccionado = edificio ? edificio.nombre_edificio : ''; // Actualiza el edificio seleccionado
  }
  cancelar(): void {
    this.router.navigate(['/niveles']);
  }
}
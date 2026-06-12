import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InstalacionesService } from '../instalaciones.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

declare var KTWizard: any; 
declare var KTUtil: any; 

@Component({
  selector: 'app-crear-instalaciones',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-instalaciones.component.html',
  styleUrls: ['./crear-instalaciones.component.css']
})
export class CrearInstalacionesComponent implements AfterViewInit, OnInit {
  private _wizardObj: any;
  private _formEl: any;
  instalacionesForm: FormGroup;
  niveles: any[] = [];
  filteredEdificios: any[] = [];
  filteredNiveles: any[] = [];
  filteredCampus: any[] = [];
  isSaving: boolean = false;
  selectedCampus: any = null;
  selectedEdificio: any = null;
  selectedNivel: any = null;

  constructor(
    private fb: FormBuilder,
    private nivelService: InstalacionesService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.instalacionesForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],  
      descripcion: ['', [Validators.required, Validators.maxLength(200)]],  
      tipo_instalacion: ['', [Validators.required, Validators.maxLength(200)]], 
      id_nivel: ['', [Validators.required]]
    });    
  }

  ngOnInit(): void {
    this.getCampus();
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
        if (!this.selectedCampus) {
          wizard.stop();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, seleccione un campus.'
          });
          return;
        }
      }
      if (step === 2) {
        if (!this.selectedEdificio || !this.selectedNivel) {
          wizard.stop();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, seleccione un edificio y un nivel.'
          });
          return;
        }
      }
      if (step === 3) {
        const { nombre, descripcion, tipo_instalacion } = this.instalacionesForm.value;
        if (!nombre || !descripcion || !tipo_instalacion) {
          wizard.stop();
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
      if (this.instalacionesForm.valid) {
        this.isSaving = true;
        const formData = {
          ...this.instalacionesForm.value,
          id_nivel: this.selectedNivel.id
        };

        this.nivelService.crearInstalaciones(formData).subscribe(
          (response) => {
            if (response.status === 200) {
              this.isSaving = false;
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Instalación creada correctamente.'
              });
              this.router.navigate(['/instalaciones']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ha ocurrido un error al crear la instalación: ${response.error}`
              });
            }
          },
          (error) => {
            this.isSaving = false;
            let errorMessage = 'Ha ocurrido un error al crear la instalación: \n';
            
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

  getCampus(): void {
    this.nivelService.getNiveles().subscribe(
      (data) => {
        this.niveles = data;
        this.filterCampus();
      },
      (error) => {
        console.error('Error al cargar niveles:', error);
      }
    );
  }

  filterCampus(): void {
    const uniqueCampusIds = new Set(this.niveles.map(nivel => nivel.edificio.campus.id));
    this.filteredCampus = [...uniqueCampusIds].map(id => {
      return this.niveles.find(nivel => nivel.edificio.campus.id === id).edificio.campus;
    });
  }

  onCampusChange(event: any) {
    const campusId = event.target.value;
    this.selectedCampus = this.filteredCampus.find(campus => campus.id === +campusId);
    const edificios = this.niveles
      .filter(nivel => nivel.edificio.campus.id === +campusId)
      .map(nivel => nivel.edificio);

    const uniqueEdificiosMap = new Map();
    edificios.forEach(edificio => {
      if (!uniqueEdificiosMap.has(edificio.id)) {
        uniqueEdificiosMap.set(edificio.id, edificio);
      }
    });

    this.filteredEdificios = Array.from(uniqueEdificiosMap.values());
    
    this.selectedEdificio = null;
    this.selectedNivel = null;
    this.filteredNiveles = [];
  }
  
  onEdificioChange(event: any) {
    const edificioId = event.target.value;
    this.selectedEdificio = this.filteredEdificios.find(edificio => edificio.id === +edificioId);
    this.filteredNiveles = this.niveles
      .filter(nivel => nivel.edificio.id === +edificioId)
      .map(nivel => nivel);
    this.selectedNivel = null;
  }

  onNivelChange(event: any) {
    const nivelId = event.target.value;
    this.selectedNivel = this.filteredNiveles.find(nivel => nivel.id === +nivelId);
  }
  cancelar(): void {
    this.router.navigate(['/instalaciones']);
  }
}
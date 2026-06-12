import { Component, OnInit, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { InstalacionesService } from '../instalaciones.service';
import Swal from 'sweetalert2';

declare var KTWizard: any;
declare var KTUtil: any;

@Component({
  selector: 'app-actualizar-instalaciones',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-instalaciones.component.html',
  styleUrls: ['./editar-instalaciones.component.css']
})
export class EditarInstalacionesComponent implements OnInit, AfterViewInit {
  instalacionesForm: FormGroup;
  instalaciones: any;
  nivelId: number;
  private _wizardObj: any;
  private _formEl: any;
  niveles: any[] = [];
  campusUnicos: any[] = [];
  edificiosFiltrados: any[] = []; // Para edificios filtrados
  nivelesFiltrados: any[] = []; // Para niveles filtrados
  nivelesSeleccionado: string = '';
  selectedCampusId: number =0; // ID del campus seleccionado
  selectedEdificioId: number=0; // ID del edificio seleccionado
  selectedCampusName: string = '';
  selectedEdificioName: string = '';
  selectedNivelName: string = '';
  isSaving: boolean = false;
  constructor(
    private fb: FormBuilder,
    private instalacionesService: InstalacionesService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.instalacionesForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      tipo_instalacion: ['', [Validators.required, Validators.maxLength(200)]],
      id_nivel: ['', [Validators.required, Validators.pattern("^[1-9][0-9]*$")]],
    });

    const navigation = this.router.getCurrentNavigation();
    this.instalaciones = navigation?.extras?.state?.['instalaciones'];
    this.nivelId = this.instalaciones?.id || 0;
  }

  ngOnInit(): void {
    this.instalacionesService.getNiveles().subscribe(nivels => {
      this.niveles = nivels;
  
      // Filtrar campus únicos
      this.campusUnicos = [...new Map(nivels.map((item: { edificio: { campus: { id: any; }; }; }) => [item.edificio.campus.id, item.edificio.campus])).values()];
  
      if (this.instalaciones) {
        // Preseleccionar campus, edificio y nivel basado en el patchValue recibido
        this.selectedCampusId = this.instalaciones.id_campus;
        this.selectedEdificioId = this.instalaciones.id_edificio;
  
        // Filtrar edificios y niveles basados en los valores iniciales
        this.filtrarEdificiosPorCampus(this.selectedCampusId);
        this.filtrarNivelesPorEdificio(this.selectedEdificioId);
  
        // Obtener el nombre del campus preseleccionado
        const campusSeleccionado = this.campusUnicos.find(campus => campus.id === this.selectedCampusId);
        this.selectedCampusName = campusSeleccionado ? campusSeleccionado.nombre : '';
  
        // Obtener el nombre del edificio preseleccionado
        const edificioSeleccionado = this.edificiosFiltrados.find(edificio => edificio.edificio.id === this.selectedEdificioId);
        this.selectedEdificioName = edificioSeleccionado ? edificioSeleccionado.edificio.nombre : '';
  
        // Obtener el nombre del nivel preseleccionado
        const nivelSeleccionado = this.nivelesFiltrados.find(nivel => nivel.id === this.instalaciones.id_nivel);
        this.selectedNivelName = nivelSeleccionado ? nivelSeleccionado.nombre : '';
  
        // Aplicar patchValue a los controles del formulario
        this.instalacionesForm.patchValue({
          nombre: this.instalaciones.nombre,
          descripcion: this.instalaciones.descripcion,
          tipo_instalacion: this.instalaciones.tipo_instalacion,
          id_nivel: this.instalaciones.id_nivel,
        });
      }
    });
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
        const id_nivel = this.instalacionesForm.value.id_nivel;
        if (!id_nivel) { // Ensure correct property
          wizard.stop(); // Stop navigation
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, llene todos los campos.'
          });
          return;
        }
      }
      if (step === 2) {
        const nombre = this.instalacionesForm.value.nombre;
        const descripcion = this.instalacionesForm.value.descripcion;
        const tipo_instalacion = this.instalacionesForm.value.tipo_instalacion;
        if (!nombre || !descripcion || !tipo_instalacion) { // Ensure correct property
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
      if (this.instalacionesForm.valid) {
        this.isSaving = true;
        this.instalacionesService.actualizarInstalaciones(this.nivelId, this.instalacionesForm.value).subscribe(
          (response) => {
            if (response.status === 200) {
              this.isSaving = false;
              Swal.fire({
                icon: 'success',
                title: 'Nivel',
                text: 'Nivel modificado correctamente'
              });
              this.router.navigate(['/instalaciones']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al modificar la instalación.'
              });
              this.router.navigate(['/instalaciones']);
            }
          },
          (error) => {
            this.isSaving = false;
            let errorMessage = 'Ha ocurrido un error al editar la isntalación: \n';
            
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
          text: 'Por favor, revise los errores en su formulario.'
        });
      }
    });
  }

  onSubmit() {
    this._wizardObj.goTo(3);
    this._wizardObj.submit();
  }

  onnivelChange(event: any) {
    const campusId = event.target.value;
    this.filtrarEdificiosPorCampus(campusId);

    // Asignar el nombre del campus seleccionado
    const campusSeleccionado = this.campusUnicos.find(campus => campus.id === +campusId);
    this.selectedCampusName = campusSeleccionado ? campusSeleccionado.nombre : '';

    // Limpiar los niveles cuando cambia el campus
    this.nivelesFiltrados = [];
    this.selectedEdificioName = '';  // Limpiar edificio
    this.selectedNivelName = '';     // Limpiar nivel
  }

  // Filtrar niveles cuando se selecciona un edificio
  onEdificioChange(event: any) {
    const edificioId = event.target.value;
    this.filtrarNivelesPorEdificio(edificioId);

    // Asignar el nombre del edificio seleccionado
    const edificioSeleccionado = this.edificiosFiltrados.find(edificio => edificio.edificio.id === +edificioId);
    this.selectedEdificioName = edificioSeleccionado ? edificioSeleccionado.edificio.nombre : '';

 
  }

  // Al seleccionar nivel
  onNivelChange(event: any) {
    const nivelId = event.target.value;
    const nivelSeleccionado = this.nivelesFiltrados.find(nivel => nivel.id === +nivelId);
    this.selectedNivelName = nivelSeleccionado ? nivelSeleccionado.nombre : '';
}


  // Función para filtrar los edificios según el campus seleccionado
  filtrarEdificiosPorCampus(campusId: number) {
    const uniqueEdificios = new Set<number>();
    this.edificiosFiltrados = this.niveles.filter(nivel => {
      if (nivel.edificio.campus.id === +campusId && !uniqueEdificios.has(nivel.edificio.id)) {
        uniqueEdificios.add(nivel.edificio.id);
        return true;
      }
      return false;
    });
  }

  // Función para filtrar los niveles según el edificio seleccionado
  filtrarNivelesPorEdificio(edificioId: number) {
    const uniqueNivelIds = new Set<number>();
    this.nivelesFiltrados = this.niveles.filter(nivel => {
      if (nivel.edificio.id === +edificioId && !uniqueNivelIds.has(nivel.id)) {
        uniqueNivelIds.add(nivel.id);
        return true;
      }
      return false;
    });
  }

  cancelar(): void {
    this.router.navigate(['/instalaciones']);
  }
}

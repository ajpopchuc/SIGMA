import { Component, OnInit, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { NivelService } from '../nivel.service';
import Swal from 'sweetalert2';

declare var KTWizard: any;
declare var KTUtil: any;

interface Edificio {
  id_edificio: number;
  nombre_edificio: string;
  campues_nombre: string;
  campues_id: number;
}

interface Campus {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-editar-nivel',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-nivel.component.html',
  styleUrl: './editar-nivel.component.css'
})
export class EditarNivelComponent implements OnInit, AfterViewInit {
  nivelForm: FormGroup;
  niveles: any;
  nivelId: number;
  private _wizardObj: any;
  private _formEl: any;
  edificiosList: Edificio[] = [];
  filteredEdificiosList: Edificio[] = [];
  campusList: Campus[] = [];
  edificioSeleccionado: string = '';
  campusSeleccionado: string = '';
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
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      campues_id: ['',  [Validators.required, Validators.pattern("^[1-9][0-9]*$")]], 
      id_edificio: ['', [Validators.required, Validators.pattern("^[1-9][0-9]*$")]], 
    });

    const navigation = this.router.getCurrentNavigation();
    this.niveles = navigation?.extras?.state?.['niveles'];
    this.nivelId = this.niveles?.id || 0;
  }

  ngOnInit(): void {
    this.nivelService.getEdificios().subscribe((response: { edificios: Edificio[] }) => {
      this.edificiosList = response.edificios;
      this.setupCampusList();
  
      if (this.niveles) {
        this.nivelForm.patchValue({
          nombre: this.niveles.nombre,
          descripcion: this.niveles.descripcion,
          campues_id: this.niveles.campues_id,
          id_edificio: this.niveles.id_edificio,
        });
  
        // Cambia el campus para filtrar los edificios
        this.onCampusChange({ target: { value: this.niveles.campues_id } });
  
        // Después de filtrar, busca el edificio que corresponde al id_edificio
        const edificioId = this.niveles.id_edificio;
        const edificio = this.filteredEdificiosList.find(e => e.id_edificio === edificioId);
        if (edificio) {
          this.nivelForm.patchValue({ id_edificio: edificioId });
          this.edificioSeleccionado = edificio.nombre_edificio; // Establece el nombre del edificio
        } else {
          this.edificioSeleccionado = 'N/A'; // Si no se encuentra el edificio
        }
      }
    });
  }
  

  setupCampusList(): void {
    const uniqueCampus = new Map<number, Campus>();
    this.edificiosList.forEach(edificio => {
      if (!uniqueCampus.has(edificio.campues_id)) {
        uniqueCampus.set(edificio.campues_id, {
          id: edificio.campues_id,
          nombre: edificio.campues_nombre
        });
      }
    });
    this.campusList = Array.from(uniqueCampus.values());
  }

  onCampusChange(event: any): void {
    const campusId = +event.target.value;
    const selectedCampus = this.campusList.find(campus => campus.id === campusId);
    this.campusSeleccionado = selectedCampus ? selectedCampus.nombre : 'N/A'; // Actualiza el nombre del campus seleccionado
    
    this.filteredEdificiosList = this.edificiosList.filter(edificio => edificio.campues_id === campusId);
    
    // Restablece el edificio seleccionado si no hay edificios filtrados
    if (this.filteredEdificiosList.length > 0) {
      const firstEdificio = this.filteredEdificiosList[0];
      this.nivelForm.patchValue({ id_edificio: firstEdificio.id_edificio });
      this.edificioSeleccionado = firstEdificio.nombre_edificio; // Actualiza el nombre del primer edificio
    } else {
      this.nivelForm.patchValue({ id_edificio: '' });
      this.edificioSeleccionado = 'N/A';
    }
  }
  
  
  
  onEdificioChange(event: any): void {
    const edificioId = +event.target.value;
    const edificio = this.filteredEdificiosList.find(e => e.id_edificio === edificioId);
    this.edificioSeleccionado = edificio ? edificio.nombre_edificio : 'N/A';
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
        const campues_id = this.nivelForm.value.campues_id;
        const id_edificio = this.nivelForm.value.id_edificio;

        if (!nombre || !descripcion || !campues_id || !id_edificio) {
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
        this.nivelService.actualizarNiveles(this.nivelId, this.nivelForm.value).subscribe(
          (response) => {
            if (response.status === 200) {
              this.isSaving = false;
              Swal.fire({
                icon: 'success',
                title: 'Nivel',
                text: 'Nivel modificado correctamente'
              });
              this.router.navigate(['/niveles']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al modificar el nivel.'
              });
              this.router.navigate(['/niveles']);
            }
          },
          (error) => {
            this.isSaving = false;
            let errorMessage = 'Ha ocurrido un error al editar el nivel: \n';
            
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

  cancelar(): void {
    this.router.navigate(['/niveles']);
  }
}
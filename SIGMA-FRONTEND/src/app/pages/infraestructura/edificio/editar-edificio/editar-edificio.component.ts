import { Component, OnInit, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { EdificioService } from '../edificio.service';
import Swal from 'sweetalert2';

declare var KTWizard: any;
declare var KTUtil: any;

@Component({
  selector: 'app-editar-edificio',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-edificio.component.html',
  styleUrls: ['./editar-edificio.component.css']
})
export class EditarEdificioComponent implements OnInit, AfterViewInit {
  edificioForm: FormGroup;
  edificio: any;
  edificioId: number;
  private _wizardObj: any;
  private _formEl: any;
  campusList: any[] = [];
  campusSeleccionado: string = '';
  isSaving: boolean = false;
  constructor(
    private fb: FormBuilder,
    private edificioService: EdificioService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.edificioForm = this.fb.group({
      nombre: ['',[Validators.required, Validators.maxLength(100)]],
      descripcion: [Validators.required, Validators.maxLength(100)],
      id_campus: ['', [Validators.required, Validators.pattern("^[1-9][0-9]*$")]], 
    });

    const navigation = this.router.getCurrentNavigation();
    this.edificio = navigation?.extras?.state?.['edificios'];
    this.edificioId = this.edificio?.id || 0;
  }

  ngOnInit(): void {
    // Obtener la lista de campus
    this.edificioService.getCampus().subscribe(campuses => {
      this.campusList = campuses;
      // Si ya tienes el edificio, busca el campus correspondiente
      if (this.edificio) {
        const campusSeleccionado = this.campusList.find(campus => campus.id === this.edificio.id_campus);
        this.campusSeleccionado = campusSeleccionado ? campusSeleccionado.nombre : 'N/A';
      }
    });
  
    if (this.edificio) {
      this.edificioForm.patchValue({
        nombre: this.edificio.nombre,
        descripcion: this.edificio.descripcion,
        id_campus: this.edificio.id_campus, // Establece el valor del campus
        
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
        this.edificioService.actualizarEdificio(this.edificioId, this.edificioForm.value).subscribe(
          (response) => {
            if (response.status === 200) {
              this.isSaving = false;
              Swal.fire({
                icon: 'success',
                title: 'Edificio',
                text: 'Edificio modificado correctamente'
              });
              this.router.navigate(['/edificios']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al modificar el edificio.'
              });
              this.router.navigate(['/edificios']);
            }
          },
          (error) => {
            this.isSaving = false;
            let errorMessage = 'Ha ocurrido un error al editar el edificio: \n';
            
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
  onCampusChange(event: any): void {
    const idCampusSeleccionado = event.target.value;
    const campus = this.campusList.find(c => c.id === +idCampusSeleccionado);
    this.campusSeleccionado = campus ? campus.nombre : 'N/A';
  }

  cancelar(): void {
    this.router.navigate(['/edificios']);
  }
}

import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivoService } from '../activo.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { URLFOTOS } from '../../../../constants/api_url';
import { co } from '@fullcalendar/core/internal-common';

declare var KTWizard: any; 
declare var KTUtil: any;

interface Edificio {
  id: number;
  niveles: Nivel[];
}

interface Nivel {
  id: number;
}

interface Instalacion {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-crear-activo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './crear-activo.component.html',
  styleUrls: ['./crear-activo.component.css']
})
export class CrearActivoComponent implements AfterViewInit, OnInit {
  private _wizardObj: any;
  private _formEl: any;
  activoForm: FormGroup;

  ubicaciones: any[] = [];
  selectedCampus: any = null;
  selectedEdificio: any = null;
  selectedNivel: any = null;
  instalacionSeleccionada: string = '';

  qrCodePath: string | null = null;
  

  constructor(
    private fb: FormBuilder,
    private activoService: ActivoService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.activoForm = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      fecha_adquisicion: ['', Validators.required],
      id_instalacion: ['', Validators.required], // ID de instalación
      generarQR: [false] // Nuevo campo para la opción de generar QR
    });
  }

  ngOnInit(): void {
    this.getUbicaciones(); // Cargar instalaciones al inicializar el componente 
  }

  ngAfterViewInit(): void {
    this.initWizard();
  }

  isSaving: boolean = false; // Variable para controlar el estado de guardado

  private initWizard() {
    this._wizardObj = new KTWizard('kt_wizard', {
      startStep: 1,
      clickableSteps: false
    });
    this._formEl = KTUtil.getById('kt_form');

    this._wizardObj.on('change', (wizard: any) => {
      if (wizard.getStep() > wizard.getNewStep()) {
        return;
      }
      const step = wizard.getStep();

      if (step === 1) {
        // Validar selección de ubicación
        if (!this.activoForm.get('id_instalacion')?.value) {
          wizard.stop();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, seleccione una ubicación'
          });
          return;
        }
      } else if (step === 2) {
        // Validar campos del activo
        const { nombre, codigo, descripcion, precio } = this.activoForm.value;
        if (!nombre || !codigo || !descripcion || precio === null || precio < 0) {
          wizard.stop();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, complete todos los campos requeridos correctamente.'
          });
          return;
        }
      }
    });

    this.isSaving = false; // Reiniciar el estado de guardado

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.activoForm.valid) {
        this.isSaving = true; // Cambiar el estado de guard
        const formValue = this.activoForm.value;
        formValue.precio = this.convertPriceToNumber(formValue.precio);
        this.activoService.crearActivo(this.activoForm.value).subscribe({
          next: (response) => {
              this.isSaving = false; // Cambiar el estado de guardado
            if (response.status === 200) {
              if (this.activoForm.value.generarQR && response.qr_url) {
                // Mostrar el código QR
                Swal.fire({
                  icon: 'success',
                  title: 'Activo Creado con QR',
                  html: `
                    <p>El activo se ha creado correctamente.</p>
                    <img src="${response.qr_url}" alt="Código QR" style="max-width: 300px;">
                  `,
                  confirmButtonText: 'Aceptar'
                }).then(() => {
                  this.router.navigate(['/activos']);
                });
              } else {
                Swal.fire({
                  icon: 'success',
                  title: 'Éxito',
                  text: 'Activo creado correctamente'
                }).then(() => {
                  this.router.navigate(['/activos']);
                });
              }
            }
          },
          error: (error) => {
            this.isSaving = false; // Cambiar el estado de guardado
            let errorMessage = 'Ha ocurrido un error al crear el activo: \n';
            
            if (error.error?.errors) {
              Object.keys(error.error.errors).forEach((field) => {
                error.error.errors[field].forEach((message: string) => {
                  errorMessage += `- ${message}\n`;
                });
              });
            } else {
              errorMessage += error.error?.error || 'Error desconocido';
            }
          
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage
            });
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, complete todos los campos requeridos correctamente.'
        });
      }
    });
}
  
  getUbicaciones(): void {
    this.activoService.getUbicaciones().subscribe(
      (data) => {
        this.ubicaciones = data;
      },
      (error) => {
        console.error('Error al cargar ubicaciones:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las ubicaciones'
        });
      }
    );
  }

  onCampusChange(event: any): void {
    const campusId = event.target.value;
    this.selectedCampus = this.ubicaciones.find(campus => campus.id == campusId);
    this.selectedEdificio = null;
    this.selectedNivel = null;
    this.activoForm.get('id_instalacion')?.setValue('');
  }

  onEdificioChange(event: any): void {
    const edificioId = event.target.value;
    this.selectedEdificio = this.selectedCampus?.edificios.find(
      (edificio: Edificio) => edificio.id == edificioId
    );
    this.selectedNivel = null;
    this.activoForm.get('id_instalacion')?.setValue('');
  }

  onNivelChange(event: any): void {
    const nivelId = event.target.value;
    this.selectedNivel = this.selectedEdificio?.niveles.find(
      (nivel: Nivel) => nivel.id == nivelId
    );
  }

  onInstalacionChange(event: any): void {
    const instalacionId = Number(event.target.value); // Convertir el valor a number
    this.activoForm.get('id_instalacion')?.setValue(instalacionId);
  }

  getQRCode(activoId: number): void {
    this.activoService.getQRCode(activoId).subscribe(
      (response) => {
        // Construir la URL completa para el código QR
        this.qrCodePath = `${URLFOTOS}${response.qr_path}`;
        this.displayQRCode();
      },
      (error) => {
        console.error('Error al obtener el código QR:', error);
        this.handleError('No se pudo obtener el código QR.');
      }
    );
  }
  
  private displayQRCode(): void {
    if (this.qrCodePath) {
      Swal.fire({
        title: 'Código QR generado',
        html: `<img src="${this.qrCodePath}" alt="QR Code" style="max-width: 100%;">`,
        confirmButtonText: 'Cerrar',
        customClass: {
          popup: 'swal-wide',
          image: 'swal2-qr-image'
        },
        imageWidth: 300,
        imageHeight: 300
      }).then(() => {
        this.router.navigate(['/activos']);
      });
    } else {
      this.handleError('No se pudo generar el código QR.');
    }
  }

  private handleError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }

  cancelar(): void {
    this.router.navigate(['/activos']);
  }

  private convertPriceToNumber(price: string): number {
    // Eliminar cualquier carácter que no sea número, coma o punto
    const cleanedValue = price.replace(/[^0-9,.]/g, '');
  
    // Convertir a número eliminando las comas
    return parseFloat(cleanedValue.replace(/,/g, ''));
  }

  onPriceInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;
  
    // Eliminar cualquier carácter que no sea número, coma o punto
    value = value.replace(/[^0-9,.]/g, '');
  
    // Validar el formato y limpiar el valor
    value = this.cleanPriceValue(value);
  
    // Actualizar el valor en el formulario
    this.activoForm.get('precio')?.setValue(value, { emitEvent: false });
  }

  private cleanPriceValue(value: string): string {
    // Eliminar múltiples comas o puntos
    value = value.replace(/(,.*?),(.*,)?/, '$1'); // Solo una coma
    value = value.replace(/(\..*?)\.(.*\.)?/, '$1'); // Solo un punto
  
    // Asegurar que la coma sea el separador de miles y el punto el separador decimal
    const parts = value.split('.');
    if (parts.length > 1) {
      // Si hay un punto, solo permitir dos decimales
      parts[1] = parts[1].slice(0, 2);
      value = parts.join('.');
    }
  
    return value;
  }

}

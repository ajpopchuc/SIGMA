import { Component, OnInit, Renderer2, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { ActivoService } from '../activo.service';
import Swal from 'sweetalert2';
import { URLFOTOS } from '../../../../constants/api_url';

declare var KTWizard: any;
declare var KTUtil: any;

interface Edificio {
  id: number;
  nombre: string;
  niveles: Nivel[];
}

interface Nivel {
  id: number;
  nombre: string;
  instalaciones: Instalacion[];
}

interface Instalacion {
  id: number;
  nombre: string;
}

interface Campus {
  id: number;
  nombre: string;
  edificios: Edificio[];
}

@Component({
  selector: 'app-editar-activo',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './editar-activo.component.html',
  styleUrls: ['./editar-activo.component.css']
})
export class EditarActivoComponent implements OnInit, AfterViewInit {
  activoForm: FormGroup;
  activo: any;
  activoId: number;
  private _wizardObj: any;
  private _formEl: any;
  
   // Propiedades para la selección de ubicación
   ubicaciones: Campus[] = [];
  selectedCampus: Campus | null = null;
  selectedEdificio: Edificio | null = null;
  selectedNivel: Nivel | null = null;
  instalacionSeleccionada: string = '';

  // Propiedades para el código QR
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
      precio: ['', Validators.required],
      fecha_adquisicion: ['', Validators.required],
      id_instalacion: ['', Validators.required],
      generarQR: [false] // campo para la opción de generar QR
    });

    const navigation = this.router.getCurrentNavigation();
    this.activo = navigation?.extras?.state?.['activo'];
    this.activoId = this.activo?.id || 0;

  }

  ngOnInit(): void {
    this.getUbicaciones();
    
    if (this.activo) {
      this.activoForm.patchValue({
        nombre: this.activo.nombre,
        codigo: this.activo.codigo,
        descripcion: this.activo.descripcion,
        precio: this.activo.precio,
        fecha_adquisicion: this.activo.fecha_adquisicion,
        id_instalacion: this.activo.id_instalacion
      });

      // Establecer la ubicación actual del activo
      this.setCurrentLocation(this.activo.id_instalacion);
    }
  }

  ngAfterViewInit(): void {
    this.initWizard();
  }

  isSaving: boolean = false; // Variable para controlar el estado de guardado

  onCampusChange(event: Event): void {
    const campusId = Number((event.target as HTMLSelectElement).value);
    const campus = this.ubicaciones.find(campus => campus.id === campusId);
    
    if (campus) {
      this.selectedCampus = campus; // Asignamos el objeto campus completo
      this.selectedEdificio = null;
      this.selectedNivel = null;
      this.activoForm.get('id_instalacion')?.setValue('');
    } else {
      this.selectedCampus = null;
      this.selectedEdificio = null;
      this.selectedNivel = null;
      this.activoForm.get('id_instalacion')?.setValue('');
    }
  }

  onEdificioChange(event: Event): void {
    const edificioId = Number((event.target as HTMLSelectElement).value);
    const edificio = this.selectedCampus?.edificios.find(
      (edificio) => edificio.id === edificioId
    );
    
    if (edificio) {
      this.selectedEdificio = edificio; // Asignamos el objeto edificio completo
      this.selectedNivel = null;
      this.activoForm.get('id_instalacion')?.setValue('');
    } else {
      this.selectedEdificio = null;
      this.selectedNivel = null;
      this.activoForm.get('id_instalacion')?.setValue('');
    }
  }

  onNivelChange(event: Event): void {
    const nivelId = Number((event.target as HTMLSelectElement).value);
    const nivel = this.selectedEdificio?.niveles.find(
      (nivel) => nivel.id === nivelId
    );
    
    if (nivel) {
      this.selectedNivel = nivel; // Ahora asignamos el objeto nivel completo
      this.activoForm.get('id_nivel')?.setValue(nivelId);
    } else {
      this.selectedNivel = null;
      this.activoForm.get('id_nivel')?.setValue('');
    }
  }

  onInstalacionChange(event: Event): void {
    const instalacionId = Number((event.target as HTMLSelectElement).value);
    this.activoForm.get('id_instalacion')?.setValue(instalacionId);
    const instalacion = this.selectedNivel?.instalaciones.find(
      (instalacion: Instalacion) => instalacion.id === instalacionId
    );
    this.instalacionSeleccionada = instalacion?.nombre || '';
  }

  setCurrentLocation(instalacionId: number): void {
    for (const campus of this.ubicaciones) {
      for (const edificio of campus.edificios) {
        for (const nivel of edificio.niveles) {
          const instalacion = nivel.instalaciones.find(i => i.id === instalacionId);
          if (instalacion) {
            this.selectedCampus = campus;
            this.selectedEdificio = edificio;
            this.selectedNivel = nivel;
            this.instalacionSeleccionada = instalacion.nombre;
            return;
          }
        }
      }
    }
  }

  getUbicaciones(): void {
    this.activoService.getUbicaciones().subscribe({
      next: (data: Campus[]) => {
        this.ubicaciones = data;
        if (this.activo?.id_instalacion) {
          this.setCurrentLocation(this.activo.id_instalacion);
        }
      },
      error: (error) => {
        console.error('Error al cargar ubicaciones:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las ubicaciones'
        });
      }
    });
  }

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
        const { nombre, codigo, descripcion, precio, fecha_adquisicion } = this.activoForm.value;
        if (!nombre|| !codigo || !descripcion || !precio || !fecha_adquisicion) {
          wizard.stop();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, complete todos los campos requeridos.'
          });
          return;
        }
      }
    });

    this.isSaving = false; // Reiniciar el estado de guardado

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.activoForm.valid) {
        this.isSaving = true;
        const formValue = this.activoForm.value;
        formValue.precio = this.convertPriceToNumber(formValue.precio);
        this.activoService.actualizarActivo(this.activoId, this.activoForm.value).subscribe({
          next: (response) => {
            this.isSaving = false;
            if (response.status === 200) {
              if (this.activoForm.value.generarQR && response.qr_url) {
                // Mostrar éxito con QR
                Swal.fire({
                  icon: 'success',
                  title: 'Activo Actualizado con QR',
                  html: `
                    <p>El activo se ha actualizado correctamente.</p>
                    <img src="${response.qr_url}" alt="Código QR" style="max-width: 300px;">
                  `,
                  confirmButtonText: 'Aceptar'
                }).then(() => {
                  this.router.navigate(['/activos']);
                });
              } else {
                // Mostrar éxito sin QR
                Swal.fire({
                  icon: 'success',
                  title: 'Éxito',
                  text: 'Activo modificado correctamente'
                }).then(() => {
                  this.router.navigate(['/activos']);
                });
              }
            }
          },
          error: (error) => {
            this.isSaving = false;
            let errorMessage = 'Ha ocurrido un error al actualizar el activo: \n';
            
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

  // Añadir método para obtener QR
getQRCode(activoId: number): void {
  this.activoService.getQRCode(activoId).subscribe({
    next: (response) => {
      this.qrCodePath = `${URLFOTOS}${response.qr_path}`;
      this.displayQRCode();
    },
    error: (error) => {
      console.error('Error al obtener el código QR:', error);
      this.handleError('No se pudo obtener el código QR.');
    }
  });
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

  onSubmit() {
    this._wizardObj.goTo(3);
    this._wizardObj.submit();
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

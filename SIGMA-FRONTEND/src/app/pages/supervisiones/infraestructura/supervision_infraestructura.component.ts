import { Component, OnInit, Renderer2 } from '@angular/core';
import { SupervisionService, Usuario, Actividad } from './supervision_infraestructura.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule,FormGroup, Validators} from '@angular/forms';
import { Router, RouterModule, NavigationExtras } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-supervision_infraestructura',
  templateUrl: './supervision_infraestructura.component.html',
  styleUrls: ['./supervision_infraestructura.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule]
})
export class SupervisionInfraestructuraComponent implements OnInit {
  supervisiones: any[] = []; //supervisiones
  supervision_detalle: any = {};
  filteredSupervisiones: any[] = []; //supervisiones filtradas
  searchText: string = ''; //texto de busqueda
  currentPage: number = 1; //pagina actual
  itemsPerPage: number = 25; //numero de elementos por pagina
  tipos_actividad = ['Mantenimiento a infraestructura' ]; // Ajusta según tus tipos
  currentPageSupervisiones: number = 1; //pagina actual de supervisiones
  itemsPerPageSupervisiones: number = 5; //numero de elementos por pagina de supervisiones
  usuarios: Usuario[] = []; // Deberías cargar esto desde tu API
  navigation: any;
  
  constructor(
    private fb: FormBuilder,
    private supervisionService: SupervisionService,
    private router: Router,
    private renderer: Renderer2,
    public servicePermiso: PermisosService
  ) {
    this.navigation = this.router.getCurrentNavigation();
  }

  formatFechaSupervision(fecha: string): string {
    const fechaObj = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    // Convertir a español y capitalizar primera letra
    let fechaFormateada = fechaObj.toLocaleDateString('es-ES', opciones);
    fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
    
    return fechaFormateada;
  }
  
  ngOnInit(): void {
    this.fetchSupervisiones();
    this.supervisionService.getUsuarios().subscribe((response: any) => {
      this.usuarios = response.usuarios.data;
    });
    
  }

  fetchSupervisiones(): void {
    this.supervisionService.getSupervision().subscribe(
      (data) => {
        
        this.supervisiones = data.data;
        this.filteredSupervisiones = this.supervisiones; // Clona el array
        this.filterSupervisiones();
      },
      (error) => {
        console.error('Error fetching supervisiones:', error);
      }
    );
}

  // Agrega este método para filtrar las supervisiones
  filterSupervisiones(): void {
    this.filteredSupervisiones = this.supervisiones.filter(supervision => {
      const matchesSearchText = supervision.descripcion.toLowerCase().includes(this.searchText.toLowerCase()) ||
                               supervision.resumen_actividad.toLowerCase().includes(this.searchText.toLowerCase()) ||
                               supervision.usuario.toLowerCase().includes(this.searchText.toLowerCase()) ||
                               (supervision.created_at && supervision.created_at.toLowerCase().includes(this.searchText.toLowerCase()));
      
      return matchesSearchText || null;
    });
    this.currentPage = 1;
  }

  onSearchTextChange(): void {
    this.filterSupervisiones();
  }

  isModalOpen: boolean = false;
  verSupervision(supervision_id: any): void {
    this.supervisionService.getSupervisionDetalle(supervision_id).subscribe(
      (data) => {
        this.supervision_detalle = data;
        this.isModalOpen = true;
      },
      (error) => {
        console.error('Error fetching supervision:', error);
      }
    );
  }

  closeVerModal(): void {
    this.isModalOpen = false;
  }

  isImageModalOpen = false;
  selectedImageModalUrl: string | null = null;
  imageScale = 1;
  isDragging = false;
  startX = 0;
  startY = 0;
  translateX = 0;
  translateY = 0;
  
  closeImageModal(): void {
    this.isImageModalOpen = false;
    this.selectedImageModalUrl = null;
    this.imageScale = 1;
    this.translateY = 0;
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    
    if (event.deltaY > 0) {
      this.imageScale =1;
    } else {
      this.imageScale = Math.min(2, this.imageScale + 0.1);
    }
  
    if (this.imageScale === 1) {
      this.translateX = 0;
      this.translateY = 0;
    }
  
    this.updateImageTransform(); // Agrega esta línea para actualizar el `transform` al hacer zoom
  }

  onMouseDown(event: MouseEvent): void {
    if (this.imageScale > 1) {
      this.isDragging = true;
      this.startY = event.clientY - this.translateY;
    }
  }
  
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.translateY = event.clientY - this.startY;
      this.updateImageTransform();
    }
  }
  
  onMouseUp(): void {
    this.isDragging = false;
  }

  onDoubleClick(): void {
    this.imageScale = this.imageScale === 1 ? 2 : 1;
    if (this.imageScale === 1) {
      this.translateX = 0;
      this.translateY = 0;
    }
    this.updateImageTransform();
  }
  
  private updateImageTransform(): void {
    const img = document.querySelector('.modal-imagen-content img') as HTMLImageElement;
    if (img) {
      img.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.imageScale})`;
    }
  }

  // Add to component class
  currentImageIndex: number = 0;
  imagesArray: string[] = [];
  
  openImageModal(imageUrl: string, index: number): void {
    this.currentImageIndex = index;
    this.selectedImageModalUrl = imageUrl;
    this.isImageModalOpen = true;
    this.imageScale = 1;
    this.translateX = 0;
    this.translateY = 0;
    
    // Store current image array
    if (this.supervision_detalle.imagenes) {
      this.imagesArray = this.supervision_detalle.imagenes.map((img: any) => img.url);
    }
  }
  
  nextImage(): void {
    if (this.currentImageIndex < this.imagesArray.length - 1) {
      this.currentImageIndex++;
      this.selectedImageModalUrl = this.imagesArray[this.currentImageIndex];
      this.resetZoomAndPosition();
    }
  }
  
  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.selectedImageModalUrl = this.imagesArray[this.currentImageIndex];
      this.resetZoomAndPosition();
    }
  }
  
  private resetZoomAndPosition(): void {
    this.imageScale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  calendarizar(selectInfo: any): void {
    Swal.fire({
      title: 'Crear nueva actividad',
      html: `
        <div class="swal-form-container">
          <div class="swal-form-item">
            <label for="tipo_actividad">Tipo de Actividad</label>
            <select id="tipo_actividad" class="swal2-select">
              ${this.tipos_actividad.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
            </select>
          <div class="swal-form-item">
            <label for="fecha_inicio">Fecha Inicio</label>
            <input id="fecha_inicio" type="date" class="swal2-input" 
                    value="${selectInfo.startStr ? selectInfo.startStr.split('T')[0] : ''}"
                    min="${new Date().toISOString().split('T')[0]}"> <!-- Restringimos fechas anteriores -->
            </div>
            <div class="swal-form-item">
            <label for="fecha_fin">Fecha Fin</label>
            <input id="fecha_fin" type="date" class="swal2-input" 
                    value="${selectInfo.endStr ? selectInfo.endStr.split('T')[0] : ''}"
                    min="${new Date().toISOString().split('T')[0]}"> <!-- Restringimos fechas anteriores -->
          </div>

          <div class="swal-form-item">
            <label for="observaciones">Observaciones</label>
            <textarea id="observaciones" class="swal2-textarea" placeholder="Observaciones"></textarea>
          </div>
          <div class="swal-form-item">
            <label for="id_usuario">Responsable</label>
            <select id="id_usuario" class="swal2-select">
              ${this.usuarios.map(usuario => `<option value="${usuario.id}">${usuario.nombre}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      didOpen: () => {
        const confirmButton = Swal.getConfirmButton() as HTMLButtonElement;
        confirmButton.disabled = true; // Deshabilitar el botón de confirmación inicialmente
  
        // Función para validar los campos del formulario
        const validateForm = () => {
          const tipoActividad = (document.getElementById('tipo_actividad') as HTMLSelectElement).value;
          const fechaInicio = (document.getElementById('fecha_inicio') as HTMLInputElement).value;
          const fechaFin = (document.getElementById('fecha_fin') as HTMLInputElement).value;
          const observaciones = (document.getElementById('observaciones') as HTMLTextAreaElement).value;
          const idUsuario = (document.getElementById('id_usuario') as HTMLSelectElement).value;
  
          if (
            tipoActividad.trim() !== '' &&
            fechaInicio.trim() !== '' &&
            fechaFin.trim() !== '' &&
            observaciones.trim() !== '' &&
            idUsuario.trim() !== ''
          ) {
            confirmButton.disabled = false;
          } else {
            confirmButton.disabled = true;
          }
        };
  
        // Agregar escuchadores de eventos a los campos del formulario para la validación
        const formFields = [
          'tipo_actividad',
          'fecha_inicio',
          'fecha_fin',
          'observaciones',
          'id_usuario'
        ];
  
        formFields.forEach((fieldId) => {
          const field = document.getElementById(fieldId);
          if (field) {
            field.addEventListener('input', validateForm);
            field.addEventListener('change', validateForm);
          }
        });
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      customClass: {
        container: 'custom-swal-container',
        popup: 'custom-swal-popup',
        htmlContainer: 'custom-swal-html-container',
        actions: 'custom-swal-actions',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button'
      },
      preConfirm: () => {
        return {
          tipo_actividad: (document.getElementById('tipo_actividad') as HTMLSelectElement).value,
          fecha_inicio: (document.getElementById('fecha_inicio') as HTMLInputElement).value,
          fecha_fin: (document.getElementById('fecha_fin') as HTMLInputElement).value,
          observaciones: (document.getElementById('observaciones') as HTMLTextAreaElement).value,
          id_usuario: parseInt((document.getElementById('id_usuario') as HTMLSelectElement).value),
          id_supervision: selectInfo.id
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevaActividad: Actividad = {
          fecha_inicio: result.value.fecha_inicio,
          fecha_final: result.value.fecha_fin,
          tipo_actividad: result.value.tipo_actividad,
          observaciones: result.value.observaciones,
          id_usuario: result.value.id_usuario,
          es_recurrente: false, // Valor por defecto
          tiempo_recurrencia: 0, // Valor por defecto
          id_inspeccion: 0,
          id_mantenimiento: 0,
          id_supervision: selectInfo.id,
          estado: 'Pendiente'
        };
  
        this.supervisionService.crearActividad(nuevaActividad).subscribe(
          (response) => {
            Swal.fire('¡Éxito!', 'Actividad creada correctamente', 'success');
          },
          (error) => {
            let errorMessage = 'Ha ocurrido un error al crear la actividad: \n';
  
            Object.keys(error.error.errors).forEach((field) => {
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`;
              });
            });
  
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage
            });
          }
        );
      }
    });
}
  
}
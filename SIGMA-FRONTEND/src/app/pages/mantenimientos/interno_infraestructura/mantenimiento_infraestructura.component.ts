import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { Actividad, Usuario, MantenimientoService } from './mantenimiento_infraestructura.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, NavigationExtras, RouterModule} from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-mantenimiento_infraestructura',
  templateUrl: './mantenimiento_infraestructura.component.html',
  styleUrls: ['./mantenimiento_infraestructura.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule]
})
export class MantenimientoInfraestructuraComponent implements OnInit {
  mantenimientos: any[] = [];
  mantenimiento_detalle: any = {};
  filteredMantenimientos: any[] = [];
  usuarios: Usuario[] = []; // Deberías cargar esto desde tu API
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 25; // Número de elementos por página
  currentPageMantenimientos: number = 1; // Página actual de mantenimientos
  itemsPerPageMantenimientos: number = 5; // Número de elementos por página de mantenimientos

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private router: Router,
    private renderer: Renderer2,
    public service: PermisosService,
  ) {}
  
  ngOnInit(): void {
    this.fetchMantenimientos();
    this.mantenimientoService.getUsuarios().subscribe((response: any) => {
      this.usuarios = response.usuarios.data;
    });
  }

  fetchMantenimientos(): void {
    const estado = this.selectedStatus === 'todos' ? '' : this.selectedStatus;
    this.mantenimientoService.getMantenimiento().subscribe(
      (data) => {
        this.mantenimientos = data.data;
        this.filteredMantenimientos = this.mantenimientos;
        this.filterMantenimientos();
      },
      (error) => {
        console.error('Error fetching mantenimientos:', error);
      }
    );
  }

  filterMantenimientos(): void {
    this.filteredMantenimientos = this.mantenimientos.filter(mantenimiento => {
      const matchesSearchText = mantenimiento.fecha_mantenimiento.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                mantenimiento.instalacion.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                mantenimiento.usuario.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                mantenimiento.activo.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                mantenimiento.tipo.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                mantenimiento.descripcion.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'todos' || mantenimiento.estado === this.selectedStatus;
      return matchesSearchText && matchesStatus || null;
    });
    this.currentPage = 1; // Reinicia la página a 1 después de filtrar
  }

  onSearchTextChange(): void {
    this.filterMantenimientos();
  }

  isModalOpen: boolean = false;
  verMantenimiento(mantenimiento_id: any): void {
    this.mantenimientoService.getMantenimientoDetalle(mantenimiento_id).subscribe(
      (data) => {
        this.mantenimiento_detalle = data;
        this.isModalOpen = true;
      },
      (error) => {
        console.error('Error fetching mantenimiento:', error);
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
    if (this.mantenimiento_detalle.imagenes) {
      this.imagesArray = this.mantenimiento_detalle.imagenes.map((img: any) => img.url);
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
              <option value="Supervisión a infraestructura">Supervisión a infraestructura</option>
            </select>
          </div>
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
              ${this.usuarios.map(usuarios => `<option value="${usuarios.id}">${usuarios.nombre}</option>`).join('')}
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
            idUsuario.trim() 
          ) {
            confirmButton.disabled = false; // Habilitar el botón de confirmación si todos los campos son válidos
          } else {
            confirmButton.disabled = true; // Mantenerlo deshabilitado de lo contrario
          }
        };
  
        // Agregar escuchadores de eventos a los campos del formulario para la validación
        const formFields = [
          'tipo_actividad',
          'fecha_inicio',
          'fecha_fin',
          'observaciones',
          'id_usuario',
          'tiempo_recurrencia',
          'es_recurrente',
          'unidad_recurrencia',
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
          es_recurrente: false,
          id_mantenimiento: selectInfo.id,
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
          es_recurrente: result.value.es_recurrente,
          tiempo_recurrencia: result.value.tiempo_recurrencia,
          id_inspeccion: 0,
          id_mantenimiento: selectInfo.id,
          id_supervision: 0,
          estado: 'Pendiente'
        };
  
        this.mantenimientoService.crearActividad(nuevaActividad).subscribe(
          (response) => {
            this.fetchMantenimientos();
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

import { Component, OnInit, Renderer2 } from '@angular/core';
import { Actividad, InspeccionesInfraestructuraService, Usuario } from './inspecciones-infraestructura.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, NavigationExtras, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { PermisosService } from '../../../service/permisos.service';


@Component({
  selector: 'app-inspecciones-infraestructura',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule],
  templateUrl: './inspecciones-infraestructura.component.html',
  styleUrl: './inspecciones-infraestructura.component.css'
})


export class InspeccionesInfraestructuraComponent {
  inspecciones: any[] = [];
  filteredInspecciones: any[] = [];
  informacionInspeccionSelec: any[] = [];
  searchText: string = '';
  selectedStatus: string = 'todos'; 
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 25; // Número de elementos por página
  tipos_actividad = ['Mantenimiento a infraestructura', 'Mantenimiento externo']; // Ajusta según tus tipos
  usuarios: Usuario[] = []; // Deberías cargar esto desde tu API
  navigation: any;
  constructor(
    private fb: FormBuilder,
    private inspeccionService: InspeccionesInfraestructuraService,
    private router: Router,
    private renderer: Renderer2,
    public permisosService: PermisosService
  ) {

   this.navigation = this.router.getCurrentNavigation();
  }

formatFechaInspeccion(fecha: string): string {
  const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(fecha).toLocaleDateString('es-ES', opciones);
}

ngOnInit(): void {
  registerLocaleData(localeEs);
  this.fetchInspecciones();
  this.inspeccionService.getUsuarios().subscribe((response: any) => {
    this.usuarios = response.usuarios.data;

  });
  
}


  fetchInspecciones(): void {
    const estado = this.selectedStatus === 'todos' ? '' : this.selectedStatus;
    this.inspeccionService.getInspeccione().subscribe(
      (data) => {
        this.inspecciones = data.data;
        this.filteredInspecciones = this.inspecciones;
        this.filterInspecciones();
      },
      (error) => {
        console.error('Error fetching inspecciones:', error);
      }
    );
  }

  filterInspecciones(): void {
    this.filteredInspecciones = this.inspecciones.filter(inspeccion => {
      const matchesSearchText = inspeccion.id.toString().includes(this.searchText) || 
                                inspeccion.fecha_inspeccion.toString().includes(this.searchText) ||
                                inspeccion.instalacion.toString().includes(this.searchText) ||
                                (typeof inspeccion.id_activos === 'string' && inspeccion.id_activos.toLowerCase().includes(this.searchText.toLowerCase())) ||
                                inspeccion.descripcion.toLowerCase().includes(this.searchText.toLowerCase())
      const matchesStatus = this.selectedStatus === 'todos' || inspeccion.motivo === this.selectedStatus;
      return matchesSearchText && matchesStatus || null;
    });
    this.currentPage = 1; // Reinicia la página a 1 después de filtrar
  }
  

  onSearchTextChange(): void {
    this.filterInspecciones();
  }

  onStatusChange(): void {
    this.fetchInspecciones();
  }


  agregarInspeccion(selectInfo: any): void {
    Swal.fire({
      title: 'Crear nueva actividad',
      html: `
        <div class="swal-form-container">
          <div class="swal-form-item">
            <label for="tipo_actividad">Tipo de Actividad</label>
            <select id="tipo_actividad" class="swal2-select">
              ${this.tipos_actividad.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
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
          id_usuario: parseInt((document.getElementById('id_usuario') as HTMLSelectElement).value)
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
          es_recurrente: false,
          tiempo_recurrencia: 0,
          id_inspeccion: selectInfo.id,
          id_mantenimiento: 0,
          id_supervision: 0,
          estado: 'Pendiente'
        };
        this.inspeccionService.crearActividad(nuevaActividad).subscribe(
          (response) => {
            Swal.fire('¡Éxito!', 'Actividad creada correctamente', 'success');
            this.fetchInspecciones();
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
  


  changeEstado(id: number): void {
    this.inspeccionService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado actualizado correctamente'})
        this.fetchInspecciones();
      },
      (error) => {
        console.error('Error cambiando estado:', error);
      }
    );
  }

  isModalOpen: boolean = false;
  verInspeccion(inspeccion: any): void {
    this.isModalOpen = true;
  }

  closeVerModal(): void {
    this.isModalOpen = false;
    informacionInspeccionSelec: [] = [];
  }

  modalInfo(id: number): void { 
    this.fetchInspeccionesinfo(id);
}

fetchInspeccionesinfo(id: number): void {
  this.inspeccionService.getInspeccioneInformacion(id).subscribe(
    (data) => {

      this.informacionInspeccionSelec = data.data;

    },
    (error) => {
      console.error('Error fetching inspecciones:', error);
    }
  );
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
  if (this.informacionInspeccionSelec[0]?.imagenes) {
    this.imagesArray = this.informacionInspeccionSelec[0].imagenes.map((img: any) => img.url);
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

}


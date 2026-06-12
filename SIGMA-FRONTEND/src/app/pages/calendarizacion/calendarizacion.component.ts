// calendarizacion.component.tsActividad
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationExtras } from '@angular/router';
import { CalendarizacionService, Actividad, CalendarEvent, Usuario } from './calendarizacion.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Swal from 'sweetalert2';
import { ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import esLocale from '@fullcalendar/core/locales/es';
import { PermisosService } from '../../service/permisos.service';  
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendarizacion',
  standalone: true,
  imports: [CommonModule, RouterModule, FullCalendarModule, FormsModule],
  templateUrl: './calendarizacion.component.html',
  styleUrls: ['./calendarizacion.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarizacionComponent implements OnInit {
  instanceId = Math.random().toString(36).substring(7); // Para crear un ID único
  estadoSeleccionado: string = 'Pendiente';
  actividadSeleccionada: string = 'todas';
  usuarioSeleccionado: string = 'todos';

  isSaving: boolean = false;
  
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarOptions: any = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay'
    },  
    editable: false, // Añadir esta línea
    eventResizableFromStart: false, // Añadir esta línea
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,    
    longPressDelay: 0,
    eventLongPressDelay: 0,
    selectLongPressDelay: 0,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: this.transformEvents.bind(this),
  };

  tipos_actividad = ['Inspección a infraestructura', 'Inspección a equipo', 'Mantenimiento a infraestructura', 'Mantenimiento a equipo', 'Mantenimiento externo', 'Supervisión a infraestructura', 'Supervisión a equipo']; // Ajusta según tus tipos
  usuarios: Usuario[] = []; // Deberías cargar esto desde tu API

  constructor(private calendarizacionService: CalendarizacionService, private router: Router, public servicePermiso: PermisosService) {}

  ngOnInit(): void {
    this.calendarizacionService.getUsuarios().subscribe((response: any) => {
      this.usuarios = response.usuarios.data;
      this.setInitialFilterValues();
    });

    this.cargarYMostrarAlertas();

     // Añadimos un listener global para cerrar los popovers
    document.addEventListener('click', this.handleGlobalClick.bind(this));
  }  

  private setInitialFilterValues(): void {
    const userId = localStorage.getItem('id_usuario');
    const userRol = localStorage.getItem('rol');

    if (userRol !== '1') {
      this.usuarioSeleccionado = userId ? userId : 'todos';
    } else {
      this.usuarioSeleccionado = 'todos';
    }

    this.onFiltroChange(); // Actualiza los filtros y el calendario
  } 

  private cargarYMostrarAlertas(): void {
    this.calendarizacionService.getAlertasVencidas().subscribe(
      (alertas) => {
        if (alertas.total > 0) {
          Swal.fire({
            title: 'Actividades Vencidas',
            html: `
              <div class="alert-summary">
                <p class="text-xl mb-4">Hay un total de <strong>${alertas.total}</strong> actividad/es vencidas en la ultima semana:</p>
                <div class="grid grid-cols-1 gap-2">
                  ${alertas.por_tipo.Mantenimiento > 0 ? 
                    `<div class="text-emerald-600">
                      <strong>Mantenimientos:</strong> ${alertas.por_tipo.Mantenimiento}
                    </div>` : ''
                  }
                  ${alertas.por_tipo.Inspeccion > 0 ? 
                    `<div class="text-blue-600">
                      <strong>Inspecciones:</strong> ${alertas.por_tipo.Inspeccion}
                    </div>` : ''
                  }
                  ${alertas.por_tipo.Supervision > 0 ? 
                    `<div class="text-yellow-600">
                      <strong>Supervisiones:</strong> ${alertas.por_tipo.Supervision}
                    </div>` : ''
                  }
                </div>
              </div>
            `,
            icon: 'warning',
            confirmButtonText: 'Entendido',
            customClass: {
              container: 'custom-swal-container',
              popup: 'custom-swal-popup',
              htmlContainer: 'custom-swal-html-container',
              confirmButton: 'custom-swal-confirm-button'
            }
          });
        }
      },
      (error) => {
        console.error('Error al cargar las alertas:', error);
      }
    );
  }

    // Función para manejar clicks globales y cerrar popovers
    handleGlobalClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const calendarApi = this.calendarComponent?.getApi();
      if (!calendarApi) return;
  
      // Si el click no fue dentro de un popover, cerramos todos los popovers
      if (!target.closest('.fc-popover')) {
        const popovers = document.querySelectorAll('.fc-popover');
        popovers.forEach(popover => {
          (popover as HTMLElement).style.display = 'none';
        });
      }
    }

    transformEvents(fetchInfo: any, successCallback: any, failureCallback: any) {
      this.calendarizacionService.getActividades().subscribe(
        (actividades) => {
          // Inicializar con todas las actividades
        let filteredActividades = [...actividades];
        
        // Aplicar filtro por estado si no está en "todas"
        if (this.estadoSeleccionado !== 'todas') {
          filteredActividades = filteredActividades.filter(act => act.estado === this.estadoSeleccionado);
        }

        // Aplicar filtro por tipo si no está en "todas"
        if (this.actividadSeleccionada !== 'todas') {
          filteredActividades = filteredActividades.filter(act => act.tipo_actividad.startsWith(this.actividadSeleccionada));
        }
        
        // Aplicar filtro por tipo si no está en "todas"
        if (this.usuarioSeleccionado !== 'todos') {
          filteredActividades = filteredActividades.filter(act => act.id_usuario === parseInt(this.usuarioSeleccionado));
        }

        const events: CalendarEvent[] = [];
        filteredActividades.forEach(actividad => {
          // Evento para la fecha de inicio
          events.push({
            id: `start_${actividad.id}`,
            title: `🟢 Inicio: ${actividad.tipo_actividad}`,
            start: actividad.fecha_inicio,
            end: actividad.fecha_inicio,
            backgroundColor: this.getActivityTypeColor(actividad.tipo_actividad),
            extendedProps: {
              ...actividad,
              isStart: true
            }
          });
  
          // Evento para la fecha final
          events.push({
            id: `end_${actividad.id}`,
            title: `🔴 Fin: ${actividad.tipo_actividad}`,
            start: actividad.fecha_final,
            end: actividad.fecha_final,
            backgroundColor: this.getActivityTypeColor(actividad.tipo_actividad),
            extendedProps: {
              ...actividad,
              isEnd: true
            }
          });
        });
        successCallback(events);
      },
      (error) => {
        console.error('Error al cargar actividades:', error);
        failureCallback(error);
      }
    );
  }
  
  onFiltroChange() {
    this.refreshCalendar();
  }
  
  // Función para obtener color según tipo de actividad
  getActivityTypeColor(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'mantenimiento a infraestructura':
        return '#00b45a'; 
      case 'mantenimiento a equipo':
        return '#00b45a'; 
      case 'mantenimiento externo':
        return '#b20074';
      case 'inspección a infraestructura':
        return '#008bb4';
      case 'inspección a equipo':
        return '#008bb4';  
      case 'supervisión a infraestructura':
        return '#bec100';  
      case 'supervisión a equipo':
        return '#bec100'; 
      default:
        return '#757575'; // Gris
    }
  }
  
  // La función getEventColor existente se mantiene para los estados
  getEventColor(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return '#FFA500';
      case 'completado':
        return '#28a745';
      case 'cancelado':
        return '#dc3545';
      default:
        return '#007bff';
    }
  }

  handleDateSelect(selectInfo: any): void {
    
    const tienePermiso = this.servicePermiso.permisoEspecifico('Crear actividad');
  if(tienePermiso)  {
    // Obtener la fecha actual sin tiempo (solo fecha)
    const today = new Date();
    today.setDate(today.getDate() - 1);
    today.setHours(0, 0, 0, 0);
    
    // Convertir la fecha seleccionada a Date
    const selectedDate = new Date(selectInfo.startStr);
    selectedDate.setHours(0, 0, 0, 0);
  
    // Validar si la fecha seleccionada es anterior a hoy
    if (selectedDate < today) {
      Swal.fire({
        icon: 'error',
        title: 'Fecha no válida',
        text: 'No se pueden crear actividades en fechas anteriores al día actual'
      });
      return;
    }
        
    Swal.fire({
      title: 'Crear nueva actividad',
      html: `
      ${tienePermiso ? `
        <div class="swal-form-container">
          <div class="swal-form-item" >
            <label for="tipo_actividad">Tipo de Actividad</label>
            <select id="tipo_actividad" class="swal2-select">
              ${this.tipos_actividad.map(tipo => `<option value="${tipo}">${tipo}</option>`).join('')}
            </select>
          </div>
          <div class="swal-form-item">
            <label for="fecha_inicio">Fecha Inicio</label>
            <input id="fecha_inicio" type="date" class="swal2-input" 
                   value="${selectInfo.startStr.split('T')[0]}"
                   min="${new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}">
          </div>
          <div class="swal-form-item">
            <label for="fecha_fin">Fecha Fin</label>
            <input id="fecha_fin" type="date" class="swal2-input" 
                   value="${selectInfo.endStr.split('T')[0]}"
                   min="${new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}">
          </div>
          <div class="swal-form-item">
            <label for="observaciones">Observaciones</label>
            <textarea id="observaciones" class="swal2-textarea" placeholder="Detalle las instrucciones de la actividad (Lugar, tareas, equipos, materiales ...)"></textarea>
          </div>
          <div class="swal-form-item">
            <label for="id_usuario">Responsable</label>
            <select id="id_usuario" class="swal2-select">
              ${this.usuarios.map(usuarios => 
            `<option value="${usuarios.id}" ${usuarios.id === parseInt(localStorage.getItem('id_usuario')!) ? 'selected' : ''}>${usuarios.nombre}</option>`
              ).join('')}
            </select>
          </div>
          <div class="swal-form-item checkbox-container">
            <label for="es_recurrente" class="checkbox-label">
              <input id="es_recurrente" type="checkbox" class="swal2-checkbox" onchange="toggleRecurrencia()">
              Es recurrente
            </label>
          </div>
          <div id="recurrencia-container" style="display: none;">
            <div class="swal-form-item">
              <label for="unidad_recurrencia">Unidad de tiempo</label>
              <select id="unidad_recurrencia" class="swal2-select" onchange="updateRecurrenciaInput()">
                <option value="dias">Días</option>
                <option value="semanas">Semanas</option>
                <option value="meses">Meses</option>
                <option value="años">Años</option>
              </select>
            </div>
            <div class="swal-form-item">
              <label for="tiempo_recurrencia">¿Cada cuánto?</label>
              <div id="tiempo-inputs-container">
                <input id="tiempo_recurrencia_dias" type="number" class="swal2-input" 
                      placeholder="¿Cada cuántos días?" min="1" 
                      style="display: block; width: 100%; max-width: none;">
                <input id="tiempo_recurrencia_semanas" type="number" class="swal2-input" 
                      placeholder="¿Cada cuántas semanas?" min="1" 
                      style="display: none; width: 100%; max-width: none;">
                <input id="tiempo_recurrencia_meses" type="number" class="swal2-input" 
                      placeholder="¿Cada cuántos meses?" min="1" 
                      style="display: none; width: 100%; max-width: none;">
                <input id="tiempo_recurrencia_años" type="number" class="swal2-input" 
                      placeholder="¿Cada cuántos años?" min="1" 
                      style="display: none; width: 100%; max-width: none;">
              </div>
            </div>
            <div class="swal-form-item">
              <label for="fecha_limite">Programar hasta</label>
              <input id="fecha_limite" type="date" class="swal2-input" 
                     min="${new Date().toISOString().split('T')[0]}">
            </div>
          </div>
        </div>
        ` : ''}
      `,
      didOpen: () => {
        // Obtener el botón de confirmar
        const confirmButton = Swal.getConfirmButton();
        if (confirmButton) {
          confirmButton.disabled = true;
        }
    
        // Función para validar todos los campos
        const validateForm = () => {
          const tipo_actividad = (document.getElementById('tipo_actividad') as HTMLSelectElement).value;
          const fecha_inicio = (document.getElementById('fecha_inicio') as HTMLInputElement).value;
          const fecha_fin = (document.getElementById('fecha_fin') as HTMLInputElement).value;
          const observaciones = (document.getElementById('observaciones') as HTMLTextAreaElement).value;
          const id_usuario = (document.getElementById('id_usuario') as HTMLSelectElement).value;
          const checkbox = document.getElementById('es_recurrente') as HTMLInputElement;
    
          let isValid = true;
    
          // Validar campos básicos
          if (!tipo_actividad || !fecha_inicio || !fecha_fin || !observaciones.trim() || !id_usuario) {
            isValid = false;
          }
    
          // Si es recurrente, validar campos adicionales
          if (checkbox.checked) {
            const unidadSelect = document.getElementById('unidad_recurrencia') as HTMLSelectElement;
            const unidad = unidadSelect.value;
            const inputActual = document.getElementById(`tiempo_recurrencia_${unidad}`) as HTMLInputElement;
            const fechaLimite = (document.getElementById('fecha_limite') as HTMLInputElement).value;
    
            if (!fechaLimite || !inputActual?.value || parseInt(inputActual.value) < 1) {
              isValid = false;
            }
          }
    
          // Habilitar/deshabilitar botón según validación
          if (confirmButton) {
            confirmButton.disabled = !isValid;
          }
        };
    
        // Agregar event listeners a todos los campos
        const campos = [
          'tipo_actividad',
          'fecha_inicio',
          'fecha_fin',
          'observaciones',
          'id_usuario',
          'es_recurrente',
          'unidad_recurrencia',
          'tiempo_recurrencia_dias',
          'tiempo_recurrencia_semanas',
          'tiempo_recurrencia_meses',
          'tiempo_recurrencia_años',
          'fecha_limite'
        ];
    
        campos.forEach(campo => {
          const elemento = document.getElementById(campo);
          if (elemento) {
            elemento.addEventListener('change', validateForm);
            elemento.addEventListener('input', validateForm);
          }
        });
    
        // Función para manejar recurrencia
        (window as any).toggleRecurrencia = () => {
          const checkbox = document.getElementById('es_recurrente') as HTMLInputElement;
          const recurrenciaContainer = document.getElementById('recurrencia-container');
          const fechaLimite = document.getElementById('fecha_limite') as HTMLInputElement;
          
          if (recurrenciaContainer) {
            recurrenciaContainer.style.display = checkbox.checked ? 'block' : 'none';
            if (checkbox.checked) {
              const fechaInicio = (document.getElementById('fecha_inicio') as HTMLInputElement).value;
              const unAnioDelInicio = new Date(fechaInicio);
              unAnioDelInicio.setFullYear(unAnioDelInicio.getFullYear() + 1);
              fechaLimite.value = unAnioDelInicio.toISOString().split('T')[0];
            }
          }
          validateForm(); // Validar el formulario cuando cambie el checkbox
        };
    
        // Función para actualizar inputs de tiempo
        (window as any).updateRecurrenciaInput = () => {
          const unidadSelect = document.getElementById('unidad_recurrencia') as HTMLSelectElement;
          const inputDias = document.getElementById('tiempo_recurrencia_dias');
          const inputSemanas = document.getElementById('tiempo_recurrencia_semanas');
          const inputMeses = document.getElementById('tiempo_recurrencia_meses');
          const inputAños = document.getElementById('tiempo_recurrencia_años');
    
          [inputDias, inputSemanas, inputMeses, inputAños].forEach(input => {
            if (input) input.style.display = 'none';
          });
    
          const inputActual = document.getElementById(`tiempo_recurrencia_${unidadSelect.value}`);
          if (inputActual) {
            inputActual.style.display = 'block';
          }
          validateForm(); // Validar el formulario cuando cambie la unidad
        };
    
        // Validación inicial
        validateForm();
      },
      willClose: () => {
        delete (window as any).toggleRecurrencia;
        delete (window as any).updateRecurrenciaInput;
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
        const checkbox = document.getElementById('es_recurrente') as HTMLInputElement;
        const unidadSelect = document.getElementById('unidad_recurrencia') as HTMLSelectElement;
        const fechaInicio = new Date((document.getElementById('fecha_inicio') as HTMLInputElement).value);
        const fechaFin = new Date((document.getElementById('fecha_fin') as HTMLInputElement).value);
        const fechaLimite = new Date((document.getElementById('fecha_limite') as HTMLInputElement).value);
        
        // Validaciones
        if (checkbox.checked) {
          if (fechaLimite < fechaInicio) {
            Swal.showValidationMessage('La fecha límite no puede ser anterior a la fecha de inicio');
            return false;
          }
  
          // Obtener el valor del input activo
          const unidad = unidadSelect.value;
          const inputActual = document.getElementById(`tiempo_recurrencia_${unidad}`) as HTMLInputElement;
          if (!inputActual || !inputActual.value || parseInt(inputActual.value) < 1) {
            Swal.showValidationMessage('El tiempo de recurrencia debe ser mayor a 0');
            return false;
          }
  
          const cantidad = parseInt(inputActual.value);
          const horas = cantidad * (unidad === 'dias' ? 1 : unidad === 'semanas' ? 7 : unidad === 'meses' ? 30 : 365);
          
          return {
            tipo_actividad: (document.getElementById('tipo_actividad') as HTMLSelectElement).value,
            fecha_inicio: (document.getElementById('fecha_inicio') as HTMLInputElement).value,
            fecha_fin: (document.getElementById('fecha_fin') as HTMLInputElement).value,
            observaciones: (document.getElementById('observaciones') as HTMLTextAreaElement).value,
            id_usuario: parseInt((document.getElementById('id_usuario') as HTMLSelectElement).value),
            es_recurrente: true,
            tiempo_recurrencia: horas,
            fecha_limite: (document.getElementById('fecha_limite') as HTMLInputElement).value
          };
        }
  
        // Si no es recurrente, mantener el comportamiento original
        return {
          tipo_actividad: (document.getElementById('tipo_actividad') as HTMLSelectElement).value,
          fecha_inicio: (document.getElementById('fecha_inicio') as HTMLInputElement).value,
          fecha_fin: (document.getElementById('fecha_fin') as HTMLInputElement).value,
          observaciones: (document.getElementById('observaciones') as HTMLTextAreaElement).value,
          id_usuario: parseInt((document.getElementById('id_usuario') as HTMLSelectElement).value),
          es_recurrente: false,
          tiempo_recurrencia: 0,
          fecha_limite: null
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
          id_mantenimiento: 0,
          id_supervision: 0,
          fecha_limite: result.value.fecha_limite,
          estado: 'Pendiente',
          pasoActividad: 0
        };
  
        this.calendarizacionService.crearActividad(nuevaActividad).subscribe(
          (response) => {
            this.refreshCalendar();
            Swal.fire('¡Éxito!', 'Actividad creada correctamente', 'success');
          },
          (error) => {
            console.log(error);
            let errorMessage = 'Ha ocurrido un error al crear el proveedor: \n';

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
  
  handleEventClick(clickInfo: any): void {
    
    const permisoVerActividad = this.servicePermiso.permisoEspecifico('Ver actividad');    
    const permisoEjecutarActividad = this.servicePermiso.permisoEspecifico('Ejecutar actividad');
    const permisoEditarActividad = this.servicePermiso.permisoEspecifico('Editar actividad');
    const permisoVerResumenActividad = this.servicePermiso.permisoEspecifico('Ver resumen');
    
  if(permisoVerActividad){
    const popovers = document.querySelectorAll('.fc-popover');
    popovers.forEach(popover => {
      (popover as HTMLElement).style.display = 'none';
    });

    // Luego procedemos con el código original del click handler
    const actividad = clickInfo.event.extendedProps;
    const isStart = actividad.isStart;
    const isEnd = actividad.isEnd;
    const usuario = this.usuarios.find(u => u.id === actividad.id_usuario);
    
        // Calcular la unidad de tiempo y cantidad basada en los días almacenados
        let unidadTiempo = 'dias';
        let cantidadTiempo = actividad.tiempo_recurrencia;
        
        if (actividad.tiempo_recurrencia >= 365 && actividad.tiempo_recurrencia % 365 === 0) {
          unidadTiempo = 'años';
          cantidadTiempo = actividad.tiempo_recurrencia / 365;
        } else if (actividad.tiempo_recurrencia >= 30 && actividad.tiempo_recurrencia % 30 === 0) {
          unidadTiempo = 'meses';
          cantidadTiempo = actividad.tiempo_recurrencia / 30;
        } else if (actividad.tiempo_recurrencia >= 7 && actividad.tiempo_recurrencia % 7 === 0) {
          unidadTiempo = 'semanas';
          cantidadTiempo = actividad.tiempo_recurrencia / 7;
        }

    const titlePrefix = isStart ? '🟢 Inicio de Actividad' : 
                       isEnd ? '🔴 Fin de Actividad' : 'Detalles de Actividad';
    
    const getActionButtons = () => {
      let editarButton = false;
      if ((actividad.estado === 'Pendiente' || actividad.estado === 'enProceso') && permisoEditarActividad) {
         editarButton = true
      } 

      if ((actividad.estado === 'Pendiente' || actividad.estado === 'enProceso') && permisoEjecutarActividad) {
        return {
          showDenyButton: true,
          denyButtonText: 'Ejecutar',
          showConfirmButton: editarButton,
          confirmButtonText: 'Editar',
          cancelButtonText: 'Cerrar'
        };
      } else if (actividad.estado === 'Realizado' && permisoVerResumenActividad) {
        return {
          showDenyButton: true,
          denyButtonText: 'Ver resumen',
          showConfirmButton: editarButton,
          confirmButtonText: 'Editar',
          cancelButtonText: 'Cerrar'
        };
      } 
      return {
        showConfirmButton: false,
        cancelButtonText: 'Cerrar'
      };
    };
  
    function formatFecha(fecha: string): string {
      const partes = fecha.split('-'); // Divide el string "YYYY-MM-DD"
      const fechaCorrecta = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2])); // Año, Mes (0-indexado), Día
      return fechaCorrecta.toLocaleDateString('es-ES', { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });
    }  
  
    Swal.fire({
      title: titlePrefix,
      html: `
      ${permisoVerActividad ? `
        <div class="swal-form-container">
          <div class="swal-form-item">
            <strong>Tipo:</strong> ${actividad.tipo_actividad}
          </div>
          <div class="swal-form-item">
          <strong>Responsable:</strong> ${usuario ? usuario.nombre : 'No asignado'}
          </div>
          <div class="swal-form-item">
              <strong>Fecha Inicio:</strong> ${formatFecha(actividad.fecha_inicio)}
          </div>
          <div class="swal-form-item">
              <strong>Fecha Fin:</strong> ${formatFecha(actividad.fecha_final)}
          </div>
          <div class="swal-form-item">
            <strong>Observaciones:</strong> ${actividad.observaciones}
          </div>
          <div class="swal-form-item">
            <strong>Recurrente:</strong> ${actividad.es_recurrente ? 'Sí' : 'No'}
          </div>
          ${actividad.es_recurrente ? `
          <div class="swal-form-item">
            <strong>Tiempo de recurrencia:</strong> ${cantidadTiempo} ${unidadTiempo}
          </div>` : ''}
          <div class="swal-form-item">
            <strong>Estado:</strong> ${actividad.estado}
          </div>
        </div>
      ` : ''} 
      `,
      showCancelButton: true,
      ...getActionButtons(),
      customClass: {
        container: 'custom-swal-container',
        popup: 'custom-swal-popup',
        htmlContainer: 'custom-swal-html-container',
        actions: 'custom-swal-actions',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button'
      }
    }).then((result) => {
      
      if (result.isConfirmed) {
        this.editarActividad(actividad);
      } else if (result.isDenied) {
        let tipoCheckRecurrente = ''
        if (actividad.es_recurrente) {
          tipoCheckRecurrente = 'Preventivo';
        } else {
          tipoCheckRecurrente = 'Correctivo'
        }
        
        const navigationExtras: NavigationExtras = {
          state:{
            id_inspeccion: actividad.id_inspeccion,
            id_mantenimiento: actividad.id_mantenimiento,
            id_supervision: actividad.id_supervision,
            id_calendarizacion: actividad.id,
            id_usuario: actividad.id_usuario,
            tipo: tipoCheckRecurrente,
            pasoActividad: actividad.pasoActividad,
            observaciones: actividad.observaciones
          }
        }
        
        
        if (actividad.estado === 'Pendiente' || actividad.estado === 'enProceso') {
          switch (actividad.tipo_actividad) {
            //INSPECCIONES -----------------------------------------------------------------------------------
            case 'Inspección a infraestructura':
              this.router.navigate(['/inspecciones/infraestructura/crear'], navigationExtras)
              break;
            case 'Inspección a equipo':
              this.router.navigate(['/inspecciones/equipos/crear'], navigationExtras)
              break;
            //MANTENIMIENTOS -----------------------------------------------------------------------------------
            case 'Mantenimiento a infraestructura':
              this.router.navigate(['/mantenimientos/infraestructura/crear'], navigationExtras)
              break;
            case 'Mantenimiento a equipo':
              this.router.navigate(['/mantenimientos/equipos/crear'], navigationExtras)
              break;
            case 'Mantenimiento externo':
              this.router.navigate(['/mantenimientos/externo/crear'], navigationExtras)
              break;
            //supervisiones -----------------------------------------------------------------------------------
            case 'Supervisión a infraestructura':
              this.router.navigate(['/supervisiones/infraestructura/crear'], navigationExtras)
              break;
            case 'Supervisión a equipo':
              this.router.navigate(['/supervisiones/equipos/crear'], navigationExtras)
              break;
          }
        } else if (actividad.estado === 'Realizado') {
          // Redirigir según el tipo de actividad
          switch (actividad.tipo_actividad) {
          //INSPECCIONES -----------------------------------------------------------------------------------
            case 'Inspección a infraestructura':
              this.router.navigateByUrl('/inspecciones/infraestructura', navigationExtras);
              break;
            case 'Inspección a equipo':
                this.router.navigateByUrl('/inspecciones/equipos', navigationExtras);
              break;
          //MANTENIMIENTOS -----------------------------------------------------------------------------------
          case 'Mantenimiento a infraestructura':
              this.router.navigate(['/mantenimientos/infraestructura'], navigationExtras)
              break;
          case 'Mantenimiento a equipo':
              this.router.navigate(['/mantenimientos/equipos'], navigationExtras)
            break;
          case 'Mantenimiento externo':
              this.router.navigate(['/mantenimientos/externo'], navigationExtras)
            break;
          //supervisiones -----------------------------------------------------------------------------------
          case 'Supervisión a infraestructura':
              this.router.navigate(['/supervisiones/infraestructura'], navigationExtras)
              break;
          case 'Supervisión a equipo':
              this.router.navigate(['/supervisiones/equipos'], navigationExtras)
            break;
          }
        }
      } 
    });
  }
  }
  
  private editarActividad(actividad: Actividad): void {
    // Calcular la unidad de tiempo y cantidad basada en los días almacenados
    let unidadTiempo = 'dias';
    let cantidadTiempo = actividad.tiempo_recurrencia;
    
    if (actividad.tiempo_recurrencia >= 365 && actividad.tiempo_recurrencia % 365 === 0) {
      unidadTiempo = 'años';
      cantidadTiempo = actividad.tiempo_recurrencia / 365;
    } else if (actividad.tiempo_recurrencia >= 30 && actividad.tiempo_recurrencia % 30 === 0) {
      unidadTiempo = 'meses';
      cantidadTiempo = actividad.tiempo_recurrencia / 30;
    } else if (actividad.tiempo_recurrencia >= 7 && actividad.tiempo_recurrencia % 7 === 0) {
      unidadTiempo = 'semanas';
      cantidadTiempo = actividad.tiempo_recurrencia / 7;
    }
  
    Swal.fire({
      title: 'Editar actividad',
      html: `
        <div class="swal-form-container">
          <div class="swal-form-item">
            <label for="tipo_actividad">Tipo de Actividad</label>
            <select id="tipo_actividad" class="swal2-select">
              ${this.tipos_actividad.map(tipo => 
                `<option value="${tipo}" ${tipo === actividad.tipo_actividad ? 'selected' : ''}>${tipo}</option>`
              ).join('')}
            </select>
          </div>
          <div class="swal-form-item">
            <label for="fecha_inicio">Fecha Inicio</label>
            <input id="fecha_inicio" type="date" class="swal2-input" value="${actividad.fecha_inicio}" 
                   min="${new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}">
          </div>
          <div class="swal-form-item">
            <label for="fecha_fin">Fecha Fin</label>
            <input id="fecha_fin" type="date" class="swal2-input" value="${actividad.fecha_final}"
                   min="${new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}">
          </div>
          <div class="swal-form-item">
            <label for="observaciones">Observaciones</label>
            <textarea id="observaciones" class="swal2-textarea">${actividad.observaciones}</textarea>
          </div>
          <div class="swal-form-item">
            <label for="id_usuario">Responsable</label>
            <select id="id_usuario" class="swal2-select">
              ${this.usuarios.map(usuario => 
                `<option value="${usuario.id}" ${usuario.id === actividad.id_usuario ? 'selected' : ''}>${usuario.nombre}</option>`
              ).join('')}
            </select>
          </div>
          <div class="swal-form-item checkbox-container hidden">
              <label for="es_recurrente" class="checkbox-label">
                <input id="es_recurrente" type="checkbox" class="swal2-checkbox" ${actividad.es_recurrente ? 'checked' : ''} onchange="toggleRecurrencia()">
                Es recurrente
              </label>
          </div>

          <style>
          .hidden {
              display: none;
          }
          </style>
          </div>
          <div id="recurrencia-container" style="display: ${actividad.es_recurrente ? 'block' : 'none'}">
            <div class="swal-form-item">
              <label for="unidad_recurrencia">Unidad de tiempo</label>
              <select id="unidad_recurrencia" class="swal2-select">
                <option value="dias" ${unidadTiempo === 'dias' ? 'selected' : ''}>Días</option>
                <option value="semanas" ${unidadTiempo === 'semanas' ? 'selected' : ''}>Semanas</option>
                <option value="meses" ${unidadTiempo === 'meses' ? 'selected' : ''}>Meses</option>
                <option value="años" ${unidadTiempo === 'años' ? 'selected' : ''}>Años</option>
              </select>
            </div>
            <div class="swal-form-item">
              <label for="tiempo_recurrencia">Tiempo de recurrencia</label>
              <input id="tiempo_recurrencia" type="number" class="swal2-input" 
                placeholder="Cantidad" min="1" value="${cantidadTiempo}">
            </div>
          </div>
        </div>
      `,
      didOpen: () => {
        // Agregar la función toggleRecurrencia al scope global
        (window as any).toggleRecurrencia = () => {
          const checkbox = document.getElementById('es_recurrente') as HTMLInputElement;
          const recurrenciaContainer = document.getElementById('recurrencia-container');
          const tiempoRecurrencia = document.getElementById('tiempo_recurrencia') as HTMLInputElement;
          
          if (recurrenciaContainer) {
            recurrenciaContainer.style.display = checkbox.checked ? 'block' : 'none';
            if (checkbox.checked) {
              tiempoRecurrencia.value = tiempoRecurrencia.value === '0' ? '1' : tiempoRecurrencia.value;
              tiempoRecurrencia.min = '1';
            } else {
              tiempoRecurrencia.value = '0';
            }
          }
        };
      },
      willClose: () => {
        delete (window as any).toggleRecurrencia;
      },
      showCancelButton: true,      
      showDenyButton: true,
      confirmButtonText: 'Actualizar',
      denyButtonText: 'Anular',
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
        const checkbox = document.getElementById('es_recurrente') as HTMLInputElement;
        const tiempoRecurrenciaInput = document.getElementById('tiempo_recurrencia') as HTMLInputElement;
        
        if (checkbox.checked && (!tiempoRecurrenciaInput.value || parseInt(tiempoRecurrenciaInput.value) < 1)) {
          Swal.showValidationMessage('El tiempo de recurrencia debe ser mayor a 0');
          return false;
        }
  
        const cantidad = checkbox.checked ? 
          parseInt(tiempoRecurrenciaInput.value || '1') : 0;
        const unidad = checkbox.checked ? 
          (document.getElementById('unidad_recurrencia') as HTMLSelectElement).value : 'dias';
  
        const horas = checkbox.checked ? 
          cantidad * (unidad === 'dias' ? 1 : unidad === 'semanas' ? 7 : unidad === 'meses' ? 30 : 365) : 0;
  
        return {
          tipo_actividad: (document.getElementById('tipo_actividad') as HTMLSelectElement).value,
          fecha_inicio: (document.getElementById('fecha_inicio') as HTMLInputElement).value,
          fecha_final: (document.getElementById('fecha_fin') as HTMLInputElement).value,
          observaciones: (document.getElementById('observaciones') as HTMLTextAreaElement).value,
          id_usuario: parseInt((document.getElementById('id_usuario') as HTMLSelectElement).value),
          es_recurrente: checkbox.checked,
          tiempo_recurrencia: horas
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const actividadActualizada: Actividad = {
          ...actividad,
          ...result.value
        };
  
        this.calendarizacionService.actualizarActividad(actividad.id!, actividadActualizada).subscribe(
          (response) => {
            this.refreshCalendar();
            Swal.fire('¡Éxito!', 'Actividad actualizada correctamente', 'success');
          },
          (error) => {
            console.log(error);
            let errorMessage = 'Ha ocurrido un error al actualizar la actividad: \n';
  
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
      }else if (result.isDenied) {
        Swal.fire({
          title: '¿Estás seguro de anular esta actividad?',
          text: 'Esta acción no se podrá deshacer.',
          icon: 'warning',
          showCancelButton: true,
          showDenyButton: true,
          showConfirmButton: false,
          denyButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          customClass: {
            container: 'custom-swal-container',
            popup: 'custom-swal-popup',
            htmlContainer: 'custom-swal-html-container',
            actions: 'custom-swal-actions',
            confirmButton: 'custom-swal-confirm-button',
            cancelButton: 'custom-swal-cancel-button'
          },
        }).then((result) => {
          if (result.isDenied) {
            this.calendarizacionService.cambiarEstado(actividad.id!).subscribe(
              (response) => {
                this.refreshCalendar();
                Swal.fire('¡Éxito!', 'Actividad anulada correctamente', 'success');
              },
              (error) => {
                console.log(error);
                let errorMessage = 'Ha ocurrido un error al anular la actividad: \n';
      
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
    });
  }


  private refreshCalendar(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.refetchEvents();
  }

  isTouchDevice() {
    return (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      ((navigator as any).msMaxTouchPoints > 0));
  }

  ngOnDestroy() {
    // Limpiamos el listener global al destruir el componente
    document.removeEventListener('click', this.handleGlobalClick.bind(this));
  }

}
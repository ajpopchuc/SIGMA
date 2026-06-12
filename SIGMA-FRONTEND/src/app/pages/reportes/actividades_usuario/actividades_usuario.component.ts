// tableroPresupuesto.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReporteService } from './actividades_usuario.service';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { PermisosService } from '../../../service/permisos.service';  

declare var $: any;  // Para usar jQuery en este archivo
declare var moment: any;

@Component({
  selector: 'app-actividades-usuario',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    NgxPaginationModule
  ],
  templateUrl: './actividades_usuario.component.html',
  styleUrls: ['./actividades_usuario.component.scss']
})
export class ReporteActividadesUsuarioComponent implements OnInit {
  usuarios: any[] = [];
  actividades: any[] = [];
  usuarioSeleccionado: number = 0;
  usuarioSeleccionadoInfo: { id: number, nombre: string } = { id: 0, nombre: '' };
  tipoActividad: string = 'todos';
  fechaSeleccionada: string = '';
  isLoading: boolean = false;
  totalActividades: number = 0;

  constructor(
    private service: ReporteService,
    public servicePermiso: PermisosService,
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.initializeDateRangePicker();
  }

  // Modificamos el método de selección de usuario
  onUsuarioChange(event: any): void {
    const selectedId = parseInt(event.target.value);
    const usuario = this.usuarios.find(u => u.id === selectedId);
    if (usuario) {
      this.usuarioSeleccionadoInfo = {
        id: usuario.id,
        nombre: usuario.usuario
      };
      this.usuarioSeleccionado = selectedId;
    } else {
      this.usuarioSeleccionadoInfo = { id: 0, nombre: '' };
      this.usuarioSeleccionado = 0;
    }
  }

  cargarUsuarios(): void {
    this.service.getUsuarios().subscribe(
      (response) => {
        this.usuarios = response;
      },
      (error) => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los usuarios'
        });
      }
    );
  }

  initializeDateRangePicker() {
    moment.locale('es');
    
    $('#kt_daterangepicker_6').daterangepicker({
      buttonClasses: 'btn',
      applyClass: 'btn-primary',
      cancelClass: 'btn-secondary',
      startDate: moment(),
      endDate: moment(),
      locale: {
        format: 'DD/MM/YYYY',
        separator: ' - ',
        applyLabel: 'Aplicar',
        cancelLabel: 'Cancelar',
        customRangeLabel: 'Rango Personalizado',
        daysOfWeek: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
      },
      ranges: {
        'Hoy': [moment(), moment()],
        'Ayer': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Últimos 7 días': [moment().subtract(6, 'days'), moment()],
        'Últimos 30 días': [moment().subtract(29, 'days'), moment()],
        'Este mes': [moment().startOf('month'), moment().endOf('month')],
        'Mes anterior': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    }, (start: any, end: any) => {
      this.fechaSeleccionada = start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY');
    });

    this.fechaSeleccionada = moment().format('DD/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
  }

  loadActividades(): void {
    if (!this.usuarioSeleccionado) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Por favor seleccione un usuario'
      });
      return;
    }

    const button = document.querySelector('button.btn-primary') as HTMLButtonElement;
    if (button) button.disabled = true;

    Swal.fire({
      title: 'Cargando...',
      text: 'Por favor espere mientras se obtienen los datos',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const fecha = this.fechaSeleccionada;
    const fechas = fecha.split(' - ');
    const fechaInicio = fechas[0];
    const fechaFin = fechas[1];
    const fechaInicioFormato = fechaInicio.split('/').reverse().join('-');
    const fechaFinFormato = fechaFin.split('/').reverse().join('-');

    this.service.getActividades(
      this.usuarioSeleccionado,
      this.tipoActividad,
      fechaInicioFormato,
      fechaFinFormato
    ).subscribe(
      (response) => {
        this.actividades = response.data;
        this.calculateTotalActividades();
        if (button) button.disabled = false;
        Swal.close();
      },
      (error) => {
        console.error(error);
        if (button) button.disabled = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al cargar los datos'
        });
      }
    );
  }

  calculateTotalActividades(): void {
    this.totalActividades = this.actividades.reduce((sum, actividad) => sum + actividad.total, 0);
  }

  printReport(): void {
    const fecha = this.fechaSeleccionada;
    const printContents = document.getElementById('detalle-reporte')?.innerHTML;

    if (printContents) {
      const nombreUsuario = localStorage.getItem('nombre_usuario') || 'Usuario desconocido';
      const fechaActual = new Date().toLocaleDateString();
      
      // Aseguramos que tenemos el nombre del usuario actualizado
      const usuarioActual = this.usuarios.find(u => u.id === this.usuarioSeleccionado);
      const nombreUsuarioSeleccionado = usuarioActual ? usuarioActual.usuario : 'No especificado';

      const originalContents = document.body.innerHTML;
      document.body.innerHTML = `
        <style>
          @media print {
            body {
              font-family: Arial, sans-serif;
              color: #000;
              margin: 0;
              padding: 20px;
              background: none;
            }

            @page {
              margin: 2cm;
              size: letter portrait;
            }

            .report-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #198754;
            }

            .report-header img {
              max-height: 100px;
              margin-bottom: 15px;
            }

            .report-header h2 {
              color: #198754;
              margin: 10px 0;
              font-size: 24px;
              font-weight: bold;
            }

            .report-metadata {
              margin: 15px 0;
              font-size: 14px;
              color: #666;
            }

            .user-info {
              text-align: right;
              margin-bottom: 20px;
              font-size: 12px;
              color: #666;
            }

            .expenses-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              page-break-inside: auto;
            }

            .expenses-table tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            .expenses-table th {
              background-color: #198754 !important;
              color: white;
              padding: 12px;
              font-weight: bold;
              border: 1px solid #198754;
              font-size: 14px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .expenses-table td {
              padding: 10px;
              border: 1px solid #198754;
              font-size: 12px;
            }

            .total-row {
              background-color: #f8f9fa !important;
              font-weight: bold;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .page-break {
              page-break-before: always;
            }

            .no-print {
              display: none;
            }
          }
        </style>

        <div class="report-header">
          <img src="/assets/media/imagenes/Logo-Meso-Color.png" alt="SIGMA Logo"/>
          <h2>SIGMA</h2>
          <div class="report-metadata">
            <strong>Reporte de actividades por usuario</strong><br>
            <strong>Usuario:</strong> ${nombreUsuarioSeleccionado}<br>
            <strong>Período:</strong> ${fecha}
          </div>
          <div class="user-info">
            <strong>Generado por:</strong> ${nombreUsuario}<br>
            <strong>Fecha de generación:</strong> ${fechaActual}
          </div>
        </div>
        ${printContents}
      `;

      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  }
}

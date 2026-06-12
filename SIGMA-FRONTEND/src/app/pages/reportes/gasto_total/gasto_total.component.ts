// tableroPresupuesto.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReporteService } from './gasto_total.service';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { PermisosService } from '../../../service/permisos.service';

declare var $: any;  // Para usar jQuery en este archivo
declare var moment: any;

@Component({
  selector: 'app-gasto_total',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    NgxPaginationModule
  ],
  templateUrl: './gasto_total.component.html',
  styleUrls: ['./gasto_total.component.scss']
})
export class ReporteGastoTotalComponent implements OnInit {
  reportes: any[] = [];
  tipoReporte: string = 'Todos';
  fechaSeleccionada: string = "";
  reportesPorArea: Array<{ area: string, reportes: any[], totalArea: number }> = [];
  totalGeneral: number = 0;
  selectedReportType: string = 'Todos';
  isLoading: boolean = false;
  constructor(
    private service: ReporteService,
    public servicePermiso: PermisosService,
  ) {}

  ngOnInit(): void {
    this.initializeDateRangePicker();
  }

  initializeDateRangePicker() {
    moment.locale('es'); 
  
    // Configura el rango de fechas
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
        'Mes anterior': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
        'Este semestre': [this.getSemesterDates().start, this.getSemesterDates().end],
        'Este año': [moment().startOf('year'), moment().endOf('year')]
      }
    }, (start: any, end: any) => {
      this.fechaSeleccionada = start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY');
    });
  
    this.fechaSeleccionada = moment().format('DD/MM/YYYY') + ' - ' + moment().format('DD/MM/YYYY');
  }
  
  
  getSemesterDates() {
    const currentMonth = moment().month();
    let start, end;

    if (currentMonth < 6) {
      start = moment().startOf('year');
      end = moment().month(5).endOf('month');  
    } else {
      start = moment().month(6).startOf('month'); 
      end = moment().endOf('year');
    }
    return { start, end };
  }
  
  
  loadReportes(): void {
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

    this.selectedReportType = this.tipoReporte;
    const fecha = this.fechaSeleccionada;
    const fechas = fecha.split(' - ');
    const fechaInicio = fechas[0];
    const fechaFin = fechas[1];
    const fechaInicioFormato = fechaInicio.split('/').reverse().join('-');
    const fechaFinFormato = fechaFin.split('/').reverse().join('-');
    
    this.service.getReportes(fechaInicioFormato, fechaFinFormato, this.tipoReporte).subscribe(
      (response) => {
        this.reportes = response;
        if (this.selectedReportType === 'Todos') {
          this.groupReportesPorArea();
        } else {
          this.totalGeneral = this.reportes.reduce(
            (sum, reporte) => sum + Number(reporte.total) || 0,
            0
          );
        }
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

  get totalGeneralFormatted(): string {
    return Number.isFinite(this.totalGeneral) ? this.totalGeneral.toFixed(2) : '0.00';
  }
  
  groupReportesPorArea(): void {
    this.reportesPorArea = [];
    this.totalGeneral = 0;
  
    const areaMap = new Map<string, { reportes: any[], totalArea: number }>();
  
    this.reportes.forEach((reporte) => {
      const area = reporte.area;
      if (!areaMap.has(area)) {
        areaMap.set(area, { reportes: [], totalArea: 0 });
      }
      const areaData = areaMap.get(area)!;
      areaData.reportes.push(reporte);
  
      const totalNumerico = Number(reporte.total) || 0;
      areaData.totalArea += totalNumerico;
      this.totalGeneral += totalNumerico;
    });
  
    this.reportesPorArea = Array.from(areaMap.entries()).map(([area, data]) => ({
      area,
      reportes: data.reportes,
      totalArea: data.totalArea 
    }));
  }
  
  

  printReport(): void {
    const fecha = this.fechaSeleccionada;
    const printContents = document.getElementById('detalle-reporte')?.innerHTML;
  
    if (printContents) {
      const nombreUsuario = localStorage.getItem('nombre_usuario') || 'Usuario desconocido';
      const fechaActual = new Date().toLocaleDateString();
  
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

            .area-header {
              background-color: #e9f5eb !important;
              font-weight: bold;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .total-row {
              background-color: #f8f9fa !important;
              font-weight: bold;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .total-general {
              margin-top: 20px;
              padding: 15px;
              border: 2px solid #198754;
              text-align: right;
              font-size: 16px;
              font-weight: bold;
              background-color: #e9f5eb !important;
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
            <strong>Reporte de Gastos Totales</strong><br>
            Período: ${fecha}
          </div>
          <div class="user-info">
            Generado por: ${nombreUsuario}<br>
            Fecha de generación: ${fechaActual}
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

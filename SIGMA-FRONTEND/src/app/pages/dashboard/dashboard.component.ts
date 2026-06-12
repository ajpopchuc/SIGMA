import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras, RouterModule} from '@angular/router';
import Chart from 'chart.js/auto';
import { DashboardService } from './dashboard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
declare var $: any;  // Para usar jQuery en este archivo
declare var moment: any;
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, NgxPaginationModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  fechaSeleccionada: string = '';


  totalInspecciones: any[] = [];
  totalGraficaLinea: any;
  inspeccioneCorrectivosInfraestructura: any;
  inspeccioneCorrectivosEquipos: any;
  inspeccionePreventivosInfraestructura: any;
  inspeccionePreventivosEquipos: any;
  totalInspeccionesCorrectivos: any;
  totalInspeccionesPreventivos: any;


  totalMantenimiento: any[] = [];
  totalGraficaLineaMantenimiento: any;
  mantenimientoCorrectivosInfraestructura: any;
  mantenimientoCorrectivosEquipos: any;
  mantenimientoCorrectivosExternos: any;
  mantenimientoPreventivosInfraestructura: any;
  mantenimientoPreventivosEquipos: any;
  mantenimientoPreventivosExternos: any;
  mantenimientoCorrectivos: any;
  mantenimientoPreventivos: any;

  totalSupervisiones: any[] = [];
  totalGraficaLineaSupervision: any;
  supervisionesEquipos: any;
  supervisionesInfraestructura: any;

  // Add chart instance properties
  private lineChart: Chart | undefined;
  private barInspeccionesChart: Chart | undefined;
  private pieInspeccionesChart: Chart<'pie', number[], unknown> | undefined;
  private barMantenimientosChart: Chart | undefined;
  private pieMantenimientosChart: Chart<'pie', any[], string> | undefined;
  private pieSupervisionesChart: Chart<'pie', number[], unknown> | undefined;


  constructor(private http: HttpClient,
    private dashboardService: DashboardService,
  ) {}
  
  async ngOnInit() {
    await this.initializeDateRangePicker();
    await this.cargarEstadisticas();
  }
  


  initializeDateRangePicker(): Promise<void> {
    return new Promise((resolve) => {
      moment.locale('es');
      
      $('#kt_daterangepicker_6').daterangepicker({
        buttonClasses: 'btn',
        applyClass: 'btn-primary',
        cancelClass: 'btn-secondary',
        startDate: moment().startOf('month'),
        endDate: moment().endOf('month'),
        ranges: {
          'Este Mes': [moment().startOf('month'), moment().endOf('month')],
          'Mes Anterior': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
          'Últimos 3 Meses': [moment().subtract(2, 'month').startOf('month'), moment().endOf('month')],
          'Este Año': [moment().startOf('year'), moment().endOf('year')]
        },
        locale: {
          format: 'DD/MM/YYYY',
          separator: ' - ',
          applyLabel: 'Aplicar',
          cancelLabel: 'Cancelar',
          customRangeLabel: 'Rango Personalizado',
          daysOfWeek: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
          monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
        }
      }, (start: any, end: any) => {
        this.fechaSeleccionada = start.format('DD/MM/YYYY') + ' - ' + end.format('DD/MM/YYYY');
      });
  
      this.fechaSeleccionada = moment().startOf('month').format('DD/MM/YYYY') + ' - ' + moment().endOf('month').format('DD/MM/YYYY');
      resolve();
    });
  }

  initializeCharts() {
    this.graficaLineasInspecciones();
    this.graficaBarrasInspecciones();
    this.graficaPieInspeeciones();
    this.graficaBarrasMantenimientos();
    this.graficaPieMantenimientos();
    this.graficaPieSupervisiones();
  }

  graficaLineasInspecciones() {
    const ctx = document.getElementById('graficaLineaInspecciones') as HTMLCanvasElement;
    
    // Destroy existing chart if it exists
    if (this.lineChart) {
      this.lineChart.destroy();
    }

    interface DailyData {
      dia: string;
      total: number;
    }

    interface ChartDataset {
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
    }

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.totalInspecciones?.map((inspeccion: DailyData) => inspeccion.dia),
        datasets: [{
          label: 'Inspecciones ' + this.totalGraficaLinea,
          data: this.totalInspecciones?.map((inspeccion: DailyData) => inspeccion.total),
          borderColor: 'rgb(0, 0, 255)',
          tension: 0.1
        } as ChartDataset,
        {
          label: 'Mantenimientos ' + this.totalMantenimiento,
          data: this.totalGraficaLineaMantenimiento?.map((mantenimiento: DailyData) => mantenimiento.total),
          borderColor: 'rgb(0, 255, 0)',
          tension: 0.1
        } as ChartDataset,
        {
          label: 'Supervisiones ' + this.totalSupervisiones,
          data: this.totalGraficaLineaSupervision?.map((superviciones: DailyData) => superviciones.total),
          borderColor: 'rgb(255, 0, 0)',
          tension: 0.1
        } as ChartDataset]
      }
    });
  }

  graficaBarrasInspecciones() {
    const ctx = document.getElementById('graficaBarrasInspecciones') as HTMLCanvasElement;
    
    // Destroy existing chart if it exists
    if (this.barInspeccionesChart) {
      this.barInspeccionesChart.destroy();
    }

    this.barInspeccionesChart = new Chart(ctx, {
      type: 'bar',
      data: {
      labels: ['Infraestructura', 'Equipos'],
      datasets: [
        {
        label: 'Correctivos',
        data: [this.inspeccioneCorrectivosInfraestructura, this.inspeccioneCorrectivosEquipos],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        },
        {
        label: 'Preventivos',
        data: [this.inspeccionePreventivosInfraestructura, this.inspeccionePreventivosEquipos],
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        }
      ]
      },
      options: {
      responsive: true,
      scales: {
        x: {
        stacked: true,
        },
        y: {
        stacked: true,
        beginAtZero: true
        }
      },
      plugins: {
        legend: {
        position: 'top',
        },
        title: {
        display: true
        }
      }
      }
    });
  }

  graficaPieInspeeciones() {
    const ctx = document.getElementById('graficaPieInspecciones') as HTMLCanvasElement;
    
    // Destroy existing chart if it exists
    if (this.pieInspeccionesChart) {
      this.pieInspeccionesChart.destroy();
    }

    this.pieInspeccionesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Preventivo', 'Correctivo'],
        datasets: [{
          data: [this.totalInspeccionesPreventivos, this.totalInspeccionesCorrectivos],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            align: 'center'
          }
        }
      }
    });
  }

  graficaBarrasMantenimientos(){
    const ctx = document.getElementById('graficaBarrasMantenimientos') as HTMLCanvasElement;
    
    // Destroy existing chart if it exists
    if (this.barMantenimientosChart) {
      this.barMantenimientosChart.destroy();
    }

    this.barMantenimientosChart = new Chart(ctx, {
      type: 'bar',
      data: {
      labels: ['Infraestructura', 'Equipos', 'Externos'],
      datasets: [
        {
        label: 'Correctivos',
        data: [this.mantenimientoCorrectivosInfraestructura, this.mantenimientoCorrectivosEquipos, this.mantenimientoCorrectivosExternos],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        },
        {
        label: 'Preventivos',
        data: [this.mantenimientoPreventivosInfraestructura, this.mantenimientoPreventivosEquipos, this.mantenimientoPreventivosExternos],
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        }
      ]
      },
      options: {
      responsive: true,
      scales: {
        x: {
        stacked: true,
        },
        y: {
        stacked: true,
        beginAtZero: true
        }
      },
      plugins: {
        legend: {
        position: 'top',
        },
        title: {
        display: true
        }
      }
      }
    });
  }
  
  graficaPieMantenimientos() {
    const ctx = document.getElementById('graficaPieMantenimientos') as HTMLCanvasElement;
    
    // Destroy existing chart if it exists
    if (this.pieMantenimientosChart) {
      this.pieMantenimientosChart.destroy();
    }

    this.pieMantenimientosChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Preventivo', 'Correctivo'],
        datasets: [{
          data: [this.mantenimientoPreventivos, this.mantenimientoCorrectivos],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            align: 'center'
          }
        }
      }
    });
  }
  graficaPieSupervisiones() {
    const ctx = document.getElementById('graficaPieSupervisiones') as HTMLCanvasElement;
    
    // Destroy existing chart if it exists
    if (this.pieSupervisionesChart) {
      this.pieSupervisionesChart.destroy();
    }

    this.pieSupervisionesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Infraestructura', 'Equipos'],
        datasets: [{
          data: [this.supervisionesInfraestructura, this.supervisionesEquipos],
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            align: 'center'
          }
        }
      }
    });
  }

  getTableroInspecciones(fechaInicio?: string, fechaFin?: string){
    return new Promise<void>((resolve) => {
      this.dashboardService.getTableroInspecciones(fechaInicio, fechaFin).subscribe((response) => {
        this.totalGraficaLinea = response.data.total;
        this.totalInspecciones = response.data.por_dia;
        this.inspeccioneCorrectivosInfraestructura = response.data.tipo.infraestructura.Correctivo;
        this.inspeccionePreventivosInfraestructura = response.data.tipo.infraestructura.Preventivo;
        this.inspeccioneCorrectivosEquipos = response.data.tipo.equipos.Correctivo;
        this.inspeccionePreventivosEquipos = response.data.tipo.equipos.Preventivo;
        this.totalInspeccionesCorrectivos = response.data.motivo.Correctivo;
        this.totalInspeccionesPreventivos = response.data.motivo.Preventivo;
        resolve();
      });
    });
  }

  getTableroMantenimientos(fechaInicio?: string, fechaFin?: string) {
    return new Promise<void>((resolve) => {
      this.dashboardService.getTableroMantenimientos(fechaInicio, fechaFin).subscribe((response) => {
        this.totalMantenimiento = response.data.total;
        this.totalGraficaLineaMantenimiento = response.data.por_dia;
        this.mantenimientoCorrectivosInfraestructura = response.data.tipo.infraestructura.Correctivo;
        this.mantenimientoPreventivosInfraestructura = response.data.tipo.infraestructura.Preventivo;

        this.mantenimientoCorrectivosEquipos = response.data.tipo.equipos.Correctivo;
        this.mantenimientoPreventivosEquipos = response.data.tipo.equipos.Preventivo;

        this.mantenimientoCorrectivosExternos = response.data.tipo.externos.Correctivo;
        this.mantenimientoPreventivosExternos = response.data.tipo.externos.Preventivo;
        
        this.mantenimientoCorrectivos = response.data.motivo.Correctivo;
        this.mantenimientoPreventivos = response.data.motivo.Preventivo;
        resolve();
      });
    });
  }

  getTableroSupervisiones(fechaInicio?: string, fechaFin?: string) {
    return new Promise<void>((resolve) => {
      this.dashboardService.getTableroSupervisiones(fechaInicio, fechaFin).subscribe((response) => {
        this.totalGraficaLineaSupervision = response.data.por_dia;
        this.totalSupervisiones = response.data.total;
        this.supervisionesEquipos = response.data.tipo.equipos.total;
        this.supervisionesInfraestructura = response.data.tipo.infraestructura.total;
        resolve();
      });
    });
  }

  downloadChart(canvasId: string, fileName: string) {
    const originalCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const titleElement = originalCanvas.closest('.card-body')?.querySelector('.card-title') as HTMLElement;
    const chartTitle = titleElement ? titleElement.textContent || '' : '';
    
    // Create a temporary canvas with padding
    const padding = 60; // Increased padding to accommodate title
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalCanvas.width + (padding * 2);
    tempCanvas.height = originalCanvas.height + (padding * 2);
    
    // Get context and fill white background
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      // Fill entire canvas with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw original canvas content with padding offset
      ctx.drawImage(originalCanvas, padding, padding);

      // Add date, username and title with adjusted positioning
      const currentDate = new Date().toLocaleString();
      const username = localStorage.getItem('nombre_usuario') || 'Usuario';
      
      ctx.font = '12px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      
      // Draw title centered at top
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(chartTitle, tempCanvas.width / 2, padding - 30);
      
      // Draw date and username
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${currentDate}`, padding, padding - 10);
  
      ctx.fillText(`${username}`, padding, padding - 25);
      ctx.fillText(`${this.fechaSeleccionada}`, padding, padding + 5); // 10px spacing after username// Positioned 25px below username
    }
    
    // Convert to image and download
    const image = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = fileName;
    link.href = image;
    link.click();
  }

  async cargarEstadisticas() {
    const [fechaInicio, fechaFin] = this.fechaSeleccionada.split(' - ')
      .map(fecha => fecha.split('/').reverse().join('-'));
    
    try {
      // Esperar a que todas las promesas se resuelvan
      await Promise.all([
        this.getTableroInspecciones(fechaInicio, fechaFin),
        this.getTableroMantenimientos(fechaInicio, fechaFin),
        this.getTableroSupervisiones(fechaInicio, fechaFin)
      ]);
  
      // Una vez que tengamos todos los datos, inicializamos las gráficas
      this.initializeCharts();
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }
}
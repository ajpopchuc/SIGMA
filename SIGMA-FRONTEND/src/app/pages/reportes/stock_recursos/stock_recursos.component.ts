// tableroPresupuesto.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReporteService } from './stock_recursos.service';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-stock_recursos',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    NgxPaginationModule
  ],
  templateUrl: './stock_recursos.component.html',
  styleUrls: ['./stock_recursos.component.scss']
})
export class StockRecursosComponent implements OnInit {
  reportes: any[] = [];
  totalGeneral: number = 0;
  isLoading: boolean = false;
  totalInventario: number = 0;
  constructor(
    private service: ReporteService,
    public servicePermiso: PermisosService,
  ) {}

  ngOnInit(): void {
    this.loadReportes();
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

    
    this.service.getReportes().subscribe(
      (response) => {
        this.reportes = response;
        // Compute totalInventario
        this.totalInventario = this.reportes.reduce((sum, reporte) => 
          sum + (reporte.existencias * reporte.precio), 0);
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

  

  printReport(): void {
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
            <strong>Reporte de stock</strong><br>
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

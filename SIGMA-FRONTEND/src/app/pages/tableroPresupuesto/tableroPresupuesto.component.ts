// tableroPresupuesto.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableroPresupuestoService } from './tableroPresupuesto.service';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { PermisosService } from '../../service/permisos.service';  

interface Presupuesto {
  id: number;
  area: string;
  monto_presupuesto: string;
  presupuesto_ejecutado: string;
  monto_pendiente: string;
}

interface Compra {
  id: number;
  serie_factura: string;
  no_factura: string;
  fecha_factura: string;
  total: string;
}

interface ComprasResponse {
  data: Compra[];
  total_compras: number;
}

@Component({
  selector: 'app-tablero-presupuesto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './tableroPresupuesto.component.html',
  styleUrls: ['./tableroPresupuesto.component.scss']
})
export class TableroPresupuestoComponent implements OnInit {
  presupuestos: Presupuesto[] = [];
  compras: Compra[] = [];
  currentPage: number = 1;
  selectedPresupuestoId: string = '';
  presupuestoActual: Presupuesto | null = null;

  constructor(private service: TableroPresupuestoService, public servicePermiso: PermisosService) {}

  ngOnInit(): void {
    this.loadPresupuestos();
  }

  loadPresupuestos(): void {
    this.service.getPresupuestosActivos().subscribe({
      next: (data: Presupuesto | Presupuesto[]) => {
        this.presupuestos = Array.isArray(data) ? data : [data];
      },
      error: (error) => {
        console.error('Error cargando presupuestos:', error);
      }
    });
  }

  onPresupuestoChange(): void {
    if (this.selectedPresupuestoId && this.selectedPresupuestoId !== '') {
      const presupuestoId = parseInt(this.selectedPresupuestoId, 10);
      this.presupuestoActual = this.presupuestos.find(p => p.id === presupuestoId) || null;
      
      if (presupuestoId) {
        this.loadCompras(presupuestoId);
      }
    } else {
      this.presupuestoActual = null;
      this.compras = [];
    }
  }

  loadCompras(presupuestoId: number): void {
    this.service.getComprasByPresupuesto(presupuestoId).subscribe({
      next: (response: ComprasResponse) => {
        this.compras = response.data;
      },
      error: (error) => {
        console.error('Error cargando compras:', error);
      }
    });
  }

  printReport(): void {
    const printContents = document.getElementById('detalle-compra')?.innerHTML;
    if (printContents) {
      const originalContents = document.body.innerHTML;
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('es-GT', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      const formattedTime = currentDate.toLocaleTimeString('es-GT');
      const userName = localStorage.getItem('nombre_usuario') || 'Usuario no identificado';

      document.body.innerHTML = `
        <style>
          @media print {
            .no-print {
              display: none !important;
            }
          }

          body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #e0f7e4, #b2dfb2);
            position: relative;
            min-height: 100vh;
          }

          .report-header {
            text-align: center;
            margin-bottom: 20px;
          }

          .report-header img {
            max-height: 150px;
          }

          .report-header h2 {
            color: black;
            margin: 5px 0;
            font-size: 24px;
          }

          .expenses-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          .expenses-table th, .expenses-table td {
            padding: 12px;
            border: 3px solid #198754;
          }

          .expenses-table th {
            background-color: #198754;
            color: #fff;
            font-weight: bold;
          }

          .expenses-table td {
            font-size: 16px;
            background-color: #e9f5eb;
          }

          .summary-section {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          }

          .summary-card {
            padding: 10px;
            border: 3px solid #198754;
            border-radius: 5px;
            background-color: #fff;
            text-align: center;
            width: 30%;
          }

          .summary-card .card-label {
            font-weight: bold;
            font-size: 18px;
          }

          .summary-card .amount {
            font-size: 22px;
            font-weight: bold;
            color: #333;
          }

          .summary-card.initial .card-label {
            color: #0d6efd;
          }

          .summary-card.spent .card-label {
            color: #dc3545;
          }

          .summary-card.pending .card-label {
            color: #198754;
          }

          .report-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 10px 20px;
            background-color: #f8f9fa;
            border-top: 1px solid #ddd;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .footer-item {
            margin: 0;
          }

          .report-content {
            margin-bottom: 60px;
          }
        </style>

        <div class="report-header">
          <img src="/assets/media/imagenes/Logo-Meso-Color.png" alt="SIGMA Logo"/>
          <h2>Sistema de Gestión SIGMA</h2>
          <p>Reporte de Presupuesto</p>
        </div>
        <div class="report-content">
          ${printContents}
        </div>
        <div class="report-footer">
          <span class="footer-item">Fecha: ${formattedDate}</span>
          <span class="footer-item">Hora: ${formattedTime}</span>
          <span class="footer-item">Generado por: ${userName}</span>
        </div>
      `;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  }
  
  
}
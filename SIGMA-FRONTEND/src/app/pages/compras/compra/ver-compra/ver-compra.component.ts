import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompraService } from '../compra.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';
import { PermisosService } from '../../../../service/permisos.service';  

interface DetalleCompra {
  id: number;
  id_recurso: number;
  nombre_recurso: string; // Añadido nuevo campo
  cantidad: number;
  unidad_medida: string;
  precio_unitario: string;
  total: string;
  id_compra: number;
  created_at: string;
  updated_at: string;
}

interface Compra {
  id: number;
  proveedor: string;
  total: string;
  fecha_factura: string;
  estado: string;
  area: string;
  no_factura: string;
  serie_factura: string;
  otras_compras: string;
  detalles: DetalleCompra[];
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-ver-compra',
  templateUrl: './ver-compra.component.html',
  styleUrls: ['./ver-compra.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class VerCompraComponent implements OnInit {
  detallesCompra?: Compra;

  constructor(
    private compraService: CompraService,
    private route: ActivatedRoute,
    private router: Router, 
    public servicePermiso: PermisosService
  ) {}

  ngOnInit(): void {
    const compraId = this.route.snapshot.paramMap.get('id');
    if (compraId) {
      this.compraService.getCompraById(parseInt(compraId, 10)).subscribe(
        (data) => {
          this.detallesCompra = data;
        },
        (error) => {
          console.error('Error al obtener detalles:', error);
          Swal.fire('Error', 'Compra no encontrada', 'error');
        }
      );
    } else {
      Swal.fire('Error', 'ID de compra no válido', 'error');
    }
  }

  imprimirDetalles(): void {
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
            }}
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


      </style>

      <div class="report-content">
          ${printContents}
        </div>

        <div class="report-footer">
          <span class="footer-item">Fecha de i: ${formattedDate}</span>
          <span class="footer-item">Hora: ${formattedTime}</span>
          <span class="footer-item">Generado por: ${userName}</span>
        </div>
      `;

      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Recarga la página para restaurar el contenido original
    }
  }

  cancelar(): void {
    this.router.navigate(['/compras']);
  }
}
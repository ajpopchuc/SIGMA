import { Component, OnInit } from '@angular/core';
import { CompraService } from './compra.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { PermisosService } from '../../../service/permisos.service';  

@Component({
  selector: 'app-compra',
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class CompraComponent implements OnInit {
  compras: any[] = [];
  filteredCompras: any[] = [];
  searchText: string = '';
  selectedStatus: string = 'Activo';

  constructor(private compraService: CompraService, private router: Router, public servicePermiso: PermisosService) {}

  ngOnInit(): void {
    this.fetchCompras();
  }

  fetchCompras(): void {
    const estado = this.selectedStatus === 'todos' ? '' : this.selectedStatus;
    this.compraService.getCompra(estado).subscribe(
      (data) => {
        this.compras = data.data;
        this.filteredCompras = this.compras;
        this.filterCompras();
      },
      (error) => {
        console.error('Error al obtener compras:', error);
      }
    );
  }

  filterCompras(): void {
    this.filteredCompras = this.compras.filter(compra => {
      const proveedor = compra.proveedor.toLowerCase();
      const total = compra.total.toString();
      const fecha = compra.fecha_factura.toLowerCase();
      const estado = compra.estado.toLowerCase();
      const area = compra.area.toLowerCase();
      const searchText = this.searchText.toLowerCase();

      return proveedor.includes(searchText) ||
        total.includes(searchText) ||
        fecha.includes(searchText) ||
        estado.includes(searchText) ||
        area.includes(searchText);
    });
  }

  onSearchTextChange(): void {
    this.filterCompras();
  }

  onStatusChange(): void {
    this.fetchCompras();
  }

  cancelCompra(id: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: "Esta acción cancelará la compra y actualizará el inventario",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, regresar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.compraService.cancelCompra(id).subscribe(
          (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Estado',
              text: 'Compra cancelada correctamente'
            });
            this.fetchCompras();
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.error.message || 'Error al cancelar la compra'
            });
          }
        );
      }
    });
  }

  viewCompra(compraId: number): void {
    this.router.navigate(['/compras', compraId]);
  }
}
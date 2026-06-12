import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { PresupuestoService } from './presupuesto.service';
import { PermisosService } from '../../service/permisos.service';

interface Presupuesto {
  id: number;
  monto_presupuesto: number; // Cambiado a number
  presupuesto_ejecutado: number; // Cambiado a number
  monto_pendiente: number; // Cambiado a number
  fecha_inicio: string;
  fecha_fin: string;
  area: string;
  periodo: string;
  estado: string;
}


@Component({
  selector: 'app-presupuesto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './presupuesto.component.html',
  styleUrls: ['./presupuesto.component.css']
})
export class PresupuestoComponent implements OnInit {
  presupuesto: Presupuesto[] = [];
  filteredPresupuestoList: Presupuesto[] = []; 
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; 
  itemsPerPage: number = 25; 

  constructor(private presupuestoService: PresupuestoService, private router: Router, public servicePermiso: PermisosService) {}

  ngOnInit(): void {
    this.fetchPresupuesto();
  }

  fetchPresupuesto(): void {
    this.presupuestoService.getPresupuesto().subscribe( 
      (data: Presupuesto[]) => {
        if (Array.isArray(data)) {
          this.presupuesto = data;
          this.filterPresupuestoList();
        } else {
          console.error('Unexpected data structure:', data);
          this.presupuesto = [];
        }
      },
      (error) => {
        console.error('Error fetching presupuesto:', error);
      }
    );
  }
  
  filterPresupuestoList(): void {
    this.filteredPresupuestoList = this.presupuesto.filter(presupuesto => {
      // Convertimos los valores numéricos a cadenas para poder aplicar includes()
      const matchesSearchText = 
        presupuesto.monto_presupuesto.toString().includes(this.searchText.toLowerCase()) || 
        presupuesto.presupuesto_ejecutado.toString().includes(this.searchText.toLowerCase()) ||
        presupuesto.monto_pendiente.toString().includes(this.searchText.toLowerCase()) || 
        presupuesto.fecha_inicio.toLowerCase().includes(this.searchText.toLowerCase()) ||
        presupuesto.fecha_fin.toLowerCase().includes(this.searchText.toLowerCase()) ||
        presupuesto.area.toLowerCase().includes(this.searchText.toLowerCase());
      
      // Verificamos el estado (se asegura que esté en minúsculas para una comparación correcta)
      const matchesStatus = this.selectedStatus === 'todos' || 
                            presupuesto.estado.toLowerCase() === this.selectedStatus.toLowerCase();
  
      return matchesSearchText && matchesStatus;
    });
    this.currentPage = 1;  
  }
  
  
  onSearchTextChange(): void {
    this.filterPresupuestoList();
  }

  onStatusChange(): void {
    this.filterPresupuestoList();
  }

  changeEstado(id: number): void {
    this.presupuestoService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado del presupuesto actualizado correctamente'
        });
        this.fetchPresupuesto();
      },
      (error) => {
        console.error('Error cambiando estado del presupuesto:', error);
      }
    );
  }

  editPresupuesto(presupuesto: Presupuesto): void {
    const navigationExtras: NavigationExtras = {
      state: {
        presupuesto: { ...presupuesto }
      }
    };
    this.router.navigate(['/presupuesto/editar'], navigationExtras);
  }

  goToCreate(): void {
    this.router.navigate(['/presupuesto/crear']);
  }

  getPendingAmountClass(presupuesto: any): string {
    // Calcular el porcentaje del monto pendiente respecto al inicial
    const porcentaje = (presupuesto.monto_pendiente / presupuesto.monto_presupuesto) * 100;
    if (porcentaje <= 0) {
      return 'px-2 py-1 rounded bg-negative text-white'; // Rojo para <= 0%
    } else if (porcentaje <= 10) {
      return 'px-2 py-1 rounded bg-danger text-white'; // Rojo para <= 25%
    } else if (porcentaje <= 30) {
      return 'px-2 py-1 rounded bg-warning text-white'; // Amarillo para <= 50%
    } else {
      return 'px-2 py-1 rounded bg-success text-white'; // Verde para > 50%
    }
  }

  formatDate(date: any): string {
    const d = new Date(date);
    const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000); // Ajuste de zona horaria
    const day = adjustedDate.getDate();
    const month = adjustedDate.toLocaleString('default', { month: 'long' });
    const year = adjustedDate.getFullYear();
    return `${day} de ${month} de ${year}`;
  }

}
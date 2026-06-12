import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { RecursoService, AlertasRecursos  } from './recurso.service';
import { PermisosService } from '../../service/permisos.service';  

interface Recurso {
  id: number;
  codigo: string;
  nombre: string;
  area: string;
  descripcion: string;
  existencias: number;
  existencias_minimas: number;
  existencias_maximas: number;
  precio: number;
  estado: string;
}

@Component({
  selector: 'app-recurso',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './recurso.component.html',
  styleUrls: ['./recurso.component.css']
})
export class RecursoComponent implements OnInit {
  recursos: Recurso[] = [];
  filteredRecursosList: Recurso[] = []; 
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; 
  itemsPerPage: number = 25; 
  alertasRecursos?: AlertasRecursos;

  constructor(private recursoService: RecursoService, private router: Router, public servicePermiso: PermisosService) {}

  ngOnInit(): void {
    this.verificarStockMinimo();
    this.fetchRecursos();
  }

  verificarStockMinimo(): void {
    this.recursoService.getRecursosStockMinimo().subscribe(
      (data) => {
        this.alertasRecursos = data;
        if (data.total > 0) {
          this.mostrarAlertaStockMinimo(data);
        }
      },
      (error) => {
        console.error('Error al verificar stock mínimo:', error);
      }
    );
  }

  private mostrarAlertaStockMinimo(data: AlertasRecursos): void {
    Swal.fire({
      title: 'Alerta de Stock Mínimo',
      html: `
        <div class="alert-summary">
          <p class="mb-2 text-center">Hay <strong>${data.total}</strong> recurso/s en stock mínimo:</p>
          <div class="flex flex-col items-center mt-2">
            ${data.recursos.map(recurso => 
              `<div class="mb-1">• ${recurso.nombre}</div>`
            ).join('')}
          </div>
        </div>
      `,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#012A15'
    });
  }
  
  fetchRecursos(): void {
    this.recursoService.getRecursos().subscribe( 
      (data: Recurso[]) => {
        if (Array.isArray(data)) {
          this.recursos = data;
          this.filterRecursosList();
        } else {
          console.error('Unexpected data structure:', data);
          this.recursos = [];
        }
      },
      (error) => {
        console.error('Error fetching recursos:', error);
      }
    );
  }
  
  filterRecursosList(): void {
    this.filteredRecursosList = this.recursos.filter(recurso => {
      const matchesSearchText = recurso.nombre.toLowerCase().includes(this.searchText.toLowerCase()) || 
                                recurso.descripcion.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                recurso.codigo.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                recurso.area.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'todos' || 
                            recurso.estado.toLowerCase() === this.selectedStatus.toLowerCase();
  
      return matchesSearchText && matchesStatus; 
    });
    this.currentPage = 1;  
  }
  
  onSearchTextChange(): void {
    this.filterRecursosList();
  }

  onStatusChange(): void {
    this.filterRecursosList();
  }

  changeEstado(id: number): void {
    this.recursoService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado del recurso actualizado correctamente'
        });
        this.fetchRecursos();
      },
      (error) => {
        console.error('Error cambiando estado del recurso:', error);
      }
    );
  }

  editRecurso(recurso: Recurso): void {
    const navigationExtras: NavigationExtras = {
      state: {
        recurso: { ...recurso }
      }
    };
    this.router.navigate(['/recursos/editar'], navigationExtras);
  }

  goToCreate(): void {
    this.router.navigate(['/recursos/crear']);
  }
}
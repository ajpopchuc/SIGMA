import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { InstalacionesService } from './instalaciones.service';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-instalaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './instalaciones.component.html',
  styleUrl: './instalaciones.component.css'
})
export class InstalacionesComponent {
  instalaciones: any[] = [];
  filteredInstalacionesList: any[] = [];
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; 
  itemsPerPage: number = 25;

  constructor(private instalacionesService: InstalacionesService, private router: Router, public permisosService: PermisosService){} 

  ngOnInit(): void {
    this.fetchInstalaciones();
  }

  fetchInstalaciones(): void {
    this.instalacionesService.getInstalaciones().subscribe(
      (data) => {
        this.instalaciones = data.data;
        this.filterInstalacionesList();
      },
      (error) => {
        console.error('Error fetching instalaciones:', error);
      }
    );
  }
  
  filterInstalacionesList(): void {
    this.filteredInstalacionesList = this.instalaciones.filter(instalacion => {
      const matchesSearchText = instalacion.nombre.toLowerCase().includes(this.searchText.toLowerCase()) || 
      instalacion.descripcion.toLowerCase().includes(this.searchText.toLowerCase())|| 
      instalacion.tipo_instalacion.toLowerCase().includes(this.searchText.toLowerCase())|| 
      instalacion.nivel.nombre.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'todos' || instalacion.estado === this.selectedStatus;
  
      return matchesSearchText && matchesStatus || null;
    });
    this.currentPage = 1;
  }

  onSearchTextChange(): void {
    this.filterInstalacionesList();
  }

  onStatusChange(): void {
    this.fetchInstalaciones();
  }

  changeEstado(id: number): void {
    this.instalacionesService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado actualizado correctamente'
        });
        this.fetchInstalaciones();
      },
      (error) => {
        console.error('Error cambiando estado:', error);
      }
    );
  }

  editInstalacion(instalacion: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        instalaciones: { 
          nombre: instalacion.nombre,
          descripcion: instalacion.descripcion,
          tipo_instalacion: instalacion.tipo_instalacion,
          id: instalacion.id,
          id_campus: instalacion.nivel.edificio.campus.id,
          id_edificio: instalacion.nivel.edificio.id,
          id_nivel: instalacion.nivel.id,
        }
        
      }
    };
    this.router.navigate(['/instalaciones/editar'], navigationExtras);
  }
}

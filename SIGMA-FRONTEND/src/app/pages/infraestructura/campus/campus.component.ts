import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { CampusService } from './campus.service';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-campus',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './campus.component.html',
  styleUrls: ['./campus.component.css']
})
export class CampusComponent {
  campus: any[] = [];
  filteredCampusList: any[] = []; 
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; 
  itemsPerPage: number = 25; 

  constructor(
    private campusService: CampusService, 
    private router: Router,
    public permisosService: PermisosService  // Change to public to use in template
  ) {}

  ngOnInit(): void {
    this.fetchCampus();
  }

  fetchCampus(): void {
    this.campusService.getCampus().subscribe( 
      (data) => {
        this.campus = data.data; 
        this.filterCampusList();  
      },
      (error) => {
        console.error('Error fetching campus:', error);
      }
    );
  }
  
  filterCampusList(): void {
    this.filteredCampusList = this.campus.filter(camp => {
      const matchesSearchText = camp.nombre.toLowerCase().includes(this.searchText.toLowerCase()) || 
                                camp.descripcion.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'todos' || camp.estado === this.selectedStatus;
  
      return matchesSearchText && matchesStatus; 
    });
    this.currentPage = 1;  
  }
  
  onSearchTextChange(): void {
    this.filterCampusList();
  }

  onStatusChange(): void {
    this.fetchCampus();  
  }

  changeEstado(id: number): void {
    this.campusService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado actualizado correctamente'
        });
        this.fetchCampus();
      },
      (error) => {
        console.error('Error cambiando estado:', error);
      }
    );
  }

  editCampus(camp: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        campus: { 
          nombre: camp.nombre,
          descripcion: camp.descripcion,
          id: camp.id,
        }
      }
    };
    this.router.navigate(['/campus/editar'], navigationExtras);
  }
  
}

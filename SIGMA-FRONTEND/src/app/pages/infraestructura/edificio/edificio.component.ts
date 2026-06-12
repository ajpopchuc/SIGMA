import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { EdificioService } from './edificio.service';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-edificio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './edificio.component.html',
  styleUrls: ['./edificio.component.css']  // Cambiado de styleUrl a styleUrls
})
export class EdificioComponent {
  edificios: any[] = [];
  filteredEdificiosList: any[] = []; 
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; 
  itemsPerPage: number = 25; 

  constructor(private edificioService: EdificioService, private router: Router,     public permisosService: PermisosService){}   // Change to public to use in template) {}

  ngOnInit(): void {
    this.fetchCampus();
  }

  fetchCampus(): void {
    this.edificioService.getEdificios().subscribe( 
      (data) => {
        this.edificios = data.data; 
        this.filterEdificioList();  
      },
      (error) => {
        console.error('Error fetching edificios:', error);
      }
    );
  }
  
  filterEdificioList(): void {
    this.filteredEdificiosList = this.edificios.filter(edificio => {
      const matchesSearchText = edificio.nombre.toLowerCase().includes(this.searchText.toLowerCase()) || 
                                edificio.descripcion.toLowerCase().includes(this.searchText.toLowerCase())|| 
                                edificio.nombre_campus.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'todos' || edificio.estado === this.selectedStatus;
  
      return matchesSearchText && matchesStatus; 
    });
    this.currentPage = 1;  
  }
  
  onSearchTextChange(): void {
    this.filterEdificioList();
  }

  onStatusChange(): void {
    this.fetchCampus();  
  }

  changeEstado(id: number): void {
    this.edificioService.cambiarEstado(id).subscribe(
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

  editCampus(edificio: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        edificios: { 
          nombre: edificio.nombre,
          descripcion: edificio.descripcion,
          id: edificio.id,
          id_campus: edificio.id_campus,
        }
      }
    };
    this.router.navigate(['/edificios/editar'], navigationExtras);
  }
}

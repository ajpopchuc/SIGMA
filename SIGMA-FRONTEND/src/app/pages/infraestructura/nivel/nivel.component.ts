import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { NivelService } from './nivel.service';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-nivel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './nivel.component.html',
  styleUrl: './nivel.component.css'
})
export class NivelComponent {

  niveles: any[] = [];
  filteredNivelesList: any[] = []; 
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; 
  itemsPerPage: number = 25; 

  constructor(private nivelService: NivelService, private router: Router, public permisosService: PermisosService){} 

  ngOnInit(): void {
    this.fetchNiveles();
    
  }

  fetchNiveles(): void {
    this.nivelService.getNiveles().subscribe(
       
      (data) => {
        this.niveles = data.data; 
        this.filterNiveleList();  
      },
      (error) => {
        console.error('Error fetching niveles:', error);
      }
    );
  }
  
  filterNiveleList(): void {
    this.filteredNivelesList = this.niveles.filter(nivel => {
      const matchesSearchText = nivel.nombre.toLowerCase().includes(this.searchText.toLowerCase()) || 
      nivel.descripcion.toLowerCase().includes(this.searchText.toLowerCase()) || 
      nivel.nombre_edificio.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'todos' || nivel.estado === this.selectedStatus;
  
      return matchesSearchText && matchesStatus || null; 
    });
    this.currentPage = 1;  
  }
  
  onSearchTextChange(): void {
    this.filterNiveleList();
  }

  onStatusChange(): void {
    this.fetchNiveles();  
  }

  changeEstado(id: number): void {
    this.nivelService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado actualizado correctamente'
        });
        this.fetchNiveles();
      },
      (error) => {
        console.error('Error cambiando estado:', error);
      }
    );
  }

  editCampus(nivel: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        niveles: { 
          nombre: nivel.nombre,
          descripcion: nivel.descripcion,
          id: nivel.id,
          id_edificio: nivel.id_edificio,
          campues_id:nivel.campues_id,
        }
      }
    };
    this.router.navigate(['/niveles/editar'], navigationExtras);
  }
}

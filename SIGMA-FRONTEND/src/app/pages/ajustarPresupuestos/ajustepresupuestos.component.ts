import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ajustePresupuestosService } from './ajustepresupuestos.service';
import { PermisosService } from '../../service/permisos.service';  

interface ajustePresupuestos {
  id: number;
  area: string;
  id_presupuesto: number; // Cambiado a number
  cantidad: number; // Cambiado a number
  tipo: string; // Cambiado a number
  motivo: string;
}


@Component({
  selector: 'app-ajustePresupuestos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './ajustepresupuestos.component.html',
  styleUrls: ['./ajustepresupuestos.component.css']
})
export class ajustePresupuestosComponent implements OnInit {
  ajustePresupuestos: ajustePresupuestos[] = [];
  filteredAjustePresupuestosList: ajustePresupuestos[] = []; 
  searchText: string = '';
  selectedStatus: string = 'cantidad'; 
  currentPage: number = 1; 
  itemsPerPage: number = 25; 

  constructor(private ajustePresupuestosService: ajustePresupuestosService, private router: Router, public servicePermiso: PermisosService) {}

  ngOnInit(): void {
    this.fetchAjustePresupuestos();
  }

  fetchAjustePresupuestos(): void {
    this.ajustePresupuestosService.getAjustePresupuestos().subscribe( 
      (data: ajustePresupuestos[]) => {
        if (Array.isArray(data)) {
          this.ajustePresupuestos = data;
          this.filterAjustePresupuestosList();
        } else {
          console.error('Unexpected data structure:', data);
          this.ajustePresupuestos = [];
        }
      },
      (error) => {
        console.error('Error fetching ajustePresupuestos:', error);
      }
    );
  }
  
  filterAjustePresupuestosList(): void {
    this.filteredAjustePresupuestosList = this.ajustePresupuestos.filter(ajustePresupuestos => {
      // Convertimos los valores numéricos a cadenas para poder aplicar includes()
      const matchesSearchText = 
      ajustePresupuestos.id_presupuesto.toString().includes(this.searchText.toLowerCase()) || 
      ajustePresupuestos.cantidad.toString().includes(this.searchText.toLowerCase()) ||
      ajustePresupuestos.tipo.toString().includes(this.searchText.toLowerCase()) || 
      ajustePresupuestos.motivo.toLowerCase().includes(this.searchText.toLowerCase()) || 
      ajustePresupuestos.area.toLowerCase().includes(this.searchText.toLowerCase()) 
        
      return matchesSearchText;
    });
    this.currentPage = 1;  
  }
  
  
  onSearchTextChange(): void {
    this.filterAjustePresupuestosList();
  }

  onStatusChange(): void {
    this.filterAjustePresupuestosList();
  }

  changeEstado(id: number): void {
    this.ajustePresupuestosService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado del ajustePresupuestos actualizado correctamente'
        });
        this.fetchAjustePresupuestos();
      },
      (error) => {
        console.error('Error cambiando estado del ajustePresupuestos:', error);
      }
    );
  }

  editAjustePresupuestos(ajustePresupuestos: ajustePresupuestos): void {
    const navigationExtras: NavigationExtras = {
      state: {
        ajustePresupuestos: { ...ajustePresupuestos }
      }
    };
    this.router.navigate(['/ajustePresupuestos/editar'], navigationExtras);
  }

  goToCreate(): void {
    this.router.navigate(['/ajustePresupuestos/crear']);
  }
}
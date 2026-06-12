import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { AjusteRecursosService } from './ajuste_recursos.service';
import { PermisosService } from '../../../service/permisos.service';  

interface ajusteRecursos {
  id: number;
  recurso: string; // Cambiado a number
  id_recurso: number; // Cambiado a number
  cantidad: number; // Cambiado a number
  tipo: string; // Cambiado a number
  motivo: string;
}


@Component({
  selector: 'app-ajuste_recursos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './ajuste_recursos.component.html',
  styleUrls: ['./ajuste_recursos.component.css']
})
export class ajusteRecursosComponent implements OnInit {
  ajusteRecursos: ajusteRecursos[] = [];
  filteredAjusteRecursosList: ajusteRecursos[] = []; 
  searchText: string = '';
  currentPage: number = 1; 
  itemsPerPage: number = 25; 

  constructor(private ajusteRecursosService: AjusteRecursosService, private router: Router, public servicePermiso: PermisosService) {}

  ngOnInit(): void {
    this.fetchAjustePresupuestos();
  }

  fetchAjustePresupuestos(): void {
    this.ajusteRecursosService.getAjusteRecursos().subscribe( 
      (data: ajusteRecursos[]) => {
        if (Array.isArray(data)) {
          this.ajusteRecursos = data;
          this.filterAjusteRecursosList();
        } else {
          console.error('Unexpected data structure:', data);
          this.ajusteRecursos = [];
        }
      },
      (error) => {
        console.error('Error fetching ajusteRecursos:', error);
      }
    );
  }
  
  filterAjusteRecursosList(): void {
    this.filteredAjusteRecursosList = this.ajusteRecursos.filter(ajusteRecurso => {
      // Convertimos los valores numéricos a cadenas para poder aplicar includes()
      const matchesSearchText = 
      ajusteRecurso.recurso.toString().includes(this.searchText.toLowerCase()) ||
      ajusteRecurso.cantidad.toString().includes(this.searchText.toLowerCase()) ||
      ajusteRecurso.tipo.toString().includes(this.searchText.toLowerCase()) || 
      ajusteRecurso.motivo.toLowerCase().includes(this.searchText.toLowerCase()) 
        
      return matchesSearchText;
    });
  
    this.currentPage = 1;  
  }
  
  
  onSearchTextChange(): void {
    this.filterAjusteRecursosList();
  }

  onStatusChange(): void {
    this.filterAjusteRecursosList();
  }

 

  goToCreate(): void {
    this.router.navigate(['/ajusteRecursos/crear']);
  }
}
import { Component, OnInit } from '@angular/core';
import { EmpleadoService } from './empleado.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationExtras, RouterModule} from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-empleado',
  templateUrl: './empleado.component.html',
  styleUrls: ['./empleado.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule]
})
export class EmpleadoComponent implements OnInit {
  empleados: any[] = [];
  filteredEmpleados: any[] = [];
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 25; // Número de elementos por página

  constructor(private empleadoService: EmpleadoService, private router: Router, public service: PermisosService) {}

  ngOnInit(): void {
    this.fetchEmpleados();
  }

  fetchEmpleados(): void {
    const estado = this.selectedStatus === 'todos' ? '' : this.selectedStatus;
    this.empleadoService.getEmpleado().subscribe(
      (data) => {
        this.empleados = data.empleados.data;
        this.filteredEmpleados = this.empleados;
        this.filterEmpleados();
      },
      (error) => {
        console.error('Error fetching empleados:', error);
      }
    );
  }

  filterEmpleados(): void {
    this.filteredEmpleados = this.empleados.filter(empleado => {
      const matchesSearchText = empleado.nombre.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                empleado.apellido.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                empleado.correo_electronico.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'todos' || empleado.estado === this.selectedStatus;
      return matchesSearchText && matchesStatus || null;
    });
    this.currentPage = 1; // Reinicia la página a 1 después de filtrar
  }

  onSearchTextChange(): void {
    this.filterEmpleados();
  }

  onStatusChange(): void {
    this.fetchEmpleados();
  }

  goToCreate(): void {
    this.router.navigate(['/empleado/crear']);
  }

  editEmpleados(empleado: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        empleado
      }
    };
    this.router.navigate(['/empleados/editar'], navigationExtras);
  }

  changeEstado(id: number): void {
    this.empleadoService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado actualizado correctamente'})
        this.fetchEmpleados();
      },
      (error) => {
        console.error('Error cambiando estado:', error);
      }
    );
  }
}

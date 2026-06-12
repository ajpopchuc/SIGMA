import { Component, OnInit } from '@angular/core';
import { RolService } from './rol.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationExtras, RouterModule} from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-rol',
  templateUrl: './rol.component.html',
  styleUrls: ['./rol.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule]
})
export class RolComponent implements OnInit {
  roles: any[] = [];
  filteredRoles: any[] = [];
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 25; // Número de elementos por página
  nombreRol: string = '';
  rol_id: number = 0;

  constructor(private rolService: RolService, private router: Router, public service: PermisosService) {}

  ngOnInit(): void {
    this.fetchRoles();
    this.fetchPermisos();
  }

  isSaving: boolean = false;

  fetchRoles(): void {
    this.rolService.getRoles().subscribe(
      (data) => {
        this.roles = data.data;
        this.filteredRoles = this.roles;
        this.filterRoles();
      },
      (error) => {
        console.error('Error fetching roles:', error);
      }
    );
  }

  filterRoles(): void {
    this.filteredRoles = this.roles.filter(rol => {
      const matchesSearchText = rol.nombre.toLowerCase().includes(this.searchText.toLowerCase());
      return matchesSearchText;
    });
    this.currentPage = 1; // Reinicia la página a 1 después de filtrar
  }

  onSearchTextChange(): void {
    this.filterRoles();
  }

  isModalOpen: boolean = false;

  openModalCrear() {
    this.isModalOpen = true;
    this.nombreRol = '';
    this.permisos.forEach((permiso: any) => permiso.isSelected = false);
  }

  closeModalCrear() {
    this.isModalOpen = false;
  }

  isEditModalOpen: boolean = false;

  openEditModal(rol: any) {
    this.fetchPermisosAsignados(rol.id);
    this.rol_id = rol.id;
    this.isEditModalOpen = true;
    this.nombreRol = rol.nombre;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }
  permisos: any[] = [];
  permissionsByModule: any[] = []; // New property to store permissions grouped by module

  fetchPermisos(): void {
    this.rolService.getPermisos().subscribe(
      (data) => {
        this.permisos = data;
        // Group permissions by module
        this.groupPermissionsByModule();
      },
      (error) => {
        console.error('Error fetching permisos:', error);
      }
    );
  }

  groupPermissionsByModule() {
    const grouped: { [key: string]: any[] } = {};
    this.permisos.forEach((permiso: any) => {
      const module = permiso.modulo; // Assuming 'modulo' is the module property
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(permiso);
    });
    this.permissionsByModule = Object.keys(grouped).map(module => ({
      module,
      permissions: grouped[module]
    }));
  }

  onPermissionChange(permiso: any) {
    permiso.isSelected = !permiso.isSelected;
  }

  fetchPermisosAsignados(id: number): void {
    this.rolService.getPermisosAsignados(id).subscribe(
      (permisosAsignados: number[]) => { 
        this.permisos.forEach((permiso: any) => {  
          permiso.isSelected = permisosAsignados.includes(permiso.id);
        });
        // Update permissionsByModule after setting isSelected flags
        this.groupPermissionsByModule();
      },
      (error) => {
        console.error('Error fetching permisos:', error);
      }
    );
  }

  // Dividir los permisos en bloques de 5
  get permissionsChunks() {
    const chunkSize = 5;
    const chunks = [];
    for (let i = 0; i < this.permisos.length; i += chunkSize) {
      chunks.push(i);
    }
    return chunks;
  }

  submitForm() {
    const selectedPermissionIds = this.permisos
      .filter(permiso => permiso.isSelected)
      .map(permiso => permiso.id);
  
    const requestData = {
      nombre: this.nombreRol,
      permisos: selectedPermissionIds
    };
    this.isSaving = true; 
    this.rolService.crearRol(requestData).subscribe(
      (response) => {
        this.isSaving = false;
        if(response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Rol',
            text: 'Rol creado correctamente'
          });
          this.closeModalCrear();
          this.fetchRoles();
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ha ocurrido un error al crear el rol ' + response.error
          });
        }
      },
      (error) => {
        this.isSaving = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error al crear el rol ' + error.error
        });
      }
    );
  }
  
  submitEditForm() {
    const selectedPermissionIds = this.permisos
      .filter(permiso => permiso.isSelected)
      .map(permiso => permiso.id);
  
    const requestData = {
      nombre: this.nombreRol,
      permisos: selectedPermissionIds
    };
  
    this.rolService.actualizarRol(this.rol_id, requestData).subscribe(
      (response) => {
        if(response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Rol',
            text: 'Rol actualizado correctamente'
          });
          this.closeEditModal();
          this.fetchRoles();
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ha ocurrido un error al actualizar el rol ' + response.error
          });
        }
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ha ocurrido un error al actualizar el rol ' + error.error
        });
      }
    );
  }
  
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ProveedorService } from './proveedores.service';
import { HttpParams, HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../../constants/api_url';
import { PermisosService } from '../../service/permisos.service'; 

interface Proveedor {
  id: number;
  nombre_proveedor: string;
  nombre_persona_contacto: string;
  correo_contacto: string;
  pbx: string;
  telefono_persona_contacto: string;
  direccion: string;
  descripcion: string;
  tipo_proveedor: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css']
})
export class ProveedorComponent implements OnInit {
  proveedores: Proveedor[] = [];
  filteredProveedoresList: Proveedor[] = [];
  searchText: string = '';
  selectedStatus: string = 'Activo';
  currentPage: number = 1;
  itemsPerPage: number = 25;

  constructor(private proveedorService: ProveedorService, private router: Router, private http: HttpClient, public servicePermiso: PermisosService) {}

  ngOnInit(): void {
    this.fetchProveedores();
  }

  fetchProveedores(): void {
    this.proveedorService.getProveedores().subscribe(
      (data: Proveedor[]) => {
        if (Array.isArray(data)) {
          this.proveedores = data;
          this.filterProveedoresList();
        } else {
          console.error('Unexpected data structure:', data);
          this.proveedores = [];
        }
      },
      (error) => {
        console.error('Error fetching proveedores:', error);
      }
    );
  }
  
  filterProveedoresList(): void {
    this.filteredProveedoresList = this.proveedores.filter(proveedor => {
      const matchesSearchText = proveedor.nombre_proveedor.toLowerCase().includes(this.searchText.toLowerCase()) || 
                                proveedor.descripcion.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'todos' || 
                            proveedor.estado.toLowerCase() === this.selectedStatus.toLowerCase();

      return matchesSearchText && matchesStatus; 
    });
    this.currentPage = 1;
  }

  onSearchTextChange(): void {
    this.filterProveedoresList();
  }

  onStatusChange(): void {
    this.filterProveedoresList();
  }

  changeEstado(id: number): void {
    this.proveedorService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado del proveedor actualizado correctamente'
        });
        this.fetchProveedores();
      },
      (error) => {
        console.error('Error cambiando estado del proveedor:', error);
      }
    );
  }

  editProveedor(proveedor: Proveedor): void {
    const navigationExtras: NavigationExtras = {
      state: {
        proveedor: { ...proveedor }
      }
    };
    this.router.navigate(['/proveedores/editar'], navigationExtras);
  }

  goToCreate(): void {
    this.router.navigate(['/proveedores/crear']);
  }

  openCreateUserModal(id: number): void {
    Swal.fire({
      title: 'Crear Usuario',
      html: `
        <div class="swal-form-container">
          <div class="swal-form-item">
            <label>Usuario</label>
            <input id="swal-input-usuario" class="swal2-input" placeholder="Ingrese el usuario">
          </div>
          <div class="swal-form-item">
            <label>Contraseña</label>
            <div style="position: relative; width: 100%;">
              <input id="swal-input-password" type="password" class="swal2-input" placeholder="Ingrese la contraseña">
              <i id="toggle-password" class="fas fa-eye" 
                 style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); cursor: pointer; color: var(--text-color);">
              </i>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'custom-swal-popup',
        htmlContainer: 'custom-swal-html-container',
        confirmButton: 'custom-swal-confirm-button',
        cancelButton: 'custom-swal-cancel-button',
      },
      didOpen: () => {
        const togglePassword = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('swal-input-password') as HTMLInputElement;
        
        togglePassword?.addEventListener('click', () => {
          if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.classList.replace('fa-eye', 'fa-eye-slash');
          } else {
            passwordInput.type = 'password';
            togglePassword.classList.replace('fa-eye-slash', 'fa-eye');
          }
        });
      },
      preConfirm: () => {
        const usuario = (document.getElementById('swal-input-usuario') as HTMLInputElement).value;
        const password = (document.getElementById('swal-input-password') as HTMLInputElement).value;
  
        if (!usuario || !password) {
          Swal.showValidationMessage('Debe ingresar tanto el usuario como la contraseña');
          return false;
        }
  
        return { usuario, password };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const { usuario, password } = result.value;
        const userData = {
          id: id,
          usuario,
          password,
          id_rol: 2,
          estado: 'Activo'
        };
  
        this.proveedorService.crearUsuario(userData).subscribe(
          () => {
            Swal.fire('Usuario creado', 'El usuario ha sido creado exitosamente', 'success');
          },
          (error) => {
            let errorMessage = 'Ha ocurrido un error al crear el proveedor: \n';

            Object.keys(error.error.errors).forEach((field) => {
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`;
              });
            });

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage
            });
          }
        );
      }
    });
  }
    
}

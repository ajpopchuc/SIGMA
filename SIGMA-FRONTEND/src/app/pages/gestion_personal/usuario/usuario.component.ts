import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { UsuarioService } from './usuario.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, NavigationExtras, RouterModule} from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
import { Select2Module } from 'ng-select2-component';
import { PermisosService } from '../../../service/permisos.service';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule, ReactiveFormsModule, Select2Module]
})
export class UsuarioComponent implements OnInit {
  usuarios: any[] = [];
  filteredUsuarios: any[] = [];
  searchText: string = '';
  selectedStatus: string = 'Activo'; 
  currentPage: number = 1; // Página actual
  itemsPerPage: number = 25; // Número de elementos por página
  changePasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private renderer: Renderer2,
    public service: PermisosService,
  ) {
    this.changePasswordForm = this.fb.group({
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      id_usuario: 0
    });
  }
  
  ngOnInit(): void {
    this.fetchUsuarios();
  }

  fetchUsuarios(): void {
    const estado = this.selectedStatus === 'todos' ? '' : this.selectedStatus;
    this.usuarioService.getUsuarios().subscribe(
      (data) => {
        this.usuarios = data.usuarios.data;
        this.filteredUsuarios = this.usuarios;
        this.filterUsuarios();
      },
      (error) => {
        console.error('Error fetching usuarios:', error);
      }
    );
  }

  filterUsuarios(): void {
    this.filteredUsuarios = this.usuarios.filter(usuario => {
      const matchesSearchText = usuario.usuario.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                usuario.rol.toLowerCase().includes(this.searchText.toLowerCase()) ;
      const matchesStatus = this.selectedStatus === 'todos' || usuario.estado === this.selectedStatus;
      return matchesSearchText && matchesStatus || null;
    });
    this.currentPage = 1; // Reinicia la página a 1 después de filtrar
  }

  onSearchTextChange(): void {
    this.filterUsuarios();
  }

  onStatusChange(): void {
    this.fetchUsuarios();
  }

  goToCreate(): void {
    this.router.navigate(['/usuario/crear']);
  }

  editUsuario(usuario: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        usuario
      }
    };
    this.router.navigate(['/usuarios/editar'], navigationExtras);
  }

  changeEstado(id: number): void {
    this.usuarioService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado actualizado correctamente'})
        this.fetchUsuarios();
      },
      (error) => {
        console.error('Error cambiando estado:', error);
      }
    );
  }

  isModalOpen = false;
  openModal(id: number) {
    this.changePasswordForm.patchValue({ id_usuario: id });
    this.isModalOpen = true;
  }

  closeModalCrear() {
    this.isModalOpen = false;
  }

  


  cambiarContra() {
    // Validar que las contraseñas coincidan
    if (this.changePasswordForm.value.newPassword !== this.changePasswordForm.value.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña',
        text: 'Las nuevas contraseñas no coinciden'})
      return;
    }
    this.usuarioService.cambiarContraseña(this.changePasswordForm.value).subscribe(
      (response) => {
        if(response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Contraseña',
            text: 'Contraseña actualizada correctamente'})
          this.isModalOpen = false;
          this.changePasswordForm.reset();
          this.fetchUsuarios();
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Contraseña',
            text: 'Error al actualizar la contraseña ' + response.message
          });
        }
      },
      (error) => {
        let errorMessage = 'Ha ocurrido un error al crear el usuario: \n';
        // Iteramos sobre el objeto de errores
        Object.keys(error.error.errors).forEach((field) => {
          // Obtenemos el array de errores para cada campo
          error.error.errors[field].forEach((message: string) => {
            errorMessage += `- ${message}\n`; // Añadimos cada mensaje al string
          });
        });
      
        // Mostrar el mensaje concatenado en Swal
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage
        });
      }
    );
  }
}

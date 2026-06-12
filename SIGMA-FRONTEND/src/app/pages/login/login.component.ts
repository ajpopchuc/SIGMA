import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.js'
import { API_URL } from '../../constants/api_url';
import { PermisosService } from '../../service/permisos.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginObj: Login;
  password: string;

  constructor(private http: HttpClient, private router: Router, private permisosService: PermisosService) {
    this.loginObj = new Login();
    this.password = '';
  }

  onLogin() {
    this.loginObj.password = this.password;
    this.http.post(`${API_URL}login`, this.loginObj).subscribe((res: any) => {
      if (res.token) {
        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          text: 'Bienvenido',
          customClass: {
            container: 'swal-container',
            popup: 'swal-popup',
            icon: 'swal-icon'
          }
        });
        // Almacenar los datos en el localStorage
        localStorage.setItem('angular17token', res.token);
        localStorage.setItem('id_usuario', res.id_usuario.toString());
        localStorage.setItem('nombre_usuario', res.nombre_usuario);
        localStorage.setItem('rol', res.rol.toString());
        this.permisosService.setearPermiso(res.permisos);
        this.router.navigateByUrl('/inicio');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de inicio de sesión',
          text: 'Credenciales inválidas',
          customClass: {
            icon: 'icon-right'
          }
        });
      }
    }, error => {
      Swal.fire({
        
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: error.error.error,
        customClass: {
          icon: 'icon-right'
        }
      });
    });
  }
}

export class Login {
  usuario: string;
  password: string;
  constructor() {
    this.usuario = '';
    this.password = '';
  }
}

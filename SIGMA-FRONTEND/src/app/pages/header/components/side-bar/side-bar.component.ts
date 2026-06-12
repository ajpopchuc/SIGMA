import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { API_URL } from '../../../../constants/api_url';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute, NavigationEnd, RouterModule  } from '@angular/router';
import { PermisosService } from '../../../../service/permisos.service';

interface SubModule {
  text: string;
  route: string;
  class?: string;
  permisos?: string[];
}

interface MenuItem {
  module: {
    icon: string;
    text: string;
    route: string | null;
    permisos?: string[];
    submodule?: SubModule[];
  };
}

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent {
  isOpen = false;
  expandedIndex: number | null = null;
  hoveredIndex: number = -1;
  clickedIndex: number = -1;

  // Add new property for timer
  private closeTimer: any;

  menuItems: MenuItem[] = [
    {
      module: {
        icon: 'la la-home icon-2x text-white',
        text: 'Tablero de inicio',
        route: '/inicio'
      }
    },
    // 1. Calendarización
    {
      module: {
        icon: 'la la-calendar-alt icon-2x text-white',
        text: 'Calendarización',
        permisos: ['Ver todas las calendarizaciones', 'Ver calendarizacion', 'Crear actividad', 'Ver actividad', 
          'Ejecutar actividad', 'Ver resumen'],
        route: '/calendarizacion'
      }
    },
  
    // 2. Gestión de personal
    {
      module: {
        icon: 'la la-user icon-2x text-white',
        text: 'Gestión de personal',
        route: null,
        permisos: ['Ver usuarios', 'Crear usuario', 'Cambiar contraseña', 'Ver empleados', 
              'Crear empleado', 'Editar empleado', 'Activar o desactivar empleado', 'Ver roles', 'Crear rol', 'Editar rol'],
        submodule: [
          { text: 'Usuarios', route: '/usuarios',
            permisos: ['Ver usuarios', 'Crear usuario', 'Cambiar contraseña']
          },
          { text: 'Empleados', route: '/empleados' ,
            permisos: ['Ver empleados', 'Crear empleado', 'Editar empleado', 'Activar o desactivar empleado']
          },
          { 
            text: 'Roles', 
            route: '/roles', 
            permisos: ['Ver roles', 'Crear rol', 'Editar rol']
          },
        ]
      }
    },
  
    // 3. Administrar proveedores
    {
      module: {
        icon: 'las la-truck-moving icon-2x text-white',
        text: 'Administrar proveedores',
        permisos: ['Ver proveedores', 'Crear proveedor', 'Editar proveedor', 'Activar o desactivar proveedor', 
          'Crear usuario proveedor'],
        route: '/proveedores'
      },
    },
  
    // 4. Facultades
    {
      module: {
        icon: 'la la-building icon-2x text-white',
        text: 'Facultades',
        route: null,
        permisos: ['Ver campus', 'Crear campus', 'Editar campus', 'Activar o desactivar campus', 'Ver edificios', 'Crear edificio', 'Editar edificio', 
          'Activar o desactivar edificio', 'Ver niveles', 'Crear nivel', 'Editar nivel', 'Activar o desactivar nivel', 
          'Ver instalaciones', 'Crear instalación', 'Editar instalación', 'Activar o desactivar instalación'],
        submodule: [
          { text: 'Campus', route: '/campus', permisos: ['Ver campus', 'Crear campus', 'Editar campus', 'Activar o desactivar campus'] },
          { text: 'Edificios', route: '/edificios', permisos: ['Ver edificios', 'Crear edificio', 'Editar edificio', 'Activar o desactivar edificio'] },
          { text: 'Niveles', route: '/niveles', permisos: ['Ver niveles', 'Crear nivel', 'Editar nivel', 'Activar o desactivar nivel'] },
          { text: 'Instalaciones', route: '/instalaciones', permisos: ['Ver instalaciones', 'Crear instalación', 'Editar instalación', 'Activar o desactivar instalación'] },
        ]
      }
    },
  
    // 5. Gestión de presupuesto
    {
      module: {
        icon: 'las la-coins icon-2x text-white',
        text: 'Gestión de presupuesto',
        permisos: ['Ver presupuestos', 'Crear presupuesto', 'Editar presupuesto', 'Ver ajustes de presupuesto'
          , 'Crear ajuste de presupuesto', 'Ver tablero de presupuesto', 'Imprimir tablero de presupuesto'],
        route: null,
        submodule: [
          { text: 'Administrar presupuesto', route: '/presupuesto', permisos: ['Ver presupuestos', 'Crear presupuesto', 'Editar presupuesto']  },
          { text: 'Ajustar presupuesto', route: '/ajustePresupuestos', permisos: ['Ver ajustes de presupuesto', 'Crear ajuste de presupuesto', 'Ver tablero de presupuesto'] },
          { text: 'Tablero de presupuestos', route: '/tableroPresupuesto', permisos: ['Ver tablero de presupuesto', 'Imprimir tablero de presupuesto', 'Crear presupuesto'] }
        ],
      }
    },
  
    // 6. Gestión de activos
    {
      module: {
        icon: 'la la-clipboard-list icon-2x text-white',
        text: 'Gestión de activos',
        permisos: ['Ver activos', 'Crear activo', 'Editar activo', 'Activar o desactivar activo'],
        route: '/activos',
      }
    },
  
    // 7. Gestión de recursos
    {
      module: {
        icon: 'las la-tools icon-2x text-white',
        text: 'Gestión de materiales',
        permisos: ['Ver recursos', 'Crear recurso', 'Editar recurso', 
          'Activar o desactivar recurso', 'Ver ajustes de recurso', 'Crear ajuste de recurso'],
        route: null,
        submodule: [
          { text: 'Administrar materiales', route: '/recursos', permisos: ['Ver recursos', 'Crear recurso', 'Editar recurso', 'Activar o desactivar recurso'] },
          { text: 'Ajustar materiales', route: '/ajusteRecursos', permisos: ['Ver ajustes de recurso', 'Crear ajuste de recurso'] }
        ],
      }
    },
  
    // 8. Gestión de compras
    {
      module: {
        icon: 'la la-cart-plus icon-2x text-white',
        text: 'Gestión de compras',
        permisos: ['Ver compras', 'Crear compra', 'Anular compra', 
          'Ver recibo de compra', 'Imprimir recibo de compra'],
        route: '/compras',
      }
    },
  
    // 9. Inspecciones
    {
      module: {
        icon: 'flaticon-folder-1 icon-2x text-white',
        text: 'Inspecciones',
        route: null,
        permisos: ['Ver inspecciones de equipos', 'Ver detalle de inspecciones de equipos', 'Calendarizar mantenimiento de equipos', 'Ver inspecciones de infraestructura', 'Ver detalle de inspecciones de infraestructura', 'Calendarizar mantenimiento de infraestructura'],
        submodule: [
          { text: 'Inspecciones de equipos', route: '/inspecciones/equipos', permisos: ['Ver inspecciones de equipos', 'Ver detalle de inspecciones de equipos', 'Calendarizar mantenimiento de equipos'] },
          { text: 'Inspecciones de infraestructura', route: '/inspecciones/infraestructura', permisos: ['Ver inspecciones de infraestructura', 'Ver detalle de inspecciones de infraestructura', 'Calendarizar mantenimiento de infraestructura'] },
        ]
      }
    },
  
    // 10. Mantenimientos
    {
      module: {
        icon: 'las la-clipboard-list icon-2x text-white',
        text: 'Mantenimientos',
        route: null,
        permisos: ['Ver mantenimientos de equipos', 'Ver detalle de mantenimientos de equipos', 'Calendarizar supervisión de mantenimientos de equipos',
          'Ver mantenimientos de infraestructura', 'Ver detalle de mantenimientos de infraestructura', 'Calendarizar supervisión de mantenimientos de infraestructura',],
        submodule: [
          { text: 'Mantenimientos de equipos', route: '/mantenimientos/equipos' ,
            permisos: ['Ver mantenimientos de equipos', 'Ver detalle de mantenimientos de equipos', 'Calendarizar supervisión de mantenimientos de equipos']
          },
          { text: 'Mantenimientos de infraestructura', route: '/mantenimientos/infraestructura' ,
            permisos: ['Ver mantenimientos de infraestructura', 'Ver detalle de mantenimientos de infraestructura', 
              'Calendarizar supervisión de mantenimientos de infraestructura']
          }
        ],
      },
    },
  
    // 11. Mantenimientos Externos
    {
      module: {
        icon: 'las la-clipboard icon-2x text-white',
        text: 'Mantenimientos Externos',
        route: '/mantenimientos/externo',
        permisos: ["Ver mantenimientos externos","Ver detalle de mantenimientos externos","Pagar mantenimiento externo",
          "Calendarizar supervisión de mantenimientos externos"]
      },
    },
  
    // 12. Supervisiones
    {
      module: {
        icon: 'la la-users-cog icon-2x text-white',
        text: 'Supervisiones',
        permisos: ["Ver supervisión de equipos","Ver detalle de supervisión de equipos","Ver supervisión de infraestructura",
          "Ver detalle de supervisión de infraestructura"],
        route: null,
        submodule: [
          { text: 'Supervisiones de equipos', route: '/supervisiones/equipos', permisos: ['Ver supervisión de equipos', 'Ver detalle de supervisión de equipos'] },
          { text: 'Supervisiones de infraestructura', route: '/supervisiones/infraestructura', permisos: ['Ver supervisión de infraestructura', 'Ver detalle de supervisión de infraestructuraCalendario'] },
        ]
      }
    },
  
    // 13. Reportería (Añadido)
    {
      module: {
        icon: 'la la-chart-bar icon-2x text-white', // Asegúrate de que el icono sea correcto
        text: 'Reportería',
        route: null,
        permisos: ["Ver reporte stock de recursos", "Imprimir reporte stock de recursos", "Ver reporte gasto total", 
          "Imprimir reporte gasto total", "Ver reporte actividades de usuario", "Imprimir reporte actividades de usuario",
          "Ver reporte horas hombre", "Imprimir reporte horas hombre"],
        submodule: [
          { text: 'Stock de recursos', route: '/reportes/stock_recursos', permisos: ["Ver reporte stock de recursos", "Imprimir reporte stock de recursos"] },
          { text: 'Gasto total', route: '/reportes/gasto_total', permisos: ["Ver reporte gasto total", "Imprimir reporte gasto total"] },
          { text: 'Actividades de usuario', route: '/reportes/actividades_usuario',  permisos: ["Ver reporte actividades de usuario", "Imprimir reporte actividades de usuario"] },
          { text: 'Horas hombre', route: '/reportes/horas_hombre',  permisos: ["Ver reporte horas hombre", "Imprimir reporte horas hombre"] },           
        ]
      },
    },
  ];

  toggleSidebar() {
    this.isOpen = !this.isOpen; // Cambia el estado del menú
  }

  toggleSubmenu(index: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    
    // Clear any existing timer
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
    
    if (!this.isOpen) {
      this.clickedIndex = this.clickedIndex === index ? -1 : index;
      if (this.clickedIndex !== -1) {
        this.startCloseTimer();
      }
    } else {
      this.expandedIndex = this.expandedIndex === index ? null : index;
      // Close sidebar if clicking on a submodule item that has a route
      if (this.menuItems[index].module.route) {
        this.isOpen = false;
      }
    }
  }

  // Add new method to handle mouse enter on submenu
  onSubmenuMouseEnter() {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
    }
  }

  // Add new method to handle mouse leave on submenu
  onSubmenuMouseLeave() {
    if (!this.isOpen && this.clickedIndex !== -1) {
      this.startCloseTimer();
    }
  }

  // Add new method to start close timer
  private startCloseTimer() {
    this.closeTimer = setTimeout(() => {
      this.clickedIndex = -1;
    }, 700);
  }

  isSubmenuExpanded(index: number): boolean {
    return this.expandedIndex === index;
  }

  onMenuItemHover(index: number) {
    if (!this.isOpen) {
      this.hoveredIndex = index;
    }
  }

  onMenuItemLeave() {
    if (!this.isOpen) {
      this.hoveredIndex = -1;
    }
  }

  getSubmenuPosition(index: number): string {
    const menuItem = document.querySelectorAll('.menu-item')[index];
    if (menuItem) {
      const rect = menuItem.getBoundingClientRect();
      return `${rect.top}px`;
    }
    return '0px';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const isClickInside = sidebar?.contains(target);
    const isClickOnHamburger = hamburger?.contains(target);

    // No cerrar si el clic fue en el hamburger o dentro del sidebar
    if (!isClickInside && !isClickOnHamburger) {
      this.isOpen = false; // Cierra el sidebar
      this.clickedIndex = -1; // Reset clicked index
      this.expandedIndex = null; // Reset expanded index
    }
  }

  currentRoute: string = '';
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private permisosService: PermisosService) {
    // Subscribe to router events to close sidebar on navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        this.isOpen = false; // Close sidebar when route changes
        this.clickedIndex = -1; // Reset clicked index
        this.expandedIndex = null; // Reset expanded index
      }
    });

    // Subscribirse a los eventos de navegación para obtener la ruta activa actual
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });

    // Filtrar elementos del menú según permisos
    this.menuItems = this.menuItems
      .filter((item) => !item.module.permisos || this.permisosService.tieneAlgunPermiso(item.module.permisos))
      .map((item) => {
        if (item.module.submodule) {
          item.module.submodule = item.module.submodule.filter(
            (sub) => !sub.permisos || this.permisosService.tieneAlgunPermiso(sub.permisos)
          );
        }
        return item;
      });
  }

  logout() {
    const token = localStorage.getItem('angular17token');
    if (token) {
      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      this.http.get(`${API_URL}logout`, { headers }).subscribe((res: any) => {
        localStorage.removeItem('angular17token');
        localStorage.removeItem('id_usuario');
        localStorage.removeItem('nombre_usuario');
        localStorage.removeItem('rol');
        localStorage.removeItem('permisosUsuario');
        
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada.'
        });

        this.router.navigateByUrl('/login');
      }, error => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cerrar sesión',
          text: 'Hubo un problema al cerrar la sesión'
        });
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error al cerrar sesión',
        text: 'No hay usuario autenticado'
      });
    }
  }

}

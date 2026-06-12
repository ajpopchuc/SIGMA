import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './service/auth.guard';
import { UsuarioComponent } from './pages/gestion_personal/usuario/usuario.component';
import { CrearUsuarioComponent } from './pages/gestion_personal/usuario/crear-usuario/crear-usuario.component';
import { EditarUsuarioComponent } from './pages/gestion_personal/usuario/editar-usuario/editar-usuario.component';
import { RolComponent } from './pages/gestion_personal/roles/rol.component';
import { CampusComponent } from './pages/infraestructura/campus/campus.component';
import { CrearCampusComponent } from './pages/infraestructura/campus/crear-campus/crear-campus.component';
import { EditarCampusComponent } from './pages/infraestructura/campus/editar-campus/editar-campus.component';
import { EdificioComponent } from './pages/infraestructura/edificio/edificio.component';
import {CrearEdificioComponent  } from './pages/infraestructura/edificio/crear-edificio/crear-edificio.component';
import {EditarEdificioComponent  } from './pages/infraestructura/edificio/editar-edificio/editar-edificio.component';
import { NivelComponent } from './pages/infraestructura/nivel/nivel.component';
import {CrearNivelComponent  } from './pages/infraestructura/nivel/crear-nivel/crear-nivel.component';
import {EditarNivelComponent  } from './pages/infraestructura/nivel/editar-nivel/editar-nivel.component';
import {InstalacionesComponent } from './pages/infraestructura/instalaciones/instalaciones.component';
import {CrearInstalacionesComponent } from './pages/infraestructura/instalaciones/crear-instalaciones/crear-instalaciones.component';
import {EditarInstalacionesComponent } from './pages/infraestructura/instalaciones/editar-instalaciones/editar-instalaciones.component';


//rutas para activos no tocar "Marito"
import { ActivoComponent } from './pages/activos/activo/activo.component';
import { CrearActivoComponent } from './pages/activos/activo/crear-activo/crear-activo.component';
import {  EditarActivoComponent} from './pages/activos/activo/editar-activo/editar-activo.component';
//Empleados
import { EmpleadoComponent } from './pages/gestion_personal/empleados/empleado.component';
import { CrearEmpleadoComponent } from './pages/gestion_personal/empleados/crear-empleado/crear-empleado.component';
import { EditarEmpleadoComponent } from './pages/gestion_personal/empleados/editar-empleado/editar-empleado.component';
//AJPOP
import { RecursoComponent } from './pages/recurso/recurso.component';
import { CrearRecursoComponent } from './pages/recurso/crear-recurso/crear-recurso.component';
import { EditarRecursosComponent } from './pages/recurso/editar-recurso/editar-recurso.component';
import { PresupuestoComponent } from './pages/presupuesto/presupuesto.component';
import { CrearPresupuestoComponent } from './pages/presupuesto/crear-presupuesto/crear-presupuesto.component';
import { ajustePresupuestosComponent } from './pages/ajustarPresupuestos/ajustepresupuestos.component';
import { CrearAjustePresupuestosComponent } from './pages/ajustarPresupuestos/crear-presupuesto/crear-ajustepresupuestos.component';






//Mau
//MAntenimientos
import { MantenimientoEquipoComponent } from './pages/mantenimientos/interno_equipos/mantenimiento_equipo.component';
import { CrearMantenimientoEquipoComponent } from './pages/mantenimientos/interno_equipos/crear-mantenimiento_equipo/crear-mantenimiento_equipo.component';
import { MantenimientoInfraestructuraComponent } from './pages/mantenimientos/interno_infraestructura/mantenimiento_infraestructura.component';
import { CrearMantenimientoInfraestructuraComponent } from './pages/mantenimientos/interno_infraestructura/crear-mantenimiento_infraestructura/crear-mantenimiento_infraestructura.component';
import { MantenimientoExternoComponent } from './pages/mantenimientos/externo/mantenimiento_externo.component';
import { CrearMantenimientoExternoComponent } from './pages/mantenimientos/externo/crear-mantenimiento_externo/crear-mantenimiento_externo.component';
import { ajusteRecursosComponent } from './pages/recurso/ajustarRecurso/ajuste_recursos.component';
import { CrearAjusteRecursosComponent } from './pages/recurso/ajustarRecurso/crearAjuste/crear-ajuste_recursos.component';
import { ReporteGastoTotalComponent } from './pages/reportes/gasto_total/gasto_total.component';
import { EquipoComponent } from './pages/equipo/equipo.component';
import { StockRecursosComponent } from './pages/reportes/stock_recursos/stock_recursos.component';







































//Frank
import { InspeccionesEquiposComponent } from './pages/inspecciones/inspecciones-equipos/inspecciones-equipos.component';
import { CrearInspeccionesEquiposComponent} from './pages/inspecciones/inspecciones-equipos/crear-inspecciones-equipos/crear-inspecciones-equipos.component';
import { InspeccionesInfraestructuraComponent } from './pages/inspecciones/inspecciones-infraestructura/inspecciones-infraestructura.component';
import { loginGuard } from './service/login.guard';
import { CrearInspeccionesInfraestructuraComponent } from './pages/inspecciones/inspecciones-infraestructura/crear-inspecciones-infraestructura/crear-inspecciones-infraestructura.component';



































































//Mario
import { CompraComponent } from './pages/compras/compra/compra.component';
import { VerCompraComponent } from './pages/compras/compra/ver-compra/ver-compra.component';
import { CrearCompraComponent } from './pages/compras/compra/crear-compra/crear-compra.component';

// Supervisiones
import { SupervisionEquipoComponent } from './pages/supervisiones/equipos/supervision_equipo.component';
import { CrearSupervisionEquipoComponent } from './pages/supervisiones/equipos/crear-supervision_equipo/crear-supervision_equipo.component';
import { SupervisionInfraestructuraComponent } from './pages/supervisiones/infraestructura/supervision_infraestructura.component';
import { CrearSupervisionInfraestructuraComponent } from './pages/supervisiones/infraestructura/crear-supervision_equipo/crear-supervision_infraestructura.component';
// Reportes actividaes usuario
import { ReporteActividadesUsuarioComponent } from './pages/reportes/actividades_usuario/actividades_usuario.component';
// Reportes horas hombre
import { ReporteHorasHombreComponent } from './pages/reportes/horas_hombre/horas_hombre.component';





























































//Ajopop
import { ProveedorComponent } from './pages/proveedores/proveedores.component';
import { CrearProveedorComponent } from './pages/proveedores/crear-proveedores/crear-proveedores.component';
import { EditarProveedorComponent } from './pages/proveedores/editar-proveedores/editar-proveedores.component';


import { CalendarizacionComponent } from './pages/calendarizacion/calendarizacion.component';

import { TableroPresupuestoComponent } from './pages/tableroPresupuesto/tableroPresupuesto.component';













































































export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
  
  // Ruta de login
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard]  
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'inicio',
        component: DashboardComponent,
        canActivate: [authGuard],
      },
      {
        path: 'usuarios',
        component: UsuarioComponent,
        canActivate: [authGuard],
        data : {permisos: ['Ver usuarios', 'Crear usuario', 'Cambiar contraseña'] }
      },
      {
        path: 'usuarios/crear',
        component: CrearUsuarioComponent,
        canActivate: [authGuard],
        data : {permisos: ['Crear usuario'] }
      },
      {
        path: 'roles',
        component: RolComponent,
        canActivate: [authGuard],
        data: { permisos: ['Ver roles', 'Crear rol', 'Editar rol'] }
      },
      // Rutas para Activos no Tocar "Marito"
      {
        path: 'activos',
        component: ActivoComponent,
        canActivate: [authGuard],
        data: { permisos: ['Ver activos', 'Crear activo', 'Editar activo', 'Activar o desactivar activo'] } 
      },
      {
        path: 'activos/crear',
        component: CrearActivoComponent,
        canActivate: [authGuard],
        data: { permisos: ['Crear activo'] } 
      },
      {
        path: 'activos/editar',
        component: EditarActivoComponent,
        canActivate: [authGuard],
        data: { permisos: ['Editar activo'] } 
      }//
      ,{
          path: 'campus',
          component: CampusComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver campus', 'Crear campus', 'Editar campus', 'Activar o desactivar campus'] } 
        },
        {
          path: 'campus/crear',
          component: CrearCampusComponent,
          canActivate: [authGuard],
          data: { permisos: ['Crear campus'] } 
        },
        {
          path: 'campus/editar',
          component: EditarCampusComponent,
          canActivate: [authGuard],
          data: { permisos: ['Editar campus'] } 
        },
        {
          path: 'edificios',
          component: EdificioComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver edificios', 'Crear edificio', 'Editar edificio', 'Activar o desactivar edificio'] } 
        },
        {
          path: 'edificios/crear',
          component: CrearEdificioComponent,
          canActivate: [authGuard],
          data: { permisos: ['Crear edificio'] } 
        },
        {
          path: 'edificios/editar',
          component: EditarEdificioComponent,
          canActivate: [authGuard],
          data: { permisos: ['Editar edificio'] } 
        },
        {
          path: 'niveles',
          component: NivelComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver niveles', 'Crear nivel', 'Editar nivel', 'Activar o desactivar nivel'] } 
        },
        {
          path: 'niveles/crear',
          component: CrearNivelComponent,
          canActivate: [authGuard],
          data: { permisos: ['Editar nivel'] } 
        },
        {
          path: 'niveles/editar',
          component: EditarNivelComponent,
          canActivate: [authGuard],
          data: { permisos: ['Editar nivel'] } 
        },
        {
          path: 'instalaciones',
          component: InstalacionesComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver instalaciones', 'Crear instalación', 'Editar instalación', 'Activar o desactivar instalación'] } 
        },
        {
          path: 'instalaciones/crear',
          component: CrearInstalacionesComponent,
          canActivate: [authGuard],
          data: { permisos: ['Editar instalación'] } 
        },
        {
          path: 'instalaciones/editar',
          component: EditarInstalacionesComponent,
          canActivate: [authGuard],
          data: { permisos: ['Editar instalación'] } 
        },
        //empleados
        {
          path: 'empleados',
          component: EmpleadoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver empleados', 'Crear empleado', 'Editar empleado', 'Activar o desactivar empleado'] }
        },
        {
          path: 'empleados/crear',
          component: CrearEmpleadoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Crear empleado'] }
        },
        {
          path: 'empleados/editar',
          component: EditarEmpleadoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Editar empleado'] }
        },
        {
          path: 'recursos',
          component: RecursoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver recursos', 'Crear recurso', 'Editar recurso', 'Activar o desactivar recurso'] }
        },
        {
          path: 'recursos/crear',
          component: CrearRecursoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Crear recurso'] }
        },
        {
          path: 'recursos/editar',
          component: EditarRecursosComponent,
          canActivate: [authGuard],
          data: { permisos: ['Editar recurso'] }
        },
        {
          path: 'presupuesto',
          component: PresupuestoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver presupuestos', 'Crear presupuesto', 'Editar presupuesto'] }
        },
        {
          path: 'presupuesto/crear',
          component: CrearPresupuestoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Crear presupuesto'] }
        },
        {
          path: 'ajustePresupuestos',
          component: ajustePresupuestosComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver ajustes de presupuesto', 'Crear ajuste de presupuesto'] }
        }
        ,
        {
          path: 'ajustePresupuestos/crear',
          component: CrearAjustePresupuestosComponent,
          canActivate: [authGuard],
          data: { permisos: ['Crear ajuste de presupuesto'] }
        },
        //Mau
        ///Mantenimientos
        {
          path: 'mantenimientos/equipos',
          component: MantenimientoEquipoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver mantenimientos de equipos', 'Ver detalle de mantenimientos de equipos', 'Calendarizar supervisión de mantenimientos de equipos'] }
        },
        {
          path: 'mantenimientos/equipos/crear',
          component: CrearMantenimientoEquipoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ejecutar actividad'] }
        },
        {
          path: 'mantenimientos/infraestructura',
          component: MantenimientoInfraestructuraComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver mantenimientos de infraestructura', 'Ver detalle de mantenimientos de infraestructura', 
            'Calendarizar supervisión de mantenimientos de infraestructura'] }
        },
        {
          path: 'mantenimientos/infraestructura/crear',
          component: CrearMantenimientoInfraestructuraComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ejecutar actividad'] }
        },
        {
          path: 'mantenimientos/externo',
          component: MantenimientoExternoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver mantenimientos externos', 'Ver detalle de mantenimientos externos', 'Pagar mantenimiento externo','Calendarizar supervisión de mantenimientos externos'] }
        },
        {
          path: 'mantenimientos/externo/crear',
          component: CrearMantenimientoExternoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ejecutar actividad'] }
        },
        {
          path: 'ajusteRecursos',
          component: ajusteRecursosComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver ajustes de recurso', 'Crear ajuste de recurso'] }
        },
        {
          path: 'ajusteRecursos/crear',
          component: CrearAjusteRecursosComponent,
          canActivate: [authGuard],
          data: { permisos: ['Crear ajuste de recurso'] }
        },
        {
          path: 'reportes/gasto_total',
          component: ReporteGastoTotalComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver reporte gasto total', 'Imprimir reporte gasto total'] }
        },
        {
          path: 'equipo',
          component: EquipoComponent,
          canActivate: [authGuard],
        },
        {
          path: 'reportes/stock_recursos',
          component: StockRecursosComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver reporte stock de recursos', 'Imprimir reporte stock de recursos'] }
        },













        //Frank
        {
          path: 'inspecciones/equipos',
          component: InspeccionesEquiposComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver inspecciones de equipos', 'Ver detalle de inspecciones de equipos', 'Calendarizar mantenimiento de equipos'] }
        },
        {
          path: 'inspecciones/equipos/crear',
          component: CrearInspeccionesEquiposComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ejecutar actividad'] }
        },
        {
          path: 'inspecciones/infraestructura',
          component: InspeccionesInfraestructuraComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver inspecciones de infraestructura',  'Ver detalle de inspecciones de infraestructura', 'Calendarizar mantenimiento de infraestructura'] }
          
        },        {
          path: 'inspecciones/infraestructura/crear',
          component: CrearInspeccionesInfraestructuraComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ejecutar actividad'] }
        },































































        //Mario
        {
          path: 'compras', 
          component: CompraComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver compras',  'Crear compra', 'Anular compra', 'Ver recibo de compra', 'Imprimir recibo de compra'] }
        },
        {
          path: 'compras/crear', 
          component: CrearCompraComponent,
          canActivate: [authGuard],
          data: { permisos: ['Crear compra'] }
        },
        {
          path: 'compras/:id', 
          component: VerCompraComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver recibo de compra'] }
        },
        // Supervisiones          
        {
          path: 'supervisiones/equipos',
          component: SupervisionEquipoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver supervisión de equipos', 'Ver detalle de supervisión de equipos'] }
        },
        {
          path: 'supervisiones/equipos/crear',
          component: CrearSupervisionEquipoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ejecutar actividad'] }
        },
        {
          path: 'supervisiones/infraestructura',
          component: SupervisionInfraestructuraComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver supervisión de infraestructura', 'Ver detalle de supervisión de infraestructura'] }
        },
        {
          path: 'supervisiones/infraestructura/crear',
          component: CrearSupervisionInfraestructuraComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ejecutar actividad'] }
        },
        // Reportes actividaes usuario
        {
          path: 'reportes/actividades_usuario',
          component: ReporteActividadesUsuarioComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver reporte actividades de usuario', 'Imprimir reporte actividades de usuario'] }
        },
        // Reportes horas hombre
        {
          path: 'reportes/horas_hombre',
          component: ReporteHorasHombreComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver reporte horas hombre', 'Imprimir reporte horas hombre'] }
        },


























        //Ajopop
        {
          path: 'proveedores',
          component: ProveedorComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver proveedores', 'Crear proveedor', 'Editar proveedor', ' Activar o desactivar proveedor', 'Crear usuario proveedor'] }
        },
        {
          path: 'proveedores/crear',
          component: CrearProveedorComponent,
          canActivate: [authGuard],
          data: { permisos: ['Crear proveedor'] }
        },
        {
          path: 'proveedores/editar',
          component: EditarProveedorComponent,
          canActivate: [authGuard],
          data: { permisos: ['Editar proveedor'] }
        },
        {
          path: 'calendarizacion',
          component: CalendarizacionComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver todas las calendarizaciones', 'Ver calendarizacion', 'Crear actividad', 'Ver actividad', 'Ejecutar actividad', 'Ver resumen'] }
        },
        {
          path: 'tableroPresupuesto',
          component: TableroPresupuestoComponent,
          canActivate: [authGuard],
          data: { permisos: ['Ver tablero de presupuesto', 'Imprimir tablero de presupuesto', 'Crear presupuesto'] }
        },

        
















































































    ],
  },
];

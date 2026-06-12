import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MantenimientoService } from '../mantenimiento_equipo.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

declare var KTWizard: any; // Declara la variable para evitar errores de TypeScript
declare var KTUtil: any; // Declara la variable para evitar errores de TypeScript

interface Edificio {
  id: number;
  niveles: Nivel[];
}

interface Nivel {
  id: number;
}

@Component({
  selector: 'app-crear-mantenimiento_equipo', 
  standalone: true,
  templateUrl: './crear-mantenimiento_equipo.component.html',
  styleUrls: ['./crear-mantenimiento_equipo.component.css'],
  imports: [ReactiveFormsModule, CommonModule, ZXingScannerModule]
})
export class CrearMantenimientoEquipoComponent  {
  private _wizardObj: any;
  private _formEl: any;
  instalaciones: any[] = [];
  recursos: any[] = [];
  ubicaciones: any[] = [];
  activos: any[] = [];
  activosFiltrados: any[] = []; // Nueva propiedad para los activos filtrados
  selectedInstalacion: any = null;
  
  selectedCampus: any = null;
  selectedEdificio: any = null;
  selectedNivel: any = null;

  fotografiaInicialPreview: Array<string | ArrayBuffer | null> = [];
  fotografiaFinalPreview: Array<string | ArrayBuffer | null> = [];
  fotografiasAdicionalesPreview: Array<string | ArrayBuffer | null> = [];

  data_recolectada: {
    [x: string]: any; tipo: string 
  } = { tipo: '' };

  areaSeleccionada='';
  ngAfterViewInit(): void {
    this.mantenimientoForm.get('detalle_mantenimiento')?.disable();
    this.getUbicaciones();
    this.getActivos();
    this.getRecursos();
    // Suscribirse al cambio de valor del área
    this.mantenimientoForm.get('area')?.valueChanges.subscribe((selectedArea) => {
      if (selectedArea) {
        this.areaSeleccionada = selectedArea;
        this.mantenimientoForm.get('detalle_mantenimiento')?.enable();
        this.filtrarRecursosPorArea(selectedArea); // Aplica el filtro dinámicamente
      }
    });
    this.initWizard();
  }

  isButtonDisabled: boolean = true;
  mantenimientoForm: FormGroup;
  observacionActividad: string = '';
  // Add this getter to access the FormArray from the FormGroup
  get detalle_mantenimiento(): FormArray {
    return this.mantenimientoForm.get('detalle_mantenimiento') as FormArray;
  }
  
  selectedActivos: any[] = []; // Nuevo array para mantener los activos seleccionados

  showScanner = false;
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: MediaDeviceInfo | undefined;

  constructor(
    private fb: FormBuilder,
    private mantenimientoService: MantenimientoService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    const navigation = this.router.getCurrentNavigation();
    const data_guardada = sessionStorage.getItem('data_recolectada');
    if (data_guardada) {
      //VERIFICAMOS SI EXISTE NAVIGATION
      if (navigation?.extras?.state) {
        //verificamos si el dato de id_calendarizacion es diferente al que se guardo en el 
        if (JSON.parse(data_guardada)['id_calendarizacion'] != (navigation?.extras?.state as { id_calendarizacion: number })?.id_calendarizacion) {
          this.data_recolectada = (navigation?.extras?.state as { tipo: string }) || { tipo: '' };
          sessionStorage.setItem('data_recolectada', JSON.stringify(this.data_recolectada));
        } 
        else {
          if(JSON.parse(data_guardada)['pasoActividad'] != (navigation?.extras?.state as { pasoActividad: number })?.pasoActividad) {
            this.data_recolectada = (navigation?.extras?.state as { tipo: string }) || { tipo: '' };
            sessionStorage.setItem('data_recolectada', JSON.stringify(this.data_recolectada));
          }
          else{
            this.data_recolectada = JSON.parse(data_guardada);
          }
        }
      }
      else {
        this.data_recolectada = JSON.parse(data_guardada);
      }
    }
    else {
      this.data_recolectada = (navigation?.extras?.state as { tipo: string }) || { tipo: '' };
      sessionStorage.setItem('data_recolectada', JSON.stringify(this.data_recolectada));
    }
    let motivo = "";
    if (this.data_recolectada.tipo == "Preventivo") {
      motivo = "Mantenimiento preventivo";
    }
    else {
      motivo = "Solicitud de Mantenimiento correctivo";
    }
    this.observacionActividad = this.data_recolectada['observaciones'];
    this.mantenimientoForm = this.fb.group({
      fotografia_inicial:  this.fb.array([]),
      id_instalacion: [''],
      id_activos: [''], // Este guardará los IDs como string
      nivel_atendido: [''],
      tipo: [''],
      cantidad_atendida: [''],
      unidad_medida: [''],
      descripcion: [''],
      motivo_actividad: [motivo],
      monto_total: [0],
      tipo_mantenimiento: [this.data_recolectada.tipo],
      observaciones: [''],
      fotografia_final:  this.fb.array([]),
      lugar_mantenimiento: ['Equipo'],
      id_calendario: [this.data_recolectada['id_calendarizacion']],
      fotografias_adicionales: this.fb.array([]),
      detalle_mantenimiento: this.fb.array([this.crearDetalleMantenimiento()]),  // Add this line
      area:['']  // Add this line
    });
  }
  
  // Función para crear un nuevo detalle de mantenimiento
  crearDetalleMantenimiento(): FormGroup {
    const detalleForm = this.fb.group({
      codigo: ['', Validators.required],
      id_recurso: [''],
      cantidad: ['', Validators.required],
      unidad: ['', Validators.required],
      precio_unitario: ['', Validators.required],
      total: ['', Validators.required],
    });

    return detalleForm;
  }

  
  // Función para agregar un nuevo detalle
  agregarDetalle(): void {
      this.detalle_mantenimiento.push(this.crearDetalleMantenimiento());
      // Agregar esta línea para inicializar los recursos filtrados para el nuevo detalle
      this.filtrarRecursosPorArea(this.areaSeleccionada); // Aplica el filtro dinámicamente
      this.filteredRecursos.push([...this.recursos]);
  }
  
  // Función para eliminar un detalle específico
  eliminarDetalle(index: number): void {
    this.detalle_mantenimiento.removeAt(index);
  }

  private initWizard() {
    this._wizardObj = new KTWizard('kt_wizard', {
      startStep: this.data_recolectada['pasoActividad'],
      clickableSteps: false
    });
    if(this.data_recolectada['pasoActividad'] > 1){
      this._wizardObj.goTo(this.data_recolectada['pasoActividad']);
    }
    this._formEl = KTUtil.getById('kt_form');
    this._wizardObj.on('change', (wizard: any) => {
      if (wizard.getStep() > wizard.getNewStep()) {
        return; // Skip if stepped back
      }
      const step = wizard.getStep();

      // Validar el formulario en cada paso
      if (step === 1) {
        //Aqui se tomara la fotografía inicial para empezar el mantenimiento
        //Verificar que el campo de fotografía inicial no esté vacío
        if (!this.mantenimientoForm.value.fotografia_inicial[0]) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese una fotografía inicial'
          });
          return;
        }

        // Detener la navegación antes de realizar la petición
        wizard.stop();
        this.isSavingnext = true;
        //Si todo está correcto guardar informacion paso 1
        this.mantenimientoService.crearMantenimientoPaso1(this.mantenimientoForm.value).subscribe(
          (response) => {
            this.isSavingnext = false; 
            if(response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Paso 1 completado',
                text: 'Imagen inicial guardada correctamente'
              }).then(() => {
                // Solo avanzar si se guarda correctamente
                wizard.goTo(wizard.getNewStep());
              });
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al completar el paso 1' + response.message
              });
            }
          },
          (error) => {
            this.isSavingnext = false; 
            let errorMessage = 'Ha ocurrido un error al crear el paso 1: \n';
            
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
      if (step === 2) {
        //Aqui se seleccionará la instalación a la que se le realizará el mantenimiento y los activos a los que se les realizará el mantenimiento
        //Verificar que el campo de instalación no esté vacío
        if (!this.mantenimientoForm.value.id_instalacion) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, seleccione una instalación'
          });
          return;
        }
        //Aqui se seleccionará el nivel al que se le realizará el mantenimiento
        //Verificar que el campo de activos no esté vacío
        if (!this.mantenimientoForm.value.id_activos) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, seleccione un activo'
          });
          return;
        }
        //Verificar que el campo de nivel atendido no esté vacío
        if (!this.mantenimientoForm.value.nivel_atendido) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, seleccione un nivel'
          });
          return;
        }
        //Verificar que el campo de tipo no esté vacío
        if (!this.mantenimientoForm.value.tipo) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, seleccione un tipo'
          });
          return;
        }
        //Verificar que el campo de cantidad atendida no esté vacío
        if (!this.mantenimientoForm.value.cantidad_atendida) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese una cantidad atendida'
          });
          return;
        }
        //Verificar que el campo de unidad de medida no esté vacío
        if (!this.mantenimientoForm.value.unidad_medida) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, seleccione una unidad de medida'
          });
          return;
        }
        //Verificar que el campo de descripción no esté vacío
        if (!this.mantenimientoForm.value.descripcion) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese una descripción'
          });
          return;
        }

        wizard.stop();
        this.isSavingnext = true;
        //Si todo está correcto guardar informacion paso 2
        this.mantenimientoService.crearMantenimientoPaso2(this.mantenimientoForm.value).subscribe(
          (response) => {
            this.isSavingnext = false;
            if(response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Paso 2 completado',
                text: 'Información guardada correctamente'
              }).then(() => {
                // Solo avanzar si se guarda correctamente
                wizard.goTo(wizard.getNewStep());
              });
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al completar el paso 2' + response.message
              });
            }
          },
          (error) => {
            this.isSavingnext = false;
            let errorMessage = 'Ha ocurrido un error al crear el paso 2: \n';
            
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
            return;
          }
        );
      }
      if (step === 3) {
        //Se agregarán los detalles del mantenimiento
        // Verificar todos los detalles del mantenimiento
        for (let i = 0; i < this.detalle_mantenimiento.length; i++) {
          const detalle = this.detalle_mantenimiento.at(i);
          if (!detalle.get('id_recurso')?.value) {
            wizard.stop();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Por favor, seleccione un recurso para el detalle ${i + 1}`
            });
            return;
          }
          if (!detalle.get('cantidad')?.value) {
            wizard.stop();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Por favor, ingrese una cantidad para el detalle ${i + 1}`
            });
            return;
          }
          if (!detalle.get('unidad')?.value) {
            wizard.stop();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Por favor, seleccione una unidad para el detalle ${i + 1}`
            });
            return;
          }
          if (!detalle.get('precio_unitario')?.value) {
            wizard.stop();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Por favor, ingrese un precio unitario para el detalle ${i + 1}`
            });
            return;
          }
          if (!detalle.get('total')?.value) {
            wizard.stop();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Por favor, ingrese un total para el detalle ${i + 1}`
            });
            return;
          }
          //Obtenemos el monto total general
          this.mantenimientoForm.get('monto_total')?.setValue(this.mantenimientoForm.get('monto_total')?.value + detalle.get('total')?.value);
        }
        //Aqui se seleccionará el resumen de la actividad, el motivo de la actividad, obersevaciones, tipo de mantenimiento
        //Verificar que el campo de observaciones no esté vacío
        if (!this.mantenimientoForm.value.observaciones) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese observaciones'
          });
          return;
        }

        wizard.stop();
        this.isSavingnext = true;
        //Si todo está correcto guardar informacion paso 3
        this.mantenimientoService.crearMantenimientoPaso3(this.mantenimientoForm.value).subscribe(
          (response) => {
            this.isSavingnext = false;
            if(response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Paso 3 completado',
                text: 'Información guardada correctamente'
              }).then(() => {
                // Solo avanzar si se guarda correctamente
                wizard.goTo(wizard.getNewStep());
              });
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al completar el paso 3' + response.message
              });
              return;
            }
          },
          (error) => {
            this.isSavingnext = false;
            let errorMessage = 'Ha ocurrido un error al crear el paso 3: \n';
            
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
            return;
          }
        );
      }
      if (step === 4) {
        //Aqui se tomará la fotografía final para finalizar el mantenimiento
        //Verificar que el campo de fotografía final no esté vacío
        if (!this.mantenimientoForm.value.fotografia_final[0]) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese una fotografía final'
          });
          return;
        }
        wizard.stop();
        this.isSavingnext = true;
        //Si todo está correcto guardar informacion paso 4
        this.mantenimientoService.crearMantenimientoPaso4(this.mantenimientoForm.value).subscribe(
          (response) => {
            this.isSavingnext = false;
            if(response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Paso 4 completado',
                text: 'Imagen final guardada correctamente'
              }).then(() => {
                // Solo avanzar si se guarda correctamente
                wizard.goTo(wizard.getNewStep());
              });
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al completar el paso 4' + response.message
              });
              return;
            }
          },
          (error) => {
            this.isSavingnext = false;
            let errorMessage = 'Ha ocurrido un error al crear el paso 4: \n';
            
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
            return;
          }
        );
      } 
      if(step===5){
        wizard.stop();
        this.isSavingnext = true;
        //Si todo está correcto guardar informacion paso 5
        this.mantenimientoService.crearMantenimientoPaso5(this.mantenimientoForm.value).subscribe(
          (response) => {
            this.isSavingnext = false;
            if(response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Paso 5 completado',
                text: 'Fotografías adicionales guardadas correctamente'
              }).then(() => {
                // Solo avanzar si se guarda correctamente
                wizard.goTo(wizard.getNewStep());
                // Resetear recursos 
                this.detalle_mantenimiento.clear(); // Limpiar el FormArray
              });
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al completar el paso 5' + response.message
              });
              return;
            }
          },
          (error) => {
            this.isSavingnext = false;
            let errorMessage = 'Ha ocurrido un error al crear el paso 5: \n';
            
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
            return;
          }
        );
      }
      if(step===6){
      }
    });
    //Agregamos esto antes
    this.isSaving = false; 
    
    this._wizardObj.on('submit', (wizard: any) => {
      this.isSaving = true; 
      this.mantenimientoService.crearMantenimientoPaso6(this.mantenimientoForm.value).subscribe(
        (response) => {
          // Rehabilitar el botón cuando termine la operación
          this.isSaving = false; 
          if(response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Mantenimiento creado',
              text: 'Mantenimiento de equipo creado correctamente'
            });
            sessionStorage.removeItem('data_recolectada');
            this.router.navigate(['/mantenimientos/equipos']);
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ha ocurrido un error al crear el mantenimiento' + response.message
            });
          }
        },
        (error) => {
          // Rehabilitar el botón incluso si ocurre un error
          this.isSaving = false; 
          let errorMessage = 'Ha ocurrido un error al crear el mantenimiento: \n';
          
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
    });
  }
  
  isSaving: boolean = false;  //agregamos esto afuera de la funcion para declararla
  isSavingnext: boolean = false;

  getUbicaciones(): void {
    this.mantenimientoService.getUbicaciones().subscribe(
      (data) => {
        this.ubicaciones = data;
      },
      (error) => {
      }
    );
  }

  onCampusChange(event: any): void {
    const campusId = event.target.value;
    this.selectedCampus = this.ubicaciones.find(campus => campus.id == campusId);
    this.selectedEdificio = null; // Resetear edificio y nivel
    this.selectedNivel = null;
    this.mantenimientoForm.get('id_instalacion')?.setValue(''); 
  }

  onEdificioChange(event: any): void {
    const edificioId = event.target.value;
    this.selectedEdificio = this.selectedCampus?.edificios.find((edificio: Edificio) => edificio.id == edificioId);
    this.selectedNivel = null; // Resetear nivel
    this.mantenimientoForm.get('id_instalacion')?.setValue(''); 
  }

  onNivelChange(event: any): void {
    const nivelId = event.target.value;
    this.selectedNivel = this.selectedEdificio?.niveles.find((nivel: Nivel) => nivel.id == nivelId);
    this.mantenimientoForm.get('id_instalacion')?.setValue(''); 
  }

  onInstalacionChange(event: any): void {
    const instalacionId = event.target.value;
    this.selectedInstalacion = instalacionId;
    this.mantenimientoForm.get('id_instalacion')?.setValue(instalacionId);
    
    // Verifica que this.activos sea un array antes de filtrar
    if (Array.isArray(this.activos)) {
      this.activosFiltrados = this.activos.filter(activo => activo.id_instalacion == instalacionId);
    } else {
      this.activosFiltrados = [];
    }
  }

  onFotografiaInicialChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
        const control = this.mantenimientoForm.get('fotografia_inicial') as FormArray;

        // Recorremos los archivos seleccionados sin limpiar el arreglo.
        Array.from(files as FileList).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Set the preview of the initial photo
                this.fotografiaInicialPreview.push(reader.result);
            };
            reader.readAsDataURL(file);
            // Agrega cada archivo al FormArray.
            control.push(new FormControl(file));
        });
    }
  }

  removeFotografiaInicial(index: number) {
    this.fotografiaInicialPreview.splice(index, 1); // Elimina la imagen en la posición 'index'
    const control = this.mantenimientoForm.get('fotografia_inicial') as FormArray;
    control.removeAt(index);
  }

  getActivos(): void {
    this.mantenimientoService.getActivos().subscribe(
      (data) => {
        // Asegúrate de que data sea un array
        this.activos = Array.isArray(data.data) ? data.data : [];
      },
      (error) => {
        this.activos = []; // Asegúrate de que sea un array vacío en caso de error
      }
    );
  }

  // Nuevo método para manejar la selección de activos
  onActivoSelect(event: any): void {
    const activoId = event.target.value;
    const activo = this.activosFiltrados.find(a => a.id == activoId);
    
    if (activo && !this.selectedActivos.find(a => a.id == activoId)) {
      this.selectedActivos.push(activo);
      // Actualizar el control del formulario con los IDs separados por comas
      const activoIds = this.selectedActivos.map(a => a.id).join(',');
      this.mantenimientoForm.get('id_activos')?.setValue(activoIds);
    }
    
    // Resetear el select
    event.target.value = '';
  }

  // Nuevo método para remover un activo seleccionado
  removeActivo(activoId: number): void {
    this.selectedActivos = this.selectedActivos.filter(a => a.id != activoId);
    // Actualizar el control del formulario
    const activoIds = this.selectedActivos.map(a => a.id).join(',');
    this.mantenimientoForm.get('id_activos')?.setValue(activoIds || ''); // Si no hay activos, establecer string vacío
  }

  getRecursos(): void {
    this.mantenimientoService.getRecursos().subscribe(
      (data) => {
        this.recursos = data;
        this.initializeFilteredRecursos(); // Agrega esto
      },
      (error) => {
      }
    );
  }

  filtrarRecursosPorArea(area: string): void {
    const rows = this.detalle_mantenimiento.controls;
    for (let i = 0; i < rows.length; i++) {
      this.filteredRecursos[i] = this.recursos.filter((recurso) => recurso.area === area);
    }
  }
  
  onRecursoChange(event: any, index: number) {
      const recursoId = event.target.value;
      const recurso = this.recursos.find(r => r.id === Number(recursoId));
      if (recurso) {
        const detalleForm = this.detalle_mantenimiento.at(index);
        // Actualizar todos los campos incluyendo el código
        detalleForm.patchValue({
          codigo: recurso.codigo,          // Agregar el código
          precio_unitario: recurso.precio,
          unidad: recurso.unidad || ''     // Si tienes unidad en tu recurso
        });
        // Recalcular total
        const cantidad = detalleForm.get('cantidad')?.value || 0;
        detalleForm.patchValue({
          total: cantidad * recurso.precio
        });
      }
  }
  
  onCantidadChange(event: any, index: number) {
    const cantidad = event.target.value;
    const detalleForm = this.detalle_mantenimiento.at(index);
    const precioUnitario = detalleForm.get('precio_unitario')?.value || 0;
    detalleForm.patchValue({
      total: cantidad * precioUnitario
    });
  }
  

  onFotografiaFinalChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
        const control = this.mantenimientoForm.get('fotografia_final') as FormArray;

        // Recorremos los archivos seleccionados sin limpiar el arreglo.
        Array.from(files as FileList).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Set the preview of the final photo
                this.fotografiaFinalPreview.push(reader.result);
            };
            reader.readAsDataURL(file);
            // Agrega cada archivo al FormArray.
            control.push(new FormControl(file));
        });
      }
  }

  removeFotografiaFinal(index: number) {
    this.fotografiaFinalPreview.splice(index, 1); // Elimina la imagen en la posición 'index'
    const control = this.mantenimientoForm.get('fotografia_final') as FormArray;
    control.removeAt(index);
  }


  onFotografiasAdicionalesChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
        const control = this.mantenimientoForm.get('fotografias_adicionales') as FormArray;

        // Recorremos los archivos seleccionados sin limpiar el arreglo.
        Array.from(files as FileList).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Agrega cada nueva imagen a `fotografiasAdicionalesPreview`.
                this.fotografiasAdicionalesPreview.push(reader.result);
            };
            reader.readAsDataURL(file);
            // Agrega cada archivo al FormArray.
            control.push(new FormControl(file));
        });
    }
}

removeFotografiasAdicionales(index: number) {
  this.fotografiasAdicionalesPreview.splice(index, 1); // Elimina la imagen en la posición 'index'
  const control = this.mantenimientoForm.get('fotografias_adicionales') as FormArray;
  control.removeAt(index);
}

  startScanner(): void {
    this.showScanner = true;
  }

  stopScanner(): void {
    this.showScanner = false;
  }

  onScanSuccess(result: string): void {
    if (result) {
      try {
        const qrData = JSON.parse(result);
        if (qrData.id) {
          // Agregar el activo escaneado
          const activo = this.activos.find(a => a.id === qrData.id);
          if (activo && !this.selectedActivos.find(a => a.id === activo.id)) {
            this.selectedActivos.push(activo);
            const activoIds = this.selectedActivos.map(a => a.id).join(',');
            this.mantenimientoForm.get('id_activos')?.setValue(activoIds);
            this.mantenimientoForm.get('id_instalacion')?.setValue(activo.id_instalacion);
            // Mostrar mensaje de éxito
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Activo escaneado correctamente'
            });
          }
          // Cerrar el scanner después de una lectura exitosa
          this.stopScanner();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El código QR no contiene un formato válido'
        });
      }
    }
  }

  onDevicesFound(devices: any): void {
    // Handle different event types
    if (Array.isArray(devices)) {
      this.availableDevices = devices;
    } else if (devices instanceof Event && (devices.target as any)?.devices) {
      this.availableDevices = (devices.target as any).devices;
    } else {
      this.availableDevices = [];
    }

    // Seleccionar automáticamente la cámara trasera si está disponible
    const backCamera = this.availableDevices.find(device => 
      /back|rear|environment/gi.test(device.label || '')
    );
    this.currentDevice = backCamera || this.availableDevices[0];
  }


  initializeFilteredRecursos(): void {
    const rows = this.detalle_mantenimiento.controls;
    for (let i = 0; i < rows.length; i++) {
      this.filteredRecursos[i] = [...this.recursos];
    }
  }

  filteredRecursos: any[][] = []; // Agrega esta variable

  // Agrega esta función
  onCodigoChange(event: any, index: number): void {
    const codigo = event.target.value;
    this.filteredRecursos[index] = this.recursos.filter(recurso => recurso.codigo.includes(codigo));

    const recursoEncontrado = this.recursos.find(recurso => recurso.codigo === codigo);
    if (recursoEncontrado) {
      const rows = this.detalle_mantenimiento.controls;
      const row = rows.at(index) as FormGroup;
      row.get('id_recurso')?.setValue(recursoEncontrado.id);
      this.onRecursoChange({ target: { value: recursoEncontrado.id } }, index);
    }
  }

  cancelar(): void {
    this.router.navigate(['/calendarizacion']);
  }
}

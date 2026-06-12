import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { InspeccionesInfraestructuraService } from '../inspecciones-infraestructura.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { bu } from '@fullcalendar/core/internal-common';
import { SegmentacionGuardado } from './SegmentacionGuardado';
declare var KTWizard: any; 
declare var KTUtil: any; 

interface Edificio {
  id: number;
  niveles: Nivel[];
}

interface Nivel {
  id: number;
}

interface Deterioro {
  id: number; 
  nombre: string;
  ninguno: boolean;
  leve: boolean;
  grave: boolean;
  observaciones: string;
  seleccion?: string | null; 
}

@Component({
  selector: 'app-crear-inspecciones-infraestructura',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './crear-inspecciones-infraestructura.component.html',
  styleUrls: ['./crear-inspecciones-infraestructura.component.css'],
  providers: [SegmentacionGuardado], 
})
export class CrearInspeccionesInfraestructuraComponent implements AfterViewInit, OnInit {

  private _wizardObj: any;
  private _formEl: any;
  inspeccionesForm: FormGroup;
  ubicaciones: any[] = [];
  deterioroData: any[] = [];
  selectedCampus: any = null;
  selectedEdificio: any = null;
  selectedNivel: any = null;
  fotografiaFinalPreview:Array<string | ArrayBuffer | null> = [];
  fotografiaInicialPreview: Array<string | ArrayBuffer | null> = [];
  fotografiasAdicionalesPreview: Array<string | ArrayBuffer | null> = [];
  intervencionSeleccionada: string = '';
  isButtonDisabled: boolean = false;
  counterPreview: number = 0;
  id_calendarizacion_navigate: any;
  id_usuario_asignado: any;
  tipo_navigate: any;
  isSaving: boolean = false;
  pasoActualNavigation: any;
  pasoActual: number = 1;
  observacionActivdad: any;
  deterioros: Deterioro[] = [
    {id:1, nombre: 'Grietas/Fisuras (juntas)', ninguno: false, leve: false, grave: false, observaciones: '' },
    { id:2,nombre: 'Suciedad/Manchas', ninguno: false, leve: false, grave: false, observaciones: '' },
    { id:3,nombre: 'Fotos de Humedad/Hongos', ninguno: false, leve: false, grave: false, observaciones: '' },
    { id:4,nombre: 'Deformaciones (alineamiento de pared o desplome)', ninguno: false, leve: false, grave: false, observaciones: '' },
    { id:5,nombre: 'Desgaste de las láminas', ninguno: false, leve: false, grave: false, observaciones: '' },
    {id:6, nombre: 'Despegue de láminas', ninguno: false, leve: false, grave: false, observaciones: '' },
    { id:7,nombre: 'Condición de los acabados de pared', ninguno: false, leve: false, grave: false, observaciones: '' },
    {id:8, nombre: 'Condición de la pintura', ninguno: false, leve: false, grave: false, observaciones: '' },
    { id:9,nombre: 'Otros (Especificar)', ninguno: false, leve: false, grave: false, observaciones: '' }
  ];

  constructor(
    private fb: FormBuilder,
    private nivelService: InspeccionesInfraestructuraService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    private segmentacionGuardado: SegmentacionGuardado

  ) {
    this.inspeccionesForm = this.fb.group({
      id_calendario:['', [Validators.required]],
      tipo: ['', [Validators.required, Validators.maxLength(50)]],
      id_usuario_asignado: ['', [Validators.required]],
      //step1
      fotografia_inicial: this.fb.array([]),
      //step2
      id_instalacion: ['', [Validators.pattern('^[0-9]+$')]],

      //step3
      elementos: ['', [Validators.required, Validators.maxLength(100)]],
      cantidad_inspeccion: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      unidad_medida: ['', [Validators.required]],
      motivo: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      //step4
      deterioroDatas:[this.deterioroData, [Validators.required]],
      //step5
      condicionGeneral: ['', [Validators.required]],
      plazoIntervencion: ['', [Validators.required]],
      intervencion: ['', [Validators.required, Validators.maxLength(200)]],
      plazoValor: ['', [Validators.required, Validators.min(0)]],
      unidadPlazo: ['', [Validators.required]],
      plazo: [''], // This will store the concatenated value
      observacionesGenerales: ['', [Validators.required, Validators.maxLength(500)]],
      //step6
      fotografia_final: this.fb.array([]),
      //step7
      fotografias_adicionales: this.fb.array([]),
      //step8
    });  

    this.inspeccionesForm.get('plazoIntervencion')?.valueChanges.subscribe(value => {
      if (value === 'Ninguno') {
        this.inspeccionesForm.get('plazo')?.disable();
        this.inspeccionesForm.get('plazo')?.setValue(0);
      } else {
        this.inspeccionesForm.get('plazo')?.enable();
      }
    });

    const navigation = this.router.getCurrentNavigation();
    this.id_calendarizacion_navigate = navigation?.extras?.state?.['id_calendarizacion'];
    this.id_usuario_asignado = navigation?.extras?.state?.['id_usuario'];
    this.tipo_navigate = navigation?.extras?.state?.['tipo'];
    this.pasoActualNavigation = navigation?.extras?.state?.['pasoActividad'];
    this.observacionActivdad = navigation?.extras?.state?.['observaciones'];
  // Get data from sessionStorage or navigation state
  if (navigation?.extras?.state) {
    // If navigation state exists, save it to sessionStorage
    sessionStorage.setItem('id_calendarizacion', this.id_calendarizacion_navigate);
    sessionStorage.setItem('id_usuario', this.id_usuario_asignado);
    sessionStorage.setItem('tipo', this.tipo_navigate);
    sessionStorage.setItem('pasoActividad', this.pasoActualNavigation);
    sessionStorage.setItem('observaciones', this.observacionActivdad);
  } else {
    // If no navigation state, get from sessionStorage
    this.id_calendarizacion_navigate = sessionStorage.getItem('id_calendarizacion');
    this.id_usuario_asignado = sessionStorage.getItem('id_usuario');
    this.tipo_navigate = sessionStorage.getItem('tipo');
    this.pasoActualNavigation = sessionStorage.getItem('pasoActividad');
    this.observacionActivdad = sessionStorage.getItem('observaciones');
  }
  this.inspeccionesForm.get('unidadPlazo')?.valueChanges.subscribe(() => {
    this.actualizarPlazoCompleto();
  });

  this.inspeccionesForm.get('plazo')?.valueChanges.subscribe(() => {
    this.actualizarPlazoCompleto();
  });

  // Update subscriptions to handle plazo changes
  this.inspeccionesForm.get('plazoValor')?.valueChanges.subscribe(() => {
    this.actualizarPlazoCompleto();
  });

  this.inspeccionesForm.get('unidadPlazo')?.valueChanges.subscribe(() => {
    this.actualizarPlazoCompleto();
  });
  }
  ngOnInit(): void {
  this.isButtonDisabled = true;
  const idCalendario = this.inspeccionesForm.get('id_calendario');
  const motivotemp = this.inspeccionesForm.get('motivo');
  const idUsuario = this.inspeccionesForm.get('id_usuario_asignado');
   this.pasoActual = this.pasoActualNavigation || 1;
  if (idCalendario && motivotemp && idUsuario && this.pasoActual) {

  idCalendario.setValue(this.id_calendarizacion_navigate);
  motivotemp.setValue(this.tipo_navigate);
  idUsuario.setValue(this.id_usuario_asignado);
  this.pasoActual = this.pasoActualNavigation;


}
    this.getUbicaciones();

  }

  ngAfterViewInit(): void {
    this.initWizard();
  }

  private initWizard() {
    this._wizardObj = new KTWizard('kt_wizard', {
      startStep: this.pasoActual,
      clickableSteps: false
    });
    this._formEl = KTUtil.getById('kt_form');

    this._wizardObj.on('change', (wizard: any) => {
      if (wizard.getStep() > wizard.getNewStep()) {
      return; // Skip if stepped back
      }
      const step = wizard.getStep();

      // Validar el formulario en cada paso
      if (step === 1) {
  
        this.counterPreview++
        this.isSaving = false;
        wizard.stop(); // Detiene el avance inmediatamente
    
        if (this.fotografiaInicialPreview.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Fotografía Inicial Requerida',
                text: 'Para iniciar la inspección, es necesario tomar una fotografía del estado inicial.'
            });
            return;
        }
    

    
        this.isSaving = true;
        this.segmentacionGuardado.primerPaso(
            this.inspeccionesForm.get('fotografia_inicial')?.value,
            Number(sessionStorage.getItem('id_calendarizacion')) || 0,
            sessionStorage.getItem('tipo') || ''
        ).then(success => {
            if (success) {
                this.isSaving = false;
                this.isButtonDisabled = true;
                wizard.goNext(); // Solo avanza si la operación fue exitosa
            }else {
              this.isSaving = false;
                }
        });
    } else if (step === 2) {
        console.log( "datasese" + Number(sessionStorage.getItem('id_calendarizacion')?.valueOf()));
        this.counterPreview++;
        this.isButtonDisabled = false;
        wizard.stop(); // Detiene el avance inmediatamente
        if (!this.inspeccionesForm.get('id_instalacion')?.value) {
            wizard.stop();
            Swal.fire({
                icon: 'error',
                title: 'Ubicación No Seleccionada',
                text: 'Por favor seleccione el edificio, nivel e instalación donde se realizará la inspección.'
            });
            return;
        }
        this.isSaving = true;
        this.segmentacionGuardado.segundoPaso(
            this.inspeccionesForm.get('id_instalacion')?.value || [],
            Number(sessionStorage.getItem('id_calendarizacion')) || 0,
        ).then(success => {
            if (success) {
                this.isSaving = false;
                this.isButtonDisabled = true;
                wizard.goNext(); // Solo avanza si la operación fue exitosa
            }
        });
    } else if (step === 3) {
      this.isButtonDisabled = false;
      wizard.stop(); // Detiene el avance inmediatamente
        this.counterPreview++;
        const invalidFields = [];
        if (!this.inspeccionesForm.get('elementos')?.valid) invalidFields.push('Elementos');
        if (!this.inspeccionesForm.get('tipo')?.valid) invalidFields.push('Tipo');
        if (!this.inspeccionesForm.get('cantidad_inspeccion')?.valid) invalidFields.push('Cantidad');
        if (!this.inspeccionesForm.get('unidad_medida')?.valid) invalidFields.push('Unidad de medida');
        if (!this.inspeccionesForm.get('descripcion')?.valid) invalidFields.push('Descripción');
    
        if (invalidFields.length > 0) {
            wizard.stop();
            Swal.fire({
                icon: 'error',
                title: 'Campos Incompletos',
                text: `Los siguientes campos son requeridos: ${invalidFields.join(', ')}`
            });
            return;
        }
        this.isSaving = true;
        this.segmentacionGuardado.tercerPaso(
            this.inspeccionesForm.get('elementos')?.value || [],
            this.inspeccionesForm.get('cantidad_inspeccion')?.value || [],
            this.inspeccionesForm.get('unidad_medida')?.value || [],
            this.inspeccionesForm.get('tipo')?.value || [],
            this.inspeccionesForm.get('descripcion')?.value || [],
          Number(sessionStorage.getItem('id_calendarizacion')) || 0,
        ).then(success => {
            if (success) {
               this.isSaving = false;
                this.isButtonDisabled = true;
                wizard.goNext(); // Solo avanza si la operación fue exitosa
        
            }
        });
    } else if (step === 4) {
        this.counterPreview++;
        this.isButtonDisabled = false;
        wizard.stop(); // Detiene el avance inmediatamente
        if (this.deterioroData.length === 0) {
            wizard.stop();
            Swal.fire({
                icon: 'error',
                title: 'Deterioros No Registrados',
                text: 'Debe seleccionar al menos un tipo de deterioro para continuar con la inspección.'
            });
            return;
        }
    
        const invalidDeterioro = this.deterioroData.find(deterioro =>
            deterioro.condicion !== 'ninguno' && (!deterioro.observaciones || !deterioro.observaciones.trim())
        );
    
        if (invalidDeterioro) {
            wizard.stop();
            Swal.fire({
                icon: 'error',
                title: 'Observaciones Requeridas',
                text: `El deterioro "${invalidDeterioro.nombre}" requiere observaciones al no estar marcado como "Ninguno". Por favor, describa brevemente la situación.`
            });
            return;
        }
        this.isSaving = true;
        this.segmentacionGuardado.cuartoPaso(
            this.deterioroData || [],
          Number(sessionStorage.getItem('id_calendarizacion')) || 0,
        ).then(success => {
            if (success) {
              this.isSaving = false;
                this.isButtonDisabled = true;
                wizard.goNext(); // Solo avanza si la operación fue exitosa
            }
        });
    } else if (step === 5) {
      this.isButtonDisabled = false;
      wizard.stop(); // Detiene el avance inmediatamente
        this.counterPreview++;
        const invalidFields = [];
        if (!this.inspeccionesForm.get('condicionGeneral')?.valid) invalidFields.push('Condición General');
        if (!this.inspeccionesForm.get('plazoIntervencion')?.valid) invalidFields.push('Plazo de Intervención');
        if (!this.inspeccionesForm.get('observacionesGenerales')?.valid) invalidFields.push('Observaciones Generales');
    
        if (invalidFields.length > 0) {
            wizard.stop();
            Swal.fire({
                icon: 'error',
                title: 'Resumen Incompleto',
                text: `Para finalizar el resumen, complete los siguientes campos: ${invalidFields.join(', ')}`
            });
            return;
        }
        this.isSaving = true;
        this.segmentacionGuardado.quintoPaso(
            this.inspeccionesForm.get('condicionGeneral')?.value || [],
            this.inspeccionesForm.get('plazoIntervencion')?.value || [],
            this.inspeccionesForm.get('intervencion')?.value || [],
            this.inspeccionesForm.get('plazo')?.value || [],
            this.inspeccionesForm.get('observacionesGenerales')?.value || [],
          Number(sessionStorage.getItem('id_calendarizacion')) || 0,
        ).then(success => {
            if (success) {
              this.isSaving = false;
                this.isButtonDisabled = true;
                wizard.goNext(); // Solo avanza si la operación fue exitosa
            }
        });
    } else if (step === 6) {
      this.isButtonDisabled = false;
      wizard.stop(); // Detiene el avance inmediatamente
        this.counterPreview++;
        if (this.fotografiaFinalPreview.length === 0) {
            wizard.stop();
            Swal.fire({
                icon: 'error',
                title: 'Fotografía Final Requerida',
                text: 'Para documentar el estado final, es necesario tomar una fotografía del elemento inspeccionado.'
            });
            return;
        }
        this.isSaving = true;
        this.segmentacionGuardado.sextoPaso(
            this.inspeccionesForm.get('fotografia_final')?.value,
          Number(sessionStorage.getItem('id_calendarizacion')) || 0,
        ).then(success => {
            if (success) {
                 this.isSaving = false;
               
                this.isButtonDisabled = true;
                wizard.goNext(); // Solo avanza si la operación fue exitosa

            }else {
              this.isSaving = false;
                }
        });
    } else if (step === 7) {
        this.isButtonDisabled = false;
        wizard.stop(); // Detiene el avance inmediatamente
        this.counterPreview++;
        this.isSaving = true;
        this.segmentacionGuardado.septimoPaso(
            this.inspeccionesForm.get('fotografias_adicionales')?.value,
          Number(sessionStorage.getItem('id_calendarizacion')) || 0,
        ).then(success => {
            if (success) {
                this.isButtonDisabled = true;
                this.isSaving = false;
                wizard.goNext(); // Solo avanza si la operación fue exitosa
            }else {
              this.isSaving = false;
                }
        });
    }
    
    });
    this.isSaving = false; 
    this._wizardObj.on('submit', (wizard: any) => {
        this.isSaving = true; 
        
        this.nivelService.pasoFinal(Number(sessionStorage.getItem('id_calendarizacion')) || 0).subscribe(
          (response) => {
            if (response.status === 200) {
              this.isSaving = false; 
              sessionStorage.removeItem('id_calendarizacion');
              sessionStorage.removeItem('id_usuario');
              sessionStorage.removeItem('tipo');
              sessionStorage.removeItem('pasoActividad');
              Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Inspeción finalizada correctamente.'
              });
              this.router.navigate(['/inspecciones/infraestructura']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Ha ocurrido un error al finalizar la inspección: ${response.error}`
              });
            }
          },
          (error) => {
            this.isSaving = false; 
            let errorMessage = 'Ha ocurrido un error al finalizar la inspección: \n';
            
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
    
  );
  }

  prevFunciontController() {

   this.counterPreview--;
   if (this.counterPreview === 1) {
    this.isButtonDisabled = true;
   }else {
    this.isButtonDisabled = false;
   }
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0]; // Solo se tomará el primer archivo
        // Aquí puedes manejar el archivo (por ejemplo, guardarlo en una variable o subirlo a un servidor)
    }
}

  getUbicaciones(): void {
    this.nivelService.getUbicaciones().subscribe(
      (data) => {
        this.ubicaciones = data;

      },
      (error) => {
        console.error('Error al cargar ubicaciones:', error);
      }
    );
  }

  onCampusChange(event: any): void {
    const campusId = event.target.value;
    this.selectedCampus = this.ubicaciones.find(campus => campus.id == campusId);
    this.selectedEdificio = null; // Resetear edificio y nivel
    this.selectedNivel = null;
    this.inspeccionesForm.get('id_instalacion')?.setValue(''); 
  }

  onEdificioChange(event: any): void {
    const edificioId = event.target.value;
    this.selectedEdificio = this.selectedCampus?.edificios.find((edificio: Edificio) => edificio.id == edificioId);
    this.selectedNivel = null; // Resetear nivel
    this.inspeccionesForm.get('id_instalacion')?.setValue(''); 
  }

  onNivelChange(event: any): void {
    const nivelId = event.target.value;
    this.selectedNivel = this.selectedEdificio?.niveles.find((nivel: Nivel) => nivel.id == nivelId);

  }

  onInstalacionChange(event: any): void {
    const instalacionId = Number(event.target.value); // Convertir el valor a number
    this.inspeccionesForm.get('id_instalacion')?.setValue(instalacionId);
  }

  // Función para actualizar la condición seleccionada
  updateCondition(deterioro: any, condition: string) {
    deterioro.ninguno = condition === 'ninguno';
    deterioro.leve = condition === 'leve';
    deterioro.grave = condition === 'grave';
    this.saveSelectedDeterioro(deterioro);
  }

  // Función para limpiar la selección
  clearSelection(index: number) {
    this.deterioros[index].ninguno = false;
    this.deterioros[index].leve = false;
    this.deterioros[index].grave = false;
    this.deterioros[index].observaciones = '';
    this.saveSelectedDeterioro(this.deterioros[index]);
  }

  onObservacionesChange(event: Event, deterioro: Deterioro): void {
    const textarea = event.target as HTMLTextAreaElement; // Afirmación de tipo
    deterioro.observaciones = textarea.value; // Usar textarea.value
    this.saveSelectedDeterioro(deterioro);
  }

  public saveSelectedDeterioro(deterioro: Deterioro) {
    // Verifica si el deterioro ya está en deterioroData
    const index = this.deterioroData.findIndex(item => item.id === deterioro.id);

    if (deterioro.ninguno || deterioro.leve || deterioro.grave) {
      if (index === -1) {
        // Si no está, lo agregamos a deterioroData
        this.deterioroData.push({
          id: deterioro.id,
          nombre: deterioro.nombre,
          condicion: deterioro.ninguno ? 'ninguno' : deterioro.leve ? 'leve' : 'grave',
          observaciones: deterioro.observaciones
        });
      } else {
        // Si ya está, actualizamos la condición y las observaciones
        this.deterioroData[index].condicion = deterioro.ninguno ? 'ninguno' : deterioro.leve ? 'leve' : 'grave';
        this.deterioroData[index].observaciones = deterioro.observaciones;
      }
    } else {
      // Si no hay condición seleccionada, eliminamos el deterioro de deterioroData
      if (index !== -1) {
        this.deterioroData.splice(index, 1);
      }
    }
    this.inspeccionesForm.get('deterioroDatas')?.setValue(this.deterioroData);
  }

  onFotografiaInicialChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
        const control = this.inspeccionesForm.get('fotografia_inicial') as FormArray;

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


  onFotografiaFinalChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
        const control = this.inspeccionesForm.get('fotografia_final') as FormArray;

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


onFotografiasAdicionalesChange(event: any): void {
  const files = event.target.files;
  if (files && files.length > 0) {
      const control = this.inspeccionesForm.get('fotografias_adicionales') as FormArray;

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
updateIntervencion(event: Event) {
  const checkbox = event.target as HTMLInputElement;
  const value = checkbox.value;

  if (checkbox.checked) {
    this.intervencionSeleccionada += this.intervencionSeleccionada ? `, ${value}` : value;
  } else {
    const valores = this.intervencionSeleccionada.split(', ').filter(item => item !== value);
    this.intervencionSeleccionada = valores.join(', ');
  }

  this.inspeccionesForm.get('intervencion')?.setValue(this.intervencionSeleccionada);
}

ningunaSelected = false;
updateIntervencionChecks(event: Event) {
  const checkbox = event.target as HTMLInputElement;
  const value = checkbox.value;

  if (value === 'Ninguna') {
    // Si se selecciona "Ninguna"
    this.ningunaSelected = checkbox.checked;
    if (this.ningunaSelected) {
      this.intervencionSeleccionada = 'Ninguna';
      // Setear plazoIntervencion como "Ninguno"
      this.inspeccionesForm.patchValue({
        plazoIntervencion: 'Ninguno',
        plazoValor: 0,
        unidadPlazo: 'dias'
      });
      // Deshabilitar y limpiar unidadPlazo
      this.inspeccionesForm.get('unidadPlazo')?.disable();
      this.inspeccionesForm.get('plazoValor')?.disable();
      
      // Deseleccionar otros checkboxes
      const checkboxes = document.querySelectorAll('input[name="intervencionRequerida"]:not([value="Ninguna"])');
      checkboxes.forEach((cb: any) => {
        cb.checked = false;
      });
    } else {
      // Si se deselecciona "Ninguna", habilitar los campos
      this.inspeccionesForm.get('unidadPlazo')?.enable();
      this.inspeccionesForm.get('plazoValor')?.enable();
    }
  } else {
    // Si se selecciona cualquier otra opción
    if (checkbox.checked) {
      // Deseleccionar "Ninguna" y habilitar campos
      const ningunaCheckbox = document.querySelector('input[value="Ninguna"]') as HTMLInputElement;
      if (ningunaCheckbox) {
        ningunaCheckbox.checked = false;
        this.ningunaSelected = false;
        this.inspeccionesForm.get('unidadPlazo')?.enable();
        this.inspeccionesForm.get('plazo')?.enable();
      }

      // Actualizar intervencionSeleccionada
      this.intervencionSeleccionada = this.intervencionSeleccionada === 'Ninguna' ? value :
        this.intervencionSeleccionada ? `${this.intervencionSeleccionada}, ${value}` : value;
    } else {
      // Remover opción deseleccionada
      const valores = this.intervencionSeleccionada.split(', ').filter(item => item !== value);
      this.intervencionSeleccionada = valores.join(', ');
    }
  }

  // Actualizar el form control
  this.inspeccionesForm.get('intervencion')?.setValue(this.intervencionSeleccionada);
}
removeFotografiaInicial(index: number) {
  this.fotografiaInicialPreview.splice(index, 1); // Elimina la imagen en la posición 'index'
  const control = this.inspeccionesForm.get('fotografia_inicial') as FormArray;
  control.removeAt(index);
}
removeFotografiasAdicionales(index: number) {
  this.fotografiasAdicionalesPreview.splice(index, 1); // Elimina la imagen en la posición 'index'
  const control = this.inspeccionesForm.get('fotografias_adicionales') as FormArray;
  control.removeAt(index);
}
removeFotografiaFinal(index: number) {
  this.fotografiaFinalPreview.splice(index, 1); // Elimina la imagen en la posición 'index'
  const control = this.inspeccionesForm.get('fotografia_final') as FormArray;
  control.removeAt(index);
}


private actualizarPlazoCompleto() {
  const plazoValor = this.inspeccionesForm.get('plazoValor')?.value;
  const unidadPlazo = this.inspeccionesForm.get('unidadPlazo')?.value;
  
  if (plazoValor && unidadPlazo) {
    // Si ambos valores existen, concatenarlos
    const plazoCompleto = `${plazoValor.toString()} ${unidadPlazo}`;
    this.inspeccionesForm.patchValue({
      plazo: plazoCompleto
    }, { emitEvent: false }); // Evitar loop infinito
  }
}
cancelar(): void {
  this.router.navigate(['/calendarizacion']);
}
}

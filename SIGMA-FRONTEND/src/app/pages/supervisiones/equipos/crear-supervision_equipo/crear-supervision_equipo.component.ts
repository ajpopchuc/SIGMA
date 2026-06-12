import { Component, OnInit, AfterViewInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SupervisionService } from '../supervision_equipo.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { co } from '@fullcalendar/core/internal-common';

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
  selector: 'app-crear-supervision_equipo',
  templateUrl: './crear-supervision_equipo.component.html',
  styleUrls: ['./crear-supervision_equipo.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ZXingScannerModule]

})
export class CrearSupervisionEquipoComponent implements AfterViewInit, OnInit {
  private _wizardObj: any;
  private _formEl: any;
  fotografiaInicialPreview: Array<string | ArrayBuffer | null> = [];
  fotografiaFinalPreview: Array<string | ArrayBuffer | null> = [];
  fotografiasAdicionalesPreview: Array<string | ArrayBuffer | null> = [];

  supervisionForm: FormGroup;
  tiempoEjecucion: number = 0;
  isButtonDisabled: boolean = false;
  counterPreview: number = 0;
  id_calendarizacion_navigate: any;
  id_usuario_asignado: any;
  id_mantenimiento: any;
  ubicaciones: any[] = [];
  observacionActivdad: any;

  constructor(
    private fb: FormBuilder,
    private supervisionService: SupervisionService,
    private router: Router,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.supervisionForm = this.fb.group({
      id_mantenimiento: ['', Validators.required],  // Aquí seteaba el id de mantenimiento a 1 pero es correcto
      id_calendario: ['', Validators.required],
      id_usuario_asignado: ['', [Validators.required]],
      // paso 1
      fotografia_inicial: this.fb.array([]),
      // paso 2
      descripcion: ['', Validators.required],
      resumen_actividad: ['', Validators.required],
      observaciones: ['', Validators.required],
      tiempo_ejecucion: ['', [Validators.required]],
      lugar_mantenimiento: ['Equipo'], //esta parte me faltaba creo para poner guardar bien el lugar de mantenimiento
      // paso 3
      fotografia_final: this.fb.array([]),  // Asegúrate de que exista este FormArray
      fotografias_adicionales: this.fb.array([]),  // Agrega este FormArray
      
      
      
    });

    const navigation = this.router.getCurrentNavigation();
    this.id_calendarizacion_navigate = navigation?.extras?.state?.['id_calendarizacion'];
    this.id_usuario_asignado = navigation?.extras?.state?.['id_usuario'];
    this.id_mantenimiento = navigation?.extras?.state?.['id_mantenimiento'];
    this.observacionActivdad = navigation?.extras?.state?.['observaciones'];
  }

  ngOnInit(): void {
    const idCalendario = this.supervisionForm.get('id_calendario');
    const idMantenimiento = this.supervisionForm.get('id_mantenimiento'); // el id_mantenimiento me faltaba ya que lo que obtengo es la palabra "corectivo"
    const idUsuario = this.supervisionForm.get('id_usuario_asignado');

    if (idCalendario && idUsuario && idMantenimiento) {
    idCalendario.setValue(this.id_calendarizacion_navigate);
    idUsuario.setValue(this.id_usuario_asignado);
    idMantenimiento.setValue(this.id_mantenimiento);
    }
      //this.getUbicaciones();
  
    }

    ngAfterViewInit(): void {
      this.initWizard();
    }
 
  private initWizard() {
    this._wizardObj = new KTWizard('kt_wizard', {
      startStep: 1,
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
        this.counterPreview++;
        this.isButtonDisabled = true;
        // aqui se tomara la fotografia inicial para empezar la supervision
        if (this.fotografiaInicialPreview.length === 0) {

          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese una fotografía inicial'
          });
          return;
        }

        //Si se sube la fotografia con exito empezar a contar el tiempo de ejecución
        this.tiempoEjecucion = 0;
        setInterval(() => {
         this.tiempoEjecucion++;
        }, 1000);

      }
      if (step === 3) {
        this.counterPreview++;
        if (!this.supervisionForm.value.resumen_actividad) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese un resumen de la actividad'
          });
          return;
        }
        //Verificar que el campo de observaciones no esté vacío
        if (!this.supervisionForm.value.observaciones) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese observaciones'
          });
          return;
        }
      }
      if (step === 4) {
        this.counterPreview++;
        if (this.fotografiaFinalPreview.length === 0) {
          wizard.stop(); // Detener la navegación
          Swal.fire({
            icon: 'error',
            title: 'Fotografía Final Requerida',
            text: 'Por favor, ingrese una fotografía final'
          });
          return;
        }
        //Si se sube la fotografia con exito se finalizará el contador de tiempo de ejecución
        //Guardo el tiempo de ejecución en una variable para poder mostrarlo en el resumen en minutos, decilames son con dos decimales
        this.supervisionForm.get('tiempo_ejecucion')?.setValue(parseFloat((this.tiempoEjecucion / 60).toFixed(2)));
        //Detengo el contador de tiempo de ejecución
        clearInterval(this.tiempoEjecucion);
      }
      else if (step === 5) {
        this.counterPreview++;

        if (this.fotografiasAdicionalesPreview.length === 0) {
          wizard.stop();
          Swal.fire({
            icon: 'error',
            title: 'Fotografías Adicionales Requeridas',
            text: 'Agregue al menos una fotografía adicional para documentar otros aspectos relevantes de la inspección.'
          });
          return;
        }
      }
    });

    //Agregamos esto antes
    this.isSaving = false; 

    this._wizardObj.on('submit', (wizard: any) => {
      if (this.supervisionForm.valid) {
        const formData = {
          ...this.supervisionForm.value
        };
        //Bloquear el botón mientras se guarda
        this.isSaving = true; 
        this.supervisionService.crearSupervision(this.supervisionForm.value).subscribe(
          (response) => {
            // Rehabilitar el botón cuando termine la operación
            this.isSaving = false;
            if(response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Supervision creada',
                text: 'Supervision de equipo creada correctamente'
              });
              this.router.navigate(['/supervisiones/equipos']);
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ha ocurrido un error al crear la supervision: ' + response.message
              });
            }
          },
          (error) => {
            // Rehabilitar el botón incluso si ocurre un error
            this.isSaving = false; 
            let errorMessage = 'Ha ocurrido un error al crear la supervision: \n';
            console.log("Error en la respuesta del servidor:", error);
    
            // Iteramos sobre el objeto de errores
            if (error.error && error.error.errors) {
              Object.keys(error.error.errors).forEach((field) => {
                error.error.errors[field].forEach((message: string) => {
                  errorMessage += `- ${message}\n`; // Añadimos cada mensaje al string
                });
              });
            } else {
              errorMessage += "- Error desconocido.";
            }
          
            // Mostrar el mensaje concatenado en Swal
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage
            });
          }
        );
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Por favor, tiene errores en su formulario'
        });
      }
    }); 
  }

  isSaving: boolean = false;  //agregamos esto afuera de la funcion para declararla

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

onFotografiaInicialChange(event: any): void {
  const files = event.target.files;
  if (files && files.length > 0) {
      const control = this.supervisionForm.get('fotografia_inicial') as FormArray;

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
  const control = this.supervisionForm.get('fotografia_inicial') as FormArray;
  control.removeAt(index);
}

onFotografiaFinalChange(event: any): void {
  const files = event.target.files;
  if (files && files.length > 0) {
      const control = this.supervisionForm.get('fotografia_final') as FormArray;

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
  const control = this.supervisionForm.get('fotografia_final') as FormArray;
  control.removeAt(index);
}


onFotografiasAdicionalesChange(event: any): void {
  const files = event.target.files;
  if (files && files.length > 0) {
      const control = this.supervisionForm.get('fotografias_adicionales') as FormArray;

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
  const control = this.supervisionForm.get('fotografias_adicionales') as FormArray;
  control.removeAt(index);
}

cancelar(): void {
  this.router.navigate(['/calendarizacion']);
}
  
}

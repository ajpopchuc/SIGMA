import { inject, Injectable } from "@angular/core";
import { InspeccionesEquiposService } from "../inspecciones-equipos.service";
import { FormArray, FormBuilder } from "@angular/forms";
import Swal from "sweetalert2";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root', // Esto lo hace disponible a toda la aplicación
})

export class SegmentacionGuardado {
inspeccionesForm: any;
constructor(
  private inspeccionesequipoService:InspeccionesEquiposService,
  private fb: FormBuilder,
      private router: Router,
){
    this.inspeccionesForm = this.fb.group({
      id_calendario:[''],
      motivo: [''],
      pasoActividad:[''],
      tiempo_ejecucion: [''],
      tipo_inspeccion: [''],
      fotografia_inicial: this.fb.array([]),
      //step2
      id_instalacion: [''],

      //step3
      elementos: [''],
      cantidad_inspeccion: [''],
      unidad_medida: [''],
      tipo: [''],
      descripcion: [''],
      //step4
      deterioroDatas:[],
      //step5
      condicionGeneral: [''],
      plazoIntervencion: [''],
      intervencion: [''],
      plazo: [''], // This will store the concatenated value
      observacionesGenerales: [''],
      //step6
      fotografia_final: this.fb.array([]),
      //step7
      fotografias_adicionales: this.fb.array([]),
    });  
  }

  public primerPaso(
    firsImage: Array<File>,
    id_calendar: number,
    motivo: string
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const fotografiaInicialArray = this.inspeccionesForm.get('fotografia_inicial') as FormArray;
      fotografiaInicialArray.clear();
  
      if (firsImage && Array.isArray(firsImage)) {
        firsImage.forEach((file) => {
          fotografiaInicialArray.push(this.fb.control(file));
        });
      }
  
      this.inspeccionesForm.patchValue({
        id_calendario: id_calendar,
        motivo: motivo,
        pasoActividad: 2,
        tipo_inspeccion: 'Equipos'
      });
  
      this.inspeccionesequipoService.paso1(this.inspeccionesForm.value).subscribe({
        next: (response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Paso 1 completado',
              text: 'Fotografía inicial guardada correctamente'
            });
            resolve(true); // Resuelve la promesa con éxito
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Ha ocurrido un error guardar los datos: ${response.error}`
            });
            resolve(false); // Resuelve la promesa con fallo
          }
        },
        error: (error) => {
          let errorMessage = 'Ha ocurrido un error guardar los datos: \n';
          if (error.error && error.error.errors) {
            Object.keys(error.error.errors).forEach((field) => {
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`;
              });
            });
          } else {
            errorMessage += 'Error desconocido';
          }
  
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          });
          resolve(false); // Resuelve la promesa con fallo
        }
      });
    });
  }
  
  public segundoPaso(
    id_instalacion: number,
    id_calendario: number,
    elementos: string,
    cantidad_inspeccion: string,
    unidad_medida: string,
    tipo: string,
    descripcion: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Configurar valores base para el formulario
      this.inspeccionesForm.patchValue({
        id_instalacion: id_instalacion,
        id_calendario: id_calendario,
        pasoActividad: 3, 
        elementos:elementos,
        cantidad_inspeccion:cantidad_inspeccion,
        unidad_medida:unidad_medida,
        tipo: tipo,
        descripcion: descripcion
      });
  
      // Llamar al servicio unificado
      this.inspeccionesequipoService.paso2(this.inspeccionesForm.value).subscribe({
        next: (response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Paso 2 completado',
              text: 'Ubiación y descripción guardados correctamente'
            });
            resolve(true); // Resuelve la promesa con éxito
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Ha ocurrido un error guardar los datos: ${response.error}`
            });
            resolve(false); // Resuelve la promesa con fallo
          }
        },
        error: (error) => {
          let errorMessage = 'Ha ocurrido un error guardar los datos: \n';
          if (error.error && error.error.errors) {
            Object.keys(error.error.errors).forEach((field) => {
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`;
              });
            });
          } else {
            errorMessage += 'Error desconocido';
          }
  
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          });
          resolve(false); // Resuelve la promesa con fallo
        }
      });
    });
  }
  
  public tercerPaso(deterioroDatasv2: any[],  id_calendario: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.inspeccionesForm.patchValue({
        deterioroDatas: deterioroDatasv2,
        pasoActividad: 4,
        id_calendario: id_calendario
      });
  
      // Validación
      if (deterioroDatasv2.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Deterioros No Registrados',
          text: 'Debe seleccionar al menos un deterioro para continuar con la inspección.'
        });
        resolve(false);
        return;
      }
  
      this.inspeccionesequipoService.paso3(this.inspeccionesForm.value).subscribe({
        next: (response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Paso 3 completado',
              text: 'Condición del elemento guardado correctamente'
            });
            resolve(true); // Resuelve la promesa con éxito
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Ha ocurrido un error guardar los datos: ${response.error}`
            });
            resolve(false); // Resuelve la promesa con fallo
          }
        },
        error: (error) => {
          let errorMessage = 'Ha ocurrido un error guardar los datos: \n';
          if (error.error && error.error.errors) {
            Object.keys(error.error.errors).forEach((field) => {
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`;
              });
            });
          } else {
            errorMessage += 'Error desconocido';
          }
  
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          });
          resolve(false); // Resuelve la promesa con fallo
        }
      });
    });
  }
  
  public cuartoPaso(
    condicionGeneralv2: string,
    plazoIntervencionv2: string,
    intervencionv2: string,
    plazo: string,
    observacionesGenerales: string,
    id_calendario: number
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.inspeccionesForm.patchValue({
        condicionGeneral: condicionGeneralv2,
        plazoIntervencion: plazoIntervencionv2,
        intervencion: intervencionv2,
        plazo: plazo,
        observacionesGenerales: observacionesGenerales,
        pasoActividad: 5,
        id_calendario: id_calendario
      });
  
      // Validación
      if (!condicionGeneralv2 || !plazoIntervencionv2 || !intervencionv2 || !plazo || !observacionesGenerales) {
        Swal.fire({
          icon: 'error',
          title: 'Campos Incompletos',
          text: 'Debe completar todos los campos para continuar con la inspección.'
        });
        resolve(false);
        return;
      }
  
      this.inspeccionesequipoService.paso4(this.inspeccionesForm.value).subscribe({
        next: (response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Paso 4 completado',
              text: 'Resumen de inspección guardado correctamente'
            });
            resolve(true); // Resuelve la promesa con éxito
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Ha ocurrido un error guardar los datos: ${response.error}`
            });
            resolve(false); // Resuelve la promesa con fallo
          }
        },
        error: (error) => {
          let errorMessage = 'Ha ocurrido un error guardar los datos: \n';
          if (error.error && error.error.errors) {
            Object.keys(error.error.errors).forEach((field) => {
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`;
              });
            });
          } else {
            errorMessage += 'Error desconocido';
          }
  
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          });
          resolve(false); // Resuelve la promesa con fallo
        }
      });
    });
  }
  
  public quintoPaso(
    ultimaImagenv2: Array<string | ArrayBuffer | null>,
    
    id_calendario: number
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const fotografiaInicialArray = this.inspeccionesForm.get('fotografia_final') as FormArray;
  
      // Limpia cualquier valor previo en el FormArray
      fotografiaInicialArray.clear();
  
      // Agrega los nuevos valores al FormArray
      ultimaImagenv2.forEach((image) => {
        fotografiaInicialArray.push(this.fb.control(image));
      });
  
      // Validación
      if (ultimaImagenv2.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Fotografía Final Requerida',
          text: 'Debe tomar una fotografía final para continuar con la inspección.'
        });
        resolve(false);
        return;
      }
      this.inspeccionesForm.patchValue({
        id_calendario: id_calendario,
        pasoActividad: 6,

      });
      this.inspeccionesequipoService.paso5(this.inspeccionesForm.value).subscribe({
        next: (response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Paso 5 completado',
              text: 'Fotografía final guardada correctamente'
            });
            resolve(true); // Resuelve la promesa con éxito
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Ha ocurrido un error guardar los datos: ${response.error}`
            });
            resolve(false); // Resuelve la promesa con fallo
          }
        },
        error: (error) => {
          let errorMessage = 'Ha ocurrido un error guardar los datos: \n';
          if (error.error && error.error.errors) {
            Object.keys(error.error.errors).forEach((field) => {
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`;
              });
            });
          } else {
            errorMessage += 'Error desconocido';
          }
  
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          });
          resolve(false); // Resuelve la promesa con fallo
        }
      });
    });
  }
  
  public sextoPaso(
    imagenesAdicionalesv2: Array<string | ArrayBuffer | null>,
    
    id_calendario: number
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const fotografiaInicialArray = this.inspeccionesForm.get('fotografias_adicionales') as FormArray;
  
      // Limpia cualquier valor previo en el FormArray
      fotografiaInicialArray.clear();
  
      // Agrega los nuevos valores al FormArray
      imagenesAdicionalesv2.forEach((image) => {
        fotografiaInicialArray.push(this.fb.control(image));
      });
  

      this.inspeccionesForm.patchValue({
        id_calendario: id_calendario,
        pasoActividad: 7,

      });
      this.inspeccionesequipoService.paso6(this.inspeccionesForm.value).subscribe({
        next: (response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: 'success',
              title: 'Paso 6 completado',
              text: 'Fotografías adicionales guardadas correctamente'
            });
            resolve(true); // Resuelve la promesa con éxito
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Ha ocurrido un error guardar los datos: ${response.error}`
            });
            resolve(false); // Resuelve la promesa con fallo
          }
        },
        error: (error) => {
          let errorMessage = 'Ha ocurrido un error guardar los datos: \n';
          if (error.error && error.error.errors) {
            Object.keys(error.error.errors).forEach((field) => {
              error.error.errors[field].forEach((message: string) => {
                errorMessage += `- ${message}\n`;
              });
            });
          } else {
            errorMessage += 'Error desconocido';
          }
  
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage
          });
          resolve(false); // Resuelve la promesa con fallo
        }
      });
    });
  }
  
  

}
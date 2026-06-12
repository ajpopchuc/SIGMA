import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { ActivoService } from './activo.service';
import {URLFOTOS} from '../../../constants/api_url';
import { PermisosService } from '../../../service/permisos.service';  


@Component({
  selector: 'app-activo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxPaginationModule],
  templateUrl: './activo.component.html',
  styleUrls: ['./activo.component.css']
})
export class ActivoComponent {
  activos: any[] = [];
  filteredActivosList: any[] = [];
  searchText: string = '';
  selectedStatus: string = 'Activo';
  currentPage: number = 1;
  itemsPerPage: number = 25;
  qrUrl: string = '';
  codigoActivo: string = '';
  constructor(private activoService: ActivoService, private router: Router, public servicePermiso: PermisosService) {}

  ngOnInit(): void {
    this.fetchActivos();
  }

  fetchActivos(): void {
    this.activoService.getActivos().subscribe(
      (data) => {
        this.activos = data.data;
        this.filterActivoList();
      },
      (error) => {
        console.error('Error fetching activos:', error);
      }
    );
  }

  filterActivoList(): void {
    this.filteredActivosList = this.activos.filter(activo => {
      const matchesSearchText = activo.nombre.toLowerCase().includes(this.searchText.toLowerCase()) || 
                                activo.codigo.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                activo.descripcion.toLowerCase().includes(this.searchText.toLowerCase()) ||
                                activo.precio.toLowerCase().includes(this.searchText.toLowerCase()) || 
                                activo.fecha_adquisicion.toLowerCase().includes(this.searchText.toLowerCase()) || 
                                activo.nombre_instalacion.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.selectedStatus === 'todos' || activo.estado === this.selectedStatus;

      return matchesSearchText && matchesStatus; 
    });
    this.currentPage = 1;
  }

  onSearchTextChange(): void {
    this.filterActivoList();
  }

  onStatusChange(): void {
    this.fetchActivos();
  }

  changeEstado(id: number): void {
    this.activoService.cambiarEstado(id).subscribe(
      (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Estado',
          text: 'Estado del activo actualizado correctamente'
        });
        this.fetchActivos();
      },
      (error) => {
        console.error('Error cambiando estado del activo:', error);
      }
    );
  }

  editActivo(activo: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        activo: { 
          nombre: activo.nombre,
          codigo: activo.codigo,
          descripcion: activo.descripcion,
          precio: activo.precio,
          fecha_adquisicion: activo.fecha_adquisicion,
          id: activo.id,
          id_instalacion: activo.id_instalacion,
          
        }
      }
    };
    this.router.navigate(['/activos/editar'], navigationExtras);
  }

  // Método para mostrar el QR del activo
  showQRCode(activoId: number, nombreActivo: string, codigoActivo: string) {
    this.activoService.getQRCode(activoId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.displayQRCode(response.data.url, nombreActivo, codigoActivo);
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Sin código QR',
            text: 'Este activo no tiene un código QR generado.'
          });
        }
      },
      error: (error) => {
        if (error.status === 404) {
          Swal.fire({
            icon: 'info',
            title: 'Sin código QR',
            text: 'Este activo no tiene un código QR generado.'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al obtener el código QR.'
          });
        }
      }
    });
  }

  // Método actualizado para mostrar el QR en un Swal modal
  private displayQRCode(qrUrl: string, nombreActivo: string, codigoActivo: string) {
      Swal.fire({
          title: `Código QR - ${nombreActivo}`,
          html: `
              <div class="text-center">
                  <h4 class="mb-3">${nombreActivo}</h4>
                  <p class="mb-3"><strong>Código:</strong> ${codigoActivo}</p>
                  <img src="${qrUrl}" alt="Código QR" style="max-width: 100%; height: auto;">
              </div>
          `,
          width: 600,
          showCloseButton: true,
          showDenyButton: true,
          showConfirmButton: true,
          denyButtonText: 'Imprimir',
          confirmButtonText: 'Descargar',
          showCancelButton: true,
          cancelButtonText: 'Cerrar',
          denyButtonColor: '#28a745',
          confirmButtonColor: '#0d6efd',
          cancelButtonColor: '#6c757d',
      }).then((result) => {
          if (result.isDenied) {
              this.printQR(qrUrl, nombreActivo, codigoActivo);
          }
          if (result.isConfirmed) {
              this.downloadImage(qrUrl, nombreActivo, codigoActivo);
          }
      });

      this.qrUrl = qrUrl;
  }


  private printQR(qrUrl: string, nombreActivo: string, codigoActivo: string) {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${nombreActivo} - Código QR</title>
          <style>
            body { margin: 20px; text-align: center; }
            img { max-width: 100%; height: auto; }
            .asset-info { margin: 20px 0; }
            .asset-code { font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="asset-info">
            <h2>${nombreActivo}</h2>
            <p class="asset-code">Código: ${codigoActivo}</p>
          </div>
          <img src="${qrUrl}" alt="Código QR">
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El navegador bloqueó la ventana emergente. Por favor, permita ventanas emergentes para esta página.'
      });
    }
  }

  downloadImage(url: string, nombreActivo: string, codigo: string): void {
      const filename = url.split('/').pop() || 'default-filename.png';
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
          console.error('Could not get canvas context');
          Swal.fire('Error', 'No se pudo crear el contexto del canvas', 'error');
          return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height + 80;

          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = 'black';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(nombreActivo, canvas.width / 2, 25);

          ctx.font = '16px Arial';
          ctx.fillText(`Código: ${codigo}`, canvas.width / 2, 50);

          ctx.drawImage(img, 0, 80);

          canvas.toBlob((canvasBlob) => {
              if (!canvasBlob) {
                  console.error('Could not create blob from canvas');
                  Swal.fire('Error', 'No se pudo generar la imagen', 'error');
                  return;
              }
              const downloadUrl = window.URL.createObjectURL(canvasBlob);
              const link = document.createElement('a');
              link.href = downloadUrl;
              link.download = `${nombreActivo}-QR.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(downloadUrl);
          }, 'image/png');
      };

      img.onerror = () => {
          console.error('Error loading image');
          Swal.fire('Error', 'No se pudo cargar la imagen QR', 'error');
      };
      img.src = `${URLFOTOS}`+ "qrcodes/"+`${filename}`; 
  }
}

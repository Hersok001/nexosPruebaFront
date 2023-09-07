import { Component } from '@angular/core';
import * as $ from 'jquery';
import { MercanciaService } from './mercancia.service';
import { Mercancia, Usuario } from './entities';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { UsuarioService } from './usuario.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  mercancia: Mercancia[] = [];
  nuevaMercancia: Mercancia = new Mercancia();
  editMercancia: Mercancia = new Mercancia();
  usuarioSelectd: Usuario = new Usuario(); 
  listaDeUsuarios: Usuario[] = []; // Arreglo para almacenar los usuarios
  listaDeUsuariosEliminar: Usuario[] = []; // Arreglo para almacenar los usuarios
  fechaActual: string; 
  filtroNombreProducto: string = ''; 

   //inyectamos lo que vamos a utilizar en el componente
   constructor(
    private mercanciaService: MercanciaService,private usuarioServico: UsuarioService
  ) {}

  ngOnInit(): void {
    this.listar();
    this.cargarUsuarios();
    this.obtenerFechaActual();
  }

  obtenerFechaActual(){
     // Obtener la fecha actual y formatearla como YYYY-MM-DD
     const today = new Date();
     const year = today.getFullYear();
     const month = (today.getMonth() + 1).toString().padStart(2, '0');
     const day = today.getDate().toString().padStart(2, '0');
     this.fechaActual = `${year}-${month}-${day}`;
  }
  


  listar(): void {
    this.mercanciaService.getMercancia().subscribe((res) => {
      this.mercancia = res as Mercancia[];
    });
  }

  exportar() {
    this.mercanciaService.exportarExcel().subscribe(
      (response) => {
        this.handleFileDownload(response);
        //alert success
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })
        
        Toast.fire({
          icon: 'success',
          title: 'Descargado, revisa tu carpeta de descargas'
        })
      },
      (error) => {
        console.log("Error al descargar el archivo")
      }
    );
  }

  private handleFileDownload(response: any) {
    const contentDispositionHeader = response.headers.get('content-disposition');
    const filename = contentDispositionHeader
      ? contentDispositionHeader.split(';')[1].split('=')[1]
      : 'archivo.xlsx';

    const blob = new Blob([response.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);
  }


  eliminarMercancia(item: Mercancia) {
    const creatorId = item.usuario.id;
    
  //dibujamos un select 
  const selectHTML = `
        <select id="userSelect" class="form-control">
          ${this.listaDeUsuariosEliminar.map(user => `<option value="${user.id}">${user.nombre}</option>`).join('')}
        </select>
      `;


    Swal.fire({
      title: '¿Eliminar?',
      html: `
        <div>
          <p>¿Estás seguro de que deseas eliminar este producto de Mercancia?</p>
          <label>Selecciona tu usuario</label>
          ${selectHTML}
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const selectedValue =  parseInt((document.getElementById('userSelect') as HTMLSelectElement).value);
        if (selectedValue === creatorId) {
          return true; // El usuario seleccionado puede eliminar
        } else {
          Swal.showValidationMessage('Solo el usuario que crea el producto lo puede eliminar');
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.mercanciaService.eliminarMercancia(item.id).subscribe(
          () => {
            Swal.fire('Mercancia Eliminada', '', 'success');
            this.listar();
          },
          (error) => {
            Swal.fire('Error', 'Contacte con su administrador...', 'error');
          }
        );
      }
    });
  }

  guardarMercancia(): void {
    if (this.validarCampos()) {
      this.nuevaMercancia.usuario = this.usuarioSelectd
      this.nuevaMercancia.usuarioRegistro = this.usuarioSelectd
      this.mercanciaService.crearMercancia(this.nuevaMercancia)
        .subscribe(
          (response) => { 
            console.log(response);  
            if (response.status === 201) {   
              Swal.fire('Éxito', 'La mercancía se ha creado correctamente', 'success');
              this.listar();
            this.nuevaMercancia = new Mercancia();
            }if (response.status === 400) {   
              Swal.fire('Error', 'No se ha podido crear la mercancía', 'success');
              this.listar();
            this.nuevaMercancia = new Mercancia();
            }
          
          },
          (error) => {
            // Manejar errores de solicitud aquí
            Swal.fire('Error', 'Hubo un error al realizar la solicitud', 'error');
          }
        );
    }
  }

  cargarUsuarios(): void {
    this.usuarioServico.getAllUsuarios().subscribe(
      (usuarios) => {
        this.listaDeUsuarios = usuarios;
        this.listaDeUsuariosEliminar = usuarios;
      },
      (error) => {
        console.error('Error al cargar usuarios', error);
      }
    );
  }

  validarCampos(): boolean {
    // Validar que los campos estén completos
    if (
      !this.nuevaMercancia.nombreProducto ||
      !this.nuevaMercancia.cantidad ||
      !this.nuevaMercancia.fechaIngreso ||
      !this.usuarioSelectd.id
    ) {
      // Mostrar una alerta de SweetAlert2 para indicar campos incompletos
      Swal.fire('Error', 'Todos los campos son requeridos', 'error');
      return false; // La validación falló
    }

    // Si todos los campos están completos, la validación es exitosa
    return true;
  }

  editarMercancia(item: Mercancia){
    this.editMercancia = { ...item };
  }

  clearValues(){
    this.nuevaMercancia = new Mercancia ();
  }

  guardarEditMercancia(): void {
    if (this.validarCamposEdit()) {
      this.editMercancia.usuarioRegistro = this.usuarioSelectd
      this.editMercancia.fechaModificacion = new Date();
      this.mercanciaService.crearMercancia(this.editMercancia)
        .subscribe(
          (response) => { 
            console.log(response);  
            if (response.status === 201) {   
              Swal.fire('Éxito', 'La mercancía se ha modificado correctamente', 'success');
              this.listar();
            this.nuevaMercancia = new Mercancia();
            }if (response.status === 400) {   
              Swal.fire('Error', 'No se ha podido modificar la mercancía', 'success');
              this.listar();
            this.nuevaMercancia = new Mercancia();
            }
          
          },
          (error) => {
            // Manejar errores de solicitud aquí
            Swal.fire('Error', 'Hubo un error al realizar la solicitud', 'error');
          }
        );
    }
  }

  validarCamposEdit(): boolean {
    // Validar que los campos estén completos
    if (
      !this.editMercancia.nombreProducto ||
      !this.editMercancia.cantidad ||
      !this.editMercancia.fechaIngreso ||
      !this.usuarioSelectd.id
    ) {
      // Mostrar una alerta de SweetAlert2 para indicar campos incompletos
      Swal.fire('Error', 'Todos los campos son requeridos', 'error');
      return false; // La validación falló
    }

    // Si todos los campos están completos, la validación es exitosa
    return true;
  }

   // Función para filtrar la lista mercancia por nombre del producto
   filtrarPorNombreProducto() {
    debugger;
    if (this.filtroNombreProducto.trim() === '') {
       this.listar();
      return this.mercancia;
    } else {
     
      this.mercancia = this.mercancia.filter(item =>
        item.nombreProducto.toLowerCase().includes(this.filtroNombreProducto.toLowerCase())
      );
      return this.mercancia;
    }
  }


 
}




  



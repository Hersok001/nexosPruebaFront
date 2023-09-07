// Clase TypeScript para la entidad Mercancia
export class Mercancia {
  id: number;
  nombreProducto: string;
  cantidad: number;
  fechaIngreso: Date;
  fechaModificacion: Date;
  usuarioRegistro: Usuario;
  usuario: Usuario;
}

// Clase TypeScript para la entidad Usuario
export class Usuario {
  id: number;
  nombre: string;
  edad: number;
  fechaIngreso: Date;
  cargo: Cargo;
  permiso: Permiso;
  correo: string;
}

// Clase TypeScript para la entidad Cargo
export class Cargo {
  // Define los campos necesarios para la entidad Cargo
}

// Clase TypeScript para la entidad Permiso
export class Permiso {
  // Define los campos necesarios para la entidad Permiso
}
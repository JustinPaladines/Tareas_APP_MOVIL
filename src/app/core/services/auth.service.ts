
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private supabaseService: SupabaseService) {}

  // Registrar usuario
    async registrar(nombre: string, email: string, password: string) {
    return await this.supabaseService.supabase.auth.signUp({
        email,
        password,
        options: {
        data: {
            nombre: nombre
      }
    }
  });
}

  // Iniciar sesión
  async iniciarSesion(email: string, password: string) {
    return await this.supabaseService.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  // Cerrar sesión
  async cerrarSesion() {
    return await this.supabaseService.supabase.auth.signOut();
  }

  // Obtener usuario actual
  async obtenerUsuario() {
    return await this.supabaseService.supabase.auth.getUser();
  }

  // Escuchar cambios de autenticación
  escucharSesion() {
    return this.supabaseService.supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Estado de autenticación:', event);
      }
    );
  }

  // Obtener información del perfil
  async obtenerPerfil() {
    const { data: usuario, error: errorUsuario } =
      await this.supabaseService.supabase.auth.getUser();

    if (errorUsuario || !usuario.user) {
      return { data: null, error: errorUsuario };
    }

    return await this.supabaseService.supabase
      .from('usuarios')
      .select('id, nombre, foto_url, descripcion')
      .eq('id', usuario.user.id)
      .single();
  }

  // Actualizar información del perfil
  async actualizarPerfil(nombre: string, descripcion: string) {
    const { data: usuario, error: errorUsuario } =
      await this.supabaseService.supabase.auth.getUser();

    if (errorUsuario || !usuario.user) {
      return { data: null, error: errorUsuario };
    }

    return await this.supabaseService.supabase
      .from('usuarios')
      .update({
        nombre: nombre,
        descripcion: descripcion
      })
      .eq('id', usuario.user.id)
      .select()
      .single();
  }

async subirFotoPerfil(file: File) {
  const { data: usuario, error: errorUsuario } =await this.supabaseService.supabase.auth.getUser();

  if (errorUsuario || !usuario.user) {
    return { data: null, error: errorUsuario };
  }

  // Determinar la extensión de la imagen
  const extensiones: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };

  const extension = extensiones[file.type];

  if (!extension) {
    return {
      data: null,
      error: new Error('Formato de imagen no permitido.')
    };
  }

  

  // Crear la ruta de almacenamiento
  const ruta = `${usuario.user.id}/perfil.${extension}`;

  // Subir la imagen a Supabase Storage
  const { error: errorSubida } =
    await this.supabaseService.supabase.storage
      .from('imagenes-chat')
      .upload(ruta, file, {
        upsert: true,
        contentType: file.type
      });
  console.log('1. Usuario obtenido:', usuario.user.id);

  console.log('2. Iniciando subida:', ruta);

  console.log('3. Resultado de subida:', errorSubida);
  if (errorSubida) {
    return { data: null, error: errorSubida };
  }

  // Guardar la ruta de la imagen en la tabla usuarios
  const { error: errorActualizacion } =
    await this.supabaseService.supabase
      .from('usuarios')
      .update({ foto_url: ruta })
      .eq('id', usuario.user.id);
    console.log('4. Resultado de actualización:', errorActualizacion);

  if (errorActualizacion) {
    return { data: null, error: errorActualizacion };
  }

  return {
    data: { ruta },
    error: null
  };

  
}


async obtenerUrlFotoPerfil(ruta: string) {
  return await this.supabaseService.supabase.storage
    .from('imagenes-chat')
    .createSignedUrl(ruta, 3600);
}


}

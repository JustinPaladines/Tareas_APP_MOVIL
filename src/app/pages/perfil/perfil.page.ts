
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonText,
  IonSpinner
} from '@ionic/angular';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonButton,
    IonText,
    IonSpinner
  ]
})
export class PerfilPage implements OnInit {

  nombre: string = '';
  descripcion: string = '';
  fotoUrl: string = '';

  mensaje: string = '';
  cargando: boolean = true;
  guardando: boolean = false;

  archivoSeleccionado: File | null = null;
  subiendoFoto: boolean = false;

constructor(
  private authService: AuthService,
  private cdr: ChangeDetectorRef
) {}

  async ngOnInit() {
    await this.cargarPerfil();
  }

  // Consultar los datos del usuario
  async cargarPerfil() {
  this.cargando = true;
  this.mensaje = '';

  console.log('1. Iniciando carga del perfil');

  try {
    console.log('2. Consultando Supabase');

    const { data, error } = await this.authService.obtenerPerfil();

    console.log('3. Respuesta de Supabase:', { data, error });

    if (error) {
      this.mensaje = 'No se pudo cargar el perfil.';
      return;
    }

    if (data) {
      this.nombre = data.nombre || '';
      this.descripcion = data.descripcion || '';
      if (data.foto_url) {
        const { data: urlData, error: urlError } =
          await this.authService.obtenerUrlFotoPerfil(data.foto_url);

        if (!urlError && urlData) {
          this.fotoUrl = urlData.signedUrl;
        } else {
          this.fotoUrl = '';
        }
      } else {
        this.fotoUrl = '';
      }
    }

  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    this.mensaje = 'Ocurrió un error al consultar el perfil.';

  } finally {
  this.cargando = false;
  this.cdr.detectChanges();
}
}

  // Guardar los cambios del perfil
  async guardarCambios() {

    if (!this.nombre.trim()) {
      this.mensaje = 'El nombre no puede estar vacío.';
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    try {
      const { error } = await this.authService.actualizarPerfil(
        this.nombre.trim(),
        this.descripcion.trim()
      );

      if (error) {
        this.mensaje = 'No se pudieron guardar los cambios.';
        return;
      }

      this.mensaje = 'Perfil actualizado correctamente.';

    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      this.mensaje = 'Ocurrió un error al guardar los cambios.';

    } finally {
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }


seleccionarFoto(event: Event) {
  const input = event.target as HTMLInputElement;
  const archivo = input.files?.[0];

  if (!archivo) return;

  const formatosPermitidos = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (!formatosPermitidos.includes(archivo.type)) {
    this.mensaje = 'Selecciona una imagen JPG, PNG o WEBP.';
    input.value = '';
    return;
  }

  if (archivo.size > 5 * 1024 * 1024) {
    this.mensaje = 'La imagen no debe superar los 5 MB.';
    input.value = '';
    return;
  }

  this.archivoSeleccionado = archivo;
  this.mensaje = 'Imagen seleccionada correctamente.';
}

async subirFoto() {
  if (!this.archivoSeleccionado) {
    this.mensaje = 'Primero selecciona una imagen.';
    return;
  }

  this.subiendoFoto = true;
  this.mensaje = '';

  try {
    const { data, error } =
      await this.authService.subirFotoPerfil(
        this.archivoSeleccionado
      );

    if (error || !data) {
      this.mensaje = error?.message || 'No se pudo subir la imagen.';
      return;
    }

    const { data: urlData, error: urlError } =
      await this.authService.obtenerUrlFotoPerfil(data.ruta);

    if (urlError || !urlData) {
      this.mensaje = 'La imagen se subió, pero no se pudo mostrar.';
      return;
    }

    this.fotoUrl = urlData.signedUrl;
    this.archivoSeleccionado = null;
    this.mensaje = 'Fotografía actualizada correctamente.';

  } catch (error) {
    console.error('Error al subir fotografía:', error);
    this.mensaje = 'Ocurrió un error al subir la fotografía.';

  } finally {
    this.subiendoFoto = false;
    this.cdr.detectChanges();
  }
}

}

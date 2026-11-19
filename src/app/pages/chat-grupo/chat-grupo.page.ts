
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSpinner,
  IonText,
  IonInput,
  IonButton,
  IonFooter,
  IonButtons
} from '@ionic/angular';

import { RealtimeChannel } from '@supabase/supabase-js';

import { ChatService } from '../../core/services/chat';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-chat-grupo',
  templateUrl: './chat-grupo.page.html',
  styleUrls: ['./chat-grupo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonText,
    IonInput,
    IonButton,
    IonFooter,
    IonButtons
  ]
})
export class ChatGrupoPage implements OnInit, OnDestroy {

  salaId = '';
  nombreGrupo = '';

  cargando = true;
  mensaje = '';

  mensajes: any[] = [];
  nuevoMensaje = '';

  usuarioActualId = '';

  mensajeEditandoId: string | null = null;
  contenidoEditado = '';

  enviandoImagen = false;
  enviandoArchivo = false;
  compartiendoUbicacion = false;

  private canalMensajes: RealtimeChannel | null = null;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.iniciarChatGrupo();
  }

  ngOnDestroy() {
    if (this.canalMensajes) {
      this.supabaseService.supabase.removeChannel(
        this.canalMensajes
      );
      this.canalMensajes = null;
    }
  }

  // Iniciar conversación grupal
  async iniciarChatGrupo() {
    this.cargando = true;
    this.mensaje = '';

    try {
      this.salaId =
        this.route.snapshot.paramMap.get('salaId') || '';

      if (!this.salaId) {
        this.mensaje = 'No se identificó el grupo.';
        return;
      }

      const { data: grupo, error: errorGrupo } =
        await this.supabaseService.supabase
          .from('salas')
          .select('id, nombre, tipo')
          .eq('id', this.salaId)
          .eq('tipo', 'grupal')
          .single();

      if (errorGrupo || !grupo) {
        console.error(errorGrupo);
        this.mensaje = 'No se pudo encontrar el grupo.';
        return;
      }

      this.nombreGrupo = grupo.nombre || 'Grupo';

      const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

      if (errorSesion || !sesion.user) {
        this.mensaje = 'No se pudo identificar al usuario.';
        return;
      }

      this.usuarioActualId = sesion.user.id;

      await this.cargarMensajes();
      this.escucharMensajes();

    } catch (error) {
      console.error(error);
      this.mensaje = 'Ocurrió un error al iniciar el grupo.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  // Cargar mensajes y URL de archivos
  async cargarMensajes() {
    if (!this.salaId) return;

    const { data, error } =
      await this.chatService.obtenerMensajes(this.salaId);

    if (error) {
      console.error(error);
      this.mensaje = 'No se pudieron cargar los mensajes.';
      return;
    }

    this.mensajes = await Promise.all(
      (data || []).map(async (item: any) => {

        if (item.tipo === 'imagen' && item.archivo_url) {
          const { data: imagen, error: errorImagen } =
            await this.chatService.obtenerUrlImagen(
              item.archivo_url
            );

          if (errorImagen) {
            console.error(errorImagen);
          }

          return {
            ...item,
            imagenUrl: imagen?.signedUrl || null
          };
        }

        if (item.tipo === 'archivo' && item.archivo_url) {
          const { data: archivo, error: errorArchivo } =
            await this.chatService.obtenerUrlArchivo(
              item.archivo_url,
              item.nombre_archivo || 'archivo'
            );

          if (errorArchivo) {
            console.error(errorArchivo);
          }

          return {
            ...item,
            archivoUrl: archivo?.signedUrl || null
          };
        }

        return item;
      })
    );

    this.cdr.detectChanges();
  }

  // Enviar texto
  async enviarMensaje() {
    const contenido = this.nuevoMensaje.trim();

    if (!contenido || !this.salaId) return;

    const { error } = await this.chatService.enviarMensaje(
      this.salaId,
      contenido
    );

    if (error) {
      console.error(error);
      this.mensaje = 'No se pudo enviar el mensaje.';
      return;
    }

    this.nuevoMensaje = '';
    await this.cargarMensajes();
  }

  // Enviar imagen
  async seleccionarImagen(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const archivo = elemento.files?.[0];

    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.mensaje = 'Selecciona una imagen válida.';
      elemento.value = '';
      return;
    }

    if (!this.salaId) {
      this.mensaje = 'No se ha iniciado el grupo.';
      elemento.value = '';
      return;
    }

    this.enviandoImagen = true;
    this.mensaje = '';
    this.cdr.detectChanges();

    try {
      const { error } = await this.chatService.enviarImagen(
        this.salaId,
        archivo
      );

      if (error) {
        console.error(error);
        this.mensaje = error.message || 'No se pudo enviar la imagen.';
        return;
      }

      await this.cargarMensajes();

    } catch (error) {
      console.error(error);
      this.mensaje = 'Ocurrió un error al enviar la imagen.';
    } finally {
      this.enviandoImagen = false;
      elemento.value = '';
      this.cdr.detectChanges();
    }
  }

  // Enviar archivo
  async seleccionarArchivo(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const archivo = elemento.files?.[0];

    if (!archivo) return;

    if (!this.salaId) {
      this.mensaje = 'No se ha iniciado el grupo.';
      elemento.value = '';
      return;
    }

    this.enviandoArchivo = true;
    this.mensaje = '';
    this.cdr.detectChanges();

    try {
      const { error } = await this.chatService.enviarArchivo(
        this.salaId,
        archivo
      );

      if (error) {
        console.error(error);
        this.mensaje = error.message || 'No se pudo enviar el archivo.';
        return;
      }

      await this.cargarMensajes();

    } catch (error) {
      console.error(error);
      this.mensaje = 'Ocurrió un error al enviar el archivo.';
    } finally {
      this.enviandoArchivo = false;
      elemento.value = '';
      this.cdr.detectChanges();
    }
  }

  // Compartir ubicación
  async compartirUbicacion() {
    if (!this.salaId || this.compartiendoUbicacion) return;

    this.compartiendoUbicacion = true;
    this.mensaje = '';
    this.cdr.detectChanges();

    try {
      const posicion = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 30000
      });

      const { latitude, longitude } = posicion.coords;

      const { error } = await this.chatService.enviarUbicacion(
        this.salaId,
        latitude,
        longitude
      );

      if (error) {
        console.error(error);
        this.mensaje = 'No se pudo compartir la ubicación.';
        return;
      }

      await this.cargarMensajes();

    } catch (error) {
      console.error(error);
      this.mensaje =
        'No se pudo obtener la ubicación. Revisa los permisos del dispositivo.';
    } finally {
      this.compartiendoUbicacion = false;
      this.cdr.detectChanges();
    }
  }

  // Tiempo real
  escucharMensajes() {
    if (this.canalMensajes || !this.salaId) return;

    this.canalMensajes = this.supabaseService.supabase
      .channel('mensajes-grupo-' + this.salaId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensajes',
          filter: 'sala_id=eq.' + this.salaId
        },
        () => {
          this.cargarMensajes();
        }
      )
      .subscribe();
  }

  // Editar mensaje propio
  iniciarEdicion(item: any) {
    if (
      item.remitente_id !== this.usuarioActualId ||
      item.eliminado ||
      item.tipo !== 'texto'
    ) return;

    this.mensajeEditandoId = item.id;
    this.contenidoEditado = item.contenido || '';
  }

  cancelarEdicion() {
    this.mensajeEditandoId = null;
    this.contenidoEditado = '';
  }

  async guardarEdicion() {
    const contenido = this.contenidoEditado.trim();

    if (!contenido || !this.mensajeEditandoId) return;

    const { error } = await this.chatService.editarMensaje(
      this.mensajeEditandoId,
      contenido
    );

    if (error) {
      console.error(error);
      this.mensaje = 'No se pudo editar el mensaje.';
      return;
    }

    this.cancelarEdicion();
    await this.cargarMensajes();
  }

  // Eliminar mensaje propio
  async eliminarMensaje(item: any) {
    if (
      item.remitente_id !== this.usuarioActualId ||
      item.eliminado
    ) return;

    const { error } =
      await this.chatService.eliminarMensaje(item.id);

    if (error) {
      console.error(error);
      this.mensaje = 'No se pudo eliminar el mensaje.';
      return;
    }

    await this.cargarMensajes();
  }
}

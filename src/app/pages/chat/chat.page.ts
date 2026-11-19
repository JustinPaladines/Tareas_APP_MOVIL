
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  IonFooter
} from '@ionic/angular';

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

import { FirebaseService } from '../../core/services/firebase.service';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ChatService } from '../../core/services/chat';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonText,
    IonInput,
    IonButton,
    IonFooter
  ]
})
export class ChatPage implements OnInit, OnDestroy {

  usuarioDestinoId = '';
  nombreUsuario = '';
  salaId = '';

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

  // Indicador de escritura
  otroUsuarioEscribiendo = false;

  private escucharEscritura: Unsubscribe | null = null;

  private temporizadorEscritura:
    ReturnType<typeof setTimeout> | null = null;

  private canalMensajes: RealtimeChannel | null = null;
  private canalReacciones: RealtimeChannel | null = null;

  // Emojis disponibles para reaccionar
  emojisReaccion = ['👍', '❤️', '😂', '😮', '😢', '👏'];

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatService,
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef,
    private firebaseService: FirebaseService
  ) {}

  async ngOnInit() {
    await this.iniciarChat();
  }

  ngOnDestroy() {
    console.log('[CHAT] Cerrando conversación');

    // Cerrar escucha de mensajes
    if (this.canalMensajes) {
      void this.supabaseService.supabase.removeChannel(
        this.canalMensajes
      );

      this.canalMensajes = null;
    }

    // Cerrar escucha de reacciones
    if (this.canalReacciones) {
      void this.supabaseService.supabase.removeChannel(
        this.canalReacciones
      );

      this.canalReacciones = null;
    }

    // Cerrar escucha de Firestore
    if (this.escucharEscritura) {
      this.escucharEscritura();
      this.escucharEscritura = null;
    }

    // Detener temporizador y estado de escritura
    void this.detenerEscritura();
  }

  // ==========================================
  // INICIAR CONVERSACIÓN
  // ==========================================

  async iniciarChat() {
    this.cargando = true;
    this.mensaje = '';

    try {
      this.usuarioDestinoId =
        this.route.snapshot.paramMap.get('usuarioId') || '';

      if (!this.usuarioDestinoId) {
        this.mensaje = 'No se identificó al usuario.';
        return;
      }

      const { data: usuario, error: errorUsuario } =
        await this.supabaseService.supabase
          .from('usuarios')
          .select('id, nombre')
          .eq('id', this.usuarioDestinoId)
          .single();

      if (errorUsuario || !usuario) {
        console.error('[CHAT] Error al buscar usuario:', errorUsuario);
        this.mensaje = 'No se pudo encontrar al usuario.';
        return;
      }

      this.nombreUsuario = usuario.nombre;

      const { data: sala, error: errorChat } =
        await this.chatService.obtenerOCrearChat(
          this.usuarioDestinoId
        );

      if (errorChat || !sala) {
        console.error('[CHAT] Error al obtener sala:', errorChat);
        this.mensaje = 'No se pudo iniciar la conversación.';
        return;
      }

      this.salaId = sala;

      const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

      if (errorSesion) {
        console.error('[CHAT] Error al obtener sesión:', errorSesion);
      }

      this.usuarioActualId = sesion.user?.id || '';

      if (!this.usuarioActualId) {
        console.error('[CHAT] No se obtuvo el ID del usuario actual.');
        this.mensaje = 'No se pudo identificar tu sesión.';
        return;
      }

      console.log('================================');
      console.log('[CHAT] Conversación iniciada');
      console.log('[CHAT] Sala:', this.salaId);
      console.log('[CHAT] Usuario actual:', this.usuarioActualId);
      console.log('[CHAT] Usuario destino:', this.usuarioDestinoId);
      console.log('================================');

      // Iniciar indicador de escritura
      this.iniciarEscuchaEscritura();

      // Cargar mensajes y sus reacciones
      await this.cargarMensajes();

      // Escuchar nuevos mensajes
      this.escucharMensajes();

      // Escuchar nuevas reacciones
      this.escucharReacciones();

    } catch (error) {
      console.error('[CHAT] Error al iniciar conversación:', error);
      this.mensaje = 'Ocurrió un error al iniciar el chat.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  // ==========================================
  // CARGAR MENSAJES
  // ==========================================

  async cargarMensajes() {
    if (!this.salaId) return;

    const { data, error } =
      await this.chatService.obtenerMensajes(this.salaId);

    if (error) {
      console.error('[CHAT] Error al cargar mensajes:', error);
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
            console.error('[CHAT] Error al obtener imagen:', errorImagen);
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
            console.error('[CHAT] Error al obtener archivo:', errorArchivo);
          }

          return {
            ...item,
            archivoUrl: archivo?.signedUrl || null
          };
        }

        return item;
      })
    );

    // Consultar las reacciones de los mensajes cargados
    await this.cargarReacciones();

    this.cdr.detectChanges();
  }

  // ==========================================
  // ENVIAR MENSAJE
  // ==========================================

  async enviarMensaje() {
    const contenido = this.nuevoMensaje.trim();

    if (!contenido || !this.salaId) return;

    await this.detenerEscritura();

    const { error } = await this.chatService.enviarMensaje(
      this.salaId,
      contenido
    );

    if (error) {
      console.error('[CHAT] Error al enviar mensaje:', error);
      this.mensaje = 'No se pudo enviar el mensaje.';
      return;
    }

    this.nuevoMensaje = '';

    await this.cargarMensajes();
  }

  // ==========================================
  // ENVIAR IMAGEN
  // ==========================================

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
      this.mensaje = 'No se ha iniciado la conversación.';
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
        console.error('[CHAT] Error al enviar imagen:', error);
        this.mensaje = error.message || 'No se pudo enviar la imagen.';
        return;
      }

      await this.cargarMensajes();

    } catch (error) {
      console.error('[CHAT] Error al enviar imagen:', error);
      this.mensaje = 'Ocurrió un error al enviar la imagen.';
    } finally {
      this.enviandoImagen = false;
      elemento.value = '';
      this.cdr.detectChanges();
    }
  }

  // ==========================================
  // ENVIAR ARCHIVO
  // ==========================================

  async seleccionarArchivo(event: Event) {
    const elemento = event.target as HTMLInputElement;
    const archivo = elemento.files?.[0];

    if (!archivo) return;

    if (!this.salaId) {
      this.mensaje = 'No se ha iniciado la conversación.';
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
        console.error('[CHAT] Error al enviar archivo:', error);
        this.mensaje = error.message || 'No se pudo enviar el archivo.';
        return;
      }

      await this.cargarMensajes();

    } catch (error) {
      console.error('[CHAT] Error al enviar archivo:', error);
      this.mensaje = 'Ocurrió un error al enviar el archivo.';
    } finally {
      this.enviandoArchivo = false;
      elemento.value = '';
      this.cdr.detectChanges();
    }
  }

  // ==========================================
  // COMPARTIR UBICACIÓN
  // ==========================================

  async compartirUbicacion() {
    if (!this.salaId || this.compartiendoUbicacion) return;

    this.compartiendoUbicacion = true;
    this.mensaje = '';
    this.cdr.detectChanges();

    try {
      let permisos = await Geolocation.checkPermissions();

      if (
        permisos.location !== 'granted' &&
        permisos.coarseLocation !== 'granted'
      ) {
        permisos = await Geolocation.requestPermissions();
      }

      if (
        permisos.location !== 'granted' &&
        permisos.coarseLocation !== 'granted'
      ) {
        this.mensaje =
          'Necesitas conceder permiso de ubicación para compartirla.';
        return;
      }

      const posicion = await Geolocation.getCurrentPosition({
        enableHighAccuracy: permisos.location === 'granted',
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
        console.error('[CHAT] Error al compartir ubicación:', error);
        this.mensaje = 'No se pudo compartir la ubicación.';
        return;
      }

      await this.cargarMensajes();

    } catch (error) {
      console.error('[CHAT] Error de ubicación:', error);

      this.mensaje =
        'No se pudo obtener la ubicación. Comprueba los permisos y que la ubicación del teléfono esté activada.';

    } finally {
      this.compartiendoUbicacion = false;
      this.cdr.detectChanges();
    }
  }

  // ==========================================
  // ESCUCHAR MENSAJES DE SUPABASE
  // ==========================================

  escucharMensajes() {
    if (this.canalMensajes || !this.salaId) return;

    this.canalMensajes = this.supabaseService.supabase
      .channel('mensajes-' + this.salaId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensajes',
          filter: 'sala_id=eq.' + this.salaId
        },
        () => {
          void this.cargarMensajes();
        }
      )
      .subscribe();
  }

  // ==========================================
  // EDITAR MENSAJES
  // ==========================================

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
      console.error('[CHAT] Error al editar mensaje:', error);
      this.mensaje = 'No se pudo editar el mensaje.';
      return;
    }

    this.cancelarEdicion();

    await this.cargarMensajes();
  }

  // ==========================================
  // ELIMINAR MENSAJES
  // ==========================================

  async eliminarMensaje(item: any) {
    if (
      item.remitente_id !== this.usuarioActualId ||
      item.eliminado
    ) return;

    const { error } =
      await this.chatService.eliminarMensaje(item.id);

    if (error) {
      console.error('[CHAT] Error al eliminar mensaje:', error);
      this.mensaje = 'No se pudo eliminar el mensaje.';
      return;
    }

    await this.cargarMensajes();
  }

  // ==========================================
  // REACCIONES A MENSAJES
  // ==========================================

  abrirSelectorReaccion(item: any) {
    item.mostrarSelectorReaccion =
      !item.mostrarSelectorReaccion;
  }

  async seleccionarReaccion(item: any, emoji: string) {
    if (!item?.id || item.eliminado) return;

    try {
      const { error } = await this.chatService.guardarReaccion(
        item.id,
        emoji
      );

      if (error) {
        console.error('[REACCIONES] Error al guardar:', error);
        this.mensaje = 'No se pudo guardar la reacción.';
        return;
      }

      item.mostrarSelectorReaccion = false;

      await this.cargarReacciones();

      this.cdr.detectChanges();

    } catch (error) {
      console.error('[REACCIONES] Error inesperado:', error);
      this.mensaje = 'Ocurrió un error al reaccionar al mensaje.';
    }
  }

  async cargarReacciones() {
    const ids = this.mensajes
      .filter((item: any) => !item.eliminado)
      .map((item: any) => item.id);

    if (!ids.length) {
      this.mensajes.forEach((item: any) => {
        item.reacciones = [];
      });
      return;
    }

    const { data, error } =
      await this.chatService.obtenerReacciones(ids);

    if (error) {
      console.error('[REACCIONES] Error al consultar:', error);
      return;
    }

    const reacciones = data || [];

    this.mensajes.forEach((item: any) => {
      const delMensaje = reacciones.filter(
        (reaccion: any) => reaccion.mensaje_id === item.id
      );

      item.reacciones = this.emojisReaccion
        .map(emoji => {
          const coincidencias = delMensaje.filter(
            (reaccion: any) => reaccion.emoji === emoji
          );

          return {
            emoji,
            cantidad: coincidencias.length,
            miReaccion: coincidencias.some(
              (reaccion: any) =>
                reaccion.usuario_id === this.usuarioActualId
            )
          };
        })
        .filter((reaccion: any) => reaccion.cantidad > 0);
    });

    this.cdr.detectChanges();
  }

  escucharReacciones() {
    if (this.canalReacciones || !this.salaId) return;

    this.canalReacciones = this.supabaseService.supabase
      .channel('reacciones-' + this.salaId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reacciones_mensajes'
        },
        () => {
          void this.cargarReacciones();
        }
      )
      .subscribe((estado) => {
        console.log('[REACCIONES] Estado de suscripción:', estado);
      });
  }

  // ==========================================
  // INDICADOR DE ESCRITURA - FIRESTORE
  // ==========================================

  iniciarEscuchaEscritura() {
    if (!this.salaId || !this.usuarioActualId) {
      console.error(
        '[ESCRITURA] No se puede iniciar la escucha:',
        {
          salaId: this.salaId,
          usuarioActualId: this.usuarioActualId
        }
      );
      return;
    }

    if (this.escucharEscritura) {
      this.escucharEscritura();
      this.escucharEscritura = null;
    }

    console.log('[ESCRITURA] Iniciando escucha de Firestore');
    console.log(
      '[ESCRITURA] Ruta:',
      `salas/${this.salaId}/escribiendo`
    );

    const referencia = collection(
      this.firebaseService.db,
      'salas',
      this.salaId,
      'escribiendo'
    );

    this.escucharEscritura = onSnapshot(
      referencia,

      snapshot => {
        console.log(
          '[ESCRITURA] Documentos recibidos:',
          snapshot.docs.map(documento => ({
            id: documento.id,
            ...documento.data()
          }))
        );

        const ahora = Date.now();

        const usuarioEscribiendo = snapshot.docs.some(documento => {
          const datos = documento.data();

          const actualizado = Number(datos['actualizado'] || 0);

          const esOtroUsuario =
            documento.id !== this.usuarioActualId;

          const estaEscribiendo =
            datos['escribiendo'] === true;

          const reciente =
            actualizado > 0 &&
            ahora - actualizado < 5000;

          return esOtroUsuario && estaEscribiendo && reciente;
        });

        this.otroUsuarioEscribiendo = usuarioEscribiendo;

        console.log(
          '[ESCRITURA] ¿El otro usuario escribe?:',
          this.otroUsuarioEscribiendo
        );

        // Diagnóstico adicional de recepción
        console.log('[ESCRITURA] Diagnóstico de recepción:', {
          miUsuario: this.usuarioActualId,
          sala: this.salaId,
          documentos: snapshot.docs.map(documento => ({
            id: documento.id,
            escribiendo: documento.data()['escribiendo'],
            actualizado: documento.data()['actualizado']
          }))
        });

        this.cdr.detectChanges();
      },

      error => {
        console.error(
          '[ESCRITURA] ERROR al escuchar Firestore:',
          error
        );

        this.otroUsuarioEscribiendo = false;
        this.cdr.detectChanges();
      }
    );
  }

  async actualizarEstadoEscritura() {
    if (!this.salaId || !this.usuarioActualId) {
      console.warn('[ESCRITURA] Faltan datos para escribir.');
      return;
    }

    if (!this.nuevoMensaje.trim()) {
      await this.detenerEscritura();
      return;
    }

    const referencia = doc(
      this.firebaseService.db,
      'salas',
      this.salaId,
      'escribiendo',
      this.usuarioActualId
    );

    if (this.temporizadorEscritura) {
      clearTimeout(this.temporizadorEscritura);
      this.temporizadorEscritura = null;
    }

    this.temporizadorEscritura = setTimeout(() => {
      console.log(
        '[ESCRITURA] Tiempo sin escribir. Deteniendo indicador.'
      );
      void this.detenerEscritura();
    }, 2500);

    console.log('[ESCRITURA] Enviando estado a Firestore:', {
      salaId: this.salaId,
      usuario: this.usuarioActualId,
      escribiendo: true
    });

    try {
      await setDoc(referencia, {
        escribiendo: true,
        actualizado: Date.now()
      });

      console.log('[ESCRITURA] Estado guardado correctamente.');

      // Diagnóstico adicional de escritura
      console.log('[ESCRITURA] Documento escrito:', {
        ruta: `salas/${this.salaId}/escribiendo/${this.usuarioActualId}`,
        usuarioActualId: this.usuarioActualId,
        salaId: this.salaId,
        fecha: Date.now()
      });

    } catch (error) {
      console.error(
        '[ESCRITURA] ERROR al guardar estado:',
        error
      );
    }
  }

  async detenerEscritura() {
    if (this.temporizadorEscritura) {
      clearTimeout(this.temporizadorEscritura);
      this.temporizadorEscritura = null;
    }

    if (!this.salaId || !this.usuarioActualId) return;

    const referencia = doc(
      this.firebaseService.db,
      'salas',
      this.salaId,
      'escribiendo',
      this.usuarioActualId
    );

    try {
      await deleteDoc(referencia);

      console.log('[ESCRITURA] Estado eliminado de Firestore:', {
        salaId: this.salaId,
        usuario: this.usuarioActualId
      });

    } catch (error) {
      console.error(
        '[ESCRITURA] ERROR al detener escritura:',
        error
      );
    }
  }
}

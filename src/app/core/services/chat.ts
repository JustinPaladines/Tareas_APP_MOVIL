
    import { Injectable } from '@angular/core';
    import { SupabaseService } from './supabase.service';

    @Injectable({
    providedIn: 'root'
    })
    export class ChatService {

    constructor(private supabaseService: SupabaseService) {}

    // =====================================================
    // CHAT INDIVIDUAL
    // =====================================================

    async obtenerOCrearChat(usuarioDestinoId: string) {
        const supabase = this.supabaseService.supabase;

        const { data: sesion, error: errorSesion } =
        await supabase.auth.getUser();

        if (errorSesion || !sesion.user) {
        return {
            data: null,
            error: errorSesion || new Error('No hay una sesión activa.')
        };
        }

        const usuarioActualId = sesion.user.id;

        const { data: misParticipaciones, error: errorMias } =
        await supabase
            .from('participantes')
            .select('sala_id')
            .eq('usuario_id', usuarioActualId);

        if (errorMias) {
        return { data: null, error: errorMias };
        }

        const idsSalas = (misParticipaciones || []).map(
        participacion => participacion.sala_id
        );

        if (idsSalas.length > 0) {
        const { data: coincidencias, error: errorCoincidencias } =
            await supabase
            .from('participantes')
            .select('sala_id')
            .eq('usuario_id', usuarioDestinoId)
            .in('sala_id', idsSalas);

        if (errorCoincidencias) {
            return { data: null, error: errorCoincidencias };
        }

        const idsCompartidos = [
            ...new Set((coincidencias || []).map(p => p.sala_id))
        ];

        if (idsCompartidos.length > 0) {
            const { data: salaExistente, error: errorSala } =
            await supabase
                .from('salas')
                .select('id')
                .eq('tipo', 'individual')
                .in('id', idsCompartidos)
                .limit(1)
                .maybeSingle();

            if (errorSala) {
            return { data: null, error: errorSala };
            }

            if (salaExistente) {
            return { data: salaExistente.id, error: null };
            }
        }
        }

        const { data: nuevaSala, error: errorNuevaSala } =
        await supabase
            .from('salas')
            .insert({
            tipo: 'individual',
            creado_por: usuarioActualId
            })
            .select('id')
            .single();

        if (errorNuevaSala) {
        return { data: null, error: errorNuevaSala };
        }

        const { error: errorParticipantes } =
        await supabase
            .from('participantes')
            .insert([
            {
                sala_id: nuevaSala.id,
                usuario_id: usuarioActualId,
                rol: 'miembro'
            },
            {
                sala_id: nuevaSala.id,
                usuario_id: usuarioDestinoId,
                rol: 'miembro'
            }
            ]);

        if (errorParticipantes) {
        return { data: null, error: errorParticipantes };
        }

        return {
        data: nuevaSala.id,
        error: null
        };
    }

    // =====================================================
    // MENSAJES
    // =====================================================

    async obtenerMensajes(salaId: string) {
        return await this.supabaseService.supabase
        .from('mensajes')
        .select('*')
        .eq('sala_id', salaId)
        .order('created_at', { ascending: true });
    }

    async enviarMensaje(salaId: string, contenido: string) {
        const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

        if (errorSesion || !sesion.user) {
        return {
            data: null,
            error: errorSesion || new Error('No hay una sesión activa.')
        };
        }

        return await this.supabaseService.supabase
        .from('mensajes')
        .insert({
            sala_id: salaId,
            remitente_id: sesion.user.id,
            tipo: 'texto',
            contenido: contenido
        })
        .select()
        .single();
    }

    async editarMensaje(mensajeId: string, contenido: string) {
        const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

        if (errorSesion || !sesion.user) {
        return {
            data: null,
            error: errorSesion || new Error('No hay una sesión activa.')
        };
        }

        return await this.supabaseService.supabase
        .from('mensajes')
        .update({
            contenido: contenido,
            editado: true
        })
        .eq('id', mensajeId)
        .eq('remitente_id', sesion.user.id)
        .select()
        .single();
    }

    async eliminarMensaje(mensajeId: string) {
        const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

        if (errorSesion || !sesion.user) {
        return {
            data: null,
            error: errorSesion || new Error('No hay una sesión activa.')
        };
        }

        return await this.supabaseService.supabase
        .from('mensajes')
        .update({
            contenido: null,
            eliminado: true
        })
        .eq('id', mensajeId)
        .eq('remitente_id', sesion.user.id)
        .select()
        .single();
    }

    // =====================================================
    // GRUPOS
    // =====================================================

    async crearGrupo(nombre: string, usuariosIds: string[]) {
        const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

        if (errorSesion || !sesion.user) {
        return {
            data: null,
            error: errorSesion || new Error('No hay una sesión activa.')
        };
        }

        const usuarioActualId = sesion.user.id;

        const { data: sala, error: errorSala } =
        await this.supabaseService.supabase
            .from('salas')
            .insert({
            tipo: 'grupal',
            nombre: nombre.trim(),
            creado_por: usuarioActualId
            })
            .select()
            .single();

        if (errorSala || !sala) {
        return {
            data: null,
            error: errorSala || new Error('No se pudo crear el grupo.')
        };
        }

        const participantes = [
        {
            sala_id: sala.id,
            usuario_id: usuarioActualId,
            rol: 'admin'
        },
        ...usuariosIds
            .filter(id => id !== usuarioActualId)
            .map(id => ({
            sala_id: sala.id,
            usuario_id: id,
            rol: 'miembro'
            }))
        ];

        const { error: errorParticipantes } =
        await this.supabaseService.supabase
            .from('participantes')
            .insert(participantes);

        if (errorParticipantes) {
        // Si no se pudieron agregar los participantes,
        // se elimina la sala recién creada.
        await this.supabaseService.supabase
            .from('salas')
            .delete()
            .eq('id', sala.id);

        return {
            data: null,
            error: errorParticipantes
        };
        }

        return {
        data: sala,
        error: null
        };
    }

    async obtenerGrupos() {
        const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

        if (errorSesion || !sesion.user) {
        return {
            data: null,
            error: errorSesion || new Error('No hay una sesión activa.')
        };
        }

        const { data, error } =
        await this.supabaseService.supabase
            .from('participantes')
            .select(`
            sala_id,
            salas (
                id,
                nombre,
                tipo,
                created_at
            )
            `)
            .eq('usuario_id', sesion.user.id);

        if (error) {
        console.error('Error al obtener grupos:', error);
        return { data: null, error };
        }

        const grupos: {
        id: string;
        nombre: string;
        tipo: string;
        created_at: string;
        }[] = [];

        for (const item of data || []) {
        const relacion: any = item.salas;

        const salas = Array.isArray(relacion)
            ? relacion.flat(Infinity)
            : [relacion];

        for (const sala of salas) {
            if (sala && sala.tipo === 'grupal') {
            grupos.push({
                id: sala.id,
                nombre: sala.nombre,
                tipo: sala.tipo,
                created_at: sala.created_at
            });
            }
        }
        }

        return {
        data: grupos,
        error: null
        };
    }

    // =====================================================
    // IMÁGENES
    // =====================================================

    async enviarImagen(salaId: string, archivo: File) {
        const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

        if (errorSesion || !sesion.user) {
        return {
            data: null,
            error: errorSesion || new Error('No hay una sesión activa.')
        };
        }

        if (!archivo || !archivo.type.startsWith('image/')) {
        return {
            data: null,
            error: new Error('Selecciona un archivo de imagen válido.')
        };
        }

        const usuarioId = sesion.user.id;
        const extension = archivo.name.split('.').pop() || 'jpg';

        const rutaArchivo =
        `${usuarioId}/mensajes/${salaId}/${Date.now()}.${extension}`;

        const { data: archivoSubido, error: errorSubida } =
        await this.supabaseService.supabase.storage
            .from('imagenes-chat')
            .upload(rutaArchivo, archivo, {
            contentType: archivo.type,
            upsert: false
            });

        if (errorSubida || !archivoSubido) {
        return {
            data: null,
            error: errorSubida || new Error('No se pudo subir la imagen.')
        };
        }

        const { data, error } =
        await this.supabaseService.supabase
            .from('mensajes')
            .insert({
            sala_id: salaId,
            remitente_id: usuarioId,
            tipo: 'imagen',
            contenido: null,
            archivo_url: archivoSubido.path,
            nombre_archivo: archivo.name
            })
            .select()
            .single();

        if (error) {
        await this.supabaseService.supabase.storage
            .from('imagenes-chat')
            .remove([archivoSubido.path]);

        return { data: null, error };
        }

        return { data, error: null };
    }

    async obtenerUrlImagen(rutaArchivo: string) {
        return await this.supabaseService.supabase.storage
        .from('imagenes-chat')
        .createSignedUrl(rutaArchivo, 3600);
    }

    // =====================================================
    // ARCHIVOS
    // =====================================================

    async enviarArchivo(salaId: string, archivo: File) {
        const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

        if (errorSesion || !sesion.user) {
        return {
            data: null,
            error: errorSesion || new Error('No hay una sesión activa.')
        };
        }

        if (!archivo || archivo.size === 0) {
        return {
            data: null,
            error: new Error('El archivo está vacío.')
        };
        }

        // Límite máximo: 20 MB.
        if (archivo.size > 20 * 1024 * 1024) {
        return {
            data: null,
            error: new Error('El archivo supera el límite de 20 MB.')
        };
        }

        const nombreSeguro = archivo.name.replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
        );

        const rutaArchivo =
        `${sesion.user.id}/mensajes/${salaId}/${Date.now()}_${nombreSeguro}`;

        const { data: archivoSubido, error: errorSubida } =
        await this.supabaseService.supabase.storage
            .from('archivos-chat')
            .upload(rutaArchivo, archivo, {
            contentType: archivo.type || 'application/octet-stream',
            upsert: false
            });

        if (errorSubida || !archivoSubido) {
        return {
            data: null,
            error: errorSubida || new Error('No se pudo subir el archivo.')
        };
        }

        const { data, error } =
        await this.supabaseService.supabase
            .from('mensajes')
            .insert({
            sala_id: salaId,
            remitente_id: sesion.user.id,
            tipo: 'archivo',
            contenido: null,
            archivo_url: archivoSubido.path,
            nombre_archivo: archivo.name
            })
            .select()
            .single();

        if (error) {
        await this.supabaseService.supabase.storage
            .from('archivos-chat')
            .remove([archivoSubido.path]);

        return { data: null, error };
        }

        return { data, error: null };
    }

    async obtenerUrlArchivo(
        rutaArchivo: string,
        nombreArchivo: string
    ) {
        return await this.supabaseService.supabase.storage
        .from('archivos-chat')
        .createSignedUrl(rutaArchivo, 3600, {
            download: nombreArchivo
        });
    }

    // =====================================================
    // UBICACIÓN
    // =====================================================

    async enviarUbicacion(
        salaId: string,
        latitud: number,
        longitud: number
    ) {
        const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

        if (errorSesion || !sesion.user) {
        return {
            data: null,
            error: errorSesion || new Error('No hay una sesión activa.')
        };
        }

        if (
        !Number.isFinite(latitud) ||
        !Number.isFinite(longitud) ||
        latitud < -90 ||
        latitud > 90 ||
        longitud < -180 ||
        longitud > 180
        ) {
        return {
            data: null,
            error: new Error('Las coordenadas de ubicación no son válidas.')
        };
        }

        return await this.supabaseService.supabase
        .from('mensajes')
        .insert({
            sala_id: salaId,
            remitente_id: sesion.user.id,
            tipo: 'ubicacion',
            contenido: 'Ubicación compartida',
            latitud: latitud,
            longitud: longitud
        })
        .select()
        .single();
    }



  // =====================================================
  // REACCIONES A MENSAJES
  // =====================================================

  async obtenerReacciones(mensajesIds: string[]) {
    if (!mensajesIds.length) {
      return { data: [], error: null };
    }

    return await this.supabaseService.supabase
      .from('reacciones_mensajes')
      .select('id, mensaje_id, usuario_id, emoji')
      .in('mensaje_id', mensajesIds);
  }

  async guardarReaccion(mensajeId: string, emoji: string) {
    const supabase = this.supabaseService.supabase;

    const { data: sesion, error: errorSesion } =
      await supabase.auth.getUser();

    if (errorSesion || !sesion.user) {
      return {
        data: null,
        error: errorSesion || new Error('No hay una sesión activa.')
      };
    }

    const usuarioId = sesion.user.id;

    // Comprobar si el usuario ya reaccionó a este mensaje.
    const { data: existente, error: errorConsulta } =
      await supabase
        .from('reacciones_mensajes')
        .select('id, emoji')
        .eq('mensaje_id', mensajeId)
        .eq('usuario_id', usuarioId)
        .maybeSingle();

    if (errorConsulta) {
      return { data: null, error: errorConsulta };
    }

    // Si selecciona el mismo emoji, elimina su reacción.
    if (existente?.emoji === emoji) {
      return await supabase
        .from('reacciones_mensajes')
        .delete()
        .eq('id', existente.id)
        .select()
        .maybeSingle();
    }

    // Si ya tenía otra reacción, la reemplaza.
    return await supabase
      .from('reacciones_mensajes')
      .upsert(
        {
          mensaje_id: mensajeId,
          usuario_id: usuarioId,
          emoji: emoji
        },
        {
          onConflict: 'mensaje_id,usuario_id'
        }
      )
      .select()
      .single();
  }

    }

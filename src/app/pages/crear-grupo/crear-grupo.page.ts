
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonSpinner,
  IonText
} from '@ionic/angular';

import { SupabaseService } from '../../core/services/supabase.service';
import { ChatService } from '../../core/services/chat';

interface Usuario {
  id: string;
  nombre: string;
  descripcion: string | null;
  seleccionado: boolean;
}

@Component({
  selector: 'app-crear-grupo',
  templateUrl: './crear-grupo.page.html',
  styleUrls: ['./crear-grupo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonSpinner,
    IonText
  ]
})
export class CrearGrupoPage implements OnInit {

  nombreGrupo = '';
  usuarios: Usuario[] = [];

  cargando = true;
  creando = false;
  mensaje = '';

  constructor(
    private supabaseService: SupabaseService,
    private chatService: ChatService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  get cantidadSeleccionados(): number {
  return this.usuarios.filter(usuario => usuario.seleccionado).length;
  }

  // Consultar usuarios disponibles
  async cargarUsuarios() {
    this.cargando = true;
    this.mensaje = '';

    try {
      const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

      if (errorSesion || !sesion.user) {
        this.mensaje = 'No se pudo identificar al usuario.';
        return;
      }

      const { data, error } =
        await this.supabaseService.supabase
          .from('usuarios')
          .select('id, nombre, descripcion')
          .neq('id', sesion.user.id)
          .order('nombre', { ascending: true });

      if (error) {
        console.error('Error al cargar usuarios:', error);
        this.mensaje = 'No se pudieron cargar los usuarios.';
        return;
      }

      this.usuarios = (data || []).map(usuario => ({
        ...usuario,
        seleccionado: false
      }));

      if (this.usuarios.length === 0) {
        this.mensaje = 'No hay otros usuarios registrados.';
      }

    } catch (error) {
      console.error('Error:', error);
      this.mensaje = 'Ocurrió un error al consultar los usuarios.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  // Crear el grupo
  async crearGrupo() {
    const nombre = this.nombreGrupo.trim();

    const usuariosSeleccionados = this.usuarios
      .filter(usuario => usuario.seleccionado)
      .map(usuario => usuario.id);

    if (!nombre) {
      this.mensaje = 'Escribe un nombre para el grupo.';
      return;
    }

    if (usuariosSeleccionados.length === 0) {
      this.mensaje = 'Selecciona al menos un integrante.';
      return;
    }

    this.creando = true;
    this.mensaje = '';

    try {
      const { data, error } =
        await this.chatService.crearGrupo(
          nombre,
          usuariosSeleccionados
        );

      if (error || !data) {
        console.error('Error al crear grupo:', error);
        this.mensaje = 'No se pudo crear el grupo.';
        return;
      }

      this.mensaje = '¡Grupo creado correctamente!';
      this.nombreGrupo = '';

      this.usuarios.forEach(usuario => {
        usuario.seleccionado = false;
      });

      console.log('Grupo creado:', data);

    } catch (error) {
      console.error('Error:', error);
      this.mensaje = 'Ocurrió un error al crear el grupo.';
    } finally {
      this.creando = false;
      this.cdr.detectChanges();
    }
  }

}

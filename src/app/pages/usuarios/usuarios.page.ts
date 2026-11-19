
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText
} from '@ionic/angular';

import { SupabaseService } from '../../core/services/supabase.service';

interface Usuario {
  id: string;
  nombre: string;
  descripcion: string | null;
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonText
  ]
})
export class UsuariosPage implements OnInit {

  usuarios: Usuario[] = [];
  textoBusqueda: string = '';
  cargando: boolean = true;
  mensaje: string = '';

  constructor(
    private supabaseService: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.cargando = true;
    this.mensaje = '';

    try {
      // Obtener el usuario que inició sesión
      const { data: sesion, error: errorSesion } =
        await this.supabaseService.supabase.auth.getUser();

      if (errorSesion || !sesion.user) {
        this.mensaje = 'No se pudo identificar al usuario.';
        return;
      }

      // Consultar los demás usuarios registrados
      const { data, error } = await this.supabaseService.supabase
        .from('usuarios')
        .select('id, nombre, descripcion')
        .neq('id', sesion.user.id)
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error al consultar usuarios:', error);
        this.mensaje = 'No se pudieron cargar los usuarios.';
        return;
      }

      this.usuarios = data || [];

      if (this.usuarios.length === 0) {
        this.mensaje = 'Todavía no hay otros usuarios registrados.';
      }

    } catch (error) {
      console.error('Error:', error);
      this.mensaje = 'Ocurrió un error al cargar los usuarios.';

    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  get usuariosFiltrados(): Usuario[] {
    const busqueda = this.textoBusqueda.toLowerCase().trim();

    return this.usuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(busqueda)
    );
  }
}

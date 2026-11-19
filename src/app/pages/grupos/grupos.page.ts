
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
  IonText,
  IonButtons
} from '@ionic/angular';

import { ChatService } from '../../core/services/chat';

interface Grupo {
  id: string;
  nombre: string;
  tipo: string;
  created_at: string;
}

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.page.html',
  styleUrls: ['./grupos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonSpinner,
    IonText,
    IonButtons
  ]
})
export class GruposPage implements OnInit {

  grupos: Grupo[] = [];
  cargando = true;
  mensaje = '';

  constructor(
    private chatService: ChatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarGrupos();
  }

  // Consultar los grupos del usuario
  async cargarGrupos() {
    this.cargando = true;
    this.mensaje = '';

    try {
      const { data, error } =
        await this.chatService.obtenerGrupos();

      if (error) {
        console.error('Error al cargar grupos:', error);
        this.mensaje = 'No se pudieron cargar los grupos.';
        return;
      }

      this.grupos = data || [];

      if (this.grupos.length === 0) {
        this.mensaje = 'Todavía no perteneces a ningún grupo.';
      }

    } catch (error) {
      console.error('Error:', error);
      this.mensaje = 'Ocurrió un error al consultar los grupos.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }
}

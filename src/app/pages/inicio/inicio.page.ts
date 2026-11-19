
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/angular';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  ]
})
export class InicioPage implements OnInit {

  nombre: string = '';
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit() {
    const { data } = await this.authService.obtenerUsuario();

    if (data.user) {
      this.nombre = data.user.user_metadata?.['nombre'] || 'Usuario';
      this.email = data.user.email || '';
    }
  }

  async cerrarSesion() {
    const { error } = await this.authService.cerrarSesion();

    if (!error) {
      this.router.navigateByUrl('/login');
    }
  }
}

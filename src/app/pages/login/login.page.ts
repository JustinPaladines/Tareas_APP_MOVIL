import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText
} from '@ionic/angular';

import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
    IonButton,
    IonText,
    RouterLink
  ]
})
export class LoginPage {

  email: string = '';
  password: string = '';

  mensaje: string = '';
  cargando: boolean = false;

  constructor(
  private authService: AuthService,
  private router: Router,
  private cdr: ChangeDetectorRef

) {}

  async iniciarSesion() {
  if (!this.email.trim() || !this.password.trim()) {
    this.mensaje = 'Completa todos los campos.';
    return;
  }

  this.cargando = true;
  this.mensaje = '';

  console.log('1. Enviando solicitud a Supabase...');

  try {
    const { data, error } = await this.authService.iniciarSesion(
      this.email.trim(),
      this.password
    );

    console.log('2. Respuesta de Supabase:', data, error);
    console.log('Sesión:', data.session);
    console.log('Usuario:', data.user);

    if (error) {
      this.mensaje = error.message;
      return;
    }

    if (data.session) {
      this.mensaje = '¡Inicio de sesión exitoso!';

      await this.router.navigateByUrl('/inicio');
    }

  } catch (error: any) {
    console.error('Error al iniciar sesión:', error);
    this.mensaje = 'Ocurrió un error al iniciar sesión.';

  } finally {
    this.cargando = false;
    this.cdr.detectChanges();
    console.log('3. Proceso finalizado.');
  }
}
}

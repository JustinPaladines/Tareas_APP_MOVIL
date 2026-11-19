
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ChangeDetectorRef } from '@angular/core';

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
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText
  ]
})
export class RegistroPage {

  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmarPassword: string = '';

  mensaje: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async registrar() {

    // Validar campos vacíos
    if (
      !this.nombre.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmarPassword
    ) {
      this.mensaje = 'Completa todos los campos.';
      return;
    }

    // Validar correo electrónico
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(this.email.trim())) {
      this.mensaje = 'Ingresa un correo electrónico válido.';
      return;
    }

    // Validar longitud de contraseña
    if (this.password.length < 6) {
      this.mensaje = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    // Confirmar contraseña
    if (this.password !== this.confirmarPassword) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    try {

      const { data, error } = await this.authService.registrar(
        this.nombre.trim(),
        this.email.trim(),
        this.password
      );

      if (error) {
        this.mensaje = error.message;
        return;
      }

      if (data.user) {
        this.mensaje =
          'Registro realizado. Revisa tu correo si necesitas confirmar tu cuenta.';

        this.nombre = '';
        this.email = '';
        this.password = '';
        this.confirmarPassword = '';

      } else {
        this.mensaje = 'No se pudo completar el registro.';
      }

    } catch (error) {

      console.error('Error en el registro:', error);
      this.mensaje = 'Ocurrió un error al registrar la cuenta.';

    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }
}

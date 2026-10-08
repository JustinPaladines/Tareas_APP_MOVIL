import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonInput, IonButton
} from '@ionic/angular';

import { DatosService } from '../services/datos';

@Component({
  selector: 'app-tab1',
  standalone: true,
  templateUrl: './tab1.page.html',
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonInput, IonButton
  ]
})
export class Tab1Page {
  nombre = '';
  direccion = '';
  contador = 0;
  mensaje = '';

  private datos = inject(DatosService);
  private router = inject(Router);

  aumentar(): void {
    this.contador++;
  }

  disminuir(): void {
    if (this.contador > 0) {
      this.contador--;
    }
  }

  reiniciar(): void {
    this.contador = 0;
  }

  enviar(): void {
    const nombreLimpio = this.nombre.trim();
    const direccionLimpio = this.direccion.trim();

    if (!nombreLimpio) {
      this.mensaje = 'Ingresa tu nombre antes de continuar.';
      return;
    }

    if (!direccionLimpio) {
      this.mensaje = 'Ingresa tu direccion antes de continuar.';
      return;
    }

    this.mensaje = '';
    this.datos.guardar(nombreLimpio, direccionLimpio, this.contador);
    this.router.navigateByUrl('/tabs/tab2');
  }
}

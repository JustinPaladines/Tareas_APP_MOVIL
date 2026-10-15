
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  AlertController
} from '@ionic/angular';

import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  imports: [
    FormsModule,
    DecimalPipe,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonText
  ],
})
export class Tab1Page {

  producto = '';
  cantidad: number | null = null;
  precio: number | null = null;

  constructor(
    private router: Router,
    private alertController: AlertController
  ) {}

  get subtotal(): number {
    return (this.cantidad ?? 0) * (this.precio ?? 0);
  }

  async registrarCompra() {

    if (!this.producto.trim()) {
      await this.mostrarAlerta('Validación', 'Ingresa el nombre del producto.');
      return;
    }

    if (
      this.cantidad === null ||
      !Number.isInteger(Number(this.cantidad)) ||
      this.cantidad <= 0
    ) {
      await this.mostrarAlerta('Validación', 'La cantidad debe ser un número entero mayor que cero.');
      return;
    }

    if (
      this.precio === null ||
      !Number.isFinite(Number(this.precio)) ||
      this.precio <= 0
    ) {
      await this.mostrarAlerta('Validación', 'El precio unitario debe ser mayor que cero.');
      return;
    }

    const compra = {
      producto: this.producto.trim(),
      cantidad: Number(this.cantidad),
      precio: Number(this.precio),
      subtotal: this.subtotal
    };

    sessionStorage.setItem('compraActual', JSON.stringify(compra));

    await this.router.navigate(['/tabs/tab2']);
  }

  private async mostrarAlerta(
    encabezado: string,
    mensaje: string
  ) {
    const alerta = await this.alertController.create({
      header: encabezado,
      message: mensaje,
      buttons: ['Aceptar']
    });

    await alerta.present();
  }
}

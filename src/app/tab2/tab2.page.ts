
import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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

interface Compra {
  producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: './tab2.page.html',
  styleUrls: ['./tab2.page.scss'],
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
export class Tab2Page {

  compra: Compra | null = null;

  descuento: number | null = 0;
  dineroRecibido: number | null = null;

  constructor(
    public router: Router,
    private alertController: AlertController
  ) {}

  ionViewWillEnter() {
    const datos = sessionStorage.getItem('compraActual');

    if (datos) {
      this.compra = JSON.parse(datos) as Compra;
    } else {
      this.compra = null;
    }

    this.descuento = 0;
    this.dineroRecibido = null;
  }

  get subtotal(): number {
    return this.compra?.subtotal ?? 0;
  }

  get valorDescuento(): number {
    return this.subtotal * (Number(this.descuento) || 0) / 100;
  }

  get totalFinal(): number {
    return this.subtotal - this.valorDescuento;
  }

  get cambio(): number {
    return Math.max(0, (Number(this.dineroRecibido) || 0) - this.totalFinal);
  }

  get saldoPendiente(): number {
    return Math.max(0, this.totalFinal - (Number(this.dineroRecibido) || 0));
  }

  async calcularPago() {
    if (!this.compra) {
      await this.mostrarAlerta(
        'Sin compra registrada',
        'Primero debes registrar un producto en la pestaña Compra.'
      );
      await this.router.navigate(['/tabs/tab1']);
      return;
    }

    if (
      this.descuento === null ||
      !Number.isFinite(Number(this.descuento)) ||
      Number(this.descuento) < 0 ||
      Number(this.descuento) > 100
    ) {
      await this.mostrarAlerta(
        'Descuento inválido',
        'El descuento debe estar entre 0 y 100%.'
      );
      return;
    }

    if (
      this.dineroRecibido === null ||
      !Number.isFinite(Number(this.dineroRecibido)) ||
      Number(this.dineroRecibido) < 0
    ) {
      await this.mostrarAlerta(
        'Dinero inválido',
        'El dinero recibido debe ser mayor o igual a cero.'
      );
      return;
    }

    await this.mostrarAlerta(
    'Resumen del pago',
    `Producto: ${this.compra.producto}\n` +
    `Subtotal: $${this.subtotal.toFixed(2)}\n` +
    `Descuento: $${this.valorDescuento.toFixed(2)}\n` +
    `Total final: $${this.totalFinal.toFixed(2)}\n` +
    `${this.saldoPendiente > 0
      ? `Saldo pendiente: $${this.saldoPendiente.toFixed(2)}`
      : `Cambio: $${this.cambio.toFixed(2)}`}`
  );
  }

  private async mostrarAlerta(
    encabezado: string,
    mensaje: string
  ) {
    const alerta = await this.alertController.create({
      header: encabezado,
      message: mensaje,
      cssClass: 'alerta-multilinea',
      buttons: ['Aceptar']
    });

    await alerta.present();
  }
}

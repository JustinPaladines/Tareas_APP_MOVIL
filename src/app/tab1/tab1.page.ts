import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular';
import { GpsService } from '../services/gps.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [CommonModule,IonHeader,IonToolbar,IonTitle,IonContent,IonCard,IonCardHeader,IonCardTitle,IonCardContent,IonButton]
})

export class Tab1Page {

  // variables para guardar los datos en pantalla
  urlUbicacion: string = '';
  cargando: boolean = false;

  // se inyecta el servicio en el constructor para poder usar las funciones
  constructor(
    private gpsService: GpsService,
    private cdr: ChangeDetectorRef
  ) {}

  // boton 1: obtener la posición actual
  async obtenerMiUbicacion() {
    this.cargando = true;
    this.cdr.detectChanges();

    try {
      const coords = await this.gpsService.obtenerCoordenadas();
      // url con formato de google Maps compatible con la app móvil
      this.urlUbicacion = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    } catch (error) {
      console.error('Error al obtener ubicación', error);
      alert('Error al obtener la ubicación GPS.');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  // bóton 2: guardar la url en un archivo .txt
  async guardarUbicacionTxt() {
    try {
      await this.gpsService.guardarEnArchivoTxt('ubicacion.txt', this.urlUbicacion);
      alert('¡Archivo ubicacion.txt guardado exitosamente :p!');
    } catch (error) {
      console.error('Error al guardar archivo :c', error);
      alert('Error al guardar el archivo .txt :c');
    }
  }
}
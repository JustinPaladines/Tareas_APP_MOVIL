import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton 
} from '@ionic/angular';
import { GpsService } from '../services/gps.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [CommonModule,IonHeader,IonToolbar,IonTitle,IonContent,IonCard,IonCardHeader,IonCardTitle,IonCardContent,IonButton
  ]
})

export class Tab2Page {

  urlRuta: string = '';
  // primero la ruta estará vacia

  constructor(private gpsService: GpsService) {}

  // bóton para construir la URL de la ruta
  generarRuta() {
    // Universidad :p
    const origen = '-0.20747783055142213, -78.48885970678644';
    // Parque El ejido 
    const destino = '-0.20913456912930486, -78.49865030784471';
    // punto intermedio, museo
    const waypoints = '-0.20972305119381227, -78.49544767122096'; // Se separan con '|'
    // formatear la URL completa según la api de Google Maps
    this.urlRuta = `https://www.google.com/maps/dir/?api=1&origin=${origen}&destination=${destino}&waypoints=${encodeURIComponent(waypoints)}`;
  }

  // botón para guardar la URL en un archivo .txt
  async guardarRutaTxt() {
    try {
      await this.gpsService.guardarEnArchivoTxt('ruta.txt', this.urlRuta);
      alert('¡Archivo ruta.txt guardado con éxito! :3');
    } catch (error) {
      console.error('Error al guardar archivo', error);
      alert('Error al guardar el archivo .txt');
    }
  }
}
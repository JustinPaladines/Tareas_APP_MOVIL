import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonIcon,
  ActionSheetController
} from '@ionic/angular';

import { addIcons } from 'ionicons';
import { camera, trash, close } from 'ionicons/icons';
import { PhotoService, type UserPhoto } from '../services/photo.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonIcon, IonGrid, IonRow, IonCol],
})
export class Tab1Page {
  public photoService = inject(PhotoService);
  public actionSheetController = inject(ActionSheetController);

  constructor() {
    addIcons({ camera, trash, close });
  }

  async addPhotoToGallery(){
    await this.photoService.addNewToGallery();
  }

  public async showActionSheet(photo: UserPhoto, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Fotos',
      buttons: [{
        text: 'Eliminar',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePhoto(position);
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Solo cierra el menú
        }
      }]
    });
    await actionSheet.present();
  }
}
import { Injectable, signal } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

@Injectable({
  providedIn: 'root',
})


export class PhotoService {

  public photos = signal<UserPhoto[]>([]);

  
  public async addNewToGallery() {
    // Toma la fotografia 
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 85,
      width: 1600,
      correctOrientation:true,
      saveToGallery: true, //guarda la fotografia en la galeria del celular
    });

   
    this.photos.update((photos) => [
      {
        filepath: capturedPhoto.path ?? 'soon...',
        webviewPath: capturedPhoto.webPath!,
      },
      ...photos,
    ]);
  }
}
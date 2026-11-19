import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  private listenersRegistrados = false;

  async inicializar(): Promise<string | null> {

    // FCM nativo requiere Android o iOS.
    if (!Capacitor.isNativePlatform()) {
      console.log('Las notificaciones push se prueban desde la app móvil.');
      return null;
    }

    try {
      // Evitar registrar los listeners varias veces.
      if (!this.listenersRegistrados) {

        await FirebaseMessaging.addListener(
          'tokenReceived',
          event => {
            console.log('Nuevo token FCM:', event.token);
          }
        );

        await FirebaseMessaging.addListener(
          'notificationReceived',
          event => {
            console.log('Notificación recibida:', event);
          }
        );

        await FirebaseMessaging.addListener(
          'notificationActionPerformed',
          event => {
            console.log('Notificación seleccionada:', event);
          }
        );

        this.listenersRegistrados = true;
      }

      // Solicitar permiso.
      const permiso = await FirebaseMessaging.requestPermissions();

      if (permiso.receive !== 'granted') {
        console.log('El usuario no concedió permiso para notificaciones.');
        return null;
      }

      // Obtener el token del dispositivo.
      const resultado = await FirebaseMessaging.getToken();

      console.log('Token FCM:', resultado.token);

      return resultado.token;

    } catch (error) {
      console.error('Error al inicializar FCM:', error);
      return null;
    }
  }
}
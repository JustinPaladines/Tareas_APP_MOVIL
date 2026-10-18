import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class GpsService {

  constructor() { }

  // metodo para obtener las coordenadas del gps
  async obtenerCoordenadas(): Promise<{ lat: number; lng: number }> {
    try {
      // en celular, solicitar permiso 
      if (Capacitor.isNativePlatform()) {
        const permiso = await Geolocation.requestPermissions();
        if (permiso.location !== 'granted') {
          throw new Error('Permiso de GPS denegado por el usuario');
        }
      }

      // intentar obtener la posición real usando Capacitor Geolocation
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true, // forzar uso de GPS real
        timeout: 15000,           // dar hasta 15 segundos para fijar los satélites
        maximumAge: 0
      });

      return {
        lat: position.coords.latitude,
        //latitud
        lng: position.coords.longitude
        //longitud
      };
    } catch (error) {
      console.warn('Fallo en Capacitor Geolocation, intentando con API Web nativa...', error);

      // Si falla Capacitor o en PC, usar la API Geolocation del navegador
      return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              resolve({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              });
            },
            (err) => {
              console.error('Error al obtener la ubicación real:', err);
              reject(err);
            },
            {
              enableHighAccuracy: true,
              timeout: 15000,
              maximumAge: 0
            }
          );
        } else {
          reject(new Error('Navegador no soporta Geolocalización'));
        }
      });
    }
  }

  // método para guardar un texto dentro de un archivo .txt
  async guardarEnArchivoTxt(nombreArchivo: string, contenido: string) {
    if (!Capacitor.isNativePlatform()) {
      // Si se prueba en PC (navegador web), forzar descarga del archivo .txt
      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
      const enlace = document.createElement('a');
      enlace.href = URL.createObjectURL(blob);
      enlace.download = nombreArchivo;
      enlace.click();
      URL.revokeObjectURL(enlace.href);
      return;
    }

    // guardar archivo en dispositivos móviles
    await Filesystem.writeFile({
      path: nombreArchivo,          
      data: contenido,              
      // el enlace url que se va a guardar
      directory: Directory.Documents, 
      // carpeta de documentos del sistema
      encoding: Encoding.UTF8       
      // formato de texto estándar
    });
  }
}
import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class DatosService {
    nombre = signal('');
    direccion = signal('');
    contador = signal(0);
    enviado = signal(false);

    //Método para actualizar datos
    guardar(nombre: string, direccion: string, contador: number): void {
    this.nombre.set(nombre);
    this.direccion.set(direccion);
    this.contador.set(contador);
    this.enviado.set(true);
  }
}
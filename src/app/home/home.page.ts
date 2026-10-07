import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton],
})
export class HomePage {
  constructor() {}

  contador1: number = 0;
  contador2: number = 0;
  contador3: number = 0;
  contador4: number= 0;
  contador5: number = 0;
  

    aumentar(): void{
      this.contador1+=2;
      this.contador2+=3;
      this.contador3+=5;
      this.contador4+=7;
      this.contador5+=10;
    }

    disminuir():void{
      this.contador1-=2;
      this.contador2-=3;
      this.contador3-=5;
      this.contador4-=7;
      this.contador5-=10;
    }

}

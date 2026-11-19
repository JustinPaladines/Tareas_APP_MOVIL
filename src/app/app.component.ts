
import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { PushNotificationsService } from './core/services/push-notifications.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {

  constructor(
    private pushNotifications: PushNotificationsService
  ) {}

  ngOnInit() {
    this.pushNotifications.inicializar();
  }
}

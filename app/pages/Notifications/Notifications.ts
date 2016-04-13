import {Page, NavParams, ViewController} from 'ionic-angular';

import {UserNotification} from '../../contracts/DataContracts';

import {Config} from '../../providers/config';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';


@Page({
    templateUrl: 'build/pages/Notifications/Notifications.html'
})
export class Notifications {
    notifications: UserNotification[] = [];                   
    constructor(public config: Config, public view: ViewController) {        
    }    
    
    saveAndGoBack() {
       // write settings to cloud       
       this.view.dismiss();
     }    
}

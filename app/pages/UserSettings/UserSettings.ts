import {Page, NavController, ViewController} from 'ionic-angular';
import {Config} from '../../providers/config';
import {PostPage} from '../PostPage/PostPage';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import {Type} from 'angular2/core';


@Page({
    templateUrl: 'build/pages/UserSettings/UserSettings.html'
})
export class UserSettings {             
    settingsLabel: string = "Settings";
    doneLabel: string = "Close";
    signOutLabel: string = "Sign Out";      
          
    rootPage: Type;
    
    constructor(public nav: NavController, public config: Config, public view: ViewController) {        
    }    
    
    signOut() {
        window.localStorage.removeItem('user');
    }
    
    saveAndGoBack() {
       // write settings to cloud       
       this.view.dismiss();
     }    
}

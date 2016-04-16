import {Page, NavController, ViewController} from 'ionic-angular';
import {Config} from '../../providers/config';
import {PostPage} from '../PostPage/PostPage';
import {SignIn} from '../SignIn/SignIn';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import {Type} from 'angular2/core';


@Page({
    templateUrl: 'build/pages/ConnectivityError/ConnectivityError.html'
})
export class ConnectivityError {
    constructor(public nav: NavController, public service: ServiceCaller, public view: ViewController) {        
    }    
    
    onPageWillEnter() {
        this.checkConnectionToServer();
    }
    
        checkConnectionToServer() {
        let ping = this.service.checkConnection();
        ping.subscribe(data => {  this.view.dismiss();
             }, err => { setTimeout(this.checkConnectionToServer(),2000); // TODO: 
 });
    }
}

import {Page, NavParams, ViewController} from 'ionic-angular';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';


@Page({
    templateUrl: 'build/pages/TermsAndConditions/TermsAndConditions.html'
})
export class TermsAndConditions {
    constructor(public config: Config, public view: ViewController) {        
    }    
    
    goBack() {
       this.view.dismiss();
     }    
}

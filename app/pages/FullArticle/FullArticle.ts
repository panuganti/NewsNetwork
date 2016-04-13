import {Page, NavController, NavParams, ViewController} from 'ionic-angular';
import {Article} from '../../contracts/DataContracts';
import {Config} from '../../providers/config';

@Page({
    templateUrl: 'build/pages/FullArticle/FullArticle.html',
})
export class FullArticle {
    backLabel: string = "Go Back";
    src: string = "";

    constructor(public params: NavParams, public config: Config, public view: ViewController) {
        this.init(params);
    }

    init(params: NavParams) {
        this.src = this.params.get('src');
        if (this.config.labels.containsKey('Back')) {
            this.backLabel = this.config.labels.getValue('Back');
        }
    }

    goBack() {
        this.view.dismiss();
    }
}

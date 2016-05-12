import {App, Platform} from 'ionic-angular';
import {Type, enableProdMode} from 'angular2/core';

import {NewsFeed} from './pages/NewsFeed/NewsFeed';
import {UserSettings} from './pages/UserSettings/UserSettings';
import {Categories} from './pages/Categories/Categories';

import {Config} from './providers/config';
import {ServiceCaller} from './providers/servicecaller';
import {Notifications} from './providers/notifications';
import {Cache} from './providers/cache';

enableProdMode();

@App({
    template: '<ion-nav [root]="rootPage"></ion-nav>',
    directives: [NewsFeed, UserSettings, Categories],
    providers: [ServiceCaller, Config, Cache, Notifications],
    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
    rootPage: Type;

    constructor(platform: Platform, public service: ServiceCaller, public cache: Cache, public config: Config,
                    public notifications: Notifications) {  
        window.localStorage.removeItem('user');
        this.config.initTimer();
        let userOb = this.config.setUser();
        userOb.subscribe(res => {
            this.rootPage = NewsFeed});
    }
}

import {App, Platform} from 'ionic-angular';
// https://angular.io/docs/ts/latest/api/core/Type-interface.html
import {Type, enableProdMode} from 'angular2/core';
import {Contacts, Device, Geolocation} from 'ionic-native';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromArray'; // required for Observable.of();

import {NewsFeed} from './pages/NewsFeed/NewsFeed';
import {SignIn} from './pages/SignIn/SignIn';
import {UserSettings} from './pages/UserSettings/UserSettings';
import {Categories} from './pages/Categories/Categories';

import {Config} from './providers/config';
import {ServiceCaller} from './providers/servicecaller';
import {Notifications} from './providers/notifications';
import {Cache} from './providers/cache';

import {User, UserContactsInfo, UserDeviceInfo, UserGeoInfo, Stream} from './contracts/ServerContracts';

enableProdMode();

@App({
    template: '<ion-nav [root]="rootPage"></ion-nav>',
    directives: [SignIn, NewsFeed, UserSettings, Categories],
    providers: [ServiceCaller, Config, Cache, Notifications],
    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
    rootPage: Type;

    constructor(platform: Platform, public service: ServiceCaller, public cache: Cache, public config: Config,
        public notifications: Notifications) {        
        this.config.initTimer();
        this.init();
    }

       
   init() {
        let userId: string = JSON.parse(window.localStorage['userId'] || '{}');
        if (userId != undefined && userId.length > 0) {
            this.config.userId = userId;
            this.rootPage = NewsFeed;
        }
        else {
            this.rootPage = SignIn;
        }
    }

    /*
    init() {
        let labels = this.service.getLabelsOfALanguage(this.config.language);
        labels.subscribe((data) => { this.cache.setLabels(data); this.rootPage = SignIn; }, (err) => { console.log(err); this.rootPage = SignIn; });
    }
    */

    /*    
    uploadAppInfo() {
        this.uploadContactsInfo();
        this.uploadDeviceInfo();
        this.uploadGeoInfo();
    }

    uploadContactsInfo() {
        if (JSON.parse(window.localStorage['appContactsUploaded'] || '{}')) {
            return;
        }
        var contactJson: UserContactsInfo;
        // Contacts List
        var contactsList = Contacts.find(['*']);
        contactsList.then(data => {
            contactJson = { UserId: null, JSON: JSON.stringify(data) }
            let contactsUpload = this.service.uploadContactsList(JSON.stringify(contactJson));
            contactsUpload.subscribe(data => { window.localStorage['appContactsUploaded'] = JSON.stringify(true); });
        });

    }

    uploadDeviceInfo() {
        if (JSON.parse(window.localStorage['appDeviceInfoUploaded'] || '{}')) {
            return;
        }
        // Device Info
        let deviceJson: UserDeviceInfo = { UserId: null, JSON: JSON.stringify(Device.device) }
        let deviceUpload = this.service.uploadDeviceInfo(JSON.stringify(deviceJson));
        deviceUpload.subscribe(data => { window.localStorage['appDeviceInfoUploaded'] = JSON.stringify(true); })
    }

    uploadGeoInfo() {
        if (JSON.parse(window.localStorage['appGeoInfoUploaded'] || '{}')) {
            return;
        }
        // Geo-location
        var geoJson: UserGeoInfo;
        let geoPos = Geolocation.getCurrentPosition();
        geoPos.then(data => {
            geoJson = { UserId: null, JSON: JSON.stringify(data) };
            let geoUpload = this.service.uploadUserLocation(JSON.stringify(geoJson));
            geoUpload.subscribe(data => { window.localStorage['appGeoInfoUploaded'] = JSON.stringify(true); })
        });
    }
    */
}

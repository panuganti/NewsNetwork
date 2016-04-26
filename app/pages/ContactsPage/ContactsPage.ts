/// <reference path="../../../typings/tsd.d.ts" />

import {Page, NavParams, NavController, Platform} from 'ionic-angular';
import {Http, Headers, Response} from 'angular2/http';

import {Contacts, SMS} from 'ionic-native';
import {Contact} from 'ionic-native/dist/plugins/contacts';
import {UserNotification} from '../../contracts/DataContracts';

import {Config} from '../../providers/config';
import {ServiceCaller} from '../../providers/servicecaller';

import {UserContactsInfo, UserDeviceInfo, UserGeoInfo, UserContact} from '../../contracts/ServerContracts';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';


@Page({
    templateUrl: 'build/pages/ContactsPage/ContactsPage.html'
})
export class ContactsPage {
    contacts: UserContact[] = [];
    userId: string = '';
    notifications: UserNotification[] = [];
    doneLabel: string = 'Done';
    contactsJsonFile: string = 'resources/contacts.json';
    userContacts: UserContact[] = [];

    defaultInviteLabel: string = 'Please send me an Invite!';
    defaultGreetingLabel: string = 'Hey there! Great to see you here';
    defaultSMSMessage: string = 'Hey, Check out this app';

    constructor(public config: Config, public service: ServiceCaller, 
            public nav: NavController, public platform: Platform, public http: Http) {
    }

    onPageWillEnter() {
        this.loadContacts();        
    }
    // TODO: Delete .. Fetch from local store or remote
    loadContactsFromFile() {
        this.http.get(this.contactsJsonFile).map(res => res.json())
        .subscribe(data => { this.filterContacts(data) });
    }

    // TODO: There should be no need to filter again
    filterContacts(data: UserContact[]) : UserContact[] {
         return Enumerable.From(data).Where(elem => elem.Email.length > 2).OrderBy(elem => elem.Name).ToArray();
    }

    loadContacts(refresh: boolean = false) {        
         this.contacts = JSON.parse(window.localStorage['contacts']);
        this.userContacts = this.filterContacts(this.contacts);
    }

    saveAndGoBack() {
        // write settings to cloud       
        this.nav.pop();
    }

    //#region Friend Functions
    inivte(contact: UserContact) {
        if (contact.Phone.length > 0) {
            this.inviteBySMS(contact);
        }
        else {
            console.log("send email");
         }
    }

    unFollow(contact: UserContact) {
        let index = this.contacts.indexOf(contact);
        this.contacts[index].isFollowing = false;
        window.localStorage['contacts'] = JSON.stringify(this.contacts); // TODO: Instead fetch from server and write to local storage
        this.service.unFollow(contact).subscribe(data => { console.log(data);});
    }

    inviteBySMS(contact: UserContact) {
        SMS.send(contact.Phone, "Hey, Check out this"); // TODO
    }

    inviteByMail(contact: UserContact) {
        console.log("Invite by email"); // TODO: Use Native email
    }

    deleteContact(contact: UserContact) {
        // TODO: Also delete in local storage
        let index = this.contacts.indexOf(contact);
        if (index > -1) { this.contacts.splice(index, 1); }
        window.localStorage['contacts'] = JSON.stringify(this.contacts);
        this.service.deleteContact(contact).subscribe(data => {console.log(data);});
    }
    //#endregion Friend Functions
}

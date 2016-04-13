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

    constructor(public config: Config, public service: ServiceCaller, public nav: NavController, public platform: Platform, public http: Http) {
        //this.loadContactsFromFile();
        this.loadContacts();
    }

    // TODO: Delete .. Fetch from local store or remote
    loadContactsFromFile() {
        this.http.get(this.contactsJsonFile).map(res => res.json())
        .subscribe(data => { this.filterContacts(data) });
    }

    // TODO: There should be no need to filter again
    filterContacts(data: UserContact[]) {
         this.userContacts = Enumerable.From(data).OrderBy(elem => elem.Name).ToArray();
    }

    //#region Contacts`
    showContacts() {
        this.nav.push(ContactsPage);
    }
    
    loadContacts(refresh: boolean = false) {
         this.userId = JSON.parse(window.localStorage['userId'] || '{}');
         if (this.userId == undefined || this.userId.length == 0) { this.nav.pop();}

         this.contacts = JSON.parse(window.localStorage['contacts'] || '{}');
        if (this.contacts != undefined || this.contacts.length == 0) {
            //let contactsFromServer = this.service.fetchContacts(userId);
            this.nav.pop();
        }
    }

/*    
    refreshContacts() {
        var contactJson: UserContactsInfo;
        let contacts: UserContact[] = [];
        var contactsList = Contacts.find(['*']);
        contactsList.then(data => { 
            contacts = Enumerable.From(data).Select(c => {
            let contact: UserContact = {
                profileImg: '',
                Name: '',
                isOnNetwork: false,
                isFollowing: true,
                Phone: '',
                Email: ''                
            };                
            return contact;}).ToArray();
            let jsonArray = JSON.stringify(contacts);
            window.localStorage['contacts'] = jsonArray; 
            contactJson = { UserId: this.userId, JSON: jsonArray }
            let contactsUpload = this.service.uploadContactsList(JSON.stringify(contactJson));
            contactsUpload.subscribe(data => {console.log("contacts updated");});            
                });
    }
    */
    //#region Contacts`

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

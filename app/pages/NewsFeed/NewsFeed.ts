/// <reference path="../../../typings/tsd.d.ts" />
import Dictionary = collections.Dictionary;

import { Page, NavController, NavParams, Modal, Platform, Alert, Loading, Slides, List, Content} from 'ionic-angular';
import {Http, Headers} from 'angular2/http';
import {ElementRef, ViewChild} from 'angular2/core';
import {Contacts, SocialSharing} from 'ionic-native';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/observable/fromArray'; // required for Observable.of();

import {PublishedPost, Stream, UserContactsInfo, UserContact} from '../../contracts/ServerContracts';
import {ConnectivityError} from '../ConnectivityError/ConnectivityError';
import {UserSettings} from '../UserSettings/UserSettings';
import {ContactsPage} from '../ContactsPage/ContactsPage';
import {Contact} from 'ionic-native/dist/plugins/contacts';

import {FullArticle} from '../FullArticle/FullArticle';
import {PostPage} from '../PostPage/PostPage';

import {Categories} from '../Categories/Categories';
import {Config} from '../../providers/config';
import {ServiceCaller} from '../../providers/servicecaller';
import {Notifications} from '../../providers/notifications';


@Page({
    templateUrl: 'build/pages/NewsFeed/NewsFeed.html'
})

export class NewsFeed {
    @ViewChild(Content) content: Content;
    @ViewChild(List) list: List;
    
    constructor(public http: Http, public platform: Platform, public nav: NavController, public navParams: NavParams,
        public config: Config, public service: ServiceCaller, public notifications: Notifications) {
        this.init();
    }

    createLoading(): Loading {
        return Loading.create(
            {
                content: 'Loading.. Please wait',
                dismissOnPageChange: true,
                duration: 4000
            }
        );
    }

    init() {
        this.subscribeToNotifications();
        this.refresh();
        //this.loadContacts();
    }


    //#region Notifications
    subscribeToNotifications() {
        this.platform.ready().then(() => {
            document.addEventListener("pause", () => this.onPause(this.notifications), false);
            document.addEventListener("resume", () => this.onResume(this.notifications), false);
        });
    }

    onPause(not: any) {
        console.log("pausing...");
        not.startNotifications(this.config.user.Id);
    }

    onResume(not: any) {
        not.stopNotifications(this.config.user.Id);
    }

    //#endregion Notifications

    moreDataCanBeLoaded(): boolean {
        return true;
    }

    doInfinite(infiniteScroll) {
        console.log('fetching more posts..');
            let newPosts = this.service.getNewsFeed(this.config.user.Id, this.skip);
            newPosts.subscribe(posts => { infiniteScroll.complete();  this.update(posts, this.skip); });
    }

    refresher() {
        console.log('refesher..');
    }

    checkConnectionToServer() {
        var connectivityModal = Modal.create(ConnectivityError);
        connectivityModal.onDismiss(data => { setTimeout(this.checkConnectionToServer(), 10000); })

        let ping = this.service.checkConnection();
        ping.subscribe(data => { setTimeout(this.checkConnectionToServer(), 10000); }, err => { this.nav.present(connectivityModal); });
    }

    onPageDidEnter() {
        //this.refresh();
        this.onResume(this.notifications);
    }

    createNewPost() {
        this.nav.push(PostPage);
    }

    refresh() {
        this.newsFeedError = '';
        if (this.skip > 0) {this.content.scrollToTop();}
        this.skip = 0;
        this.fetchArticles(this.skip);
    }

    handleError(err: any) {
        this.newsFeedError = 'Check your network Connection';
        let alert = Alert.create({ title: 'Problem!', subTitle: this.newsFeedError, buttons: ['OK'] });
        this.nav.present(alert);
    }

    fetchArticles(skip: number) {
        var loading = this.createLoading();
        this.nav.present(loading); // TODO: Fix bug when used with OnPageWillEnter and OnPageDidEnter
        this.service.getNewsFeed(this.config.user.Id, skip)
            .subscribe(posts => {
                loading.dismiss();
                this.update(posts, skip);
            },
            err => {
                loading.dismiss();
                console.log('error..');
                this.handleError(err)
            });
    }

    //#region Sharing
    /*
    takeScreenshot(element: HTMLElement, callback: any) {
        var parentThis = this;
        var options: Html2Canvas.Html2CanvasOptions = {
            logging: true,
            timeout: 0, // Use 0 for no timeout
            onrendered(canvas) {
                var ctxt = canvas.getContext("2d");
                ctxt.msImageSmoothingEnabled = false;
                var myImage: string = canvas.toDataURL("image/png");
                callback(myImage, parentThis);
            }
        };
        html2canvas(element, options);
    }
    */

    shareScreenshot(id: string) {
        let parentThis = this;
        let imageUrl = this.service.renderHtml(id);
        console.log('sharing screenshot..');
        imageUrl.subscribe(data => this.shareImage(data, parentThis));
    }

    shareImage(imageUrl: any, parentThis: any) {
        console.log('opening image..');
        parentThis.platform.ready().then(() => {
            window.open(imageUrl);
            //SocialSharing.share("Shared from NewsNetwork", null, imageUrl);
        });
    }

    share(article: PublishedPost) {
        console.log("share clicked..");
        if (this.config.isOnAndroid) {
            this.platform.ready().then(() => {
                SocialSharing.share("Shared from NewsNetwork", null, null, article.OriginalLink);
            });
        }
    }
    //#endregion Sharing


    update(art: PublishedPost[], skip: number) {
        console.log('updating..');
        if (skip == 0) {
            this.articles = art.slice();
        } else {
            this.articles = this.articles.concat(art.slice()); // TODO: Test
        }
        this.skip = this.articles.length;
    }

    //#region Utils
    contains(array: any[], value: any): boolean {
        return Enumerable.From(array).Contains(value);
    }
    //#endregion Utils

    //#region User Reaction

    addLike(article: PublishedPost) {
        var likes = this.service.sendUserReaction(article.Id, this.config.user.Id, 'Like');
        likes.subscribe(data => { article.LikedBy = data; });
    }

    removeLike(article: PublishedPost) {
        var likes = this.service.sendUserReaction(article.Id, this.config.user.Id, 'UnLike');
        likes.subscribe(data => { article.LikedBy = data; });
    }

    reTweet(article: PublishedPost) {
        var shares = this.service.sendUserReaction(article.Id, this.config.user.Id, 'ReTweet');
        shares.subscribe(data => { article.SharedBy = data; });
    }

    undoReTweet(article: PublishedPost) {
        var shares = this.service.sendUserReaction(article.Id, this.config.user.Id, 'UnReTweet');
        shares.subscribe(data => { article.SharedBy = data; });
    }
    //#endregion User Reaction

    //#region Contacts`
    showContacts() {
        this.nav.push(ContactsPage);
    }

    loadContacts(refresh: boolean = false) {
        let contacts: Contact[] = JSON.parse(window.localStorage['contacts'] || '{}');
        if (contacts != undefined && contacts.length > 0) {
            this.isContactsLoaded = true;
            console.log("contacts already in local store");
        }
        else {
            let contactsFromServer = this.service.fetchContacts(this.config.user.Id);
            contactsFromServer.subscribe(data => {
                if (data.length == 0) {
                    console.log("remote contacts is empty");
                    this.refreshContacts();
                }
                else {
                    window.localStorage['contacts'] = JSON.stringify(data)
                    this.isContactsLoaded = true;
                    console.log("contacts fetched from remote");
                }
            });
        }
    }

    refreshContacts() {
        var contactJson: UserContactsInfo;
        let contacts: UserContact[] = [];
        console.log("loading contacts from plugin");
        if (!this.config.isOnAndroid) return;
        var contactsList: Promise<Contact[]> = Contacts.find(['*']);
        contactsList.then(data => {
            console.log("contacts fetched by plugin");
            contacts = Enumerable.From(data).Where(c => c.displayName != null && c.emails != null && c.phoneNumbers != null)
                .Where(c => c.displayName.length > 0 && c.emails.length > 0 && c.phoneNumbers.length > 0)
                .Select(c => {
                    let contact: UserContact = {
                        profileImg: '',
                        Name: c.displayName,
                        isOnNetwork: false,
                        isFollowing: true,
                        Phone: c.phoneNumbers[0].value,
                        Email: c.emails[0].value
                    };
                    return contact;
                }).ToArray();
            console.log(contacts);

            let jsonArray = JSON.stringify(contacts);
            window.localStorage['contacts'] = jsonArray;
            this.isContactsLoaded = true;
            contactJson = { UserId: this.config.user.Id, JSON: jsonArray }
            let contactsUpload = this.service.uploadContactsList(JSON.stringify(contactJson));
            console.log("updating remote contacts");
            contactsUpload.subscribe(data => { console.log("contacts updated"); });
        });
    }
    //#region Contacts`

    //#region Modals 
    openFullArticle(event: any, source: string) {
        var params = { src: source };
        let fullArticleModal = Modal.create(FullArticle, params);
        this.nav.present(fullArticleModal);
    }

    openCategorySettings() {
        let settingsModal = Modal.create(Categories);
        settingsModal.onDismiss(settings => { this.refresh(); })
        this.nav.present(settingsModal);
    }

    openUserSettings() {
        let settingsModal = Modal.create(UserSettings);
        settingsModal.onDismiss(settings => { this.refresh(); })
        this.nav.present(settingsModal);
    }

    openNotifications() {
        let notificationsModal = Modal.create(Notifications);
        this.nav.present(notificationsModal);
    }
    //#endregion Modals 

    connectionError: string = '';
    isContactsLoaded: boolean = false;
    skip: number = 0;
    newsFeedError: string = '';
    articles: PublishedPost[] = [];
    homeBadgeNumber: number = 0;
    notificationBadgeNumber: number = 0;
    backgroundImageUrl: string = "url(\"resources/background.jpg\")";

    //    @ViewChild('slides') swiper: Slides;

    /*
        options: any = {
            direction: "vertical",
            effect: 'slide',
            fade: {
                crossFade: true
            }, keyboardControl: true,
            mousewheelControl: true,
            onlyExternal: false,
            onInit: (slides: any) => { this.swiper = slides; },
            onSlideChangeStart: (slides: any) => { this.slideChanged(); },
        };
        */
}

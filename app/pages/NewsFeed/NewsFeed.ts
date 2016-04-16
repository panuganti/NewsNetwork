/// <reference path="../../../typings/tsd.d.ts" />
import Dictionary = collections.Dictionary;

import {Page, NavController, NavParams, Modal, Platform, Alert, Loading} from 'ionic-angular';
import {Http, Headers} from 'angular2/http';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/observable/fromArray'; // required for Observable.of();

import {PublishedPost, Stream, UserContactsInfo, UserContact} from '../../contracts/ServerContracts';
import {UserSettings} from '../UserSettings/UserSettings';
import {ContactsPage} from '../ContactsPage/ContactsPage';
import {Contacts, SocialSharing} from 'ionic-native';
import {Contact} from 'ionic-native/dist/plugins/contacts';

//import {Notifications} from '../Notifications/Notifications';
import {FullArticle} from '../FullArticle/FullArticle';
import {PostPage} from '../PostPage/PostPage';
import {SignIn} from '../SignIn/SignIn';

import {Categories} from '../Categories/Categories';
import {Config} from '../../providers/config';
import {ServiceCaller} from '../../providers/servicecaller';
import {Notifications} from '../../providers/notifications';


@Page({
    templateUrl: 'build/pages/NewsFeed/NewsFeed.html'
})

export class NewsFeed {
    userId: string = '';
    isContactsLoaded: boolean = false;
    skip: number = 0;
    newsFeedError: string = '';
    articles: PublishedPost[] = [];
    homeBadgeNumber: number = 0;
    notificationBadgeNumber: number = 0;
    backgroundImageUrl: string = "url(\"resources/background.jpg\")";
    public swiper: any;

    options: any = {
        direction: "vertical",
        keyboardControl: true,
        mousewheelControl: true,
        onlyExternal: false,
        onInit: (slides: any) => { this.swiper = slides; this.refresh(); },
        onSlideChangeStart: (slides: any) => { this.slideChanged();},
    };

    constructor(public http: Http, public platform: Platform, public nav: NavController, public navParams: NavParams,
            public config: Config, public service: ServiceCaller, public notifications: Notifications) {
            this.init();    
    }

    init() {
        this.userId = this.config.userId;
        this.subscribeToNotifications();
    }
    /*
        presentLoading() {
           this.loading = Loading.create({
    spinner: 'hide',
    content: `
      <div class="custom-spinner-container">
        <div class="custom-spinner-box"></div>
      </div>`,
    duration: 5000
  });
    }

hideLoading() {
    this.loading.dismiss();
}
*/
    //#region Notifications
    subscribeToNotifications() {
        this.platform.ready().then(() => {
            document.addEventListener("pause", this.onPause);
            document.addEventListener("resume", this.onResume);
        });
    }

    onPause() {
        this.notifications.startNotifications(this.userId);
    }

    onResume() {
        this.notifications.stopNotifications(this.userId);
    }
    //#endregion Notifications

    onPageWillEnter() {
        this.refresh();
    }

    createNewPost() {
        this.nav.push(PostPage);
    }

    refresh() {
        this.newsFeedError = '';
        this.skip = 0;
        //this.config.printTimeElapsed();
        this.swiper.slideTo(0, 100, true);
        this.fetchArticles(this.skip);
    }
    
    handleError(err: any) {
        this.newsFeedError = JSON.parse(err._body).ExceptionMessage;   
        let alert = Alert.create({title: 'Problem!', subTitle: this.newsFeedError, buttons:['OK']});
        this.nav.present(alert);
    }

    fetchArticles(skip: number) {
        this.service.getNewsFeed(this.userId, skip)
                .subscribe(posts => {this.update(posts, skip); },
                           err => {this.handleError(err)});
    }

    /*
    moreDataCanBeLoaded() {
        return true;
    }

    loadMore($event: any) {
        console.log("infile scroll to load more triggered");
    }
    */
    
    share(article: PublishedPost) {
        if (this.config.isOnAndroid){
            SocialSharing.share("Shared from NewsNetwork", null, null, article.OriginalLink);
        }
    }
    
    update(art: PublishedPost[], skip: number) {
        this.service.prefetchImages(art);
        this.config.printTimeElapsed();
        if (skip == 0) {
            this.articles = art.slice();
        } else {
            this.articles.concat(art.slice()); // TODO: Test
        }
        this.skip = this.articles.length;
    }

    //#region Utils
    contains(array: any[], value: any): boolean {
        return Enumerable.From(array).Contains(value);
    }
    //#endregion Utils

    //#region User Reaction
    slideChanged() {
        let slideNo = this.swiper.activeIndex;
        let totalSlides = this.articles.length;
        if (totalSlides > 0 && totalSlides -slideNo < 5 )
        {
            this.fetchArticles(this.skip);
            // fetch next set of articles
        }
    }
    
    addLike(article: PublishedPost, userId: string) {
        var likes = this.service.sendUserReaction(article.Id, userId, 'Like');
        likes.subscribe(data => { article.LikedBy = data; });
    }

    removeLike(article: PublishedPost, userId: string) {
        var likes = this.service.sendUserReaction(article.Id, userId, 'UnLike');
        likes.subscribe(data => { article.LikedBy = data; });
    }

    reTweet(article: PublishedPost, userId: string) {
        var shares = this.service.sendUserReaction(article.Id, userId, 'ReTweet');
        shares.subscribe(data => { article.SharedBy = data; });
    }

    undoReTweet(article: PublishedPost, userId: string) {
        var shares = this.service.sendUserReaction(article.Id, userId, 'UnReTweet');
        shares.subscribe(data => { article.SharedBy = data; });
    }
    //#endregion User Reaction

    //#region Contacts`
    showContacts() {
        this.nav.push(ContactsPage);
    }
    
    loadContacts(refresh: boolean = false) {
         let contacts: Contact[] = JSON.parse(window.localStorage['contacts'] || '{}');
         let contactsFromServer = this.service.fetchContacts(this.userId);
        if (contacts != undefined || contacts.length == 0) {
            this.isContactsLoaded = true;
        }
        else {
            contactsFromServer.subscribe(data => { if (data.length == 0) {
                this.refreshContacts();
            }
            else {
                window.localStorage['contacts'] = JSON.stringify(data)
                this.isContactsLoaded = true;
            }
        });
        }
    }
    
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
            this.isContactsLoaded = true;
            contactJson = { UserId: this.userId, JSON: jsonArray }
            let contactsUpload = this.service.uploadContactsList(JSON.stringify(contactJson));
            contactsUpload.subscribe(data => {console.log("contacts updated");});            
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
}

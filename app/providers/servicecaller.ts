/// <reference path="../../typings/tsd.d.ts" />
import Dictionary = collections.Dictionary;

import {Injectable} from 'angular2/core';
import {Http, Headers, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromArray'; // required for Observable.of();

import {Config} from './config';
import {Cache} from './cache';
import {Article, VersionInfo, ConfigData, CredentialsValidation} from '../contracts/DataContracts';
import {PostPreview, UserNotification, UnpublishedPost, User, PublishedPost, UserContact, Stream} from '../contracts/ServerContracts';

@Injectable()
export class ServiceCaller {
    url: string = "https://script.google.com/macros/s/AKfycbz2ZMnHuSR4GmTjsuIo6cmh433RRpPRH7TwMaJhbAUr/dev";
    //apiUrl: string = "http://newsswipesserver20160101.azurewebsites.net";
    apiUrl: string = "http://localhost:54909";

    constructor(public cache: Cache, public http: Http) {
    }
  

    //#region Connection 
    checkConnection() : Observable<string> {
        return this.getRequest<string>("/config/CheckConnection/", "hello world", 0);
    }
    //#endregion Connection 

    // TODO: Move to Cache
    prefetchImages(posts: PublishedPost[]) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
//        posts.forEach(article => this.http.get(article.ImageUrl, {headers: headers}).subscribe(data => {}));
    }

    //#region Notifications
    checkForNotifications(userId: string) : Observable<UserNotification> {
        return this.getRequest<UserNotification>("/notifications/getNotifications/", userId);
    }

    clearAllNotifications(userId: string) : Observable<boolean> {
        return this.getRequest<boolean>("/notifications/clearAllNotifications/", userId);
    }
    //#endregion Notifications

    //#region Feed

    getNewsFeed(userId: string, skip: number): Observable<PublishedPost[]> {
        return this.getRequest<PublishedPost[]>("/feed/getfeed/", userId + "/" + skip);
    }

    getTimeline(userId: string, skip: number): Observable<PublishedPost[]> {
        return this.getRequest<PublishedPost[]>("/feed/timeline/", userId + "/" + skip);
    }

    //#endregion Feed

    //#region Likes & Shares
    sendUserReaction(articleId: string, userId: string, reaction: string): Observable<string[]> {
        var userReaction = {
            ArticleId: articleId, 
            UserId: userId,
            ReactionType: reaction
        };
        return this.postRequest<string[]>("/feed/AddUserReaction", JSON.stringify(userReaction));
    }

    //#endregion Likes & Shares


    //#region User
    updateUserInfo(user: User): Observable<boolean> {
        return this.postRequest<boolean>("/user/UpdateUserProfile", JSON.stringify(user));
    }

    getUserInfo(userId: string): Observable<User> {
        return this.getRequest<User>("/user/GetUserInfo/", userId);
    }

    signUp(email: string, password: string, language: string): Observable<User> {
        var credentials = {
            Email: email,
            Password: password,
            Language: language
        }
        return this.postRequest<User>("/user/SignUp", JSON.stringify(credentials), 0);
    }

    validateCredentials(email: string, password: string): Observable<User> {
        var credentials = {
            Email: email,
            Password: password
        };
        return this.postRequest<User>("/user/ValidateCredentials", JSON.stringify(credentials), 0);
    }

    checkIfEmailExists(email: string): Observable<boolean> {
        return this.getRequest<boolean>("/user/CheckIfEmailExists/", email);
    }

    getStreams(userId: string): Observable<Stream[]> {
        return this.getRequest<Stream[]>("/user/GetStreams/", userId);
    }
    
    updateUserStreams(userId: string, streams: Stream[]) : Observable<boolean> {
        return this.postRequest<boolean>("/user/UpdateStreams/" + userId, JSON.stringify(streams));
    }

    unFollow(userContact: UserContact): Observable<boolean> {
        return this.postRequest<boolean>("/user/UnFollow", JSON.stringify(userContact));
    }

    deleteContact(userContact: UserContact): Observable<boolean> {
        return this.postRequest<boolean>("/user/DelteContact", JSON.stringify(userContact));
    }
    
    fetchContacts(userId: string) : Observable<UserContact[]>{
        return this.getRequest("/user/FetchContacts/", userId);
    }
    //#endregion User

    //#region Config
    getVersionInfo(): Observable<VersionInfo> {
        return this.getRequest<VersionInfo>("/config/GetVersionInfo", "");
    }

    getAllStreams(): Observable<Stream[]> {
        return this.getRequest<Stream[]>("/config/GetAllStreams", "");
    }

    getStreamsOfALanguage(lang: string): Observable<Stream[]> {
        return this.getRequest<Stream[]>("/config/GetStreams/", lang);
    }

    getLabelsOfALanguage(lang: string): Observable<Dictionary<string, string>> {
        return this.getRequest<Dictionary<string, string>>("/config/GetLabels/", lang);
    }

    //#endregion Config

    //#region Post
    fetchPostPreview(url: string): Observable<PostPreview> {
        return this.postRequest<PostPreview>("/feed/PreviewArticle", JSON.stringify(url));
    }

    fetchFromFeeds(feedStream: string): Observable<PostPreview> {
        return this.postRequest<PostPreview>("/feed/FetchFromFeedStream", JSON.stringify(feedStream));
    }

    postArticle(post: UnpublishedPost): Observable<boolean> {
        return this.postRequest<boolean>("/feed/PostArticle", JSON.stringify(post));
    }
    //#endregion Post
    
    //#region Upload UserInfo
    uploadDeviceInfo(deviceInfo: string) : Observable<boolean> {
        return this.postRequest<boolean>("/user/UpdateUserDeviceInfo", deviceInfo);        
    }
    
    uploadContactsList(contactsList: string) : Observable<boolean> {
        return this.postRequest<boolean>("/user/UpdateUserContactList", contactsList);
    }
    
    uploadUserLocation(geoInfo: string) : Observable<boolean>{
        return this.postRequest<boolean>("/user/UpdateUserGeoInfo", geoInfo);
    }    
    //#endregion Upload UserInfo
    
    //#region private methods
    getRequest<T>(route: string, request: string, retryCount: number = 0) : Observable<T> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.get(this.apiUrl + route + request, { headers: headers }).retry(retryCount).map(res => res.json());                        
    }
    
    postRequest<T>(route: string, jsonString: string, retryCount: number = 0) : Observable<T> {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(this.apiUrl + route,
            jsonString, { headers: headers }).retry(retryCount).map(res => res.json());
    }
    //#endregion private methods
}
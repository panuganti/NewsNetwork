import { Page, NavParams, NavController, Platform} from 'ionic-angular';

import {ServiceCaller} from '../../providers/servicecaller';
import {Config} from '../../providers/config';

import {PostPreview, UnpublishedPost, ImageEntity} from '../../contracts/ServerContracts';

import {ContactsPage} from '../ContactsPage/ContactsPage';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';


@Page({
    templateUrl: 'build/pages/PostPage/PostPage.html'
})

export class PostPage {
    userId: string = '';
    canPost: boolean = true;
    isAdmin: boolean = false;
    
    state: string = "NoPreview";
    backgroundImageUrl: string = "url(\"resources/background.jpg\")";
    url: string;
    candidateImageUrl: string;
    imageUrl: string;
    imageCounter: number = -1;
    dbImageCounter: number = -1;
    tags: string;
    streams: string[];
    postPreview: PostPreview;
    emptyPreview: PostPreview;
    language: string;
    postSource: string;
    feedStream: string;
    defaultText = 'Write Text Here ..';
    goodImageExists: boolean = false;

    public swiper: any;
    options: any = {
        keyboardControl: true,
        mousewheelControl: true,
        onlyExternal: false,
        onInit: (slides: any) => {this.swiper = slides; },
        onSlideChangeStart: (slides: any) => { this.loadNextImage()},
        onSlideNextStart: (swiper) => { this.loadNextImage()},
        onSlidePrevStart: (swiper) => {  this.loadPrevImage()}
    };

    toggleHeadingEditing: boolean = false;
    toggleSnippetEditing: boolean = false;
    toggleImage: boolean = true;

    constructor(public nav: NavController, public config: Config, public service: ServiceCaller) {
        this.init();
    }

    init() {
        this.userId = JSON.parse(window.localStorage['userId']); 
        if (this.userId == undefined || this.userId.length == 0) {
            this.nav.pop(); 
        }         
        let user = this.service.getUserInfo(this.userId);
        user.subscribe(data => {console.log(data); this.canPost = data.CanPost; this.isAdmin = data.CanPost});
    }

    editImageUrl() { this.toggleImage = !this.toggleImage; }
    editHeading() { this.toggleHeadingEditing = !this.toggleHeadingEditing; }
    editSnippet() { this.toggleSnippetEditing = !this.toggleSnippetEditing; 
        if (this.postPreview.Snippet == this.defaultText) {
            this.postPreview.Snippet = '';
        }
     }
     
     undoEditMode() {
        this.toggleHeadingEditing = false;
        this.toggleSnippetEditing = false;
        this.toggleImage = true;         
     }
    
    publish(skip: boolean) {
        let streams: string[] = [];
        let tags: string[] = [];
        if(this.tags != undefined && this.tags != null && this.tags.length > 0) 
            { tags = this.tags.split(',');}
        if (this.streams != undefined && this.streams != null && this.streams.length > 0)
        { this.streams.forEach(s => streams.push(this.feedStream + '_' + s)); }
        let imageEntity: ImageEntity = {
            Url: this.imageUrl,
            Tags: tags
        };
        var unpublishedPost: UnpublishedPost = {
            CardStyle: "Horizontal",
            Heading: this.postPreview.Heading,
            Snippet: this.postPreview.Snippet,
            OriginalLink: this.postPreview.OriginalLink,
            Image: imageEntity,
            Streams: streams,
            Language: this.feedStream,
            PostedBy: this.config.userId,
            Tags: [],
            Date: "",
            ShouldSkip: skip
        };
        var isPostSuccessful = this.service.postArticle(unpublishedPost);
        isPostSuccessful.subscribe((hasSucceeded) => this.loadNextArticle(hasSucceeded));
    }
    
    reset() {
        this.state = "NoPreview";
        this.postSource = null;
        this.postPreview = this.emptyPreview;
        this.url = '';
        this.goodImageExists = false;
        this.streams = [];
    }

    loadNextArticle(hasPrevPostSucceeded: boolean) {
        if (hasPrevPostSucceeded) { this.reset();}
    }

    loadArticle(postSource: string) {
        this.state = 'Loading';
        this.postSource = postSource;
        var articleData;
        if (postSource == 'url') {
             articleData = this.service.fetchPostPreview(this.url);
        }
        else if (postSource == 'feeds') {
            articleData = this.service.fetchFromFeeds(this.feedStream);
        }
        articleData.subscribe(data => { this.postPreview = data; this.prepareForEditing();});
    }
    
    prepareForEditing() {
        this.state = 'Preview'; this.imageCounter = -1; this.loadNextImage(); 
        if (this.postPreview.Snippet == '') {this.postPreview.Snippet = this.defaultText;}
    }

    //#region Image Loaders
    // TODO: Filter out upon loading itself

    loadPrevImage() {
        if (this.dbImageCounter > 0) {
            this.dbImageCounter--;
            this.imageUrl = this.postPreview.ImagesFromDb[this.imageCounter].Url;
        }
        else if (this.imageCounter > 0) {
            this.imageCounter--;
            this.imageUrl = this.postPreview.Images[this.imageCounter];
            this.checkSize(this.imageUrl, false);
        }
    }

    parentMethod(width: number, height: number, fwd: boolean) {
        if (width < 200 || height < 200) {
            this.goodImageExists = true;
            if (fwd) { this.loadNextImage(); }
            else { this.loadPrevImage(); }
        }
    }

    checkSize(url: string, fwd: boolean) {
        var image = new Image();
        image.src = url;
        var parentThis = this;
        image.onload = function() {
            parentThis.parentMethod(this.width, this.height, fwd);
        }
    }

    loadNextImage() {
        if (this.imageCounter < this.postPreview.Images.length - 1) {
            this.imageCounter++;
            this.imageUrl = this.postPreview.Images[this.imageCounter];
            this.checkSize(this.imageUrl, true);
        }
        else if (this.dbImageCounter < this.postPreview.ImagesFromDb.length - 1) {
            this.dbImageCounter++;
            this.imageUrl = this.postPreview.ImagesFromDb[this.imageCounter].Url;
        }
        else if ((this.imageCounter == this.postPreview.Images.length - 1) && (this.dbImageCounter >= this.postPreview.ImagesFromDb.length - 1) && this.goodImageExists)
        {
            this.imageCounter = -1;
            this.dbImageCounter = -1;
            this.loadNextImage();
        }
    }
    //#endregion Image Loaders
    
    sendInvitations() {
        this.nav.push(ContactsPage);
    }
}

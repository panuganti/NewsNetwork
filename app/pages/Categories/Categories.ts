/// <reference path="../../../typings/tsd.d.ts" />
import Dictionary = collections.Dictionary;

import {Page, NavController, ViewController} from 'ionic-angular';
import {Component} from 'angular2/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';

import {Stream} from '../../contracts/ServerContracts';
import {Config} from '../../providers/config';
import {ServiceCaller} from '../../providers/servicecaller';

import {SignIn} from '../SignIn/SignIn';

@Page({
    templateUrl: 'build/pages/Categories/Categories.html'
})

export class Categories {
    userId: string = '';
    streams: Stream[] = [];
    doneLabel: string = "Save";

    constructor(public config: Config, public nav: NavController,
        public view: ViewController, public service: ServiceCaller) {
        this.init();
    }

    init() {
        this.userId = JSON.parse(window.localStorage['userId']); 
        if (this.userId == undefined || this.userId.length == 0) {
            this.nav.push(SignIn); // TODO: Change this to setting root
        }         

        let userStreams = this.service.getStreams(this.userId);
        userStreams.subscribe(data => { this.streams = data; 
        })
    }
    
    saveAndGoBack() {
        // write settings to cloud
        this.service.updateUserStreams(this.userId, this.streams);
        this.view.dismiss();
    }
}

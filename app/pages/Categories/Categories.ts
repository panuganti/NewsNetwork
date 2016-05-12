/// <reference path="../../../typings/tsd.d.ts" />
import Dictionary = collections.Dictionary;

import {Page, NavController, ViewController, Loading} from 'ionic-angular';
import {Component} from 'angular2/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';

import {Stream} from '../../contracts/ServerContracts';
import {Config} from '../../providers/config';
import {ServiceCaller} from '../../providers/servicecaller';

@Page({
    templateUrl: 'build/pages/Categories/Categories.html'
})

export class Categories {
    userId: string = '';
    streams: Stream[] = [];
    doneLabel: string = "Save";

    loading: Loading = Loading.create(
        {
            content: 'Loading.. Please wait',
            dismissOnPageChange: true,
            duration: 500
        }
    );


    constructor(public config: Config, public nav: NavController,
        public view: ViewController, public service: ServiceCaller) {
    }

    onPageWillEnter() {
        this.userId = this.config.user.Id; 
        let userStreams = this.service.getStreams(this.userId);
        userStreams.subscribe(data => { this.streams = data; 
        })
    }
    
    saveAndGoBack() {
        let updateStreams = this.service.updateUserStreams(this.userId, this.streams);
        updateStreams.subscribe(data => { console.log("streams updated" + data);})
        this.view.dismiss();
    }
}

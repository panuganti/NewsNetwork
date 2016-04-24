/// <reference path="../../typings/tsd.d.ts" />
import Dictionary = collections.Dictionary;

import {Injectable} from 'angular2/core';
import {User, Stream} from '../contracts/ServerContracts';
import {ServiceCaller} from './servicecaller';


@Injectable()
export class Config {    
    version = "0.0.1";
    
    //#region global variables
    userId: string = '';
    language: string = 'Hindi';
    user: User = null;
    
    state: string = 'Active';
    globalTimer: number = 0;
    isOnAndroid: boolean = false;
    
    labels: Dictionary<string, string> = new Dictionary<string, string>();
    //#endregion global variables
        
    constructor(public service: ServiceCaller) {
        this.setInitialLabels();
    }   
    
    setUserInfo(user: User) {
        this.userId = user.Id;
        this.user = user;
    }
    
    setStateToActive() {
        this.state = 'Active';
    }
    
    setStateToBackground() {
        this.state = 'Background';        
    }
    
    isActive() : boolean { return this.state == 'Active';}
    
    initTimer() {
        this.globalTimer = new Date().getTime();
        console.log("timer started");
    }

    getTimeElapsed() : number {
        return new Date().getTime() - this.globalTimer;
    }
    
    printTimeElapsed() {
        console.log("Time: " + (new Date().getTime() - this.globalTimer) + "ms");
    }
    
    setLabels(labels: Dictionary<string, string>) {
        this.labels = labels;
    }
        
    setInitialLabels() {
        this.labels = new Dictionary<string, string>();
        this.labels.setValue('Email', 'Email');
        this.labels.setValue('Password', 'Password');
        this.labels.setValue('Login','Login');
        this.labels.setValue('SignUp', 'SignUp');
    }
    
    getLabel(label: string) {
        try {
            return this.labels.getValue(this.label.toLowerCase()); 
        }
        catch(error) {
            return label;
        }
    }
}
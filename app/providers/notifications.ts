/// <reference path="../../typings/tsd.d.ts" />

import {LocalNotifications, Badge} from 'ionic-native';
import {Injectable} from 'angular2/core';

import {ServiceCaller} from './servicecaller';
import {Config} from './config';
import {UserNotification} from '../contracts/ServerContracts';

@Injectable()
export class Notifications {
    badge: number = 0;
    notificationInterval: number = 100000;
    notifications: any[] = [];
    notificationsOn: boolean = true;
    
    constructor(public service: ServiceCaller, public config: Config) { 
    }

    sendNotification(userNotification: UserNotification) {
        let badgeNumber = userNotification.badge;
        let notifications = userNotification.notifications;
        let notification = Enumerable.From(notifications).First();
        let str = notification.Heading;
        if (!this.config.isActive()) {
            LocalNotifications.schedule({
                id: Number(notification.Id),
                text: notification.Text,
                title : notification.Heading,
            });
        }
        this.setBadge(badgeNumber);
    }

    clearAllNotifications() {
        LocalNotifications.clearAll();
    }

    stopNotifications(userId: string) {
        if (!this.config.isOnAndroid) return;
        this.clearAllNotifications();
        this.clearBadge();
        this.notificationsOn = false;
        this.service.clearAllNotifications(userId);
    }
    
    startNotifications(userId: string) {
        if (!this.config.isOnAndroid) return;
        // TODO: Add Notification preference to User object & check here
        while(this.notificationsOn) {
            setTimeout(this.getNotifications(userId), this.notificationInterval);
        }
        // Watch for notifications and push it out until activated
    }

    getNotifications(userId: string)  {
        this.service.checkForNotifications(userId)
                            .subscribe(data => { this.sendNotification(data);});
        // Update home icon with badge number
        // if (background) { set badge, send local notifications}
    }

    setBadge(number: number) {        
        Badge.set(number);
    }
    
    clearBadge() {
        Badge.clear();
    }
}

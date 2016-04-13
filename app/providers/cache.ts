/// <reference path="../../typings/tsd.d.ts" />
import Dictionary = collections.Dictionary;

import {Contacts} from 'ionic-native';
import {Contact} from 'ionic-native/dist/plugins/contacts';

import {Injectable} from 'angular2/core';
import {Article} from '../contracts/DataContracts';
import {Config} from './config';


@Injectable()
export class Cache {
    MAX_CACHE_SIZE: number = 1000;
    langArticleCache: Dictionary<string, Article[]>;
    labelsCache: Dictionary<string, string> = new Dictionary<string, string>();
    articleCache: Dictionary<string, Article[]>;
    contacts: Contact[] = [];

    constructor() {
       this.langArticleCache = new Dictionary<string, Article[]>();
    }

    //#region Labels Cache
    setLabels(labelsCache: Dictionary<string, string>) {
        this.labelsCache = labelsCache;
    }
    //#endregion Labels Cache

    //#region Article Cache
    // Add elements to cache
    addToCache(lang: string, articles: Article[]) {
        if (!this.langArticleCache.containsKey(lang))
        { 
            var empty: Article[] = [];
            this.langArticleCache.setValue(lang, empty);
        }
        
        articles.forEach(article => this.langArticleCache.getValue(lang).push(article));
        // First check if size will exceed.
    }
    
    getFromArticleCache(lang: string): Article[] {
        return this.langArticleCache.getValue(lang);
    }
    //#endregion Article Cache

    //#region Contacts Cache
    //#endregion Contacts Cache

}
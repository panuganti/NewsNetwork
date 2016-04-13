export interface Article extends EntityWithText{
    SourceLogo: string;
    Source: string;
    Date: string;
    Image: string;
    CardStyle: string;
    Heading: string;
    OriginalLink: string;
    LikesCount: number;
    ReTweetCount: number;
    CommentsCount: number;  
    LastActivity: string;
    Score: number;
};

export enum CardStyle {
    Horiontal = 0,
    Vertical = 1
}

export interface UserCredentials {
    Email: string;
    Password: string;    
}

export interface VersionInfo {
    LatestVersion: string;
    MinSupportedVersion: string;
}

export interface UserNotification {
    Text: string;
    IsRead: boolean;       
}

export interface ConfigData {
   Labels: LanguageLabels;
   Url: string;
}

 export interface Dictionary {
     [index: string] : string;
 }

 export interface LanguageLabels {
    [index: string] : Dictionary;
    
 }

export interface CredentialsValidation {
    Id: string;
    Validated: boolean;
    Message: string;
}

export interface Entity {
     Id: string;    
 } 
 
export interface EntityWithText extends Entity {
     Text: string;
 }

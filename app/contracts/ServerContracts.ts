import {Entity} from "./DataContracts";


export interface PostEntity {
    Date: string;
    CardStyle: string;
    Heading: string;
    Snippet: string;
    OriginalLink: string;
}

export interface ImageEntity {
    Url: string;
    Tags: string[];
}

export interface DbImage extends ImageEntity {
    Id: string;
    Width: string;
    Height: string;
}

export interface UserNotification {
    badge: number;
    notifications: Notification[];
}

export interface Notification {
    Priority: number;
    Heading: string;
    Text: string;
    DateTime: string;
    Id: string;
}

export interface UserContact {
    isOnNetwork: boolean;
    Name: string;
    Email: string;
    Phone: string;
    profileImg: string;
    isFollowing: boolean;
}

export interface PostPreview extends PostEntity {
    ImagesFromDb: DbImage[];
    Images: string[];
}

export interface UnpublishedPost extends PostableEntity {
    Image: ImageEntity;
    ShouldSkip: boolean;
}

export interface PostableEntity extends PostEntity {
    Streams: string[];
    Tags: string[];
    Language: string;
    PostedBy: string;
}

export interface PublishedPost extends PostableEntity {
    Id: string;
    ImageUrl: string;
    CreatedTime: any;
    SharedBy: string[];
    LikedBy: string[];
}


export interface User extends Entity {
    Email: string;
    Language: string;
    Name: string;
    ProfileImage: string;
    CanPost: boolean;
    Streams: Stream[];
}

export interface Stream {
    Text: string;
    Lang: string;
    IsAdmin: boolean;
    UserSelected: boolean;
    backgroundImageUrl: string;
}

export interface UserSignupInfo {
    UserId: string,
    Language: string
}

export interface UserDeviceInfo {
    UserId: string;
    JSON: string;
}

export interface UserContactsInfo {
    UserId: string;
    JSON: string;
}

export interface UserGeoInfo {
    UserId: string;
    JSON: string;
}

export interface UserReaction {
    ArticleId: string;
    UserId: string;
    ReactionType: ReactionType;
}

export enum ReactionType {
    Like,
    ReTweet,
    UnLike,
    UnReTweet
}

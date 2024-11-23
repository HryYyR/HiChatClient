
export type Userdata = {
    ID: number
    NikeName: string
    UserName: string
    Email: string
    CreatedTime: string
    LoginTime: string
    Avatar: string
    Age: number,
    City: string,
    Introduce : string,
    GroupList: Array<GroupList>
    ApplyList: Array<ApplyItem>
    ApplyUserList: Array<ApplyUserItem>
    FriendList: Array<Friend>
}



export type ApplyUserItem = {
    ApplyMsg: string
    ApplyUserID: number
    ApplyUserName: string
    ApplyWay: number
    CreatedAt: string
    DeletedAt: string
    HandleStatus: number
    ID: number
    PreApplyUserID: number
    PreApplyUserName: string
    UpdatedAt: string
}
export type ApplyItem = {
    ID: number
    GroupID: number
    GroupName: string
    ApplyMsg: string
    ApplyUserID: number
    ApplyUserName: string
    ApplyWay: number
    CreatedAt: string
    DeletedAt: string
    UpdatedAt: string
    HandleStatus: number

}
export type GroupList = {
    GroupInfo: GroupInfo
    MessageList: Array<MessageListitem>
}

export type Group = Array<GroupList>

export type GroupinfoList = Array<GroupInfo>

export type GroupInfo = {
    Avatar: string
    CreatedAt: string
    CreaterID: number
    CreaterName: string
    DeletedAt: string
    Grade: number
    MemberCount: number
    UnreadMessage: number
    GroupName: string
    ID: number
    UUID: string
    UpdatedAt: string
}

// 群聊消息体
export type MessageListitem = {
    ID?: number
    Context: any
    CreatedAt: string
    GroupID: number
    IsReply: boolean
    Msg: string
    MsgType: number
    MsgStatus?:boolean
    ReplyMsgID: number
    UserID: number
    UserName: string
    UserUUID?: string 
    UserAvatar: string
    UserAge:number
    UserCity:string
}

// 好友信息
export type Friend = {
    Age: string
    Avatar: string
    City: string
    CreatedAt: string
    DeletedAt: string
    Email: string
    Id: number
    MessageList: Array<FriendMessageListitem>
    UnreadMessage:number
    NikeName: string
    UpdatedAt: string
    UserName: string
}

// 用户消息体
export type FriendMessageListitem = {
    ID?:number
    UserID: number
    UserName: string
    UserAvatar: string
    ReceiveUserID: number
    ReceiveUserName: string
    ReceiveUserAvatar: string
    Msg: string
    MsgType: number
    MsgStatus?:boolean
    IsReply: boolean
    ReplyMsgID: number
    Context: any
    CreatedAt: Date
}

export type AckMsg = {
    MsgType? :number
    AckStatus:number
    UserId :number
    MsgSort:number
}

export type UserShowData = {
    ID: number
    NikeName: string
    UserName: string
    Email: string
    CreatedAt: string
    Avatar: string
    Age: number,
    City: string,
    Introduce : string,
}

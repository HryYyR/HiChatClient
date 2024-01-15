import { ElMessage } from "element-plus"
import { fileurl } from '../main'
import { Friend, FriendMessageListitem, Userdata } from "@renderer/models/models"

export function nowtime() {
    let time = new Date()
    let year = time.getFullYear()
    let month: any = time.getMonth()
    let day: any = time.getDate()
    let hour: any = time.getHours()
    let minute: any = time.getMinutes()
    let second: any = time.getSeconds()
    if (month <= 9) {
        month = "0" + month
    }
    if (hour <= 9) {
        hour = "0" + hour
    }
    if (minute <= 9) {
        minute = "0" + minute
    }
    if (second <= 9) {
        second = "0" + second
    }
    let text = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
    return text
}

export function tip(type: any, message: string) {
    ElMessage({
        "type": type,
        "message": message
    })
}

export function SendGroupResourceMsg(
    msg: string,
    MsgType: number,
    userdata: Userdata,
    groupid: number,
): string {
    let aage = JSON.stringify(userdata.Age)
    let data = {
        UserID: userdata.ID,
        UserName: userdata.UserName,
        UserAvatar: userdata.Avatar == "" ? `http://${fileurl}/static/icon.png` : userdata.Avatar,
        UserCity: userdata.City,
        UserAge: aage,
        GroupID: groupid,
        Msg: msg,
        MsgType: MsgType,
        IsReply: false,
        ReplyUserID: 0,
        Context: [],
        CreatedAt: new Date()
    }
    let strdata = JSON.stringify(data)
    return strdata
}

export function SendFriendResourceMsg(
    msg: string,
    MsgType: number,
    userdata: Userdata,
    currentfrienddata: Friend
): string {
    let data: FriendMessageListitem = {
        UserID: userdata.ID,
        UserName: userdata.UserName,
        UserAvatar: userdata.Avatar,
        ReceiveUserID: currentfrienddata.Id,
        ReceiveUserName: currentfrienddata.UserName,
        ReceiveUserAvatar: currentfrienddata.Avatar,
        Msg: msg,
        MsgType: MsgType,
        IsReply: false,
        ReplyUserID: 0,
        Context: [],
        CreatedAt: new Date()
    }
    let strdata = JSON.stringify(data)
    return strdata
}

export type MatchingItem = {
    originnumber?: string,
    avatar:string,
    name: string,
    number: string,
    type:1|2
}

export function RegSearch(str: string, arr: Array<MatchingItem>): Array<MatchingItem> {
    const regexPattern = new RegExp(str, 'i')
    let matchingGroups: Array<MatchingItem> = []
    if (str.trim() === '') {
        return matchingGroups
    }
    arr.forEach(item => {
        let replacename = item.name.replace(regexPattern, match => `<span style="color: rgb(122, 134, 229);">${match}</span>`);
        let replacenumber = item.number.toString().replace(regexPattern, match => `<span style="color: rgb(122, 134, 229);">${match}</span>`);
        if (item.name != replacename || item.number != replacenumber) {
            matchingGroups.push({ originnumber:item.number,avatar:item.avatar,name: replacename, number: replacenumber,type:item.type })
        }
    });
    return matchingGroups
}
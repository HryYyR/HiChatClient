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

// 时间格式化 2023-10-17T12:22:48+08:00 -> 2023-10-18 22:28:47
export function convertISOToFormattedString(isoString) {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，所以要加1  
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function tip(type: 'error' | 'success' | 'warning' | 'info', message: string) {
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
        ReplyMsgID: 0,
        Context: [],
        CreatedAt: new Date()
    }
    return JSON.stringify(data)
}

export type MatchingItem = {
    originnumber?: string,
    avatar: string,
    name: string,
    number: string,
    type: 1 | 2
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
            matchingGroups.push({ originnumber: item.number, avatar: item.avatar, name: replacename, number: replacenumber, type: item.type })
        }
    });
    return matchingGroups
}

// 生成AES密钥
export async function generateAndStoreKey() {
    const aesKey = await window.crypto.subtle.generateKey(
        {
            name: "AES-CBC",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
    return aesKey
}

// 加密aes
export async function encryptAes(aeskey: CryptoKey, msgstr: string) {
    let iv = crypto.getRandomValues(new Uint8Array(16));
    let algorithm: AesCbcParams = { name: "AES-CBC", iv: iv };
    let encodedText = new TextEncoder().encode(msgstr);
    let encryptedData = await window.crypto.subtle.encrypt(algorithm, aeskey, encodedText)
    let msg = {
        iv: btoa(String.fromCharCode.apply(null, Array.from(iv))),
        message: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encryptedData))))
    }
    return JSON.stringify(msg)
}

// 解密aes
export async function decryptAes(aeskey: CryptoKey, encryptedData: string, Iv: string) {
    const iv = Uint8Array.from(atob(Iv), c => c.charCodeAt(0));
    const ciphertext = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    try {
        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: iv
            },
            aeskey,
            ciphertext
        );
        const decryptedText = new TextDecoder().decode(decryptedData);
        return decryptedText
    } catch (err) {
        return ""
    }
}

export function arrayToBase64(array) {
    const uint8Array = new Uint8Array(array);
    let binary = '';
    uint8Array.forEach(byte => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary);
}

export function base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var length = binaryString.length;
    var bytes = new Uint8Array(length);

    for (var i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
}

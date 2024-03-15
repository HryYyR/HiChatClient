const { ipcRenderer } = require('electron');

const startScreenSharingButton = document.getElementById('startScreenSharing');
startScreenSharingButton?.addEventListener('click', () => {
    ipcRenderer.send('start-screen-sharing');
});

ipcRenderer.on('screen-sharing-stream', async (_event, stream) => {

    const urlParams = new URLSearchParams(window.location.search);
    const userid = urlParams.get('id');


    const remoteVideo = document.querySelector('#remoteVideo');
    const remoteAudio = document.querySelector('#remoteAudio');
    let localvideo = document.querySelector("#localvideo")


    const ws = new WebSocket('ws://localhost:3009/ws?id=' + userid);
    ws.binaryType = "arraybuffer";


    const PeerConnection = window.RTCPeerConnection
    var peerConnect = new PeerConnection()

    playVideo(stream)

    // 创建本地peer并把peer发给服务器
    async function playVideo(stream) {
        localvideo.srcObject = stream

        stream.getTracks().forEach((track) => {
            peerConnect.addTrack(track, stream)
        })

        createOffer() //创建offer并发送
    }

    const createOffer = async () => {
        const offer = await peerConnect.createOffer();
        await peerConnect.setLocalDescription(offer);

        let dat = {
            type: "offer",
            userid: userid,
            sdp: JSON.stringify(offer)
        }
        ws.send(JSON.stringify(dat))
    }

    peerConnect.onicecandidate = (candidateInfo) => {
        console.log("发送ICE-candidate");
        console.log(candidateInfo.candidate);
        if (candidateInfo.candidate) {
            let dat = {
                type: "ICE-candidate",
                userid: userid,
                sdp: JSON.stringify(candidateInfo.candidate)

            }
            ws.send(JSON.stringify(dat))
        }
    }

    // 接收数据
    ws.onmessage = async (event) => {
        let str = arrayBufferToString(event.data)
        let jsonstr = JSON.parse(str)

        let offer = JSON.parse(jsonstr.sdp)
        console.log(jsonstr.type);
        // console.log(jsonstr);

        if (jsonstr.type === "offer") {
            const offerSdp = new RTCSessionDescription(offer);
            await peerConnect.setRemoteDescription(offerSdp);
            const answer = await peerConnect.createAnswer();
            await peerConnect.setLocalDescription(answer);
            let dat = {
                type: "answer",
                userid: userid,
                sdp: JSON.stringify(answer)
            }
            ws.send(JSON.stringify(dat))
            // console.log(answer);
        }

        if (jsonstr.type === "answer") {
            await peerConnect.setRemoteDescription(offer)
        }
        if (jsonstr.type == "ICE-candidate") {
            console.log("收到ICE-candidate");
            console.log(offer);
            await peerConnect.addIceCandidate(offer)
        }
    }

    peerConnect.ontrack = (track) => {
        console.log("连接成功!");
        console.log(track);
        if (track.track.kind == 'video') {
            console.log('设置播放源视频');
            remoteVideo.srcObject = track.streams[0];
        }
        if (track.track.kind == 'audio') {
            remoteAudio.srcObject = track.streams[0];
        }
    }


});


function arrayBufferToString(buffer) {
    const uint8Array = new Uint8Array(buffer);
    let result = '';
    for (let i = 0; i < uint8Array.length; i++) {
        result += String.fromCharCode(uint8Array[i]);
    }
    return result;
}

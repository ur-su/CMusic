// pages/video/video.js

import request from "../../utils/request"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], // 导航标签数据
    navId: "", // 导航的标识
    videoList: [], //视频列表数据
    videoId: '', // 视频id标识
    videoUpdateTime: [], //记录video播放的时长
    isTriggered: false //标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getVideoGroupListData();
  },

  // 获取导航数据
  async getVideoGroupListData() {
    let videoGroupListData = await request('/video/group/list');
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id
    });
    // 获取视频列表数据
    // getVideoGroupListData这个函数是异步函数 加载完才能取到navId 所以getVideoList函数也放在这个函数内执行
    this.getVideoList(this.data.navId);
  },

  // 获取视频列表数数据
  async getVideoList(navId) {
    let videoListData = await request('/video/group', { id: navId });

    // 关闭消息提示框
    wx.hideLoading();

    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item;
    })
    this.setData({
      videoList,
      // 关闭下拉刷新
      isTriggered: false
    })
  },

  // 点击切换导航的回调
  changeNav(event) {
    let navId = event.currentTarget.id; // 通过id向event传参时如果传的时number会自动转换成string
    this.setData({
        navId: navId * 1, //转换为String类型
        videoList: []
      })
      // 显示正在加载
    wx.showLoading({
      title: "正在加载"
    })

    //动态获取当前导航对应的视频数据
    this.getVideoList(this.data.navId);
  },

  //点击播放/继续播放的回调
  handlePlay(event) {
    /*
      问题:多个视频同时播放的问题

      需求：
      1.再点击播放事件中需要找到上一个播放的视频
      2.在播放新视频之前关闭上一个正在播放的视频
      关键:
      1.如何找到上一个视频的实例对象
      2.如何确认点击播放的视频和正在播放的视频不是同一个视频
      单例模式:
      1.需要创建多个对象的场景下,通过一个变量接收,始终保持只有一个对象,
      2.节省内存空间
    */
    // 创建控制video标签的实例对象
    let vid = event.currentTarget.id;
    // 关闭的是上一个视频,先判断有没有这个实例要是没有就跳过这行
    // this.vid !== vid && this.videoContext && this.videoContext.stop();
    // this.vid = vid

    //更新data中videoId的状态数据
    this.setData({
        videoId: vid
      })
      // 将vid保存到全局
    this.videoContext = wx.createVideoContext(vid);
    // 判断当前的视频之前是否播放过,是否有播放记录,如果有,就跳转至指定的位置
    let { videoUpdateTime } = this.data
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime);
    }
    // this.videoContext.play() //这个右bug 在video中设置autoplay也可以

  },

  // 监听视频播放进度的回调函数
  handleTimeUpdate(event) {
    // console.log(event.detail.currentTime);
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime
    };
    let { videoUpdateTime } = this.data;
    /*
      思路:判断记录播放时长的videoUpdateTime数组中是否右当前视频的播放记录
        1.如果有,在原有的播放记录中修改播放时间为当前播放时间
        2.如果没有,需要在数组中添加当前视频的播放对象
    */

    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    if (videoItem) { // 之前有
      videoItem.currentTime = event.detail.currentTime;
    } else { // 之前有
      videoUpdateTime.push(videoTimeObj);
    }

    // 更新videoUpdateTime的状态
    this.setData({
      videoUpdateTime
    })
  },

  // 视频播放结束调用
  handleEnded(event) {
    console.log(event);
    // 移除播放记录时长数组中当前视频的对象
    let { videoUpdateTime } = this.data;
    // 用filter也可以实现
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id), 1);
    this.setData({
      videoUpdateTime
    })

  },

  // 自定义下拉刷新的回调: scroll-view
  handleRefresher() {
    console.log("可以下拉刷新");
    // 再次发请求,获取最新的视频列表数据
    this.getVideoList(this.data.navId)
  },

  // 自定义上拉触底的回调
  handleToLower() {
    console.log("上拉触底");
    // 数据分页:1.后端分页 2.前端分页
    console.log("发送请求||在前端截取最新的数据 追加到视频列表的后方");
    console.log("网易云暂时没有提供分页的api");
    // 模拟数据
    let newVideoList = [{
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_8FC5C2C67BCA21CF23E0CD8BA27D376A",
          "coverUrl": "https://p2.music.126.net/BgzcWtnGh-8I0Jv5UFtskA==/109951164079644302.jpg",
          "height": 1080,
          "width": 1920,
          "title": "翻唱-Black Bird（ぼくのりりっくのぼうよみ）",
          "description": "翻唱-Black Bird（ぼくのりりっくのぼうよみ）",
          "commentCount": 101,
          "shareCount": 110,
          "resolutions": [{
              "resolution": 240,
              "size": 4283387
            },
            {
              "resolution": 480,
              "size": 4538379
            },
            {
              "resolution": 720,
              "size": 5077170
            },
            {
              "resolution": 1080,
              "size": 5476714
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 310000,
            "authStatus": 1,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/foHp6vPEHN1QpYb5Wba5LQ==/109951163839335844.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 310101,
            "birthday": 1431705600000,
            "userId": 41567347,
            "userType": 4,
            "nickname": "秋风MusiX",
            "signature": "多么幸运，和你生活在同一个时代，可以一起分享世间美好。",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163839335840,
            "backgroundImgId": 109951165967947680,
            "backgroundUrl": "http://p1.music.126.net/U6YzCUxw-caxaxByXzKBgQ==/109951165967947683.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐原创视频达人"
            },
            "djStatus": 10,
            "vipType": 11,
            "remarkName": null,
            "avatarImgIdStr": "109951163839335844",
            "backgroundImgIdStr": "109951165967947683"
          },
          "urlInfo": {
            "id": "8FC5C2C67BCA21CF23E0CD8BA27D376A",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/FgEsTep1_2503565935_uhd.mp4?ts=1632838844&rid=FDD191A554DA8A21001035D7EF573DD5&rl=3&rs=XecXwUkiEBwZxclchUeEjYeewGIYlMsX&sign=b217708b9e1f347227502234efb90aca&ext=vfP1pTh7Sp6zYEA1zMd2Uwy1SHfA5CmV%2FhgKx8isFbgDkgHtesiujMGCKgS0sUJI7r3th0dPJNRo26srItx0yNoOLgGrEmgQdleE5x5i8oBk%2FCk5tidFfFvwqnebm%2Bhn9vuS7X0V5VaixJ11l0oSYPYCJT1zEKyo8Odh2JyPQ0H1t4Ae9xPRe5D6pH8rJp1hHqb5zhqLFEFVUsfwEXcWScjADyLXmq3qGXMYJkf1T2ecWVcOkzYBf%2BLY8XhWdLCu",
            "size": 5476714,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [{
              "id": 60100,
              "name": "翻唱",
              "alg": null
            },
            {
              "id": 58106,
              "name": "日语翻唱",
              "alg": null
            },
            {
              "id": 59110,
              "name": "国内音乐人",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [{
            "name": "Black Bird",
            "id": 39449871,
            "pst": 0,
            "t": 0,
            "ar": [{
              "id": 1193435,
              "name": "ぼくのりりっくのぼうよみ",
              "tns": [],
              "alias": []
            }],
            "alia": [],
            "pop": 100,
            "st": 0,
            "rt": null,
            "fee": 1,
            "v": 12,
            "crbt": null,
            "cf": "",
            "al": {
              "id": 3426973,
              "name": "hollow world",
              "picUrl": "http://p4.music.126.net/JyvJkuDHxjgjrNWUW_hsxQ==/109951164515354548.jpg",
              "tns": [],
              "pic_str": "109951164515354548",
              "pic": 109951164515354540
            },
            "dt": 224973,
            "h": {
              "br": 320000,
              "fid": 0,
              "size": 9001840,
              "vd": -59967
            },
            "m": {
              "br": 192000,
              "fid": 0,
              "size": 5401121,
              "vd": -57369
            },
            "l": {
              "br": 128000,
              "fid": 0,
              "size": 3600762,
              "vd": -55711
            },
            "a": null,
            "cd": "1",
            "no": 1,
            "rtUrl": null,
            "ftype": 0,
            "rtUrls": [],
            "djId": 0,
            "copyright": 2,
            "s_id": 0,
            "mst": 9,
            "cp": 1415976,
            "mv": 0,
            "rtype": 0,
            "rurl": null,
            "publishTime": 1450425187823,
            "privilege": {
              "id": 39449871,
              "fee": 1,
              "payed": 0,
              "st": 0,
              "pl": 0,
              "dl": 0,
              "sp": 0,
              "cp": 0,
              "subp": 0,
              "cs": false,
              "maxbr": 999000,
              "fl": 0,
              "toast": false,
              "flag": 260,
              "preSell": false
            }
          }],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "8FC5C2C67BCA21CF23E0CD8BA27D376A",
          "durationms": 215420,
          "playTime": 224887,
          "praisedCount": 1612,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_0F417CF2E9D83D59DBF3C118889390C4",
          "coverUrl": "https://p2.music.126.net/MLruHGiiJR9rHFi1O_HQyw==/109951163597746027.jpg",
          "height": 720,
          "width": 1280,
          "title": "夜空中最亮的星……",
          "description": null,
          "commentCount": 234,
          "shareCount": 381,
          "resolutions": [{
              "resolution": 240,
              "size": 4604876
            },
            {
              "resolution": 480,
              "size": 6367785
            },
            {
              "resolution": 720,
              "size": 10202951
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 440000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/PzoFVzIZZhzYWcQXlR4Cww==/109951163562364350.jpg",
            "accountStatus": 0,
            "gender": 2,
            "city": 440300,
            "birthday": 948902400000,
            "userId": 1606270167,
            "userType": 0,
            "nickname": "俢垳蕗仩",
            "signature": "",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163562364350,
            "backgroundImgId": 109951163618101440,
            "backgroundUrl": "http://p1.music.126.net/EqBrxxBUie5A3IsnpCcPKQ==/109951163618101446.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951163562364350",
            "backgroundImgIdStr": "109951163618101446"
          },
          "urlInfo": {
            "id": "0F417CF2E9D83D59DBF3C118889390C4",
            "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/If7f0Z4w_2038393481_shd.mp4?ts=1632838844&rid=FDD191A554DA8A21001035D7EF573DD5&rl=3&rs=XAuwVzDfDgAKUDhUMEsciPUAzhTzGXky&sign=703176cea808014c55074f2dd9e3bdb6&ext=vfP1pTh7Sp6zYEA1zMd2Uwy1SHfA5CmV%2FhgKx8isFbgDkgHtesiujMGCKgS0sUJI7r3th0dPJNRo26srItx0yNoOLgGrEmgQdleE5x5i8oBk%2FCk5tidFfFvwqnebm%2Bhn9vuS7X0V5VaixJ11l0oSYPYCJT1zEKyo8Odh2JyPQ0H1t4Ae9xPRe5D6pH8rJp1hHqb5zhqLFEFVUsfwEXcWScjADyLXmq3qGXMYJkf1T2ecWVcOkzYBf%2BLY8XhWdLCu",
            "size": 10202951,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [{
              "id": 60100,
              "name": "翻唱",
              "alg": null
            },
            {
              "id": 57111,
              "name": "中文翻唱",
              "alg": null
            },
            {
              "id": 59111,
              "name": "素人草根",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": [
            109
          ],
          "relateSong": [{
            "name": "夜空中最亮的星",
            "id": 25706282,
            "pst": 0,
            "t": 0,
            "ar": [{
              "id": 12977,
              "name": "逃跑计划",
              "tns": [],
              "alias": []
            }],
            "alia": [],
            "pop": 100,
            "st": 0,
            "rt": "600902000009535440",
            "fee": 8,
            "v": 125,
            "crbt": null,
            "cf": "",
            "al": {
              "id": 2285010,
              "name": "世界",
              "picUrl": "http://p3.music.126.net/Eef2K2KV9dT3XUA6_Ve-Rw==/109951165543196748.jpg",
              "tns": [],
              "pic_str": "109951165543196748",
              "pic": 109951165543196750
            },
            "dt": 252000,
            "h": {
              "br": 320000,
              "fid": 0,
              "size": 10091667,
              "vd": -3700
            },
            "m": {
              "br": 192000,
              "fid": 0,
              "size": 6055017,
              "vd": -1200
            },
            "l": {
              "br": 128000,
              "fid": 0,
              "size": 4036692,
              "vd": -2
            },
            "a": null,
            "cd": "1",
            "no": 7,
            "rtUrl": null,
            "ftype": 0,
            "rtUrls": [],
            "djId": 0,
            "copyright": 1,
            "s_id": 0,
            "mst": 9,
            "cp": 22036,
            "mv": 382555,
            "rtype": 0,
            "rurl": null,
            "publishTime": 1325347200007,
            "privilege": {
              "id": 25706282,
              "fee": 8,
              "payed": 0,
              "st": 0,
              "pl": 128000,
              "dl": 0,
              "sp": 7,
              "cp": 1,
              "subp": 1,
              "cs": false,
              "maxbr": 999000,
              "fl": 128000,
              "toast": false,
              "flag": 260,
              "preSell": false
            }
          }],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "0F417CF2E9D83D59DBF3C118889390C4",
          "durationms": 35000,
          "playTime": 962282,
          "praisedCount": 3161,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_62A1C3F213A5C1D890589B42D9B6F7C1",
          "coverUrl": "https://p2.music.126.net/jYl6rSHu-VJ64A9Jci_x0g==/109951164768864030.jpg",
          "height": 720,
          "width": 1280,
          "title": "情人(cover Beyond)",
          "description": null,
          "commentCount": 13,
          "shareCount": 7,
          "resolutions": [{
              "resolution": 240,
              "size": 21746543
            },
            {
              "resolution": 480,
              "size": 39921756
            },
            {
              "resolution": 720,
              "size": 69527760
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 130000,
            "authStatus": 1,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/17zR0vPIBzUNofkB8H7NNQ==/109951166447974353.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 130100,
            "birthday": 995644800000,
            "userId": 591826543,
            "userType": 204,
            "nickname": "耿小华officia",
            "signature": "2014河北省小金钟小提琴金奖。\n2016中国青少年艺术节五项全国金奖(小提琴、钢琴、木吉他、电吉他、通俗唱法)\n2017河北省吉他大赛指弹吉他公开组、弹唱公开组两项金奖。\n2017爱乐国际音乐大赛小提琴两金一银(少年b组金奖、帕格尼尼随想曲组金奖、炫技曲组银奖)。\n2018年获得世界约30个吉他品牌厂家、吉他制作大师的名琴支持、赠送。\nB站名：耿小华official\nID: 448685681\nJO厨",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951166447974350,
            "backgroundImgId": 109951166109748600,
            "backgroundUrl": "http://p1.music.126.net/mi0HZqVn9-kKnyUezlJe6w==/109951166109748613.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 10,
            "vipType": 11,
            "remarkName": null,
            "avatarImgIdStr": "109951166447974353",
            "backgroundImgIdStr": "109951166109748613"
          },
          "urlInfo": {
            "id": "62A1C3F213A5C1D890589B42D9B6F7C1",
            "url": "http://vodkgeyttp9.vod.126.net/cloudmusic/ysYNJiWR_2925666389_shd.mp4?ts=1632838844&rid=FDD191A554DA8A21001035D7EF573DD5&rl=3&rs=tZrcxXWYVbiWlDHiRUosVZAthtpYgKUX&sign=2e5f3973b028f7ca14acc0e1527c1056&ext=vfP1pTh7Sp6zYEA1zMd2Uwy1SHfA5CmV%2FhgKx8isFbgDkgHtesiujMGCKgS0sUJI7r3th0dPJNRo26srItx0yNoOLgGrEmgQdleE5x5i8oBk%2FCk5tidFfFvwqnebm%2Bhn9vuS7X0V5VaixJ11l0oSYPYCJT1zEKyo8Odh2JyPQ0H1t4Ae9xPRe5D6pH8rJp1hHqb5zhqLFEFVUsfwEXcWScjADyLXmq3qGXMYJkf1T2ecWVcOkzYBf%2BLY8XhWdLCu",
            "size": 69527760,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [{
              "id": 60100,
              "name": "翻唱",
              "alg": null
            },
            {
              "id": 57111,
              "name": "中文翻唱",
              "alg": null
            },
            {
              "id": 4105,
              "name": "摇滚",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 72114,
              "name": "Beyond",
              "alg": null
            },
            {
              "id": 24134,
              "name": "弹唱",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [{
            "name": "情人",
            "id": 347241,
            "pst": 0,
            "t": 0,
            "ar": [{
              "id": 11127,
              "name": "Beyond",
              "tns": [],
              "alias": []
            }],
            "alia": [],
            "pop": 100,
            "st": 0,
            "rt": "600902000005377218",
            "fee": 8,
            "v": 35,
            "crbt": null,
            "cf": "",
            "al": {
              "id": 34209,
              "name": "海阔天空",
              "picUrl": "http://p3.music.126.net/8y8KJC1eCSO_vUKf2MyZwA==/109951165796899183.jpg",
              "tns": [],
              "pic_str": "109951165796899183",
              "pic": 109951165796899180
            },
            "dt": 318000,
            "h": {
              "br": 320000,
              "fid": 0,
              "size": 12732124,
              "vd": -2
            },
            "m": {
              "br": 192000,
              "fid": 0,
              "size": 7639292,
              "vd": 358
            },
            "l": {
              "br": 128000,
              "fid": 0,
              "size": 5092875,
              "vd": 609
            },
            "a": null,
            "cd": "1",
            "no": 7,
            "rtUrl": null,
            "ftype": 0,
            "rtUrls": [],
            "djId": 0,
            "copyright": 1,
            "s_id": 0,
            "mst": 9,
            "cp": 684010,
            "mv": 5336910,
            "rtype": 0,
            "rurl": null,
            "publishTime": 746812800000,
            "pc": {
              "nickname": "",
              "alb": "海阔天空",
              "cid": "",
              "fn": "情人.mp3",
              "ar": "Beyond",
              "sn": "情人",
              "uid": 289733924,
              "version": 1,
              "br": 64
            },
            "tns": [
              "The Lover"
            ],
            "privilege": {
              "id": 347241,
              "fee": 8,
              "payed": 0,
              "st": 0,
              "pl": 64000,
              "dl": 64000,
              "sp": 7,
              "cp": 1,
              "subp": 1,
              "cs": true,
              "maxbr": 999000,
              "fl": 128000,
              "toast": false,
              "flag": 264,
              "preSell": false
            }
          }],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "62A1C3F213A5C1D890589B42D9B6F7C1",
          "durationms": 294000,
          "playTime": 36503,
          "praisedCount": 165,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_864A75C95FAEAB83206D61BD5B6E1C63",
          "coverUrl": "https://p2.music.126.net/a6lrNRspkx5uQVUJ4xp9lw==/109951163878106592.jpg",
          "height": 1280,
          "width": 720,
          "title": "我发现听着这首歌，早晨起来心情真的美美哒。《美美哒》",
          "description": "我发现听着这首歌，早晨起来心情真的美美哒。《美美哒》",
          "commentCount": 12,
          "shareCount": 182,
          "resolutions": [{
              "resolution": 240,
              "size": 1407169
            },
            {
              "resolution": 480,
              "size": 2345332
            },
            {
              "resolution": 720,
              "size": 3303282
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 440000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/nIMgEkLHLAYxWifs1WoOZw==/109951163766656774.jpg",
            "accountStatus": 0,
            "gender": 0,
            "city": 440800,
            "birthday": 811353600000,
            "userId": 1683466813,
            "userType": 0,
            "nickname": "妗子糯糯",
            "signature": "糯糯",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163766656770,
            "backgroundImgId": 109951162868128400,
            "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951163766656774",
            "backgroundImgIdStr": "109951162868128395"
          },
          "urlInfo": {
            "id": "864A75C95FAEAB83206D61BD5B6E1C63",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/nden7dvy_2197046566_shd.mp4?ts=1632838844&rid=FDD191A554DA8A21001035D7EF573DD5&rl=3&rs=jPzOsNibNYouSwXZafafPHnWkLsTZdFH&sign=feac52674ba1ba17d849032d19a24ae1&ext=vfP1pTh7Sp6zYEA1zMd2Uwy1SHfA5CmV%2FhgKx8isFbgDkgHtesiujMGCKgS0sUJI7r3th0dPJNRo26srItx0yNoOLgGrEmgQdleE5x5i8oBk%2FCk5tidFfFvwqnebm%2Bhn9vuS7X0V5VaixJ11l0oSYPYCJT1zEKyo8Odh2JyPQ0H1t4Ae9xPRe5D6pH8rJp1hHqb5zhqLFEFVUsfwEXcWScjADyLXmq3qGXMYJkf1T2ecWVcOkzYBf%2BLY8XhWdLCu",
            "size": 3303282,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [{
              "id": 60100,
              "name": "翻唱",
              "alg": null
            },
            {
              "id": 57111,
              "name": "中文翻唱",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 16226,
              "name": "美女",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": [
            101
          ],
          "relateSong": [{
            "name": "美美哒",
            "id": 1294910124,
            "pst": 0,
            "t": 0,
            "ar": [{
              "id": 8993,
              "name": "门丽",
              "tns": [],
              "alias": []
            }],
            "alia": [],
            "pop": 100,
            "st": 0,
            "rt": null,
            "fee": 8,
            "v": 11,
            "crbt": null,
            "cf": "",
            "al": {
              "id": 71852902,
              "name": "美美哒",
              "picUrl": "http://p3.music.126.net/uxHT3GXbrWcnTdj92L-pww==/109951166198527424.jpg",
              "tns": [],
              "pic_str": "109951166198527424",
              "pic": 109951166198527420
            },
            "dt": 218537,
            "h": {
              "br": 320000,
              "fid": 0,
              "size": 8743750,
              "vd": -70802
            },
            "m": {
              "br": 192000,
              "fid": 0,
              "size": 5246267,
              "vd": -68296
            },
            "l": null,
            "a": null,
            "cd": "01",
            "no": 1,
            "rtUrl": null,
            "ftype": 0,
            "rtUrls": [],
            "djId": 0,
            "copyright": 0,
            "s_id": 0,
            "mst": 9,
            "cp": 1416618,
            "mv": 0,
            "rtype": 0,
            "rurl": null,
            "publishTime": 1532016000007,
            "privilege": {
              "id": 1294910124,
              "fee": 8,
              "payed": 0,
              "st": 0,
              "pl": 128000,
              "dl": 0,
              "sp": 7,
              "cp": 1,
              "subp": 1,
              "cs": false,
              "maxbr": 999000,
              "fl": 128000,
              "toast": false,
              "flag": 260,
              "preSell": false
            }
          }],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "864A75C95FAEAB83206D61BD5B6E1C63",
          "durationms": 11471,
          "playTime": 195335,
          "praisedCount": 517,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_2B24ABC6DE62DDAC1E65102BAB607650",
          "coverUrl": "https://p2.music.126.net/j-j2anZxzs8xFhyWoCw9yQ==/109951163572706631.jpg",
          "height": 720,
          "width": 1280,
          "title": "腾格尔 - 隐形的翅膀 - 2017不凡的改变第二期现场",
          "description": "腾格尔魔性演绎《隐形的翅膀》 2017不凡的改变一起来抖腿吧，第二期现场",
          "commentCount": 745,
          "shareCount": 3696,
          "resolutions": [{
              "resolution": 240,
              "size": 18804953
            },
            {
              "resolution": 480,
              "size": 24624252
            },
            {
              "resolution": 720,
              "size": 42912631
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 440000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/m5c9KZxBZqDieEnm89iDag==/18967675091076878.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 440300,
            "birthday": 969897600000,
            "userId": 528351741,
            "userType": 0,
            "nickname": "魔力音乐小镇",
            "signature": "全力打造最美音乐小镇",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 18967675091076880,
            "backgroundImgId": 109951162975516590,
            "backgroundUrl": "http://p1.music.126.net/-iKIBnr6jIWVq8H1v_tNhQ==/109951162975516588.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "18967675091076878",
            "backgroundImgIdStr": "109951162975516588"
          },
          "urlInfo": {
            "id": "2B24ABC6DE62DDAC1E65102BAB607650",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/tfv0gGLU_40570734_shd.mp4?ts=1632838844&rid=FDD191A554DA8A21001035D7EF573DD5&rl=3&rs=bbJQrAnDzzBpPECDVLKkvNzXhAcAdrju&sign=1295d36da92fd22be92391750beea31a&ext=vfP1pTh7Sp6zYEA1zMd2Uwy1SHfA5CmV%2FhgKx8isFbgDkgHtesiujMGCKgS0sUJI7r3th0dPJNRo26srItx0yNoOLgGrEmgQdleE5x5i8oBk%2FCk5tidFfFvwqnebm%2Bhn9vuS7X0V5VaixJ11l0oSYPYCJT1zEKyo8Odh2JyPQ0H1t4Ae9xPRe5D6pH8rJp1hHqb5zhqLFEFVUsfwEXcWScjADyLXmq3qGXMYJkf1T2ecWVcOkzYBf%2BLY8XhWdLCu",
            "size": 42912631,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [{
              "id": 60100,
              "name": "翻唱",
              "alg": null
            },
            {
              "id": 59110,
              "name": "国内音乐人",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 15106,
              "name": "张韶涵",
              "alg": null
            },
            {
              "id": 13222,
              "name": "华语",
              "alg": null
            },
            {
              "id": 13164,
              "name": "快乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "2B24ABC6DE62DDAC1E65102BAB607650",
          "durationms": 117716,
          "playTime": 1292421,
          "praisedCount": 5643,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_8ACF36B30C129A508DA029702A23000A",
          "coverUrl": "https://p2.music.126.net/9RGc1LRfWfE9_yjJa_Si3w==/109951163908914771.jpg",
          "height": 1080,
          "width": 1920,
          "title": "《知否知否应是绿肥红瘦》女声和声版（mv录音棚混剪）",
          "description": "这首歌拖到现在终于录完啦～～虽然有点晚，但发了也不迟～一个人的版本先～",
          "commentCount": 162,
          "shareCount": 530,
          "resolutions": [{
              "resolution": 240,
              "size": 19623671
            },
            {
              "resolution": 480,
              "size": 32796151
            },
            {
              "resolution": 720,
              "size": 50489499
            },
            {
              "resolution": 1080,
              "size": 101101356
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 310000,
            "authStatus": 1,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/uV6AOdp9MOnrU9q6U3R9lA==/2946691184922941.jpg",
            "accountStatus": 0,
            "gender": 2,
            "city": 310101,
            "birthday": 732643200000,
            "userId": 295439729,
            "userType": 4,
            "nickname": "丁译林",
            "signature": "网易音乐人:丁译林，b站:丁译林，上海财经大学校园十大歌手冠军 Echo 合唱团女高音",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 2946691184922941,
            "backgroundImgId": 109951163208890180,
            "backgroundUrl": "http://p1.music.126.net/VKajepQqipL6vLnwYkY9uA==/109951163208890177.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "音乐原创视频达人"
            },
            "djStatus": 10,
            "vipType": 11,
            "remarkName": null,
            "avatarImgIdStr": "2946691184922941",
            "backgroundImgIdStr": "109951163208890177"
          },
          "urlInfo": {
            "id": "8ACF36B30C129A508DA029702A23000A",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/itLw0hbK_2316289631_uhd.mp4?ts=1632838844&rid=FDD191A554DA8A21001035D7EF573DD5&rl=3&rs=bIbnjvmLUZghWgIvyOhvxePLMqjAwKNn&sign=63d218b4bb02b925e9dbc1e0ef2e4262&ext=vfP1pTh7Sp6zYEA1zMd2Uwy1SHfA5CmV%2FhgKx8isFbgDkgHtesiujMGCKgS0sUJI7r3th0dPJNRo26srItx0yNoOLgGrEmgQdleE5x5i8oBk%2FCk5tidFfFvwqnebm%2Bhn9vuS7X0V5VaixJ11l0oSYPYCJT1zEKyo8Odh2JyPQ0H1t4Ae9xPRe5D6pH8rJp1hHqb5zhqLFEFVUsfwEXcWScjADyLXmq3qGXMYJkf1T2ecWVcOkzYBf%2BLY8XhWdLCu",
            "size": 101101356,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [{
              "id": 60100,
              "name": "翻唱",
              "alg": null
            },
            {
              "id": 57111,
              "name": "中文翻唱",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 4110,
              "name": "古风",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 90101,
              "name": "独家",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": [
            111
          ],
          "relateSong": [],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "8ACF36B30C129A508DA029702A23000A",
          "durationms": 276245,
          "playTime": 883916,
          "praisedCount": 3716,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_ABCDB98B0D82BC7DE2B3965288C8909C",
          "coverUrl": "https://p2.music.126.net/fw0cUxLDN5Tsn5lrwCFVig==/109951164139838733.jpg",
          "height": 1080,
          "width": 1920,
          "title": "没有什么比一首《夏天的风》更治愈的了",
          "description": "没有什么比一首《夏天的风》更治愈的了",
          "commentCount": 88,
          "shareCount": 135,
          "resolutions": [{
              "resolution": 240,
              "size": 7486863
            },
            {
              "resolution": 480,
              "size": 11684411
            },
            {
              "resolution": 720,
              "size": 15349860
            },
            {
              "resolution": 1080,
              "size": 25549059
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 350000,
            "authStatus": 1,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/rvLFUJXG86XXzdl-WcRuZw==/109951163285216770.jpg",
            "accountStatus": 0,
            "gender": 2,
            "city": 350200,
            "birthday": 630691200000,
            "userId": 435890958,
            "userType": 4,
            "nickname": "林小可hank",
            "signature": "美拍 微博 唱吧 ：林小可林小可",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163285216770,
            "backgroundImgId": 109951163285214880,
            "backgroundUrl": "http://p1.music.126.net/s93ap5zykLwdbS2S5Ww4sg==/109951163285214881.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": null,
            "djStatus": 10,
            "vipType": 11,
            "remarkName": null,
            "avatarImgIdStr": "109951163285216770",
            "backgroundImgIdStr": "109951163285214881"
          },
          "urlInfo": {
            "id": "ABCDB98B0D82BC7DE2B3965288C8909C",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/hsK7A7a0_2543406212_uhd.mp4?ts=1632838844&rid=FDD191A554DA8A21001035D7EF573DD5&rl=3&rs=xhoQLUobtyhtifxnpGTWwHMzzlzfIDGo&sign=b1a8df4af94552128d102e96e811f98e&ext=vfP1pTh7Sp6zYEA1zMd2Uwy1SHfA5CmV%2FhgKx8isFbgDkgHtesiujMGCKgS0sUJI7r3th0dPJNRo26srItx0yNoOLgGrEmgQdleE5x5i8oBk%2FCk5tidFfFvwqnebm%2Bhn9vuS7X0V5VaixJ11l0oSYPYCJT1zEKyo8Odh2JyPQ0H1t4Ae9xPRe5D6pH8rJp1hHqb5zhqLFEFVUsfwEXcWScjADyLXmq3qGXMYJkf1T2ecWVcOkzYBf%2BLY8XhWdLCu",
            "size": 25549059,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 1080
          },
          "videoGroup": [{
              "id": 60100,
              "name": "翻唱",
              "alg": null
            },
            {
              "id": 57111,
              "name": "中文翻唱",
              "alg": null
            },
            {
              "id": 59110,
              "name": "国内音乐人",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": [
            110
          ],
          "relateSong": [{
            "name": "夏天的风",
            "id": 298213,
            "pst": 0,
            "t": 0,
            "ar": [{
              "id": 9612,
              "name": "温岚",
              "tns": [],
              "alias": []
            }],
            "alia": [],
            "pop": 100,
            "st": 0,
            "rt": "",
            "fee": 8,
            "v": 49,
            "crbt": null,
            "cf": "",
            "al": {
              "id": 29592,
              "name": "温式效应",
              "picUrl": "http://p4.music.126.net/1EDhWA3a0oIagLtiK41qrw==/109951163239130461.jpg",
              "tns": [],
              "pic_str": "109951163239130461",
              "pic": 109951163239130460
            },
            "dt": 240000,
            "h": {
              "br": 320000,
              "fid": 0,
              "size": 9628777,
              "vd": -31400
            },
            "m": {
              "br": 192000,
              "fid": 0,
              "size": 5777283,
              "vd": -28800
            },
            "l": {
              "br": 128000,
              "fid": 0,
              "size": 3851536,
              "vd": -27400
            },
            "a": null,
            "cd": "1",
            "no": 7,
            "rtUrl": null,
            "ftype": 0,
            "rtUrls": [],
            "djId": 0,
            "copyright": 2,
            "s_id": 0,
            "mst": 9,
            "cp": 1416500,
            "mv": 0,
            "rtype": 0,
            "rurl": null,
            "publishTime": 1088611200000,
            "privilege": {
              "id": 298213,
              "fee": 8,
              "payed": 0,
              "st": 0,
              "pl": 128000,
              "dl": 0,
              "sp": 7,
              "cp": 1,
              "subp": 1,
              "cs": false,
              "maxbr": 999000,
              "fl": 128000,
              "toast": false,
              "flag": 260,
              "preSell": false
            }
          }],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "ABCDB98B0D82BC7DE2B3965288C8909C",
          "durationms": 116544,
          "playTime": 532738,
          "praisedCount": 2365,
          "praised": false,
          "subscribed": false
        }
      },
      {
        "type": 1,
        "displayed": false,
        "alg": "onlineHotGroup",
        "extAlg": null,
        "data": {
          "alg": "onlineHotGroup",
          "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
          "threadId": "R_VI_62_7FF489F92DD96F4865068A3593482130",
          "coverUrl": "https://p2.music.126.net/vDjZx9h5y0_JYCyu7rMcKg==/109951163751560204.jpg",
          "height": 720,
          "width": 1280,
          "title": "不同《光年之外》翻唱，邓紫棋笑出内伤",
          "description": "",
          "commentCount": 485,
          "shareCount": 248,
          "resolutions": [{
              "resolution": 240,
              "size": 23499486
            },
            {
              "resolution": 480,
              "size": 38793937
            },
            {
              "resolution": 720,
              "size": 55502568
            }
          ],
          "creator": {
            "defaultAvatar": false,
            "province": 460000,
            "authStatus": 0,
            "followed": false,
            "avatarUrl": "http://p1.music.126.net/GlRTAOqnqOz1gHrLbDIoCg==/109951163651684084.jpg",
            "accountStatus": 0,
            "gender": 1,
            "city": 460100,
            "birthday": -2209017600000,
            "userId": 1394583734,
            "userType": 204,
            "nickname": "影音胡同",
            "signature": "聆听更多好的音乐，观看更多好看的视频竟在这里",
            "description": "",
            "detailDescription": "",
            "avatarImgId": 109951163651684080,
            "backgroundImgId": 109951162868126480,
            "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
            "authority": 0,
            "mutual": false,
            "expertTags": null,
            "experts": {
              "1": "视频达人(华语、音乐现场)",
              "2": "音乐图文达人"
            },
            "djStatus": 0,
            "vipType": 0,
            "remarkName": null,
            "avatarImgIdStr": "109951163651684084",
            "backgroundImgIdStr": "109951162868126486"
          },
          "urlInfo": {
            "id": "7FF489F92DD96F4865068A3593482130",
            "url": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/5sjWN7xt_2211504340_shd.mp4?ts=1632838844&rid=FDD191A554DA8A21001035D7EF573DD5&rl=3&rs=JorfwwCCQblZiJOhswaZLBPvnJCwqDkw&sign=954f50f2f4a8e24d9461040b28394758&ext=vfP1pTh7Sp6zYEA1zMd2Uwy1SHfA5CmV%2FhgKx8isFbgDkgHtesiujMGCKgS0sUJI7r3th0dPJNRo26srItx0yNoOLgGrEmgQdleE5x5i8oBk%2FCk5tidFfFvwqnebm%2Bhn9vuS7X0V5VaixJ11l0oSYPYCJT1zEKyo8Odh2JyPQ0H1t4Ae9xPRe5D6pH8rJp1hHqb5zhqLFEFVUsfwEXcWScjADyLXmq3qGXMYJkf1T2ecWVcOkzYBf%2BLY8XhWdLCu",
            "size": 55502568,
            "validityTime": 1200,
            "needPay": false,
            "payInfo": null,
            "r": 720
          },
          "videoGroup": [{
              "id": 60100,
              "name": "翻唱",
              "alg": null
            },
            {
              "id": 57111,
              "name": "中文翻唱",
              "alg": null
            },
            {
              "id": 58109,
              "name": "国外达人",
              "alg": null
            },
            {
              "id": 12100,
              "name": "流行",
              "alg": null
            },
            {
              "id": 5100,
              "name": "音乐",
              "alg": null
            },
            {
              "id": 150122,
              "name": "邓紫棋",
              "alg": null
            },
            {
              "id": 16233,
              "name": "G.E.M.邓紫棋",
              "alg": null
            }
          ],
          "previewUrl": null,
          "previewDurationms": 0,
          "hasRelatedGameAd": false,
          "markTypes": null,
          "relateSong": [{
            "name": "光年之外",
            "id": 449818741,
            "pst": 0,
            "t": 0,
            "ar": [{
              "id": 7763,
              "name": "G.E.M.邓紫棋",
              "tns": [],
              "alias": []
            }],
            "alia": [
              "电影《太空旅客》中文主题曲"
            ],
            "pop": 100,
            "st": 0,
            "rt": null,
            "fee": 8,
            "v": 96,
            "crbt": null,
            "cf": "",
            "al": {
              "id": 35093341,
              "name": "光年之外",
              "picUrl": "http://p4.music.126.net/fkqFqMaEt0CzxYS-0NpCog==/18587244069235039.jpg",
              "tns": [],
              "pic_str": "18587244069235039",
              "pic": 18587244069235040
            },
            "dt": 235505,
            "h": {
              "br": 320000,
              "fid": 0,
              "size": 9422933,
              "vd": -14400
            },
            "m": {
              "br": 192000,
              "fid": 0,
              "size": 5653777,
              "vd": -11900
            },
            "l": {
              "br": 128000,
              "fid": 0,
              "size": 3769199,
              "vd": -10100
            },
            "a": null,
            "cd": "1",
            "no": 0,
            "rtUrl": null,
            "ftype": 0,
            "rtUrls": [],
            "djId": 0,
            "copyright": 2,
            "s_id": 0,
            "mst": 9,
            "cp": 1415926,
            "mv": 5404646,
            "rtype": 0,
            "rurl": null,
            "publishTime": 1483027200007,
            "privilege": {
              "id": 449818741,
              "fee": 8,
              "payed": 0,
              "st": 0,
              "pl": 128000,
              "dl": 0,
              "sp": 7,
              "cp": 1,
              "subp": 1,
              "cs": false,
              "maxbr": 999000,
              "fl": 128000,
              "toast": false,
              "flag": 4,
              "preSell": false
            }
          }],
          "relatedInfo": null,
          "videoUserLiveInfo": null,
          "vid": "7FF489F92DD96F4865068A3593482130",
          "durationms": 252355,
          "playTime": 1128846,
          "praisedCount": 4412,
          "praised": false,
          "subscribed": false
        }
      }
    ];
    let videoList = this.data.videoList;
    // 拆包,将视频最新的数据更新原有视频列表数据中
    videoList.push(...newVideoList);
    this.setData({
      videoList
    })

  },


  // 跳转至搜索界面
  toSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 页面的下拉刷新需要在video.json中设置"enablePullDownRefresh": true 详情看文档。
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function({ from }) {
    console.log(from);
    if (from === 'button') {
      return {
        title: "来自button的转发内容",
        page: "/pages/video/video",
        ImageUrl: '/static/images/nvsheng.jpg'
      }
    } else {
      return {
        title: "来自menu的转发内容",
        page: "/pages/video/video",
        ImageUrl: '/static/images/nvsheng.jpg'
      }
    }
  }
})
import request from "../../utils/request"
// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //轮播图
    recommendList: [], //推荐歌单列表
    topList: [], //排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    let bannerListData = await request('/banner', { type: 2 }) // 这是个异步任务 有问题请看P21 await后要跟一个Promise所以封装代码的时候就要处理成Promise
    this.setData({
      bannerList: bannerListData.banners
    });

    // 获取歌单数据
    let recommendListData = await request("/personalized", { limit: 10 })
    this.setData({
        recommendList: recommendListData.result
      })
      // console.log(recommendListData.result);

    // 获取排行榜数据
    /*
      需求分析：
        1.需要根据idx的值获取对应的数据
        2.idx的取值范围是0-20，我们需要0-4
        3.需要发送5次请求
    */
    let index = 0;
    let resultArr = [];
    while (index < 5) {
      let topListData = await request("/top/list", { idx: index++ });
      let topListItem = { name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0, 5) };
      resultArr.push(topListItem);
      // 更新toplist的状态值 ,放在里面不需要5次请求全部结束才更新，用户体验较好，但是渲染次数更多
      this.setData({
        topList: resultArr
      })
    }
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})
// pages/search/search.js
import request from '../../utils/request'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', //placeholder内容
    hotList: [], // 热搜榜，
    searchContent: "", //用户输入的表单项数据
    searchList: [], //关键字模糊匹配
    historyList: [], // 搜索历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 调用获取数据的方法
    this.getInitData();
    // this.debounce = this.debounce(); // 防抖函数，在此处初始化

    // 获取历史记录
    this.getSearchHistory();
  },

  // 获取初始化的数据
  async getInitData() {
    let placeholderData = await request("/search/default");
    let hotListData = await request('/search/hot/detail');
    this.setData({
      placeholderContent: placeholderData.data.showKeyword,
      hotList: hotListData.data
    })
  },

  // 获取本地历史记录的功能函数
  getSearchHistory() {
    let historyList = wx.getStorageSync('searchHistory')
    if (historyList) {
      this.setData({
        historyList
      })
    }
  },

  // 表单项内容发生改变的回调
  handleInputChange(event) {
    // console.log(event);
    // 更新searchContent的状态数据
    this.setData({
      searchContent: event.detail.value.trim()
    });

    // 防抖功能
    if (this.timer) {
      clearTimeout(this.timer)
    }
    this.timer = setTimeout(() => {
      this.getsearchListData()
    }, 300)


  },

  async getsearchListData() {
    if (!this.data.searchContent) {
      this.setData({
        searchList: ''
      })
      return;
    }
    let { searchContent, historyList } = this.data;
    // 发送请求获取关键字模糊匹配数据
    let searchListData = await request("/search", { keywords: searchContent, limit: 10 });
    console.log(searchListData);
    this.setData({
      searchList: searchListData.result.songs
    })

    // 将搜索的关键字添加到搜索历史记录中

    if (historyList.indexOf(searchContent) !== -1) {
      historyList.splice(historyList.indexOf(searchContent), 1)
    }
    historyList.unshift(searchContent);
    this.setData({
      historyList
    })

    wx.setStorageSync('searchHistory', historyList)
  },

  // clearSearchContent 清空搜索内容
  clearSearchContent() {
    this.setData({
      searchContent: '',
      searchList: []
    })
  },

  // 删除搜索历史记录
  deleteSearchHistory() {
    wx.showModal({
      content: '确认删除吗？',
      success: (res) => {
        if (res.confirm) {
          //清空data中的historyList
          this.setData({
            historyList: []
          });
          // 移除本地的历史记录缓存
          wx.removeStorageSync('searchHistory');
        }
      }
    });
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
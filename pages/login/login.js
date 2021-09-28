// pages/login/login.js
/*
  登录流程
  1.收集表单项数据
  2.前端验证
    1）验证用户信息（账号密码）是否合法。
    2）前端验证不通过就是提示用户，不需要发请求给后端。
    3）前端验证通过了，发请求（携带）
  3.后端验证
    1）验证用户是否存在
    2）用户不存在直接返回，告诉前端用户不存在
    3）用户存在需要验证密码是否存在
    4）密码不正确返回前端提示密码不正确
    5）密码正确返回给前端数据，提示用户登录成功（会携带用户的相关信息）

*/

import request from "../../utils/request"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: "", // 手机号
    password: "" //密码
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  // 表单项内容发生改变的回调函数
  handleInput(event) {

    // let type = event.currentTarget.id; // 这是用id传值,这个type是给元素设置的id值（password phone）
    let type = event.target.dataset.type; // 这是用dataset传值

    this.setData({
      // type是变量 所以要用中括号括起来
      [type]: event.detail.value
    })
  },
  async login() {
    // 1.收集表单项的数据
    let { phone, password } = this.data;
    // 2.前端验证
    /*
      手机号验证：
        1.内容为空
        2.手机号格式不正确
        3.手机号格式正确，验证通过
    */

    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: "error"
      });
      return;
    };

    // 定义手机号的正则表达式
    let phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号不合法',
        icon: "error"
      });
      return;
    }

    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: "error"
      });
      return;
    };

    // 后端验证
    let result = await request('/login/cellphone', { phone, password, isLogin: true });
    if (result.code === 200) { // 登录成功
      wx.showToast({
        title: '登录成功'
      })

      // 将用户信息储存至本地，这个储存的信息是json格式的在用的页面需要反编译一下，如personal.js 第26行
      wx.setStorageSync('userInfo', JSON.stringify(result.profile))


      // 跳转至个人中心页面
      wx.reLaunch({
        url: '/pages/personal/personal',
      })
    } else if (result.code === 400) {
      wx.showToast({
        title: '手机号错误',
        icon: 'error'
      })
    } else if (result.code === 502) {
      wx.showToast({
        title: '密码错误',
        icon: 'error'
      })
    } else {
      wx.showToast({
        title: '登录失败，请重新登录',
        icon: "none"
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
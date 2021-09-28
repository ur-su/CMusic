// 封装网络请求 发送ajax请求

/*
  1.封装功能函数
    1.封装功能点明确
    2.函数内部应该保留固定的代码
    3.将动态数据抽成形参，由使用者根据自身的情况动态的传入实参
    4.一个良好的功能函数应该设置形参的默认值（ES6的形参默认值）

  2.封装功能组件
    1.功能点明确
    2.组件的内部保留静态的代码
    3.将动态的数据抽成props参数，由使用者根据自身的情况以标签属性的形式动态传入props数据
    4.一个良好的组件应该设组件的必要性及数据类型
      props:{
        msg:{
          required:true,
          default:默认值
          type:String
        }
      }
*/
import config from "./config"
export default (url, data = {}, method = 'GET') => {
  return new Promise((resolve, reject) => {
    // 1.new Promise 初始化promise实例的状态为pending


    wx.request({
      url: config.host + url,
      data, // data 的type值看文档第一页 3.1
      method,
      header: {
        // cookie是个数组 只需要第二个数据
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ''
      },
      success: (res) => {
        if (data.isLogin) { //登录请求,将用户cookie存入
          wx.setStorage({
            key: 'cookies',
            data: res.cookies,
          })
        };
        // console.log(res);
        resolve(res.data); // resolve修改promise的状态promise的状态为成功状态，要把什么送出去就把什么放进resolve
      },
      fail: (err) => {
        // console.log("请求失败",err);
        reject(err); // reject修改promise的状态为失败状态rejected
      }
    })
  })
}
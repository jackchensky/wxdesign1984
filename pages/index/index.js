const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

const QQMapWX = require(
  '../../libs/qqmap-wx-jssdk.js'
  )

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground: '',
    hourlyWeather: [],
    todayTemp:'',
    todayDate:'',
    city:'上海',
    locationAuthType: UNPROMPTED,
  },
  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })

  },
  onLoad(){
    this.qqmapsdk = new QQMapWX({
      key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B'
    })
    wx.getSetting({
      success: res=>{
        let auth = res.authSetting['scope.userLocation']
        this.setData({
          locationAuthType: auth? AUTHORIZED:
          (auth===false)?UNAUTHORIZED:UNPROMPTED
        })
        if (auth)
          this.getCityAndWeather()
        else
          this.getNow()
      }
    })
  },
  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now', //仅为示例，并非真实的接口地址
      data: {
        city: this.data.city,
      },
      success: res => {
        console.log(res)
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)

      },
      complete: ()=>{
        callback && callback()
      }
    })
  },
  
  //设置当前天气
  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },

  //设置未来几个小时的天气
  setHourlyWeather(result){
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },

  setToday(result){
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°` ,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })    
  },

  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city
    })
  },

onTapLocation(){
  this.getCityAndWeather()
},

getCityAndWeather() {
    wx.getLocation({
      success: res=>{
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res=>{
            let city = res.result.address_component.city
            this.setData({
              city: city,
            })
            this.getNow()
          }
        })
      },
      fail: () => {
          this.setData({
            locationAuthType: UNAUTHORIZED,
          })
      }
    })
  }
})
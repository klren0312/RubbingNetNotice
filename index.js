const axios = require('axios') // http请求库
const wunderbar = require('@gribnoysup/wunderbar') // 命令行图表库
const WindowsToaster = require('node-notifier').WindowsToaster // 弹框通知库
let notifier = new WindowsToaster({ // 配置SnoreToast
  withFallback: false,
  customPath: './SnoreToast.exe'
});

let my = '' // 自己设备的ip
let num = 0 // 当前联入设备总数
let allDown = '' // 总下载
let allUp = '' // 总上传
let downSpeed = [] // 下载速度数组
let deviceList = [] // 除去自己的设备


function getData() {
  // 请求设备网络使用数据
  axios.get('http://192.168.0.1/goform/getQos?random=0.2296175026847045')
    .then(res => {
      let result = res.data
      my = result.localhost
      downSpeed = []
      upSpeed = []
      deviceList = []
      result.qosList.map(v => {
        if (v.qosListHostname !== 'DESKTOP-QKBMCV7' && v.qosListHostname !== 'Unknown') {
          deviceList.push(v.qosListHostname)
        }
        // 将数据遍历到数组中, 图表需要的数据格式 {value: 你的数据, label: 数据的标题, color: 数据的颜色} 后两项不是必须的
        downSpeed.push({
          value: v.qosListDownSpeed,
          label: v.qosListHostname
        })
      })
    })
    .catch(err => {
      console.log(error)
    })
  // 请求设备联网总数据
  axios.get('http://192.168.0.1/goform/getStatus?0.3297709679659049')
    .then(res => {
      let result = res.data
      allDown = result.statusDownSpeed
      allUp = res.data.statusUpSpeed
      num = res.data.statusOnlineNumber
    })
    .catch(err => {
      console.log(err)
    })
}

// 绘图方法
const printData = () => {
  const { chart, legend, scale, __raw } = wunderbar(downSpeed, {
    min: 0,
    length: 42,
    format: (n) => `${n}KB/s`
  });

  // 清空命令行
  process.stdout.write('\n');
  process.stdout.write('\033[0f');
  process.stdout.write('\033[2J');

  // 绘制图表
  console.log()
  console.log('==========================================');
  console.log(`当前时间:${new Date().toLocaleTimeString()}`)
  console.log(`本机当前IP: ${my}\t 当前联网设备:${num}\t 总下载速度:${allDown}KB/s\t 总上传速度:${allUp}KB/s\t`);
  console.log('==========================================');
  console.log(chart);
  console.log();
  console.log(legend);
  console.log();
};

// 定时刷新
let otherDeviceLength = 0 // 设备计数
setInterval(async () => {
  await getData()
  // 判断是否有新设备加入
  if (deviceList.length > otherDeviceLength) {
    otherDeviceLength = deviceList.length
    // 桌面通知
    notifier.notify({
      title: '有人连进来了',
      message: '低调点!低调点!低调点!',
      icon: './xu.jpg'
    },
      function (error, response) {
        console.log(response)
      });
  } else {
    otherDeviceLength = deviceList.length
  }
  await printData()
}, 5000)

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
let deviceLength = 0 // 除去自己的设备数

function getData() {
  // 请求设备网络使用数据
  axios.get('http://192.168.0.1/goform/getQos?random=0.2296175026847045')
    .then(res => {
      let result = res.data
      my = result.localhost
      downSpeed = []
      upSpeed = []
      result.qosList.map(v => {
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

const printData = () => {
  const { chart, legend, scale, __raw } = wunderbar(downSpeed, {
    min: 0,
    length: 42,
    format: (n) => `${n}KB/s`
  });

  process.stdout.write('\n');
  process.stdout.write('\033[0f');
  process.stdout.write('\033[2J');

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

setInterval(async () => {
  await getData()
  if (num - 2 > deviceLength) {
    deviceLength = num - 2
    notifier.notify({
      title: '有人连进来了',
      message: '低调点!低调点!低调点!',
      icon: './xu.jpg'
    },
      function (error, response) {
        console.log(response)
      });
  }
  await printData()
}, 5000)




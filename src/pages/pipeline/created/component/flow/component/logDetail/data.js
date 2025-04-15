import anser from 'anser'
import { codeElementWidth, computeCodeElementWidth } from '@/utils'
// export const createData = (count) => {
//   let data = []
//   let str = 'sun.boot.class.path: /usr/local/openjdk-8/jre/lib/resources.jar:/usr/local/openjdk-8/jre/lib/rt.jar:/usr/local/openjdk-8/jre/lib/sunrsasign.jar:/usr/local/openjdk-8/jre/lib/jsse.ja'
//   for (var i = 0; i < count; i++) {
//     let startRandom = Math.floor(Math.random() * str.length)
//     let endRandom = Math.floor(Math.random() * str.length)
//     if (startRandom > endRandom) {
//       [endRandom, startRandom] = [startRandom, endRandom]
//     }
//     data.push({
//       name: i + 1 + str.slice(startRandom, endRandom),
//       index: i + 1
//     })
//   }
//   return data
// }

export const createData = (count) => {
  const resText = "\u001b[0KRunning with gitlab-runner development version (HEAD)\u001b[0;m\n\u001b[0K  on TRISTAN-NIU-L HXKU6seU, system ID: s_498b7a440a31\u001b[0;m\nsection_start:1682581592:prepare_executor\r\u001b[0K\u001b[0K\u001b[36;1mPreparing the \"docker\" executor\u001b[0;m\u001b[0;m\n\u001b[0KUsing Docker executor with image ubuntu:latest ...\u001b[0;m\n\u001b[0KPulling docker image ubuntu:latest ...\u001b[0;m\n\u001b[0KUsing docker image sha256:08d22c0ceb150ddeb2237c5fa3129c0183f3cc6f5eeb2e7aa4016da3ad02140a for ubuntu:latest with digest ubuntu@sha256:67211c14fa74f070d27cc59d69a7fa9aeff8e28ea118ef3babc295a0428a6d21 ...\u001b[0;m\nsection_end:1682581609:prepare_executor\r\u001b[0Ksection_start:1682581609:prepare_script\r\u001b[0K\u001b[0K\u001b[36;1mPreparing environment\u001b[0;m\u001b[0;m\nRunning on runner-hxku6seu-project-3-concurrent-0 via LG-A01-SD-112-14...\nsection_end:1682581610:prepare_script\r\u001b[0Ksection_start:1682581610:get_sources\r\u001b[0K\u001b[0K\u001b[36;1mGetting source from Git repository\u001b[0;m\u001b[0;m\n\u001b[32;1mSkipping Git repository setup\u001b[0;m\n\u001b[32;1mSkipping Git checkout\u001b[0;m\n\u001b[32;1mSkipping Git submodules setup\u001b[0;m\nsection_end:1682581611:get_sources\r\u001b[0Ksection_start:1682581611:step_script\r\u001b[0K\u001b[0K\u001b[36;1mExecuting \"step_script\" stage of the job script\u001b[0;m\u001b[0;m\n\u001b[0KUsing docker image sha256:08d22c0ceb150ddeb2237c5fa3129c0183f3cc6f5eeb2e7aa4016da3ad02140a for ubuntu:latest with digest ubuntu@sha256:67211c14fa74f070d27cc59d69a7fa9aeff8e28ea118ef3babc295a0428a6d21 ...\u001b[0;m\n\u001b[32;1m$ echo \"Compiling the code...\"\u001b[0;m\nCompiling the code...\n"

  let json = anser.ansiToJson(resText).filter(log => {
    const content = log.content.replace(/\n/g, '').replace(/\r/g, '')
    if (content) {
      return true
    }
  })
  let data = []
  for (let i = 0; i < count; i++) {
    let random = Math.floor(Math.random() * json.length)
    data.push({
      ...json[random],
      name: json[random].content.replace(/\n/g, '').replace(/\r/g, ''),
      index: i + 1
    })
  }
  return data
}

// const setNumber = (data, num) => {
//   const { logData = [] } = variableRef.current
//   let lastIndex = num ? num : logData[logData.length - 1]?.index || 0
//   data.forEach((item) => {
//     lastIndex += 1
//     item.index = lastIndex
//   })
// }

const handleColor = (log) => {
  const color = log.fg
  // 修改报错颜色
  if (color === '187, 0, 0') {
    log.fg = '255, 86, 86'
  }

}

export const filterLog = (data, startIndex) => {
  data = data.replace(/\r/g, '')
  const list = []
  // const json = [...anser.ansiToJson(data), ...anser.ansiToJson(data), ...anser.ansiToJson(data)]
  const json = anser.ansiToJson(data)
  let lastIndex = startIndex || 0
  json.forEach(log => {
    handleColor(log)
    // 拆分\n
    const content = log.content.split('\n')
    content.forEach(item => {
      const name = item
      const width = document.querySelector('.log-detail-list-scroll').offsetWidth
      // 130 右侧导航宽度 20 边距
      const fontWidth = width - 130 - 240
      // 计算总长度
      if (item) {
        const strArr = name.split('\\n')
        strArr.forEach(name => {
          log.index = ++lastIndex
          let itenIndex = log.index
          const totalWidth = computeCodeElementWidth(name)
          // 如果拆分后 长度还是大于80，继续拆分
          if (totalWidth > fontWidth) {
            let str = ''
            let num = 0
            for (let i = 0; i < name.length; i++) {
              if (num >= fontWidth) {
                list.push({
                  ...log,
                  name: str,
                  content: str,
                  index: itenIndex
                })
                str = ''
                num = 0
                itenIndex = ''
              }
              const item = name[i]
              str += item
              if (item) {
                num += codeElementWidth[item] || 2
              }
            }
            list.push({
              ...log,
              name: str,
              content: str,
              index: itenIndex
            })
          } else {
            list.push({
              ...log,
              name,
              content: name,
            })
          }
        })
      }
    })
  })
  const value = list.filter(item => item.name && item.name !== '\n')
  return value
}
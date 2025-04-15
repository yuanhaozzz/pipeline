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
  const anserData = anser.ansiToJson(resText)
  let json = anserData.filter(log => {
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
      line_num: i + 1,
      timestamp: '2024-04-22 04:11:40'
    })
  }
  return data
}

export const filterAnser = (text) => {
  const anserData = anser.ansiToJson(text)
  let json = anserData.filter(log => {
    const content = log.content.replace(/\n/g, '').replace(/\r/g, '')
    if (content) {
      return true
    }
  })
  let str = ''
  json.forEach((item, index) => {
    if (index > 0) {
      str += ' '
    }
    const v = item.content.replace(/\n/g, '').replace(/\r/g, '').trim()
    str += v
  })
  return str
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

// const str = 'abcdesdhiwajdoandhfiuwehifsjcvbvuiahdioajeoiqwigsjkndasknncbvjsdfkasdjdoqiwfhighvsijiasbdiasbduiqw-asd..sadasd1212.as.2.434.ty7.r123079039r'
const str = '萨克都请问去啊速度加啊四哦都回复如果大家说的三金卡文物根据哦分狄卡斯asdalksnewqriejgoidvnjsd阿萨大四多久哦埃及第五部分外表'
export const requestList = () => {
  const list = []
  for (let i = 0; i < 334; i++) {
    let content = ''
    const randomLen = Math.floor(Math.random() * 1000)
    for (let j = 0; j < randomLen; j++) {
      const randomStr = Math.floor(Math.random() * str.length)
      content += str[randomStr]
    }
    list.push({
      logIndex: i + 1,
      date: '2024-04-12 10:58:00',
      logContent: content,
      color: getRandomColor()
    })
  }
  return list
}

function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export const testJSON = `[0KRunning with gitlab-runner 15.4.0 (43b2dc3d)[0;m
  [0K  on ciservice hSRgxtBR[0;m
  section_start:1711161189:resolve_secrets
  [0K[0K[36;1mResolving secrets[0;m[0;m
  section_end:1711161189:resolve_secrets
  [0Ksection_start:1711161189:prepare_executor
  [0K[0K[36;1mPreparing the "docker" executor[0;m[0;m
  [0KUsing Docker executor with image artifact.enflame.cn/enflame_docker_images/ci/docker:sshpass ...[0;m
  [0KPulling docker image artifact.enflame.cn/enflame_docker_images/ci/docker:sshpass ...[0;m
  [0KUsing docker image sha256:7c49cb51239a6c151c2f28bf03bd9d884ba831b840b3ade8184e51b2d4f81ed1 for artifact.enflame.cn/enflame_docker_images/ci/docker:sshpass with digest artifact.enflame.cn/enflame_docker_images/ci/docker@sha256:f0f61805b53059710c1f39314e6164a0e307db6420e0e88e88c1e55e03e2526c ...[0;m
  section_end:1711161191:prepare_executor
  [0Ksection_start:1711161191:prepare_script
  [0K[0K[36;1mPreparing environment[0;m[0;m
  Running on runner-hsrgxtbr-project-8119-concurrent-0 via b06c01bae4c3...
  section_end:1711161191:prepare_script
  [0Ksection_start:1711161191:get_sources
  [0K[0K[36;1mGetting source from Git repository[0;m[0;m
  [32;1mFetching changes with git depth set to 20...[0;m
  Reinitialized existing Git repository in /builds/sseci/dolphin-gateway/.git/
  [32;1mChecking out 035ff57a as main...[0;m

  [32;1mSkipping Git submodules setup[0;m
  section_end:1711161193:get_sources
  [0Ksection_start:1711161193:step_script
  [0K[0K[36;1mExecuting "step_script" stage of the job script[0;m[0;m
  [0KUsing docker image sha256:7c49cb51239a6c151c2f28bf03bd9d884ba831b840b3ade8184e51b2d4f81ed1 for artifact.enflame.cn/enflame_docker_images/ci/docker:sshpass with digest artifact.enflame.cn/enflame_docker_images/ci/docker@sha256:f0f61805b53059710c1f39314e6164a0e307db6420e0e88e88c1e55e03e2526c ...[0;m
  [32;1m$ echo "{ }"  set_env.sh[0;m
  [32;1m$ docker save artifact.enflame.cn/enflame_docker_images/ci/dolphin-gateway:"ta" | sshpass -p "assword}" ssh -C -o StrictHostKeyChecking=no "sername@"$st_ip"docker load"[0;m
  usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface]
  [-b bind_address] [-c cipher_spec] [-D [bind_address:]port]
  [-E log_file] [-e escape_char] [-F configfile] [-I pkcs11]
  [-i identity_file] [-J [user@]host[:port]] [-L address]
  [-l login_name] [-m mac_spec] [-O ctl_cmd] [-o option] [-p port]
  [-Q query_option] [-R address] [-S ctl_path] [-W host:port]
  [-w local_tun[:remote_tun]] destination [command [argument ...]]
  section_end:1711161200:step_script
  [0Ksection_start:1711161200:cleanup_file_variables
  [0K[0K[36;1mCleaning up project directory and file based variables[0;m[0;m
  section_end:1711161201:cleanup_file_variables
  [0K[31;1mERROR: Job failed: exit code 255
  [0;m`
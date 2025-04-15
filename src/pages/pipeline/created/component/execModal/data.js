import { camelToSnake } from '@/utils'
import moment from 'moment'

export const formatVariabledValue = (env, envListRefCurrent) => {
  const variabled = Object.keys(env).filter(item => !item.includes('repo----')).map(key => {
    const [t, k] = key.split('----')
    const currentEnv = envListRefCurrent.find(item => item.name === k) || {}
    const obj = {
      key: k,
      type: t,
      value: env[key],
      description: currentEnv.description || '',
      display_name: currentEnv.display_name
    }

    if (t === 'date' && obj.value) {
      obj.value = moment(obj.value).format('YYYY-MM-DD HH:mm:ss')
    }
    return obj
  })

  // 单独处理仓库
  const repoList = Object.keys(env).filter(item => item.includes('repo----'))
  if (repoList.length > 0) {
    const total = handleTotal(repoList)
    variabled.push({
      repo_info: Array.from(new Array(total * 1)).map((item, index) => {
        index += 1
        const values = repoList.filter(item => item.split('-')[0] === index + '')
        const params = {}
        values.map((keyItem) => {
          // const key = keyItem.replace(index + '-repo----', '')
          const [t, k, v] = keyItem.split('----')
          const newKey = camelToSnake(k.replace(/-/g, '_'))
          params[newKey] = env[keyItem]
          switch (newKey) {
            case 'git_url':
              params[newKey] = env[index + '-repo----repo-url']
              params['repo_key'] = v
              break
            case 'ref':
              params['ref_key'] = v
              break
            case 'patchset':
              params['patchset_key'] = v
              break
            case 'sha':
              params['sha_key'] = v
              break
          }
        })
        let data = {
          index: index + '',
          platform: params['repo_type'],
          base_info: {
            "key": params['repo_key'] || '',
            "name": params['repo_name'] || '',
            "repo_id": params['repo_id'] || '',
            "repo_url": params['repo_url'] || ''
          },
          branch_patchset: {
            "key": params['patchset_key'] || '',
            "type": "patchset",
            "patchset": params['patchset'] || ''
          },
          commit: {
            // key: '',
            sha: ''
          }
        }

        if (params.ref) {
          data.branch_patchset.type = 'branch'
          data.branch_patchset.ref = params['ref'] || ''
          delete data.branch_patchset.patchset
          data.commit.sha = params['sha'] || ''
        }
        if (params.tag) {
          data.branch_patchset.type = 'tag'
          data.branch_patchset.tag = params['tag'] || ''
          delete data.branch_patchset.patchset
          data.commit.sha = params['sha'] || ''
        }
        // 设置Key值，无论是否有值，只要Key存在就赋值
        const list = envListRefCurrent.filter((item) => item.prompt_on_trigger && item.type === 'repo').reverse()
        const currentRepo = list[index - 1]?.repo || []
        data.branch_patchset.key = currentRepo[1]['ref-name']
        data.commit.key = currentRepo[2]['sha-name']
        // 设置显示名称
        data.base_info.display_name = currentRepo[0]['repo_display_name']
        data.branch_patchset.display_name = currentRepo[1]['ref_display_name']
        data.commit.display_name = currentRepo[2]['sha_display_name']

        return data
      })
    })
  }
  return variabled
}


function handleTotal(list) {
  let maxNumber = 0;
  list.forEach(item => {
    let number = item.split('-')[0] * 1
    if (number > maxNumber) {
      maxNumber = number * 1
    }
  });
  return maxNumber
}


const handleCommonType = (prev, env, type) => {
  const index = env.findIndex(item => item.type === type && prev.key === item.name)
  if (env[index]) {
    switch (type) {
      case 'multiple':
        env[index]['default'] = prev.value || []
        break
      default:
        env[index]['default'] = prev.value
    }

  }
}

const handleComponentType = (prev, env) => {
  const index = env.findIndex(item => item.type === 'component')
  if (env[index]) {
    env[index].componentDefault[prev.key] = prev.value
    if (prev.key === "git_url") {
      env[index].componentDefault['repo-url'] = prev.value
    }
  }
}

const handleRepoType = (prev, env) => {
  // 解决之前
  if (!prev.repo_info) {
    return
  }
  const repoList = env.filter(item => item.type === 'repo').reverse()

  repoList.map((item, index) => {
    // 上一次变量中的值
    const currentPrev = prev.repo_info[index]
    // 环境变量
    const repo = item.repo
    if (currentPrev) {

      repo[0]['repo-type'] = currentPrev[`platform`]
      repo[0]['repo-id'] = currentPrev['base_info'][`repo_id`]
      repo[0]['repo-name'] = currentPrev['base_info'][`name`]
      repo[0]['repo-url'] = currentPrev['base_info'][`repo_url`]
      repo[0]['git_url-name'] = currentPrev['base_info']['key']
      repo[1]['ref-isBranch'] = currentPrev['branch_patchset']['type']
      repo[1]['ref-name'] = currentPrev['branch_patchset']['key']
      repo[1]['ref-patchset'] = currentPrev['branch_patchset']['patchset']
      repo[1]['ref'] = currentPrev['branch_patchset']['ref']
      repo[1]['ref-tag'] = currentPrev['branch_patchset']['tag']

      repo[2]['sha'] = currentPrev['commit']['sha']
      repo[2]['sha-name'] = currentPrev['commit']['key']
    }
  })
}

const handleRelation = (item, env, data, setData) => {
  const currentPipeline = data

  const relationList = currentPipeline.setting.extra_data.relationList
  relationList.forEach(relation => {
    const value = relation.value
    const findRelation = relation.options.find(id => id === item.value)
    if (findRelation) {
      // 默认值不相等则修改
      if (value !== findRelation) {
        relation.value = findRelation
      }
    }
  })
  setData({ ...data })
}

export const formatPrevVariables = (variables, env, data, setData) => {
  variables.forEach(item => {
    const type = item.type
    switch (type) {
      case 'string':
      case 'bool':
      case 'choose':
      case 'choose':
      case 'multiple':
      case 'date':
      case 'user':
      case 'upload':
      case 'fileContent':
        handleCommonType(item, env, type)
        break
      case 'component':
        handleComponentType(item, env)
        break
      // 仓库
      default:
        handleRepoType(item, env)
    }
    // 处理互斥关系
    if (type?.includes('0.')) {
      handleRelation(item, env, data, setData)
    }
  })

}
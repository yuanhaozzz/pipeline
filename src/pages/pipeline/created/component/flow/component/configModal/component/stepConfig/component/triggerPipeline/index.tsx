import React, { useEffect, useRef, useState, useReducer, forwardRef, useImperativeHandle } from 'react';
import { Form, Select, Input, Button, Radio, message, TimePicker, DatePicker, Checkbox, Space, Spin } from 'antd'
import { LoadingOutlined, SwapOutlined, UpOutlined, PlusOutlined, MinusCircleOutlined, PlusCircleOutlined, MinusOutlined } from '@ant-design/icons'

import { formItemConfig, component } from './data'

import './style.less'
import { useModel } from 'umi';

import RemoteSearch from '@/components/formComponent/remoteSearch'
import { getPipelineConfigApi } from './service'
import { getUrlParams } from '@/utils'
import Env from '@/pages/pipeline/created/component/preview/components/env'
import { formatVariabledValue, formatPrevVariables } from '@/pages/pipeline/created/component/execModal/data'
import { renderTriggerIcon, renderTriggerType } from '@/pages/pipeline/created/common'

const { TextArea } = Input;
function Project(props, ref) {
  const { from, config, onValuesChange, close } = props
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  const { pipelineId } = getUrlParams()
  const [data, setData] = useState(null)
  const [envConfig, setEnvConfig] = useState([])
  const [, forceUpdate] = useReducer(state => state + 1, 0)
  const envRef = useRef(null)
  const [isRequest, setRequest] = useState(false)

  const remoteSearchRef = useRef(null)

  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    vaild,
    saveError
  }))

  useEffect(() => {
    initValue()
  }, [])

  // const initValue = async () => {
  //   const { selected_pipeline } = config?.variables
  //   if (selected_pipeline) {
  //     form.setFieldValue('selected_pipeline', selected_pipeline)
  //     getPipelineConfig(selected_pipeline, 'load')

  //     setTimeout(async () => {
  //       try {
  //         await form.validateFields()
  //       } catch (error) {
  //         envRef.current.setMoreOptions(true)
  //       }
  //     }, 1000);
  //   }

  //   remoteSearchRef.current.init()
  // }

  const initValue = async () => {
    const { selected_pipeline, trigger_variables_2 = [] } = config?.variables
    if (selected_pipeline) {
      form.setFieldValue('selected_pipeline', selected_pipeline)
      getPipelineConfig(selected_pipeline, 'load')
      // form.setFieldValue(`${3}-repo`, 1)
      trigger_variables_2?.map(item => {
        if (item.repo_info) {
          item.repo_info.forEach(repoItem => {
            const index = repoItem.index
            delete repoItem.index
            const v = handleString(repoItem)
            form.setFieldValue(`${index}-repo`, v)
          })
        } else {
          form.setFieldValue(item.key, item.value)
        }
      })
      //   forceUpdate()

      setTimeout(async () => {
        try {
          await form.validateFields()
        } catch (error) {
        }
      }, 1000);
    }
    remoteSearchRef.current.init()
  }

  const saveError = (v: any = {}) => {
    const selected_pipeline = form.getFieldValue('selected_pipeline')
    delete v.selected_pipeline
    return {
      selected_pipeline,
      trigger_variables_2: handleVaildData(v)
    }
  }


  // const vaild = async () => {
  //   let env = await form.validateFields()
  //   env = filterEmptyParams(env)

  //   const selected_pipeline = env.selected_pipeline
  //   delete env.selected_pipeline

  //   const trigger_variables_2 = formatVariabledValue(env, envConfig)
  //   return {
  //     selected_pipeline,
  //     trigger_variables_2
  //   }
  // }


  const handleBase = (list, data) => {
    const base = Object.keys(data).filter(item => !item.includes('-repo'))
    base.forEach((key) => {
      const currentBase = envConfig.find(item => item.name === key)
      const o: any = {
        key,
        type: currentBase.type
      }
      if (data[key]) {
        o.value = data[key]
      }
      list.push(o)
    })
  }

  const handleRepo = (list, data) => {
    const dataKyes = Object.keys(data)
    const base = dataKyes.filter(item => item.includes('-'))
    if (base.length <= 0) {
      return list
    }
    const repo_info = []
    list.push({
      repo_info
    })

    base.forEach(repoKey => {
      const index = repoKey.split('-')[0]
      try {
        const o = JSON.parse(data[repoKey])
        o.index = index
        repo_info[index - 1] = o
      } catch (error) {
        repo_info[index - 1] = {
          index,
          content: data[repoKey]
        }
      }

    })
  }

  const handleVaildData = (data) => {
    const list = []
    // 处理基础类型
    handleBase(list, data)
    // 处理仓库
    handleRepo(list, data)
    return list
  }

  const vaild = async () => {
    let env = await form.validateFields()
    const selected_pipeline = env.selected_pipeline
    delete env.selected_pipeline

    return {
      selected_pipeline,
      trigger_variables_2: handleVaildData(env)
    }
  }

  function filterEmptyParams(params) {
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        if (params[key] === undefined || params[key] === null) {
          params[key] = ''
        }
      }

    }
    return params
  }

  const onChange = (v) => {
    const repoList = envConfig.filter(item => item.type === 'repo').reverse()
    repoList.map((item, index) => {
      form.setFieldValue(`${index + 1}-repo`, undefined)
    })
    if (v) {
      // 查找流水线触发参数
      getPipelineConfig(v)
    } else {
      setData(null)
      setEnvConfig([])
    }
  }

  const getPipelineConfig = async (uuid, from?) => {
    try {
      setRequest(true)
      const { data } = await getPipelineConfigApi(uuid)
      let { pipeline_variable: env = [] } = data.setting
      setData(data)
      // 设置默认值
      setInitValue(env, data, from)
      form.setFieldValue('trigger_variables_2', env)
      setTimeout(() => {
        if (envRef.current) {
          envRef.current.setEnv(env)
        }
      }, 300);

    } catch (error) {

    } finally {
      setTimeout(() => {
        setRequest(false)
      }, 300);
    }
  }

  const validator = (info, value) => {
    if (!value) {
      return Promise.resolve()
    }
    try {
      JSON.parse(value)
    } catch (error) {
      return Promise.reject('JSON 格式错误')
    }

    return Promise.resolve()
  }

  const setInitValue = (env, data, from) => {
    if (from === 'load') {
      const { trigger_variables_2 } = config?.variables
      if (trigger_variables_2) {
        // formatPrevVariables(trigger_variables_2, env, data, setData)
      }
    }
    // 设置环境变量
    setEnvConfig(env || [])
  }

  const handleValue = (type, branch) => {
    switch (type) {
      case 'branch':
        return branch['ref'] || ''
      case 'tag':
        return branch['ref-tag'] || ''
      default:
        return branch['ref-patchset'] || ''
    }
  }

  const handleString = (obj) => {
    if (typeof obj !== 'object') {
      return obj
    }
    if (obj.content !== undefined) {
      return obj.content
    }
    if (!obj.base_info) {
      obj.base_info = {}
    }
    if (!obj.branch_patchset) {
      obj.branch_patchset = {}
    }
    if (!obj.commit) {
      obj.commit = {}
    }

    try {
      let str = `{
        "platform": "${obj?.platform || ''}",
        "base_info": {
          "key": "${obj?.base_info?.key || ''}",
          "name": "${obj?.base_info?.name || ''}",
          "repo_id": "${obj?.base_info?.repo_id || ''}",
          "repo_url": "${obj?.base_info?.repo_url || ''}"
        },
        "branch_patchset": {
          "key": "${obj?.branch_patchset?.key || ''}",
          "type": "${obj?.branch_patchset?.type || ''}",
          "${obj?.branch_patchset?.type || ''}": "${obj?.branch_patchset[obj?.branch_patchset?.type] || ''}"
        }${obj?.branch_patchset?.type === 'branch' ? ',' : ''}
    `
      if (obj?.branch_patchset?.type === 'branch') {
        str += `
        "commit": {
          "key": "${obj?.commit?.key || ''}",
          "sha": "${obj?.commit?.sha || ''}"
        }
      }`
      } else {
        str += `}`
      }
      return str
    } catch (error) {
      return ''
    }

  }

  const handleInitValue = (item) => {
    const repo = item[0]
    const branch = item[1]
    const commit = item[2]
    let str = `{
        "platform": "${repo['repo-type'] || ''}",
        "base_info": {
          "key": "${repo['git_url-name'] || ''}",
          "name": "${repo['repo-name'] || ''}",
          "repo_id": "${repo['repo-id'] || ''}",
          "repo_url": "${repo['repo-url'] || ''}"
        },
        "branch_patchset": {
          "key": "${branch['ref-name'] || ''}",
          "type": "${branch['ref-isBranch'] || ''}",
          "${branch['ref-isBranch']}": "${handleValue(branch['ref-isBranch'], branch)}"
        }${branch['ref-isBranch'] === 'branch' ? ',' : ''}
      `

    if (branch['ref-isBranch'] === 'branch') {
      str += `"commit": {
          "key": "${commit['sha-name'] || ''}",
          "sha": "${commit['sha'] || ''}"
        }
      }`
    } else {
      str += `}`
    }

    return str
  }

  const renderRepo = (item, itemInfo) => {
    const repoList = envConfig.filter(item => item.type === 'repo').reverse()
    const index = repoList.findIndex(item => item.id === itemInfo.id) + 1
    const repo = item[0]
    const initialValue = handleInitValue(item)
    return <div style={{ border: '1px solid #eee', padding: '5px 10px', marginBottom: '10px' }}>
      <div className='flex-start'>
        仓库{index}&nbsp; <span style={{ marginTop: '-4px' }}>{renderTriggerIcon(repo['repo-type'])}&nbsp;</span>{repo['repo-name']}
      </div>
      <div style={{ paddingLeft: '20px' }}>
        <Form.Item name={`${index}-repo`} style={{ marginBottom: '5px' }} initialValue={initialValue} rules={[{ validator }]}>
          <TextArea placeholder='默认自定义值' autoSize={{ minRows: 6 }} />
        </Form.Item>
      </div>
    </div>
  }

  const renderEnv = () => {
    if (envConfig.length <= 0 || !data.setting) {
      return <></>
    }
    if (!envConfig || envConfig.filter((item: any) => item.prompt_on_trigger).length <= 0) {
      return <></>
    }

    // return <Env env={envConfig} form={form} ref={envRef} data={data} pipelineId={pipelineId} />
    return <>
      {
        envConfig.map(item => {
          const extra = item.description ? <span dangerouslySetInnerHTML={{ __html: item.description }} ></span> : ''
          if (item.type === 'component') {
            return <></>
          }


          if (item.type === 'repo') {
            return renderRepo(item.repo, item)
          }
          return <Form.Item name={item.name} label={item.display_name || item.name} extra={extra} style={{ marginBottom: '10px' }} >
            <Input placeholder='${x}格式的环境变量或自定义值' />
          </Form.Item>
        })
      }
    </>
  }

  return <Form layout="vertical" form={form} disabled={from !== 1}>
    <div className='flow-create-step-config-trigger-pipeline-container'>
      <RemoteSearch component={component} name={formItemConfig.name} formItemConfig={formItemConfig} form={form} config={config} forceUpdate={forceUpdate} onChange={onChange} ref={remoteSearchRef} />
      {
        isRequest
          ?
          <div className='flex-center' style={{ margin: '10px 0 0' }}>
            <Spin />
          </div>
          :
          renderEnv()
      }
    </div>
  </Form>
}

export default forwardRef(Project)

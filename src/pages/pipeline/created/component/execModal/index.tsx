import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { PlusOutlined, ApartmentOutlined, DownOutlined } from '@ant-design/icons'
import { Button, message, Tooltip, Form, Input, Radio, Select, Spin, Empty, Modal } from 'antd'
import { useSelector, useDispatch } from 'dva'
import { searchPipelineApi, triggerPipelineApi } from './service'
import { addType } from '../../data'
import { getUrlParams, deepCopy, filterEmptyParams, camelToSnake } from '@/utils'
import EditorComponent from '@/components/Editor';
import Env from '../preview/components/env'
import AnimationHeight from '@/components/animation/height'
import PipelineComponent from './component/pipeline'
import { commonHandleTriggerType, setCompatiblePath } from '@/pages/pipeline/created/common'
import { checkPipilineAuth } from '@/utils/menu'
const { TextArea } = Input;
import {useNavigate} from 'umi'


import './style.less'
import moment from 'moment';
import { formatPrevVariables, formatVariabledValue } from './data'

export interface IAppProps {
}

function LoadModal(props: IAppProps, ref: any) {
  const { submitCallback } = props

  const [modal, setModal] = useState(false)
  const [data, setData] = useState(null)
  const [envContent, setEnvContent] = useState(true)
  const [execLoading, setExecLoading] = useState(false)
  const [selectData, setSelectData] = useState([])
  const [envConfig, setEnvConfig] = useState([])

  const variableRef = useRef(null)
  const envRef = useRef(null)
  const pipelineRef = useRef(null)
  const heightRef = useRef(null)
  const version = useRef('')
  const describeInitVal = useRef('')
  const {pipelineId} = getUrlParams()

  const navigate = useNavigate()

  const envListRef = useRef([])

  const [form] = Form.useForm();
  const [formConfig] = Form.useForm();
  // const pipelineId = 'p-e389e5005f3b40cdbe1d5bc01f9838e5'

  const pipeline = useSelector(({ pipeline }) => pipeline)
  const dispatch = useDispatch()

  useImperativeHandle(ref, () => ({
    open
  }))

  // useEffect(() => {
  //   getDetail()
  // }, [])



  const setInitValue = (env, data) => {
    const { trigger_info } = variableRef.current.execPipelineData
    // 只要版本信息存在，就使用该版本变量 否则使用新的
    const pathname = location.pathname
    if ((!pathname.startsWith('/created/detail/') && !pathname.startsWith('/created/recentlyRun/detail/')) && !version.current) {
      formConfig.setFieldValue('describe', data?.setting?.description)
      describeInitVal.current = data?.setting?.description
      // 设置环境变量
      setEnvConfig(env)
      return
    }
    // 单独处理
    if (trigger_info) {
      const { stages, description, variables } = trigger_info
      if (stages) {
        setSelectData(stages)
      }
      formConfig.setFieldValue('describe', description)
      describeInitVal.current = description
      // env 为设置的初始值，将初始值设置为 上次用户设置的值
      if (variables) {
        // 增加过滤
        // env = env.filter(item => {
        //   const v = variables.find(envData => envData.key === item.name)
        //   return v
        // })
        formatPrevVariables(variables, env, data, setData)
      }
    }

    // 设置环境变量
    setEnvConfig(env)
  }

  const getDetail = async () => {
    try {
      // let data = pipeline.list.find((item: any) => item.id === pipelineId)
      // if (!data || !data?.setting?.pipeline_variable) {

      const index = pipeline.list.findIndex((item: any) => (item.id * 1) === (pipelineId * 1))
      let data = pipeline.list[index]
      addType(data.stages)
      data.template = data.stages
      data.id = pipelineId
      if (index < 0) {
        pipeline.list.push(deepCopy(data))
      } else {
        pipeline.list[index] = deepCopy(data)
      }

      // dispatch(setPipeline({ list: [...pipeline.list] }))
      dispatch({
        type: 'pipeline/setList',
        payload: { list: [...pipeline.list] }
      })
      // }
      setData({ ...data })
      let { pipeline_variable: env = [] } = data.setting
      if (env) {
        envListRef.current = env
        setInitValue(env, data)
        setTimeout(() => {
          if (envRef.current) {
            envRef.current.setEnv(env)
          }
          const repo = env.find(item => item.type.includes('git_url')) || {}
          variableRef.current.repoInfo = repo.urlValue
        }, 300);

      }
    } catch (error) {
      console.log(error)
    } finally {
    }
  }

  const open = (record: any, versionData) => {
    version.current = versionData || getUrlParams().version
    getDetail(record.id)
    variableRef.current.execPipelineId = record.id
    variableRef.current.execPipelineData = record || {}
    setModal(true)
  }

  const onCancel = () => {
    setData({})
    setModal(false)
  }

  const handleSelectData = (selectData: any) => {
    const stages = deepCopy(data.stages)
    selectData.forEach((item, index) => {
      item.forEach(key => {
        if (key) {
          const splitValue = key.split('-')
          const len = splitValue.length
          switch (len) {
            case 1:
              stages[splitValue[0]].selected = true
              break
            case 2:
              stages[splitValue[0]].jobs[splitValue[1]].selected = true
              break
            case 3:
              stages[splitValue[0]].jobs[splitValue[1]].tasks[splitValue[2]].selected = true
              stages[splitValue[0]].jobs[splitValue[1]].selected = true
              break
          }
        }
      })
    })

    return filterSelected(stages)
  }

  const filterSelected = (stages: any[]) => {
    const newList = []
    stages.forEach((stage: any, stageIndex: number) => {
      const { name, uuid } = stage
      const nStage = {
        uuid,
        selectable: stage.selected || false,
        jobs: [],
      }
      newList.push(nStage)
      stage.jobs.forEach((job: any, jobIndex: number) => {
        const { uuid } = job
        const nJob = {
          uuid,
          selectable: job.selected || false,
          tasks: [],
        }
        nStage.jobs.push(nJob)

        stage.jobs[jobIndex].tasks.forEach((task, taskIndex) => {
          const { uuid } = task
          const nTask = {
            uuid,
            selectable: task.selected || false,
          }
          nStage.jobs[jobIndex]?.tasks.push(nTask)
        })
      })
    })
    return newList
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

  const handleTotal = (list) => {
    let maxNumber = 0;
    list.forEach(item => {
      let number = item[0]
      if (number > maxNumber) {
        maxNumber = number;
      }
    });
    return maxNumber
  }

  const submit = async () => {
    try {
      setExecLoading(true)
      const { execPipelineId, execPipelineData } = variableRef.current
      let env = await form.validateFields()
      env = filterEmptyParams(env)
      const selectData = handleSelectData(pipelineRef.current())
      const describe = formConfig.getFieldValue('describe')
      const params: any = {
        // repo_url: '',
        // ref: '',
        // sha: '',
        // before_sha: '',
        // trigger_by: '用户id',
        trigger_type: 'MANUAL',
        stages: selectData,
        description: describe,
      }
      params.variables = formatVariabledValue(env, envListRef.current)

      if (execPipelineData?.version) {
        params.version = execPipelineData?.version * 1
      }
      console.log(params)
      // debugger
      // return
      // 触发
      // const { pipeline_runinfo_id, run_iid } = await triggerPipelineApi(execPipelineId, params)
      message.success('触发成功，正在执行中...')
      navigate(`/pipeline/created/detail?pipelineId=${pipelineId}`)
      setExecLoading(false)
      onCancel()
    } catch (error) {
      const name = error.errorFields[0].name[0]
      // 查找是否在高级选项中
      let currentEnv = envListRef.current.find(item => `${item.type}----${item.name}` === name) || {}
      // 处理仓库
      if (name.includes('-repo')) {
        const repo = envListRef.current.filter(item => item.type === 'repo' && item.prompt_on_trigger).reverse()
        const currentRepo = repo[name[0] - 1]
        if (currentRepo) {
          currentEnv = currentRepo.repo[0]
        }
      }
      // 如果在高级选线中 打开高级选项
      if (currentEnv.isMoreOptions) {
        envRef.current.setMoreOptions(true)
      }

      // 滚动
      form.scrollToField(name, { behavior: 'smooth', block: 'start' })
      console.log(error);
    } finally {
      setExecLoading(false)
    }
  }

  const changeHeight = () => {
    // heightRef.current.changeHeight()
  }

  const renderEnv = () => {
    if (envConfig.length <= 0 || !data.setting) {
      return <></>
    }
    if (!envConfig || envConfig.filter((item: any) => item.prompt_on_trigger).length <= 0) {
      return <></>
    }
    // const env = envConfig.filter((item: any) => item.name || item.type === 'component' || item.type === 'repo')

    return <div className='preview-content-env'>
      <header className='env-header'>
        <span className='env-header-content' onClick={() => setEnvContent(!envContent)}>
          流水线变量：<span style={{ fontSize: '10px', color: '#1890ff' }}>{envContent ? '收起' : '展开'}</span>
        </span>
      </header>
      {/* 填写项 */}
      <Form layout="vertical" form={form} className='env-form'>
        {
          <div style={{ display: envContent ? 'block' : 'none' }}>
            <Env env={envConfig} form={form} ref={envRef} data={data} pipelineId={variableRef.current.execPipelineId} changeHeight={changeHeight} />
          </div>
        }
      </Form >
    </div >
  }

  const renderPipeline = () => {
    return <div>
      <h3 className='pipeline-title'>流水线：</h3>
      <div style={{ padding: '0 10px' }}>
        <PipelineComponent stages={data?.stages || []} ref={pipelineRef} selectData={selectData} />
      </div>
    </div>
  }

  const renderDescribe = () => {
    return <Form layout="vertical" form={formConfig} className='env-form'>
      <div style={{ marginBottom: '5px' }}>描述：</div>
      <Form.Item label="" name="describe" className='flowLine-desc-editor' style={{ padding: '0 10px' }}>
        {/* <TextArea
          placeholder="请输入描述"
          autoSize={{ minRows: 2 }}
        /> */}
        <EditorComponent title='' content={describeInitVal.current} hideTitle={true} isSimple={true} />
      </Form.Item>
    </Form>
  }

  return (
    <div ref={variableRef} >
      {/* maskClosable={false} */}
      <Modal title="" onCancel={onCancel} centered destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Tooltip title={commonHandleTriggerType(data?.setting?.trigger_type)}>&nbsp;
          <Button type="primary" onClick={submit} loading={execLoading}>确定</Button>
        </Tooltip>,
      ]} open={modal} className='flow-line-execModal-wrap'>
        <div className='flow-line-execModal-layer common-scroll-bar'>
          <br />
          {renderEnv()}
          {renderDescribe()}
          {renderPipeline()}
        </div>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
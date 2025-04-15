import React, { useState, useImperativeHandle, forwardRef, useRef, useReducer, useEffect } from 'react';
import { createPortal } from 'react-dom'
import { RightOutlined, MinusCircleOutlined, StopOutlined, LoadingOutlined, PauseCircleOutlined, CloseOutlined } from '@ant-design/icons'

import StageConfig from '../configModal/component/stageConfig'
import JobConfig from '../configModal/component/jobConfig'
import StepConfig from '../configModal/component/stepConfig'
import Log from '../log'
import Env from './component/env'
import { Loading } from '@/utils/commonComponent'
import Review from '@/pages/pipeline/created/component/flow/component/reviewModal/component/review'
// import { tabList } from './data'

import './style.less'

function LoadModal(props: any, ref: any) {
  const { type } = props
  const [modal, setModal] = useState(false)
  const [config, setConfig] = useState<any>({})
  const [tabIndex, setTabIndex] = useState(0)
  const [data, setData] = useState({})

  const variableRef = useRef<any>({})
  const runDataRef = useRef<any>({})
  const loadingRef = useRef<any>(null)

  const tabList = [
    {
      id: 0,
      name: '日志'
    },
    {
      id: 1,
      name: '配置'
    },
  ]
  if (config.type === 3) {
    tabList.push({
      id: 2,
      name: '环境变量'
    },)
  }

  if (config?.atom_name?.startsWith('人工任务')) {
    tabList.unshift({
      id: 3,
      name: '操作记录'
    },)
  }

  useImperativeHandle(ref, () => ({
    open,
    updateData
  }))

  useEffect(() => {
    window.addEventListener('keydown', keydown)
    return () => {
      window.removeEventListener('keydown', keydown)
    }
  }, [])

  const keydown = (event) => {
    if (event.keyCode === 27 || event.key === 'Escape') {
      close()
    }
  }

  // 当轮询刷新数据后，同步修改数据
  const updateData = (r) => {
    try {
      const { stageIndex, jobIndex, stepIndex, type } = runDataRef.current
      let data = {}
      if (stageIndex !== undefined) {
        switch (type) {
          case 1:
          case 3:
            data = r.template[stageIndex].jobs[jobIndex].tasks[stepIndex]
            break
          case 2:
            data = r.template[stageIndex].jobs[jobIndex]
            break
        }
      }
      setConfig({ ...config, ...data })
    } catch (error) {
      console.log(error)
    }
  }

  const open = (record: any, data) => {
    setModal(true)
    let index = 0
    if (record?.atom_name?.startsWith('人工任务')) {
      index = 3
    }

    setData(data)
    setTabIndex(index)
    setConfig(record)
    setTimeout(() => {
      variableRef.current.style.opacity = 1
      // 记录当时点击弹窗位置
      runDataRef.current.stageIndex = record.stageIndex
      runDataRef.current.jobIndex = record.jobIndex
      runDataRef.current.stepIndex = record.stepIndex
      runDataRef.current.type = record.type
    }, 0);
  }

  const onCancel = () => {
    setModal(false)
  }

  const onFinish = () => {

  }

  const handleLoading = (status) => {
    loadingRef.current.handleDisplay(status)
  }

  const close = () => {
    // form.validateFields()
    //   .then(values => {
    // form.resetFields()
    props.update()
    onCancel()
    clearLogContent()
    // })
  }

  const clearLogContent = () => {
    config.logContent = ''
    if (config?.tasks) {
      config?.tasks.forEach((task: any) => {
        task.logContent = ''
      })
    }
  }

  const swtichTab = (index: number) => {
    setTabIndex(index)
  }

  if (!modal) {
    return <></>
  }

  const renderState = (status: string) => {
    return (
      <>
        {
          status === 'success' && <i className='iconfont icon-success-filling flow-color-success flex-center'></i>
        }
        {
          (status === 'failed' || status === 'timeout') && <i className='iconfont icon-Shapex flow-color-failed  flex-center'></i>
        }
        {
          (status === 'pending' || status === 'skipped') && <>
            {/* <MinusCircleOutlined className='flow-color-pending iconfont' /> */}
            <PauseCircleOutlined className='flow-color-pending iconfont' />
          </>
        }
        {
          (status === 'canceled') && <>
            <StopOutlined className='flow-color-canceled iconfont' />

          </>
        }
        {
          (status === 'running' || status === 'manual_confirm') && <>
            <LoadingOutlined className='flow-color-running' style={{ fontSize: '18px', marginRight: '1px' }} />&nbsp;&nbsp;
          </>
        }
        {
          (status !== 'running' && status !== 'manual_confirm') && <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>
        }
      </>
    )
  }

  const renderHeader = () => {
    const { status } = config
    return (
      <header className='content-header flex-space-between'>
        <div className='header-left flex-start'>
          {renderState(status)}
          {config.name}
        </div>
        {
          config.type !== 1 && <>
            {/* 选项 */}
            <ul className='header-center flex-start'>
              {
                tabList.map((item: any, index: number) => (
                  <li key={item.id} className={`${tabIndex === item.id && 'action'}`} onClick={() => swtichTab(item.id)}>{item.name}</li>
                ))
              }
            </ul>
          </>
        }
        <div className='header-right flex-center' onClick={() => onCancel()}>
          <CloseOutlined />
        </div>
      </header>
    )
  }

  const renderConfig = () => {
    switch (config.type) {
      case 1:
        return <StageConfig config={config} type={type} setConfig={setConfig} />
      case 2:
        return <JobConfig config={config} type={type} setConfig={setConfig} />
      case 3:
        return <StepConfig config={config} type={type} close={close} setConfig={setConfig} handleLoading={handleLoading} data={data} />
    }
  }

  const renderLog = () => {
    if (!config.id) {
      return <></>
    }
    return <Log config={config} renderState={renderState} />
  }

  const renderConfigPage = () => {
    return <div className='content-box-config'>
      {renderConfig()}
    </div>
  }

  const renderEnv = () => {
    return <Env tabIndex={tabIndex} config={config} />
  }

  const renderReview = () => {
    return <Review config={config} />
  }

  const renderContent = () => {
    if (config.type === 1) {
      return <div className='content-box'>
        <div className='content-box-config'>
          {renderConfig()}
        </div>
      </div>
    }
    return (
      <div className='content-box'>

        <div className={`content-box-log-container ${'content-box-log-show'}`}>
          {
            tabIndex === 0 && renderLog()
          }
          {
            tabIndex === 1 && renderConfigPage()
          }
          {
            tabIndex === 2 && renderEnv()
          }
          {
            tabIndex === 3 && renderReview()
          }
        </div>
      </div>
    )
  }

  return createPortal(<div className='exec-detail-container replace-font-size-12' onClick={close} ref={variableRef}>
    <div className='content' onClick={(e) => e.stopPropagation()}>
      {renderHeader()}
      {renderContent()}
      <Loading ref={loadingRef} />
    </div>
  </div>, document.body)
}


export default forwardRef(LoadModal)
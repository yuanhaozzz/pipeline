import React, { useState, useImperativeHandle, forwardRef, useRef, useReducer, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom'
import { RightOutlined } from '@ant-design/icons'
import { Popover } from 'antd'

import StageConfig from './component/stageConfig'
import JobConfig from './component/jobConfig'
import StepConfig from './component/stepConfig'
import PluginsModal from './component/pluginsModal'
import LookEnv from './component/lookEnv'
import { Loading } from '@/utils/commonComponent'
import './style.less'
import { getVariablesApi } from './service'

function LoadModal(props: any, ref: any) {
  const { type } = props
  const [modal, setModal] = useState(false)
  const [data, setData] = useState({})
  const [config, setConfig] = useState<any>({})
  const variableRef = useRef<any>({})
  const [tableData, setTableData] = useState<any>({ data: [] })

  const stageRef = useRef<any>(null)
  const jobRef = useRef<any>(null)
  const loadingRef = useRef<any>(null)
  const taskRef = useRef<any>(null)
  const pluginsModalRef = useRef<any>(null)


  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any, data) => {
    setModal(true)
    setConfig(record)
    getVariables(record)
    setData(data)
    setTimeout(() => {
      variableRef.current.style.opacity = 1
      try {
        // vaild().validateFields()
      } catch (error) { }
    }, 0);
  }

  useEffect(() => {
    if (data.template) {
      getVariables(config)
    }

  }, [data, config])

  const getVariables = async (config: any) => {
    if (config.type !== 3) {
      return
    }
    const { stageIndex, jobIndex, stepIndex } = config
    const job = props.data.stages[stageIndex].jobs[jobIndex]
    const prevTask = job.tasks.slice(0, stepIndex)

    // 获取点击task之前 插件id
    const res = {
      data: []
    }
    let stopLoop = false;
    if (data.template) {
      // 获取当前Task之前 设置的全局变量
      for (let i = 0; i < data.template.length; i++) {
        const stage = data.template[i]
        const sIndex = i
        for (let j = 0; j < stage.jobs.length; j++) {
          const job = stage.jobs[j]
          const jIndex = j
          for (let h = 0; h < job.tasks.length; h++) {
            const task = job.tasks[h]
            const tIndex = h
            if (stageIndex === sIndex) {
              stopLoop = true
              break;
            }
            if (task.out_variables) {
              task.out_variables.forEach(item => {
                if (item.scope === 'pipeline') {
                  res.data.push(item)
                }
              })
            }
          }
          if (stopLoop) {
            break;
          }
        }
        if (stopLoop) {
          break;
        }
      }
    }

    prevTask.forEach(item => {
      if (item.out_variables) {
        res.data.push(...item.out_variables)
      }
    })
    setTableData(res)
  }

  const onCancel = () => {
    setModal(false)
  }

  const onFinish = () => {

  }

  const handleLoading = (status) => {
    loadingRef.current?.handleDisplay(status)
  }

  const vaild = () => {
    const { type } = config
    switch (type) {
      case 1:
        return stageRef.current
      case 2:
        return jobRef.current
      case 3:
        return taskRef.current
    }
  }

  const close = async () => {
    await vaild().validateFields()
    props.update()
    onCancel()
  }

  const modifyField = (key, value) => {
    taskRef.current.modifyField(key, value)
  }

  const handlePluginsModal = (key: string, value: any) => {
    pluginsModalRef.current[key](value)
  }

  if (!modal) {
    return <></>
  }

  const renderTitle = () => {
    const { type } = config
    switch (type) {
      case 1:
        return 'Stage'
      case 2:
        return 'Job'
      case 3:
        return 'Task'
    }
  }


  const renderHeader = () => {
    const { type, stepIndex } = config
    return (
      <header className='content-header flex-start'>
        <div className='content-header-left flex-center' onClick={close}>
          <RightOutlined />
        </div>
        <div className='content-header-right'>
          {renderTitle()} 配置
        </div>
        {
          type === 3 && <div className='content-header-env flex-center'>
            <Popover placement="topRight" content={<LookEnv modal={modal} config={config} {...props} from={1} tableData={tableData} />} title="">
              <div style={{ whiteSpace: 'nowrap' }}>可用环境变量</div>
            </Popover>
          </div>
        }

      </header>
    )
  }

  const renderType = () => {
    switch (config.type) {
      case 1:
        return <StageConfig config={config} type={type} ref={stageRef} />
      case 2:
        return <JobConfig config={config} type={type} ref={jobRef} {...props} />
      case 3:
        return <StepConfig config={config} type={type} ref={taskRef} handlePluginsModal={handlePluginsModal} {...props} close={onCancel} handleLoading={handleLoading} data={data} />
    }
  }

  const renderContent = () => {
    return (
      <div className='content-box common-scroll-bar'>
        <div className='form common-content-container'>
          {renderType()}
        </div>
      </div>
    )
  }

  return createPortal(<div className='config-detail-container' onClick={close} ref={variableRef}>
    <div className='content' onClick={(e) => {
      e.stopPropagation();
      pluginsModalRef.current?.hide()
    }}>
      {renderHeader()}
      {renderContent()}
      {/* 加载loading */}
      <Loading ref={loadingRef} />
    </div>
    {/* 插件 */}
    {
      config.type === 3 && < PluginsModal ref={pluginsModalRef} config={config} update={props.update} modifyField={modifyField} />
    }

  </div >, document.body)
}


export default forwardRef(LoadModal)
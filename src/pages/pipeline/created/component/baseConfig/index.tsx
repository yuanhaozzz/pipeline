import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';

import { message } from 'antd'

import './style.less'
import { send } from './service'

import BaseInfo from './component/baseInfo'
import RunConfig from './component/runConfig'
import EnvironmentVariable from './component/environmentVariable'
import { getUrlParams } from '@/utils'

function Project(props: any, ref: any) {
  const { data, setTabIndex: modifySetTabIndex, type, defaultSwitchTabIndex } = props

  const [tabIndex, setTabIndex] = useState(0)
  const { from } = getUrlParams()

  const baseInfoRef = useRef(null)
  const runConfigRef = useRef(null)
  const environmentVariableRef = useRef(null)

  useImperativeHandle(ref, () => ({
    getFormValue,
  }))

  useEffect(() => {
    if (from === 'packagingService') {
      setTabIndex(2)
    }
  }, [])


  const getFormValue = async () => {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const baseInfo = await baseInfoRef.current.getFormValue()
        const runcofnig = await runConfigRef.current.getFormValue()
        const environmentVariable = await environmentVariableRef.current.getFormValue()
        resolve({ ...baseInfo, ...runcofnig, ...environmentVariable })
      } catch (error) {
        setTabIndex(error.values.from)
        modifySetTabIndex(defaultSwitchTabIndex === undefined ? 1 : defaultSwitchTabIndex)
        const { errorFields = [] } = error
        let errorInfo = errorFields[0]?.errors[0]
        if (!errorInfo.replace(/\s/g, '')) {
          if (errorFields.length > 1) {
            errorInfo = errorFields[1]?.errors[0]
          }
        }
        if (errorInfo) {
          message.error(errorInfo || '', 2)
        }
        const name = error.errorFields[0].name[0]
        // // 滚动
        environmentVariableRef.current.formScrollToField(name)
        // form.scrollToField(name, { behavior: 'smooth', block: 'start' })
        reject()
      }
    })

  }

  const switchTab = (index: number) => {
    setTabIndex(index)
  }

  const renderLeft = () => {
    return <ul className='config-left'>
      <li className={`menu-item ${tabIndex === 0 && 'config-menu-action'}`} onClick={() => switchTab(0)}>基本信息</li>
      <li className={`menu-item ${tabIndex === 1 && 'config-menu-action'}`} onClick={() => switchTab(1)}>运行设置</li>
      <li className={`menu-item ${tabIndex === 2 && 'config-menu-action'}`} onClick={() => switchTab(2)}>流水线变量</li>
    </ul>
  }

  const renderRight = () => {
    return <div className='config-right common-scroll-bar' id='flowline-modify-base-right-container'>
      {/* 基本信息 */}
      <div className={`config-right-option ${tabIndex === 0 && 'config-right-option-show'}`}>
        <BaseInfo ref={baseInfoRef} data={data} type={type} />
      </div>
      {/* 运行设置 */}
      <div className={`config-right-option ${tabIndex === 1 && 'config-right-option-show'}`}>
        <RunConfig ref={runConfigRef} data={data} type={type} />
      </div>
      {/* 环境变量 */}
      <div className={`config-right-option ${tabIndex === 2 && 'config-right-option-show'}`}>
        <EnvironmentVariable ref={environmentVariableRef} data={data} type={type} />
      </div>
    </div>
  }

  return (
    <div className='modify-base-config-container flex-start'>
      {renderLeft()}
      {renderRight()}
    </div>
  );
}

export default forwardRef(Project)
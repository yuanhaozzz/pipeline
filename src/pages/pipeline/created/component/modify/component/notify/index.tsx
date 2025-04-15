import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';

import { message } from 'antd'

import './style.less'
import { send } from './service'

import { getUrlParams } from '@/utils'
import ContentComponent from './component/content'


function Project(props: any, ref: any) {
  const { data, setTabIndex: modifySetTabIndex, type, defaultSwitchTabIndex } = props

  const [notifyTabIndex, setNotifyTabIndex] = useState(0)
  const { from } = getUrlParams()

  const successRef = useRef(null)
  const failedRef = useRef(null)
  const canceledRef = useRef(null)

  useImperativeHandle(ref, () => ({
    getFormValue,
  }))

  useEffect(() => {
    initForm()
  }, [data])

  const initForm = () => {
    console.log(data)
    let { success, failed, canceled } = data.setting?.notification
    if (!canceled) {
      canceled = {
        content: "",
        method: ['wecom'],
        receiver: []
      }
    }
    // 兼容method格式问题
    handleMethodType(success, false)
    handleMethodType(failed, true)
    handleMethodType(canceled, true)

    // 铺平字段
    // copyField(success.method, success)
    // copyField(failed.method, failed)
    // 设置默认值
    if (data.setting.default_notification_content) {
      success.content = success.content || data.setting.default_notification_content
      failed.content = failed.content || data.setting.default_notification_content
      canceled.content = canceled.content || data.setting.default_notification_content
    }
    // 报错时，定位切换Tab
    success.notifyIndex = 0
    failed.notifyIndex = 1
    canceled.notifyIndex = 2


    successRef.current.setFormValue(success)
    failedRef.current.setFormValue(failed)
    canceledRef.current.setFormValue(canceled)
  }

  const handleMethodType = (data, value) => {
    if (!Array.isArray(data.method)) {
      data.method = ['wecom']
    }
    if (!data.method) {
      data.method = ['wecom']
    }
  }

  const copyField = (data, target) => {
    for (const key in data) {
      const value = data[key]
      target[key] = value
    }
  }


  const getFormValue = async () => {
    return new Promise(async (resolve: any, reject: any) => {
      try {
        const success = await successRef.current.getFormValue()
        const failed = await failedRef.current.getFormValue()
        const canceled = await canceledRef.current.getFormValue()
        delete success.from
        delete failed.from
        delete canceled.from
        delete success.notifyIndex
        delete failed.notifyIndex
        delete canceled.notifyIndex
        // success.method.wecom = success.wecom
        // failed.method.wecom = failed.wecom
        delete success.wecom
        delete failed.wecom
        delete canceled.wecom
        resolve({ success, failed, canceled })
      } catch (error) {
        modifySetTabIndex(error.values.from)
        setNotifyTabIndex(error.values.notifyIndex)
        const { errorFields = [] } = error
        const errorInfo = errorFields[0]?.errors[0]
        if (errorInfo) {
          message.error(errorInfo || '', 2)
        }
        reject()
      }
    })

  }

  const switchTab = (index: number) => {
    setNotifyTabIndex(index)
  }

  const renderLeft = () => {
    return <ul className='config-left'>
      <li className={`menu-item ${notifyTabIndex === 0 && 'config-menu-action'}`} onClick={() => switchTab(0)}>构建成功时</li>
      <li className={`menu-item ${notifyTabIndex === 1 && 'config-menu-action'}`} onClick={() => switchTab(1)}>构建失败时</li>
      <li className={`menu-item ${notifyTabIndex === 2 && 'config-menu-action'}`} onClick={() => switchTab(2)}>构建取消时</li>
    </ul>
  }

  const renderRight = () => {
    return <div className='config-right'>
      {/* <ContentComponent ref={successRef} data={data} type={type} /> */}
      <div style={{ display: notifyTabIndex === 0 ? 'block' : 'none' }}>
        <ContentComponent ref={successRef} data={data} type={type} tabIndex={notifyTabIndex} />
      </div>
      <div style={{ display: notifyTabIndex === 1 ? 'block' : 'none' }}>
        <ContentComponent ref={failedRef} data={data} type={type} tabIndex={notifyTabIndex} />
      </div>
      <div style={{ display: notifyTabIndex === 2 ? 'block' : 'none' }}>
        <ContentComponent ref={canceledRef} data={data} type={type} tabIndex={notifyTabIndex} />
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
import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Input, Radio, Space, Modal, Button, message } from 'antd';

import './style.less'
import { cancelJobApi, cancelAllJobApi } from './service'
import { getUrlParams } from '@/utils'
import { checkPipilineAuth } from '@/utils/menu'

export interface IAppProps {
}

function LoadModal(props: IAppProps, ref: any) {
  const [value, setValue] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false)

  const variableRef = useRef(null)

  const dataRef = useRef({})

  const { triggerId } = getUrlParams()

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any, d) => {
    variableRef.current.recordData = record
    dataRef.current = d
    setModal(true)
    setValue(1)
  }

  const onCancel = () => {
    setModal(false)
  }

  const handleOk = async () => {
    setLoading(true);
    const { pipelineId } = variableRef.current.recordData
    const { configTriggerId } = dataRef.current
    // debugger
    try {
      const api = value === 2 ? cancelAllJobApi : cancelJobApi
      await api(value === 2 ? configTriggerId : pipelineId)
      onCancel();
      message.success('终止构建请求发送成功，请稍后..')
    } catch (error) {
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e: any) => {
    setValue(e.target.value);
  };

  return (
    <div ref={variableRef}>
      <Modal title="" width={400} className="device-manage-Load-modal" centered destroyOnClose={true} footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} disabled={!checkPipilineAuth('Cancel')} onClick={handleOk}>
          确定
        </Button>,
      ]} open={modal} onCancel={onCancel}>
        <div className='flow-retry-container'>
          <Radio.Group onChange={onChange} value={value}>
            <Space direction="vertical">
              <Radio value={1}>取消当前运行 Job</Radio>
              <Radio value={2}>取消所有运行 Job</Radio>
            </Space>
          </Radio.Group>
        </div>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
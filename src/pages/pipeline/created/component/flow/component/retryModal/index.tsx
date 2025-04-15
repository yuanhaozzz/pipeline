import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Input, Radio, Space, Modal, Button, message, Checkbox } from 'antd';
import { retryAllApi, retryFailedApi, retryJobApi } from './service'
import './style.less'
import { checkPipilineAuth } from '@/utils/menu'
const CheckboxGroup = Checkbox.Group;
export interface IAppProps {
  repeatPipelineStatus(): any
}

function LoadModal(props: IAppProps, ref: any) {
  const { repeatPipelineStatus } = props

  const [value, setValue] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false)

  const [from, setFrom] = useState('stage')

  const [followUpStage, setFollowUpStage] = useState(true)
  const [indeterminate, setIndeterminate] = useState(false);
  const [checkAll, setCheckAll] = useState(true);

  const [recordData, setRecordData] = useState([])
  const [checkedList, setCheckedList] = useState([])

  const variableRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any, from = 'stage') => {
    variableRef.current.recordData = record
    if (from === 'job') {
      setRecordData(record.tasks)
      setCheckedList(record.tasks.map(item => item.logId))
    }

    setModal(true)
    setValue(1)
    setFrom(from)
  }

  const onCancel = () => {
    setModal(false)
    setIndeterminate(false)
    setCheckAll(true)
  }

  const handleOk = async () => {
    setLoading(true);
    try {
      const { pipelineId } = variableRef.current.recordData

      let api = value === 2 ? retryFailedApi : retryAllApi
      const params: any = {
        trigger_follow_up: followUpStage
      }
      if (from === 'job') {
        api = retryJobApi
        params.selected_tasks = checkedList
      }
      await api(pipelineId, params)
      onCancel();
      message.success('正在重跑中，请稍后...')
      repeatPipelineStatus('retry')
    } catch (error) {
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e: any) => {
    setValue(e.target.value);
  };

  const onChangeCheckbox = (e: any) => {
    setFollowUpStage(e.target.checked);
  };

  const onCheckboxChange = (checkList) => {
    if (checkList.length < 1) {
      message.error('请至少选择一个')
      return
    }
    setIndeterminate(!!checkList.length && checkList.length < recordData.length);
    setCheckedList(checkList)
  }

  const onCheckAllChange = (e) => {
    const { checked } = e.target
    if (!checked && !indeterminate) {
      message.error('无法全部取消，至少选择一个')
      return
    }
    setCheckedList(recordData.map(item => item.logId));
    setIndeterminate(false);
    setCheckAll(true);
  };

  const renderOptions = () => {
    if (from === 'job') {
      // return <Radio.Group value={1}>
      //   <Space direction="vertical">
      //     <Radio value={1}>重新运行当前 Job</Radio>
      //   </Space>
      // </Radio.Group>
      return <>
        {/* <Radio.Group value={1}>
          <Space direction="vertical">
            <Radio value={1}>重新运行当前 Job</Radio>
          </Space>
        </Radio.Group> */}

        <div style={{ marginTop: '5px' }}>
          <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
            全选
          </Checkbox>
          <div style={{ textIndent: '10px' }}>
            <CheckboxGroup value={checkedList} onChange={onCheckboxChange}>
              {
                recordData.map(item => (
                  <div>
                    <Checkbox value={item.logId}>{item.name}</Checkbox>
                  </div>
                ))
              }
            </CheckboxGroup >
          </div>
        </div>
      </>
    }
    return <Radio.Group onChange={onChange} value={value}>
      <Space direction="vertical">
        <Radio value={1}>重新运行 Stage 下所有 Job</Radio>
        <Radio value={2}>重新运行 Stage 下所有失败 Job</Radio>
      </Space>
    </Radio.Group>
  }

  return (
    <div ref={variableRef}>
      <Modal title="" width={400} className="device-manage-Load-modal" centered destroyOnClose={true} footer={[
        <div className='flex-space-between'>
          <div style={{ marginLeft: '8px' }}>
            <Checkbox onChange={onChangeCheckbox} defaultChecked={true} value={followUpStage}>重试后，拉起后续 Stage</Checkbox>
          </div>
          <div>
            <Button key="back" onClick={onCancel}>
              取消
            </Button>
            <Button key="submit" type="primary" disabled={!checkPipilineAuth('Trigger')} loading={loading} onClick={handleOk}>
              确定
            </Button>
          </div>
        </div>
      ]} open={modal} onCancel={onCancel}>
        <div className='flow-retry-container'>
          {
            renderOptions()
          }
        </div>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
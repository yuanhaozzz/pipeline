import { useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, message, Radio, Checkbox, Tooltip } from 'antd'
import { editApi, stopApi } from '../detail/service'
import { removeApi } from '../../service'
import { QuestionCircleOutlined } from '@ant-design/icons'

import './style.less'
const { TextArea } = Input;

function LoadModal(props: any, ref: any) {
  const { update } = props

  const [switchLoading, setSwitchLoading] = useState(false)

  const [modal, setModal] = useState(false)
  const [checked, setChecked] = useState(false)
  const [record, setRecord] = useState<any>({})

  const variableRef = useRef(null)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any) => {
    setRecord(record)
    setModal(true)
  }

  const onCancel = () => {
    setModal(false)
    form.resetFields()
  }

  const summit = async () => {
    const values = await form.validateFields()

    try {
      setSwitchLoading(true)
      await removeApi(record.id, values)
      update()
      message.success('删除成功')
      onCancel()
    } catch (error) {

    } finally {
      setSwitchLoading(false)
    }

  }

  return (
    <div ref={variableRef}>
      <Modal className="flow-nodeManagement-switch-container" title={'删除'} centered destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Button type="primary" onClick={summit} loading={switchLoading}>确定</Button>,
      ]} open={modal} onCancel={onCancel}>
        <Form form={form} name="control-hooks" layout="vertical" style={{ marginTop: '-10px' }}>
          {
            <Form.Item name="force_stop" label='' style={{ marginBottom: '12px' }} valuePropName='checked' >
              <div className='flex-start'>
                <Form.Item name="force_stop" noStyle initialValue={false} valuePropName='checked'>
                  <Checkbox >强制下线</Checkbox>
                </Form.Item>
                <Tooltip overlayClassName="flow-node-management-switch-tooltip" title="强制下线 Runner 服务，并停止运行中的任务后删除该节点">
                  <QuestionCircleOutlined style={{ fontSize: '14px', cursor: 'help' }} />
                </Tooltip>
              </div>
            </Form.Item>
          }
        </Form>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
import { useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, message, Radio, Checkbox, Tooltip } from 'antd'
import { editApi, stopApi } from '../detail/service'
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

  const open = (checked, record: any) => {
    setChecked(checked)
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
      record.enable = checked
      record.admin_users = record.admin_users_info?.map(item => item.user_id) || []
      record.status_change_reason = values.status_change_reason || ''
      const params = checked ? record : {
        status_change_reason: record.status_change_reason,
        force_stop: values.force_stop
      }

      const api = checked ? editApi : stopApi
      await api(params, record.id)
      update()
      message.success(checked ? '已启用' : '已停用')
      onCancel()
    } catch (error) {

    } finally {
      setSwitchLoading(false)
    }

  }

  return (
    <div ref={variableRef}>
      <Modal className="flow-nodeManagement-switch-container" title={''} centered destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Button type="primary" onClick={summit} loading={switchLoading}>确定</Button>,
      ]} open={modal} onCancel={onCancel}>
        <Form form={form} name="control-hooks" layout="vertical">
          {
            !checked && <Form.Item name="force_stop" label='' style={{ marginBottom: '12px' }} valuePropName='checked' >
              {/* <Radio.Group  >
                <Radio value={false}>友好下线</Radio>
                <Radio value={true}>强制下线</Radio>
              </Radio.Group> */}
              <div className='flex-start'>
                <Form.Item name="force_stop" noStyle initialValue={false} valuePropName='checked'>
                  <Checkbox >强制下线</Checkbox>
                </Form.Item>
                <Tooltip overlayClassName="flow-node-management-switch-tooltip" title="强制下线 Runner 服务，并停止运行中的任务">
                  <QuestionCircleOutlined style={{ fontSize: '14px', cursor: 'help' }} />
                </Tooltip>
              </div>
            </Form.Item>
          }

          <Form.Item name="status_change_reason" label={`${checked ? '启用' : '停用'}原因`} >
            <TextArea placeholder={`请输入${checked ? '启用' : '停用'}原因`} autoSize={{ minRows: 2 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
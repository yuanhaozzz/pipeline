import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Modal, Input, Form, Button, Select, message, Radio } from 'antd'
import { EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons'

import { addApi, editApi, getDetailApi } from './service'
import { useModel } from 'umi';
const { TextArea } = Input;

export interface IAppProps {
  update(): any
}

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
function LoadModal(props: IAppProps, ref: any) {
  const { update } = props

  const [modal, setModal] = useState(false)

  const variableRef = useRef<any>(null)

  const [form] = Form.useForm();

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = async (record: any) => {
    setModal(true)
    form.resetFields()
    variableRef.current.recordData = record
    if (record) {
      const { uuid } = record
      const { data } = await getDetailApi(uuid)
      // 赋值
      form.setFieldsValue(data)
      variableRef.current.recordData = { id: uuid, ...data }
    } else {
      form.setFieldValue('is_public', true)
    }
  }

  const onCancel = () => {
    setModal(false)
  }

  const submit = async () => {
    const { recordData } = variableRef.current
    try {
      const values = await form.validateFields()
      const api = recordData ? editApi : addApi
      await api(values, recordData?.id)
      onCancel()
      message.success(`${recordData ? '编辑' : '添加'}成功`)
      update()
    } catch (error) {
      console.log(error);
    }
  }

  const varValidator = (info, value, from) => {
    if (from === 'alias' && !value) {
      return Promise.resolve()
    }
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!regex.test(value)) {
      return Promise.reject('以字母或下划线开头，后面可以填加字母、数字或下划线')
    }
    return Promise.resolve()
  }


  return (
    <div ref={variableRef}>
      <Modal title="用户凭证填写" width={800} className="device-manage-Load-modal" centered destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Button type='primary' onClick={() => submit()}>提交</Button>
      ]} open={modal} onCancel={onCancel}>
        <Form {...layout} form={form} name="control-hooks" >
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '' }, { validator: varValidator }]}>
            <Input placeholder='以字母或下划线开头，后面可以填加字母、数字或下划线' max={40} />
          </Form.Item>

          <Form.Item name="alias" label="别名" tooltip="在流水线中通过变量引用凭证时，仅支持通过名称引用" rules={[{ required: false, message: '' }, { validator: (info, value) => varValidator(info, value, 'alias') }]}>
            <Input placeholder='以字母或下划线开头，后面可以填加字母、数字或下划线' max={40} />
          </Form.Item>

          <Form.Item name="type" label="类型" initialValue={'token'} rules={[{ required: true }]}>
            <Select
              showSearch
              optionFilterProp="children"
              placeholder="请选择类型"
              filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
              options={[
                {
                  label: 'token', value: 'token'
                },
                {
                  label: 'ssh', value: 'ssh'
                },
              ]}
              onChange={(v) => {
                form.setFieldValue('credential', null)
                if (v === 'ssh') {
                  form.setFieldValue('username', 'root')
                } else {
                  form.setFieldValue('username', currentUser.username)
                }
              }}
            />
          </Form.Item>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: ' 用户名不能为空' }]} initialValue={currentUser.username}>
            <Input placeholder='请输入用户名' />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {() => {
              const type = form.getFieldValue('type')
              switch (type) {
                case 'token':
                  return <>
                    <Form.Item name="credential" label="private token" rules={[{ required: true, message: ' token 不能为空' }]}>
                      <Input.Password autoComplete="off" placeholder='请输入 token' iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
                    </Form.Item>
                  </>
                case 'ssh':
                  return <Form.Item name="credential" label="ssh 私钥 token" rules={[{ required: true, message: ' 请输入 SSH Key 对应的私钥，以-----BEGIN (RSA|OPENSSH) PRIVATE KEY-----开头，-----END (RSA|OPENSSH) PRIVATE KEY-----结束' }]}>
                    <TextArea rows={4} placeholder='请输入 SSH Key 对应的私钥，以-----BEGIN (RSA|OPENSSH) PRIVATE KEY-----开头，-----END (RSA|OPENSSH) PRIVATE KEY-----结束' />
                  </Form.Item>
              }
            }}
          </Form.Item>
          <Form.Item name="is_public" label="是否公开" >
            <Radio.Group >
              <Radio value={true}>是</Radio>
              <Radio value={false}>否</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder='请输入描述' />
          </Form.Item>
        </Form>
      </Modal>
    </div>

  );
}


export default forwardRef(LoadModal)
import React, { forwardRef, useImperativeHandle, useEffect, useState, useRef } from 'react';
import { Button, Form, Input, Select, message, DatePicker, Radio, Checkbox, Segmented } from 'antd';


import { copyText, getUrlParams, isUserAuth } from '@/utils'
import './style.less'
import { useReducer } from 'react';

import FormConfig from '@/components/FormConfig'
import EditorComponent from '@/components/Editor';
import { useModel } from "umi";

const { Option } = Select;
const { TextArea } = Input;
const layout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 18 },
};


const Project = (props: any, ref: any) => {
  const { data, type } = props

  const [, forceUpdate] = useReducer(state => state + 1, 0)
  const [config, setConfig] = useState({})


  const { pipelineId, from } = getUrlParams()
  const [form] = Form.useForm();
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  useImperativeHandle(ref, () => ({
    getFormValue
  }))

  useEffect(() => {
    initForm()
  }, [data])

  const initForm = () => {
    const formKey = ['description', 'label', 'timer_info', 'hookURL', 'repo_name']
    form.setFieldValue('name', data['name'])
    form.setFieldValue('from', 0)
    form.setFieldValue('repo_url', data.setting['git_info']['repo_url'])
    form.setFieldValue('is_public', data.setting['is_public'])

    formKey.forEach((key: any) => {
      form.setFieldValue(key, data.setting[key])
    })

    // 单独判断流程
    const path = location.pathname
    if (path.includes('/workflowService') && from === 'add') {
      form.setFieldValue('label', '流程服务')
    }

    setConfig({ ...config, is_public: data['is_public'] })
  }

  const getFormValue = async () => {
    const value = await form.validateFields()
    return value
  }

  const onFinish = (values: any) => {
    console.log(values);
  };

  const isWorkflowService = () => {
    const path = location.pathname
    if (path.includes('/workflowService') && from === 'add') {
      return true
    }
  }

  return (
    <div className='flex-center modify-form-base-info'>
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} className='base-info-form'
        disabled={!isUserAuth(currentUser, data?.creator_user_id) || type !== 1}
      >
        <Form.Item name="from" label=""></Form.Item>
        <Form.Item name="name" label="流水线名称" rules={[{ required: true, message: '请输入流水线名称' }]}>
          <Input placeholder='请输入流水线名称' maxLength={100} />
        </Form.Item>
        <Form.Item name="description" label="描述" className='flowLine-desc-editor'>
          {/* <TextArea rows={4} placeholder='请输入描述' /> */}
          <EditorComponent title='' content={data.setting?.description} hideTitle={true} isSimple={true} disabled={!isUserAuth(currentUser, data?.creator_user_id) || type !== 1} />
        </Form.Item>
        <Form.Item name="label" label="标签" >
          <Select
            allowClear
            placeholder="请选择标签"
            disabled={isWorkflowService()}
            options={[
              {
                value: '流程服务',
                label: '流程服务',
              },
              {
                value: '质量门禁',
                label: '质量门禁',
              },
            ]}
          />
        </Form.Item>

        <Form.Item name="is_public" label="可见范围" valuePropName="checked" >
          <Checkbox>所有人可见</Checkbox>
        </Form.Item>
      </Form>
    </div>
  );
};

export default forwardRef(Project);
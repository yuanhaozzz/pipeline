import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Button, Form, Input, Select, message, DatePicker, Radio, Checkbox, Segmented } from 'antd';

import { useModel } from "umi";
import './style.less'

import { dateOptions } from './data'
import { isUserAuth, copyText } from '@/utils'


import TriggerType from './component/triggerType'

const { Option } = Select;
const { TextArea } = Input;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

const Project = (props: any, ref: any) => {
  const { data, type } = props
  const [form] = Form.useForm();

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  const triggerTypeRef = useRef({})

  useImperativeHandle(ref, () => ({
    getFormValue
  }))

  useEffect(() => {
    initForm()
  }, [data])

  const initForm = () => {
    const formKey = ['pipeline_env']
    form.setFieldValue('run_lock_type', data['run_lock_type'])
    form.setFieldValue('from', 1)
    form.setFieldValue('enabled', data.setting['enabled'])

    form.setFieldValue('exclude_branch', data.setting['exclude_branch'])
    if (data.setting?.extra_data?.isExpandAll !== undefined) {
      form.setFieldValue('isExpandAll', data.setting?.extra_data?.isExpandAll)
    }

    form.setFieldValue('history_limit', data.setting['history_limit'] || 90)

    formKey.forEach((key: any) => {
      form.setFieldValue(key, data.setting[key])
    })

    triggerTypeRef.current.initForm()
  }

  const getFormValue = async () => {
    const value = await form.validateFields()
    const triggerType = await triggerTypeRef.current.getFormValue()
    return { ...value, trigger_list: triggerType.trigger }
  }

  const onFinish = (values: any) => {
    console.log(values);
  };

  // const onChange = (e: any) => {
  //   const { value, name } = e.target
  //   form.setFieldValue(name, value)
  // };

  // const handleChange = (v: any, current: any) => {
  //   const { label, value } = current
  //   form.setFieldValue(label, value)
  // }




  return (
    <div className='flex-center modify-form-run-config'>
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} className='run-config-form'
        disabled={!isUserAuth(currentUser, data?.creator_user_id) || type !== 1}
      >
        <Form.Item name="from" label="" ></Form.Item>

        <Form.Item name="enabled" label="是否启用流水线" rules={[{ required: true, message: '是否并行' }]} >
          <Radio.Group disabled>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="run_lock_type" label="是否并行"  >
          <Radio.Group name="run_lock_type">
            <Radio value='MULTIPLE'>是</Radio>
            <Radio value='SINGLE'>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="isExpandAll" label="默认展开所有 Task" initialValue={true} colon={true}>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="history_limit" label="运行记录保存期限" >
          <Select
            options={dateOptions}
            style={{ width: '80px' }}
          />
        </Form.Item>
        <TriggerType form={form} type={type} data={data} disabled={!isUserAuth(currentUser, data?.creator_user_id) || type !== 1} ref={triggerTypeRef} />

        {/* <Form.Item name="pipeline_env" label="运行环境" rules={[{ required: true, message: '请选择运行环境' }]}>
          <Select
            placeholder="请选择环境"
            options={[
              {
                value: 'PERSONAL',
                label: '个人环境',
              },
              {
                value: 'TEST',
                label: '测试环境',
              },
              {
                value: 'RELEASE',
                label: '发布环境',
              },
            ]}
          />
        </Form.Item> */}
        {/* <Form.Item name="timeout" label="运行超时时间" getValueFromEvent={event => {
          return parseInt(event.target.value, 10);
        }} rules={[{ required: false, message: '' }, { validator: (info, value) => validator['timeout'](info, value, false) }]}>
          <Input min={1} placeholder='默认无超时' type='number' suffix={'分钟'} />
        </Form.Item> */}
      </Form>
    </div >
  );
};

export default forwardRef(Project);
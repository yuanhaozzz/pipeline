import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Button, Form, Radio, Select, Checkbox, Input, Spin, Empty } from 'antd';

import { useModel } from "umi";
import { LoadingOutlined } from '@ant-design/icons';

import './style.less'
import { validator } from '../../../../../flow/component/configModal/data'
import FindUser from '@/components/findUser'
import debounce from 'lodash/debounce';
import { getUserListApi } from './service'
import { copyText, getUrlParams, isUserAuth } from '@/utils'

const { Option } = Select;
const { TextArea } = Input;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const Project = (props: any, ref: any) => {
  const { data, type } = props
  const [form] = Form.useForm();

  const [userList, setUserList] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  useImperativeHandle(ref, () => ({
    getFormValue,
    setFormValue
  }))

  useEffect(() => {
    initSelectOptions()
  }, [])

  const initForm = () => {
    // 成功
    // if (tabIndex === 0) {
    //   form.setFieldValue('notify', false)
    // } else {
    //   form.setFieldValue('notify', true)
    // }
    // const formKey = ['pipeline_env', 'timeout', 'enabled']
    // form.setFieldValue('run_lock_type', data['run_lock_type'])
    // form.setFieldValue('from', 2)
    // formKey.forEach((key: any) => {
    //   form.setFieldValue(key, data.setting[key])
    // })
  }
  const setFormValue = (values) => {
    form.setFieldValue('from', 2)
    // form.setFieldValue('content', 'sunny.gong')
    // form.setFieldValue('method', [])
    for (const key in values) {
      const value = values[key]
      form.setFieldValue(key, value)
    }
  }

  const getFormValue = () => {
    return form.validateFields()
  }

  const onFinish = (values: any) => {
    console.log(values);
  };


  const userChange = (v) => {
    form.setFieldValue('receiver', v)
  }


  const initSelectOptions = async (value = '') => {
    setValue(value)
    // if (!value) {
    //   setUserList([])
    //   return
    // }
    setLoading(true)
    try {
      const data = await getUserListApi({ username: value })
      setUserList(data.map(item => {
        item.value = item.user_id
        item.label = item.username
        return item
      }))

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }
  const debounceFetcher = debounce(initSelectOptions, 500);

  const renderNotFoundContent = () => {
    if (loading) {
      return <Spin indicator={<LoadingOutlined />} />
    }
    if (value && userList.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }
    return '可输入关键字搜索'
  }

  const teamChange = (value: Array<any>) => {
    if (!value.length) return;
    form.validateFields(['extra_email_group'])
  };

  const vaildShare = (list = []) => {
    if (list.length <= 0) {
      return true
    }
    for (let i = 0; i < list.length; i++) {
      const value = list[i]
      if (!value.includes('@')) {
        return false
      }
      const suffix = value.split('@')[1]
      if (suffix !== 'enflame-tech.com') {
        return false
      }
    }
    return true
  }

  const validatorShare = (info, value) => {
    if (!vaildShare(value)) {
      return Promise.reject('请输入正确的邮件格式，且以 @enflame-tech.com 结尾')
    }
    return Promise.resolve()
  }

  return (
    <div className='flex-center modify-form-run-config'>
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish} className='run-config-form'
        disabled={!isUserAuth(currentUser, data?.creator_user_id) || type !== 1}
      >
        <Form.Item name="from" label="" ></Form.Item>
        <Form.Item name="notifyIndex" label="" noStyle></Form.Item>
        {/* <Form.Item name="method" label="" noStyle ></Form.Item> */}
        {/* <Form.Item name="ss" label="流水线状态通知" initialValue={'success'} >
          <Checkbox.Group >
            <Checkbox value="success" >
              构建成功时
            </Checkbox>
            <Checkbox value="failed" >
              构建失败时
            </Checkbox>
            <Checkbox value="canceled" >
              构建取消时
            </Checkbox>
          </Checkbox.Group>
        </Form.Item> */}
        <Form.Item name="method" label="通知方式" required >
          <Checkbox.Group >
            <Checkbox value="wecom" >
              企业微信通知
            </Checkbox>
            <Checkbox value="email" >
              邮件
            </Checkbox>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item name="receiver" label="附加通知人">
          <Select
            allowClear
            mode='multiple'
            placeholder="请选择附加通知人"
            showSearch
            onChange={userChange}
            optionFilterProp="children"
            filterOption={false}
            className='multiple-select-input-minWidth'
            onSearch={(value) => debounceFetcher(value)}
            notFoundContent={renderNotFoundContent()}
          // {...selectProps}
          >
            {
              userList?.map(item => (
                <Option value={item.value} label={item.label}>
                  <div className="demo-option-label-item" title={`${item.label} ${item.user_id}`}>
                    <span role="img" aria-label="China">
                      {item.label}
                    </span>
                    <span>&nbsp;&nbsp;&nbsp;{item.user_id}</span>
                  </div>
                </Option>
              ))
            }
          </Select>
          {/* <FindUser isInitLoad={true} selectProps={{ mode: 'multiple', placeholder: '请选择附加通知人', onChange: userChange }} /> */}
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {
            () => {
              const method = form.getFieldValue('method') || []
              console.log(method)
              if (!method.includes('email')) {
                return <></>
              }
              return <>
                <Form.Item
                  name="extra_email_group"
                  label="抄送"
                  rules={[{ validator: validatorShare }]}
                >
                  <Select
                    mode="tags"
                    allowClear
                    placeholder='Outlook 邮箱地址，回车后输入下一个'
                    options={[]}
                    onChange={teamChange}
                    className='multiple-select-input-minWidth'
                    onFocus={() => console.log(12)}
                    open={false}
                  />
                </Form.Item>
                <Form.Item
                  name="email_title"
                  label="邮件标题"
                  initialValue={'【效能平台】您的流水线（$pipeline_name）运行结束'}
                >
                  <Input placeholder='请输入邮件标题' />
                </Form.Item>
              </>
            }
          }
        </Form.Item>


        <Form.Item name="content" label="通知内容（Markdown）" >
          <TextArea
            placeholder="请输入"
            autoSize={{ minRows: 3 }}
          />
        </Form.Item>

        {/* <Form.Item name="timeout" label="运行超时时间" getValueFromEvent={event => {
          return parseInt(event.target.value, 10);
        }} rules={[{ required: true, message: '' }, { validator: validator['timeout'] }]}>
          <Input min={1} placeholder='默认60分钟' type='number' suffix={'分钟'} />
        </Form.Item> */}
      </Form>
    </div >
  );
};

export default forwardRef(Project);
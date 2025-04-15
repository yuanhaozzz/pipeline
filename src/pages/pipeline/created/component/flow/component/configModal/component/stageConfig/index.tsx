import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Form, Input, Select, Checkbox } from 'antd'
import { UpOutlined } from '@ant-design/icons'

import './style.less'
import { send } from './service'
import KeyValue from '@/components/formComponent/addKeyValue'



function Project(props: any, ref: any) {
  const { config, type } = props

  const [control, setControl] = useState(true)
  const keyValueRef = useRef<any>(null)

  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    validateFields
  }))

  useEffect(() => {

    initValue()
  }, [])

  const initValue = () => {
    form.setFieldValue('active', config.active)
    form.setFieldValue('name', config.name)
    form.setFieldValue('plugin', config.plugin || null)
    form.setFieldValue('run_condition', config.run_condition)
    form.setFieldValue('consumption', config.consumption)
    // setTimeout(() => {
    //   if (config['run_cond_custom_var']) {
    //     keyValueRef.current.setValue(config['run_cond_custom_var'])
    //   }
    // }, 0);
  }



  const validateFields = async () => {
    try {
      const values = await form.validateFields()
      // 写入表单数据
      Object.keys(values).forEach(key => {
        if (key.includes('0.')) {
          delete values[key]
          return
        }
        config[key] = values[key]
        // if (key === 'run_cond_custom_var') {
        //   config['run_cond_custom_var'] = keyValueRef.current.getValue().map(item => {
        //     return {
        //       key: item.key,
        //       value: item.value
        //     }
        //   })
        // }
      })



      // 解决表单错误标识
      config.vaildFormError = false
    } catch (error) {
      config.vaildFormError = true
    }
  }

  const onChange = (data: any) => {
    // Object.keys(data).forEach(key => {
    //   config[key] = data[key]
    // })
  }

  const keyValueChange = (configList) => {
    config['run_cond_custom_var'] = configList
  }

  return (
    <Form layout="vertical" form={form} name="control-hooks" disabled={type !== 1} onValuesChange={onChange} className='flow-stage-config-container'>
      <Form.Item name="name" label="Stage 名称" rules={[{ required: true, message: '请输入名称' }]} initialValue={config.name}>
        <Input value={config.name} maxLength={50} placeholder='长度为50个字符' />
      </Form.Item>
      {/* <Form.Item name="consumption" label="" initialValue={false} valuePropName='checked'>
        <Checkbox>展示消费信息</Checkbox>
      </Form.Item> */}

      {/* ------------流程控制---------------- */}
      <div className='control-box'>
        <div className='control flex-space-between' onClick={() => setControl(!control)}>
          流程控制选项
          <UpOutlined className={`control-arrow ${!control && 'control-arrow-action'}`} />
        </div>
        {
          <div className='form-control' style={{ display: control ? 'block' : 'none' }}>
            <Form.Item name="active" valuePropName="checked" colon={false} >
              <Checkbox>启用本 Stage</Checkbox>
            </Form.Item>

            {/* <Form.Item name="run_condition" label="何时运行本 Stage" initialValue={'pre_task_success'}>
              <Select
                options={[

                  {
                    value: 'pre_task_success',
                    label: '前面任务没有失败或者取消时',
                  },
                  {
                    value: 'pre_task_failed_even_cancel',
                    label: '总是运行',
                  },
                  {
                    value: 'pre_task_failed_but_cancel',
                    label: '前置 Job 未被取消时',
                  },
                  {
                    value: 'custom_variable_match',
                    label: '自定义变量全部满足时运行',
                  },
                  {
                    value: 'custom_variable_match_not_run',
                    label: '自定义变量全部满足时不运行',
                  },
                ]}
              />
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {
                () => {
                  const runCondition = form.getFieldValue('run_condition')
                  if (runCondition !== 'custom_variable_match' && runCondition !== 'custom_variable_match_not_run') {
                    return <></>
                  }
                  return <KeyValue formCOnfig={{ label: '变量', name: 'run_cond_custom_var' }} ref={keyValueRef} from={type} form={form} type={type} value='value' keys='key' keyValueChange={keyValueChange} />
                }
              }
            </Form.Item> */}
          </div>
        }
      </div>

    </Form>
  );
}

export default forwardRef(Project)
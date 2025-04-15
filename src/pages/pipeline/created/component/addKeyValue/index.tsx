import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Input, Button, Form } from 'antd'
import { MinusOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons'

import './style.less'
import { send } from './service'

interface Props {
  from: any
  form: any
  type: any
  keys?: string
  value?: string
}

function Project(props: Props, ref: any) {
  let { from, keys = 'key', value = 'value', form, type } = props
  const [configList, setConfigList] = useState<any>([])
  const [custom_env, setEnv] = useState(true)


  useImperativeHandle(ref, () => ({
    getValue,
    setValue
  }))

  const getValue = () => {
    return configList
  }

  const setValue = (values: any[]) => {
    setConfigList([...values])
  }

  const onchange = (index: number, key: string, value: string) => {
    configList[index][key] = value
    setConfigList([...configList])
  }

  const add = () => {
    configList.push({ [keys]: '', [value]: '' })
    setConfigList([...configList])
    form.validateFields(['custom_env'])
  }

  const reduce = (index: number) => {
    configList.splice(index, 1)
    setConfigList([...configList])
    form.validateFields(['custom_env'])

  }


  const validateEnv = () => {
    const values: any[] = getValue()
    for (let i = 0; i < values.length; i++) {
      const item = values[i]
      if (!item.key) {
        return Promise.reject(new Error('请填写 key'))
      }
      if (!item.value) {
        return Promise.reject(new Error('请填写 value'))
      }
    }
    return Promise.resolve()
  }

  if (type !== 1 && configList.length <= 0) {
    return <></>
  }

  return (
    <Form.Item label="" name="custom_env" rules={[{ required: true, message: '' }, { validator: validateEnv }]} initialValue={'1'} className='task-config-AddKeyValue-container'>
      <div className='control-box'>
        <div className='control flex-space-between' onClick={() => setEnv(!custom_env)}>
          输入环境变量
          <UpOutlined className={`control-arrow ${!custom_env && 'control-arrow-action'}`} />
        </div>
        <div className='form-control' style={{ display: custom_env ? 'block' : 'none' }}>
          <ul className='flow-add-key-value-container'>
            {
              configList.map((item: any, index: number) => (
                <li className='item flex-space-around' key={index}>
                  <Input prefix={`${keys}：`} style={{ width: '45%' }} value={item[keys]} onChange={(e) => onchange(index, keys, e.target.value)} />
                  <Input prefix={`${value}：`} style={{ width: '45%' }} value={item[value]} onChange={(e) => onchange(index, value, e.target.value)} />
                  {
                    from === 1 && <>
                      {/* 减 */}
                      {/* <Button className='minus flex-center' onClick={() => reduce(index)} icon={<MinusOutlined style={{ fontSize: '12px' }} />} size='small' onClick={() => reduce(index)} shape="circle"></Button> */}
                      <div className='minus flex-center' onClick={() => reduce(index)}><MinusOutlined /></div>
                    </>
                  }

                </li>
              ))
            }
            {/* 加 */}
            {
              from === 1 && <div className='plus flex-center' onClick={() => add()}>
                {/* <PlusOutlined className='plus-icon' /> */}
                {/* <Button icon={<PlusOutlined />} size='small' shape="circle"></Button> */}
                <PlusOutlined />
              </div>
            }
          </ul>
        </div>
      </div>
    </Form.Item>

  );
}

export default forwardRef(Project)
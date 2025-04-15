import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Input, Button, Form } from 'antd'
import { MinusOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons'

import './style.less'
import { send } from './service'

interface Props {
  form: any
  type: any
  keys?: string
  value?: string
}

function Project(props: Props, ref: any) {
  let { keys = 'name', value = 'concurrent', form, type } = props
  const [configList, setConfigList] = useState<any>([])


  useImperativeHandle(ref, () => ({
    getValue,
    setValue
  }))

  const getValue = () => {
    return configList
  }

  const setValue = (values: any[]) => {
    setConfigList([...values].map(item => {
      item.id = Math.random()
      return item
    }))
  }

  const onchange = (index: number, key: string, value: string) => {
    configList[index][key] = value
    setConfigList([...configList])
    form.validateFields()
  }

  const add = () => {
    configList.push({ [keys]: '', [value]: '', id: Math.random() })
    setConfigList([...configList])
    form.validateFields(['custom_env'])
  }

  const reduce = (index: number) => {
    configList.splice(index, 1)
    setConfigList([...configList])
    form.validateFields(['custom_env'])

  }

  const validatorName = (info, value = '') => {
    if (!value.trim()) {
      return Promise.reject('请输入')
    }

    const reg = /^[a-zA-Z0-9_]+$/
    if (!reg.test(value)) {
      return Promise.reject('仅支持字母、数字、下划线')
    }

    const filterValue = configList.map(item => {
      item.label = form.getFieldValue(item.id)
      return item
    })

    const formValue = findDuplicate(filterValue)
    if (formValue) {
      // 找出重复的key，只让重复的表单报错
      const vaild = filterValue.filter(item => item.label === formValue)
      for (let i = 0; i < vaild.length; i++) {
        const key = vaild[i].id + ''

        if (info.field === key) {
          return Promise.reject('名称重复')
        }
      }
    }
    return Promise.resolve()
  }

  function findDuplicate(arr) {
    const map = new Map();
    for (let i = 0; i < arr.length; i++) {
      const str = arr[i].label;
      if (map.has(str)) {
        return str;
      } else {
        map.set(str, true);
      }
    }
    return null;
  }

  const validatorConcurrent = (info, value) => {
    if (!value) {
      return Promise.resolve()
    }
    const reg = /^[1-9]\d*$/
    if (!reg.test(value)) {
      return Promise.reject(new Error('请填写大于0的整数'))
    }

    if (value > 2147483647) {
      return Promise.reject(new Error('不超过2147483647'))
    }

    return Promise.resolve()
  }

  const validatorTag = () => {
    if (configList.length <= 0) {
      return Promise.reject('请至少填写一个标签')
    }
    return Promise.resolve()
  }


  return (
    <Form.Item label="标签" name="keyValue" rules={[{ validator: validatorTag }]} className='task-config-AddKeyValue-container' required style={{ margin: '0' }}>
      <div className='control-box'>
        <div className='form-control'>
          <ul className='flow-nodeManagement-key-value-container'>
            {
              configList.map((item: any, index: number) => (
                // style={{ alignItems: 'flex-start' }}
                <li className='item flex-space-around' key={index} >
                  <Form.Item name={`${item.id}`} style={{ width: '95%', margin: '0' }} rules={[{ validator: validatorName }]} initialValue={item[keys]}>
                    <Input prefix={`标签名：`} value={item[keys]} onChange={(e) => onchange(index, keys, e.target.value)} placeholder='50个字符内' maxLength={50} />
                  </Form.Item>
                  {/* <Form.Item name={`${item.id}-concurrent`} style={{ width: '45%', margin: '0' }} rules={[{ validator: validatorConcurrent }]} initialValue={item[value]}>
                    <Input prefix={`并发数：`} value={item[value]} onChange={(e) => onchange(index, value, e.target.value)} placeholder='不填默认是0' />
                  </Form.Item> */}

                  {/* 减 */}
                  <div className='minus flex-center' onClick={() => reduce(index)}><MinusOutlined /></div>
                </li>
              ))
            }
            <div className='flex-center' style={{ margin: '10px 0' }}>
              <div className='plus flex-center' onClick={() => add()}>
                <PlusOutlined />
              </div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          </ul>
        </div>
      </div>
    </Form.Item>

  );
}

export default forwardRef(Project)
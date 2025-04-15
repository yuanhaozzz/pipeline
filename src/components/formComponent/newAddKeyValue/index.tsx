import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { Input, Button, Form } from 'antd'
import { MinusOutlined, PlusOutlined, UpOutlined } from '@ant-design/icons'

import './style.less'
import { send } from './service'

interface Props {
  form: any
  required: boolean
  isEdit: boolean
  formConfig: any
  keys?: string
  value?: string
  rightConfig?: any
  prefixLeft?: string
  prefixRight?: string
  keyValueChange(configList: any): any
}

function Project(props: Props, ref: any) {
  let { keys = 'name', value, form, isEdit = true, prefixLeft = 'key:', prefixRight = 'value:', formConfig = {}, keyValueChange = () => { }, rightConfig = {}, required = true } = props
  const [configList, setConfigList] = useState<any>([])

  const variableRef = useRef(null)

  useImperativeHandle(ref, () => ({
    getValue,
    setValue
  }))

  useEffect(() => {
    if (variableRef.current.initLoad) {
      keyValueChange(configList)
    }
    variableRef.current.initLoad = true
  }, [configList])

  const getValue = () => {
    return configList.map(item => {
      const v = {
        [keys]: item[keys],
      }
      if (value) {
        v[value] = item[value]
      }
      return v
    })
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
    form.validateFields()
  }

  const reduce = (index: number) => {
    configList.splice(index, 1)
    setConfigList([...configList])
    form.validateFields()

  }

  const validatorName = (info, value = '') => {
    if (!value.trim()) {
      return Promise.reject('请输入')
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

  const validatorTag = () => {
    if (!required) {
      return Promise.resolve()
    }
    if (configList.length <= 0) {
      return Promise.reject('请至少填写一个标签')
    }
    return Promise.resolve()
  }

  return (
    <Form.Item rules={[{ required, message: '' }, { validator: validatorTag }]} {...formConfig} className='common-form-keyVdalue-container'>
      <div className='control-box' ref={variableRef}>
        <div className='form-control'>
          <ul className='common-form-flow-key-value-container'>
            {
              configList.map((item: any, index: number) => (
                // style={{ alignItems: 'flex-start' }}
                <li className='item flex-space-around' key={index} style={{ alignItems: 'flex-start' }} >
                  <Form.Item name={`${item.id}`} style={{ width: value ? '45%' : '95%', margin: '0' }} rules={[{ validator: validatorName }]} initialValue={item[keys]}>
                    <Input prefix={`${prefixLeft}`} value={item[keys]} onChange={(e) => onchange(index, keys, e.target.value)} placeholder='' maxLength={50} />
                  </Form.Item>
                  {
                    value && <Form.Item name={`${item.id}-concurrent`} style={{ width: '45%', margin: '0' }} initialValue={item[value]}  {...rightConfig}>
                      <Input prefix={`${prefixRight}`} value={item[value]} onChange={(e) => onchange(index, value, e.target.value)} placeholder='' />
                    </Form.Item>
                  }
                  {/* 减 */}
                  {
                    isEdit && <div className='minus flex-center' onClick={() => reduce(index)}><MinusOutlined /></div>
                  }

                </li>
              ))
            }
            {
              isEdit && <div className='flex-center' style={{ margin: '10px 0' }}>
                <div className='plus flex-center' onClick={() => add()}>
                  <PlusOutlined />
                </div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
            }

          </ul>
        </div>
      </div>
    </Form.Item>

  );
}

export default forwardRef(Project)
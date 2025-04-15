import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Input, Button, Form } from 'antd'
import { MinusOutlined, PlusOutlined, UpOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'

import './style.less'
import { send } from './service'

interface Props {
  from: any
  form: any
  type: any
  keys?: string
  value?: string
  outVariables: any[]
}

function Project(props: Props, ref: any) {
  let { from, keys = 'key', value = 'value', form, type, outVariables } = props
  const [configList, setConfigList] = useState<any>([])
  const [custom_env, setEnv] = useState(true)


  useImperativeHandle(ref, () => ({
    getValue,
    setValue
  }))

  useEffect(() => {
    let filterOut = [...outVariables]
    // 处理数据
    filterOut = filterOut.map(item => {
      if (!item.previous_key) {
        item.previous_key = item.key
        item.key = ''
      }
      return item
    })
    setConfigList(filterOut)
  }, [outVariables])

  const getValue = () => {

    return configList.map(item => {
      if (!item.key) {
        item.key = item.previous_key
        item.previous_key = ''
      }
      return item
    })
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


  if (type !== 1 && configList.length <= 0 || configList.length <= 0) {
    return <></>
  }

  const renameChange = (e, item) => {
    item.key = e.target.value
    setConfigList([...configList])
  }

  const save = (item) => {
    item.isEdit = false
    setConfigList([...configList])
  }

  const edit = (item) => {
    // if (!item.previous_key) {
    //   item.previous_key = item.key
    // }
    item.isEdit = true
    setConfigList([...configList])
  }

  const handleRename = (item) => {
    if (!item.previous_key) {
      return ''
    }
    return item.key
  }

  return (
    <Form.Item label="" name="custom_env" className='task-config-addKeyValueOut-container'>
      <div className='control-box'>
        <div className='control flex-space-between' onClick={() => setEnv(!custom_env)}>
          输出环境变量
          <UpOutlined className={`control-arrow ${!custom_env && 'control-arrow-action'}`} />
        </div>
        <div className='form-control' style={{ display: custom_env ? 'block' : 'none' }}>
          <ul className='flow-add-key-value-container'>
            {
              configList.map((item: any, index: number) => (
                <li className='item flex-start' key={index} style={{ flexWrap: 'wrap', wordBreak: 'break-all', alignItems: 'flex-start' }}>
                  <div style={{ width: '50%' }}>
                    <b>key：</b>{item.previous_key}
                  </div>
                  <div style={{ width: '50%' }}>
                    <b>description：</b><span dangerouslySetInnerHTML={{ __html: item[value] }} ></span>
                  </div>
                  <div style={{ width: '50%', marginTop: '5px' }}>
                    <b>scope：</b>{item['scope']}
                  </div>
                  <div style={{ width: '50%' }} className='flex-start'>
                    <b>alias：</b>
                    <div className='item-rename flex-space-between'>
                      {
                        item.isEdit
                          ? <Input placeholder='请输入' value={item.key} onChange={(e) => renameChange(e, item)} style={{ width: '100%' }} />
                          : <div style={{ width: '100%' }} onClick={() => edit(item)}>
                            {item.key}
                          </div>
                      }
                      {
                        item.isEdit
                          ? <>
                            {/* 保存 */}
                            <div className='item-rename-icon' onClick={() => save(item)}><SaveOutlined /></div>
                          </>
                          : <>
                            {/* 编辑 */}
                            <div className='item-rename-icon' onClick={() => edit(item)}><EditOutlined /></div>
                          </>
                      }
                    </div>
                  </div>
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
          </ul >
        </div >
      </div >
    </Form.Item >

  );
}

export default forwardRef(Project)
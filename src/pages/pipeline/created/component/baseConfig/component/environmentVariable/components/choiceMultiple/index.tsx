import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Select } from 'antd'

import './style.less'
import { send } from './service'

const { TextArea } = Input;
function Project(props, ref) {
  const { item, validator, nameBlur, form } = props
  useImperativeHandle(ref, () => ({
    handleChooseSubmitData
  }))

  const handleChooseSubmitData = (chooseData = []) => {

  }

  const handleOptions = () => {
    const from = `${item.id}-choose-options`
    const str = form.getFieldValue(from) || ''
    const options = str.split('\n').map(item => item.trim()).filter(Boolean)
    return [...new Set(options)]
  }

  return (
    <>
      <div className='item-row flex-space-between'>
        <div className='row-left'>
          <Form.Item label="Key" name={item.id + '-name'} rules={[{ required: 'true', message: '' }, { validator }]} initialValue={item.name}>
            <Input placeholder='请输入' onChange={nameBlur} />
          </Form.Item>
        </div>
        <div className='row-right'>
          <Form.Item label="显示名称" name={item.id + '-display_name'} initialValue={item.display_name}>
            <Input placeholder='请输入' />
          </Form.Item>
        </div>
      </div >
      <div className='item-row flex-space-between' style={{ alignItems: 'flex-start' }}>
        <div className='row-left'>
          <Form.Item label="下拉选项" name={`${item.id}-choose-options`} tooltip={<div>
            <div>1. 多个选项用换行符分隔</div>
            <div>2. 重复的选项将只会显示一个</div>
          </div>} style={{ width: '100%' }} rules={[{ required: true, message: '请填写' }]} initialValue={item['choose-options']}>
            <TextArea
              placeholder={`option1\noption2`}
              autoSize={{ minRows: 1, maxRows: 4 }}
              onChange={() => form.setFieldValue(`${item.id}-default`, undefined)}
            />
          </Form.Item>
        </div>
        <div className='row-right'>
          <Form.Item noStyle shouldUpdate>
            {
              () => {

                return <Form.Item label="默认值" name={item.id + '-default'} initialValue={item.default || []} >
                  <Select
                    allowClear
                    showSearch
                    mode='multiple'
                    placeholder="查找选项"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {
                      handleOptions().map(value => (
                        <Option value={value} label={value} title={`${value}`}>
                          <div>{value}</div>
                        </Option>
                      ))
                    }
                  </Select>
                </Form.Item>
              }
            }
          </Form.Item>
        </div>
      </div>

    </>
  );
}

export default forwardRef(Project)
import React, { useEffect } from 'react';
import { Form, Input, Radio } from 'antd'

import './style.less'
import { send } from './service'

function Project(props) {
  const { item, validator, nameBlur } = props

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
      </div>
      <div className='item-row flex-space-between' style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <Form.Item label="默认值" name={item.id + '-default'} initialValue={item.default === undefined ? true : item.default} rules={[{ required: 'true', message: '请选择' }]}>
            <Radio.Group>
              <Radio value={true}>true</Radio>
              <Radio value={false}>false</Radio>
            </Radio.Group>
          </Form.Item>
        </div>
      </div>
    </>
  );
}

export default Project
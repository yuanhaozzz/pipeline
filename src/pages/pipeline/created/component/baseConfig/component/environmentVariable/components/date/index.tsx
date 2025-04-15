import React, { useEffect } from 'react';
import { Form, Input, DatePicker } from 'antd'
import moment from 'moment'

import './style.less'
import { send } from './service'


const { RangePicker } = DatePicker;

function Project(props) {
  const { item, validator, nameBlur } = props

  const validatorDate = (info, value) => {
    if (!value) {
      return Promise.resolve()
    }
    const currentDateTime = moment();
    const expirationDateTime = moment(value);
    if (currentDateTime.isAfter(expirationDateTime)) {
      return Promise.reject('需大于当前时间')
    }
    return Promise.resolve()
  }

  function disabledDate(current) {
    // 禁止选择小于当前时间的日期
    return current && current < moment().startOf('day');
  }

  return (
    <>
      <div className='item-row flex-space-between'>
        <div className='row-left'>
          <Form.Item label="Key" name={item.id + '-name'} rules={[{ required: true, message: '' }, { validator }]} initialValue={item.name}>
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
        <div style={{ flex: 1 }}>
          <Form.Item label="默认值" name={item.id + '-default'} initialValue={item.default ? moment(item.default) : ''} rules={[{ required: false, message: '' }, { validator: validatorDate }]}>
            <DatePicker style={{ width: '100%' }} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" disabledDate={disabledDate} />
          </Form.Item>
        </div>
      </div>
    </>
  );
}

export default Project
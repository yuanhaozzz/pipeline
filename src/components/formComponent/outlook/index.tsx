import React, { useEffect } from 'react';

import './style.less'
import { send } from './service'
import { Form, Select } from 'antd'

function Project(props) {
  const { selectProps = {}, formItem = {}, form } = props


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
      return Promise.reject('请输入正确的邮件格式，且以@enflame-tech.com结尾')
    }
    return Promise.resolve()
  }


  const teamChange = (value: Array<any>) => {
    if (!value.length) return;
    form.validateFields([formItem.name])
  }

  return (
    <Form.Item
      rules={[{ validator: validatorShare }]}
      {
      ...formItem
      }
    >
      <Select
        mode="tags"
        allowClear
        placeholder='Outlook邮箱地址，回车后输入下一个'
        options={[]}
        onChange={teamChange}
        open={false}
      />
    </Form.Item>
  );
}

export default Project
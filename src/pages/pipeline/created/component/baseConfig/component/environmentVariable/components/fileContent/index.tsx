import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, message, Button } from 'antd'

import './style.less'
import { send } from './service'
import FileContentComponent from './component/fileContentComponent'

const { TextArea } = Input;
function Project(props) {

  const { item, form, type, validator, nameBlur } = props

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


      <Form.Item shouldUpdate noStyle>
        {
          () => {
            const value = form.getFieldValue(item.id + '-default')
            const v = item.default || value
            return <Form.Item name={item.id + '-default'} label="上传" style={{ padding: '0px 20px' }} initialValue={v} >
              <FileContentComponent {...props} name={item.id + '-default'} value={value} />
            </Form.Item>
          }
        }
      </Form.Item>
    </>
  );
}

export default Project
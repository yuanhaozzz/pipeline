import React, { useEffect } from 'react';
import { Form, Input } from 'antd'

import './style.less'
import { send } from './service'
import UploadFileComponent from '../uploadFileComponent'


function Project(props) {

  const { item, form, type, validator, nameBlur } = props


  const getImage = (image: any) => {
    form.setFieldValue(item.id + '-default', image)
    form.validateFields([item.id + '-default'])
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


      <Form.Item shouldUpdate noStyle>
        {
          () => {
            const img = form.getFieldValue(item.id + '-default')
            return <Form.Item name={item.id + '-default'} label="上传" style={{ padding: '0px 20px' }} initialValue={item.default || img} >
              <UploadFileComponent getImageUrl={getImage} img={item.default || img} disabled={type !== 1} />
            </Form.Item>
          }
        }
      </Form.Item>
    </>
  );
}

export default Project
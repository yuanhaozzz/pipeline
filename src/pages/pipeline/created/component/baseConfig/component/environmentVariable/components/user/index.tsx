import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, message, Button, Select, Empty, Spin } from 'antd'
import debounce from 'lodash/debounce';

import './style.less'
import { getuserList } from './service'

const { TextArea } = Input;
function Project(props) {

  const { item, form, type, validator, nameBlur } = props

  const [userOptions, setUserOptions] = useState<any>([])
  const [requestStatus, setRequestStatus] = useState(false)

  const initSelectOptions = async (value = '') => {
    try {
      handleLoading(true)
      const data = await getuserList(value)
      setUserOptions(data)
    } catch (error) {
      console.log(error);
    } finally {
      handleLoading(false)
    }
  }

  const handleLoading = (status: boolean) => {
    if (status) {
      setUserOptions([])
    }
    setRequestStatus(status)
  }

  const loadOptions = (value: string) => {
    initSelectOptions(value)
  };


  const debounceFetcher = debounce(loadOptions, 500);

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
            return <Form.Item name={item.id + '-default'} label="用户" style={{ padding: '0px 20px' }} initialValue={v} >
              <Select
                allowClear
                showSearch
                optionFilterProp="children"
                filterOption={false}
                mode='multiple'
                placeholder="请选择"
                notFoundContent={requestStatus ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                onSearch={(value) => debounceFetcher(value)}
              // options={mapData[options.form.name]}
              >
                {
                  userOptions?.map(item => (
                    <Option value={`${item.label} ${item.value}`} label={item.label}>
                      <div className="demo-option-label-item">
                        <span role="img" aria-label="China">
                          {item.label}
                        </span>
                        {
                          item.user_id && <span>&nbsp;{item.user_id}</span>
                        }
                      </div>
                    </Option>
                  ))
                }

              </Select>
            </Form.Item>
          }
        }
      </Form.Item>
    </>
  );
}

export default Project
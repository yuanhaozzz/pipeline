import React, { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { Select, Spin, Empty, Form } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';

import './style.less'
import { getUserListApi } from './service'


function Project(props) {
  const { selectProps = {}, formItem = {}, form, isInitLoad, nameField = 'name', idField = 'id' } = props

  const [userList, setUserList] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    if (isInitLoad) {
      // initSelectOptions(' ')
    }

  }, [])


  const initSelectOptions = async (value = '') => {
    setValue(value)
    if (!value) {
      setUserList([])
      return
    }
    setLoading(true)
    try {
      const data = await getUserListApi({ username: value })
      setUserList(data.map(item => {
        item.value = item.user_id
        item.label = item.username
        return item
      }))

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }
  const debounceFetcher = debounce(initSelectOptions, 500);

  const renderNotFoundContent = () => {
    if (loading) {
      return <Spin indicator={<LoadingOutlined />} />
    }
    if (value && userList.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }
    return '可输入关键字搜索'
  }

  const onChange = (value, prop) => {
    // debugger
    // 多选
    if (selectProps.mode === 'multiple') {
      let arr = []
      if (Array.isArray(value)) {
        value.forEach(item => {
          const data = item.split(' ')
          arr.push({
            [nameField]: data[0],
            [idField]: data[1]
          })
        })
      }
      form.setFieldValue('userValue', arr)
    }
  }

  return (
    <>
      <Form.Item name='userValue' noStyle></Form.Item>
      <Form.Item {...formItem}>
        <Select
          allowClear
          placeholder="选择执行人"
          showSearch
          optionFilterProp="children"
          filterOption={false}
          onSearch={(value) => debounceFetcher(value)}
          notFoundContent={renderNotFoundContent()}
          onChange={onChange}
          {...selectProps}
        >
          {
            userList?.map(item => (
              <Option value={`${item.label} ${item.value}`} >
                <div className="demo-option-label-item" title={`${item.label} ${item.user_id}`} key={`${item.label}-${item.user_id}`}>
                  <span role="img" aria-label="China">
                    {item.label}
                  </span>
                  <span>&nbsp;&nbsp;&nbsp;{item.user_id}</span>
                </div>
              </Option>
            ))
          }
        </Select>
      </Form.Item>
    </>
  );
}

export default Project
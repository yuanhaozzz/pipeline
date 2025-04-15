import React, { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';
import { Select, Spin, Empty } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';

import './style.less'
import { getUserListApi } from './service'

interface Props {
  selectProps?: any
}
function Project(props: Props) {
  const { selectProps = {} } = props

  const [userList, setUserList] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')

  // useEffect(() => {
  //   initSelectOptions()
  // }, [])


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

  return (
    <Select
      allowClear
      placeholder="选择执行人"
      showSearch
      optionFilterProp="children"
      filterOption={false}
      onSearch={(value) => debounceFetcher(value)}
      notFoundContent={renderNotFoundContent()}
      {...selectProps}
    >
      {
        userList?.map(item => (
          <Option value={item.value} label={item.label}>
            <div className="demo-option-label-item" title={`${item.label} ${item.user_id}`}>
              <span role="img" aria-label="China">
                {item.label}
              </span>
              <span>&nbsp;&nbsp;&nbsp;{item.user_id}</span>
            </div>
          </Option>
        ))
      }
    </Select>
  );
}

export default Project
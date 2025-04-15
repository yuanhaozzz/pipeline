import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import debounce from 'lodash/debounce';
import { Select, Spin, Empty, Form, message } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';

import './style.less'
import { getListApi } from './service'
import { renderStatus } from '@/pages/pipeline/created/common'
import moment from 'moment';

interface Props {
  selectProps?: any
  pipelineId?: any
  findChange: any
  name: string
  findList: any
}
function Project(props: Props, ref) {
  const { selectProps = {}, pipelineId, findChange, name, findList } = props

  const [userList, setUserList] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')

  useEffect(() => {
    setUserList(findList)
  }, [findList])

  // useEffect(() => {
  //   initSelectOptions()
  // }, [])

  useImperativeHandle(ref, () => ({
    setUserList
  }))


  const initSelectOptions = async (value = '') => {
    const reg = /^[0-9]*$/
    if (!reg.test(value)) {
      message.error('请输入数字')
      return
    }
    setValue(value)
    setLoading(true)
    try {
      let { data } = await getListApi({ runiid_query: value }, pipelineId)
      data = data.map(item => {
        item.created_at = moment(item.created_at).format('YYYY-MM-DD HH:mm')
        return item
      })
      setUserList(data)
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
    return ''
  }

  return (
    // <Form.Item label="审核人" name="user">
    <Form.Item name={name} label="" >
      <Select
        allowClear
        placeholder={`请输入要${name === 'current_id' ? '查询' : '对比'}的版本`}
        showSearch
        optionFilterProp="children"
        filterOption={false}
        onSearch={(value) => debounceFetcher(value)}
        onClear={() => debounceFetcher('')}
        notFoundContent={renderNotFoundContent()}
        onChange={findChange}
        style={{ width: '180px' }}
      >
        {
          userList?.map(item => (
            <Option value={item.run_info_id}>
              <div className='flex-start'>
                <span>{item.run_iid}</span>&nbsp;&nbsp;
                <span>{item.created_at}</span>&nbsp;&nbsp;
                <span>{renderStatus(item.state)}</span>
              </div>
            </Option>
          ))
        }
      </Select>
    </Form.Item>

  );
}

export default forwardRef(Project)
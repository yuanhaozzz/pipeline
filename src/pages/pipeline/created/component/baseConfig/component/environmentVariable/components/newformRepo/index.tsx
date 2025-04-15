import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Select, Form, Spin, Empty } from 'antd'

import './style.less'
import { searchRepo } from './service'
import debounce from 'lodash/debounce';
import { copyText } from '@/utils'

const { Option } = Select;

interface Props {
  label: string
  name: string
  initialValue: string
  repoType: string
  required: boolean
  isCopy?: boolean
  message: string
  repoChange(info: any): any
  className: any
  style: any
  help?: any
  form?: any
  url?: any
}

function Project(props: Props, ref) {
  const { label, name, initialValue, repoType, repoChange, required, message, className, style, help = '', isCopy = false, form, url = '' } = props

  // 地址
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);


  useImperativeHandle(ref, () => ({
    setOptionsData,
    getRepoApi: initSelectOptions
  }))

  useEffect(() => {
    initSelectOptions()
  }, [])



  const setOptionsData = (options) => {
    setOptions([])
  }

  const initSelectOptions = async (value = '') => {
    setFetching(true);
    setOptions([]);
    const params: any = {
      type: repoType,
      repo_name: value
    }
    if (!value) {
      params.default = initialValue
    }
    try {
      const { data } = await searchRepo(params)
      setOptions(data);
      // data.forEach(item => {
      //   item.http_url = '测试http_url'
      // })
    } catch (error) {
    } finally {
      setFetching(false);
    }
  }
  const debounceFetcher = debounce(initSelectOptions, 500);

  const renderLabel = () => {
    if (isCopy) {
      const value = form.getFieldValue('git_url')
      const v = value || url
      if (!v) {
        return label
      }
      return <div>
        {label}
        &nbsp;&lt;URL：{v}&gt;&nbsp;<span style={{ color: '#1890ff', cursor: 'pointer' }} onClick={() => copyText(v)}>复制</span>
      </div >
    }
    return label
  }

  return (
    <>
      <Form.Item name="git_url"></Form.Item>
      {/* <Form.Item name="repoName"></Form.Item> */}
      <Form.Item name="repoId"></Form.Item>
      <Form.Item label={renderLabel()} name={name} initialValue={initialValue} rules={[{ required, message }]} extra={help} className={className} style={style}>
        <Select
          allowClear
          placeholder="请输入"
          showSearch
          // optionFilterProp="children"
          filterOption={false}
          onSearch={(value) => debounceFetcher(value)}
          notFoundContent={fetching ? <Spin size="small" /> : <Empty />}
          onChange={v => {
            const gitInfo = options.find(item => item.name === v)
            repoChange(gitInfo)
            // initSelectOptions()
          }}
        >
          {
            options.map(item => (
              <Option value={item.name} label={item.name}>
                {item.name}
              </Option>
            ))
          }
        </Select>
      </Form.Item>
    </>
  );
}

export default forwardRef(Project)
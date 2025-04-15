import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Select, Form, Spin, Empty } from 'antd'

import './style.less'
import { searchRepo } from './service'
import debounce from 'lodash/debounce';

const { Option } = Select;

interface Props {
  label: string
  name: string
  initialValue: string
  repoType: string
  required: boolean
  message: string
  repoChange(info: any): any
  className: any
  style: any
  help?: any
}

function Project(props: Props, ref) {
  const { label, name, initialValue, repoType, repoChange, required, message, className, style, help = '' } = props

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
  return (
    <Form.Item label={label} name={name} initialValue={initialValue} rules={[{ required, message }]} extra={help ? <span dangerouslySetInnerHTML={{ __html: help }} ></span> : ''} className={className} style={style}>
      <Select
        allowClear
        placeholder="请输入仓库名称，支持模糊查询"
        showSearch
        // optionFilterProp="children"
        filterOption={false}
        onSearch={(value) => debounceFetcher(value)}
        notFoundContent={fetching ? <Spin size="small" /> : <Empty />}
        onChange={v => {
          const gitInfo = options.find(item => item.id === v)
          repoChange(gitInfo)
          // initSelectOptions()
        }}
      >
        {
          options.map(item => (
            <Option value={item.id} label={item.name}>
              {item.name}
            </Option>
          ))
        }
      </Select>
    </Form.Item>
  );
}

export default forwardRef(Project)
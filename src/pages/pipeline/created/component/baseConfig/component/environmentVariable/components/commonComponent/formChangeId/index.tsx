import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { Select, Form, Spin, Empty, Switch } from 'antd'

import './style.less'
import { searchBranch, searchRefId } from './service'
import debounce from 'lodash/debounce';

const { Option } = Select;

interface Props {
  label: string
  name: string
  initialValue: string
  repoType: string
  repoId: string
  required: boolean
  message: string
  patchsetName: string
  className: any
  style: any
  isBranch: any
  isBranchValue: any
  change(): any
  searchChange?(value: any, arr: any[], type: string): any
  presetChange?(): any
  repoName: any
  id: any
  from: any
  help?: any
  placeholder?: any
  onSwitchBranchChange(e, name, id): any
  rules?: any[]
  isVaildBranch?: boolean
}

function Project(props: Props, ref) {
  const { label, name, initialValue, repoType, change, required, message, repoId, className, style, isBranch, isBranchValue, repoName, presetChange = () => { }, searchChange, help, placeholder } = props
  // 分支
  const [branchFetching, setBranchFetching] = useState(false);
  // refId
  const [refIdOptions, setRefIdOptions] = useState([]);

  const variableRef = useRef(null)

  let isPatchLoading = false

  useEffect(() => {
    // if (variableRef.current.load) {
    if (repoName) {
      if (repoType === 'gerrit') {
        branchInitSelectOptions('', 'refId')
      }
    }
    // }
    // variableRef.current.load = true
  }, [repoId, repoName, isBranchValue, repoType])

  useImperativeHandle(ref, () => ({
    setOptionsData
  }))

  const setOptionsData = (options) => {
    setRefIdOptions([])
  }


  const branchInitSelectOptions = async (value = '', type = 'branch') => {
    const map = {
      refId: setRefIdOptions
    }


    const setOptionsFunction = map[type]
    if (!repoId) {
      setOptionsFunction([])
      return
    }
    const mapLoading = {
      'refId': isPatchLoading
    }
    const currentLoading = mapLoading[type]
    if (currentLoading) {
      return
    }
    mapLoading[type] = true

    setBranchFetching(true);
    setOptionsFunction([])
    const params: any = {
      type: repoType,
      repo_id: repoId,
    }
    if (type === 'refId') {
      params.repo_name = repoName
      params.ref_id = value
    } else {
      params.branch = value

    }

    try {
      const api = type === 'refId' ? searchRefId : searchBranch
      const { data } = await api(params)
      if (searchChange) {
        searchChange(value, data, type)
      }
      setOptionsFunction(data)
    } catch (error) {
    } finally {
      setTimeout(() => {
        mapLoading[type] = false
        setBranchFetching(false);
      }, 1500);
    }
  }

  const setFormType = () => {
    if (repoType === 'gerrit') {
      return (isBranchValue === undefined || isBranchValue === true)
    } else {
      return true
    }

  }

  const debouncePatchFetcher = debounce((value) => branchInitSelectOptions(value, 'refId'), 500);

  const memoPatchSelect = useMemo(() => {
    return <Select
      allowClear
      placeholder={placeholder || '请选择 Change-ID'}
      showSearch
      optionFilterProp="children"
      filterOption={false}
      onSearch={debouncePatchFetcher}
      notFoundContent={branchFetching ? <Spin size="small" /> : <Empty />}
      onChange={presetChange}
      mode='multiple'
      style={{ width: 'calc(100% )' }}
    >
      {
        refIdOptions.map(item => (
          <Option value={item.ref_id} label={item.ref_id} title={`${item.title}\n${item.ref_id}`}>
            <div>{item.ref_id}：{item.title}</div>
            {/* <div>{item.title}</div> */}
          </Option>
        ))
      }
    </Select>
  }, [repoId, repoName, isBranchValue, refIdOptions, branchFetching, repoType])


  const renderPatchSet = () => {
    return <>
      <Form.Item name={name} label={label || 'Change'} rules={[{ required, message }]} extra={help}>
        {
          memoPatchSelect
        }
      </Form.Item>
    </>
  }

  return (
    <div ref={variableRef} className={className} style={style}>
      {
        repoType === 'gerrit' && renderPatchSet()
      }
    </div>
  );
}

export default forwardRef(Project)
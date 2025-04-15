import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { Select, Form, Spin, Empty, Switch, Radio } from 'antd'

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
  currentDefaultValue?: any
  help?: any
  onSwitchBranchChange(e, name, id): any
  rules?: any[]
  isVaildBranch?: boolean
}

function Project(props: Props, ref) {
  const { label, name, initialValue, repoType, change, required = true, message, repoId, className, style, isBranch, onSwitchBranchChange, patchsetName, isBranchValue, id, repoName, from, help = '', isVaildBranch = false, presetChange = () => { }, searchChange, currentDefaultValue } = props
  // 分支
  const [branchFetching, setBranchFetching] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);
  // refId
  const [refIdOptions, setRefIdOptions] = useState([]);

  const variableRef = useRef(null)

  let isBranchLoading = false
  let isPatchLoading = false
  useEffect(() => {
    // if (variableRef.current.load) {
    if (repoName) {
      if (repoType === 'gerrit') {
        branchInitSelectOptions('', (isBranchValue === undefined || isBranchValue === true) ? 'branch' : 'refId')
      } else {
        branchInitSelectOptions('', 'branch')
      }
    }
    // }
    // variableRef.current.load = true
  }, [repoId, repoName, isBranchValue, repoType])

  useImperativeHandle(ref, () => ({
    setOptionsData
  }))

  const setOptionsData = (options) => {
    setBranchOptions([])
    setRefIdOptions([])
  }


  const branchInitSelectOptions = async (value = '', type = 'branch') => {
    const map = {
      branch: setBranchOptions,
      refId: setRefIdOptions
    }


    const setOptionsFunction = map[type]
    if (!repoId) {
      setOptionsFunction([])
      return
    }
    const mapLoading = {
      'branch': isBranchLoading,
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

  const setName = () => {
    return setFormType() ? name : patchsetName
  }

  const setVaildMessage = () => {
    const str = setFormType() ? '请填写分支' : '请填写 Patchset'
    return str
  }

  const setFormType = () => {
    if (repoType === 'gerrit') {
      return (isBranchValue === undefined || isBranchValue === true)
    } else {
      return true
    }

  }

  const debounceBranchFetcher = debounce((value) => branchInitSelectOptions(value, 'branch'), 500);
  const debouncePatchFetcher = debounce((value) => branchInitSelectOptions(value, 'refId'), 500);

  const handleSearch = debounce((value) => {
    // 在这里执行搜索逻辑
    console.log('222222222222')
  }, 1000);

  const memoBranchSelect = useMemo(() => {
    return <Select
      allowClear
      placeholder='请输入代码分支，支持模糊查询'
      showSearch
      optionFilterProp="children"
      filterOption={false}
      onSearch={debounceBranchFetcher}
      notFoundContent={branchFetching ? <Spin size="small" /> : <Empty />}
      onChange={change}
    >
      {
        branchOptions.map(item => (
          <Option value={item} label={item}>
            {item}
          </Option>
        ))
      }
    </Select>
  }, [repoId, repoName, isBranchValue, branchOptions, branchFetching, repoType])

  const memoPatchSelect = useMemo(() => {
    return <Select
      allowClear
      placeholder='请输入 Patchset ，支持模糊查询'
      showSearch
      optionFilterProp="children"
      filterOption={false}
      onSearch={debouncePatchFetcher}
      notFoundContent={branchFetching ? <Spin size="small" /> : <Empty />}
      onChange={presetChange}
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
  return (
    <div ref={variableRef} className={className + ' environmentVariable-form-branch-container'} style={style}>
      {/* <Form.Item label={label} name={setName()} rules={[{ required: isVaildBranch, message: setVaildMessage() }]} > */}
      <Form.Item required={required} label={label} help={help}>
        <div className='flex-start' style={{ alignItems: 'flex-start' }}>
          {
            required && <div style={{ color: '#ff4d4f', marginRight: '5px', marginTop: '7px' }}>*</div>
          }
          {
            repoType === 'gerrit' && <>
              <div style={{ width: '170px' }} className='flex-start'>
                <Form.Item label={''} name={isBranch} style={{ margin: 0 }} >
                  <Radio.Group options={[
                    { label: 'Patchset', value: false },
                    { label: '代码分支', value: true },
                  ]} optionType="button" defaultValue={false} onChange={e => onSwitchBranchChange(e.target.value, isBranch, id)} />
                </Form.Item>
              </div>
            </>
          }
          <div className={`form-branch-right-box-width ${repoType !== 'gerrit' && 'now-form-branch-box'}`}>
            {
              setFormType() ? <Form.Item name={name} rules={[{ required, message: '请选择分支' }]} initialValue={initialValue} >
                {
                  memoBranchSelect
                }
              </Form.Item>
                :
                <Form.Item name={patchsetName} rules={[{ required, message: '请选择 Patchset' }]}   >
                  {
                    memoPatchSelect
                  }
                </Form.Item>
            }
          </div>
        </div>
      </Form.Item>
    </div>
  );
}

export default forwardRef(Project)
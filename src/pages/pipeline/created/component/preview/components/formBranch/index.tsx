import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { Select, Form, Spin, Empty, Switch, Radio } from 'antd'

import './style.less'
import { searchBranch, searchRefId, searchTag } from './service'
import debounce from 'lodash/debounce';

const { Option } = Select;

interface Props {
  label: string
  name: string
  tagName: string
  initialValue: string
  repoType: string
  repoId: string
  required: boolean
  message: string
  patchsetName: string
  className: any
  style: any
  isBranch: any
  form: any
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
  detailVal?: any
}

function Project(props: Props, ref) {
  const { label, name, initialValue, repoType, change, required = true, repoId, className, style, isBranch, onSwitchBranchChange, patchsetName, isBranchValue, id, repoName, help = '', presetChange = () => { }, searchChange, form, tagName, detailVal = {}, } = props
  // 分支
  const [branchFetching, setBranchFetching] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);
  // refId
  const [refIdOptions, setRefIdOptions] = useState([]);
  // Tag
  const [tagOptions, setTagOptions] = useState([]);

  let [radioOptions, setRadioOptions] = useState([])

  const variableRef = useRef(null)

  let isBranchLoading = false
  let isPatchLoading = false
  let isTagLoading = false

  useEffect(() => {
    if (repoType) {
      if (repoType === 'gerrit') {
        radioOptions = [
          { label: 'Patchset', value: 'patchset' },
          { label: '代码分支', value: 'branch' },
          { label: 'Tag', value: 'tag' },
        ]
        if (isBranchValue === undefined) {
          form.setFieldValue(isBranch, 'patchset')
        }
      } else {
        radioOptions = [
          { label: '代码分支', value: 'branch' },
          { label: 'Tag', value: 'tag' },
        ]
        if (isBranchValue === undefined) {
          form.setFieldValue(isBranch, 'branch')
        }

      }
      setRadioOptions([...radioOptions])
    }
  }, [repoType, detailVal])

  useEffect(() => {
    // if (variableRef.current.load) {
    if (repoName) {
      if (repoType === 'gerrit') {
        branchInitSelectOptions('', isBranchValue)
      } else {
        branchInitSelectOptions('', isBranchValue)
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
    setTagOptions([])
  }


  const branchInitSelectOptions = async (value = '', type = 'branch') => {
    const map = {
      branch: setBranchOptions,
      patchset: setRefIdOptions,
      tag: setTagOptions,
    }

    const setOptionsFunction = map[type] || function () { }
    if (!repoId) {
      setOptionsFunction([])
      return
    }
    const mapLoading = {
      'branch': isBranchLoading,
      'patchset': isPatchLoading,
      'tag': isTagLoading
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

    switch (type) {
      case 'patchset':
        params.repo_name = repoName
        params.ref_id = value
        break
      case 'branch':
        params.branch = value
        break
      case 'tag':
        params.repo_name = repoName
        params.search_by = value
        break
    }

    try {
      let api: any = ''
      switch (type) {
        case 'patchset':
          api = searchRefId
          break
        case 'branch':
          api = searchBranch
          break
        case 'tag':
          api = searchTag
          break
      }

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
      return 'patchset'
    } else {
      return 'branch'
    }
  }

  const debounceBranchFetcher = debounce((value) => branchInitSelectOptions(value, 'branch'), 500);
  const debounceTagFetcher = debounce((value) => branchInitSelectOptions(value, 'tag'), 500);
  const debouncePatchFetcher = debounce((value) => branchInitSelectOptions(value, 'patchset'), 500);

  const radioChange = (e) => {
    const value = e.target.value
    form.setFieldValue(isBranch, value)

    onSwitchBranchChange(value, isBranch, id)
  }

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

  const memoTagSelect = useMemo(() => {
    return <Select
      allowClear
      placeholder='请输入 Tag ，支持模糊查询'
      showSearch
      optionFilterProp="children"
      filterOption={false}
      onSearch={debounceTagFetcher}
      notFoundContent={branchFetching ? <Spin size="small" /> : <Empty />}
      onChange={change}
    >
      {
        tagOptions.map(item => (
          <Option value={item.name} >
            {item.name}
          </Option>
        ))
      }
    </Select>
  }, [repoId, repoName, isBranchValue, tagOptions, branchFetching, repoType])

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
    <div ref={variableRef} className={className + ' environmentVariable-form-branch-container preview-environmentVariable-branch-container'} style={style}>
      {/* <Form.Item label={label} name={setName()} rules={[{ required: isVaildBranch, message: setVaildMessage() }]} > */}
      <Form.Item required={required} label={label} extra={help}>
        <div className='flex-start' style={{ alignItems: 'flex-start' }}>
          {/* {
            required && <div className='required-icon' >*</div>
          } */}
          <div style={{ width: repoType === 'gerrit' ? '225px' : '197px' }} className='flex-start'>
            <Form.Item label={''} name={isBranch} style={{ margin: 0 }} initialValue={'branch'}>
              <Radio.Group options={radioOptions} optionType="button" defaultValue={false} onChange={e => radioChange(e)} />
            </Form.Item>
          </div>
          <div className={`form-branch-right-box-width ${repoType !== 'gerrit' && 'now-form-branch-box'}`}>

            {
              isBranchValue === 'patchset' && <Form.Item name={patchsetName} rules={[{ required, message: '请选择 Patchset' }]}   >
                {
                  memoPatchSelect
                }
              </Form.Item>
            }
            {
              isBranchValue === 'branch' && <Form.Item name={name} rules={[{ required, message: '请选择分支' }]} initialValue={initialValue} >
                {
                  memoBranchSelect
                }
              </Form.Item>
            }
            {
              isBranchValue === 'tag' && <Form.Item name={tagName} rules={[{ required, message: '请选择 Tag' }]}  >
                {
                  memoTagSelect
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
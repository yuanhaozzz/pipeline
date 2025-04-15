import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, useMemo, useCallback } from 'react';
import { Select, Form, Spin, Empty, Switch, Button, Checkbox, Input } from 'antd'

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
  componentConfig?: any
  form?: any
  config?: any
  customizeButton?: any
  type: any
}

let timer = null
function Project(props: Props, ref) {
  const { label, name, initialValue, repoType, change, repoId, className, style, isBranchValue, repoName, isVaildBranch = false, searchChange, required = true, help, currentDefaultValue, componentConfig, form, config, customizeButton, type } = props
  // 分支
  const [branchFetching, setBranchFetching] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);

  const variableRef = useRef(null)

  let isBranchLoading = false
  let isPatchLoading = false


  useEffect(() => {
    if (repoName) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        branchInitSelectOptions('', 'branch')
      }, 500);

    }
  }, [repoId, repoName, isBranchValue, repoType])


  // const getBranch = () => {
  //   if (repoName) {
  //     branchInitSelectOptions('', 'branch')
  //   }
  // };

  // const debouncedEffect = useCallback(
  //   // debounce(getBranch, 200),
  //   debounce(getBranch, 200),
  //   [repoId, repoName, isBranchValue, repoType, 1000]
  // );

  // useEffect(() => {
  //   debugger
  //   debouncedEffect();
  //   return debouncedEffect.cancel;
  // }, [debouncedEffect]);


  useImperativeHandle(ref, () => ({
    setOptionsData
  }))

  const setOptionsData = (options) => {
    setBranchOptions([])
  }


  const branchInitSelectOptions = async (value = '', type = 'branch', noDefault = false) => {
    const map = {
      branch: setBranchOptions,
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
      // params.branch = value || currentDefaultValue
      params.branch = value
      if (!value && !noDefault) {
        params.default = currentDefaultValue
      }
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

  const debounceBranchFetcher = debounce((value) => branchInitSelectOptions(value, 'branch'), 500);

  const handleSearch = debounce((value) => {
    // 在这里执行搜索逻辑
    console.log('222222222222')
  }, 1000);

  const memoBranchSelect = useMemo(() => {
    return <Select
      allowClear
      placeholder={'请选择代码分支'}
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

  const getVarStrValue = (str) => {
    const regex = /^\$\{[\w]+\}$/;
    return regex.test(str)
  }

  const validator = (info, value) => {
    if (type !== 1) {
      return Promise.resolve()
    }
    if (!getVarStrValue(value)) {
      return Promise.reject('格式错误')
    }

    return Promise.resolve()
  }

  const renderBranch = () => {
    const has_variable_in_tag = customizeButton ? form.getFieldValue(customizeButton) : ''
    return <div className='flex-start'>

      {
        has_variable_in_tag
          ?
          <Form.Item name={name} label="代码分支" style={{ flex: 1 }} rules={[{ required, message: '' }, { validator }]}>
            <Input
              placeholder='${x}的环境变量'
              style={{ height: '32px' }}
            />
          </Form.Item>
          :
          <Form.Item style={{ flex: 1 }} name={name} label={`${label || '代码分支'}`} initialValue={initialValue} rules={[{ required, message: '请选择分支' }]} extra={help} >
            {
              memoBranchSelect
            }
          </Form.Item>
      }
      &nbsp;&nbsp;&nbsp;&nbsp;
      <Form.Item noStyle name={customizeButton} label="" valuePropName="checked" initialValue={false}>
        <Checkbox
          onChange={(e) => {
            config.variables[name] = undefined
            form.setFieldValue(name, undefined)
            const checked = e.target.checked
            if (!checked) {
              branchInitSelectOptions('', 'branch', true)
            }
          }}
        >环境变量</Checkbox>
      </Form.Item>
    </div>
  }

  const renderPatchSet = () => {
    return <>
      {renderBranch()}
    </>
  }

  return (
    <div ref={variableRef} className={className} style={style}>
      {
        repoType === 'gerrit' ? renderPatchSet() : renderBranch()
      }
    </div>
  );
}

export default forwardRef(Project)
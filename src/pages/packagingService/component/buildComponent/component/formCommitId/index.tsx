import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef, useMemo, useCallback } from 'react';
import { Select, Form, Spin, Empty } from 'antd'

import './style.less'
import { searchCommitId } from './service'
import debounce from 'lodash/debounce';

const { Option } = Select;

interface Props {
  label: string
  name: string
  initialValue: string
  repoType: string
  repoId: string
  branch: string
  required: boolean
  disabled?: boolean
  message: string
  repoName: any
  help?: any
  className: any
  style: any
  placeholder?: any
  isBranchValue: any
  commitChange?(): any
  form: any
  getBuildOptions: any
  isInitSetCommit: boolean
}

function Project(props: Props, ref) {
  const { label, name, initialValue, repoType, required, message, repoId, branch, repoName, className, style, isBranchValue, help = '', commitChange = () => { }, placeholder, disabled, form, getBuildOptions, isInitSetCommit = false } = props
  // 分支
  const [branchFetching, setBranchFetching] = useState(false);
  // CommitId
  const [commitIdFetching, setCommitIdFetching] = useState(false);
  const [commitIdOptions, setCommitIdOptions] = useState([]);


  const variableRef = useRef(null)
  const isSetCommit = useRef(isInitSetCommit)


  const handleCommitId = () => {
    getCommitId()
  };

  const debouncedEffect = useCallback(
    debounce(handleCommitId, 200),
    [repoId, branch, repoName, 1000]
  );


  useEffect(() => {
    debouncedEffect();
    return debouncedEffect.cancel;
  }, [repoId, branch, repoName, debouncedEffect]);


  // useEffect(() => {
  //   if (variableRef.current.load) {
  //     handleCommitId()
  //   }
  //   variableRef.current.load = true
  // }, [repoId, branch, repoName])



  useImperativeHandle(ref, () => ({
    getData: getCommitId,
    setOptionsData
  }))


  const setOptionsData = (options) => {
    setCommitIdOptions(options)
  }

  const getCommitId = async (value = '') => {
    if (!repoId || !branch) {
      setCommitIdOptions([])
      return
    }
    setBranchFetching(true);
    setCommitIdOptions([])
    const params = {
      type: repoType,
      repo_id: repoId,
      repo_name: repoName,
      branch: branch,
      commit_id: value
    }

    try {
      const { data } = await searchCommitId(params)

      const value = form.getFieldValue(name)
      if (data && data.length > 0 && !value) {
        if (isSetCommit.current) {
          form.setFieldValue(name, data[0]?.commit_id)
          form.validateFields([name])
        } else {
          isSetCommit.current = true
        }
        getBuildOptions && getBuildOptions()
      }

      setCommitIdOptions(data);
    } catch (error) {
    } finally {
      setTimeout(() => {
        setBranchFetching(false);
      }, 1000);
    }
  }



  const debouncePatchFetcher = debounce((value) => getCommitId(value), 500);

  const memoCommitId = useMemo(() => {
    return <Select
      allowClear
      showSearch
      disabled={disabled !== undefined ? disabled : repoType === 'gerrit' ? isBranchValue === false : false}
      placeholder={placeholder || '请选择 CommitId'}
      optionFilterProp="children"
      onChange={commitChange}
      onSearch={debouncePatchFetcher}
      notFoundContent={branchFetching ? <Spin size="small" /> : <Empty />}
      filterOption={false}
    >
      {
        commitIdOptions.map(item => (
          <Option value={item.commit_id} label={`${item.commit_id.slice(0, 8)}：${item.title}`} title={`${item.title}\n${item.commit_id}`}>
            <div>{item.commit_id.slice(0, 8)}：{item.title}</div>
            {/* <div>{item.title}</div> */}
          </Option>
        ))
      }
    </Select>
  }, [repoId, branch, repoName, repoType, isBranchValue, commitIdOptions, branchFetching])

  return (
    <div ref={variableRef} className={className + ' common-form-commitId-container'} style={style}>
      <Form.Item label={label} name={name} initialValue={initialValue} rules={[{ required, message }]} extra={help}>
        {memoCommitId}
      </Form.Item>
    </div>
  );
}

export default forwardRef(Project)
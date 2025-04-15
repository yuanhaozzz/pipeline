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
  message: string
  repoName: any
  help?: any
  className: any
  style: any
  isBranchValue: any
  commitChange?(): any
}

function Project(props: Props, ref) {
  const { label, name, initialValue, repoType, required, message, repoId, branch, repoName, className, style, isBranchValue, help = '', commitChange = () => { } } = props

  // CommitId
  const [commitIdFetching, setCommitIdFetching] = useState(false);
  const [commitIdOptions, setCommitIdOptions] = useState([]);


  const variableRef = useRef(null)


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
    const params = {
      type: repoType,
      repo_id: repoId,
      repo_name: repoName,
      branch: branch,
      commit_id: value
    }
    try {
      const { data } = await searchCommitId(params)
      setCommitIdOptions(data);
    } catch (error) {
    }
  }



  const memoCommitId = useMemo(() => {
    return <Select
      allowClear
      showSearch
      disabled={repoType === 'gerrit' ? isBranchValue === false : false}
      placeholder={'请输入 CommitId ，支持模糊查询'}
      optionFilterProp="children"
      onChange={commitChange}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    >
      {
        commitIdOptions.map(item => (
          <Option value={item.commit_id} label={item.commit_id} title={`${item.title}\n${item.commit_id}`}>
            <div>{item.commit_id}</div>
            <div>{item.title}</div>
          </Option>
        ))
      }
    </Select>
  }, [repoId, branch, repoName, repoType, isBranchValue, commitIdOptions])

  return (
    <div ref={variableRef} className={className} style={style}>
      <Form.Item label={label} name={name} initialValue={initialValue} rules={[{ required, message }]} help={help}>
        {memoCommitId}
      </Form.Item>
    </div>
  );
}

export default forwardRef(Project)
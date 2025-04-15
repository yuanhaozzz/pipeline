import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useReducer } from 'react';

import './style.less'
import { send } from './service'
import { PlusOutlined, ApartmentOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { Button, message, Tooltip, Form, Input, Radio, Select, Spin, Empty, DatePicker } from 'antd'
import { searchRepo, searchBranch, searchCommitId } from '../../../baseConfig/component/environmentVariable/components/repo/service'
import debounce from 'lodash/debounce';

import FormBranch from '@/pages/pipeline/created/component/baseConfig/component/environmentVariable/components/formBranch'
import FormCommitId from '@/pages/pipeline/created/component/baseConfig/component/environmentVariable/components/commonComponent/formCommitId'
// import OldFormCommitId from '@/pages/FlowLine/created/component/baseConfig/component/environmentVariable/components//commonComponent/formCommitId'
import NewFormCommitId from '../formCommitId'
import FormRepo from '@/pages/pipeline/created/component/baseConfig/component/environmentVariable/components/formRepo'
import FormChangeRef from '@/pages/pipeline/created/component/baseConfig/component/environmentVariable/components/commonComponent/formChangeId'
import moment from 'moment'
import NewFormBranch from '../formBranch'

import UploadFileComponent from '@/pages/pipeline/created/component/baseConfig/component/environmentVariable/components/uploadFileComponent'
import { renderTriggerIcon } from '@/pages/packagingService/commonComponent'
import FileContentComponent from '../../../baseConfig/component/environmentVariable/components/fileContent/component/fileContentComponent'
import RelationComponent from '../relation'

import UserComponent from './component/user'

const { TextArea } = Input

function Project(props, ref) {

  let { env, form, data, pipelineId } = props
  // 铺平Env数据
  const envAllList = filterEnvAllValue(env)

  const relationList = data.setting?.extra_data?.relationList || []
  // 地址
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  // 分支
  const [branchFetching, setBranchFetching] = useState(false);
  const [branchOptions, setBranchOptions] = useState([]);
  // CommitId
  const [commitIdFetching, setCommitIdFetching] = useState(false);
  const [commitIdOptions, setCommitIdOptions] = useState([]);

  const [displayMoreOptions, setDisplayMoreOptions] = useState(false)

  const [toolchainOptions, setToolchainOptions] = useState([])
  const [abiOptions, setAbiOptions] = useState([])
  const [buildTypeOptions, setBuildTypeOptionsOptions] = useState([])

  const [, forceUpdate] = useReducer(state => state + 1, 0)

  const [relationDisplay, setRelationDisplay] = useState(false)

  const [detailVal] = useState({})
  const formRepoRef = useRef(null)
  const formBranchRef = useRef(null)
  const formCommitIdRef = useRef(null)

  const variableRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    getEnvApi,
    setEnv,
    getRepoInfo,
    setMoreOptions
  }))

  useEffect(() => {
    const { componentDefault = {} } = env.find((item: any) => item.prompt_on_trigger && item.type === 'component') || {}
    onComponentSelect(componentDefault.component)
    form.setFieldValue('component----component', componentDefault.component)
  }, [env])

  useEffect(() => {
    onRepoSelect()
  }, [env])

  useEffect(() => {
    setCommonType()
  }, [env])

  const setCommonType = () => {
    const list = env.filter(item => item.type === 'string' || item.type === 'bool' || item.type === 'choose' || item.type === 'multiple' || item.type === 'user' || item.type === 'fileContent')
    list.forEach(item => {
      form.setFieldValue(`${item.type}----${item.name}`, item.default)
    })
  }

  const setMoreOptions = (status) => {
    setDisplayMoreOptions(status)
  }

  function filterEnvAllValue(env) {
    const allEnv = env.filter(item => item.type !== 'component')
    const list = []
    // 铺平数据
    allEnv.forEach(item => {
      if (item.type === 'repo') {
        const repo = item.repo
        list.push({ id: repo[0].newId, name: repo[0]['git_url-name'] })
        list.push({ id: repo[1].newId, name: repo[1]['ref-name'] })
        list.push({ id: repo[2].newId, name: repo[2]['sha-name'] })
      } else {
        list.push(item)
      }
    })
    return list
  }

  const getEnvApi = async () => {

    await branchInitSelectOptions()
    await getCommitId('')
  }

  const getRepoInfo = () => {
    const url = form.getFieldValue('repo----repo-url')
    return {
      url
    }
  }

  const setEnv = (env) => {
    const repo = env.find(item => item.type.includes('git_url')) || {}
    const ref = env.find(item => item.type.includes('ref')) || {}
    variableRef.current.repo = {
      type: repo.repoType
    }

    variableRef.current.repoInfo = repo.urlValue

    if (repo.name) {
      variableRef.current.branchId = ref.default || 'master'
      getEnvApi()
    }
  }

  const onRepoSelect = () => {
    const repoArr = env.filter((item: any) => item.prompt_on_trigger)
    const repoList = repoArr.filter(item => item.type === "repo").reverse()

    if (repoList.length > 0) {

      repoList.map((repo, index) => {
        index += 1
        const repoData = repo.repo[0]
        const id = repo.id
        const refData = repo.repo[1]
        const shaData = repo.repo[2]
        const repoType = repoData['repo-type']

        form.setFieldValue(`${index}-repo----git_url----${repoData['git_url-name']}`, repoData['repo-name'])
        form.setFieldValue(`${index}-repo----ref----${refData['ref-name']}`, refData['ref'])
        form.setFieldValue(`${index}-repo----patchset----${refData['ref-name']}`, refData['ref-patchset'])
        form.setFieldValue(`${index}-repo----tag----${refData['ref-name']}`, refData['ref-tag'])
        form.setFieldValue(`${index}-repo----sha----${shaData['sha-name']}`, shaData['sha'])
        form.setFieldValue(`${index}-repo----isBranch----isBranch`, refData['ref-isBranch'])

        form.setFieldValue(`${index}-repo----repo-type`, repoData['repo-type'])
        form.setFieldValue(`${index}-repo----repo-name`, repoData['repo-name'])
        form.setFieldValue(`${index}-repo----repo-id`, repoData['repo-id'])
        form.setFieldValue(`${index}-repo----repo-url`, repoData['repo-url'])
        // 没有找到
        form.setFieldValue(`${index}-repo----patchset`, refData['ref-patchset'])
      })
    }
  }


  const getCommitId = async (value = '') => {
    const { type } = variableRef.current.repo
    const params = {
      type,
      repo_id: variableRef.current?.repoInfo?.id,
      repo_name: variableRef.current?.repoInfo?.name,
      branch: variableRef.current.branchId,
      commit_id: value
    }
    try {
      const { data } = await searchCommitId(params)
      setCommitIdOptions(data);
    } catch (error) {
    }
  }

  const initSelectOptions = async (value = '') => {
    if (!value) {
      setOptions([])
      return
    }
    setFetching(true);
    setOptions([]);
    const { type } = variableRef.current.repo
    const params = {
      type,
      repo_name: value
    }
    try {
      const { data } = await searchRepo(params)
      setOptions(data);
    } catch (error) {
    } finally {
      setTimeout(() => {
        setFetching(false);
      }, 500);
    }
  }
  const debounceFetcher = debounce(initSelectOptions, 500);

  const branchInitSelectOptions = async (value = '') => {
    if (!variableRef.current?.repoInfo?.id) {
      return
    }
    setBranchFetching(true);
    setBranchOptions([]);
    const { type } = variableRef.current.repo
    const params = {
      type,
      repo_id: variableRef.current?.repoInfo?.id,
      branch: value
    }
    try {
      const { data } = await searchBranch(params)
      setBranchOptions(data);
    } catch (error) {
    } finally {
      setTimeout(() => {
        setBranchFetching(false);
      }, 500);
    }
  }
  const debounceBranchFetcher = debounce(branchInitSelectOptions, 500);



  const repoChange = (value, info = {}, repoType, refData, shaData, index) => {
    const name = `${index}-repo----ref----${refData['ref-name']}`
    const patchsetName = `${index}-repo----patchset----${refData['ref-name']}`
    const shaName = `${index}-repo----sha----${shaData['sha-name']}`

    form.setFieldValue(`${index === undefined ? '' : `${index}-`}repo----repo-name`, info.name)
    form.setFieldValue(`${index === undefined ? '' : `${index}-`}repo----repo-url`, info.url)
    form.setFieldValue(`${index === undefined ? '' : `${index}-`}repo----repo-id`, info.id)


    form.setFieldValue(name, undefined)
    form.setFieldValue(patchsetName, undefined)
    form.setFieldValue(shaName, undefined)
  }

  const branchChange = (value, values) => {
    variableRef.current.branchId = value
    const shaData = data.setting.pipeline_variable.find(item => item.type.includes('sha'))
    form.setFieldValue(`${shaData.type}----${shaData.name}`, undefined)
    setCommitIdOptions([])
    getCommitId('')
  }


  const renderRepoForm = (type, item) => {
    if (type.includes('git_url')) {
      return <Select
        allowClear
        placeholder="请输入"
        showSearch
        // optionFilterProp="children"
        filterOption={false}
        onSearch={(value) => debounceFetcher(value)}
        notFoundContent={fetching ? <Spin size="small" /> : <Empty />}
        onChange={repoChange}
      >
        {
          options.map(item => (
            <Option value={item.id} label={item.name}>
              {item.name}
            </Option>
          ))
        }
      </Select>
    }

    if (type.includes('ref')) {
      return <Select
        allowClear
        placeholder="请输入"
        showSearch
        optionFilterProp="children"
        filterOption={false}
        onSearch={(value) => debounceBranchFetcher(value)}
        notFoundContent={branchFetching ? <Spin size="small" /> : <Empty />}
        // options={branchOptions.map(item => {
        //   return {
        //     label: item,
        //     value: item,
        //   }
        // })}
        onChange={branchChange}
      >
        {
          branchOptions.map(item => (
            <Option value={item} label={item}>
              {item}
            </Option>
          ))
        }
      </Select>
    }

    if (type.includes('sha')) {
      return <Select
        allowClear
        showSearch
        placeholder="请输入"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      >
        {
          commitIdOptions.map(item => (
            <Option value={item.commit_id} label={item.commit_id} title={`${item.title}\n${item.commit_id}`}>
              <div>{item.title}</div>
              <div>{item.commit_id}</div>
            </Option>
          ))
        }
      </Select>
    }
  }


  const renderLabel = (item) => {
    const map = {
      gerrit: 'Gerrit',
      gitlabee: 'Gitlab-EE',
      gitlabce: 'Gitlab-CE',
    }
    const type = item.type
    if (type.includes('ref') || type.includes('git_url') || type.includes('sha')) {
      return `${item.name}（${map[item.repoType]}）`
    }
    return item.name
  }

  const renderDefaultValue = (item) => {
    if (item.type.includes('git_url')) {
      return item.urlValue?.name
    }
    return item.default
  }

  const onComponentSelect = (selectName) => {
    if (!selectName) {
      return
    }

    let options = []
    if (data.setting.extra_data?.envComponentList) {
      options = data.setting.extra_data?.envComponentList[pipelineId] || []
    }

    if (options.length <= 0) {
      return
    }

    let currentData = options.find(item => item.component === selectName) || {}
    // debugger
    const defaultData = env.find(item => item.type === 'component')
    if (defaultData?.componentDefault?.component === selectName) {
      currentData = defaultData?.componentDefault
    }

    form.setFieldValue('component----git_url', currentData['repo-url'])
    form.setFieldValue('component----repo-type', currentData['repo-type'])
    form.setFieldValue('component----repo-name', currentData['repo-name'])
    form.setFieldValue('component----repo-id', currentData['repo-id'])


    form.setFieldValue('component----ref', currentData['ref'])
    form.setFieldValue('component----sha', currentData['sha'])
    form.setFieldValue('component----isBranch', currentData['isBranch'])
    form.setFieldValue('component----patchset', currentData['patchset'])

    form.setFieldValue('component----toolchain', currentData['toolchain'])
    form.setFieldValue('component----abi', currentData['abi'])
    form.setFieldValue('component----build_type', currentData['build_type'])

    setToolchainOptions(currentData['toolchain-options'] || [])
    setAbiOptions(currentData['abi-options'] || [])
    setBuildTypeOptionsOptions(currentData['build_type-options'] || [])
  }

  const componentBranchChange = () => {
    form.setFieldValue(`component----sha`, undefined)

  }

  const repoBranchChange = (repoType, shaData, index) => {
    form.setFieldValue(`${index}-repo----sha----${shaData['sha-name']}`, undefined)
    // setTimeout(() => {
    //   form.validateFields([`${index}-repo----sha----${shaData['sha-name']}`])
    // }, 2000);
  }


  const onSwitchBranchChange = (checked, name, id) => {
    form.setFieldValue(name, checked)
    form.setFieldValue(`component----sha`, undefined)
  }

  const onSwitchRepoBranchChange = (checked, name, repoType, shaData, index) => {
    form.setFieldValue(name, checked)
    form.setFieldValue(`${index}-repo----sha----${shaData['sha-name']}`, undefined)
  }

  const renderRepoType = () => {
    const options = data.setting.extra_data.envComponentList[pipelineId] || []
    if (options.length <= 0) {
      return
    }
    const selectName = form.getFieldValue('component----component')
    const currentData = options.find(item => item.component === selectName) || {}
    return getRepoType(currentData['repo-type']) || ''
  }

  const getRepoType = (value) => {
    const map = {
      gerrit: 'Gerrit',
      gitlabee: 'Gitlab-EE',
      gitlabce: 'Gitlab-CE',
    }
    return map[value] || 1
  }

  const renderFormItem = (item: any, from?) => {
    const label = from === 'relation' ? '' : (item.display_name || item.name)
    const { is_required } = item
    // const stringArr = 
    return <Form.Item className='left preview-item-type-container' label={label} extra={item.description ? <span dangerouslySetInnerHTML={{ __html: item.description }} ></span> : ''} name={`${item.type}----${item.name}`} initialValue={renderDefaultValue(item)} rules={[{ required: is_required, message: '请填写' }]}>
      {renderComponent(item.type, item)}
    </Form.Item>
  }


  const renderComponent = (type: string, item: any) => {
    if (type.includes('ref') || type.includes('git_url') || type.includes('sha')) {
      return renderRepoForm(type, item)
      // <RepoForm item={item} type={type} form={form} />
    }
    switch (type) {
      case 'string':
        return <TextArea autoSize={{ minRows: 1 }} />
      case 'bool':
        return <Radio.Group>
          <Radio value={true}>true</Radio>
          <Radio value={false}>false</Radio>
        </Radio.Group>
    }
    // if (type.includes('ref') || type.includes('git_url') || type.includes('sha')) {
    //   return <Input />
    // }
  }

  const renderComponentType = () => {
    const { prompt_on_trigger, componentDefault = {} } = env.find((item: any) => item.prompt_on_trigger && item.type === 'component') || {}

    data.setting.extra_data = data.setting.extra_data || {}
    if (!data.setting.extra_data.envComponentList) {
      data.setting.extra_data.envComponentList = {}
    }
    const options = data.setting.extra_data.envComponentList[pipelineId] || []
    if (options.length <= 0 || !prompt_on_trigger) {
      return <></>
    }
    // return <div className='flex-start form-row-box' style={{ marginTop: '5px' }}>
    //   <div className='flex-start content'>
    //   </div>
    // </div >
    return <>
      <Form.Item className='left preview-item-type-container' name={`component----component`} label="组件名">
        <Select
          showSearch
          placeholder="请输入"
          optionFilterProp="children"
          onChange={onComponentSelect}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {
            options.map(item => (
              <Option value={item.component} label={item.component} title={`${item.component}`}>
                <div>{item.component}</div>
              </Option>
            ))
          }
        </Select>
      </Form.Item>
      <Form.Item className='left' style={{ margin: '8px' }} label={`仓库地址（${renderRepoType()}）`} name='component----git_url' >
        <Input disabled />
      </Form.Item >

      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const repoType = form.getFieldValue('component----repo-type')
            const isBranch = `component----isBranch`
            const patchsetName = `component----patchset`
            const isBranchValue = form.getFieldValue(`component----isBranch`)
            const label = repoType === 'gerrit' ? '分支/Change-Ref' : '分支'
            const repoName = form.getFieldValue(`component----repo-name`)

            return <>
              {/* 分支 */}
              <FormBranch ref={formBranchRef} name={`component----ref`} label={label} initialValue="" repoType={form.getFieldValue('component----repo-type')} repoId={form.getFieldValue(`component----repo-id`)} change={(v) => componentBranchChange(v)} className="left" style={{ margin: '8px' }} isBranch={isBranch} onSwitchBranchChange={onSwitchBranchChange} patchsetName={patchsetName} isBranchValue={isBranchValue} id={''} repoName={repoName} required={false} />
              {/* CommitId */}
              <OldFormCommitId ref={formCommitIdRef} name={`component----sha`} label="CommitId" initialValue="" repoType={form.getFieldValue('component----repo-type')} repoId={form.getFieldValue('component----repo-id')} branch={form.getFieldValue(`component----ref`)} repoName={repoName} change={() => { }} className="left" style={{ margin: '8px' }} isBranchValue={isBranchValue} />
              {/* ChangeRef */}
              {/* <FormChangeRef ref={formBranchRef} name={patchsetName} label={label} initialValue="" repoType={form.getFieldValue('component----repo-type')} repoId={form.getFieldValue(`component----repo-id`)} change={(v) => componentBranchChange(v)} className="left" style={{ margin: '8px' }} isBranch={isBranch} onSwitchBranchChange={onSwitchBranchChange} repoName={repoName} required={false} /> */}
            </>
          }
        }
      </Form.Item>
    </>
  }

  const repoSwitch = (repo) => {
    repo.hide = !repo.hide
    forceUpdate()
  }

  const renderRepoComponent = (repo, index) => {
    const repoData = repo.repo[0]
    const refData = repo.repo[1]
    const shaData = repo.repo[2]
    const id = repo.id
    const repoType = repoData['repo-type']
    const label = `${repoData['repo_display_name'] || repoData['git_url-name']}`
    return <>
      <Form.Item name={`${index}-repo----repo-name`} noStyle></Form.Item>
      <Form.Item name={`${index}-repo----repo-type`} noStyle></Form.Item>
      <Form.Item name={`${index}-repo----repo-id`} noStyle></Form.Item>
      <Form.Item name={`${index}-repo----repo-url`} noStyle></Form.Item>
      <Form.Item noStyle shouldUpdate>
        {
          () => {
            return <FormRepo ref={formRepoRef} name={`${index}-repo----git_url----${repoData['git_url-name']}`} label={label} repoType={repoType} repoChange={info => repoChange(id, info, repoType, refData, shaData, index)} className="left preview-item-type-container" style={{ margin: '8px' }} required={repoData['is_required']} message='请填写' help={repoData['git_url-description']} />
          }
        }
      </Form.Item>
    </>
  }

  const renderRefComponent = (repo, index) => {
    const repoData = repo.repo[0]
    const refData = repo.repo[1]
    const shaData = repo.repo[2]
    const repoType = repoData['repo-type']
    const isBranch = `${index}-repo----isBranch----isBranch`
    const name = `${index}-repo----ref----${refData['ref-name']}`
    const patchsetName = `${index}-repo----patchset----${refData['ref-name']}`
    const tagName = `${index}-repo----tag----${refData['ref-name']}`

    const isBranchValue = form.getFieldValue(`${index}-repo----isBranch----isBranch`)
    const repoName = form.getFieldValue(`${index}-repo----repo-name`)
    const type = form.getFieldValue(`${index}-repo----repo-type`)
    const repoId = form.getFieldValue(`${index}-repo----repo-id`)
    const refDescription = `<div>${refData['ref-description'] || ''}</div>`
    const label = refData['ref_display_name'] || refData['ref-name']
    const extra = refData['ref-description'] ? <span dangerouslySetInnerHTML={{ __html: refDescription || '' }} ></span> : ''
    return <>
      {/* 分支 */}
      {/* <FormBranch ref={formBranchRef} name={name} label={`${refData['ref-name']}`} repoType={type} repoId={repoId} change={(v) => repoBranchChange(repoType, shaData, index)} className="left" style={{ margin: '6px', display: refData['ref-show'] ? 'block' : 'none' }} isBranch={isBranch} onSwitchBranchChange={(checked, id) => onSwitchRepoBranchChange(checked, id, repoType, shaData, index)} patchsetName={patchsetName} isBranchValue={isBranchValue} id={''} repoName={repoName} help={<span dangerouslySetInnerHTML={{ __html: refDescription || '' }} ></span>} required={false} /> */}
      <NewFormBranch name={name} label={label} initialValue={undefined} repoType={type} repoId={repoId} change={(v) => repoBranchChange(repoType, shaData, index)} className="left preview-item-type-container" style={{ margin: '8px 0 !important', display: refData['ref-show'] ? 'block' : 'none' }} isBranchValue={isBranchValue} isBranch={isBranch} onSwitchBranchChange={(checked, id) => onSwitchRepoBranchChange(checked, id, repoType, shaData, index)} id={'1'} repoName={repoName} required={(refData['ref-is_required'] === undefined || refData['ref-is_required'] === false) ? false : true} patchsetName={patchsetName} form={form} tagName={tagName} detailVal={detailVal} help={extra} />
    </>
  }

  const renderCommitIdComponent = (repo, index) => {
    const refData = repo.repo[1]
    const shaData = repo.repo[2]
    const name = `${index}-repo----ref----${refData['ref-name']}`
    const shaName = `${index}-repo----sha----${shaData['sha-name']}`
    const isBranchValue = form.getFieldValue(`${index}-repo----isBranch----isBranch`)
    const repoName = form.getFieldValue(`${index}-repo----repo-name`)
    const type = form.getFieldValue(`${index}-repo----repo-type`)
    const repoId = form.getFieldValue(`${index}-repo----repo-id`)
    const help = shaData['sha-description'] ? <span dangerouslySetInnerHTML={{ __html: shaData['sha-description'] || '' }} ></span> : ''

    const label = shaData['sha_display_name'] || shaData['sha-name']
    if (isBranchValue !== 'branch') {
      return <></>
    }
    return <>
      {/* CommitId */}
      {
        <NewFormCommitId ref={formCommitIdRef} name={shaName} label={label} repoType={type} repoId={repoId} branch={form.getFieldValue(name)} repoName={repoName} change={() => { }} className="left preview-item-type-container" style={{ margin: '8px', display: shaData['sha-show'] ? 'block' : 'none' }} isBranchValue={isBranchValue} help={help} form={form} required={shaData['sha-is_required']} message='请选择' />
      }
    </>
  }

  const renderRepoItem = (repo, index) => {
    const repoData = repo.repo[0]
    const refData = repo.repo[1]
    const shaData = repo.repo[2]

    const isShowRepo = !relationList.find(item => item.options.find(id => id.includes(repoData.newId)))
    const isShowRef = !relationList.find(item => item.options.find(id => id.includes(refData.newId)))
    const isShowCommitId = !relationList.find(item => item.options.find(id => id.includes(shaData.newId)))
    return <>
      {
        isShowRepo && renderRepoComponent(repo, index)
      }
      <Form.Item noStyle shouldUpdate>
        {
          () => {
            return <>
              {
                isShowRepo && !repoData['git_url-description'] && <div>&nbsp;</div>
              }
              {
                isShowRef && renderRefComponent(repo, index)
              }
              {
                isShowRef && !refData['ref-description'] && <div>&nbsp;</div>
              }
              {
                isShowCommitId && renderCommitIdComponent(repo, index)
              }

            </>
          }
        }
      </Form.Item >
    </>
  }

  const renderRepo = (repoList) => {
    if (repoList.length <= 0) {
      return <></>
    }
    const envRepoList = env.filter(envItem => envItem.prompt_on_trigger && envItem.type === 'repo')
    return <>
      {
        repoList.map((item, itemIndex) => {
          const currentIndex = envRepoList.findIndex(repoItem => repoItem.id === item.id)
          const index = envRepoList.length - currentIndex
          const repo = envRepoList[currentIndex]
          return <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', padding: '' }}>{repo.repo[0]['repo-display_name'] || `仓库${index}`} {renderTriggerIcon(repo.repo[0]['repo-type'])}</div>
            <div className='flow-preview-detail-env-repo-item' style={{ marginTop: '3px' }}>
              <div className='flex-space-between' style={{ cursor: 'pointer' }} onClick={() => repoSwitch(repo)}>
                {/* 仓库下拉 */}
                {
                  repo.hide && <div className='flex-start' >
                    <span>{repo.repo[0]['repo-name']}</span>&nbsp;
                  </div>
                }

                {/* 箭头 */}
                <div className={`flex-center arrow ${repo.hide && 'transition-arrow'}`} >
                  <UpOutlined />
                </div>
              </div>
              <div style={{ display: repo.hide ? 'none' : 'block', paddingTop: '2px' }}>
                <div className='repo-item-content flex-start' style={{ alignItems: 'flex-start' }}>
                  {renderRepoItem(repo, index)}
                </div>
              </div>
            </div>
          </div>
        })
      }
    </>
  }

  const handleOptions = (str) => {
    const options = str.split('\n').map(item => item.trim()).filter(Boolean)
    return [...new Set(options)]
  }

  const renderChooseConfig = (isMultiple, item: any, from) => {
    const label = from === 'relation' ? '' : (item.display_name || item.name)
    const extra = <span dangerouslySetInnerHTML={{ __html: item.description }} ></span>
    const { is_required } = item
    return <Form.Item className='left preview-item-type-container' label={label} extra={item.description ? extra : ''} name={`${item.type}----${item.name}`} initialValue={renderDefaultValue(item)} rules={[{ required: is_required, message: '请填写' }]}>
      <Select
        allowClear
        showSearch
        placeholder="查找选项"
        optionFilterProp="children"
        mode={isMultiple ? 'multiple' : null}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      >
        {
          handleOptions(item['choose-options']).map(value => (
            <Option value={value} label={value} title={`${value}`}>
              <div>{value}</div>
            </Option>
          ))
        }
      </Select>
    </Form.Item>
  }


  const getImage = (image: any, item) => {
    form.setFieldValue(`${item.type}----${item.name}`, image)
    form.validateFields([`${item.type}----${item.name}`])
  }

  const renderUploadComponent = (item, from?) => {
    const label = from === 'relation' ? '' : (item.display_name || item.name)
    const extra = <span dangerouslySetInnerHTML={{ __html: item.description }} ></span>
    const { is_required } = item
    return <Form.Item shouldUpdate noStyle>
      {
        () => {
          const img = form.getFieldValue(`${item.type}----${item.name}`)
          return <Form.Item className='left preview-item-type-container' label={label} extra={item.description ? extra : ''} name={`${item.type}----${item.name}`} initialValue={item.default || img} rules={[{ required: is_required, message: '请上传' }]}>
            <UploadFileComponent getImageUrl={(image) => getImage(image, item)} img={item.default || img} />
          </Form.Item>

          // <Form.Item name={item.id + '-default'} label="上传" style={{ padding: '0px 20px' }} initialValue={item.default || img} >

          // </Form.Item>
        }
      }
    </Form.Item>
  }

  const renderChoose = (chooseList) => {
    return <>
      {chooseList.map(item => (
        renderChooseConfig(false, item)
      ))}
    </>
  }

  const renderChooseMultiple = (chooseList) => {
    return <>
      {chooseList.map(item => (
        renderChooseConfig(true, item)
      ))}
    </>
  }

  const renderUpload = (list) => {
    return <>
      {list.map(item => (
        renderUploadComponent(item)
      ))}
    </>
  }

  const renderFileContentList = (list) => {
    return <>
      {list.map(item => (
        renderFileContent(item)
      ))}
    </>
  }

  const renderUserList = (list) => {
    return <>
      {list.map(item => (
        renderUser(item)
      ))}
    </>
  }

  const renderFileContent = (item, from?) => {
    const label = from === 'relation' ? '' : (item.display_name || item.name)
    const name = `${item.type}----${item.name}`
    const { is_required } = item
    const extra = <span dangerouslySetInnerHTML={{ __html: item.description }} ></span>
    return <>
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues[name] !== curValues[name]} noStyle>
        {
          () => {
            const value = form.getFieldValue(`${item.type}----${item.name}`)
            const v = item.default || value
            return <Form.Item className='left preview-item-type-container' label={label} extra={item.description ? extra : ''} name={`${item.type}----${item.name}`} initialValue={v} rules={[{ required: is_required, message: '请上传' }]}>

              <FileContentComponent item={item} form={form} name={`${item.type}----${item.name}`} value={value} />

            </Form.Item>
          }
        }
      </Form.Item>
    </>
  }

  const renderUser = (item, from?) => {
    const label = from === 'relation' ? '' : (item.display_name || item.name)
    const name = `${item.type}----${item.name}`
    const { is_required } = item
    const extra = item.description ? <span dangerouslySetInnerHTML={{ __html: item.description }} ></span> : ''
    return <>
      <Form.Item shouldUpdate={(prevValues, curValues) => prevValues[name] !== curValues[name]} noStyle>
        {
          () => {
            const value = form.getFieldValue(`${item.type}----${item.name}`)
            const v = item.default || value
            return <UserComponent className='left preview-item-type-container' label={label} extra={item.description ? extra : ''} name={`${item.type}----${item.name}`} initialValue={v} rules={[{ required: is_required, message: '请填写' }]} />
          }
        }
      </Form.Item>
    </>
  }

  function disabledDate(current) {
    // 禁止选择小于当前时间的日期
    return current && current < moment().startOf('day');
  }

  const validatorDate = (info, value) => {
    if (!value) {
      return Promise.resolve()
    }
    const currentDateTime = moment();
    const expirationDateTime = moment(value);
    if (currentDateTime.isAfter(expirationDateTime)) {
      return Promise.reject('需大于当前时间')
    }
    return Promise.resolve()
  }

  const renderDate = (dateList, from?) => {

    return <>
      {dateList.map(item => {
        const extra = item.description ? <span dangerouslySetInnerHTML={{ __html: item.description }} ></span> : ''
        const { is_required } = item
        return <>
          <Form.Item className='left preview-item-type-container' label={from === 'relation' ? '' : (item.display_name || item.name)} extra={extra} name={`${item.type}----${item.name}`} initialValue={item.default ? moment(item.default) : ''} rules={[{ required: is_required, message: '请填写' }, { validator: validatorDate }]}>
            <DatePicker style={{ width: '100%' }} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" disabledDate={disabledDate} />

          </Form.Item>
        </>
      })}
    </>
  }



  const renderRelation = () => {
    if (relationList.length <= 0) {
      return <></>
    }
    return <div className=''>
      {/* <div className='flex-space-between' style={{ cursor: 'pointer' }} onClick={() => setRelationDisplay(!relationDisplay)}> */}
      <div className='flex-space-between'>
        {/* 仓库下拉 */}
        {/* <div className='flex-start'>
          互斥关系
        </div> */}
        {/* 箭头 */}
        {/* <div className={`flex-center arrow ${relationDisplay && 'transition-arrow'}`} >
          <UpOutlined />
        </div> */}
      </div>
      <div style={{ display: relationDisplay ? 'none' : 'block' }}>
        <RelationComponent relationList={relationList} form={form} env={env} envAllList={envAllList} renderChooseConfig={renderChooseConfig} renderUploadComponent={renderUploadComponent} renderDate={renderDate} renderType={renderType} renderRepoComponent={renderRepoComponent} renderRefComponent={renderRefComponent} renderCommitIdComponent={renderCommitIdComponent} renderFileContent={renderFileContent} renderUserList={renderUserList} />
      </div>
    </div>
  }

  const renderType = (list, from?) => {
    return <>
      {list.map(item => (
        renderFormItem(item, from)
      ))}
    </>
  }

  const findTypeData = (type, isMoreOptions = false) => {
    const list = env.filter((item: any) => {
      // 过滤是否在更多选项内
      if (isMoreOptions) {
        return item.prompt_on_trigger && item.type === type && item.isMoreOptions
      }
      return item.prompt_on_trigger && item.type === type && !item.isMoreOptions
    })
    // 如果在互斥关系中，则过滤
    const filterList = list.filter(item => !relationList.find(relationItem => relationItem.options.find(id => id === item.id)))
    // 过滤互斥关系
    return filterList
  }


  const renderAllType = (isMoreOptions = false) => {
    const list = env.filter((item: any) => {
      // 过滤是否在更多选项内
      if (isMoreOptions) {
        return item.prompt_on_trigger && item.isMoreOptions
      }
      return item.prompt_on_trigger && !item.isMoreOptions
    })
    // 如果在互斥关系中，则过滤
    const filterList = list.filter(item => !relationList.find(relationItem => relationItem.options.find(id => id === item.id)))
    return <>

      {/* 仓库处理 */}
      <div className='' style={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {
          filterList.map(item => {
            switch (item.type) {
              case 'repo':
                return renderRepo([item])
              case 'upload':
                return renderUpload([item])
              case 'fileContent':
                return renderFileContentList([item])
              case 'user':
                return renderUserList([item])
              case 'choose':
                return renderChoose([item])
              case 'multiple':
                return renderChooseMultiple([item])
              case 'date':
                return renderDate([item])
              case 'string':
              case 'bool':
                return renderType([item])
            }
          })
        }
      </div>
    </>
  }

  const renderMoreOptions = () => {
    const renderMoreList = env.filter((item: any) => {
      return item.prompt_on_trigger && item.isMoreOptions && !relationList.find(relationItem => relationItem.options.find(id => id === item.id))
    })
    if (renderMoreList.length <= 0) {
      return <></>
    }
    return <div className='preview-env-moreOptions-container'>
      <div className='moreOptions-control' onClick={() => setDisplayMoreOptions(!displayMoreOptions)}>
        高级选项<DownOutlined className={`arrow ${displayMoreOptions && 'arrow-action'}`} />
      </div>
      <div style={{ display: displayMoreOptions ? 'block' : 'none' }}>
        {renderAllType(true)}
      </div>

    </div>
  }

  return (
    <div className='form-row common-component-form-row-container' ref={variableRef}>
      {/* 互斥关系 */}
      {renderRelation()}
      {renderAllType()}
      {/* 更多选项 */}
      {renderMoreOptions()}
    </div>
  );
}

export default forwardRef(Project)
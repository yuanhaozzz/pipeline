import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

import { Form, Input, Select, Radio, Checkbox, Tag, Switch, TimePicker, } from 'antd'
import { ExclamationCircleOutlined, CopyOutlined, CloseCircleOutlined, InfoCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { copyText } from '@/utils'
import moment from 'moment'
import { weekList } from '@/pages/packagingService/data';
import './style.less'
import { getBuildOptionsApi, getCopyTaskApi } from './service'
import { getScheduleOptions } from '@/pages/packagingService/service'
import { getUrlParams } from '@/utils'
import FormBranch from '@/pages/FlowLine/created/component/baseConfig/component/environmentVariable/components/commonComponent/formBranch'
import NewFormBranch from '../formBranch'
import FormChangeRef from '@/pages/FlowLine/created/component/baseConfig/component/environmentVariable/components/commonComponent/formChangeId'
import FormCommitId from '@/pages/FlowLine/created/component/baseConfig/component/environmentVariable/components/commonComponent/formCommitId'
import NewFormCommitId from '../formCommitId'


function Project(props, ref) {
  const { pipelineId, detail, buildOptions, setBuildOptions, from = '', isCreated } = props
  const [componentList, setComponentList] = useState<any>([])
  const [isMore, setMore] = useState(false)
  const [execWeek, setExecWeek] = useState(false)
  const formRepoRef = useRef(null)
  const formBranchRef = useRef(null)
  const formCommitIdRef = useRef(null)
  const detailVariablesRef = useRef({})
  const [form] = Form.useForm();
  const query = getUrlParams()

  useImperativeHandle(ref, () => ({
    getFormValue,
    reset,
    restSchedule,
    setMore,
  }))

  useEffect(() => {
    initData()
  }, [detail])

  useEffect(() => {
    const patchsetVal = form.getFieldValue('patchset')
    form.setFieldValue('require_rebase', patchsetVal?.length > 1)
  }, [form.getFieldValue('patchset')])

  const initData = async () => {
    if (env) {
      const options = detail.setting.extra_data.envComponentList[pipelineId] || []
      const { componentDefault = {} } = env.find((item: any) => item.prompt_on_trigger && item.type === 'component') || {}
      const index = env.findIndex((item: any) => item.prompt_on_trigger && item.type === 'component')
      if (index >= 0) {
        env[index].componentDefault.isBranch = 'patchset'
      }
      setComponentList(options)
      onComponentSelect(componentDefault.component)
      form.setFieldValue('component', componentDefault.component)
      await displayDetail()
      await getBuildOptions()
    }
  }

  const restSchedule = () => {
    setExecWeek(false)
    form.setFieldValue('schedule', false)
    form.setFieldValue('day_of_week', [])
    form.setFieldValue('hour_minute', moment('2023-12-28 00:00:00'))
  }

  const reset = () => {
    form.setFieldValue('patchset', undefined)
    form.setFieldValue('sha', undefined)
    form.setFieldValue('ref', undefined)
    form.setFieldValue('tag', undefined)
    form.setFieldValue('target_branch', undefined)
    form.setFieldValue('target_commit_id', undefined)
    form.setFieldValue('components', undefined)
    form.setFieldValue('package_version', undefined)
    restSchedule()
  }
  const getFormValue = async () => {
    const values: any = await form.validateFields()
    const patchset = form.getFieldValue('patchset')
    const packageField = form.getFieldValue('components')
    const package_type = form.getFieldValue('package_type')
    const include_tests = form.getFieldValue('include_tests')
    const ref = form.getFieldValue('ref')
    const sha = form.getFieldValue('sha')
    const tag = form.getFieldValue('tag')
    const repoType = values['repo-type']

    const params: any = {
      repo_name: values['repo-name'],
      repo_id: values['repo-id'],
      repo_type: values['repo-type'],
      git_url: values['git_url'],
      http_url: values['http_url'],
      require_rebase: values['require_rebase'],
      target_branch: values['target_branch'],
      target_commit_id: values['target_commit_id'],
      is_patchset: values['isBranch'] === 'patchset',
      package_version: values['package_version'],
      include_tests
    }
    const isBranch = form.getFieldValue('isBranch')

    if (repoType === 'gerrit') {
      switch (isBranch) {
        case 'patchset':
          if (patchset) {
            params.patchset = patchset
          }
          break
        case 'branch':
          params.ref = ref
          params.sha = sha
          break
        case 'tag':
          params.tag = tag
          break
      }
    } else {
      switch (isBranch) {
        case 'branch':
          params.ref = ref
          params.sha = sha
          break
        case 'tag':
          params.tag = tag
          break
      }
    }

    if (package_type) {
      params.package_type = package_type
    }

    if (packageField) {
      params.components = packageField.join(',')
    }
    return {
      ...form.getFieldsValue(),
      ...params
    }
  }

  const resetBuildOptions = () => {
    setBuildOptions({
      components: [],
      options: [],
      package_type: {}
    })
  }

  const getBuildOptions = async () => {
    try {
      const values = form.getFieldsValue()
      const patchset = form.getFieldValue('patchset')
      const ref = form.getFieldValue('ref')
      const sha = form.getFieldValue('sha')
      const tag = form.getFieldValue('tag')
      const repoType = values['repo-type']

      const params: any = {
        repo_name: values['repo-name'],
        repo_id: values['repo-id'],
        repo_type: values['repo-type'],
      }
      const isBranch = form.getFieldValue('isBranch')
      if (repoType === 'gerrit') {
        switch (isBranch) {
          case 'patchset':
            if (patchset?.length > 0) {
              // params.patchset = patchset.join(',')
              params.patchset = patchset
            } else {
              resetBuildOptions()
              return
            }
            break
          case 'branch':
            if (!ref) {
              resetBuildOptions()
              return
            }
            params.ref = ref
            params.sha = sha
            break
          case 'tag':
            if (!tag) {
              resetBuildOptions()
              return
            }
            params.tag = tag
            break
        }

      } else {

        switch (isBranch) {
          case 'branch':
            if (!ref) {
              resetBuildOptions()
              return
            }
            params.ref = ref
            params.sha = sha
            break
          case 'tag':
            if (!tag) {
              resetBuildOptions()
              return
            }
            params.tag = tag
            break
        }
      }

      let res: any = {}
      if (from === 'copyTask') { // 列表的复制任务
        res = await getCopyTaskApi(detail?.p_id)
      } else if (query?.id) { // 定时任务
        res = await getScheduleOptions({ id: query?.id, ...params })
      } else {
        res = await getBuildOptionsApi(params)
      }
      const { data } = res
      if (data) {
        setBuildOptions(data)
      } else {
        // 判断code
        if (res.code === 4009 || !data) {
          setBuildOptions({
            components: [],
            options: [],
            package_type: {},
            msg: res.msg
          })
        }
      }
    } catch (error) {
      setBuildOptions({
        components: [],
        options: [],
        package_type: {},
        msg: error.message
      })
    }
  }

  const onComponentSelect = (selectName) => {
    const options = detail.setting.extra_data.envComponentList[pipelineId] || []
    if (options.length <= 0) {
      return
    }

    const currentData = options.find(item => item.component === selectName) || {}
    form.setFieldValue('git_url', currentData['repo-url'])
    form.setFieldValue('http_url', currentData['http_url'])
    form.setFieldValue('repo-type', currentData['repo-type'])
    form.setFieldValue('repo-name', currentData['repo-name'])
    form.setFieldValue('repo-id', currentData['repo-id'])

    form.setFieldValue('ref', currentData['ref'] || 'master')
    form.setFieldValue('sha', currentData['sha'] || undefined)

    form.setFieldValue('tag', currentData['tag'] || undefined)

    form.setFieldValue('isBranch', currentData['isBranch'] || (currentData['repo-type'] === 'gerrit' ? 'patchset' : 'branch'))

    if (Array.isArray(currentData['patchset'])) {
      form.setFieldValue('patchset', currentData['patchset'][0])
    } else {
      form.setFieldValue('patchset', currentData['patchset'])
    }
  }

  const displayDetail = async () => {
    try {
      if (!from) {
        form.setFieldValue('hour_minute', moment('2023-12-28 00:00:00'))
        return
      }
      const { hour_minute, day_of_week = [], } = detail.schedule || {}
      let values = {}
      await detail?.trigger_info?.variables?.forEach((item: any) => {
        values[item.key] = item.value
      })
      const { package_type } = buildOptions
      detailVariablesRef.current = values
      form.setFieldsValue({
        ...values,
        'components': !!values['components'] ? (values['components'] ?? '').split(',') : [],
        'package_type': !!values['package_type'] ? values['package_type'].split(',') : [],
        isBranch: values['isBranch'],
        'ref': values['ref'] || undefined,
        'tag': values['tag'] || undefined,
        'patchset': Array.isArray(values['patchset']) ? values['patchset'][0] : values['patchset']?.split(','),
        schedule: detail.enable,
        day_of_week,
        hour_minute: hour_minute ? moment(`2023-12-28 ${hour_minute}:00`) : moment('2023-12-28 00:00:00'),
      })
      setExecWeek(detail.enable);
    } catch (err) {
      console.log('--onschedule-err', err);
    }
  }

  const componentBranchChange = () => {
    form.setFieldValue(`sha`, undefined)
    form.setFieldValue(`components`, undefined)
    getBuildOptions()
  }

  const onBranchRebaseChange = () => {
    form.setFieldValue(`target_commit_id`, undefined)
  }

  const presetChange = () => {
    form.setFieldValue(`components`, undefined)
    getBuildOptions()
  }

  const commitChange = () => {
    form.setFieldValue(`components`, undefined)
    getBuildOptions()
  }

  const onSwitchBranchChange = (checked, name, id) => {
    form.setFieldValue(`sha`, undefined)
    form.setFieldValue('components', undefined)
    getBuildOptions()
  }

  const env = detail.setting?.pipeline_variable
  if (!env) {
    return <></>
  }
  const { prompt_on_trigger } = env.find((item: any) => item.prompt_on_trigger && item.type === 'component') || {}
  detail.setting.extra_data = detail.setting.extra_data || { envComponentList: {} }
  const options = detail.setting.extra_data.envComponentList[pipelineId] || []
  if (options.length <= 0 || !prompt_on_trigger) {
    return <></>
  }


  const searchChange = (value, options = [], type: string) => {
    const isExist = options.find((item: any) => {
      if (type === 'branch') {
        return item === value
      } else {
        return item.ref_id === value
      }
    })
    if (isExist) {
      getBuildOptions()
    }
  }

  const handleComponent = (v) => {
    setBuildOptions({ ...buildOptions, msg: '' })
    form.setFieldValue('require_rebase', false)
    form.setFieldValue('components', [])
    // components
    onComponentSelect(v)
    getBuildOptions()
  }

  const validatorPackageType = (fidld, value) => {
    if (value.length <= 0) {
      return Promise.reject('选择组件后，至少选择一种包类型')
    }
    return Promise.resolve()
  }

  const renderTriggerIcon = (type: string) => {
    switch (type) {
      case 'gerrit':
        return <img src="http://xnas.enflame.cn/dolphin/gerrit.png" style={{ width: '16px', display: 'inline-block' }} />
      default:
        return <img src="http://xnas.enflame.cn/dolphin/gitlab-logo-1.svg" style={{ width: '16px', display: 'inline-block' }} />
    }
  }

  const radioChange = () => {
    getBuildOptions()
  }


  const numberVaild = (info, value) => {
    if (!value) {
      return Promise.resolve()
    }
    const versionRegex = /^(\d+\.)*\d+$/;
    if (!versionRegex.test(value)) {
      return Promise.reject('格式错误，示例 1.0.3')
    }
    return Promise.resolve()
  }

  const timedExecValid = (rule, value) => {
    const { field } = rule;
    if (form.getFieldValue('schedule')) {
      if (field === 'day_of_week' && (!value || value.length <= 0)) {
        return Promise.reject('请选择执行日');
      }
      if (field === 'hour_minute' && !value) {
        return Promise.reject('请选择执行时间');
      }
    }
    return Promise.resolve();
  }

  const execChange = (checked: boolean) => {
    setExecWeek(checked);
    checked && form.validateFields(['day_of_week', 'hour_minute']);
  }

  const handleRepoComponent = (v) => {
    if (v.length > 0) {
      form.setFieldValue('include_tests', false)
    }
  }

  return (
    <>


      <Form form={form} layout='vertical' initialValues={detailVariablesRef.current || {}}>
        <div className='packagingService-build-first-container common-scroll-bar'>
          {buildOptions && buildOptions.msg && <div className='flex-center first-error-message' style={{ textAlign: 'center' }}>
            <Tag color="error"><InfoCircleOutlined style={{ color: '#ff4d4f', fontSize: '14px' }} />&nbsp;{buildOptions.msg}</Tag>
            {/* <InfoCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />&nbsp;{buildOptions.msg} */}
          </div>
          }
          <br />
          <Form.Item name={'git_url'} label="" noStyle></Form.Item>
          <Form.Item name={'repo-type'} label="" noStyle></Form.Item>
          <Form.Item name={'repo-name'} label="" noStyle></Form.Item>
          <Form.Item name={'repo-id'} label="" noStyle></Form.Item>
          <Form.Item name={'http_url'} label="" noStyle></Form.Item>
          <Form.Item label="组件" name="component" rules={[{ required: true, message: '请选择组件' }]}>
            <Select
              showSearch
              placeholder="请输入"
              optionFilterProp="children"
              onChange={handleComponent}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {
                componentList.map(item => (
                  <Option value={item.component} label={item.component}>
                    {item.component}
                  </Option>
                ))
              }
            </Select>
          </Form.Item>
          {/* <Form.Item name={`repo-name`} label="代码仓" required tooltip="暂时支持tops仓">
          <Select
            showSearch
            placeholder="请输入"
            optionFilterProp="children"
            disabled
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
        </Form.Item> */}
          <Form.Item label="仓库地址" required shouldUpdate>
            {() => {
              const url = form.getFieldValue('git_url')
              const httpUrl = form.getFieldValue('http_url')
              // return <div className='flex-start' style={{ border: '1px solid #d9d9d9', padding: '6px 10px', borderRadius: '3px' }}>
              return <div className='flex-start' style={{ padding: '6px 10px', borderRadius: '3px' }}>
                {renderTriggerIcon(form.getFieldValue('repo-type'))}&nbsp;<span className='common-Jumpable-color' onClick={() => window.open(httpUrl)}>{httpUrl}</span>&nbsp;
                {/* {renderTriggerIcon(form.getFieldValue('repo-type'))}&nbsp;{url}&nbsp; */}
                {/* <CopyOutlined onClick={() => copyText(url)} /> */}
              </div>
            }}
          </Form.Item>
          {/* <Form.Item label={`仓库地址`} name='git_url' >
        <Input disabled />
      </Form.Item > */}

          <Form.Item noStyle shouldUpdate>
            {
              () => {
                const repoType = form.getFieldValue('repo-type')
                const isBranch = `isBranch`
                const patchsetName = `patchset`
                const isBranchValue = form.getFieldValue(`isBranch`)
                const label = repoType === 'gerrit' ? '代码分支' : '代码分支'
                const repoName = form.getFieldValue(`repo-name`)
                const shaLabel = 'Commit Id'

                return <>
                  <NewFormBranch ref={formBranchRef} name={`ref`} label={''} initialValue="master" repoType={form.getFieldValue('repo-type')} repoId={form.getFieldValue(`repo-id`)} change={(v) => componentBranchChange(v)} className="left" isBranch={isBranch} onSwitchBranchChange={onSwitchBranchChange} isBranchValue={isBranchValue} id={''} repoName={repoName} rules={[{ required: true, message: '12' }]} isVaildBranch={true} presetChange={presetChange} searchChange={searchChange} patchsetName={patchsetName} currentDefaultValue={form.getFieldValue(`ref`)} form={form} tagName={'tag'} detailVal={detailVariablesRef.current} />
                </>
              }
            }
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {
              () => {
                const repoType = form.getFieldValue('repo-type')
                const isBranchValue = form.getFieldValue(`isBranch`)
                const repoName = form.getFieldValue(`repo-name`)
                const shaLabel = 'Commit Id'
                if (isBranchValue !== 'branch') {
                  return <></>
                }
                return <>
                  {/* CommitId */}
                  <NewFormCommitId ref={formCommitIdRef} name={`sha`} label={shaLabel} initialValue={undefined} repoType={form.getFieldValue('repo-type')} repoId={form.getFieldValue('repo-id')} branch={form.getFieldValue(`ref`)} repoName={repoName} change={() => { }} className="left" isBranchValue={isBranchValue} commitChange={commitChange} placeholder={'若为空，则取最新的Commit ld'} form={form} getBuildOptions={getBuildOptions} isInitSetCommit={isCreated}
                  />
                </>
              }
            }
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {
              () => {
                const requireRebase = form.getFieldValue('require_rebase')
                const repoType = form.getFieldValue('repo-type')
                const isBranch = `isBranch`
                const patchsetName = `patchset`
                const isBranchValue = form.getFieldValue(`isBranch`)
                const label = repoType === 'gerrit' ? '代码分支' : '代码分支'
                const repoName = form.getFieldValue(`repo-name`)
                const shaLabel = 'Commit Id'
                const patchsetVal = form.getFieldValue('patchset')
                if (repoType !== 'gerrit' || isBranchValue !== 'patchset') {
                  return <></>
                }
                return <div>
                  <Form.Item name="require_rebase" label="" valuePropName="checked" >
                    <Checkbox disabled={patchsetVal?.length > 1}>Cherry-pick to</Checkbox>
                  </Form.Item>
                  {
                    requireRebase && <div style={{ paddingLeft: '0px' }}>
                      {/* 分支 */}
                      <FormBranch name={`target_branch`} label={'Base Branch'} initialValue="master" repoType={form.getFieldValue('repo-type')} repoId={form.getFieldValue(`repo-id`)} change={(v) => onBranchRebaseChange(v)} className="left" repoName={repoName} />

                      {/* CommitId */}
                      <FormCommitId ref={formCommitIdRef} name={`target_commit_id`} label={'Commit Id'} initialValue={undefined} repoType={form.getFieldValue('repo-type')} repoId={form.getFieldValue('repo-id')} branch={form.getFieldValue(`target_branch`) || 'master'} repoName={repoName} change={() => { }} className="left" isBranchValue={isBranchValue} commitChange={() => { }} placeholder={'若为空，则取最新的Commit ld'}
                      // help={<div className='flex-start'>
                      //   <ExclamationCircleOutlined style={{ color: '#1890ff', marginRight: '3px' }} />
                      //   使用指定代码仓库的Commit ID或Tag编译
                      // </div>}
                      />
                    </div>
                  }

                </div>
              }
            }

          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {
              () => {
                const repoType = form.getFieldValue('repo-type')
                const repoName = form.getFieldValue(`repo-name`)
                const componentsValue = form.getFieldValue('components') || []
                const isDisabled = componentsValue.length > 0
                if ((!buildOptions.components || buildOptions.components.length <= 0)) {
                  return <></>
                }
                return <div className='flex-space-between'>
                  <Form.Item label={`${repoName}内组件`} style={{ flex: 1, marginRight: '10px' }} name="components"
                  // extra={<div className='flex-start'>
                  //   <ExclamationCircleOutlined style={{ color: '#1890ff', marginRight: '3px' }} />
                  //   针对组件编译打包。若为空，则对Tops仓整体编译打包s
                  // </div>}
                  >
                    <Select
                      showSearch
                      mode='multiple'
                      allowClear
                      placeholder={`针对组件编译打包。若为空，则对${repoName}仓整体编译打包`}
                      optionFilterProp="children"
                      onChange={handleRepoComponent}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {
                        buildOptions.components.map(item => (
                          <Option value={item.value} label={item.name}>
                            {item.name}
                          </Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                  <Form.Item label={' '} name='include_tests' valuePropName="checked" >
                    <Checkbox disabled={isDisabled}>包含测试文件</Checkbox>
                  </Form.Item>
                </div>
              }
            }
          </Form.Item>
          {
            <Form.Item shouldUpdate noStyle>
              {
                () => {
                  const components = form.getFieldValue('components')
                  if ((!components || components.length <= 0)) {
                    return <></>
                  }
                  const { package_type } = buildOptions
                  return <Form.Item label={package_type.name} name={package_type.key} initialValue={package_type.default} rules={[{ validator: validatorPackageType }]}>
                    <Select
                      showSearch
                      mode={package_type.multiple ? 'multiple' : 'tags'}
                      allowClear
                      placeholder={`请选择${package_type?.name || ''}`}
                      optionFilterProp="children"
                      // onChange={handleComponent}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {
                        package_type.choices?.length > 0 && package_type.choices.map(item => (
                          <Option value={item.value} label={item.name}>
                            {item.name}
                          </Option>
                        ))
                      }
                    </Select>
                  </Form.Item>
                }
              }
            </Form.Item>
          }
          {/* <Form.Item shouldUpdate noStyle>
            {
              () => {
                const componentsValue = form.getFieldValue('components') || []
                const isDisabled = componentsValue.length > 0
                if ((!buildOptions.components || buildOptions.components.length <= 0)) {
                  return <></>
                }
                return <Form.Item label={''} name='include_tests' valuePropName="checked" >
                  <Checkbox disabled={isDisabled}>包含测试文件</Checkbox>
                </Form.Item>
              }
            }
          </Form.Item> */}
          {
            <div style={{ color: '#1890ff', cursor: 'pointer', fontSize: '12px', marginBottom: '5px' }} onClick={() => setMore(!isMore)}>{isMore ? '收起选项' : '更多选项'}{<UpOutlined className={`first-more-arrow ${!isMore && 'first-more-arrow-rotate'}`} />}</div>
          }
          {
            <div style={{ paddingLeft: '0px', display: isMore ? 'block' : 'none' }}>
              <Form.Item name="package_version" label="版本号" rules={[{ validator: numberVaild }]}>
                <Input placeholder='示例 1.0.3，不填则使用默认版本' />
              </Form.Item>
              <div className='timed-exec'>
                <Form.Item name="schedule" label="启用定时执行" valuePropName="checked">
                  <Switch defaultChecked={false} onChange={execChange} />
                </Form.Item>
                <div className='exec-date'>
                  <Form.Item name="day_of_week" label="执行日" rules={[{ required: true, validator: timedExecValid }]}>
                    <Checkbox.Group disabled={!execWeek}>
                      {weekList?.map(({ label, value }) => (
                        <Checkbox value={value} >{label}</Checkbox>
                      ))}
                    </Checkbox.Group>
                  </Form.Item>
                  <Form.Item name="hour_minute" label="执行时间" className='flex-end' rules={[{ required: true, validator: timedExecValid }]}>
                    <TimePicker disabled={!execWeek} defaultValue={moment('2023-12-28 00:00:00')} format='HH:mm' allowClear={false} />
                  </Form.Item>
                </div>
              </div>
            </div>
          }
          {/* {
            isMore && <div style={{ color: '#1890ff', cursor: 'pointer', fontSize: '12px' }} onClick={() => setMore(false)}>收起</div>
          } */}
        </div >
      </Form>
    </>
  );
}

export default forwardRef(Project)
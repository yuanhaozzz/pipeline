import React, { useEffect, useState, useRef, useReducer } from 'react';
import { Form, Input, Select, Button, Tabs, Radio } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import './style.less'
import { getCredentialListApi } from './service'

import { validator } from '../../../../data'

function Project(props) {
  const { form, config } = props

  const refreshRef = useRef<any>(null)
  const [, forceUpdate] = useReducer(state => state + 1, 0)
  const [credentialList, setCredentialList] = useState([])

  useEffect(() => {
    getData()
    initForm()
  }, [])

  const getData = async () => {
    const { data } = await getCredentialListApi({ size: 1000, page_num: 1 })
    setCredentialList(data.map(item => {
      return {
        label: item.name,
        value: item.uuid
      }
    }))
  }

  const initForm = () => {
    config.variables = config.variables || {}
    form.setFieldValue('git_url', config.variables?.git_url)
    form.setFieldValue('ref_type', config.variables?.ref_type || 'branch')
    if (config.variables.ref === undefined) {
      config.variables.ref = 'master'
    }
    if (config.variables.depth === undefined) {
      config.variables.depth = 20
    }
    form.setFieldValue('ref', config.variables.ref)
    form.setFieldValue('depth', config.variables.depth)
    form.setFieldValue('repo_path', config.variables.repo_path)
    form.setFieldValue('git_type', config.git_type || 'ssh')
    form.setFieldValue('credential', config.credential)
  }

  const validateDepth = (info: any, value: any) => {
    if (value < 1) {
      return Promise.reject('需大于0')
    }
    return Promise.resolve()
  }

  const refresh = () => {
    refreshRef.current.style.transform = 'rotate(360deg)'
    refreshRef.current.style.transition = 'all 0.6s'
    getData()
    setTimeout(() => {
      refreshRef.current.style.transition = 'none'
      refreshRef.current.style.transform = 'rotate(0deg)'
    }, 300);
  }

  return (
    <div className='task-config-gitlab-container'>
      <div className='flex-space-between'>

        <Form.Item tooltip="" name="git_type" label="源代码方式" rules={[{ required: true, message: '请选择源代码方式' }]} initialValue={'ssh'}>
          <Radio.Group>
            <Radio value='ssh'>SSH</Radio>
            <Radio value='http' disabled>HTTP</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item style={{ width: '70%' }} tooltip="若选择 Hook 触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖" name="git_url" label="代码仓库" rules={[{ validator: (...arg) => validator['triggerHook'](...arg, form) }]} dependencies={['ref']}>
          <Input />
        </Form.Item>
      </div>

      <div className='flex-space-between'>
        <Form.Item name="ref_type" label="指定拉取方式" rules={[{ required: true, message: '请选择拉取方式' }]} initialValue={'branch'}>
          <Radio.Group>
            <Radio value='branch'>按分支</Radio>
            <Radio value='tag' disabled>按 TAG</Radio>
            <Radio value='commit_id' disabled>按 commitId</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item style={{ width: '48%' }} tooltip="若选择 Hook 触发（基础配置-触发方式）则自动获取，无需填写，填写会覆盖" name="ref" label="分支名称" initialValue={'master'} rules={[{ validator: (...arg) => validator['triggerHook'](...arg, form) }]} dependencies={['git_url']}>
          <Input />
        </Form.Item>
      </div>

      <Form.Item name="depth" label="克隆深度" rules={[{ required: true, message: '' }, { validator: validateDepth }]}>
        <Input type='number' min={1} />
      </Form.Item>
      <Form.Item name="repo_path" label="代码保存路径" tooltip="指定一个相对于当前工作空间的目录路径放下拉的代码">
        <Input placeholder='请填写工作空间相对目录，不填则默认为工作空间根目录' />
      </Form.Item>
      <div className='flex-start credential-item-container'>
        <div onClick={() => refresh()} className='credential-refresh' ref={refreshRef}>
          <ReloadOutlined style={{ color: '#9f9999', cursor: 'pointer' }} />
        </div>
        <Form.Item name="credential" label="访问凭据" style={{ width: '100%' }}>
          <Select
            allowClear
            showSearch
            optionFilterProp="children"
            placeholder="请选择相应的凭证"
            filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
            options={credentialList}
          />

        </Form.Item>
        <Button type='link' onClick={() => window.open('/FlowLine/userCredentials?from=config')}>新增</Button>
      </div>
    </div>
  );
}

export default Project
import React, { useEffect, useState, useRef, useReducer } from 'react';
import { Form, Input, Select, Button, Tabs, Radio } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import './style.less'
import { getCredentialListApi, customPathApi } from './service'
import { validator } from '../../../../data'
import { list } from './data'

function Project(props) {
  const { form, config } = props

  const refreshRef = useRef<any>(null)
  const variableRef = useRef<any>({})

  const [, forceUpdate] = useReducer(state => state + 1, 0)

  useEffect(() => {
    // getData()
    initForm()
  }, [])

  // const getData = async () => {
  //   const { data } = await getCredentialListApi({ size: 1000, page_num: 1 })
  //   setCredentialList()
  // }

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

  const refresh = (api: any, name: string) => {
    refreshRef.current.style.transform = 'rotate(360deg)'
    refreshRef.current.style.transition = 'all 0.6s'
    getRemoteData(api, name)
    setTimeout(() => {
      refreshRef.current.style.transition = 'none'
      refreshRef.current.style.transform = 'rotate(0deg)'
    }, 300);
  }

  const getRemoteData = async (api: any, name: string) => {
    try {
      const { data } = await customPathApi(api)
      variableRef.current[name] = data.map(item => {
        return {
          label: item.name,
          value: item.uuid
        }
      })

      forceUpdate()
    } catch (error) {
      variableRef.current[name] = []
    }
  }

  const renderPlugins = (plugin: any) => {
    switch (plugin.length) {
      case 1:
        return renderOne(plugin[0])
      case 2:
        return renderTwo(plugin)
    }
  }

  const renderOne = (plugin: any) => {
    const { name, label, required, message, validator: validatorType, colon, hidden, noStyle, initialValue, tooltip, width, dependencies, shouldUpdate } = plugin

    return renderFormItem(plugin)

  }

  const renderFormItem = (plugin: any) => {
    const { name, label, required, message, validator: validatorType, colon, hidden, noStyle, initialValue, tooltip, width, dependencies } = plugin
    return <Form.Item style={{ width }} name={name} label={label} rules={[{ required, message }, { validator: validatorType ? (...arg) => validator[validatorType](...arg, form) : null }]} colon={colon} hidden={hidden} noStyle={noStyle} initialValue={initialValue} tooltip={tooltip} dependencies={dependencies}>
      {renderComponent(plugin.component, name)}
    </Form.Item>
  }

  const renderTwo = (plugin: any[]) => {
    return <div className='flex-space-between'>
      {
        plugin.map((item: any) => renderOne(item))
      }
    </div>
  }

  const renderComponent = (component: any, name: string) => {
    const { type } = component
    switch (type) {
      case 'radio':
        return renderRadio(component)
      case 'input':
        return renderInput(component)
      case 'remoteSelect':
        return renderRemoteSelect(component, name)

    }
    // return <Input type='number' min={1} />
  }

  const renderRadio = (component: any) => {
    const { radioList } = component
    return <Radio.Group>
      {
        radioList.map((radio: any) => (
          <Radio value={radio.value} disabled={radio.disabled}>{radio.label}</Radio>
        ))
      }
    </Radio.Group>
  }

  const renderInput = (component: any) => {
    const { placeholder, inputType, min, max } = component
    return <Input placeholder={placeholder} type={inputType} min={min} />
  }

  const renderRemoteSelect = (component: any, name: string) => {
    const { placeholder, api } = component

    if (variableRef.current) {
      const list = variableRef.current[name] = variableRef.current[name] || []
      if (!list || list.length <= 0) {
        getRemoteData(api, name)
      }
    }
    return (
      <>
        <Select
          allowClear
          showSearch
          optionFilterProp="children"
          placeholder={placeholder}
          filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
          options={variableRef.current[name] || []}
        />
        <div onClick={() => refresh(api, name)} className='credential-refresh' ref={refreshRef}>
          <ReloadOutlined style={{ color: '#9f9999', cursor: 'pointer' }} />
        </div>
      </>
    )
  }

  return (
    <div className='task-config-gitlab-container' ref={variableRef}>
      {
        list.map((plugin: any) => renderPlugins(plugin))
      }
    </div>
  );
}

export default Project
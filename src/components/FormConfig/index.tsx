import React, { useEffect, useState, useRef, useReducer, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Form, Input, Select, Button, Tabs, Radio, Checkbox } from 'antd'
import { ReloadOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'
import CodeMirror from '@uiw/react-codemirror';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';
import { langs } from '@uiw/codemirror-extensions-langs';

import './style.less'
import { getCredentialListApi, customPathApi } from './service'
import { validator } from '../../pages/pipeline/created/component/flow/component/configModal/data'
import { list } from './data'
import RepoComponent from '@/pages/pipeline/created/component/baseConfig/component/environmentVariable/components/newformRepo'
import BranchComponent from './component/formBranch'
import OutVariablesComponent from '@/pages/pipeline/plugin-market/component/outVariables';
import RemoteSearch from './component/remoteSearch'

const { TextArea } = Input;
let pluginConfig = {}
function Project(props, ref) {
  const { form, config, formItemlist = [], type, flowData = {} } = props

  const [scriptArrow, setScriptArrow] = useState({
    before: false,
    after: false,
  })

  const refreshRef = useRef<any>(null)
  const variableRef = useRef<any>({})

  const outVariablesRef = useRef(null)

  pluginConfig = config
  const [, forceUpdate] = useReducer(state => state + 1, 0)
  // const [formItemlist, setFormItemlist] = useState([]) 
  const reRequestRef = useRef(false)  // 是否需要重新执行接口

  // useEffect(() => {
  //   setFormItemlist(formItemlist)
  // }, [originFormItemlist])

  // const getData = async () => {
  //   const { data } = await getCredentialListApi({ size: 1000, page_num: 1 })
  //   setCredentialList()
  // }

  useImperativeHandle(ref, () => ({
    getValue,
    refresh,
  }))

  const getValue = (type) => {
    switch (type) {
      case 'out_variables':
        let value = []
        if (outVariablesRef.current) {
          value = outVariablesRef.current.getValue()
        }
        return value
    }
  }

  const initForm = () => {
    // 设置默认值
    formItemlist.forEach((item: any) => {
      item.forEach((formItem: any) => {
        let { fieldLevel, formItemConfig: { name, initialValue } } = formItem
        let value = config[name]
        if (fieldLevel) {
          value = fieldLevel.split('.').reduce((acc, curr, index, arr) => {
            if (index !== arr.length - 1 && !acc[curr]) {
              acc[curr] = {}
            }
            return acc[curr]
          }, config);
        }
        if ((value === undefined || value === null) && initialValue !== null && initialValue !== undefined) {
          fieldLevel = fieldLevel || name
          value = initialValue
          fieldLevel.split('.').reduce((acc, curr, index, arr) => {
            if (index === arr.length - 1) {
              acc[curr] = initialValue
            }
            return acc[curr];
          }, config);
        }
        // 特殊处理
        if (name === 'script' && !value) {
          value = initialValue
        }

        // 仓库类型需要清除多余设置字段
        if (name === 'repoName') {
          if (!value) {
            form.setFieldValue('git_url', undefined)
            form.setFieldValue('repoId', undefined)
          }
        }

        // if (name === 'out_variables') {
        //   setTimeout(() => {
        //     if (outVariablesRef.current) {
        //       outVariablesRef.current.setValue(value)
        //     }
        //   }, 100);
        // }
        if (name === 'script') {
          console.log(value)
        }
        form.setFieldValue(name, value)
      })
    })
  }

  const refresh = (api: any, name: string, formItemConfig: any, reRequest?: boolean) => {
    reRequestRef.current = reRequest || false
    if (refreshRef.current) {
      refreshRef.current.style.transform = 'rotate(360deg)'
      refreshRef.current.style.transition = 'all 0.6s'
    }
    getRemoteData(api, name, formItemConfig)
    setTimeout(() => {
      if (refreshRef.current) {
        refreshRef.current.style.transition = 'none'
        refreshRef.current.style.transform = 'rotate(0deg)'
      }
    }, 300);
  }

  const getRemoteData = async (api: any, name: string, formItemConfig: any) => {
    try {
      const { data } = await customPathApi(api)
      variableRef.current[name] = data.map(item => {
        if (typeof item !== 'object') {
          return {
            label: item,
            value: item
          }
        }
        return {
          label: item.name,
          value: item.uuid
        }
      })
      const list = variableRef.current[name]
      // 当选择项没有在列表中时,则删除
      const formName = formItemConfig.name
      const value = list.find(item => {
        return item.value === config[formName]
      })
      if (!value) {
        config[formName] = undefined
      }

      forceUpdate()
    } catch (error) {
      variableRef.current[name] = []
    }
  }

  const renderPlugins = (plugin: any) => {
    // console.log(plugin[0] == formItemlist[0][0])
    switch (plugin.length) {
      case 1:
        return renderOne(plugin[0])
      case 2:
      default:
        return renderTwo(plugin)
    }
  }

  const onclick = (eventInfo: any) => {
    const { buttonType, use, href, mode } = eventInfo
    switch (use) {
      case 'link':
        if (mode === 'new') {
          window.open(href)
        }
        break
    }
  }

  const handleArrow = (plugin) => {
    plugin.isArrowExpand = !plugin.isArrowExpand
    forceUpdate()
  }

  const renderOne = (plugin: any) => {

    // console.log(plugin[0] == formItemlist[0])

    const { shouldUpdate, dependencyKey, dependencyValue } = plugin
    if (shouldUpdate) {
      return <Form.Item  {...plugin.parentFormItemConfig} shouldUpdate>
        {
          () => {
            const value = form.getFieldValue(dependencyKey)
            if (value === dependencyValue) {
              return renderFormItem(plugin)
            }
            return <></>
          }
        }

      </Form.Item>
    }

    return renderFormItem(plugin)

  }

  const renderDropDown = (plugin) => {
    const { formItemConfig: { label, required }, isArrowExpand } = plugin

    return <div className='common-formConfig-arrow-box flex-space-between' style={{ width: '100%' }} onClick={() => handleArrow(plugin)}>
      <div className='flex-start'>{required && <div style={{ color: '#ff4d4f' }}>*&nbsp;&nbsp;</div>}{label}</div>
      <div className={`${!isArrowExpand && 'common-FormConfig-arrow-down-rotate'} common-FormConfig-arrow`}><DownOutlined /></div>
    </div>
  }

  const renderHide = (plugin) => {
    // {...plugin.formItemConfig}
    const { label, name, initialValue } = plugin.formItemConfig
    return <Form.Item name={name} initialValue={initialValue} noStyle></Form.Item>
  }

  const renderOutVariables = (plugin) => {
    const { formItemConfig: { label, required }, isArrowExpand } = plugin
    return <OutVariablesComponent variables={config.out_variables} isAuth={true} form={form} ref={outVariablesRef} label="" from="task" type={type} handleArrow={handleArrow} layout={2} plugin={plugin} isArrowExpand={isArrowExpand} />
  }

  const renderFormItem = (plugin: any) => {
    const { formItemConfig: { required, message, validator: validatorType }, isDropDown, isArrowExpand, hide, componentConfig } = plugin
    let rules = []
    if (validatorType || required) {
      rules = [{ required, message }, { validator: validatorType ? (...arg) => validator[validatorType](...arg, form, plugin.componentConfig) : null }]
    }

    // 处理事件
    if (plugin.componentConfig) {
      for (let key in plugin.componentConfig) {
        if (typeof plugin.componentConfig[key] === 'function') {
          const fn = plugin.componentConfig[key]
          plugin.componentConfig[key] = () => {
            fn(pluginConfig, form)
          }
        }
      }
    }

    // 隐藏、但需要传递服务端值的组件
    if (hide) {
      return renderHide(plugin)
    }
    // 需要下拉的组件
    if (isDropDown) {
      return <Form.Item {...plugin.formItemConfig} label={renderDropDown(plugin)} required={false} rules={rules} className={`${isArrowExpand ? 'common-FormConfig-arrow-down' : 'common-FormConfig-arrow-expand'}`}>
        {
          renderComponent(plugin.componentConfig, plugin.formItemConfig.name, plugin.formItemConfig, plugin?.flexibleParams)
        }
      </Form.Item>
    }
    // 仓库组件
    if (componentConfig.type === 'repo') {
      return renderRepo(plugin)
    }
    // 分支组件
    if (componentConfig.type === 'branch') {
      return renderBranch(plugin)
    }

    // 输出变量
    if (componentConfig.type === 'outVariables') {
      return renderOutVariables(plugin)
    }

    // 输出变量
    if (componentConfig.type === 'remoteSearchSelect') {
      return remoteSearchSelect(plugin.componentConfig, plugin.formItemConfig.name, plugin.formItemConfig)
    }

    // case 'remoteSearchSelect':
    //   return remoteSearchSelect(component, name, formItemConfig)

    return <Form.Item {...plugin.formItemConfig} rules={rules}>
      {renderComponent(plugin.componentConfig, plugin.formItemConfig.name, plugin.formItemConfig, plugin?.flexibleParams)}
    </Form.Item>
  }

  const renderTwo = (plugin: any[]) => {
    return <div className='flex-space-between'>
      {
        plugin.map((item: any) => renderOne(item))
      }
    </div>
  }

  const renderRepoIndex = (component) => {
    const repo = (flowData.setting?.pipeline_variable?.filter(item => item.type === 'repo') || [])
    return <Select
      allowClear
      showSearch
      optionFilterProp="children"
      placeholder="手动触发的流水线可指定仓库序号，默认为第一个仓库"
      filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
    >
      {
        repo.map((item, index) => (
          <Select.Option value={(repo.length - index) + ''}>
            {item?.repo?.[0]['repo-display_name'] || `仓库${index + 1}`}

          </Select.Option>
        ))
      }
    </Select>

  }

  const renderComponent = (component: any, name: string, formItemConfig, flexibleParams?: string) => {
    const { type } = component
    switch (type) {
      case 'props':
        return <>{props.children}</>
      case 'radio':
        return renderRadio(component)
      case 'input':
        return renderInput(component)
      case 'textarea':
        return renderTextarea(component)
      case 'button':
        return renderButton(component)
      case 'select':
        return renderSelect(component)
      case 'codeMirror':
        return renderCodeMirror(component, name)
      case 'checkbox':
        return renderCheckbox(component)
      case 'repoIndex':
        return renderRepoIndex(component)
      case 'remoteSelect':
        return renderRemoteSelect(component, name, formItemConfig, flexibleParams)
      // case 'remoteSearchSelect':
      //   return remoteSearchSelect(component, name, formItemConfig)
    }
    // return <Input type='number' min={1} />
  }

  const renderRadio = (component: any) => {
    const { radioList } = component
    return <Radio.Group>
      {
        radioList.map((radio: any) => (
          <Radio {...radio}>{radio.label}</Radio>
        ))
      }
    </Radio.Group>
  }

  const renderInput = (component: any) => {
    const { placeholder, inputType, min, max } = component
    return <Input {...component} type={inputType} />
  }

  const renderTextarea = (component: any) => {
    return <TextArea {...component} />
  }

  const renderSelect = (component: any) => {
    return <Select
      allowClear
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
      {...component}
    />
  }

  const renderCheckbox = (component: any) => {
    // delete component.type
    return <Checkbox {...component}>{component.checkboxText}</Checkbox>
  }

  const renderButton = (component: any) => {
    const { label, buttonType, event } = component
    return <Button type={buttonType} onClick={() => onclick(event)}>{label}</Button>
  }

  const renderCodeMirrorContent = (component: any, name, height?, readOnly?) => {
    return <Form.Item noStyle name={name}>
      <CodeMirror
        height={height || (component.height) || '500px'}
        extensions={[langs.shell()]}
        theme={xcodeDark}
        readOnly={type !== 1 || (readOnly === undefined ? component.readOnly : readOnly)}
      />
    </Form.Item>
  }

  const renderCodeMirror = (component: any, name) => {
    const { after, before } = scriptArrow
    return <div className={`${type !== 1 && 'formConfig-codeMirror-exec'} formconfig-codeMirror-container`}>
      <div className='formConfig-codeMirror-exec-layer'></div>
      {/* Before Script */}
      <div style={{ padding: '5px 0', cursor: 'pointer' }} className='flex-start' onClick={() => {
        setScriptArrow({
          before: !before,
          after
        })
      }}>
        <div>Before Script</div>&nbsp;
        <DownOutlined style={{ marginTop: '3px' }} className={`common-animation-arrow ${before && 'common-animation-arrow-active'}`} />
      </div>
      <div style={{ display: before ? 'block' : 'none', position: 'relative' }}>
        {renderCodeMirrorContent(component, 'before_script', '150px', false)}
      </div>
      {/* Script */}
      <div style={{ padding: '5px 0' }}>Script</div>
      <div className={component.readOnly && 'formConfig-codeMirror-exec'}>
        {renderCodeMirrorContent(component, name, component.height)}
      </div>

      {/* After Script */}
      <div style={{ padding: '5px 0', cursor: 'pointer' }} className='flex-start' onClick={() => {
        setScriptArrow({
          before,
          after: !after
        })
      }}>
        <div>After Script</div>&nbsp;
        <DownOutlined style={{ marginTop: '3px' }} className={`common-animation-arrow ${after && 'common-animation-arrow-active'}`} />
      </div>
      <div style={{ display: after ? 'block' : 'none' }}>
        {renderCodeMirrorContent(component, 'after_script', '150px', false)}
      </div>

    </div >
  }

  // flexibleParams: 额外增加的灵活入参字段名
  const renderRemoteSelect = (component: any, name: string, formItemConfig: any, flexibleParams?: any) => {
    const { placeholder, api } = component
    const _flexibleVal = form.getFieldValue(flexibleParams)
    const _flexibleParams = !!flexibleParams ? { [flexibleParams]: _flexibleVal } : {}
    if (!!flexibleParams && !_flexibleVal) {
      variableRef.current[name] = []
      reRequestRef.current = false
      return
    }
    if (variableRef.current) {
      if (reRequestRef.current || variableRef.current[name] === undefined) {
        getRemoteData({ ...api, params: { ...api?.params, ..._flexibleParams } }, name, formItemConfig)
        variableRef.current[name] = []
        reRequestRef.current = false
      }
    }
    return (
      <>
        <Form.Item noStyle name={name}>
          <Select
            allowClear
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
            options={variableRef.current[name] || []}
            {...component}
          />
        </Form.Item>
        <div onClick={() => refresh(api, name, formItemConfig)} className='credential-refresh' ref={refreshRef}>
          <ReloadOutlined style={{ color: '#9f9999', cursor: 'pointer' }} />
        </div>
      </>
    )
  }

  const remoteSearchSelect = (component: any, name: string, formItemConfig: any) => {
    return (
      <>
        <RemoteSearch component={component} name={name} formItemConfig={formItemConfig} form={form} config={config} forceUpdate={forceUpdate} />
      </>
    )
  }

  const repoChange = (info = {}, clearBranchField, fieldLevel) => {
    setValue(clearBranchField, '')
    setValue('variables.git_url', info['url'])
    setValue('variables.repoId', info['id'])
    setTimeout(() => {
      form.setFieldValue('git_url', info['url'])
      form.setFieldValue('repoId', info['id'])
    }, 100);
  }

  const findValue = (fieldLevel, name?) => {
    if (fieldLevel) {
      const value = fieldLevel.split('.').reduce((acc, curr, index, arr) => {
        if (index !== arr.length - 1 && !acc[curr]) {
          acc[curr] = {}
        }
        return acc[curr]
      }, config);
      return value
    } else {
      config[name]
    }

  }

  const setValue = (key, value) => {
    if (key.includes('.')) {
      key.split('.').reduce((acc, curr, index, arr) => {
        // 最后一层时，设置值
        if (index === arr.length - 1) {
          acc[curr] = value
        }
        return acc[curr];
      }, config);
    } else {
      config[key] = value
    }
  }

  const renderRepo = (plugin) => {
    const { formItemConfig, repoType, fieldLevel, clearBranchField } = plugin
    let value = ''
    if (fieldLevel) {
      value = findValue(fieldLevel)
    }
    const initUrl = findValue('variables.git_url')
    // return <Form.Item name="git_url" label="12">
    //   <input
    // </Form.Item>
    return <>
      <RepoComponent {...formItemConfig} repoType={repoType} repoChange={(...arg) => repoChange(...arg, clearBranchField, fieldLevel)} initialValue={value} isCopy={true} form={form} url={initUrl} />
    </>
  }

  const renderBranch = (plugin) => {
    const { formItemConfig, repoType, fieldLevel, repoIdField, componentConfig, customizeButton } = plugin
    return <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.repoId !== curValues.repoId} style={{ width: '100%' }}>
      {
        () => {
          // const repoId = form.getFieldValue(repoIdField)
          const repoName = form.getFieldValue('repoName')
          const repoId = form.getFieldValue('repoId') || config.variables?.repoId
          const initValue = config.variables?.ref
          return <BranchComponent name="ref" repoType={repoType} repoId={repoId} repoName={repoName} initialValue={null} currentDefaultValue={initValue} componentConfig={componentConfig} form={form} config={config} customizeButton={customizeButton} type={type} />
        }
      }
    </Form.Item>
  }

  initForm()

  return (
    <div className='task-config-gitlab-container'>
      {
        formItemlist.map((plugin: any) => {
          return renderPlugins(plugin)
        })
      }
    </div>
  );
}

export default forwardRef(Project)
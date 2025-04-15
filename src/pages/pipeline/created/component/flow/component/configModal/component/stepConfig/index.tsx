import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Form, Input, Select, Button, Tabs, Checkbox, Tooltip } from 'antd'
import { DownOutlined, UpOutlined, ReloadOutlined } from '@ant-design/icons'

import './style.less'
import { useReducer } from 'react';
import Gitlab from './component/gitlab'
import Shell from './component/shell'
import Plugins from '@/components/FormConfig'
import Review from './component/review'
import TriggerPipeline from './component/triggerPipeline'
import moment from 'moment'

import AddKeyValue from '../../../../../addKeyValue'
import AddKeyValueOut from '../../../../../addKeyValueOut'

import KeyValue from '@/components/formComponent/addKeyValue'
import { validator } from '../../data'

import { formItemMap } from './data'
import { getCompilePluginsApi } from './service'

function Project(props: any, ref: any) {
  const { config, type, showPlugin, handlePluginsModal, close, setConfig, handleLoading, data } = props
  const [control, setControl] = useState(true)

  const pluginRef = useRef<any>(null)
  const variableRef = useRef<any>(null)
  const addKeyValueRef = useRef<any>(null)
  const keyValueRef = useRef<any>(null)
  const pluginsRef = useRef<any>(null)
  const triggerPipelineRef = useRef<any>(null)

  const [, forceUpdate] = useReducer(state => state + 1, 0)

  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    validateFields,
    modifyField
  }))



  useEffect(() => {
    if (!config.variables) {
      config.variables = {}
    }
    setPluginTemplate()
    initValue()
  }, [])

  useEffect(() => {
    // initCompilePlugins()
  }, [])

  const modifyField = (key, value) => {
    form.setFieldValue(key, value)
    if (key === 'name') {
      config.name = value
    }
    // 暂时在这里处理
    if (config.variables) {
      config.variables.ref = ''
      config.variables.git_url = ''
      config.variables.repoName = ''
      config.variables.repoId = ''
    }
    // initCompilePlugins()
    setPluginTemplate('modify')
  }

  const handlePluginChange = (plugin, atomForm) => {
    // 重置上一个插件的参数
    config.atomForm?.forEach(plugins => {
      plugins.forEach(plugin => {
        const fieldLevel = plugin.fieldLevel
        if (plugin.fieldLevel) {
          fieldLevel.split('.').reduce((acc, curr, index, arr) => {
            if (index === arr.length - 1) {
              acc[curr] = undefined
            }
            return acc[curr];
          }, config);
        } else {
          config[plugin.formItemConfig.name] = undefined
        }
      })
    })

    config.out_variables = plugin.out_variables
    // 清除仓库附加字段
    config.variables.git_url = undefined
    config.variables.ref = undefined
    config.variables.repoId = undefined
    config.variables.repoName = undefined
  }

  const handleAtomForm = (atomForm, data) => {
    if (data.out_variables && data.out_variables.length > 0) {
      atomForm.push([
        {
          formItemConfig: {
            name: 'out_variables',
            label: '输出环境变量',
            style: {
              width: '100%',
            }
          },
          componentConfig: {
            type: 'outVariables',
          },
        },
      ])
    }
    // 添加前后script
    let hasScript = false
    atomForm.forEach((item: any) => {
      const v = item.find(item => item.formItemConfig.name === "script")
      if (v) {
        hasScript = true
      }
    })
    if (hasScript) {
      atomForm.push([
        {
          formItemConfig: {
            name: 'before_script',
            label: '',
            style: {
              width: '100%',
              display: 'none'
            },
            initialValue: undefined,
          },
          componentConfig: {
            type: 'input'
          },
        },
        {
          formItemConfig: {
            name: 'after_script',
            label: '',
            style: {
              width: '100%',
              display: 'none'
            },
            initialValue: undefined,
          },
          componentConfig: {
            type: 'input'
          },
        },
      ])
    }
  }

  const setPluginTemplate = async (from?) => {
    if (config.atom_id) {
      // debugger
      try {
        handleLoading(true)
        // 清空配置
        // if (from === 'modify') {
        //   config.variables = {}
        // }

        const { data } = await getCompilePluginsApi(config.atom_id)


        let atomForm = []
        // 字符串转换JSON
        if (data.json_form) {
          atomForm = eval('(' + data.json_form + ')')
        }
        // 初始化从Task中取
        if (from === 'modify') {
          handlePluginChange(data, atomForm)
        }
        handleAtomForm(atomForm, data)

        config.atomForm = atomForm

        config.variables.atomType = data.type

        if (Array.isArray(atomForm)) {
          atomForm.forEach(children => {
            children.forEach(item => {
              // 切换时，设置设定值
              if (from === 'modify') {
                config.script = data.script
              } else {
                // 初始值，不可读插件 则读取config中script，其他读取自己设置
                //  设置
                if (item?.componentConfig?.type === "codeMirror" && item?.componentConfig.readOnly) {
                  config.script = data.script
                } else {
                  // 自定义Shell设置，初始化时判断
                  if (!config.script) {
                    config.script = data.script
                  }
                }
              }
            })
          })
        }
        setConfig && setConfig({ ...config })
        forceUpdate()
      } catch (error) {
      } finally {
        setTimeout(() => {
          handleLoading(false)
        }, 200);
      }
    }

  }

  const initValue = () => {
    // 审核字段
    config.variables.users = config.variables.users || ''

    const userValue = config.variables.userValue || []
    form.setFieldValue('userValue', userValue)
    const from_trigger_env = config?.variables?.from_trigger_env
    if (from_trigger_env) {
      form.setFieldValue('users', userValue || '')
    } else {
      if (userValue.length > 0 && Array.isArray(userValue)) {
        form.setFieldValue('users', userValue.map(item => {
          return item.name + ' ' + item.user_id
        }))
      }
    }
    form.setFieldValue('from_trigger_env', config.variables.from_trigger_env)
    form.setFieldValue('direct_leader', config.variables.direct_leader)
    form.setFieldValue('confirm_rule', config.variables.confirm_rule || 'OR')
    form.setFieldValue('runtime_var', config.variables.runtime_var || [])
    form.setFieldValue('archive_comments', config.variables.archive_comments)

    form.setFieldValue('confirm_description', config.variables.confirm_description || '')
    form.setFieldValue('remind_again_at', config.variables.remind_again_at || 60)
    form.setFieldValue('event', config.variables.event || 'task')
    form.setFieldValue('remind_every', config.variables.remind_every || 60)
    form.setFieldValue('expire_type', config.variables.expire_type || 'never')
    form.setFieldValue('periodic', config.variables.periodic)
    if (config.variables.hour_minute) {
      form.setFieldValue('hour_minute', moment(config.variables.hour_minute || '', 'HH:mm'))
    }
    form.setFieldValue('by', config.variables.by)
    form.setFieldValue('week_index_week_day', config.variables.week_index_week_day)
    form.setFieldValue('week_interval', config.variables.week_interval)
    form.setFieldValue('expired_at', config.variables.expired_at || '')
    form.setFieldValue('opinions', config.variables.opinions || 1)
    form.setFieldValue('reason', config.variables.reason || '')

    form.setFieldValue('confirm_expire_button', config.variables.confirm_expire_button || 2)
    form.setFieldValue('expired_at_var', config.variables.expired_at_var || '')
    form.setFieldValue('confirm_expire_var', config.variables.confirm_expire_var || '')
    form.setFieldValue('expired_at_date', config.variables.expired_at_date ? moment(config.variables.expired_at_date) : '')

    form.setFieldValue('name', config.name)
    form.setFieldValue('active', config.active)
    form.setFieldValue('allow_failure', config.allow_failure)
    form.setFieldValue('run_condition', config.run_condition)

    // const { review_day, review_hour, review_minute, confirm_expire_date } = config.variables
    const { review_day, review_hour, review_minute, confirm_expire_date } = config.variables

    if (review_day !== undefined || review_hour !== undefined || review_minute !== undefined) {
      form.setFieldValue('review_day', review_day)
      form.setFieldValue('review_hour', review_hour)
      form.setFieldValue('review_minute', review_minute)
    } else {
      if (confirm_expire_date) {
        const date = moment.utc(confirm_expire_date * 60 * 1000).format("HH:mm").split(':')
        form.setFieldValue('review_hour', date[0])
        form.setFieldValue('review_minute', date[1])
      }
    }


    let timeout = config['timeout']
    if (timeout <= 0) {
      timeout = ''
    }
    form.setFieldValue('timeout', timeout)

    setTimeout(() => {
      if (config['custom_env']) {
        addKeyValueRef.current.setValue(config['custom_env'])
      }
      if (config['run_cond_custom_var']) {
        keyValueRef.current.setValue(config['run_cond_custom_var'])
      }
    }, 0);
    if (!config.atom_name) {
      setTimeout(() => {
        handlePluginsModal('show')
      }, 200);
    }
    setTimeout(() => {
      form.validateFields()
    }, 100);

  }

  // const initCompilePlugins = async () => {
  //   switch (config.name) {
  //     case 'GCC_5 Build':
  //     case 'Daily_GCC_7 Build':
  //     case 'Clang9 Build':
  //     case 'Aarch64 Cross Build':
  //     case 'Daily GCC_5 Official':
  //       const { data } = await getCompilePluginsApi(config.atom_id)
  //       form.setFieldValue('script', data.script)
  //       config.script = data.script
  //   }
  // }

  const validateFields = async () => {
    try {
      const values = await form.validateFields()
      if (triggerPipelineRef.current) {
        const { selected_pipeline, trigger_variables_2 } = await triggerPipelineRef.current.vaild()
        config.variables.selected_pipeline = selected_pipeline
        config.variables.trigger_variables_2 = trigger_variables_2
      }

      const { git_url, ref_type, ref, depth, repo_path } = values
      config['custom_env'] = addKeyValueRef.current.getValue()
      if (pluginsRef.current) {
        values.out_variables = pluginsRef.current.getValue('out_variables')
      }
      Object.keys(values).forEach((key: any) => {
        if (key.includes('0.')) {
          delete values[key]
          return
        }
        setCustomValue(key, values[key], values)
      })
      setCustomEnv()
      // 解决表单错误标识
      config.vaildFormError = false
      // 没有选择插件
      if (!config.atom_name) {
        config.vaildFormError = true
      }
      // 处理人工任务插件特殊处理
      const select = config.variables['confirm_expire_button']
      // 1 变量 2 时间
      if (select === 1) {
        config.variables['confirm_expire'] = config.variables['confirm_expire_var']
        config.variables['expired_at'] = config.variables['expired_at_var']
      } else {
        const sum = (config.variables['review_day'] * 24 * 60) + (config.variables['review_hour'] * 60) + config.variables['review_minute']
        config.variables['confirm_expire'] = sum
        config.variables['expired_at'] = config.variables['expired_at_date']
      }

      config.variables['userValue'] = config.variables['users']
      config.variables.runtime_var = values.runtime_var

    } catch (error) {
      if (triggerPipelineRef.current) {
        const { selected_pipeline, trigger_variables_2 } = triggerPipelineRef.current.saveError(error.values)
        config.variables.selected_pipeline = selected_pipeline
        config.variables.trigger_variables_2 = trigger_variables_2
      }
      config.variables.runtime_var = error?.values?.runtime_var || []
      error.errorFields.forEach(item => {
        const name = item.name[0]
        if (name === 'custom_env') {
          setCustomEnv()
        } else if (name === 'out_variables') {
          if (pluginsRef.current) {
            config.out_variables = pluginsRef.current.getValue('out_variables')
          }
        } else {
          // config[name] = ''
        }
      })
      config.vaildFormError = true
    }
  }

  const setCustomEnv = () => {
    if (addKeyValueRef.current) {
      config['custom_env'] = addKeyValueRef.current.getValue()
    }
  }

  const onChange = (e) => {
    const value = e.target.value
    config.name = value
    // forceUpdate()
  }

  const reselect = (e: Event) => {
    e.stopPropagation()
    handlePluginsModal('show', config.name)
  }

  const onValuesChange = (values: any) => {
    // 写入表单数据
    Object.keys(values).forEach(key => {
      const value = values[key]
      switch (key) {
        case 'runtime_var':
          break
        // case 'git_url':
        //   config['variables'].git_url = value
        //   break
        // case 'ref':
        //   config['variables'].ref = value
        //   break
        // case 'repo_path':
        //   config['variables'].repo_path = value
        //   break
        default:
          setCustomValue(key, value, values)
      }
    })
    config.variables['userValue'] = config.variables['users']
  }

  const handleUersValue = (value) => {
    let arr = []
    value?.forEach(item => {
      const data = item.split(' ')
      arr.push({
        name: data[0],
        user_id: data[1]
      })
    })
    return arr
  }

  const setCustomValue = (key: string, value: any, values) => {
    let iscustomValue = undefined
    // 处理低代码
    config.atomForm?.forEach((item: any) => {
      item.forEach((formItem: any) => {
        let { fieldLevel, formItemConfig: { name } } = formItem
        if (name === key && fieldLevel) {
          iscustomValue = true
          fieldLevel.split('.').reduce((acc, curr, index, arr) => {
            if (index === arr.length - 1) {
              acc[curr] = value
            }
            return acc[curr];
          }, config);
        }
      })
    })
    if (!iscustomValue) {
      switch (key) {
        // 审核字段
        case 'userValue':
          config.variables[key] = value
          break
        case 'users':
          // 自定义
          const from_trigger_env = config.variables['from_trigger_env']
          config.variables[key] = value
          if (!from_trigger_env) {
            config.variables[key] = handleUersValue(value)
          }
          break
        case 'expired_at_date':
          config.variables[key] = values ? moment(value).format('YYYY-MM-DD HH:mm:ss') : ''
          break
        case 'confirm_expire_date':
        case 'confirm_expire':
          const str = moment(value).format('HH:mm')
          const time = moment.duration(str).asMinutes()
          config.variables[key] = time
          break
        case 'hour_minute':
          config.variables[key] = moment(value).format('HH:mm')
          break
        case 'confirm_rule':
        case 'runtime_var':
        case 'archive_comments':
        case 'opinions':
        case 'event':
        case 'confirm_description':
        case 'expired_at':
        case 'remind_again_at':
        case 'remind_every':
        case 'confirm_expire_var':
        case 'expired_at_var':
        case 'confirm_expire_button':
        case 'expire_type':
        case 'week_index_week_day':
        case 'week_interval':
        case 'by':
        case 'periodic':
        case 'reason':
        case 'review_day':
        case 'review_hour':
        case 'review_minute':
        case 'from_trigger_env':
        case 'direct_leader':
          config.variables[key] = value
          break
        case 'run_cond_custom_var':
          config['run_cond_custom_var'] = keyValueRef.current.getValue().map(item => {
            return {
              key: item.key,
              value: item.value
            }
          })
          break
        case 'timeout':
          config.timeout = value || 0
          break
        default:
          config[key] = value
      }
    }
  }

  const versionChange = (v) => {
    // 获取对应插件id，查找插件下内容
    const data = {
      git_url: 10,
      ref: 30,
      credential: 'c-af6a3a4db5b54d49ae066ef5840c8d7c'
    }
    // 按照配置表单层级取到新值，写入config，然后刷新
    if (Array.isArray(config.atomForm)) {
      config.atomForm.forEach(children => {
        children.forEach(child => {
          const { fieldLevel, formItemConfig: { name } } = child
          // 存在则有层级
          if (fieldLevel) {
            fieldLevel.split('.').reduce((acc, curr, index, arr) => {
              // 最后一层时，设置值
              if (index === arr.length - 1) {
                if (data[curr]) {
                  acc[curr] = data[curr]
                }
              }
              return acc[curr];
            }, config);
          } else {
            if (data[name]) {
              config[name] = data[name]
            }
          }
        })
      })
    }
    forceUpdate()
  }

  const renderPluginEmpty = () => {
    return <Form.Item name="" label="插件" >
      <Button type='primary' onClick={(e) => reselect(e)}>请在左侧选择一个插件</Button>
    </Form.Item>
  }

  const renderPluginSelect = () => {
    return <div className='flex-space-between layout-container'>
      <div className='layout-text'>
        <h3 className='layout-text-title'>插件:</h3>
        <div className='flex-space-between'>
          <div className='layout-text-box flex-space-between'>
            <span className='layout-text-box-plugin'>{config.atom_name}</span>
            <Button type='primary' onClick={(e) => reselect(e)}>重选</Button>
          </div>&nbsp;&nbsp;&nbsp;
          {/* 刷新插件按钮 */}
          <Tooltip title="刷新插件配置">
            <Button icon={<ReloadOutlined />} type='link' onClick={() => setPluginTemplate('modify')}></Button>
          </Tooltip>

        </div>
      </div>
      {/* <div className='layout-text'>
        <h3 className='layout-text-title'>版本:</h3>
        <Form.Item name="" label="" noStyle initialValue={config.version || 'latest'}>
          <Select
            disabled
            onChange={(v) => versionChange(v)}
            allowClear
            options={[
              {
                value: 'latest',
                label: 'latest',
              },
            ]}
          />
        </Form.Item>
      </div> */}
    </div>
  }

  const renderPluginForm = () => {
    // 先按照插件类型
    switch (config?.variables?.atomType) {
      case 'manual':
        return <Review form={form} config={config} {...props} from={type} onValuesChange={onValuesChange} close={close} />
      default:
        // 按照具体插件
        switch (config?.atom_name) {
          case '触发流水线':
            return <>
              <Plugins form={form} config={config} {...props} from={type} formItemlist={config.atomForm} ref={pluginsRef} flowData={data}>
                <TriggerPipeline form={form} config={config} {...props} from={type} formItemlist={config.atomForm} ref={triggerPipelineRef} flowData={data} />
              </Plugins>
            </>
          default:
            return <Plugins form={form} config={config} {...props} from={type} formItemlist={config.atomForm} ref={pluginsRef} flowData={data} />
        }

    }

    return <></>
  }

  const renderEnv = () => {
    return <AddKeyValue ref={addKeyValueRef} from={type} form={form} type={type} />


  }

  const keyValueChange = (configList) => {
    config['run_cond_custom_var'] = configList
  }

  return (
    <div className='flex-task-config-container' ref={variableRef}>
      <Form layout="vertical" form={form} name="control-hooks" disabled={type !== 1} onValuesChange={onValuesChange}>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]} initialValue={config.name}>
          {/* <Form.Item name="name" label="名称" initialValue={config.name}> */}
          <Input value={config.name} onChange={onChange} maxLength={50} placeholder='长度为50个字符' />
        </Form.Item>
        {
          config.atom_name ? renderPluginSelect() : renderPluginEmpty()
        }
        {
          renderPluginForm()
        }

        {/* ------------环境变量---------------- */}
        {
          renderEnv()
        }
        {/* ------------流程控制---------------- */}
        <div className='control-box'>
          <div className='control flex-space-between' onClick={() => setControl(!control)}>
            流程控制选项
            <UpOutlined className={`control-arrow ${!control && 'control-arrow-action'}`} />
          </div>
          {
            <div className='form-control' style={{ display: control ? 'block' : 'none' }}>
              <Form.Item name="active" valuePropName="checked" colon={false} >
                <Checkbox>启用本 Task</Checkbox>
              </Form.Item>
              <Form.Item name="allow_failure" valuePropName="checked" colon={false} >
                <Checkbox>失败后继续</Checkbox>
              </Form.Item>
              {/* <Form.Item name="timeout" label="插件执行超时时间" rules={[{ required: false, message: '' }, { validator: (info, value) => validator['timeout'](info, value, false) }]}>
                <Input placeholder='默认无超时' type='number' suffix={'分钟'} />
              </Form.Item> */}
              <Form.Item name="run_condition" label="何时运行本插件" initialValue={'pre_task_success'}>
                <Select
                  options={[
                    {
                      value: 'pre_task_success',
                      label: '所有前置插件运行成功时(包括失败后继续)',
                    },
                    {
                      value: 'pre_task_failed',
                      label: '只有前面插件有失败时才运行',
                    },
                    {
                      value: 'always',
                      label: '即使有前置插件运行失败也运行，除非被取消才不运行',
                    },
                    // {
                    //   value: 'always_even_cancel',
                    //   label: '即使有前置插件运行失败也运行，即使被取消也运行',
                    // },
                    {
                      value: 'custom_variable_match',
                      label: '自定义变量全部满足时运行',
                    },
                    {
                      value: 'custom_variable_match_not_run',
                      label: '自定义变量全部满足时不运行',
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item shouldUpdate noStyle>
                {
                  () => {
                    const runCondition = form.getFieldValue('run_condition')
                    if (runCondition === 'custom_variable_match' || runCondition === 'custom_variable_match_not_run') {
                      return <KeyValue formCOnfig={{ label: '变量', name: 'run_cond_custom_var' }} ref={keyValueRef} from={type} form={form} type={type} value='value' keys='key' keyValueChange={keyValueChange} />
                    }
                    return <></>
                  }
                }
              </Form.Item>
            </div>
          }
        </div>

      </Form>
    </div>
  );
}

export default forwardRef(Project)
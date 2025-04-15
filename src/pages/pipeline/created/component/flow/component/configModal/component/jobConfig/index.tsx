import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef, useReducer } from 'react';
import { Form, Input, Select, Radio, Checkbox, Tooltip } from 'antd'
import { DownOutlined, UpOutlined, QuestionCircleOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'

import { customConfig, priority_class_name } from './data'
import './style.less'
import { send, runnerTypeApi, getTagApi, getTemplateListApi } from './service'
import { validator } from '../../data'
import AddKeyValue from '../../../../../addKeyValue'
import FormConfig from '@/components/FormConfig'
import Mixed from './component/mixed'
import KeyValue from '@/components/formComponent/addKeyValue'

const { TextArea } = Input;

function Project(props: any, ref: any) {
  const { config, type } = props
  const [control, setControl] = useState(true)
  const [custom_env, setEnv] = useState(true)
  const [runnerTypes, setRunnerTypes] = useState([])
  const [tagOptions, setTagOptions] = useState([])
  const [templateList, setTemplateList] = useState([])
  const [, forceUpdate] = useReducer(state => state += 1, 0)
  const customConfigRef = useRef(customConfig)
  const addKeyValueRef = useRef<any>(null)
  const addKeyValueNfsRef = useRef<any>(null)
  const formConfigRef = useRef<any>(null)
  const mixedRef = useRef<any>(null)
  const keyValueRef = useRef<any>(null)

  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    validateFields
  }))

  useEffect(() => {
    getTemplateList()
    initValue()
    getRunnerType()
  }, [])

  const initValue = () => {
    form.setFieldValue('name', config.name)
    form.setFieldValue('agent_type', config.agent_type || 'kubernetes')
    changeAgentType(config.agent_type || 'kubernetes')
    form.setFieldValue('image', config.image || 'mobile')
    form.setFieldValue('trigger_type', config.trigger_type || 'AUTO')
    form.setFieldValue('fast_fail', config.fast_fail)
    form.setFieldValue('sample_count', config.sample_count)
    form.setFieldValue('threshold', config.threshold)

    if (config.image_info === undefined) {
      config.image_info = 'artifact.enflame.cn/enflame_docker_images/ubuntu/qic_ubuntu_1804_gcc7:latest'
    }
    form.setFieldValue('image_info', config.image_info)
    form.setFieldValue('pull_policy', config.pull_policy)
    form.setFieldValue('priority_class_name', config.priority_class_name)
    form.setFieldValue('pod_spec_patch', config.pod_spec_patch)
    form.setFieldValue('node_selector', config.node_selector || [])
    form.setFieldValue('mixed_list', config.mixed_list || [])

    form.setFieldValue('cloned', config.cloned)
    form.setFieldValue('auto_calculate_cloned_count', config.auto_calculate_cloned_count)
    form.setFieldValue('cloned_count', config.cloned_count || 1)
    // tag
    form.setFieldValue('tag', config.tag)
    form.setFieldValue('has_variable_in_tag', config.has_variable_in_tag)

    form.setFieldValue('template_name', config.template_name)
    form.setFieldValue('tag_or_vm', config.tag_or_vm || 'tag')
    let timeout = config['timeout']
    if (timeout <= 0) {
      timeout = ''
    }
    form.setFieldValue('timeout', timeout)

    form.setFieldValue('active', config.active)
    form.setFieldValue('allow_failure', config.allow_failure)
    form.setFieldValue('run_condition', config.run_condition || 'pre_task_success')
    forceUpdate()

    setTimeout(() => {
      if (config['custom_env']) {
        addKeyValueRef.current.setValue(config['custom_env'])
      }
      if (config['mounts']) {
        addKeyValueNfsRef.current.setValue(config['mounts'])
      }
      if (config['run_cond_custom_var']) {
        keyValueRef.current.setValue(config['run_cond_custom_var'])
      }
    }, 0);

    setTimeout(() => {
      form.validateFields()
    }, 100);
  }

  const getTemplateList = async () => {
    const { data } = await getTemplateListApi({ size: 1000, page_num: 1 })
    setTemplateList(data.map(item => {
      return {
        label: item,
        value: item
      }
    }))
  }

  const getTag = async (type) => {
    const { data } = await getTagApi({ size: 1000, page_num: 1, agent_type: type })
    setTagOptions(data.map(item => {
      return {
        label: item,
        value: item
      }
    }))
  }

  const getRunnerType = async () => {
    const { success = false, data = [] } = await runnerTypeApi()
    setRunnerTypes(data || [])
  }

  const validateFields = async () => {
    try {
      const values = await form.validateFields()
      // 设置服务端需要的job表单字段
      if (values.nfs) {
        // config['nfs'] = addKeyValueNfsRef.current.getValue()
        setCustomEnv('mounts')
      } else {
        config['mounts'] = null
      }
      config.run_condition = values.run_condition
      Object.keys(values).forEach((key: any) => {
        setCustomValue(key, values[key])
      })
      setCustomEnv('custom_env')
      // 解决表单错误标识
      config.vaildFormError = false
    } catch (error) {
      config.node_selector = error?.values?.node_selector || []
      config.mixed_list = error?.values?.mixed_list || []
      error.errorFields.forEach(item => {
        const name = item.name[0]
        if (name === 'custom_env' || name === 'mounts') {
          setCustomEnv(name)
        } else {
          // config[name] = ''
        }
      })
      config.vaildFormError = true
    }
  }

  const setCustomEnv = (key) => {
    const current = key === 'custom_env' ? addKeyValueRef.current : addKeyValueNfsRef.current
    if (current) {
      config[key] = current.getValue()
    }
  }

  const onChange = (values: any) => {
    forceUpdate()
    // 写入表单数据
    Object.keys(values).forEach(key => {
      const value = values[key]
      switch (key) {
        default:
          setCustomValue(key, value)
      }
    })
  }

  const setCustomValue = (key: string, value: any) => {
    let iscustomValue = undefined
    customConfigRef?.current?.forEach((item: any) => {
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
        case 'timeout':
          config.timeout = value || 0
          break
        case 'run_cond_custom_var':
          config['run_cond_custom_var'] = keyValueRef.current.getValue().map(item => {
            return {
              key: item.key,
              value: item.value
            }
          })
          break
        default:
          config[key] = value
      }
    }
  }

  const validateEnv = () => {
    const values: any[] = addKeyValueRef.current.getValue()
    for (let i = 0; i < values.length; i++) {
      const item = values[i]
      if (!item.key) {
        return Promise.reject(new Error('请填写 key'))
      }
      if (!item.value) {
        return Promise.reject(new Error('请填写 value'))
      }
    }
    return Promise.resolve()
  }

  const validateNfs = () => {
    const values: any[] = addKeyValueNfsRef.current.getValue()
    for (let i = 0; i < values.length; i++) {
      const item = values[i]
      if (!item.source) {
        return Promise.reject(new Error('请填写 key'))
      }
      if (!item.destination) {
        return Promise.reject(new Error('请填写 value'))
      }
    }
    return Promise.resolve()
  }

  const validatorClonedCount = (info, value) => {

    const regex = /^\d+$/;
    if (!regex.test(value)) {
      return Promise.reject('请输入1~9之间的整数')
    }

    if (!value || value <= 0 || value > 9) {
      return Promise.reject('请输入1~9之间的整数')
    }

    const v = String(value)
    if (v.length >= 2 && v[0] === '0' || v.includes('.')) {
      return Promise.reject('请输入1~9之间的整数')
    }
    return Promise.resolve()
  }

  const normalizeNumber = (value) => {
    if (!value) {
      return value;
    }
    const regex = /^\d+$/;
    if (regex.test(value)) {
      Number(value);
    }
    return value;
  };

  const changeAgentType = (value: string, reRequest = false) => {
    let type = Object.assign([], customConfig)
    customConfigRef.current = type;

    if (value !== 'kubernetes') {
      type = []
    }
    if (reRequest) {
      config.tag = undefined
      form.setFieldValue('tag', undefined)
    }
    customConfigRef.current = type;
    if (value === 'mixed') {
      setTimeout(() => {
        mixedRef.current.getOptionsData()
        if (!config.mixed_list || config.mixed_list.length <= 0) {
          form.setFieldValue('mixed_list', [{}])
        }
      }, 100);
    } else {
      getTag(value)
    }
  };

  const renderTag = () => {
    return <Form.Item shouldUpdate noStyle>
      {
        () => {
          const has_variable_in_tag = form.getFieldValue('has_variable_in_tag')
          return <div className='flex-space-between'>
            {
              has_variable_in_tag
                ?
                <Form.Item name={'tag'} label="节点 Tag" style={{ width: '85%' }}>
                  <Input
                    placeholder='自定义'
                    style={{ height: '32px' }}
                  />
                </Form.Item>
                :
                <Form.Item name={'tag'} label="节点 Tag" style={{ width: '85%' }}>
                  <Select
                    allowClear
                    showSearch
                    placeholder="请选择"
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
                    options={tagOptions}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
            }

            <Form.Item noStyle name={'has_variable_in_tag'} label="" style={{ width: '300px' }} valuePropName="checked" initialValue={false}>
              <Checkbox
                onChange={(e) => {
                  config.tag = undefined
                  form.setFieldValue('tag', undefined)
                }}
              >自定义</Checkbox>
            </Form.Item>
            {/* <div onClick={() => refresh(api, name, formItemConfig)} className='credential-refresh' ref={refreshRef}>
              <ReloadOutlined style={{ color: '#9f9999', cursor: 'pointer' }} />
            </div> */}
          </div>
        }
      }
    </Form.Item>
  }

  const tramplateNameValidator = (info, value) => {
    if (!value) {
      return Promise.reject('请输入Tag')
    } else if (value.length > 100) {
      return Promise.reject('最多输入100个字符')
    }
    return Promise.resolve()
  }

  const handleAdd = (add) => {
    add()
    setTimeout(() => {
      form.validateFields()
    }, 200);
  }

  const renderTemplate = () => {
    return <Form.Item label="Tag" name="template_name" rules={[{ required: true, message: '' }, { validator: tramplateNameValidator }]}>
      {/* return <Form.Item label="模版列表" name="template_name" rules={[{ required: true, message: '请选择模板' }]}> */}
      {/* <Select
        allowClear
        showSearch
        placeholder="请选择"
        optionFilterProp="children"
        filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
        options={templateList}
        style={{ width: '100%' }}
      /> */}
      <Input placeholder="可以输入多个，以 || 分隔" />
    </Form.Item>
  }

  const handleRemove = (e, remove, index, name) => {
    e.stopPropagation()
    remove(name)
    form.validateFields()
  }

  const validatorNumber = (info, value) => {
    const regex = /^[1-9]\d*$/;
    if (!regex.test(value)) {
      return Promise.reject('请输入大于0的整数')
    }
    return Promise.resolve()
  }
  const validatorTotal = (info, value) => {
    const regex = /^([1-9]\d*|\$\{.+\})$/;
    if (!regex.test(value)) {
      return Promise.reject(`请输入大于0的整数或环境变量`)
    }
    return Promise.resolve()
  }

  const keyValueChange = (configList) => {
    config['run_cond_custom_var'] = configList
  }


  return (
    <Form layout="vertical" className='flow-job-config-container' form={form} name="control-hooks" disabled={type !== 1} onValuesChange={onChange}>

      <Form.Item name="name" label="Job 名称" rules={[{ required: true, message: '请输入名称' }]} initialValue={null}>
        <Input maxLength={50} placeholder='长度为50个字符' />
      </Form.Item>
      <Form.Item name="trigger_type" label="触发方式" initialValue={'AUTO'} style={{ marginBottom: '7px' }}>
        <Radio.Group >
          <Radio value={'AUTO'}>自动</Radio>
          <Radio value={'MANUAL'}>手动</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item name="fast_fail" label="" initialValue={false} valuePropName="checked" style={{ marginBottom: '10px' }}>
        <Checkbox>启用 FastFail</Checkbox>
      </Form.Item>

      {/* 动态创建 */}

      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const cloned = form.getFieldValue('cloned')
            const clonedType = form.getFieldValue('auto_calculate_cloned_count')
            return <div style={{ border: '1px solid #eee', marginBottom: '10px', padding: '5px 10px' }}>
              <Form.Item name="cloned" label="" initialValue={false} valuePropName="checked" style={{ marginBottom: '0px' }}>
                <Checkbox>动态创建</Checkbox>
              </Form.Item>
              {
                cloned && <>
                  <div className='flex-start' style={{ alignItems: 'flex-start' }}>
                    <Form.Item name="auto_calculate_cloned_count" label="创建方式" initialValue={true} style={{ marginBottom: '3px' }} >
                      <Radio.Group >
                        <Radio value={true}>自动计算&nbsp;
                          <Tooltip title="自动计算：生成的并行 Job 数量，介于1~9之间">
                            <QuestionCircleOutlined style={{ fontSize: '14px', color: '#00000073', cursor: 'help' }} />
                          </Tooltip>
                        </Radio>
                        <Radio value={false}>自定义数量</Radio>
                      </Radio.Group>
                    </Form.Item>
                    {
                      !clonedType && <Form.Item name="cloned_count" label=" " style={{ flex: 1, marginBottom: '5px' }} initialValue={1} rules={[{ required: false, validator: validatorClonedCount }]}
                        getValueFromEvent={e => normalizeNumber(e.target.value)} >
                        <Input min={1} max={9} placeholder='1~9之间的整数' />
                      </Form.Item>
                    }
                  </div>
                  {
                    clonedType && <>
                      <Form.Item name='sample_count' label="样本总数" rules={[{ required: true, message: '' }, { validator: validatorTotal }]} style={{ marginBottom: '5px' }}>
                        <Input placeholder='请输入大于0的整数或格式为${x}的环境变量' />
                      </Form.Item>
                      <Form.Item name='threshold' label="阈值" rules={[{ required: true, message: '' }, { validator: validatorTotal }]}>
                        <Input placeholder='请输入大于0的整数或格式为${x}的环境变量' />
                      </Form.Item>
                    </>
                  }
                </>
              }
            </div>
          }
        }
      </Form.Item>

      <div className='flow-job-config-agent-type'>
        <Form.Item name="agent_type" label="构建资源类型" rules={[{ required: true, message: '请选择构建资源类型' }]} initialValue={undefined}>
          <Select
            options={runnerTypes}
            onChange={(e) => changeAgentType(e, true)}
            fieldNames={{
              label: 'value',
              value: 'id'
            }}>
          </Select>
        </Form.Item>
        {/* 混合资源类型 */}

        <Form.Item noStyle shouldUpdate>
          {
            () => {
              const agent_type = form.getFieldValue('agent_type')
              if (agent_type === 'mixed') {
                return <Mixed form={form} config={config} type={type} ref={mixedRef} />
              }
              if (['metal', 'kubernetes', 'docker'].includes(agent_type)) {
                return renderTag()
              }
              return <>
                {/* <Form.Item name="tag_or_vm" initialValue={1}>
                  <Radio.Group >
                    <Radio value='tag'>运行节点 Tag</Radio>
                    <Radio value='vm'>动态申请虚拟机</Radio>
                  </Radio.Group>
                </Form.Item> */}
                {/* Tag */}
                <Form.Item noStyle shouldUpdate>
                  {
                    () => {
                      const tag_or_vm = form.getFieldValue('tag_or_vm')
                      switch (tag_or_vm) {
                        case 'tag':
                          return renderTag()
                        case 'vm':
                          return renderTemplate()
                      }
                    }
                  }
                </Form.Item>
              </>
            }
          }
        </Form.Item>

        {/* 模板 */}
        {
          ['kubernetes', 'docker'].includes(form.getFieldValue('agent_type')) && <>
            <Form.Item name="image" label="镜像" rules={[{ required: true, message: '请选择镜像' }]} initialValue={'mobile'} >
              <Radio.Group >
                <Radio value={'list'} disabled>从列表选择</Radio>
                <Radio value={'mobile'}>手动输入</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="image_info" label="路径" rules={[{ required: true, message: '请输入镜像路径' }]} initialValue={'artifact.enflame.cn/enflame_docker_images/ubuntu/qic_ubuntu_1804_gcc7:latest'} >
              <Input placeholder='请输入完整镜像路径，如 docker.io/bkci/ci' />
            </Form.Item>
            <Form.Item name="pull_policy" label="镜像拉取策略" >
              <Select
                allowClear
                placeholder="请选择"
                options={[
                  {
                    label: 'never', value: 'never'
                  },
                  {
                    label: 'if-not-present', value: 'if-not-present'
                  },
                  {
                    label: 'always', value: 'always'
                  },
                ]}>
              </Select>
            </Form.Item>
          </>
        }

        <FormConfig ref={formConfigRef} form={form} config={config} {...props} from={type} formItemlist={customConfigRef?.current} />

        <Form.Item noStyle shouldUpdate>
          {
            () => {
              const agent_type = form.getFieldValue('agent_type')
              if (agent_type !== 'kubernetes') {
                return <></>
              }
              return <>
                nodeSelector
                <Form.List name="node_selector" style={{ marbottom: '0' }}>

                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }, index) => (
                        <div className='item-runtime_var'>
                          <div className='flex-space-between' style={{ alignItems: 'flex-start', marginBottom: '5px' }}>
                            <Form.Item  {...restField} name={[name, 'key']} initialValue={''} rules={[{ required: true, message: '请输入' }]} style={{ marginBottom: '0px', width: '46%' }}>
                              <Input prefix={'key:'} maxLength={100} />
                            </Form.Item>
                            <Form.Item  {...restField} name={[name, 'value']} initialValue={''} rules={[{ required: true, message: '请输入' }]} style={{ marginBottom: '0px', width: '46%' }}>
                              <Input prefix={'value:'} maxLength={100} />
                            </Form.Item>
                            {
                              type === 1 && <div className='minus flex-center' onClick={(e) => handleRemove(e, remove, index, name)}><MinusOutlined /></div>
                            }

                          </div>
                        </div>
                      ))}
                      {
                        <Form.Item noStyle>
                          {/* 加 */}
                          {
                            type === 1 && <div className='plus flex-center' onClick={() => handleAdd(add)}>
                              <PlusOutlined />
                            </div>
                          }
                        </Form.Item>
                      }
                    </>
                  )}
                </Form.List>

                <Form.Item label="priorityClass" name="priority_class_name" initialValue={'middle-priority'}>
                  <Select options={priority_class_name}></Select>
                </Form.Item>
                <Form.Item label="自定义 K8s 配置" name="pod_spec_patch">
                  <TextArea
                    placeholder="请输入 yaml 文本内容"
                    autoSize={{ minRows: 2, maxRows: 14 }}
                  />
                </Form.Item>
              </>
            }
          }
        </Form.Item>
      </div>

      {/* ------------环境变量---------------- */}
      <AddKeyValue ref={addKeyValueRef} from={type} form={form} type={type} />
      {/* ------------流程控制---------------- */}
      <div className='control-box'>
        <div className='control flex-space-between' onClick={() => setControl(!control)}>
          流程控制选项
          <UpOutlined className={`control-arrow ${!control && 'control-arrow-action'}`} />
        </div>
        {
          <div className='form-control' style={{ display: control ? 'block' : 'none' }}>
            <Form.Item name="active" valuePropName="checked" colon={false} >
              <Checkbox>启用本 Job</Checkbox>
            </Form.Item>
            <Form.Item name="timeout" label="Job 执行超时时间" rules={[{ required: false, message: '' }, { validator: (info, value) => validator['timeout'](info, value, false) }]}>

              <Input min={1} placeholder='默认超时时间为2小时' type='number' suffix={'分钟'} />
            </Form.Item>
            <Form.Item name="run_condition" label="何时运行本 Job" initialValue={'pre_task_success'}>
              <Select
                // disabled
                options={[
                  {
                    value: 'pre_task_success',
                    label: '前置 Job 都成功才运行',
                  },
                  {
                    value: 'pre_task_failed_even_cancel',
                    label: '前置 Job 有失败也运行，即使被取消也运行',
                  },
                  {
                    value: 'pre_task_failed_but_cancel',
                    label: '前置 Job 有失败也运行，除非被取消才不运行',
                  },
                  {
                    value: 'only_pre_task_failed_but_cancel',
                    label: '只有前置 Job 有失败时才运行',
                  },
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
    </Form >
  );
}

export default forwardRef(Project)
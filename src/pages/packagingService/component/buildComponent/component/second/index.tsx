import React, { forwardRef, useEffect, useState, useImperativeHandle, useMemo } from 'react';

import { Form, Checkbox, Radio, Input, Empty, Spin } from 'antd'
import { SearchOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons'
import './style.less'
import { getCommonPresetsApi, getSearchpresetsApi } from './service'
import debounce from 'lodash/debounce';

interface Props {
  buildOptions: any[]
  step: number
  getFirstValue(): any
  detail: any
}
function Project(props: Props, ref) {
  const { buildOptions, getFirstValue, step, detail, } = props
  const [tabIndex, setTabIndex] = useState(1)
  const [commonTemplate, setCommonTemplate] = useState({
    suggest: [],
    common: []
  })
  const [searchOptions, setSearchOptions] = useState({ presets: [] })
  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm();
  const [templateForm] = Form.useForm();

  let detailValues = {}
  detail?.trigger_info?.variables?.forEach((item: any) => {
    detailValues[item.key] = item.value
  })

  if (!buildOptions?.options) {
    return <></>
  }


  const getFormValue = async () => {
    if (tabIndex === 1) {
      return await form.validateFields()
    } else {
      return await templateForm.validateFields()
    }
  }

  useEffect(() => {
    if (step === 2) {
      getCommonPresets()
    }
    return () => {
      form.resetFields()
    }
  }, [step])


  useImperativeHandle(ref, () => ({
    getFormValue
  }))

  const getCommonPresets = async () => {
    const params = await getFirstValue()
    const { data } = await getCommonPresetsApi(params)
    const defaultValue = data.suggest[0]?.value || data.common[0]?.value
    templateForm.setFieldValue('preset', detailValues?.preset || defaultValue)
    templateForm.setFieldValue('search', '')
    setCommonTemplate(data)
  }


  const validatorMultiple = (info, field, data, key) => {
    const value = form.getFieldValue(key)
    if (!value || value.length <= 0) {
      return Promise.reject('请至少选择一个')
    }
    return Promise.resolve()
  }

  const radioChange = (e) => {
    setTabIndex(e.target.value)
  }

  const searchTemplateName = async (e: any) => {
    try {
      setLoading(true)
      const { value } = e.target
      // if (value) {
      //   templateForm.setFieldValue('preset', '')
      // }
      const params = await getFirstValue()
      params.keyword = (value || '').trim()
      const { data } = await getSearchpresetsApi(params)
      // data.presets = []
      setSearchOptions(data)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const templateValidator = (info) => {
    const value = templateForm.getFieldValue('preset')
    if (!value) {
      return Promise.reject('请选择一个模板')
    }
    return Promise.resolve()
  }


  const debounceFetcher = debounce(searchTemplateName, 500);

  const renderTab = () => {
    return <div className='second-tab flex-center'>
      <Radio.Group defaultValue={tabIndex} buttonStyle="solid" onChange={radioChange}>
        <Radio.Button value={1}>自定义</Radio.Button>
        <Radio.Button value={2}>编译模板</Radio.Button>
      </Radio.Group>
    </div>
  }

  const renderMultiple = (item) => {
    let value = item.default || form.getFieldValue(item.key) || []
    const options = [];
    item?.choices.forEach(option => {
      const val = option.value
      const actionValue = value.find(selectValue => selectValue === val)
      // options.push({ label: <div className={`option flex-center ${actionValue && 'action'}`}>{option.name}</div>, value: val })
      options.push({ label: <div className={``}>{option.name}</div>, value: val })
    })
    return <Form.Item name={item.key} label={item.name + '（多选）'} initialValue={value} rules={[{ required: true, message: '' }, { validator: (...arg) => validatorMultiple(...arg, item.key) }]}>
      <Checkbox.Group options={options} >
      </Checkbox.Group>
    </Form.Item>
  }

  const handleDisable = (item, radio) => {
    const { name, key } = item
    if (key === 'toolchain') {
      // 获取系统架构值
      const targetValue = form.getFieldValue('arch')
      // 只有工具链需要设置disabled
      if (targetValue === 'arm64') {
        if (radio.value !== 'gcc5') {
          return true
        }
      }
    }
    // 工具链 gcc7 禁用
    // if (key === 'toolchain') {
    //   if (radio.value === 'gcc7') {
    //     return true
    //   }
    // }

    if (key === 'sanitizer') {
      const targetValue = form.getFieldValue('toolchain')
      if (targetValue !== 'clang9') {
        if (radio.value !== 'off') {
          return true
        }
      }
    }
    return false
  }

  const choiceChange = (e, item) => {
    const { value } = e.target
    const { key } = item
    // 只有系统架构 单独设置值
    if (key === 'arch' && value === 'arm64') {
      form.setFieldValue('toolchain', 'gcc5')
      form.setFieldValue('sanitizer', 'off')
    }
    if (key === 'toolchain' && value !== 'clang9') {
      form.setFieldValue('sanitizer', 'off')
    }
  }

  const renderChoice = (item) => {
    let value = item.default[0] || form.getFieldValue(item.key) || ''
    const options = [];
    item?.choices.forEach(option => {
      const val = option.value
      const actionValue = value === val

      // options.push({ label: <div className={`option flex-center ${actionValue && 'action'}`}>{option.name}</div>, value: val })
      options.push({ label: <div className={`'}`}>{option.name}</div>, value: val })
    })
    const label = item.key === 'sanitizer' ? item.name + '（仅 clang9 支持 asan & tsan）' : item.name
    return <Form.Item name={item.key} label={label} initialValue={value} required>
      <Radio.Group onChange={e => choiceChange(e, item)}>
        {
          options.map(radio => (
            <Radio value={radio.value} disabled={handleDisable(item, radio)}>{radio.label}</Radio>
          ))
        }
      </Radio.Group>
    </Form.Item>
  }

  const renderCustomize = useMemo(() => {
    // return <Form form={form} layout='vertical' className='second-form'>
    return <Form form={form} layout='vertical' className='second-form'>
      {
        buildOptions.options.map(item => (
          <Form.Item noStyle shouldUpdate>
            {
              () => {
                // 多选
                if (item.multiple) {
                  return renderMultiple(item)
                }
                // 单选
                return renderChoice(item)
              }
            }
          </Form.Item>
        ))
      }

    </Form>
  }, [buildOptions])

  const renderRadio = (item, value) => {
    return <Radio value={item.value}>
      <div className='template-item flex-space-between'>
        <div className='template-item-text'>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.name}</div>
          <div className='template-item-description'>{item.displayName}</div>
        </div>
        {
          item.value === value ? <div className='icon-box'>
            <CheckOutlined className='icon' />
          </div> :
            <div className='unselect'>
            </div>
        }
      </div>
    </Radio>
  }

  const renderSearchOptions = (value) => {
    return <Radio.Group >
      {
        searchOptions?.presets?.length <= 0 && !loading && <div className='flex-center' style={{ margin: '20px' }}>
          <Empty />
        </div>
      }
      {
        searchOptions?.presets.map(item => (
          renderRadio(item, value)
        ))
      }
    </Radio.Group>
  }

  const renderTemplateOptions = (value) => {
    return <Radio.Group >
      {
        commonTemplate.suggest.length > 0 && <label>
          <div className='title'>推荐模版</div>
        </label>
      }
      {
        commonTemplate.suggest.map(item => (
          renderRadio(item, value)
        ))
      }
      {
        commonTemplate.common.length > 0 && <label>
          <div className='title'>常用模版</div>
        </label>
      }
      {
        commonTemplate.common.map(item => (
          renderRadio(item, value)
        ))
      }
    </Radio.Group>
  }

  const renderTemplate = () => {
    return <Form form={templateForm} layout='vertical' className='second-form-template'>
      <div style={{ position: 'relative' }}>
        <Form.Item name="search">
          <Input placeholder='搜索模板名称' suffix={<SearchOutlined style={{ fontSize: '16px' }} />} onChange={debounceFetcher} allowClear defaultValue='' />
        </Form.Item>
        {
          loading && <div className='loading-input'>
            <LoadingOutlined />
          </div>
        }
      </div>
      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const value = templateForm.getFieldValue('preset')
            const isSearch = (templateForm.getFieldValue('search') || '').trim()
            return <Form.Item name="preset" label="" rules={[{ required: true, message: '请选择一个模板', validator: templateValidator }]}>
              {
                isSearch ? renderSearchOptions(value) : renderTemplateOptions(value)
              }
            </Form.Item>
          }
        }
      </Form.Item>

    </Form>
  }

  return (
    <div className='packagingService-build-second-container'>
      {renderTab()}
      <div className='content-container common-scroll-bar'>
        <div style={{ display: tabIndex === 1 ? 'block' : 'none' }}>
          {renderCustomize}
        </div>
        <div style={{ display: tabIndex === 2 ? 'block' : 'none' }}>
          {renderTemplate()}
        </div>

      </div>
    </div>
  );
}

export default forwardRef(Project)
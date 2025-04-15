import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import debounce from 'lodash/debounce';
import { Select, Spin, Empty, Form, Checkbox, Input } from 'antd'
import { LoadingOutlined } from '@ant-design/icons';

import './style.less'
import { getListApi } from './service'

interface Props {
  selectProps?: any
  name: string
  component: any
  formItemConfig: any
  form: any
  config: any
  forceUpdate: any
  onChange: any
}
function Project(props: Props, ref) {
  const { selectProps = {}, name, component = {}, formItemConfig = {}, config, forceUpdate, form, onChange } = props
  const [userList, setUserList] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')

  const listRef = useRef([])

  useImperativeHandle(ref, () => ({
    init
  }))

  const init = () => {
    const v = form.getFieldValue(name)
    initSelectOptions(v, 'load')
  }

  const initSelectOptions = async (value = '', type?) => {
    setValue(value)
    if (!value && type !== 'load') {
      setUserList([])
      return
    }
    setLoading(true)
    try {
      const searchField = type === 'load' ? (component.optionValue || component.searchField) : component.searchField
      let newValue = value
      if (Array.isArray(newValue)) {
        // newValue = newValue.join(',')
        newValue = null
      }
      const params = {
        [searchField]: newValue,
        ...component?.api?.params
      }

      if (!params[searchField]) {
        delete params[searchField]
      }
      const data = await getListApi(component?.api?.path, params)
      const v = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : data.data.data
      listRef.current = [...listRef.current, ...v]
      setUserList(v)

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }
  const debounceFetcher = debounce(initSelectOptions, 500);

  const renderNotFoundContent = () => {
    if (loading) {
      return <Spin indicator={<LoadingOutlined />} />
    }
    if (value && userList.length === 0) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
    }
    return '可输入关键字搜索'
  }

  const getVarStrValue = (str) => {
    const regex = /^\$\{[\s\S]*?\}$/;
    return regex.test(str)
  }

  const validatorUserInput = (info, value = []) => {
    if (!value || value.length <= 0) {
      return Promise.reject('格式错误')
    }
    if (!getVarStrValue(value)) {
      return Promise.reject('格式错误')
    }

    return Promise.resolve()
  }

  return (
    <div className='flex-space-between' style={{ width: '100%' }}>
      <Form.Item shouldUpdate noStyle>
        {
          () => {
            const remote_from_trigger_env = formItemConfig.dependencyField ? form.getFieldValue(formItemConfig.dependencyField) : ''
            return <>
              {
                remote_from_trigger_env
                  ?
                  <Form.Item {...formItemConfig} rules={[{ required: true, message: '' }, { validator: validatorUserInput }]} style={{ flex: 1 }}>
                    <Input
                      placeholder='自定义格式为 ${x}'
                      style={{ height: '32px' }}
                      onChange={(e) => onChange(e.target.value, 'input')}
                    />
                  </Form.Item>
                  :
                  <Form.Item rules={[{ required: true, message: formItemConfig.message }]} style={{ flex: 1 }}  {...formItemConfig}>
                    <Select
                      allowClear
                      showSearch
                      optionFilterProp="children"
                      filterOption={false}
                      onChange={onChange}
                      onSearch={(value) => debounceFetcher(value)}
                      notFoundContent={renderNotFoundContent()}
                      {...component}
                    >
                      {
                        userList?.map(item => (
                          <Option value={item[component.optionValue]} key={item[component.optionValue]} >
                            <div className="demo-option-label-item" title={`${item[component.optionLabel]} ${item[component.optionValue]}`}>
                              <span role="img" aria-label="China">
                                {item[component.optionLabel]}
                              </span>
                              <span>&nbsp;&nbsp;&nbsp;{item[component.optionValue]}</span>
                            </div>
                          </Option>
                        ))
                      }
                    </Select>
                  </Form.Item >
              }
              {
                formItemConfig.dependencyField && <>
                  &nbsp;&nbsp;&nbsp;
                  <Form.Item label="" name={formItemConfig.dependencyField} noStyle valuePropName="checked" initialValue={false}>
                    <Checkbox
                      onChange={(e) => {
                        config.variables[formItemConfig['name']] = undefined

                        let key = component.selectedValueField
                        if (key.includes('.')) {
                          key = key.split('.').reverse()[0]
                        }
                        config.variables[key] = formItemConfig.dependencyField ? '' : []
                        form.setFieldValue(formItemConfig['name'], undefined)
                        form.setFieldValue(key, formItemConfig.dependencyField ? '' : [])
                      }}
                    >自定义</Checkbox>
                  </Form.Item>
                </>
              }
            </>
          }
        }
      </Form.Item>
    </div>

  );
}

export default forwardRef(Project)
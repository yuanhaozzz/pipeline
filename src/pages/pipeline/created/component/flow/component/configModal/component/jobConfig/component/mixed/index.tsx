import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { DownOutlined, UpOutlined, QuestionCircleOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons'
import { Form, Input, Select, Radio, Checkbox, Tooltip } from 'antd'
import './style.less'
import { plainOptions } from './data'
import { getZoneListApi, getConfigListApi } from './service'

import { getTagApi } from '../../service'


function Project(props, ref) {
  const { form, type } = props

  const [tagOptions, setTagOptions] = useState([])
  const [zoneList, setZoneList] = useState([])
  const [config, setConfig] = useState([])

  useImperativeHandle(ref, () => ({
    getOptionsData
  }))

  const getOptionsData = () => {
    getTag()
    getZone(0)
    getConfig()
  }

  const getTag = async () => {
    const { data } = await getTagApi({ size: 1000, page_num: 1, agent_type: 'metal' })
    setTagOptions(data.map(item => {
      return {
        label: item,
        value: item
      }
    }))
  }

  const getZone = async (gcu: any) => {
    const { data } = await getZoneListApi({ gcu })
    setZoneList(data.map(item => {
      return { label: item, value: item }
    }))
  }

  const getConfig = async (gcu?: any) => {
    try {
      const { data } = await getConfigListApi({ gcu })
      setConfig(data.map(item => {
        return {
          label: item.name,
          value: item.flavor_id,
        }
      }))
    } catch (error) {
    }
  }


  const handleRemove = (e, remove, index, name) => {
    e.stopPropagation()
    remove(name)
    form.validateFields()
  }

  const handleAdd = (add) => {
    add()
    setTimeout(() => {
      form.validateFields()
    }, 200);
  }

  const renderTypeContent = (index, restField, name) => {
    const itemType = form.getFieldValue(['mixed_list', index, 'type'])
    if (!itemType) {
      return <></>
    }
    switch (itemType) {
      case 'metal':
        return renderTag(restField, name, index)
      case 'openstack':
        return renderOpenstack(restField, name, index)
    }
  }

  const renderOpenstack = (restField, name, index) => {
    return <>
      <Form.Item {...restField} name={[name, 'zone']} label='可用区' rules={[{ required: true, message: '请选择' }]}>
        <Select placeholder='请选择' options={zoneList} allowClear
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}>
        </Select>
      </Form.Item>

      <Form.Item {...restField} name={[name, 'config_id']} label='规格' rules={[{ required: true, message: '请选择' }]}>
        <Select placeholder='请选择' options={config} allowClear
          showSearch
          optionFilterProp="children"
          onChange={(v) => {
            const data = config.find(item => item.value === v)
            if (data) {
              form.setFieldValue(['mixed_list', index, 'config_name'], data.label)
            }
          }}
          filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}>
        </Select>
      </Form.Item>
      <Form.Item {...restField} name={[name, 'config_name']} label='' style={{ display: 'none' }} >
        <Input />
      </Form.Item>
    </>
  }

  const renderTag = (restField, name, index) => {
    return <Form.Item shouldUpdate noStyle>
      {
        () => {
          const has_variable_in_tag = form.getFieldValue(['mixed_list', index, 'has_variable_in_tag'])

          return <div className='flex-space-between'>
            {
              has_variable_in_tag
                ?
                <Form.Item {...restField} name={[name, 'name']} label="节点 Tag" style={{ width: '85%' }} rules={[{ required: true, message: '请输入' }]}>
                  <Input
                    placeholder='自定义'
                    style={{ height: '32px' }}
                  />
                </Form.Item>
                :
                <Form.Item {...restField} name={[name, 'name']} label="节点 Tag" style={{ width: '85%' }} rules={[{ required: true, message: '请选择' }]}>
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

            <Form.Item {...restField} noStyle name={[name, 'has_variable_in_tag']} label="" style={{ width: '300px' }} valuePropName="checked" initialValue={false}>
              <Checkbox
                onChange={(e) => {
                  form.setFieldValue(['mixed_list', index, 'name'], undefined)
                }}
              >自定义</Checkbox>
            </Form.Item>
          </div>
        }
      }
    </Form.Item>
  }
  const mixedList = form.getFieldValue('mixed_list') || []
  return (
    <div className='flow-line-jobConfig-mixed-container'>
      <Form.List name="mixed_list" style={{ marbottom: '0' }}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <div className='item-runtime_var'>
                <Form.Item  {...restField} name={[name, 'type']} initialValue={'metal'} style={{ marginBottom: '5px' }}>
                  <Radio.Group options={plainOptions} />
                </Form.Item>
                {
                  renderTypeContent(index, restField, name)
                }
                {
                  type === 1 && mixedList.length > 1 && <div className='minus flex-center' onClick={(e) => handleRemove(e, remove, index, name)}><MinusOutlined /></div>
                }
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
    </div>
  );
}

export default forwardRef(Project)
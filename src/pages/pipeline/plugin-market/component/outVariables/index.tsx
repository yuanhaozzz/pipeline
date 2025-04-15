import React, { useEffect, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { validator } from '@/pages/pipeline/created/component/flow/component/configModal/data'
import './style.less'
import { Form, Button, Input, Radio, Checkbox, } from 'antd'
import { PlusOutlined, MinusOutlined, EditOutlined, DownOutlined } from '@ant-design/icons'
// import EditorComponent from '@/components/Editor';
import { send } from './service'

const { TextArea } = Input;
function Project(props, ref) {
  const { form, isAuth = true, variables = [], label = "", from, type = 1, layout = 1, handleArrow, isArrowExpand, plugin } = props
  const [variableList, setVariableList] = useState([])

  useEffect(() => {
    if (variables) {
      if (typeof variables === 'string') {
        return
      }
      let newData = handleData(variables).map(item => {
        if (!item.previous_key) {
          item.previous_key = item.key
        }
        return item
      })
      setVariableList(newData)
    }
  }, [variables])

  useImperativeHandle(ref, () => ({
    getValue,
    setValue
  }))

  const getValue = () => {
    return variableList
  }

  const setValue = (value = []) => {
    // 兼容判断
    setVariableList(handleData(value))
  }

  const handleData = (value) => {
    if (value[0] && typeof value[0] === 'string') {
      value = value.map(item => {
        return {
          scope: 'pipeline',
          key: item,
          description: '',
          is_summarized: false,
        }
      })
    }
    return value
  }

  const add = () => {
    variableList.push({
      scope: 'pipeline',
      key: '',
      description: '',
      previous_key: '',
      is_summarized: false,
    })
    setVariableList([...variableList])
  }

  const reduce = (index) => {
    variableList.splice(index, 1)
    setVariableList([...variableList])
    form.validateFields(['out_variables'])
  }

  const onChange = (e, index, key) => {
    let { value } = e.target
    if (key === 'is_summarized') {
      value = e.target.checked
      variableList[index].remark = ''
    }
    variableList[index][key] = value
    delete variableList[index].remark
    if (variableList[index].is_summarized) variableList[index].remark = variableList[index]?.description
    setVariableList([...variableList])
  }

  // const handleEditorChange = (e, index, key) => {
  //   variableList[index][key] = e
  //   setVariableList([...variableList])
  // }
  // const editorChange = debounce(handleEditorChange, 50);

  const renderLabel = (item) => {
    let title = ''
    if (layout === 2 && item.previous_key !== '') {
      if (item.previous_key !== item.key) {
        title = `（原 ${item.previous_key}）`
      } else {
        title = `（可重命名）`
      }
    }
    return title
  }

  const renderCore = () => {
    return <Form.Item label={label} style={{ margin: 0 }} className='pluginMarket-detail-variable-container'>
      <Form.Item name="out_variables" label="" rules={[{ validator: (...arg) => validator['outVariablesVaild'](variableList, ...arg) }]} style={{ margin: 0 }} noStyle>
        <div className=' flex-space-between' style={{ flexWrap: 'wrap', position: 'relative' }}>
          {
            variableList.map((item, index) => (
              <div className='variable-list-item'>
                <div className='flex-space-between'>
                  {/* 输入框 */}
                  <Form.Item label={`Key${renderLabel(item)}`} style={{ flex: 1, marginRight: '20px' }} required>
                    <Input placeholder='输出变量的 Key' value={item.key} onChange={(e) => onChange(e, index, 'key')} onBlur={() => form.validateFields(['out_variables'])} maxLength={60} />
                  </Form.Item>
                  {/* 选择 */}
                  <Form.Item label="可见范围" required>
                    <Radio.Group onChange={(e) => onChange(e, index, 'scope')} value={item.scope} className='radio' >
                      <Radio value="pipeline">全局</Radio>
                      <Radio value="job">Job</Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>
                {/* 输入框 */}
                <Form.Item label="描述" >
                  <TextArea
                    placeholder="请填写描述"
                    autoSize={{ minRows: 1 }}
                    value={item.description}
                    maxLength={100}
                    onChange={(e) => onChange(e, index, 'description')}
                  />
                </Form.Item>
                {location?.pathname !== '/FlowLine/pluginMarket/detail' &&
                  <div className='flex-space-between'>
                    <Form.Item label="构建结果" className='is_summarized' >
                      <Checkbox checked={item?.is_summarized} onChange={(e) => onChange(e, index, 'is_summarized')} />
                    </Form.Item>
                    {/* {variableList[index]?.is_summarized &&
                      <Form.Item label="描述" className='is_summarized remark'>
                        <Input
                          placeholder="请填写描述"
                          value={item?.remark}
                          style={{ width: 385 }}
                          onChange={(e) => onChange(e, index, 'remark')}
                        />
                      </Form.Item>
                    } */}
                  </div>
                }
                {/* - */}
                {/* {isAuth && <Button className='reduce' icon={<MinusOutlined style={{ fontSize: '12px' }} />} size='small' onClick={() => reduce(index)} shape="circle"></Button>} */}
                {isAuth && type === 1 && <div className='reduce flex-center' onClick={() => reduce(index)}><MinusOutlined /></div>}
              </div>
            ))
          }

        </div>
      </Form.Item>
      <div className={`${from === 'task' && 'flex-center'} outVariables-add`} >
        {
          isAuth && type === 1 && <div className='add flex-center' onClick={() => add()}>
            <PlusOutlined />
          </div>
        }

        {/* <Button icon={<PlusOutlined style={{ fontSize: '12px' }} />} size='small' onClick={() => add()} shape="circle"></Button> */}
      </div>
    </Form.Item >
  }

  if (type !== 1 && variableList.length <= 0) {
    return <></>
  }

  if (layout === 2) {
    return <div className='common-form-config-outVariables'>
      <div className='outVariables-title flex-space-between' onClick={() => handleArrow(plugin)}>
        <div>输出环境变量</div>
        <div className={`${!isArrowExpand && 'common-FormConfig-arrow-down-rotate'} common-FormConfig-arrow`}><DownOutlined /></div>
      </div>
      <div style={{ display: !isArrowExpand ? 'block' : 'none' }}>
        {renderCore()}
      </div>
    </div>
  }

  return (
    <>
      {renderCore()}
    </>
  );
}

export default forwardRef(Project)
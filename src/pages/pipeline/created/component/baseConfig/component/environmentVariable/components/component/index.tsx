import React, { useEffect, useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { Button, Dropdown, message, Segmented, Tabs, Popover, Tooltip, Form, Input, Select, Radio, Popconfirm, Checkbox } from 'antd'
import { DownOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import './style.less'
import { send } from './service'
import FormRepo from '../formRepo'
import FormBranch from '../formBranch'
import OldFormCommitId from '../commonComponent/formCommitId'
import FormChangeRef from '../commonComponent/formChangeId'

import { getUrlParams } from '@/utils'


const { TextArea } = Input;
function Project(props, ref) {
  const { item, configList, form, data, parentType } = props
  const [activeKey, setActiveKey] = useState<any>('config')

  const [list, setList] = useState([])

  const [configFormRef] = Form.useForm();

  const formCommitIdRef = useRef([])
  const formRepoRef = useRef([])
  const variableRef = useRef(null)

  useImperativeHandle(ref, () => ({
    componentFormVaild
  }))

  useEffect(() => {
    // add()
    init()

  }, [])

  useEffect(() => {
    setTimeout(() => {
      configFormRef.validateFields()
    }, 5000);
  }, [])

  const init = () => {
    configFormRef.setFieldValue('from', 2)
    const pipelineId = getUrlParams().pipelineId
    let envComponentList = []
    const componentMap = data.setting?.extra_data?.envComponentList
    if (componentMap) {
      envComponentList = componentMap[Object.keys(componentMap)[0]] || []
    }

    setList(envComponentList)
    // 触发分支 CommieId接口
    envComponentList.forEach(item => {
      const keys = Object.keys(item)
      keys.forEach(key => {
        let value = item[key]
        if (key.includes('-options') && value) {
          value = value.join('\n')
        }
        if (key === 'repo') {
          value = item['repo-name']
        }
        if (key.includes('repo-type')) {
          configFormRef.setFieldValue(item.id + '-component-' + key, item[key])
        } else {
          setTimeout(() => {
            configFormRef.setFieldValue(item.id + '-component-' + key, value)
          }, 1000);
        }
      })
    })
  }

  const componentFormVaild = async () => {
    const data = await configFormRef.validateFields()
    const filterData = []
    list.forEach(item => {
      const replaceText = item.id + '-component-'
      const itemObj = {
        checked: item.checked
      }
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          if (key.includes(replaceText)) {
            // 替换多余key
            const newKey = key.replace(replaceText, '')
            let value = data[key]
            // 处理选项数据
            if (newKey.includes('-options') && value) {
              const options = value.split('\n').map(item => item.trim()).filter(Boolean)
              value = [...new Set(options)]
            }
            itemObj[newKey] = value
          }
        }
      }
      filterData.push(itemObj)
    })
    return filterData
  }


  const tabChange = (key) => {
    setActiveKey(key)
  }

  const handleShowAll = (item) => {
    item.showAll = !item.showAll
    setList([...list])
  }

  const repoTypeChange = (id, value, index) => {
    configFormRef.setFieldValue(`${id}-component-repo-name`, undefined)
    configFormRef.setFieldValue(`${id}-component-repo-url`, undefined)
    configFormRef.setFieldValue(`${id}-component-http_url`, undefined)
    configFormRef.setFieldValue(`${id}-component-repo-id`, undefined)
    configFormRef.setFieldValue(`${id}-component-repo`, undefined)
    configFormRef.setFieldValue(`${id}-component-ref`, undefined)
    configFormRef.setFieldValue(`${id}-component-sha`, undefined)
    configFormRef.setFieldValue(`${id}-component-patchset`, undefined)
    configFormRef.setFieldValue(`${id}-component-isBranch`, true)
    formRepoRef.current[index].setOptionsData([])
    // (formRepoRef + id).current.setOptionsData([])
  }

  const repoChange = (id, info: any = {}) => {
    variableRef.current.isRepoChange = true
    configFormRef.setFieldValue(`${id}-component-repo-name`, info.name)
    configFormRef.setFieldValue(`${id}-component-repo-url`, info.url)
    configFormRef.setFieldValue(`${id}-component-http_url`, info.http_url)
    configFormRef.setFieldValue(`${id}-component-repo-id`, info.id)
    configFormRef.setFieldValue(`${id}-component-ref`, undefined)
    configFormRef.setFieldValue(`${id}-component-sha`, undefined)
    configFormRef.setFieldValue(`${id}-component-patchset`, undefined)
  }

  const branchChange = (id, index) => {
    // formCommitIdRef.current[index].current.getData()
    configFormRef.setFieldValue(`${id}-component-sha`, undefined)
  }

  const commitIdChange = () => {
    // console.log(123)
  }

  const remove = (e: Event, index: number) => {
    e.stopPropagation()
    list.splice(index, 1)
    setList([...list])
  }

  const add = () => {
    if (parentType !== 1) {
      return
    }
    list.push({
      id: Math.random(),
      showAll: true,
      name: `component${list.length + 1}`,
      default: '',
      description: '',
      type: 'component',
      prompt_on_trigger: true,
      checked: false,
      isBranch: false,
    })
    setList([...list])
  }

  const onChackBoxChange = (e, item) => {
    if (!item.checked) {
      list.forEach(item => {
        item.checked = false
      })
    }
    item.checked = !item.checked
    setList([...list])
  }

  const onSwitchBranchChange = (checked, name, id) => {
    configFormRef.setFieldValue(name, checked)
    configFormRef.setFieldValue(`${id}-component-sha`, undefined)
  }

  const renderConfig = () => {
    return <div className='environmentVariable-config'></div>
  }

  const handleOptions = (from) => {
    const str = configFormRef.getFieldValue(from) || ''
    const options = str.split('\n').map(item => item.trim()).filter(Boolean)
    return [...new Set(options)]
  }

  const renderListItem = (item, index) => {
    configFormRef.setFieldValue(item.id + '-component-id', item.id)
    const commitIdRef = ''
    return <div>
      <Form.Item noStyle name='from'></Form.Item>
      <Form.Item noStyle name={item.id + '-component-repo-name'}></Form.Item>
      <Form.Item noStyle name={item.id + '-component-repo-url'}></Form.Item>
      <Form.Item noStyle name={item.id + '-component-http_url'}></Form.Item>
      <Form.Item noStyle name={item.id + '-component-id'}></Form.Item>
      <Form.Item noStyle name={item.id + '-component-repo-id'}></Form.Item>
      <div className='flex-space-between'>
        <Form.Item label="组件名" name={item.id + '-component-component'} initialValue={item.name} rules={[{ required: true, message: '请填写名称' }]} style={{ width: '48%' }}>
          <Input placeholder='请输入' />
        </Form.Item>
        <Form.Item label="仓库类型" name={item.id + '-component-repo-type'} initialValue={'gerrit'} rules={[{ required: true, message: '请选择仓库类型' }]} style={{ width: '48%' }}>
          <Select options={[
            {
              label: 'Gerrit',
              value: 'gerrit',
            },
            {
              label: 'Gitlab-EE',
              value: 'gitlabee',
            },
            {
              label: 'Gitlab-CE',
              value: 'gitlabce',
            },
          ]} onChange={(v) => repoTypeChange(item.id, v, index)} />
        </Form.Item>
      </div>
      <Form.Item noStyle shouldUpdate>
        {
          () => {
            return <FormRepo ref={(el) => formRepoRef.current[index] = el} name={`${item.id}-component-repo`} label="仓库" initialValue={undefined} repoType={configFormRef.getFieldValue(item.id + '-component-repo-type')} repoChange={info => repoChange(item.id, info)} required={true} message='请输入' />
          }
        }
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const formData = configFormRef.getFieldsValue()
            const repoType = formData[item.id + '-component-repo-type']
            const repoId = formData[`${item.id}-component-repo-id`]
            const isBranch = `${item.id}-component-isBranch`
            const patchsetName = `${item.id}-component-patchset`
            const isBranchValue = formData[`${item.id}-component-isBranch`] === undefined ? item.isBranch : formData[`${item.id}-component-isBranch`]
            const label = '代码分支'
            const repoName = configFormRef.getFieldValue(`${item.id}-component-repo-name`)

            // const patchset = configFormRef.getFieldValue()
            return <FormBranch name={`${item.id}-component-ref`} label={label} initialValue={undefined} repoType={repoType} repoId={repoId} change={(v) => branchChange(item.id, index)} required={false} message='请输入' isBranch={isBranch} onSwitchBranchChange={onSwitchBranchChange} repoName={repoName} patchsetName={patchsetName} isBranchValue={isBranchValue} id={item.id} from={configFormRef} />
          }
        }
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const data = configFormRef.getFieldsValue()
            const repoType = data[item.id + '-component-repo-type']
            const repoId = data[`${item.id}-component-repo-id`]
            const isBranchValue = data[`${item.id}-component-isBranch`] === undefined ? item.isBranch : data[`${item.id}-component-isBranch`]
            const ref = data[`${item.id}-component-ref`] || configFormRef.getFieldValue(`${item.id}-component-ref`)
            const repoName = data[`${item.id}-component-repo-name`]
            return <OldFormCommitId ref={(el) => formCommitIdRef.current[index] = el} name={`${item.id}-component-sha`} label="CommitId" initialValue={undefined} repoType={repoType} repoId={repoId} branch={ref} repoName={repoName} change={commitIdChange} required={false} message='请输入' isBranchValue={isBranchValue} />
          }
        }
      </Form.Item>
      {/* <Form.Item noStyle shouldUpdate>
        {
          () => {
            const formData = configFormRef.getFieldsValue()
            const repoType = formData[item.id + '-component-repo-type']
            const repoId = formData[`${item.id}-component-repo-id`]
            const isBranch = `${item.id}-component-isBranch`
            const patchsetName = `${item.id}-component-patchset`
            const isBranchValue = formData[`${item.id}-component-isBranch`] === undefined ? item.isBranch : formData[`${item.id}-component-isBranch`]
            const label = 'Change'
            const repoName = configFormRef.getFieldValue(`${item.id}-component-repo-name`)

            // const patchset = configFormRef.getFieldValue()
            return <FormChangeRef name={patchsetName} label={label} initialValue="" repoType={repoType} repoId={repoId} required={false} message='请输入' isBranch={isBranch} onSwitchBranchChange={onSwitchBranchChange} repoName={repoName} />
          }
        }
      </Form.Item> */}
      {/* FormChangeRef */}
      {/* <div style={{ marginTop: '40px' }}>
        工具链
        <div className='flex-space-between' style={{ marginLeft: '60px', alignItems: 'flex-start' }} >
          <Form.Item label="下拉选项" name={`${item.id}-component-toolchain-options`} tooltip={<div>
            <div>1. 示例：gcc_5, gcc_7, clang9等</div>
            <div>2. 多个选项用换行符分隔</div>
            <div>3. 重复的选项将只会显示一个</div>
          </div>} style={{ width: '48%' }}>
            <TextArea
              placeholder={`gcc_5\ngcc_7\nclang9`}
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={() => configFormRef.setFieldValue(`${item.id}-component-toolchain`, undefined)}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {
              () => {
                return <Form.Item label="默认值" name={`${item.id}-component-toolchain`} style={{ width: '48%' }} >
                  <Select
                    allowClear
                    showSearch
                    placeholder="查找选项"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {
                      handleOptions(`${item.id}-component-toolchain-options`).map(value => (
                        <Option value={value} title={`${value}`}>
                          <div>{value.split('@')[0]}</div>
                        </Option>
                      ))
                    }
                  </Select>
                </Form.Item>
              }
            }
          </Form.Item>
        </div>
      </div>
      <div style={{ marginTop: '0px' }}>
        ABI
        <div className='flex-space-between' style={{ marginLeft: '60px', alignItems: 'flex-start' }} >
          <Form.Item label="Radio选项" name={`${item.id}-component-abi-options`} tooltip={<div>
            <div>1. 示例：ABI0, ABI1等</div>
            <div>2. 多个选项用换行符分隔</div>
            <div>3. 重复的选项将只会显示一个</div>
          </div>} style={{ width: '48%' }} >
            <TextArea
              placeholder={`ABI0\nABI1`}
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={() => configFormRef.setFieldValue(`${item.id}-component-abi`, undefined)}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {
              () => {
                return <Form.Item label="默认值" name={`${item.id}-component-abi`} style={{ width: '48%' }} >
                  <Radio.Group  >
                    {
                      handleOptions(`${item.id}-component-abi-options`).map(value => (
                        <Radio value={value}>{value}</Radio>
                      ))
                    }
                  </Radio.Group>
                </Form.Item>
              }
            }
          </Form.Item>
        </div>
      </div>
      <div style={{ marginTop: '0px' }}>
        编译类型
        <div className='flex-space-between' style={{ marginLeft: '60px', alignItems: 'flex-start' }} >
          <Form.Item label="Radio选项" name={`${item.id}-component-build_type-options`} tooltip={<div>
            <div>1. 示例：Release, Debug, Cl, Daily 等</div>
            <div>2. 多个选项用换行符分隔</div>
            <div>3. 重复的选项将只会显示一个</div>
          </div>} style={{ width: '48%' }} >
            <TextArea
              placeholder={`Release\nDebug\nCl\nDaily`}
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={() => configFormRef.setFieldValue(`${item.id}-component-build_type`, undefined)}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate>
            {
              () => {

                return <Form.Item label="默认值" name={`${item.id}-component-build_type`} style={{ width: '48%' }} >
                  <Radio.Group  >
                    {
                      handleOptions(`${item.id}-component-build_type-options`).map(value => (
                        <Radio value={value}>{value}</Radio>
                      ))
                    }
                  </Radio.Group>
                </Form.Item>
              }
            }
          </Form.Item>
        </div>
      </div> */}
    </div >
  }

  const renderList = () => {
    return <div className='environmentVariable-list'>
      <Form layout="vertical" form={configFormRef}>
        {
          list.map((item, index) => (
            <div className='environmentVariable-list-item'>
              {/* 导航条 */}
              <nav>
                <div onClick={() => handleShowAll(item)}>
                  <DownOutlined className={`arrow ${item.showAll && 'arrow-rotate'}`} />&nbsp;&nbsp;
                  <div style={{ display: 'inline-block' }} onClick={(e: Event) => e.stopPropagation()}>
                    <Checkbox onChange={(e) => onChackBoxChange(e, item)} checked={item.checked} >
                      <Form.Item noStyle shouldUpdate>
                        {
                          () => {
                            const value = configFormRef.getFieldValue(item.id + '-component-component') || item.name
                            return value
                          }
                        }
                      </Form.Item>
                    </Checkbox>
                  </div>
                </div>
                {/* 删除按钮 */}
                <Popconfirm placement="topLeft" title={'确认删除'} onConfirm={(e) => remove(e, index)} okText="Yes" cancelText="No">
                  <div className='remove-component' onClick={(e: Event) => e.stopPropagation()}><DeleteOutlined /> 删除组件</div>
                </Popconfirm>

              </nav>

              <div className='item-content' style={{ display: item.showAll ? 'block' : 'none' }}>{renderListItem(item, index)}</div>

            </div>
          ))
        }
        <div className='flex-center add-component'>
          <div className={`add-component-button ${parentType !== 1 && 'component-disabled'}`} onClick={add}>
            <PlusCircleOutlined /> &nbsp;新增组件
          </div>
        </div>
      </Form>

    </div>
  }

  return (
    <div className='flex-baseConfig-environmentVariable-container' ref={variableRef}>
      {renderList()}
    </div>
  );
}

export default forwardRef(Project)
import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Button, Form, Input, Select, message, DatePicker, Radio, Checkbox, Segmented, Collapse, Space } from 'antd';
import './style.less'
import { getTriggerListApi } from './service'

import { CopyOutlined, SettingOutlined, MinusCircleOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons'
import { validator } from '../../../../../flow/component/configModal/data'
import RepoComponent from '@/pages/pipeline/created/component/baseConfig/component/environmentVariable/components/formRepo'
import { renderTriggerIcon, renderTriggerType } from '@/pages/pipeline/created/common'

const { Panel } = Collapse;

import { isUserAuth, copyText } from '@/utils'

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

function Project(props, ref) {
  const { type, data, disabled } = props

  const [triggerList, setTriggerList] = useState<any>([])

  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    getFormValue,
    initForm
  }))

  const initForm = async () => {
    const { trigger_type, hook_url, include_branch, magic_comment, file_path, repo_name, exclude_branch, hook_from, trigger_list = [] } = data?.setting || {}

    const resList = trigger_list

    let list = [{
      trigger_type: trigger_type.includes('HOOK') ? 'hook' : 'manual',
      hook_from: hook_from || trigger_type.includes('GITLAB') ? 'gitlab_ee' : 'gerrit',
      hook_url: `${location.protocol}//${location.host}${hook_url}`,
      repo_name,
      trigger_comment: magic_comment,
      include_branch,
      file_path,
      exclude_branch
    }]


    if (resList.length > 0) {
      list = resList
    }
    form.setFieldValue('trigger', list)

    setTriggerList(([...list]).map(item => {
      item.active = false
      return item
    }))
  }

  const getFormValue = async () => {
    const value = await form.validateFields()
    return value
  }

  const repoChange = (info) => {

  }

  const renderRepo = (restField, name, index) => {

    // const triggerType = form.getFieldValue(['trigger', index, 'trigger_type'])

    const triggerType = form.getFieldValue(['trigger', index, 'hook_from']) || 'gitlab_ee'

    const repoType = triggerType.includes('gerrit') ? 'gerrit' : 'gitlabee'

    return <RepoComponent name={[name, 'repo_name']} label="" repoType={repoType} repoChange={repoChange} />
  }

  const options = [
    { value: 'gerrit', label: 'Gerrit' },
    { value: 'gitlab_ee', label: 'Gitlab-EE' },
    { value: 'gitlab_ce', label: 'Gitlab-CE' },
  ];

  const renderCore = (index, restField, name) => {
    return <>
      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const triggerType = form.getFieldValue(['trigger', index, 'trigger_type'])
            if (triggerType === 'manual') {
              return <></>
            }
            return <Form.Item {...restField} name={[name, 'hook_from']} label="" style={{ marginBottom: '5px' }} initialValue={'gerrit'}>
              <Radio.Group
                onChange={() => {
                  setTriggerList([...triggerList])
                  form.validateFields()
                }}
                options={options}
                optionType="button"
                buttonStyle="solid"
              />
            </Form.Item>
          }
        }
      </Form.Item>
      <Form.Item noStyle shouldUpdate>
        {() => {
          const triggerType = form.getFieldValue(['trigger', index, 'trigger_type'])
          const hookFrom = form.getFieldValue(['trigger', index, 'hook_from']) || 'gitlab_ee'
          if (triggerType === 'hook') {
            return <>
              {
                !hookFrom.includes('gitlab') && <Form.Item label=" " colon={false} style={{ marginBottom: '14px' }}>
                  <p style={{ marginBottom: '5px' }}>仓库名称</p>
                  {renderRepo(restField, name, index)}
                </Form.Item>
              }
              {
                hookFrom.includes('gitlab') && <Form.Item label=" " colon={false} style={{ marginBottom: '14px' }}>
                  <p style={{ marginBottom: '5px' }}>Webhook URL（请复制该 Hook 的地址，粘贴到 Gitlab 的 Webhook 里面）</p>
                  <div className='flex-space-between'>
                    <Form.Item {...restField} name={[name, 'hook_url']} noStyle initialValue={`${location.protocol}//${location.host}${data?.setting?.hook_url}`}>
                      <Input disabled />
                    </Form.Item>
                    <Form.Item style={{ width: '4%' }}>
                      <div onClick={() => copyText(`${location.protocol}//${location.host}${data?.setting.hook_url || ''}`)}>
                        <CopyOutlined style={{ fontSize: '20px', color: '#63656e', cursor: 'pointer', marginLeft: '10px' }} />
                      </div>
                    </Form.Item>
                  </div>
                </Form.Item>
              }
              <Form.Item label=" " colon={false} style={{ marginBottom: '14px' }}>
                <p style={{ marginBottom: '5px' }}>分支名称</p>
                <Form.Item {...restField} name={[name, 'include_branch']} label="" >
                  <Input placeholder='指定分支名称或者正则表达式匹配要触发的分支' />
                </Form.Item>
              </Form.Item>
              {
                hookFrom.includes('gitlab') && <Form.Item label=" " colon={false} style={{ marginBottom: '14px' }}>
                  <p style={{ marginBottom: '5px' }}>Comments 关键字</p>
                  <Form.Item {...restField} name={[name, 'trigger_comment']} label="">
                    <Input placeholder='监听 Gitlab Merge Request 的评论操作，为空时不会触发，支持正则表达式' />
                  </Form.Item>
                </Form.Item>
              }
              {
                !hookFrom.includes('gitlab') && <>
                  <Form.Item label=" " colon={false} style={{ marginBottom: '14px' }}>
                    <p style={{ marginBottom: '5px' }}>Comments 关键字</p>
                    <Form.Item {...restField} name={[name, 'trigger_comment']} label="">
                      <Input placeholder='监听 Gerrit Patchset 评论操作，为空时不会触发，支持正则表达式' />
                    </Form.Item>
                  </Form.Item>
                  <Form.Item label=" " colon={false} style={{ marginBottom: '14px' }}>
                    <p style={{ marginBottom: '5px' }}>文件路径</p>
                    <Form.Item {...restField} name={[name, 'file_path']} label="">
                      <Input placeholder='多个文件逗号分隔' disabled />
                    </Form.Item>
                  </Form.Item>
                </>
              }
              <Form.Item label=" " colon={false} style={{ marginBottom: '14px' }}>
                <p style={{ marginBottom: '5px' }}>排除以下目标分支</p>
                <Form.Item  {...restField} name={[name, 'exclude_branch']} label="" >
                  <Input placeholder='多个分支逗号分隔，支持正则表达式' disabled />
                </Form.Item>
              </Form.Item>
            </>
          }
          return <></>
        }}
      </Form.Item>
    </>
  }


  const validatorTriggerType = (fields, value, key) => {
    const manual = []
    let manualNumber = 0
    let hookNumber = 0
    fields.forEach((item, index) => {
      const v = form.getFieldValue(['trigger', index, 'trigger_type'])
      if (v === 'manual') {
        manual.push(index)
        manualNumber += 1
      }
      if (v === 'hook') {
        hookNumber += 1
      }
    })
    if (manual.includes(key)) {
      if (hookNumber > 0) {
        return Promise.reject('已配置 Hook 触发，无法配置手动')
      }
      if (manualNumber > 1) {
        return Promise.reject('手动触发已存在')
      }
    }

    return Promise.resolve()
  }

  const handleRemove = (e, remove, index, name) => {
    e.stopPropagation()
    remove(name)
    triggerList.splice(index, 1)
    setTriggerList([...triggerList])
    form.validateFields()
  }

  const renderHeader = (remove, name, index, fields) => {
    let triggerType = form.getFieldValue(['trigger', index, 'trigger_type'])
    let hookFrom = form.getFieldValue(['trigger', index, 'hook_from']) || 'gerrit'

    return <div className='header flex-space-between' onClick={() => {
      triggerList[index].active = !triggerList[index].active
      setTriggerList([...triggerList])
    }}>
      <div className='flex-start'>
        <DownOutlined className={`common-animation-arrow ${triggerList[index]?.active && 'common-animation-arrow-active'}`} />&nbsp;&nbsp;
        {renderTriggerIcon(triggerType, hookFrom)}&nbsp;&nbsp;
        {renderTriggerType(triggerType, hookFrom)}
      </div>
      {
        (type === 1 && fields.length > 1) && <MinusCircleOutlined onClick={(e) => handleRemove(e, remove, index, name)} />
      }
    </div>
  }

  return (
    <>
      <Form {...layout} form={form} name="control-hooks" className='run-config-form'
        disabled={disabled}
      >
        <Form.Item name="from" label="" initialValue={1} noStyle>
        </Form.Item>
        <Form.Item name="" label="触发方式" className='flow-run-config-triggerType'>

          <Form.List name="trigger">

            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => (
                  <div className='trigger-container'>
                    {/* header */}
                    {renderHeader(remove, name, index, fields)}
                    {/* 内容 */}
                    <div className='content' style={{ display: triggerList[index]?.active ? 'block' : 'none' }}>
                      <Form.Item  {...restField} name={[name, 'trigger_type']} initialValue={'manual'} rules={[{ required: true, message: '' }, { validator: (info, value) => validatorTriggerType(fields, value, index), }]} style={{ marginBottom: '8px' }}>
                        <Radio.Group onChange={() => {
                          setTriggerList([...triggerList])
                          form.validateFields()
                        }}>
                          <Radio value={'manual'} >手动触发</Radio>
                          <Radio value={'hook'} >Hook 触发</Radio>
                        </Radio.Group>
                      </Form.Item>
                      {renderCore(index, restField, name)}
                    </div>
                  </div>
                ))}
                {
                  type === 1 && <Form.Item>
                    <Button type="dashed" onClick={() => {
                      add()
                      triggerList.push({ active: true })
                      setTimeout(() => {
                        setTriggerList([...triggerList])
                        form.validateFields()
                      }, 100);
                    }} block icon={<PlusOutlined />}>
                      新增触发方式
                    </Button>
                  </Form.Item>
                }
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form >
    </>
  );
}

export default forwardRef(Project)
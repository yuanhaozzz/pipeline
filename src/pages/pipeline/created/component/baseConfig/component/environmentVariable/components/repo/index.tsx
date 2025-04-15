import React, { useEffect, useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { Button, Dropdown, message, Segmented, Tabs, Popover, Tooltip, Form, Input, Select, Radio, Popconfirm, Checkbox } from 'antd'
import { DownOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import './style.less'
import { send } from './service'
import FormRepo from '../formRepo'
import FormBranch from '../formBranch'
import FormCommitId from '../commonComponent/formCommitId'
import NewFormBranch from '@/pages/pipeline/created/component/preview/components/formBranch'
import EditorComponent from '@/components/Editor';
import { getUrlParams } from '@/utils'
import { keywords } from '../../data'

const { TextArea } = Input;
function Project(props, ref) {
  const { item, configList, form, validator, nameBlur, type, handleRepoDisplay } = props
  const { prompt_on_trigger, repoType, gitUrlName, gitUrlDefault, gitUrlDescription, shaName, shaDefault, shaDescription, refName, refDefault, refDescription } = item
  const [activeKey, setActiveKey] = useState<any>('config')

  const [list, setList] = useState([])

  const [detailVal, setDetailVal] = useState({})

  const [configFormRef] = Form.useForm();

  const formCommitIdRef = useRef([])
  const formRepoRef = useRef(null)
  const variableRef = useRef(null)

  useImperativeHandle(ref, () => ({
    componentFormVaild,
    getFormValue
  }))

  useEffect(() => {
    // add()
    init()

  }, [])

  const getFormValue = (key) => {
    return configFormRef.getFieldValue(key)
  }

  const init = () => {
    configFormRef.setFieldValue('from', 2)
    // 触发分支 CommieId接口
    item?.repo?.forEach(repo => {
      const keys = Object.keys(repo)
      keys.forEach(key => {
        let value = repo[key]
        if (key === 'repo') {
          value = repo['repo-name']
          handleRepoDisplay(item.id + '-repoType-repo-display_name', repo['repo-display_name'])

        }
        if (key.includes('repo-type')) {
          configFormRef.setFieldValue(repo.id + '-repoType-' + key, repo[key])
        } else {
          setTimeout(() => {
            configFormRef.setFieldValue(repo.id + '-repoType-' + key, value)
          }, 1000);
        }
      })
    })
  }

  const componentFormVaild = async () => {
    const data = await configFormRef.validateFields()

    const repoObj = {
      id: data[`${item.id}-repoType-id`],
      newId: data[`${item.id}-repoType-id`] + '-repo'
    }
    const refObj = {
      id: data[`${item.id}-repoType-id`],
      newId: data[`${item.id}-repoType-id`] + '-ref'
    }
    const shaObj = {
      id: data[`${item.id}-repoType-id`],
      newId: data[`${item.id}-repoType-id`] + '-sha'
    }

    const repoType = {
      from: 2,
      index: item.index,
      id: data[`${item.id}-repoType-id`],
      type: 'repo',
      prompt_on_trigger: data[`${item.id}-repoType-prompt_on_trigger`],
      isMoreOptions: data[`${item.id}-repoType-isMoreOptions`],
      repo: [],
      isBranch: data[`${item.id}-repoType-ref-isBranch`]
    }
    Object.keys(data).forEach(key => {
      const replaceKey = key.replace(`${item.id}-repoType-`, '')
      if (replaceKey.includes('ref')) {
        refObj[replaceKey] = data[key]
      } else if (replaceKey.includes('sha')) {
        shaObj[replaceKey] = data[key]
      } else {
        if (replaceKey !== 'id') {
          repoObj[replaceKey] = data[key]
        }
      }
    })
    repoType.repo = [repoObj, refObj, shaObj]

    return repoType
  }


  const tabChange = (key) => {
    setActiveKey(key)
  }

  const handleShowAll = (item) => {
    item.showAll = !item.showAll
    setList([...list])
  }

  const repoTypeChange = (id, value) => {
    configFormRef.setFieldValue(`${id}-repoType-repo-name`, undefined)
    configFormRef.setFieldValue(`${id}-repoType-repo-url`, undefined)
    configFormRef.setFieldValue(`${id}-repoType-repo-id`, undefined)
    configFormRef.setFieldValue(`${id}-repoType-repo`, undefined)
    configFormRef.setFieldValue(`${id}-repoType-ref`, undefined)
    configFormRef.setFieldValue(`${id}-repoType-sha`, undefined)
    configFormRef.setFieldValue(`${id}-repoType-ref-patchset`, undefined)
    // debugger
    // if () {

    // }
    // configFormRef.setFieldValue(`${id}-repoType-ref-isBranch`, true)
    formRepoRef.current.setOptionsData([])
    // (formRepoRef + id).current.setOptionsData([])
  }

  const repoChange = (id, info: any = {}) => {
    variableRef.current.isRepoChange = true
    configFormRef.setFieldValue(`${id}-repoType-repo-name`, info.name)
    configFormRef.setFieldValue(`${id}-repoType-repo-url`, info.url)
    configFormRef.setFieldValue(`${id}-repoType-repo-id`, info.id)
    configFormRef.setFieldValue(`${id}-repoType-ref`, undefined)
    configFormRef.setFieldValue(`${id}-repoType-sha`, undefined)
    configFormRef.setFieldValue(`${id}-repoType-ref-patchset`, undefined)

  }

  const branchChange = (id) => {
    // formCommitIdRef.current[index].current.getData()
    configFormRef.setFieldValue(`${id}-repoType-sha`, undefined)
  }

  const commitIdChange = () => {
    // console.log(123)
  }

  const remove = (e: Event, index: number) => {
    e.stopPropagation()
    list.splice(index, 1)
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
    // configFormRef.setFieldValue(`${id}-repoType-sha`, undefined)
    configFormRef.setFieldValue(`${id}-repoType-sha`, undefined)
  }

  const renderConfig = () => {
    return <div className='environmentVariable-config'></div>
  }

  const handleOptions = (from) => {
    const str = configFormRef.getFieldValue(from) || ''
    const options = str.split('\n').map(item => item.trim()).filter(Boolean)
    return [...new Set(options)]
  }

  const vaildatorEmpty = (info, value) => {
    if (!value) {
      return Promise.reject('请输入')
    }

    if (keywords.includes(value)) {
      return Promise.reject('与系统保留关键字冲突')
    }

    if (!/^[^\u4e00-\u9fa5\s]*$/.test(value)) {
      return Promise.reject('不能含有中文、空格')
    }
    return Promise.resolve()
  }

  const renderBranchAndCommitId = () => {
    return <>
      <div className='form-background-container'>
        <div className='flex-space-between' style={{ padding: '0 5px' }} >
          <div className='row-left-title' style={{ fontWeight: 'bold' }}>分支</div>
          <div className='row-left-name'></div>
          <div className='row-left-repo flex-end' style={{ flex: 1 }}>
            <Form.Item name={item.id + '-repoType-ref-show'} valuePropName="checked" initialValue={false} style={{ margin: '0' }}>
              <Checkbox >执行时显示</Checkbox>
            </Form.Item>
            <Form.Item label="" name={item.id + '-repoType-ref-is_required'} initialValue={item.is_required} valuePropName="checked" style={{ margin: 0 }}>
              <Checkbox >必填</Checkbox>
            </Form.Item>
          </div>
          <div className='row-right-repo'></div>
        </div>

        <div className='item-row flex-space-between'>
          {/* <div className='row-left-title'>分支</div> */}
          <div className='row-left-name'>
          </div>
          <div className='row-left-repo'>
            <Form.Item label="Key" name={item.id + '-repoType-ref-name'} initialValue={refName || 'Branch'} rules={[{ required: false, message: '' }, { validator: vaildatorEmpty }]}>
              <Input placeholder='请输入' onChange={nameBlur} />
            </Form.Item>
          </div>

          <div className='row-right-repo'>
            <Form.Item label="显示名称" name={item.id + '-repoType-ref_display_name'} initialValue={item.display_name}>
              <Input placeholder='请输入' />
            </Form.Item>
          </div>
        </div>
        <div className='item-row flex-space-between' style={{ alignItems: 'flex-start' }}>
          <div className='row-left-name'>
          </div>
          <div style={{ flex: 1 }}>
            <Form.Item noStyle shouldUpdate>
              {
                () => {
                  const formData = configFormRef.getFieldsValue()
                  const repoType = formData[item.id + '-repoType-repo-type']
                  const repoId = formData[`${item.id}-repoType-repo-id`]
                  const isBranch = `${item.id}-repoType-ref-isBranch`
                  const patchsetName = `${item.id}-repoType-ref-patchset`
                  const tagName = `${item.id}-repoType-ref-tag`
                  const v = configFormRef.getFieldValue(`${item.id}-repoType-ref-isBranch`)
                  const branchValue = v
                  const label = '默认值'
                  const repoName = configFormRef.getFieldValue(`${item.id}-repoType-repo-name`)
                  // const patchset = configFormRef.getFieldValue()
                  return <div style={{ paddingBottom: '10px' }}>


                    {/* <FormBranch name={`${item.id}-repoType-ref`} label={label} initialValue={undefined} repoType={repoType} repoId={repoId} change={(v) => branchChange(item.id)} required={false} message='请输入' isBranch={isBranch} onSwitchBranchChange={onSwitchBranchChange} repoName={repoName} patchsetName={patchsetName} isBranchValue={branchValue} id={item.id} from={configFormRef} /> */}

                    <NewFormBranch name={`${item.id}-repoType-ref`} label={label} initialValue={undefined} repoType={repoType} repoId={repoId} change={(v) => branchChange(item.id)} isBranch={isBranch} onSwitchBranchChange={onSwitchBranchChange} isBranchValue={branchValue} id={item.id} repoName={repoName} required={false} patchsetName={patchsetName} form={configFormRef} tagName={tagName} detailVal={detailVal} />


                    {/* <NewFormBranch ref={formBranchRef} name={`ref`} label={''} initialValue="master" repoType={form.getFieldValue('repo-type')} repoId={form.getFieldValue(`repo-id`)} change={(v) => componentBranchChange(v)} className="left" isBranch={isBranch} onSwitchBranchChange={onSwitchBranchChange} isBranchValue={isBranchValue} id={''} repoName={repoName} rules={[{ required: true, message: '12' }]} isVaildBranch={true} presetChange={presetChange} searchChange={searchChange} patchsetName={patchsetName} currentDefaultValue={form.getFieldValue(`ref`)} form={form} tagName={'tag'} detailVal={detailVariablesRef.current} /> */}
                  </div>
                }
              }
            </Form.Item>
          </div>
        </div>
        <div className='item-row flex-space-between' >
          <div className='row-left-name'>
          </div>
          <div className='all-repo flex-start'>
            <Form.Item label="描述" name={item.id + '-repoType-ref-description'} initialValue={refDescription} style={{ width: '100%' }} className='flowLine-desc-editor'>
              {/* <Input placeholder='请输入' /> */}
              <EditorComponent title='' content={refDescription || item?.repo?.find(item => item?.['ref-description'])?.['ref-description'] || ''} hideTitle={true} isSimple={true} disabled={type !== 1} />
            </Form.Item>
          </div>
        </div>
      </div>


      <Form.Item shouldUpdate>
        {
          () => {
            const ref = configFormRef.getFieldValue(`${item.id}-repoType-ref`)
            const isBranchValue = configFormRef.getFieldValue(`${item.id}-repoType-ref-isBranch`)
            if (!ref || isBranchValue !== 'branch') {
              // if (!ref || !isBranchValue) {
              return <></>
            }
            return <div className='form-background-container'>
              <div className='flex-space-between' style={{ padding: '0 0px' }} >
                <div className='row-left-title' style={{ fontWeight: 'bold' }}>CommitId</div>
                <div className='row-left-name'></div>
                <div className='row-left-repo flex-end' style={{ flex: 1 }}>
                  <Form.Item name={item.id + '-repoType-sha-show'} valuePropName="checked" initialValue={false} style={{ marginLeft: '20px', margin: '0' }}>
                    <Checkbox >执行时显示</Checkbox>
                  </Form.Item>
                  <Form.Item label="" name={item.id + '-repoType-sha-is_required'} initialValue={item.is_required} valuePropName="checked" style={{ margin: 0 }}>
                    <Checkbox >必填</Checkbox>
                  </Form.Item>
                </div>
                <div className='row-right-repo'></div>
              </div>
              <div className='item-row flex-space-between'>
                <div className='row-left-title'></div>
                <div className='row-left-name'>
                </div>


                <div className='row-left-repo'>
                  <Form.Item label="Key" name={item.id + '-repoType-sha-name'} initialValue={shaName || 'CommitId'} rules={[{ required: false, message: '' }, { validator: vaildatorEmpty }]}>
                    <Input placeholder='请输入' onChange={nameBlur} />
                  </Form.Item>
                </div>

                <div className='row-right-repo'>
                  <Form.Item label="显示名称" name={item.id + '-repoType-sha_display_name'} initialValue={item.display_name}>
                    <Input placeholder='请输入' />
                  </Form.Item>
                </div>
              </div>

              <div className='item-row flex-space-between'>
                <div className='row-left-name'>
                </div>
                <div style={{ flex: 1 }}>
                  <Form.Item noStyle shouldUpdate>
                    {
                      () => {
                        // const data = configFormRef.getFieldsValue()
                        // const repoType = data[item.id + '-repoType-repo-type']
                        // const repoId = data[`${item.id}-repoType-repo-id`]
                        // const ref = data[`${item.id}-repoType-ref`] || configFormRef.getFieldValue(`${item.id}-repoType-ref`)
                        // const repoName = data[`${item.id}-repoType-repo-name`]

                        const data = configFormRef.getFieldsValue()
                        const repoType = data[item.id + '-repoType-repo-type']
                        const repoId = data[`${item.id}-repoType-repo-id`]
                        const isBranchValue = data[`${item.id}-repoType-ref-isBranch`] || repoType !== 'gerrit'
                        const ref = data[`${item.id}-repoType-ref`] || configFormRef.getFieldValue(`${item.id}-repoType-ref`)
                        const repoName = data[`${item.id}-repoType-repo-name`]


                        return <FormCommitId ref={formCommitIdRef} name={`${item.id}-repoType-sha`} label="默认值" initialValue={undefined} repoType={repoType} repoId={repoId} branch={ref} repoName={repoName} change={commitIdChange} required={false} message='请输入' isBranchValue={isBranchValue} disabled={type !== 1} />
                      }
                    }
                  </Form.Item>

                </div>
              </div>

              <div className='item-row flex-space-between'>
                <div className='row-left-name'>
                </div>
                <div className='all-repo flex-start'>
                  <Form.Item label="描述" name={item.id + '-repoType-sha-description'} initialValue={shaDescription} style={{ width: '100%' }} className='flowLine-desc-editor'>
                    {/* <Input placeholder='请输入' /> */}
                    <EditorComponent title='' content={shaDescription || item?.repo?.find(item => item?.['sha-description'])?.['sha-description'] || ''} hideTitle={true} isSimple={true} disabled={type !== 1} />
                  </Form.Item>

                </div>
              </div>
            </div>
          }
        }
      </Form.Item>

    </>
  }

  const emptyVaild = (info, value) => {
    if (!value) {
      return Promise.reject('请输入')
    }

    if (!/^[^\u4e00-\u9fa5\s]*$/.test(value)) {
      return Promise.reject('不能含有中文、空格')
    }
    return Promise.resolve()
  }

  const renderListItem = () => {
    configFormRef.setFieldValue(item.id + '-repoType-id', item.id)
    return <div>
      <Form.Item noStyle name='from'></Form.Item>
      <Form.Item noStyle name={item.id + '-repoType-repo-name'}></Form.Item>
      <Form.Item noStyle name={item.id + '-repoType-repo-url'}></Form.Item>
      <Form.Item noStyle name={item.id + '-repoType-id'}></Form.Item>
      <Form.Item noStyle name={item.id + '-repoType-repo-id'}></Form.Item>
      <div className='form-background-container'>
        <div className='item-row flex-space-between '>
          <div className='row-left-title'>Repo</div>
          <div className='row-left-name'>
          </div>
          <div className='row-left-repo'>
            <Form.Item label="仓库类型" name={item.id + '-repoType-repo-type'} initialValue={'gerrit'} rules={[{ required: true, message: '请选择仓库类型' }]} style={{ width: '100%' }}>
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
              ]} onChange={(v) => repoTypeChange(item.id, v)} />
            </Form.Item>
          </div>
          <div className='row-right-repo flex-start'>
            <Form.Item label="仓库显示名称" name={item.id + '-repoType-repo-display_name'} initialValue={'gerrit'} style={{ marginRight: '20px', width: '60%' }} >
              <Input placeholder='请输入' onChange={(e) => {
                const value = e.target.value
                handleRepoDisplay(item.id + '-repoType-repo-display_name', value)
              }} />
            </Form.Item>
            <Form.Item label="" noStyle name={item.id + '-repoType-isMoreOptions'} initialValue={item.isMoreOptions} valuePropName="checked">
              <Checkbox >高级选项</Checkbox>
            </Form.Item>
          </div>
        </div>

      </div>


      <div className='form-background-container'>
        <div className='flex-space-between'  >
          <div className='row-left-title' style={{ fontWeight: 'bold' }}>仓库名称</div>
          <div className='row-left-name'></div>
          <div className='row-left-repo flex-end' style={{ flex: 1 }}>
            <Tooltip title="暂不支持该操作">
              <Form.Item label="" name={item.id + '-repoType-prompt_on_trigger'} initialValue={true} valuePropName="checked" style={{ margin: 0 }}>
                <Checkbox disabled>执行时显示</Checkbox>
              </Form.Item>
            </Tooltip>
            &nbsp;&nbsp;&nbsp;
            <Form.Item label="" name={item.id + '-repoType-is_required'} initialValue={item.is_required} valuePropName="checked" style={{ margin: 0 }}>
              <Checkbox >必填</Checkbox>
            </Form.Item>
          </div>
          <div className='row-right-repo'></div>
        </div>
        <div className='item-row flex-space-between'>
          <div className='row-left-title'></div>
          <div className='row-left-name'>
          </div>
          <div className='row-left-repo'>
            <Form.Item label="Key" name={item.id + '-repoType-git_url-name'} initialValue={repoType || 'RepoName'} rules={[{ required: true, message: '' }, { validator: vaildatorEmpty }]}>
              <Input placeholder='请输入' onChange={nameBlur} />
            </Form.Item>
          </div>

          <div className='row-right-repo'>
            <Form.Item label="显示名称" name={item.id + '-repoType-repo_display_name'} initialValue={item.display_name || '仓库名称'}>
              <Input placeholder='请输入' />
            </Form.Item>
          </div>
        </div>
        <div className='item-row flex-space-between' style={{ alignItems: 'flex-start' }}>
          <div className='row-left-name'>
          </div>
          <div style={{ flex: 1 }}>
            <Form.Item noStyle shouldUpdate>
              {
                () => {
                  return <FormRepo ref={formRepoRef} name={`${item.id}-repoType-repo`} label="默认值" initialValue={undefined} repoType={configFormRef.getFieldValue(item.id + '-repoType-repo-type')} repoChange={info => repoChange(item.id, info)} required={false} message='' />
                }
              }
            </Form.Item>
          </div>
        </div>

        <div className='item-row flex-space-between'>
          <div className='row-left-name'>
          </div>
          <div className='all-repo'>
            <Form.Item label="描述" name={item.id + '-repoType-git_url-description'} initialValue={gitUrlDescription} className='flowLine-desc-editor'>
              {/* <Input placeholder='请输入' /> */}
              <EditorComponent title='' content={gitUrlDescription || item?.repo?.find(item => item?.['git_url-description'])?.['git_url-description'] || ''} hideTitle={true} isSimple={true} disabled={type !== 1} />
            </Form.Item>
          </div>
        </div>
      </div>
      <Form.Item shouldUpdate>
        {
          () => {
            const repoName = configFormRef.getFieldValue(`${item.id}-repoType-repo`)
            if (!repoName) {
              return <></>
            }
            return renderBranchAndCommitId()
          }
        }
      </Form.Item>
    </div >
  }

  return (
    <div className='flex-baseConfig-environmentVariable-container flow-config-environmentVariable-repo-container' ref={variableRef}>
      <Form layout="vertical" form={configFormRef}>
        {
          renderListItem()
        }
      </Form>
    </div>
  );
}

export default forwardRef(Project)
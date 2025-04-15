import React, { useEffect, useState, useImperativeHandle, forwardRef, useReducer, useRef } from 'react';
import { Button, Form, Radio, Select, Input, Checkbox, Dropdown, message, Tooltip } from 'antd';

import { RightOutlined, MinusOutlined, PlusOutlined, SettingOutlined, DownOutlined, HolderOutlined } from '@ant-design/icons'
import EditorComponent from '@/components/Editor';
import { useModel } from "umi";

import './style.less'
import { typeOptions, keywords } from './data'
import moment from 'moment'

import { validator } from '../../../flow/component/configModal/data'
const { Option } = Select;

import Repo from './components/repo'
import EnvComponent from './components/component'
import StringComponent from './components/string'
import BoolComponent from './components/bool'
import DateComponent from './components/date'
import ChooseComponent from './components/choose'
import ChoiceMultiple from './components/choiceMultiple'
import { isUserAuth } from '@/utils'
import Upload from './components/upload'
import FileContent from './components/fileContent'
import UserComponent from './components/user'
import Relation from './components/relation'
import { useSelector, useDispatch } from 'dva'
import { getUrlParams } from '@/utils'

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 },
};

const Project = (props: any, ref: any) => {
  const { data, type: parentType } = props
  const [form] = Form.useForm();
  const [configList, setConfigList] = useState<any>([])
  const [, forceUpdate] = useReducer(state => state + 1, 0)
  const [expand, setExpand] = useState(true)
  const query = getUrlParams()

  const chooseRef = useRef(null)

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  const repoRef = useRef([])
  const envComponentRef = useRef(null)
  const relationRef = useRef(null)
  const variableList = useRef([])
  const moveRef: any = useRef({})

  const repoCount = useRef(0)

  const pipeline = useSelector(({ pipeline }) => pipeline)
  const dispatch = useDispatch()

  const repoIndex = useRef(1)

  const { pipelineId, from } = query

  const oldIndex = pipeline.list.findIndex(item => item.id === pipelineId)

  useImperativeHandle(ref, () => ({
    getFormValue,
    formScrollToField
  }))

  useEffect(() => {
    initForm()
  }, [data])

  useEffect(() => {
    handleEnv()
  }, [configList])

  const handleEnv = async () => {
    variableList.current = []
    // 过滤组件
    let record = configList.filter(item => item.type !== 'component')
    // 铺平数据
    record.forEach(item => {
      item.id += ''
      variableList.current.push(item)
    })
  }

  const initForm = () => {
    form.setFieldValue('from', 2)
    const env = data.setting?.pipeline_variable || []
    const envData = env.map((item, index) => {
      item.isArrowRotate = true
      // if (item.index === undefined) {
      //   item.index = env.length - index
      // }
      return item
    })
    // let index = 0
    // if (envData.length > 0) {
    //   index = envData.sort((a, b) => b.index - a.index)[0].index
    // }
    // repoCount.current = index
    setConfigList(envData)
  }

  const filterData = (data) => {
    const env1 = data.filter(item => item.type === 'string' || item.type === 'bool')
    const component = data.filter(item => item.type === 'component')
    const choose = data.filter(item => item.type === 'choose')
    const repo = data.filter(item => item.type === 'repo')
    return [...component, ...repo, ...env1, ...choose,]
  }

  const getFormValue = async (from) => {
    const arrValues = []
    let componentData = []
    // 处理组件
    if (envComponentRef.current) {
      // 组件数据
      componentData = await envComponentRef.current.componentFormVaild()
      if (componentData.length <= 0) {
        return Promise.reject({
          values: {
            from: 2
          },
          errorFields: [{ errors: ['请至少添加一个组件'] }]
        })
      }

      const defaultComponent = componentData.find(item => item.checked)
      if (!defaultComponent) {
        return Promise.reject({
          values: {
            from: 2
          },
          errorFields: [{ errors: ['请默认选择一个组件'] }]
        })
      }

      const configComponent = configList.find(item => item.type === 'component')
      const configComponentIndex = configList.findIndex(item => item.type === 'component')
      arrValues[configComponentIndex] = {
        type: configComponent.type,
        prompt_on_trigger: configComponent.prompt_on_trigger,
        componentDefault: defaultComponent
      }
    }
    const repoRefList = repoRef.current.filter(Boolean)
    // 处理仓库
    if (repoRefList.length > 0) {
      for (let i = 0; i < repoRefList.length; i++) {
        const component = repoRefList[i]
        const repoData = await component.componentFormVaild()
        const findIndex = configList.findIndex(item => item.id === repoData.id)
        if (findIndex < 0) {
          arrValues.push(repoData)
        } else {
          arrValues[findIndex] = repoData
        }
      }
    }
    const values = await form.validateFields()

    configList.filter(item => item.type !== 'component' && item.type !== 'repo').forEach((item, index) => {
      const id = item.id + ''
      const itemKeys = Object.keys(values)
      const filterArr = itemKeys.filter(key => {
        const keyFirst = key.slice(0, id.length)
        if (keyFirst === id) {
          return key
        }
      })
      const findIndex = configList.findIndex(config => config.id == item.id)
      arrValues[findIndex] = handleKey(id, filterArr, values)
    })
    const parmas: any = {
      env: arrValues
    }
    if (componentData.length > 0) {
      parmas.envComponentList = componentData
    }
    // getUrlParams
    // if (from !== 'relation') {
    //   parmas.relationList = relationRef.current.saveRelationData()
    // }

    parmas.default_trigger_info = handleTriggerValue(parmas.env)

    return parmas
  }

  const handleRepoValue = (envList, params) => {
    let list = []
    const repoList = envList.filter(envItem => envItem.prompt_on_trigger && envItem.type === 'repo').reverse()
    repoList.forEach((item, index) => {
      const repoInfo = item.repo
      const repo = repoInfo[0]
      const ref = repoInfo[1]
      const sha = repoInfo[2]

      let data: any = {
        index: index + 1 + '',
        platform: repo['repo-type'],
        base_info: {
          "key": repo['git_url-name'] || '',
          "name": repo['repo-name'] || '',
          "repo_id": repo['repo-id'] || '',
          "repo_url": repo['repo-url'] || ''
        },
      }
      switch (ref['ref-isBranch']) {
        case 'branch':
          data.branch_patchset = {
            type: 'branch',
            key: ref['ref-name'],
            ref: ref['ref']
          }
          data.commit = {
            sha: sha['sha'] || '',
            key: sha['sha-name'] || ''
          }
          break
        case 'patchset':
          data.branch_patchset = {
            type: 'patchset',
            key: ref['ref-name'],
            patchset: ref['ref-patchset']
          }
          break
        case 'tag':
          data.branch_patchset = {
            type: 'tag',
            key: ref['ref-name'],
            tag: ref['ref-tag']
          }
          break
      }
      list.push(data)
    })
    params.push({ repo_info: list })
  }

  const handleOtherValue = (envList, params) => {
    const otherList = envList.filter(envItem => envItem.prompt_on_trigger && envItem.type !== 'repo')
    otherList.forEach(item => {
      const { type, name, display_name, description, default: defaultValue } = item
      const obj: any = {
        key: name,
        type,
        value: defaultValue,
        description,
        display_name
      }
      if (type === 'date' && defaultValue) {
        obj.value = moment(obj.value).format('YYYY-MM-DD HH:mm:ss')
      }
      params.push(obj)
    })
  }

  const handleTriggerValue = (envList) => {
    const params: any = []
    handleRepoValue(envList, params)
    handleOtherValue(envList, params)
    return params
  }

  const handleKey = (id, arr, values) => {
    const obj = {
      id
    }
    arr.map(key => {
      let value = values[key]
      obj[key.slice(id.length + 1, key.length)] = value
    })
    return obj
  }

  // 动画 滚动到顶部
  const goScrollTop = (el?) => {
    const scrollEl = el || document.documentElement || document.body
    // scrollEl.scrollTop = 0
    const scrollHeight = scrollEl.scrollHeight;
    const clientHeight = scrollEl.clientHeight;
    const scrollTop = scrollEl.scrollTop

    const start = Date.now();
    const duration = 500; // 动画持续时间，单位为毫秒

    function animateScroll() {
      const elapsed = Date.now() - start;
      const progress = elapsed / duration;

      const targetScrollTop = scrollHeight - clientHeight;

      scrollEl.scrollTo(0, scrollTop - targetScrollTop * progress);

      if (elapsed < duration) {
        requestAnimationFrame(animateScroll);
      }
    }
    animateScroll();
  }

  const add = (type) => {
    if (parentType === 2) {
      message.info('预览页面不可编辑，请点击编辑按钮跳转至编辑页面新增')
      return
    }
    const el = document.querySelector('#flowline-modify-base-right-container')
    goScrollTop(el)
    // 返回顶部
    if (type === 'repo') {
      repoCount.current += 1
    }

    const item = {
      id: Math.random(),
      isArrowRotate: true,
      name: `param${configList.length + 1}`,
      default: '',
      description: '',
      type: type,
      prompt_on_trigger: true,
      isNew: true,
      // index: repoCount.current
    }

    // if (type === 'repo') {
    //   const repoList = configList.filter(item => item.type === 'repo')
    //   item.alias = '仓库' + (repoList.length + 1)
    // }
    configList.unshift(item)


    setConfigList([...configList])
    // forceUpdate()
  }

  const show = (item: any) => {
    item.isArrowRotate = !item.isArrowRotate

    if (configList.every(item => item.isArrowRotate === true)) {
      setExpand(true)
    }

    if (configList.every(item => item.isArrowRotate === false)) {
      setExpand(false)
    }
    setConfigList([...configList])
  }

  const remove = (index: number, itemData) => {
    // 处理删除
    const currentData = pipeline.list[oldIndex]
    const list = currentData.setting?.extra_data?.relationList
    if (list) {
      list.forEach((item, index) => {
        const { options } = item
        // 删除互斥关系选项
        const newOptions = []
        options.forEach((id, optionIndex) => {
          if (!id.includes(itemData.id)) {
            newOptions.push(id)
          }
        })
        list[index].options = newOptions
        const value = newOptions.find(id => id === item.value)
        item.value = value || newOptions[0]
        // 当剩余最后一个，则直接解除互斥关系
        if (newOptions.length <= 1) {
          list.splice(index, 1)
        }
      })
    }
    dispatch({
      type: 'pipeline/setList',
      payload: { list: [...pipeline.list] }
    })

    configList.splice(index, 1)
    setConfigList([...configList])
    form.validateFields()
  }



  const validator = (info, value, callback, id) => {
    if (!value) {
      // 分支和CommitId不是必填
      if (info.field.includes('-ref') || info.field.includes('-sha')) {
        return Promise.resolve()
      }
      return Promise.reject('请输入')
    }
    // if (value.length > 50) {
    //   return Promise.reject('请控制在50个字符内')
    // }
    if (!/^[^\u4e00-\u9fa5\s]*$/.test(value)) {
      return Promise.reject('不能含有中文、空格')
    }

    if (keywords.includes(value)) {
      return Promise.reject('与系统保留关键字冲突')
    }

    const values = []
    configList.map(item => {
      if (item.type === 'repo') {
        const repoList = configList.filter(item => item.type === 'repo')
        const index = repoList.findIndex(config => config.id === item.id)
        const currentRepoRef = repoRef.current[index]
        values.push({
          key: item.id + '-repoType-git_url-name',
          value: currentRepoRef.getFormValue(item.id + '-repoType-git_url-name')
        })

        values.push({
          key: item.id + '-repoType-ref-name',
          value: currentRepoRef.getFormValue(item.id + '-repoType-ref-name')
        })
        values.push({
          key: item.id + '-repoType-sha-name',
          value: currentRepoRef.getFormValue(item.id + '-repoType-sha-name')
        })
      } else {
        values.push({
          key: item.id + '-name',
          value: form.getFieldValue(item.id + '-name')
        })
      }
    })
    const val = findDuplicate(values.filter(item => item.value))
    if (val) {
      // 找出重复的key，只让重复的表单报错
      const vaild = values.filter(item => item.value === val)
      for (let i = 0; i < vaild.length; i++) {
        const key = vaild[i].key
        if (info.field === key) {
          return Promise.reject('名称重复')
        }
      }
    }
    return Promise.resolve()
  }

  const selectChange = (value: any, id: any, index: number) => {
    configList[index].type = value
    setConfigList([...configList])
    form.validateFields(configList.map(item => {
      return item.id + '-type'
    }))
    form.setFieldValue(id + '-default', undefined)
    switch (value) {
      case 'string':
        form.setFieldValue(id + '-default', '')
        break
      case 'bool':
        form.setFieldValue(id + '-default', true)
        break
      case 'choose':
        form.setFieldValue(id + '-default', undefined)
        break
      case 'ref':
        form.setFieldValue(id + '-default', 'master')
        break
    }
  }

  const validatorType = (info, value, callback) => {
    if (!value) {
      return Promise.reject('请输入')
    }
    const list = configList.map(item => {
      return form.getFieldValue(item.id + '-type')
    })
    const refLen = list.filter(item => item === 'ref').length
    const gitUrlLen = list.filter(item => item === 'git_url').length
    const commitLen = list.filter(item => item === 'sha').length
    // 分支、代码库、CommitId 各自只能存在一个
    if (value === 'ref') {
      if (refLen > 1) {
        return Promise.reject('Gerrit 分支 只能保留一个')
      }
    }
    if (value === 'git_url') {
      if (gitUrlLen > 1) {
        return Promise.reject('代码库 只能保留一个')
      }
    }
    if (value === 'sha') {
      if (commitLen > 1) {
        return Promise.reject('Commit Id 只能保留一个')
      }
    }

    if (value === 'ref' || value === 'sha') {
      // 分支 或 CommitId存在，但是仓库不存在  报错
      if ((refLen === 1 || commitLen === 1) && gitUrlLen < 1) {
        return Promise.reject('选择 Gerrit 分支 或者 Commit Id 需要选择一个仓库环境变量')
      }
    }
    if (value === 'git_url') {
      // 仓库存在，分支 必须存在
      if (gitUrlLen === 1 && refLen < 1) {
        return Promise.reject('选择仓库后，需要选择一个 GIT 分支环境变量')
      }
    }
    return Promise.resolve()
  }

  function findDuplicate(arr) {
    const map = new Map();
    for (let i = 0; i < arr.length; i++) {
      const str = arr[i].value;
      if (map.has(str)) {
        return str;
      } else {
        map.set(str, true);
      }
    }
    return null;
  }

  const nameBlur = () => {
    form.validateFields()
  }

  const execShow = (item) => {
    item.prompt_on_trigger = !item.prompt_on_trigger
    setConfigList([...configList])
  }

  const renderItemType = (item: any) => {
    const { default: defaultValue } = item
    const formType = item.id + '-type'
    const formTypeValue = form.getFieldValue(formType)
    switch (formTypeValue) {
      case 'string':
        return <StringComponent item={item} validator={validator} nameBlur={nameBlur} />
      case 'bool':
        return <BoolComponent item={item} validator={validator} nameBlur={nameBlur} />
      case 'choose':
        return <ChooseComponent item={item} validator={validator} nameBlur={nameBlur} form={form} ref={chooseRef} />
      case 'multiple':
        return <ChoiceMultiple item={item} validator={validator} nameBlur={nameBlur} form={form} ref={chooseRef} />
      case 'date':
        return <DateComponent item={item} validator={validator} nameBlur={nameBlur} />
    }
    return <></>
  }

  const renderRepo = (item: any) => {
    const repoList = configList.filter(item => item.type === 'repo')
    const index = repoList.findIndex(config => config.id === item.id)
    return <Repo ref={(component) => repoRef.current[index] = component} item={item} form={form} configList={configList} validator={validator} nameBlur={nameBlur} type={parentType} handleRepoDisplay={handleRepoDisplay} />
  }

  const renderComponent = (item: any) => {
    return (
      <>
        <div className='flex-end' style={{ padding: '0 20px' }}>
          <Form.Item label="" noStyle name={item.id + '-prompt_on_trigger'} initialValue={item.prompt_on_trigger} valuePropName="checked">
            <Checkbox onChange={() => execShow(item)}>执行时显示</Checkbox>
          </Form.Item>
        </div>
        <EnvComponent ref={envComponentRef} data={data} parentType={parentType} />
      </>
    )
  }

  const renderChoose = (item: any) => {
    return <></>
  }

  const renderRowRight = (item) => {
    const { prompt_on_trigger, isMoreOptions, is_required } = item
    return <div className='flex-start'>
      <Form.Item label=" " name={item.id + '-prompt_on_trigger'} initialValue={prompt_on_trigger} valuePropName="checked">
        <Checkbox >执行时显示</Checkbox>
      </Form.Item>&nbsp;&nbsp;&nbsp;
      <Form.Item label="" noStyle name={item.id + '-isMoreOptions'} initialValue={isMoreOptions} valuePropName="checked">
        <Checkbox >高级选项</Checkbox>
      </Form.Item>
      <Form.Item label="" noStyle name={item.id + '-is_required'} initialValue={is_required} valuePropName="checked">
        <Checkbox >必填</Checkbox>
      </Form.Item>
    </div>
  }

  const renderUpload = (item) => {
    const { name, isArrowRotate, description, type, default: defaultValue, prompt_on_trigger } = item
    return <>
      <div className='item-row flex-space-between'>
        {/* {item.id} */}
        <Form.Item name={item.id + '-type'} initialValue={'upload'} noStyle></Form.Item>
        <div className='row-left'>
          <Form.Item label="变量类型" name={item.id + '-type'} initialValue={type || 'string'} rules={[{ required: true, message: '' }, { validator: validatorType }]}>
            <Select options={[{
              label: '文件',
              value: 'upload'
            }]} />
          </Form.Item>
        </div>
        <div className='row-right'>
          {
            renderRowRight(item)
          }
        </div>
      </div>

      <Upload item={item} form={form} type={parentType} validator={validator} nameBlur={nameBlur} />

      <div className='item-row flex-space-between'>
        <div className='all'>
          <Form.Item label="描述" name={item.id + '-description'} initialValue={description} className='flowLine-desc-editor'>
            {/* <Input placeholder='请输入' /> */}
            <EditorComponent title='' content={description} hideTitle={true} isSimple={true} disabled={!isUserAuth(currentUser, data?.creator_user_id) || parentType !== 1} />
          </Form.Item>
        </div>
      </div>
    </>
  }

  const renderFileContent = (item) => {
    const { name, isArrowRotate, description, type, default: defaultValue, prompt_on_trigger } = item
    return <>
      <div className='item-row flex-space-between'>
        {/* {item.id} */}
        <Form.Item name={item.id + '-type'} initialValue={'fileContent'} noStyle></Form.Item>
        <div className='row-left'>
          <Form.Item label="文件内容" name={item.id + '-type'} initialValue={type || 'string'} rules={[{ required: true, message: '' }, { validator: validatorType }]}>
            <Select options={[{
              label: '文件内容',
              value: 'fileContent'
            }]} />
          </Form.Item>
        </div>
        <div className='row-right'>
          {
            renderRowRight(item)
          }
        </div>
      </div>

      <FileContent item={item} form={form} type={parentType} validator={validator} nameBlur={nameBlur} />

      <div className='item-row flex-space-between'>
        <div className='all'>
          <Form.Item label="描述" name={item.id + '-description'} initialValue={description} className='flowLine-desc-editor'>
            {/* <Input placeholder='请输入' /> */}
            <EditorComponent title='' content={description} hideTitle={true} isSimple={true} disabled={!isUserAuth(currentUser, data?.creator_user_id) || parentType !== 1} />
          </Form.Item>
        </div>
      </div>
    </>
  }

  const renderUser = (item) => {
    const { name, isArrowRotate, description, type, default: defaultValue, prompt_on_trigger } = item
    return <>
      <div className='item-row flex-space-between'>
        {/* {item.id} */}
        <Form.Item name={item.id + '-type'} initialValue={'user'} noStyle></Form.Item>
        <div className='row-left'>
          <Form.Item label="用户" name={item.id + '-type'} initialValue={type} rules={[{ required: true, message: '' }, { validator: validatorType }]}>
            <Select options={[{
              label: '用户',
              value: 'user'
            }]} />
          </Form.Item>
        </div>
        <div className='row-right'>
          {
            renderRowRight(item)
          }
        </div>
      </div>
      <UserComponent item={item} form={form} type={parentType} validator={validator} nameBlur={nameBlur} />
      <div className='item-row flex-space-between'>
        <div className='all'>
          <Form.Item label="描述" name={item.id + '-description'} initialValue={description} className='flowLine-desc-editor'>
            {/* <Input placeholder='请输入' /> */}
            <EditorComponent title='' content={description} hideTitle={true} isSimple={true} disabled={!isUserAuth(currentUser, data?.creator_user_id) || parentType !== 1} />
          </Form.Item>
        </div>
      </div>
    </>
  }



  const renderType = (item: any, index: number) => {
    const { name, isArrowRotate, description, type, default: defaultValue, prompt_on_trigger } = item
    switch (type) {
      case 'repo':
        return renderRepo(item)
      case 'component':
        return renderComponent(item)
      case 'upload':
        return renderUpload(item)
      case 'user':
        return renderUser(item)
      case 'fileContent':
        return renderFileContent(item)
    }
    return <>
      <div className='item-row flex-space-between'>
        {/* {item.id} */}
        <div className='row-left'>
          <Form.Item label="变量类型" name={item.id + '-type'} initialValue={type || 'string'} rules={[{ required: true, message: '' }, { validator: validatorType }]}>
            <Select options={typeOptions} onChange={(value) => selectChange(value, item.id, index)} />
          </Form.Item>
        </div>
        <div className='row-right'>
          {
            renderRowRight(item)
          }
        </div>
      </div>
      <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues[item.id + '-type'] !== curValues[item.id + '-type']}>
        {
          () => {
            return renderItemType(item)
          }
        }
      </Form.Item>
      <div className='item-row flex-space-between'>
        <div className='all'>
          <Form.Item label="描述" name={item.id + '-description'} initialValue={description} className='flowLine-desc-editor'>
            {/* <Input placeholder='请输入' /> */}
            <EditorComponent title='' content={description} hideTitle={true} isSimple={true} disabled={!isUserAuth(currentUser, data?.creator_user_id) || parentType !== 1} />
          </Form.Item>
        </div>
      </div>
    </>
  }

  const handleRepoDisplay = (key, v) => {
    form.setFieldValue(key, v)
  }

  const renderHeaderTitle = (type, item) => {
    let title = form.getFieldValue(item.id + '-name')
    switch (type) {
      case 'repo':
        const repoList = configList.filter(item => item.type === 'repo')
        // title = '仓库' + (item.index || '')
        const display_name = form.getFieldValue(item.id + '-repoType-repo-display_name')
        // debugger
        const name = display_name || '仓库' + (repoList.length + 1 - (repoList.findIndex(config => config.id === item.id) + 1))

        title = <>
          {name}
          <Form.Item label="" style={{ margin: '0', padding: '0', display: 'none' }} name={item.id + '-repoType-repo-display_name'}>
            <Input onClick={(e) => e.stopPropagation()} style={{ width: '40%' }} />
          </Form.Item>
        </>
        break
      case 'component':
        title = '组件'
        break
      default:
        break
    }
    return title
  }

  const onDragEnter = (e: any) => {
    e.stopPropagation()
    e.preventDefault();
    if (!moveRef.current.isDragStart) {
      return
    }
    const { clientY } = e
    const target = e.target.closest('.form-config-item');
    const { dragElement, dragStartY, dragBox } = moveRef.current
    if (dragElement) {
      if (target && target.dataset.id !== dragElement.dataset.id) {
        let container = target.closest('.form-config-item-container');
        if (container) {
          if (dragStartY > clientY) {
            container.insertBefore(dragBox, target);
          } else {
            container.insertBefore(dragBox, target.nextElementSibling);
          }
          moveRef.current.dragStartY = clientY
        }
      }
    }
  }

  const onDragEnd = (e: any) => {
    e.stopPropagation()
    moveRef.current.isStepDragStart = false
    const { clientY } = e
    moveRef.current.dragBox.style.opacity = '1'
    draggableItem(false)

    // 处理数据
    const elList = Array.from(document.querySelectorAll('.form-config-item'))
    const list = []
    elList.forEach((el: any) => {
      const value = configList.find(item => item.id === el.dataset.id)
      if (value) {
        list.push(value)
      }
    })

    setConfigList(list)
  }

  const onDragStart = (e: any) => {
    e.stopPropagation()
    configList.forEach(item => item.isArrowRotate = false)
    setConfigList([...configList])
    setExpand(false)
    const target: any = e.target
    // 存储参数
    moveRef.current.isDragStart = true
    moveRef.current.dragBox = target.parentNode.parentNode.parentNode
    moveRef.current.dragElement = target
    moveRef.current.dragStartY = e.clientX
    // 设置拖拽效果
    moveRef.current.dragBox.style.opacity = '.3'
    draggableItem(true)
  }

  const draggableItem = (status) => {
    Array.from(document.querySelectorAll('.form-config-item')).forEach(el => {
      el.draggable = status
    })
  }

  const renderContent = (item: any, index: number) => {
    const { name, isArrowRotate, description, type, default: defaultValue, prompt_on_trigger, isNew } = item
    // if (type !== 'repo' && type !== 'string' && type !== 'bool') {
    //   return <></>
    // }
    return (
      <div className={`form-config-item ${isNew && 'form-config-item-blink'}`} key={item.id}
        data-id={item.id}
        onDragEnter={onDragEnter}
        data-current-index={`${index}`}>
        <header className='item-header flex-space-between' onClick={(e) => {
          e.stopPropagation()
          show(item)
        }}>
          <div style={{ width: '100%' }} className='flex-start'>
            {/* 拖拽 */}
            <div
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              draggable={parentType == 1 && type !== 'repo'}
              data-id={item.id}
              data-current-index={`${index}`}
            >
              {/* style={{ visibility: type === 'repo' ? 'hidden' : 'visible' }} */}
              <Tooltip title={type === 'repo' ? '暂不支持仓库拖拽' : ''}>
                <HolderOutlined className='move' style={{ cursor: type === 'repo' ? 'default' : 'move' }} />
              </Tooltip>

            </div>
            {/* 箭头 */}
            <RightOutlined className={`arrow ${isArrowRotate && 'arrow-rotate'}`} />
            {/* 名称 */}
            <Form.Item noStyle shouldUpdate>
              {
                () => {
                  return <span className='form-config-item-name' style={{ marginLeft: '10px' }}>{renderHeaderTitle(type, item)}</span>
                }
              }
            </Form.Item>
          </div>
          {
            !(!isUserAuth(currentUser, data?.creator_user_id) || parentType !== 1) && <div className='remove flex-center' onClick={() => remove(index, item)}>
              <MinusOutlined />
            </div>
          }
        </header>
        <div style={{ display: isArrowRotate ? 'block' : 'none' }}>
          {
            renderType(item, index)
          }
        </div>
      </div>
    )
  }

  const openRelation = async () => {
    try {
      const values = await getFormValue('relation')
      relationRef.current.open(values.env)
    } catch (error) {
      const { errorFields = [] } = error
      let errorInfo = errorFields[0]?.errors[0] || errorFields[0]?.errors[1]
      if (!errorInfo.replace(/\s/g, '')) {
        if (errorFields.length > 1) {
          errorInfo = errorFields[1]?.errors[0]
        }
      }
      if (errorInfo) {
        message.error(errorInfo || '', 2)
      }
      const name = error.errorFields[0].name[0]
      formScrollToField(name)
    }
  }

  const formScrollToField = (name) => {
    // 滚动
    form.scrollToField(name, { behavior: 'smooth', block: 'start' })
  }

  const renderConfigItem = () => {
    return (
      <div className='form-config-item-container'>
        {
          configList.map((item: any, index: number) => (
            renderContent(item, index)
          ))
        }
      </div>
    )
  }

  const items = [
    {
      key: '1',
      label: (<div onClick={() => add('string')}>字符串</div>),
    },
    {
      key: '2',
      label: (<div onClick={() => add('bool')}>布尔值</div>),
    },
    {
      key: '5',
      label: (<div onClick={() => add('choose')}>单选框</div>),
    },
    {
      key: '10',
      label: (<div onClick={() => add('multiple')}>多选框</div>),
    },
    {
      key: '6',
      label: (<div onClick={() => add('date')}>时间点</div>),
    },
    {
      key: '7',
      label: (<div onClick={() => add('upload')}>文件</div>),
    },
    {
      key: '8',
      label: (<div onClick={() => add('fileContent')}>文件内容</div>),
    },
    {
      key: '9',
      label: (<div onClick={() => add('user')}>用户</div>),
    },
    {
      key: '3',
      label: (<div onClick={() => add('repo')}>仓库</div>),
    },
  ]

  // // 仓库是唯一的
  // if (!configList.find(item => item.type === 'repo')) {
  //   items.push({
  //     key: '3',
  //     label: (<div onClick={() => add('repo')}>仓库</div>),
  //   },)
  // }

  if (!configList.find(item => item.type === 'component') && (pipelineId === 'p-66626b6764c443ccae120bb2b841d0ea' || pipelineId === 'p-8f982dd63f5d4f478575604a33d4f5db')) {
    items.push({
      key: '4',
      label: (<div onClick={() => add('component')}>组件</div>),
    },)
  }

  const handleExpand = () => {
    configList.forEach(item => item.isArrowRotate = !expand ? true : false)
    setExpand(!expand)
  }

  return (
    <div className='modify-form-environmentVariable-config'>
      <Form layout="vertical" form={form} name="control-hooks" className='config-form'
        disabled={!isUserAuth(currentUser, data?.creator_user_id) || parentType !== 1}
      >
        <Form.Item noStyle name="from" label=""></Form.Item>
        <Dropdown menu={{ items }} placement="bottom">
          <Button icon={<PlusOutlined />} type='primary' className='add'>新增</Button>
        </Dropdown>
        <Button icon={<SettingOutlined />} type='primary' disabled={false} ghost className='relation' onClick={() => openRelation()}>关系</Button>
        {
          configList.length > 0 && <Button className='expand-button flex-start' disabled={false} onClick={handleExpand}>
            <div className='flex-start'>
              <div style={{ marginRight: '6px', marginLeft: '-2px' }}>
                <DownOutlined className={`expand ${!expand && 'expand-active'}`} />
              </div>
              {expand ? '折叠' : '展开'}
            </div>
          </Button>
        }
        {/* <Button icon={<HolderOutlined />} className='move'>拖拽</Button> */}
        <div className='form-config-container flex-center'>
          {renderConfigItem()}
        </div>
      </Form>
      {/* 互斥关系 */}
      <Relation ref={relationRef} getFormValue={getFormValue} type={parentType} />
    </div >
  );
};

export default forwardRef(Project);
import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, Checkbox, message, Radio } from 'antd'
import { PlusOutlined, SaveOutlined, MinusOutlined } from '@ant-design/icons'

import './style.less'
import moment from 'moment';
import { getUrlParams } from '@/utils'
import { useSelector, useDispatch } from 'dva'
const { TextArea } = Input;

function LoadModal(props, ref: any) {
  const { data, type } = props

  const [modal, setModal] = useState(false)
  const [record, setRecord] = useState([])
  const [isEdit, setEdit] = useState(false)
  const [repoCheckboxList, setRepoCheckboxList] = useState([])
  const [relationList, setRelationList] = useState([])
  const variableList = useRef([])

  const pipeline = useSelector(({ pipeline }) => pipeline)

  const dispatch = useDispatch()
  const variableRef = useRef(null)
  const [form] = Form.useForm();
  const query = getUrlParams()

  const { pipelineId, from } = query

  const oldIndex = pipeline.list.findIndex(item => item.id === pipelineId)

  useImperativeHandle(ref, () => ({
    open,
    saveRelationData
  }))


  const open = (record: any) => {
    init(record)
    setModal(true)
  }


  const init = (record = []) => {
    variableList.current = []
    // 过滤组件
    record = record.filter(item => item.type !== 'component' && item.type !== 'repo')
    // 铺平数据
    record.forEach(item => {
      if (item.type === 'repo') {
        const repo = item.repo
        variableList.current.push({ id: repo[0].newId, name: repo[0]['git_url-name'] })
        variableList.current.push({ id: repo[1].newId, name: repo[1]['ref-name'] })
        variableList.current.push({ id: repo[2].newId, name: repo[2]['sha-name'] })
      } else {
        variableList.current.push(item)
      }
    })
    const currentData = pipeline.list[oldIndex]
    // 初始化设置relationList
    const list = currentData.setting?.extra_data?.relationList
    if (list) {
      // 互斥的选项没有在环境变量中时，则删除
      const newList: any = filterRelationList(list)
      setRelationList(newList)
    }

    setRecord(record)
  }

  const filterRelationList = (relationList) => {
    const filterList = []
    relationList.forEach(relation => {
      let { options, value } = relation
      // 过滤options
      options = options.map(id => {
        return variableList.current.find(item => item.id === id)?.id
      }).filter(Boolean)
      if (options.length >= 2) {
        // 过滤默认值，查找option中是否包含value，没有则取第一个
        const valueData = options.find(id => id === value)
        value = valueData ? valueData : options[0]
        filterList.push({
          value,
          options
        })
      }
    })

    return filterList

  }


  const onCancel = () => {
    saveRelationData()
    setEdit(false)
    setModal(false)
  }

  const summit = async () => {
    if (!save()) {
      return
    }
    saveRelationData()
    setModal(false)
  }

  const saveRelationData = () => {
    const currentData = pipeline.list[oldIndex]
    currentData.setting.extra_data = currentData.setting.extra_data || {}
    currentData.setting.extra_data.relationList = relationList
    pipeline.list[oldIndex] = { ...currentData }
    dispatch({
      type: 'pipeline/setList',
      payload: { list: [...pipeline.list] }
    })
    // return relationList
  }

  const onChange = (checkedValues) => {
    setRepoCheckboxList(checkedValues)
  }

  const renderRepoComponent = (content, value, disabled) => {
    if (isEdit) {
      return <Checkbox value={value} disabled={disabled}>
        {content}
      </Checkbox>
    }
    return content
  }


  const add = () => {
    setEdit(true)
  }

  const save = () => {
    if (repoCheckboxList.length === 1) {
      message.warn('请至少选择两个')
      return
    }
    if (repoCheckboxList.length > 0) {
      relationList.push({
        value: repoCheckboxList[0],
        options: repoCheckboxList
      })
      setRelationList(relationList)
    }
    setRepoCheckboxList([])
    setEdit(false)

    return true
  }

  const renderRepo = (item) => {
    const repoList = record.filter(item => item.type === 'repo')
    const title = '仓库' + (repoList.length + 1 - (repoList.findIndex(config => config.id === item.id) + 1))
    const repo = item.repo
    const repoName = repo[0]['git_url-name'] || '-'
    const branch = repo[1]['ref-name']
    const commitId = repo[2]['sha-name']

    const repoNameDisabled = relationList.find(redio => redio.options.find(option => option === repo[0].newId))
    const branchDisabled = relationList.find(redio => redio.options.find(option => option === repo[1].newId))
    const commitIdDisabled = relationList.find(redio => redio.options.find(option => option === repo[2].newId))
    return <div>
      {title}
      <div >
        {renderRepoComponent(<div>仓库：{repoName}</div>, repo[0].newId, true)}
        {
          branch && renderRepoComponent(<div>分支/patchset：{branch || '-'}</div>, repo[1].newId, true)
        }
        {
          commitId && renderRepoComponent(<div>commitId：{commitId || '-'}</div>, repo[2].newId, commitIdDisabled)
        }
      </div>
    </div>
  }

  const renderOther = (item) => {
    let value = item.default
    switch (item.type) {
      case 'multiple':
        const v = value || []
        value = v.join('、')
        break
      case 'bool':
        value = String(value)
        break
      case 'date':
        if (value) {
          value = moment(value).format('YYYY-MM-DD HH:mm:ss')
        }
        break
    }
    const disabled = relationList.find(redio => redio.options.find(option => option === item.id))
    return <div >
      <div className='flex-start'>
        {
          isEdit
            ? <Checkbox value={item.id} disabled={disabled}>
              <div className='flex-start'>{item.name}：<div className='item-default'>{value || '-'}</div></div>
            </Checkbox>
            : <>{item.name}：<div className='item-default'>{value || '-'}</div></>
        }

      </div>

    </div>
  }

  const renderType = (item) => {
    switch (item.type) {
      case 'repo':
        return renderRepo(item)
      default:
        return renderOther(item)
    }
  }

  const renderList = () => {
    if (record.length <= 0) {
      return <>暂无可设置的变量</>
    }
    return <>
      {
        record.map(item => {
          const disabled = relationList.find(redio => redio.options.find(option => option === item.id))
          return <div className='relation-item' style={{ borderColor: !disabled && isEdit ? '#8fc9ff' : '#eee' }}>
            {renderType(item)}
          </div>
        })
      }
    </>
  }

  const radioChange = (e, item) => {
    item.value = e.target.value
    setRelationList([...relationList])
  }

  const renderItemRadio = (id) => {
    const name = variableList.current.find(v => v.id === id)?.name
    return <>{name}</>
  }

  const reduceRadio = (index) => {
    relationList.splice(index, 1)
    setRelationList([...relationList])
  }

  const renderRelationItem = (item, index) => {

    return <div className='item-relation-radio'>
      <Radio.Group onChange={(e) => radioChange(e, item)} value={item.value} disabled={type !== 1}>
        {
          item.options.map(id => (
            <Radio value={id}>
              {renderItemRadio(id)}
            </Radio>
          ))
        }
      </Radio.Group>
      {/* 删除 */}
      {
        type === 1 && <div className='radio-reduce flex-center' onClick={() => reduceRadio(index)}>
          <MinusOutlined />
        </div>
      }

    </div>
  }

  return (
    <div ref={variableRef}>
      <Modal title="" centered destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Button type="primary" onClick={summit}>确定</Button>,
      ]} open={modal} onCancel={onCancel} className='flow-environmentVariable-relation-container' width="50%">
        {/* 环境变量 */}
        <div className='relation-title'>环境变量</div>
        <div className='top-scroll common-scroll-bar'>
          <Checkbox.Group style={{ width: '100%' }} onChange={onChange} value={repoCheckboxList}>
            {renderList()}
          </Checkbox.Group>
        </div>
        {/* 操作 */}
        <div className='flex-start' style={{ marginTop: '5px' }}>
          <div className='relation-title'>互斥关系</div>
          <div style={{ color: '#7b7d8a' }}>（每组互斥参数值只能多选一，选中为默认值）</div>
        </div>
        {/* 互斥关系记录 */}
        <div className='bottom-content'>
          {
            relationList.length > 0
              ? <>
                {
                  relationList.map((item, index) => (
                    renderRelationItem(item, index)
                  ))
                }
              </>
              : ''
          }
          <div style={{ margin: '5px 0' }}>
            {
              isEdit
                ? <Button icon={<SaveOutlined />} type='primary' style={{ width: '100%' }} onClick={save}>保存</Button>
                : <Button icon={<PlusOutlined />} onClick={add} style={{ width: '100%' }} disabled={type !== 1}>添加互斥</Button>
            }
          </div>
        </div>

      </Modal>
    </div >
  );
}


export default forwardRef(LoadModal)
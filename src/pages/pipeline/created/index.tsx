import React, { useEffect, useState, useRef, useReducer } from 'react';
import ReactDOM from 'react-dom'
import { PlusOutlined, ApartmentOutlined, MoreOutlined, CaretRightOutlined, CloseCircleOutlined, MinusCircleOutlined, PauseCircleOutlined, LoadingOutlined, StopOutlined, HistoryOutlined, EditOutlined, SearchOutlined, SendOutlined, MenuOutlined, UploadOutlined, DownloadOutlined, CopyOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Dropdown, message, Segmented, Tabs, Popover, Tooltip, Modal } from 'antd'
import moment from 'moment';
import PlayImage from '@/assets/images/play.png'
import { useSelector, useDispatch } from 'dva'
import Template from './component/template'
import ExecModal from './component/execModal'
import { renderStatus, renderTriggerIcon, renderTriggerType, commonHandleTriggerType, setCompatiblePath } from './common.jsx'

import { getListApi, addFavorites, removeFavorites, getEntryListApi, removeEntryApi, addEntryApi, sortEntryApi, canEditApi, copyPipelineApi, addPipelineApi, removeApi } from './service'
import { handleName } from '@/pages/packagingService/commonComponent'
import { PageContainer } from '@ant-design/pro-layout';
import EntryModal from './component/entryModal'
import { checkPipilineAuth } from '@/utils/menu'
import { fetchMenuData } from '@/utils/menu'

import './style.less'
// import { send } from './se rvice' 

import List from '@/components/List'
import Nav from './component/nav'
import collectionImage from '@/assets/images/collection.svg'
import collectionActionImage from '@/assets/images/collection-action.svg'
import { formatTime, isUserAuth, getLocalStorage } from '@/utils'
import { useModel } from 'umi';
import debounce from 'lodash/debounce';
import Entry from './component/entry'
import ExportCompnent from './component/detail/components/exportCompnent'
import ImportComponent from './component/detail/components/importComponent'

const { confirm } = Modal;
import {useNavigate} from 'umi'

function Project(props) {

  const [tableData, setTableData] = useState<any>({})
  const [entryList, setEntryList] = useState<any>([])
  const navigate = useNavigate()

  const [activeKey, setActiveKey] = useState<any>('created')
  const [, forceUpdate] = useReducer(state => state + 1, 0)
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  const listRef = useRef(null)
  const templateRef = useRef(null)
  const execModalRef = useRef(null)
  const variableRef = useRef(null)
  const entryRef = useRef(null)
  const entryModalRef = useRef(null)
  const exportRef = useRef(null)
  const importRef = useRef(null)
  const requestIndex = useRef(0)
  const requestQueue = useRef({})
  const requestTimer = useRef(null)

  const dispatch = useDispatch()
  const pipeline = useSelector(({ pipeline }) => pipeline)

  useEffect(() => {
    const value = localStorage.getItem('FlowLine/created-Tab')
    setActiveKey(value === null ? 'created' : value)
  }, [])

  useEffect(() => {
    // getEntryList()
  }, [])

  const getEntryList = async () => {
    const params = {
      creator: currentUser.id
    }
    if (location.pathname.includes('/workflowService')) {
      params.label = '流程服务'
    }
    const { data: { data } } = await getEntryListApi(params)
    // const list = []
    // const item = data[0]
    // for (var i = 0; i < 30; i++) { 
    //   if (i < 3) {
    //     item.is_fixed = true
    //   } else {
    //     item.is_fixed = false
    //   }
    //   item.id = i + 1
    //   list.push({ ...item, name: i + 1 + item.name })
    // }

    // list[0].uuid = 'p-d5a18d7a92094fe89ad6804619cd76 1b'
    setEntryList(data)
    if (entryRef.current) {
      entryRef.current.setDelete()
    }
  }

  const inputChange = (e) => {
    listRef.current.update({
      name: e.target.value,
      current: 1
    })
    // setActiveKey('')
    variableRef.current.actoveKey = ''
  }
  const debounceInputChange = debounce(inputChange, 500);

  const searchOptions: any[] = [
    {
      type: 'input',
      form: {
        label: '',
        name: "name",
        style: {
          // width: '240px',
          width: '100%'
        }

      },
      componentOptions: {
        placeholder: '请输入流水线名称',
        onChange: debounceInputChange,
        suffix: <SearchOutlined />,
        style: {
          marginTop: '2px'
        }
      }
    },
  ]

  useEffect(() => {
    // listRef.current.update({ name: '', current: 1 })
  }, [activeKey])

  const getData = async (params: any) => {
    // params.size = 10000
    requestIndex.current++
    params.size = params.pageSize
    params.page_num = params.current
    delete params.pageSize
    delete params.current
    params.filter = activeKey
    if (location.pathname.includes('/workflowService')) {
      params.label = '流程服务'
    }
    // let res = await getListApi(params)
    // if (params.name) {
    //   data = data.filter(item => item.name.toLowerCase().includes(params.name))
    // }
    const newData = {
      data: pipeline.list,
      total: pipeline.list.length
    }

    // 每调用一次就序号记录
    // requestQueue.current[requestIndex.current] = newData
    // // 找出最后一次请求
    // const maxIndex = Math.max(...Object.keys(requestQueue.current).map(item => Number(item)))
    // console.log(maxIndex)

    // setTableData(requestQueue.current[maxIndex])

    setTableData(newData)
  }

  const add = () => {
    // props.history.push('/pipeline/modify')
    templateRef.current.open()
  }

  // "pending"
  // "running"
  // "failed"
  // "success"
  // "canceled"
  // "timeout"

  const goToDetail = (record: any) => {
    if (!checkPipilineAuth('Detail', record.uuid)) {
      message.error('暂无权限')
      return
    }
    if (!record.total_run_count) {
      // message.error('暂无记录')
      return
    }
    props.history.push(setCompatiblePath(`/FlowLine/created/detail/${record.uuid}/${record.total_run_count}`))
  }

  const jumpToRecord = (record) => {
    props.history.push(setCompatiblePath(`/FlowLine/created/preview?pipelineId=${record.uuid}&pipelineName=${encodeURIComponent(record.name)}&tab=1&from=entry`))
    // entryRef.current.handleMore(true)
  }

  const containerClick = () => {
    // entryRef.current.handleMore(false)
  }

  const listjumpToRecord = (record) => {
    if (!checkPipilineAuth('History', record.uuid)) {
      message.error('暂无权限')
      return
    }
    props.history.push(setCompatiblePath(`/FlowLine/created/recentlyRun?pipelineId=${record.uuid}&pipelineName=${encodeURIComponent(record.name)}`))
  }

  const handleEditHistory = (data: any = {}) => {
    const { uuid = '', name = '', creator_display_name = '' } = data
    props.history.push(setCompatiblePath(`/FlowLine/created/editHistory?pipelineId=${uuid}&pipelineName=${encodeURIComponent(name)}&creator=${creator_display_name}`))
  }

  const handleCollection = async (record: any) => {
    if (variableRef.current.favoritesLoading) {
      return
    }
    const api = record.favourite ? removeFavorites : addFavorites
    variableRef.current.favoritesLoading = true
    try {
      await api({
        pipeline_uuid: record.uuid
      })
      message.success(record.favourite ? '已移除关注' : '关注成功')
      listRef.current.update()
    } catch (error) {
    } finally {
      variableRef.current.favoritesLoading = false
    }
  }

  const edit = (record: any) => {

  }

  const openPipelineModal = (record) => {
    message.error('暂无权限')
  }

  const judgeEdit = async (record) => {
    const res = await canEditApi({ uuid: record.uuid })
    const { status, data, msg, success } = res || {}  // true 可以编辑，false为不可编辑
    return status
  }

  const handleEdit = async (record) => {
    navigate(setCompatiblePath(`/FlowLine/created/modify?pipelineId=${record.id}&tab=1`))
  }

  const columns = [
    {
      title: '流水线名称',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      sorter: true,
      width: '20%',
      render: (value, record) => {
        return <div className='list-field-pipeline-name'  >
          <div className='pipeline-name common-Jumpable-color' onClick={() => listjumpToRecord(record)}>
            <Tooltip title={value} placement="topLeft">
              {value}
            </Tooltip>
          </div>
          <div className='list-bottom'>{record.creator_display_name} 创建</div>
        </div>
      }
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (x: any, record: any) => {
        let { last_run_status: status, triggerCount, last_run_trigger_type: triggerType, last_trigger_user_display_name, last_run_at, hook_type } = record
        return <div onClick={() => goToDetail(record)} style={{ cursor: record.last_run_id ? 'pointer' : 'default' }}>
          {
            last_run_at ? <>
              {/* 状态 */}
              {
                renderStatus(status)
              }
              <div className='list-bottom'>#{record.total_run_count || 0}</div>
            </> : '-'
          }
        </div>
      }
    },
    {
      title: '最近执行',
      dataIndex: 'templateId',
      key: 'templateId',
      align: 'left',
      render: (x: any, record: any) => {
        let { last_run_status: status, triggerCount, last_run_trigger_type: triggerType, last_trigger_user_display_name, last_run_at, hook_type, last_run_hook_from } = record
        return <div onClick={() => goToDetail(record)} style={{ cursor: record.last_run_id ? 'pointer' : 'default' }}>
          {
            last_run_at ? <>
              <div>{renderTriggerIcon(triggerType, last_run_hook_from)} {renderTriggerType(triggerType, last_run_hook_from)}</div>
              <div className='list-bottom'>{last_trigger_user_display_name}</div>
            </> : '暂无运行记录'
          }
        </div>
      }
    },
    {
      title: '最新执行时间',
      dataIndex: 'templateName',
      key: 'templateName',
      align: 'left',
      render: (x: any, record: any) => {
        const { last_run_at, last_run_duration } = record
        return <div>
          {
            last_run_at ? <>
              <div >{moment(last_run_at).format('YYYY-MM-DD HH:mm:ss')}</div>
              <div className='list-bottom' >耗时{formatTime(last_run_duration)}</div>
            </> : '未运行'
          }

        </div>
      }
    },
    {
      title: '最后修改',
      dataIndex: 'modify_at',
      key: 'modify_at',
      align: 'left',
      sorter: true,
      render: (x: any, record: any) => {
        const { modify_at, last_modify_user_display_name } = record
        return <div >
          <div >{moment(modify_at).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div className='list-bottom'>{last_modify_user_display_name}</div>
        </div>
      }
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'center',
      fixed: 'right',
      render: (v, record) => (
        <div className='flex-center'>
          <Button type='primary' onClick={() => openPipelineModal(record)} icon={<CaretRightOutlined />} ></Button >

          &nbsp;&nbsp;&nbsp;

          <Popover content='编辑' trigger="hover">
            <Button className='flex-center' onClick={() => { handleEdit(record) }} icon={<EditOutlined className='flow-created-EditOutlined-icon' />} ></Button >
          </Popover>
          {/* {
            isUserAuth(currentUser, record?.creator_user_id) ?  : <Popover content='暂无权限编辑' trigger="hover">
              <Button className='flex-center' disabled icon={<EditOutlined className='flow-created-EditOutlined-icon' />} ></Button >
            </Popover>
          } */}
        </div>
      )
    }
  ]

  const removeEntry = async (item) => {
    try {
      const { data } = await removeEntryApi(item.id)
      getEntryList()
      message.success('删除成功')
    } catch (error) { }
  }

  const sortEntry = async (params) => {
    try {
      await sortEntryApi(params)
      getEntryList()
      // message.success('排序成功')
    } catch (error) { }
  }

  const addEntry = async (pipelineItem) => {
    const list = entryList.filter(item => !item.is_fixed)
    if (list.length >= 10) {
      message.warn('快捷入口最多可展示10条个人添加的流水线，超出的部分请先移除后再添加。')
      return
    }
    // addEntrySubmit(pipelineItem)
    entryModalRef.current.open(pipelineItem)
  }

  const addEntrySubmit = async (params) => {
    try {
      await addEntryApi(params)
      getEntryList()
      message.success('添加成功')
    } catch (error) { }
  }

  const renderEntryItem = () => {
    const style = { fontSize: '15px', marginRight: '6px', transform: 'rotate(-30deg)', marginLeft: '2px' }
    const uuid = variableRef.current?.currentRowData?.uuid
    const isExist = entryList.find(item => item.uuid === uuid)
    if (isExist) {
      return <Tooltip title="已在快捷入口列表中">
        <div className='flex-start' style={{ cursor: 'not-allowed', opacity: isExist ? 0.3 : 1 }}>
          <SendOutlined style={style} />
          快捷入口
        </div>
      </Tooltip>
    }

    return <div className='flex-start' style={{ cursor: 'pointer' }} onClick={() => addEntry(variableRef.current.currentRowData)}>
      <SendOutlined style={style} />
      快捷入口
    </div>
  }

  const handleExport = (data) => {
    exportRef.current.open(data)
  }

  const handleImport = (data) => {
    if (!checkPipilineAuth('Import', data.uuid)) {
      message.error('暂无权限')
      return
    }
    importRef.current.open(data)
  }

  function generateRandomHash() {
    const randomHash = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return randomHash;
  }

  const handleCopyPipeline = async (record) => {
    if (!checkPipilineAuth('Copy', record?.uuid)) {
      message.error('暂无权限')
      return
    }
    const uuid = record.uuid
    // 导出流水线 JSON
    const { data } = await copyPipelineApi(uuid, 0)
    const hash = Date.now()
    data.name = `${data.name}${`-副本${hash}`}`
    // 新建流水线
    const params: any = {
      name: data.name,
    }
    const { data: addData } = await addPipelineApi(params)
    await fetchMenuData()
    // 跳转
    dispatch({
      type: 'pipeline/setList',
      payload: { list: [...pipeline.list], importData: data }
    })
    const id = addData.pipeline_uuid
    props.history.push(setCompatiblePath(`/FlowLine/created/modify?pipelineId=${id}&tab=0&source=import&t=${Date.now()}&from=add`))

  }

  const handleRemove = (record) => {
    if (!checkPipilineAuth('Delete', record?.uuid)) {
      message.error('暂无权限')
      return
    }

    confirm({
      title: '删除',
      icon: <ExclamationCircleOutlined />,
      content: '删除后，配置信息和运行记录都无法恢复，确认删除？',
      async onOk() {
        await removeApi(record.uuid)
        // 更新列表
        listRef.current.update()
        // 更新快捷入口
        getEntryList()
        message.success('删除成功')
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  const items: any = [

    {
      key: '1',
      label: (
        <div className='flow-created-operate-more-item' onClick={() => goHistory(variableRef.current.currentRowData)}>
          <HistoryOutlined style={{ fontSize: '14px', margin: '0 7px 0 3px', }} /><span style={{ marginTop: '-23px', display: 'inline-block' }}>执行历史</span>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className='flex-start' style={{ cursor: 'pointer' }} onClick={() => handleCollection(variableRef.current.currentRowData)}>
          {
            variableRef?.current?.currentRowData?.favourite ? <img src={collectionActionImage} style={{ width: '18px', marginRight: '5px' }} /> : <img src={collectionImage} style={{ width: '18px', marginRight: '5px' }} />
          }
          {variableRef?.current?.currentRowData?.favourite ? '取消关注' : '添加关注'}
        </div>
      ),
    },
    {
      key: '3',
      label: renderEntryItem(),
    },
    {
      key: '4',
      label: (
        <div className='flex-start' style={{ cursor: 'pointer' }} onClick={() => handleEditHistory(variableRef.current.currentRowData)}>
          <MenuOutlined style={{ fontSize: '14px', margin: '0 7px 0 3px' }} />编辑历史
        </div>
      ),
    },
    {
      key: '5',
      label: (
        <div className='flow-created-operate-more-item' onClick={() => goSchedules(variableRef.current.currentRowData)}>
          <i className='iconfont icon-naozhong1' style={{ width: '18px', marginRight: '9px', fontSize: '14px', marginLeft: '2px' }}></i><span style={{ marginTop: '-23px', display: 'inline-block' }}>定时任务</span>
        </div>
      ),
    },
    {
      key: '6',
      label: (
        <div className='flow-created-operate-more-item' onClick={() => handleExport(variableRef.current.currentRowData)}>
          <UploadOutlined style={{ fontSize: '14px', margin: '0 7px 0 3px' }} />导出配置
        </div>
      ),
    },
    {
      key: '7',
      label: (
        <div className='flow-created-operate-more-item' onClick={() => handleImport(variableRef.current.currentRowData)}>
          <DownloadOutlined style={{ fontSize: '14px', margin: '0 7px 0 3px' }} />导入配置
        </div>
      ),
    },
    {
      key: '8',
      label: (
        <div className='flow-created-operate-more-item' onClick={() => handleCopyPipeline(variableRef.current.currentRowData)}>
          <CopyOutlined style={{ fontSize: '14px', margin: '0 7px 0 3px' }} />复制流水线
        </div>
      ),
    },
    {
      key: '9',
      label: (
        <div className='flow-created-operate-more-item flow-created-operate-more-item-remove' onClick={() => handleRemove(variableRef.current.currentRowData)}>
          <DeleteOutlined style={{ fontSize: '14px', margin: '0 7px 0 3px' }} />删除
        </div>
      ),
    },
  ];

  const goSchedules = (data) => {
    if (!checkPipilineAuth('CreateCronJob', data.uuid)) {
      message.error('暂无权限')
      return
    }
    const { uuid, name, creator_display_name } = data
    props.history.push(setCompatiblePath(`/FlowLine/created/scheduledTasks?uuid=${uuid}&pipeline_name=${encodeURIComponent(name)}&name=${encodeURIComponent(creator_display_name)}`))
  }

  const goHistory = (data) => {
    const { uuid, name,id } = data
    props.history.push(setCompatiblePath(`/FlowLine/created/recentlyRun?pipelineId=${id}&pipelineName=${encodeURIComponent(name)}`))
  }

  const renderNav = () => {
    return <Nav title="我创建的" />
  }

  const tabChange = (key) => {
    localStorage.setItem('FlowLine/created-Tab', key)
    // if (key !== variableRef.current.actoveKey) {
    listRef.current.setField([{ key: 'name', value: undefined }])
    variableRef.current.actoveKey = key
    setActiveKey(key)
    // listRef.current.update({ name: '', current: 1 })
    // }
  }

  const renderList = () => {
    return (
      <div style={{ position: 'relative', zIndex: '5' }}>
        <List
          searchOptions={searchOptions}
          getData={getData}
          data={tableData.data}
          total={tableData.total}
          ref={listRef}
          showTableFilter={false}
          // isInitLoad={false}
          hasNavigation={false}
          hideReset={true}
          hideSearchButton={true}
          columns={columns}>
          <div className='FlowLine-create-segmented-wrap flex-end'>
            <div className='segmented-position' style={{ flex: 1, marginRight: '50px' }}>
              <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onTabClick={(key) => tabChange(key)}>
                <Tabs.TabPane tab="我创建的" key="created">
                </Tabs.TabPane>
                <Tabs.TabPane tab="我关注的" key="favourite">
                </Tabs.TabPane>
                <Tabs.TabPane tab="全部" key="">
                </Tabs.TabPane>
              </Tabs>
            </div>
            <Button type='primary'  icon={<PlusOutlined />} onClick={() => add()}>新增</Button>
          </div>
        </List>
      </div>
    )
  }

  const renderModel = () => {
    return <Template ref={templateRef} {...props} />
  }


  // const renderCard = () => {
  //   return <Entry list={entryList} jumpToRecord={jumpToRecord} ref={entryRef} removeEntry={removeEntry} sortEntry={sortEntry}></Entry>
  // }

  return (
    <PageContainer>
      <div className='flow-pipeline-container common-reset replace-font-size-12' ref={variableRef} onClick={() => containerClick()}>
        {/* {renderNav()} */}
        {/* {renderCard()} */}
        {renderList()}
        {renderModel()}

        <ExecModal ref={execModalRef} {...props} />
        <EntryModal ref={entryModalRef} addEntrySubmit={addEntrySubmit} />
        <ExportCompnent ref={exportRef} />
        <ImportComponent ref={importRef} {...props} />
      </div>
    </PageContainer>
  );
}

export default Project
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom'
import { PlusOutlined, ApartmentOutlined, MoreOutlined, CheckCircleOutlined, CaretRightOutlined, EditOutlined, PlayCircleFilled, LoadingOutlined, StopOutlined, OrderedListOutlined, BranchesOutlined, DownloadOutlined, CopyOutlined, SyncOutlined, MenuOutlined, PieChartOutlined, BarChartOutlined } from '@ant-design/icons'
import { Button, Dropdown, Tabs, Popover, Tooltip, message } from 'antd'
import moment from 'moment';

import { getListApi, getListRecordApi, getPipelineDetailDownloadApi } from './service'
import { canEditApi } from '@/pages/pipeline/created/service'
import { getUrlParams, formatBytes, formatTime, copyText, isUserAuth } from '@/utils'

import { useSelector, useDispatch } from 'dva'
// import { setPipeline } from '@/store/actions '
import { renderStatus, renderTriggerIcon, renderTriggerType, RenderMoreButton, commonHandleTriggerType, setCompatiblePath } from '@/pages/pipeline/created/common'
import { renderColumnBranch } from '@/pages/packagingService/commonComponent'
import { handleName } from '@/pages/packagingService/commonComponent'
import { useModel } from "umi";
import ExecModal from '@/pages/pipeline/created/component/execModal'
import PlayImage from '@/assets/images/play.png'
import { SetElementLength } from '@/utils/commonComponent'
import { checkPipilineAuth } from '@/utils/menu'

import './style.less'
// import { send } from './service'

import List from '@/components/List'

function Project(props) {

  const [tableData, setTableData] = useState<any>({})
  const [data, setData] = useState<any>({})
  const [activeKey, setActiveKey] = useState<any>('triggered')
  const [downloadTableData, setDownloadTableData] = useState<any>([])
  const [downloadLoading, setDownloadLoading] = useState(true)
  const listDownloadRef = useRef(null)

  const listRef = useRef(null)
  const [searchData, setSearchData] = useState({ pipelineId: [] })

  const query = getUrlParams()

  const variableRef = useRef(null)
  const execModalRef = useRef(null)

  const dispatch = useDispatch()
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  useEffect(() => {
    if (query.pipelineId) {
      variableRef.current.actoveKey = ''
      setActiveKey('')
    } else {
      variableRef.current.actoveKey = 'triggered'
    }
  }, [])

  useEffect(() => {
    init()
  }, [])

  const init = () => {
    // getPipelineList()
  }

  // useEffect(() => {
  //   if (variableRef.current.initLoad) {
  //     listRef.current.update()
  //   }
  //   variableRef.current.initLoad = true
  // }, [activeKey])

  const getPipelineList = async () => {
    try {
      const { data } = await getListApi({ size: 1000 })
      const options = data.map((pipeline: any) => {
        const { uuid, name } = pipeline
        return {
          label: name,
          value: uuid
        }
      })
      setSearchData({ pipelineId: options })
    } catch (error) {

    }
  }


  const searchOptions: any[] = [
    // {
    //   type: 'select',
    //   form: {
    //     label: '分类',
    //     name: "filter",
    //     initialValue: ''
    //   },
    //   componentOptions: {
    //     allowClear: false,
    //     placeholder: '请输入',
    //     options: [
    //       {
    //         label: '全部',
    //         value: ''
    //       },
    //       // {
    //       //   label: '我的收藏',
    //       //   value: 'favourite'
    //       // },
    //       {
    //         label: '我创建的',
    //         value: 'created'
    //       },
    //       {
    //         label: '我触发的',
    //         value: 'triggered'
    //       },

    //     ]
    //   }
    // },
    // {
    //   type: 'select',
    //   form: {
    //     label: '流水线',
    //     name: "pipeline_uuid",
    //     initialValue: query.pipelineId
    //   },
    //   componentOptions: {
    //     placeholder: '请输入',
    //     options: searchData.pipelineId,
    //     onChange: (value) => {
    //       listRef.current.update({
    //         pipeline_uuid: value,
    //         current: 1
    //       })
    //       setActiveKey('')
    //       variableRef.current.actoveKey = ''
    //     }
    //   }
    // },
  ]

  const getData = async (params: any) => {
    params.size = params.pageSize
    params.page_num = params.current
    params.pipeline_uuid = query.pipelineId
    // params.filter = variableRef.current.actoveKey
    if (params.status) {
      params.status = JSON.parse(params.status).join(',')
    }
    let res = await getListRecordApi(params)
    if (res.data && res.data.length > 0) {
      setData(res.data[0])
    }
    // res.data = [res.data[0]]
    setTableData({
      data: res.data,
      total: res.total
    })
  }


  const download = (record) => {
    location.href = record.url
    // window.open(record.url)
  }


  const copy = (record: any) => {
    copyText(record.url)
  }

  const goDetail = (record: any) => {
    if (!checkPipilineAuth('Detail', query.pipelineId)) {
      message.error('暂无权限')
      return
    }
    // dispatch(setPipeline({ list: [] }))
    dispatch({
      type: 'pipeline/setList',
      payload: { list: [] }
    })
    props.history.push(setCompatiblePath(`/FlowLine/created/detail/${record.uuid}/${record.number}`))
  }

  const goDetailAnalyze = () => {
    const record = tableData.data[0]
    props.history.push(setCompatiblePath(`/FlowLine/created/detail/${record.uuid}/${record.number}?tabIndex=3`))
  }

  const renderText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中'
      case 'skipped':
        return '跳过'
      case 'running':
        return '运行中'
      case 'canceled':
        return '已取消'
      case 'success':
        return "运行成功"
      case 'failed':
        return "运行失败"
      case 'timeout':
        return "超时"
    }
  }

  const getDownloadData = async () => {

  }

  const onMouseEnter = async (record: any) => {
    setDownloadTableData([])
    try {
      setDownloadLoading(true)
      const { data } = await getPipelineDetailDownloadApi(record.id)
      setDownloadTableData(data)
    } catch (error) {
    } finally {
      setDownloadLoading(false)
    }
  }
  const handleText = (value: any = '') => {
    value = value || ''
    const end = 10
    return <div >
      {
        value.length > end ? <Tooltip title={<div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>}>
          <div style={{ cursor: 'pointer' }}>{value.slice(0, end) + '...'}</div>
        </Tooltip> : value
      }
    </div >
  }

  const renderContent = () => {
    const columns = [
      {
        title: '包名称',
        dataIndex: 'name',
        key: 'name',
        align: 'left',
        width: 120,
        render: (name) => {
          return handleText(name)
        }
      },
      {
        title: '包大小',
        dataIndex: 'size',
        key: 'size',
        align: 'left',
        width: 120,
        render: (size) => {
          return formatBytes(size)
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        key: 'operate',
        align: 'left',
        fixed: 'right',
        width: 120,
        render: (v, record) => (
          <div className='flex-start'>
            <Popover content='下载' trigger="hover">
              <Button type="primary" onClick={() => download(record)} icon={<DownloadOutlined />}></Button>&nbsp;&nbsp;&nbsp;
            </Popover>
            <Popover content='复制' trigger="hover">
              <Button onClick={() => copy(record)} icon={<CopyOutlined />}></Button>
            </Popover>

          </div>
        )
      }
    ]
    return <div>
      <br />
      <List getData={getDownloadData}
        data={downloadTableData}
        total={downloadTableData.length}
        ref={listDownloadRef}
        showTableFilter={false}
        hideReset={true}
        hasNavigation={false}
        columns={columns}></List>
      <br />
    </div>
  }


  const restartPipelineModal = (record) => {
    record.id = record.uuid
    execModalRef.current.open(record, record.version)
  }

  const openPipelineModal = () => {
    execModalRef.current.open({ id: query.pipelineId })
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'number',
      key: 'number',
      align: 'left',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      align: 'left',
      width: 400,
      render: (v) => {
        // return <div style={{ maxWidth: '400px' }}>
        return <div style={{ maxWidth: '400px' }}>
          <Tooltip title={() => <span dangerouslySetInnerHTML={{ __html: v }} ></span>}>
            <span className='descEllipsis' dangerouslySetInnerHTML={{ __html: v }} ></span>
          </Tooltip>
        </div>
      }
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      width: 110,
      filters: [
        {
          value: 'pending',
          text: '等待中',
        },
        {
          value: 'skipped',
          text: '跳过',
        },
        {
          value: 'running',
          text: '运行中',
        },
        {
          value: 'canceled',
          text: '已取消',
        },
        {
          value: 'success',
          text: '运行成功',
        },
        {
          value: 'failed',
          text: '运行失败',
        },
        {
          value: 'timeout',
          text: '超时',
        },
      ],
      filterSearch: true,
      filterMultiple: true,
      render: (x: any, record: any) => {
        const { status, triggerCount, trigger_type: triggerType, last_trigger_user_display_name } = record
        return <div className='flex-center' style={{ cursor: 'pointer' }} onClick={() => goDetail(record)} >
          {/* 状态 */}
          <div className='flex-center'>
            <div>
              {
                renderStatus(status)
              }
            </div>
            {/* <span style={{ fontSize: '12px' }} className={`status-${status}`} >
              &nbsp; {
                renderText(status)
              }
            </span> */}
          </div>
        </div>
      }
    },
    {
      title: '触发方式',
      dataIndex: 'templateId',
      key: 'templateId',
      align: 'left',
      render: (x: any, record: any) => {
        let { last_run_status: status, triggerCount, trigger_type: triggerType, last_run_hook_from } = record
        return <div>
          <div className='flex-start'>
            <div>{renderTriggerIcon(triggerType, last_run_hook_from)}</div>&nbsp;&nbsp;
            <div>{renderTriggerType(triggerType, last_run_hook_from)}</div>
          </div>
          <span className='list-bottom'>{record.trigger_by_display_name}</span>
        </div>
      }
    },
    {
      title: '仓库 & 分支',
      dataIndex: 'branch',
      key: 'branch',
      align: 'left',
      render: (v, record) => {
        return <div className='flex-start'>
          {record.project_path}&nbsp;&nbsp;
          <div className='flex-start list-bottom'>
            {renderColumnBranch(record)}
          </div>
        </div>
      }
    },
    {
      title: '触发时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
      render: (x: any, record: any) => {
        const { created_at, duration } = record
        return <div >
          <div >{moment(created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div className='list-bottom'>{formatTime(duration)}</div>
        </div>
      }
    },
    {
      title: '结束时间',
      dataIndex: 'modify_at',
      key: 'updated_at',
      align: 'left',
      render: (x: any, record: any) => {
        const { updated_at, last_modify_user_display_name } = record
        return <div className='flex-start'>
          <div >{moment(updated_at).format('YYYY-MM-DD HH:mm:ss')}</div>&nbsp;&nbsp;
          <div >{last_modify_user_display_name}</div>
        </div>
      }
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'left',
      fixed: 'right',
      width: 100,
      render: (v, record) => (
        <div className='flex-start'>
          <Popover content='重新执行'>
            <Tooltip placement="left" title={commonHandleTriggerType(record.trigger_type)}>
              <Button type='primary' disabled={!!commonHandleTriggerType(record.trigger_type) || !checkPipilineAuth('Trigger')} className='flex-center' onClick={() => restartPipelineModal({ ...record })} icon={<SyncOutlined className='flow-created-EditOutlined-icon' />} ></Button>
            </Tooltip>
          </Popover>&nbsp;&nbsp;&nbsp;
          <Popover content='查看详情' trigger="hover">
            {/* <div className='play' onClick={() => goDetail(record)} >
              <OrderedListOutlined style={{ fontSize: '16px', }} />
            </div> */}
            <Button disabled={!checkPipilineAuth('Detail', data?.uuid)} icon={<OrderedListOutlined style={{ fontSize: '16px', }} />} onClick={() => goDetail(record)}></Button>
          </Popover>&nbsp;&nbsp;&nbsp;
          <Popover content={record.has_artifact ? renderContent() : '暂无制品'} title="" placement="topRight">
            <Button disabled={!record.has_artifact} icon={<DownloadOutlined />} onMouseEnter={() => onMouseEnter(record)}></Button>
          </Popover>
        </div>
      )
    }
  ]

  const tabChange = (key) => {
    if (key !== variableRef.current.actoveKey) {
      listRef.current.setField([{ key: 'pipeline_uuid', value: undefined }])
      variableRef.current.actoveKey = key
      setActiveKey(key)
      listRef.current.update({ pipeline_uuid: '', current: 1 })
    }
  }

  const jumpToRecord = () => {
    props.history.push(setCompatiblePath(`/FlowLine/created/preview?pipelineId=${query.pipelineId}&pipelineName=${query.pipelineName}&tab=1`))
  }

  const judgeEdit = async () => {
    const res = await canEditApi({ uuid: query.pipelineId })
    const { status, } = res || {}  // true 可以编辑，false为不可编辑
    return status
  }

  const edit = async () => {
    const status = await judgeEdit()
    status && props.history.push(setCompatiblePath(`/FlowLine/created/modify?pipelineId=${query.pipelineId}&tab=1`))
    !status && jumpToRecord()
  }

  const goSchedules = (data) => {
    const { pipelineId, pipelineName } = query
    props.history.push(setCompatiblePath(`/FlowLine/created/scheduledTasks?uuid=${pipelineId}&pipeline_name=${encodeURIComponent(pipelineName)}&name=${tableData.data[0]?.creator_display_name}`))
  }

  const goEditHistory = (data: any = {}) => {
    const { pipelineId, pipelineName } = query
    props.history.push(setCompatiblePath(`/FlowLine/created/editHistory?pipelineId=${pipelineId}&pipelineName=${encodeURIComponent(pipelineName)}&creator=${tableData.data[0]?.creator_display_name}`))
  }

  const renderList = () => {
    return (
      <List
        searchOptions={searchOptions}
        getData={getData}
        data={tableData.data}
        total={tableData.total}
        ref={listRef}
        showTableFilter={false}
        hideReset={true}
        showIndex={false}
        indexConfig={{
          isIndexReverse: true,
          title: '序号',
          content: (v) => `${v}`
        }}
        columns={columns}>
        <>
          {
            // <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onTabClick={(key) => tabChange(key)}>
            //   <Tabs.TabPane tab="我创建的" key="created">
            //   </Tabs.TabPane>
            //   <Tabs.TabPane tab="我触发的" key="triggered">
            //   </Tabs.TabPane>
            //   <Tabs.TabPane tab="我收藏的" key="favourite">
            //   </Tabs.TabPane>
            //   <Tabs.TabPane tab="全部" key="">
            //   </Tabs.TabPane>
            // </Tabs>

          }
          <div className='record-header flex-space-between'>
            <div className='record-title'>
              <span style={{ fontWeight: 'bold' }}>流水线名称：<span className='name'>{query.pipelineName || tableData.data?.[0]?.name || ''}</span></span>
              {
                (tableData.data && tableData.data.length > 0) && <>
                  <span style={{ fontWeight: 'bold' }}>创建人: <span className='name'>{tableData.data[0]?.creator_display_name}</span></span>
                  {/* <span>执行次数：<span className='name'>{tableData.total || 0}</span></span> */}
                </>
              }
            </div>
            <div className='flex-center'>
              {
                tableData?.data?.length > 0 && <Popover content='数据分析' trigger="hover">
                  <Button disabled={!checkPipilineAuth('Detail')} icon={<BarChartOutlined style={{ fontSize: '16px' }} />} onClick={() => goDetailAnalyze()}></Button>
                </Popover>
              }
              &nbsp;&nbsp;
              <Popover content='定时任务' trigger="hover">
                <Button disabled={!checkPipilineAuth('CreateCronJob')} style={{ padding: '0 9px' }} onClick={() => goSchedules()}>
                  <i className='iconfont icon-naozhong1' style={{ fontSize: '15px', marginLeft: '1px' }}></i>
                </Button>
              </Popover>&nbsp;&nbsp;
              <Popover content='编辑历史' trigger="hover">
                <Button disabled={!checkPipilineAuth('EditHistory')} icon={<MenuOutlined style={{ fontSize: '14px' }} />} onClick={() => goEditHistory()}></Button>
              </Popover>  &nbsp;&nbsp;
              {/* {
                isUserAuth(currentUser, data?.creator_user_id) ?
                  <Popover content='编辑' trigger="hover"><Button className='flex-center' onClick={edit} icon={<EditOutlined className='flow-created-EditOutlined-icon' />} ></Button></Popover> : <Tooltip placement="top" title={'暂无权限编辑'}>
                    <Popover content='编辑' trigger="hover"><Button className='flex-center' onClick={edit} disabled icon={<EditOutlined className='flow-created-EditOutlined-icon' />}></Button></Popover>
                  </Tooltip>
              } */}

              <Popover content='编辑' trigger="hover">
                <Button disabled={!checkPipilineAuth('Update') && !isUserAuth(currentUser, data?.creator_user_id)} className='flex-center' onClick={edit} icon={<EditOutlined className='flow-created-EditOutlined-icon' />} ></Button>
              </Popover>

              {/* <Button onClick={edit} >编辑</Button> */}
              &nbsp;&nbsp;
              {
                commonHandleTriggerType(data?.setting?.trigger_type) ?
                  <Tooltip placement="bottomRight" title={commonHandleTriggerType(data?.setting?.trigger_type)}>
                    <Button className='flex-center' icon={<CaretRightOutlined />} disabled></Button>
                  </Tooltip> :
                  <Popover content='执行' trigger="hover">
                    <Button type='primary' onClick={() => openPipelineModal()} icon={<CaretRightOutlined />} disabled={!checkPipilineAuth('Trigger')}></Button>
                  </Popover>
              }
              {<RenderMoreButton data={data} {...props} uuid={query.pipelineId} />}
            </div>
          </div>
        </>
      </List >
    )
  }


  return (
    <div className='flow-recently-run-container replace-font-size-12' ref={variableRef}>
      {renderList()}
      <ExecModal ref={execModalRef} {...props} />
    </div>
  );
}

export default Project
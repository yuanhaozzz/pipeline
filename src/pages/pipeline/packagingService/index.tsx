import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom'
import { PlusOutlined, ApartmentOutlined, MoreOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined, LoadingOutlined, StopOutlined, OrderedListOutlined, BranchesOutlined, FileSyncOutlined, DownloadOutlined, CopyOutlined } from '@ant-design/icons'
import { Button, Dropdown, Tabs, Popover, Tooltip } from 'antd'
import { useModel } from "umi";
import moment from 'moment';

import { getListApi, getListRecordApi, getPipelineDetailDownloadApi } from './service'
import { getUrlParams, formatBytes, formatTime, copyText } from '@/utils'
import ExecModal from '@/pages/pipeline/created/component/execModal'
import { setCompatiblePath } from '@/pages/pipeline/created/common'

import { useSelector, useDispatch } from 'dva'
// import { setPipeline } from '@/store/actions'

import './style.less'
// import { send } from './service'

import List from '@/components/List'

function Project(props) {

  const [tableData, setTableData] = useState<any>({})
  const [downloadTableData, setDownloadTableData] = useState<any>([])
  const [downloadLoading, setDownloadLoading] = useState(true)
  const [activeKey, setActiveKey] = useState<any>('triggered')

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;



  const listRef = useRef(null)
  const listDownloadRef = useRef(null)
  const [searchData, setSearchData] = useState({ pipelineId: [] })

  const query = getUrlParams()

  const variableRef = useRef(null)
  const execModalRef = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => {
    if (query.pipelineId) {
      variableRef.current.actoveKey = ''
      setActiveKey('')
    } else {
      variableRef.current.actoveKey = 'triggered'
    }
  }, [])


  const getData = async (params: any) => {
    params.size = params.pageSize
    params.page_num = params.current
    params.filter = variableRef.current.actoveKey
    if (params.status) {
      params.status = JSON.parse(params.status).join(',')
    }
    params.pipeline_uuid = getPipelineUuid()
    let res = await getListRecordApi(params)
    setTableData({
      data: res.data,
      total: res.total
    })
  }

  const getPipelineUuid = () => {
    const host = location.host
    let uuid = 'p-66626b6764c443ccae120bb2b841d0ea'
    if (host.includes('dolphin.enflame.cn')) {
      uuid = 'p-8f982dd63f5d4f478575604a33d4f5db'
    }
    return uuid
  }

  const goDetail = (record: any) => {
    // dispatch(setPipeline({ list: [] }))
    dispatch({
      type: 'pipeline/setList',
      payload: { list: [] }
    })
    props.history.push(`/FlowLine/packagingService/detail?pipelineId=${record.uuid}&triggerId=${record.id}&version=${record.version}`)
  }

  // "pending"
  // "running"
  // "failed"
  // "success"
  // "canceled"
  // "timeout"
  const renderStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <MinusCircleOutlined className={`status-${status}`} />
      case 'running':
        return <LoadingOutlined className={`status-${status}`} />
      case 'canceled':
        return <StopOutlined className={`status-${status}`} />
      case 'skipped':
        return <i className='iconfont icon-tiaoguofenxiang' style={{ color: '#9BABB8', fontSize: '19px' }}></i>
      case 'success':
        return <CheckCircleOutlined className={`status-${status}`} />
      case 'failed':
      case 'timeout':
        return <CloseCircleOutlined className={`status-${status}`} />
    }
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


  const download = (record) => {
    location.href = record.url
    // window.open(record.url)
  }


  const copy = (record: any) => {
    copyText(record.url)
  }

  const renderTriggerType = (type: string) => {
    switch (type) {
      case 'MANUAL':
        return '手动触发'
      case 'GITLAB_HOOK':
        return 'Gitlab Hook 触发'
      case 'GERRIT_HOOK':
        return 'Gerrit Hook 触发'
    }
  }

  const renderTriggerIcon = (type: string, hook_type: string) => {
    switch (type) {
      case 'MANUAL':
        return <i className='iconfont icon-shoudong'></i>
      // case 'HOOK':
      //   switch (hook_type) {
      //     case 'gitlab':
      //       return <img src="http://xnas.enflame.cn/dolphin/gitlab-logo-1.svg" style={{ width: '20px', display: 'inline-block' }} />
      //     case 'gerrit':
      //       return <img src="http://xnas.enflame.cn/dolphin/gerrit.png" style={{ width: '20px', display: 'inline-block' }} />
      //   }
      case 'GITLAB_HOOK':
        return <img src="http://xnas.enflame.cn/dolphin/gitlab-logo-1.svg" style={{ width: '20px', display: 'inline-block' }} />
      case 'GERRIT_HOOK':
        return <img src="http://xnas.enflame.cn/dolphin/gerrit.png" style={{ width: '20px', display: 'inline-block' }} />
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

  const columns = [
    // {
    //   title: '流水线名称',
    //   dataIndex: 'name',
    //   key: 'name',
    //   align: 'center',
    //   // render: () => {
    //   //   return query.pipelineName
    //   // }
    // },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      align: 'center'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'left',
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
        return < Tooltip title={renderText(status)} >
          <div style={{ fontSize: '20px' }}>
            {
              renderStatus(status)
            }
          </div>
        </Tooltip >
      }
    },
    {
      title: '触发方式',
      dataIndex: 'templateId',
      key: 'templateId',
      align: 'left',
      render: (x: any, record: any) => {
        let { last_run_status: status, triggerCount, trigger_type: triggerType, hook_type } = record
        return <div className='flex-start'>
          < Tooltip title={renderTriggerType(triggerType)} >
            <div>{renderTriggerIcon(triggerType, hook_type)}</div>
          </Tooltip>
        </div>
      }
    },
    {
      title: '仓库',
      dataIndex: 'project_path',
      key: 'project_path',
      align: 'left',
    },
    {
      title: <><BranchesOutlined /> 分支</>,
      dataIndex: 'branch',
      key: 'branch',
      align: 'left',
    },
    {
      title: '触发人',
      dataIndex: 'trigger_by_display_name',
      key: 'trigger_by_display_name',
      align: 'left',
    },
    // {
    //   title: '创建人',
    //   dataIndex: 'creator_display_name',
    //   key: 'creator_display_name',
    //  align: 'left',
    // },
    {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      align: 'left',
      // sorter: true,
      render: (x: any, record: any) => {
        const { duration } = record
        return <div className='flex-start'>
          <div >{formatTime(duration)}</div>
        </div>
      }
    },
    {
      title: '触发时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
      render: (x: any, record: any) => {
        const { created_at } = record
        return <div className='flex-start'>
          <div >{moment(created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
        </div>
      }
    },
    {
      title: '完成时间',
      dataIndex: 'modify_at',
      key: 'updated_at',
      align: 'left',
      render: (x: any, record: any) => {
        const { updated_at, last_modify_user_display_name } = record
        return '-'

        // <div className='flex-center'>
        //   <div >{moment(updated_at).format('YYYY-MM-DD HH:mm:ss')}</div>&nbsp;&nbsp;
        //   <div >{last_modify_user_display_name}</div>
        // </div>
      }
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'left',
      fixed: 'right',
      render: (v, record) => (
        <div className='flex-start'>
          {/* 预览 */}
          <Popover content='预览' trigger="hover">
            <div className='play' onClick={() => goDetail(record)} >
              <OrderedListOutlined style={{ fontSize: '16px', }} />
            </div>
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
      // listRef.current.setField([{ key: 'pipeline_uuid', value: undefined }])
      variableRef.current.actoveKey = key
      setActiveKey(key)
      listRef.current.update({ pipeline_uuid: '', current: 1 })
    }
  }

  const edit = () => {
    // pipelineId=p-e389e5005f3b40cdbe1d5bc01f9838e5
    props.history.push(setCompatiblePath(`/FlowLine/created/preview?pipelineId=${getPipelineUuid()}&pipelineName=${query?.pipelineName}`))
  }

  const exec = () => {
    execModalRef.current.open({ id: getPipelineUuid() })
  }

  const renderList = () => {
    return (
      <>
        <br />
        <List
          // searchOptions={searchOptions}
          getData={getData}
          data={tableData.data}
          total={tableData.total}
          ref={listRef}
          showTableFilter={false}
          hideReset={true}
          columns={columns}>
          {
            <div className='FlowLine-create-segmented-wrap'>
              <div className='segmented-position'>
                <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onTabClick={(key) => tabChange(key)}>
                  <Tabs.TabPane tab="我触发的" key="triggered">
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="全部" key="">
                  </Tabs.TabPane>
                </Tabs>
              </div>
            </div>
          }
          <div className='flex-space-between package-service'>
            <Button type='primary' icon={<FileSyncOutlined />} onClick={() => exec()}>开始编包</Button>
            {
              currentUser.is_superuser ? <Button type='primary' ghost onClick={() => edit()}>编辑</Button> : <Popover content='暂无权限' trigger="hover" >
                <Button type='primary' ghost disabled>编辑</Button>
              </Popover>
            }

          </div>
        </List>
      </>
    )
  }


  return (
    <div className='flow-line-packagingService-wrap common-reset' ref={variableRef}>
      {renderList()}
      <ExecModal ref={execModalRef} {...props} />
    </div>
  );
}

export default Project
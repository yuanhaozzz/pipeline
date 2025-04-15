import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react'
import { Table, Button, Popover, Tooltip } from 'antd'
import moment from 'moment'
import { DownloadOutlined, } from '@ant-design/icons'
import { renderColumnBranch, renderTriggerIcon, getPipelineUuid, renderIcon, renderStatusText } from '@/pages/packagingService/commonComponent'
import Pagination from '@/components/Pagination'
import { getRecordListApi } from '@/pages/packagingService/service'

const page = (props: any, ref: any) => {
  const { query = {}, progressInfo, handleDownload = () => { }, } = props || {}
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState(false)
  const [page, setPageInfo] = useState({ page: 1, limit: 10, total: 0 });

  useImperativeHandle(ref, () => ({
  }))

  useEffect(() => {
    getList()
  }, [])

  const getList = async (page?: number, limit?: number) => {
    const page_num = page || 1, size = limit || 10;
    try {
      setLoading(true)
      const { id } = query
      const _params = {
        pipeline_uuid: getPipelineUuid(),
        schedule_id: id,
        type: 'all',
        page_num,
        size,
      }
      const { data, limit, page, total } = await getRecordListApi(_params)
      setList(data.data || []);
      setPageInfo({ limit, page, total });
    } catch (err) {
      console.log('--history err', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSizeChange = (page, limit) => {
    setPageInfo((prevState) => (
      {
        ...prevState,
        page,
        limit
      }
    ));
    getList(page, limit);
  }

  const handleName = (value: any = '', end = 7) => {
    value = value || ''
    return <div >
      {
        value.length > end ? <Tooltip title={<div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>}>
          <div style={{ cursor: 'pointer' }}>{value.slice(0, end) + '...'}</div>
        </Tooltip> : value
      }
    </div >
  }

  const handlePackageType = (v) => {
    let value = v || '-'
    if (Array.isArray(v)) {
      value = value.join(',')
    }
    return value
  }

  const formatTime = (time: any) => {
    if (!time) {
      return '-'
    }
    return moment(time).format('YYYY-MM-DD HH:mm')
  }

  const renderTxt = (v: any) => {
    return <>{v || '-'}</>
  }
  const viewLog = (record) => {
    let url = `/FlowLine/created/detail/${record.uuid}/${record.run_iid}?from=packagingService`
    window.open(url)
  }
  const columns = [
    {
      title: '编译分支',
      dataIndex: 'branch',
      key: 'branch',
      align: 'left',
      render: (v: any, record: any) => <div className='flex-start'>
        {renderColumnBranch(record)}
      </div>,
    },
    {
      title: '代码仓',
      dataIndex: 'project_path',
      key: 'project_path',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        {record.project_path && renderTriggerIcon(record.git_url?.includes('gerrit') ? 'gerrit' : '')}&nbsp;
        <div style={{ textAlign: 'left' }}>
          <div >{record.project_path || '-'}</div>
        </div>
      </div>,
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      render: (v, record) => <div className='flex-start list-column'>
        <Tooltip title={renderStatusText(v)}>
          <div className='status-icon flex-start' style={{ cursor: 'pointer' }} onClick={() => viewLog(record)}>
            {renderIcon(v)}
          </div>
        </Tooltip>
      </div>,
    },
    {
      title: '编译类型',
      dataIndex: 'build_type',
      key: 'build_type',
      align: 'left',
      render: (v: any) => renderTxt(v)
    },
    {
      title: '程序类型',
      dataIndex: 'package_type',
      key: 'package_type',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        <div style={{ textAlign: 'left' }}>
          <div style={{ marginTop: '5px' }}>{handleName(handlePackageType(record.package_type), 10)}</div>
        </div>
      </div>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        <div style={{ textAlign: 'left' }}>
          <div style={{ marginTop: '5px' }}>{formatTime(record.created_at)}</div>
        </div>
      </div>,
    },
    {
      title: '完成日期',
      dataIndex: 'last_trigger_datetime',
      key: 'last_trigger_datetime',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        <div style={{ textAlign: 'left' }}>
          <div style={{ marginTop: '5px' }}> {formatTime(record.end_at)}</div>
        </div>
      </div>,
    },
    {
      title: '操作',
      dataIndex: 'button',
      key: 'button',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        {record?.status === 'success' && <Popover content="立即下载">
          <Button icon={<DownloadOutlined />} size='small' onClick={() => handleDownload(record)}></Button>
        </Popover>}
      </div>,
    },
  ];

  return <>
    <Table columns={columns} dataSource={list} loading={loading} pagination={false} />
    <p>
      <Pagination current={page.page} size={page.limit} total={page.total} onChange={handleSizeChange}></Pagination>
    </p>
  </>;
}

export default forwardRef(page)
import React, { useEffect, useState, useRef } from 'react';

import { Button, Popover, message } from 'antd'
import './style.less'
import { pipelineDetailDownloadApi } from './service'
import { DownloadOutlined, CopyOutlined, OrderedListOutlined } from '@ant-design/icons'

import List from '@/components/newList'
import moment from 'moment'
import { copyText, formatBytes, getUrlParams, batchDownloadFiles } from '@/utils'

interface Props {
  tabIndex: any
  triggerId: any
  runData: any
}
function Project(props: Props) {
  const { tabIndex, triggerId, runData } = props
  const [tableData, setTableData] = useState<any>({})
  const [isMultiple, setMultiple] = useState(false)

  const listRef = useRef(null)
  const isLoad = useRef(false)

  useEffect(() => {
    if (tabIndex === 1 && isLoad.current) {
      listRef.current.update()
      setMultiple(false)
    }
    isLoad.current = true
  }, [tabIndex, runData])

  const getData = async (params: any) => {
    params.size = 1000
    const data = await pipelineDetailDownloadApi(triggerId, params)
    // const list = []
    // for (var i = 0; i < 50; i++) {
    //   if (i % 2 === 0) {
    //     list.push({ ...data.data[0] })
    //   } else {
    //     list.push({ ...data.data[1] })
    //   }
    // }
    setTableData(data)
    // setTableData({ data: list, total: list.length })
  }

  const download = (record) => {
    // location.href = record.url
    window.open(record.download_url)
  }

  const copy = (record: any) => {
    copyText(record.original_url)
  }

  const preview = (record) => {
    window.open(record.original_url)
  }

  const previewDisabled = (record) => {
    const ext = record?.original_url?.split('.')?.reverse()?.[0]
    const extMap = {
      txt: true,
      json: true,
      // log: true,
    }
    return !extMap[ext]
  }

  const searchOptions: any[] = [
    {
      type: 'input',
      form: {
        label: '名称',
        name: "name",
      },
      componentOptions: {
        placeholder: '请输入',
      }
    }
  ]

  const columns = [
    {
      title: 'Job 名称',
      dataIndex: 'job_name',
      key: 'job_name',
      align: 'center',
    },
    {
      title: '包名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '包大小',
      dataIndex: 'size',
      key: 'size',
      align: 'center',
      render: (size) => {
        return formatBytes(size)
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (created_at) => {
        return moment(created_at).format("YYYY-MM-DD HH:mm:ss")
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
          <Popover content='下载' trigger="hover">
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => download(record)}></Button>
          </Popover>&nbsp;&nbsp;&nbsp;
          <Popover content='复制' trigger="hover">
            <Button onClick={() => copy(record)} icon={<CopyOutlined />}></Button>
          </Popover> &nbsp;&nbsp;&nbsp;
          <Popover content={previewDisabled(record) ? `支持 txt/json 类型文件的预览` : '预览'} trigger="hover">
            <Button disabled={previewDisabled(record)} onClick={() => preview(record)} icon={<OrderedListOutlined />}></Button>
          </Popover>
        </div>
      )
    }
  ]

  const handleMultiple = () => {
    setMultiple(!isMultiple)
  }

  const handleDownload = () => {
    const list = listRef.current.getMultipleList()

    if (list.length <= 0) {
      message.error('请选择编译产物')
      return
    }
    const urls = []
    for (let i = 0; i < list.length; i++) {
      const { name, download_url } = list[i]
      urls.push({
        name,
        url: download_url
      })
    }
    batchDownloadFiles(urls)
  }

  return (
    <div className='flow-line-detail-download-container'>
      <List
        // searchOptions={searchOptions}
        getData={getData}
        data={tableData.data}
        total={tableData.total}
        ref={listRef}
        showTableFilter={false}
        hasNavigation={false}
        pageSize={100}
        isMultiple={isMultiple}
        columns={columns}>
        <Button type='primary' onClick={handleMultiple}>
          {isMultiple && '取消'}批量操作

        </Button>
        {
          !isMultiple && <span style={{ marginLeft: '5px', color: '#8e8e8e' }}>制品仅保存最近10天</span>
        }
        &nbsp;&nbsp;
        {
          isMultiple && <Button type='link' onClick={handleDownload}>批量下载</Button>
        }
      </List>
    </div>
  );
}

export default Project
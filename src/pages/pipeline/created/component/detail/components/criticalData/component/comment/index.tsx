import React, { useEffect, useState, useRef } from 'react';
import { Button, Popover, Tooltip } from 'antd'
import { getCommentListApi } from '../../service'
import { CopyOutlined } from '@ant-design/icons'
import List from '@/components/newList'
import { copyText, formatBytes } from '@/utils'
import { handleName } from '@/pages/packagingService/commonComponent'
import { SetElementLength } from '@/utils/commonComponent'

import './style.less'

function Project(props) {
  const { tabIndex, id, configData = {}, } = props
  const [tableData, setTableData] = useState<any>({})

  const listRef = useRef(null)
  const isInitLoad = useRef(true)


  useEffect(() => {
    if (tabIndex === 2) {
      listRef.current.update()
    }
  }, [tabIndex, id])

  const getData = async (params: any = {}) => {
    try {
      const { data } = await getCommentListApi(params, id)
      setTableData({
        total: data.length,
        data
      })
    } catch (error) {

    }

  }

  const handleText = (v: any) => {
    return <span dangerouslySetInnerHTML={{ __html: v || '-' }} ></span>
  }

  const handleEllipsisString = (value, len) => {
    if (value.length > len) {
      return <Tooltip title={value}>
        <span style={{ whiteSpace: 'nowrap' }}>{value.slice(0, len) + '...'}</span>
      </Tooltip>
    }
    return value
  }

  const judgeLink = (v, record) => {
    const regx = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/,
      isLink = regx.test(v)
    let txt = v.length > 40 ? v.slice(0, 40) + '...' : v
    isLink && (txt = <a href={v} target="_blank" rel="noreferrer">{v}</a>)
    return <>
      {txt && <>
        {txt} &nbsp;&nbsp;&nbsp;
        <Popover content='复制' trigger="hover">
          <span className="cursor-pointer" onClick={() => copyText(record.value)}><CopyOutlined /></span>
        </Popover>
      </>
      }
      {!txt && <span>{v || '-'}</span>}
    </>
  }

  const columns = [
    {
      title: 'Stage',
      dataIndex: 'stage',
      key: 'stage',
      align: 'left',
      render: (v: any) => handleText(v)
    },
    {
      title: 'Job',
      dataIndex: 'job',
      key: 'job',
      align: 'left',
      render: (v: any) => handleText(v)
    },
    {
      title: 'Task',
      dataIndex: 'task',
      key: 'task',
      align: 'left',
      render: (v: any) => handleText(v)
    },
    {
      title: '评论人',
      dataIndex: 'user',
      key: 'user',
      align: 'left',
      render: (v, record) => {
        return <>
          {record?.user?.display_name}
        </>
      }
    },
    {
      title: '评论时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
    },
    {
      title: '评论内容',
      dataIndex: 'comments',
      key: 'comments',
      align: 'left',
      width: '200px',
      render: (v) => {
        return handleEllipsisString(v, 20)
      }
    },
  ]

  return (
    <>
      <p className='description'>
        <b>全部评论：</b>
      </p>
      <List
        getData={getData}
        data={tableData.data}
        total={tableData.total}
        ref={listRef}
        showTableFilter={false}
        hasNavigation={false}
        pageSize={1000}
        isOnloadData={false}
        showPagination={false}
        columns={columns}>
      </List>
    </>
  );
}

export default Project
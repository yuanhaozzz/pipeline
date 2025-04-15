import React, { useEffect, useState, useRef } from 'react';
import { Button, Popover, Tooltip } from 'antd'
import { summarizedApi } from '../../service'
import { CopyOutlined } from '@ant-design/icons'
import List from '@/components/List'
import { copyText, formatBytes } from '@/utils'

import './style.less'
import { send } from './service'

function Project(props) {
  const { tabIndex, id, configData = {}, } = props
  const [tableData, setTableData] = useState<any>({})

  const listRef = useRef(null)
  const isLoad = useRef(false)

  useEffect(() => {
    if (tabIndex === 2 && isLoad.current) {
      listRef.current.update()
    }
    isLoad.current = true
  }, [tabIndex, id])

  const getData = async (params: any = {}) => {

    try {
      params.limit = params.pageSize || 10
      params.page = params.current || 1
      params.pipeline_run_info_id = id
      delete params.pageSize
      delete params.current
      const res = await summarizedApi(id, params)
      setTableData(res?.data || {})
    } catch (error) {
    }
  }

  const handleText = (v: any) => {
    return <span dangerouslySetInnerHTML={{ __html: v || '-' }} ></span>
  }

  const judgeLink = (v) => {
    v = v.replace(/\n/g, '<br/>')
    // const regx = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/,
    //   isLink = regx.test(v)

    // let txt = v.length > 40 ? v.slice(0, 40) + '...' : v
    // // isLink && (txt = <Tooltip title={v}><a href={v} target="_blank">{txt}</a></Tooltip>)
    // isLink && (txt = <a href={v} target="_blank">{v}</a>)
    return <>
      {/* {txt && <>
        {txt} &nbsp;&nbsp;&nbsp;
        <Popover content='复制' trigger="hover">
          <span className="cursor-pointer" onClick={() => copyText(v)} style={{ whiteSpace: 'pre-wrap' }}><CopyOutlined /></span>
        </Popover>
      </>
      } */}

      {<span dangerouslySetInnerHTML={{ __html: linkifyText(v || '-') }}></span>}
    </>
  }

  const judgeMultipleLink = (v) => {
    const regx = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/
    const url = v.match(regx)
    const urlValue = url?.[0]?.split(' ')?.[0]
    const newValue = v.replace(urlValue, `<a download href=${urlValue} target="_blank">${urlValue}</a>`)
    return <div>
      <span dangerouslySetInnerHTML={{ __html: newValue }}></span>
      <Popover content='复制' trigger="hover">
        <span style={{ marginLeft: '10px' }} className="cursor-pointer" onClick={() => copyText(v)}><CopyOutlined /></span>
      </Popover>
    </div>
  }

  const renderItemDescription = (record) => {
    const { value, comments } = record
    return <>
      {
        value.map(item => {
          switch (item.type) {
            case 'description':
              return renderDescription(item)
            case 'comments':
              return renderComments(item)
          }
        })
      }
    </>

  }

  const renderValues = (value) => {
    // const regex = /(https?:\/\/)/g;
    // const matches = value.match(regex);
    // if (matches && matches.length >= 2) {
    //   return <>
    //     {
    //       value.split('\n').map(item => <div>{judgeMultipleLink(item.trim())}</div>)
    //     }
    //   </>
    // } else {
    //   return judgeLink(value)
    // }
    return judgeLink(value)

  }

  const linkifyText = (text) => {
    const urlRegex = /(http[s]?:\/\/[^'"]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank">${url}</a>`;
    });
  };

  const renderDescription = (item) => {
    return <>
      <div style={{ wordBreak: 'break-all', alignItems: 'flex-start', marginBottom: '5px' }}>{item.display_name || item.description}{item.display_name || item.description ? `(${item.key})` : item.key}：{renderValues(item.value)}</div>
    </>
  }

  const renderComments = (item) => {
    return <>
      <div className='flex-start' style={{ wordBreak: 'break-all', alignItems: 'flex-start', marginBottom: '10px' }}>
        <span style={{ color: '#a3a5a7', whiteSpace: 'nowrap' }}>{item.created_at}</span><span style={{ whiteSpace: 'nowrap', margin: '0 10px', }}>{item?.user?.display_name}</span>
        <span style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: linkifyText(item.comments) }}></span>
      </div>
    </>
  }



  const columns = [
    {
      title: 'Stage',
      dataIndex: 'stage_name',
      key: 'stage_name',
      align: 'left',
      width: '100px',
      render: (v: any) => handleText(v)
    },
    {
      title: 'Job',
      dataIndex: 'job_name',
      key: 'job_name',
      align: 'left',
      width: '100px',
      render: (v: any) => handleText(v)
    },
    {
      title: 'Task',
      dataIndex: 'task_name',
      key: 'task_name',
      align: 'left',
      width: '150px',
      render: (v: any) => handleText(v)
    },
    // {
    //   title: '链接',
    //   dataIndex: 'value',
    //   key: 'value',
    //   align: 'left',
    //   render: (v, record) => {
    //     // return judgeLink(v, record)
    //     return <></>
    //   }
    // },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      align: 'left',
      width: '500px',
      render: (v: any, record) => {
        return <>{renderItemDescription(record)}</>
      }
    },
  ]

  return (
    <>
      {configData?.description && <p className='description'>
        <b>触发描述：</b>
        <span className="info" dangerouslySetInnerHTML={{ __html: configData.description }}></span>
      </p>
      }
      <List
        getData={getData}
        data={tableData.data}
        total={tableData.total}
        ref={listRef}
        showTableFilter={false}
        hasNavigation={false}
        isOnloadData={false}
        columns={columns}>
      </List>
    </>
  );
}

export default Project
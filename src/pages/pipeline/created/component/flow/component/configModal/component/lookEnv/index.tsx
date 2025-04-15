import React, { useEffect, useState, useRef } from 'react';
import { Button, Tooltip } from 'antd'
import { CopyOutlined } from '@ant-design/icons'

import './style.less'
import { getListApi } from './service'
import { copyText } from '@/utils'

import List from '@/components/List'

function Project(props) {
  const { modal, config, data, getEnvForm, tableData = { data: [] }, from } = props


  const [list, setList] = useState<any>({})
  const listRef = useRef(null)

  const variableMap = {
    "pipeline": '全局',
    "job": 'Job',
  }

  useEffect(() => {
    init()
  }, [modal])

  const init = async () => {
    if (modal) {
      const newData: any = {
        data: []
      }
      if (from === 1) {
        // 获取全局
        const envList = await getEnvForm()
        if (envList.length > 0) {
          newData.data = [...newData.data, ...envList]
        }
      }

      if (tableData.data) {
        newData.data = [...newData.data, ...tableData.data]
      }

      newData.length = newData.data.length
      setList(newData)
    }
  }


  const getData = async (params: any) => {
    //   let { data } = await getListApi(params)
    //   if (params.name) {
    //     data = data.filter(item => item.name.toLowerCase().includes(params.name))
    //   }

    //   setTableData({
    //     data: data,
    //     total: data.length
    //   })
  }

  const handleText = (value: any = '') => {
    value = value + ''
    const end = 30
    return <div >
      {
        value.length > end ? <Tooltip title={<div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>}>
          <div style={{ cursor: 'pointer' }}>{value.slice(0, end) + '...'}</div>
        </Tooltip> : value
      }
    </div >
  }

  const renderColumnCopy = (v) => {
    return <div style={{ position: 'relative', padding: '0 20px' }}>
      {handleText(v)}
      <CopyOutlined className='copy' onClick={() => copyText(v)} />
    </div>
  }


  const columns = [
    {
      title: '变量来源',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (v, record) => handleText(v || variableMap[record.scope] || '')
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      align: 'center',
      render: (v) => {
        return renderColumnCopy(v)
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      render: (v) => {
        const txt = v || '-'
        return <Tooltip title={<div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: txt }} ></div>}>
          <div style={{ cursor: 'pointer' }} dangerouslySetInnerHTML={{ __html: txt }} ></div>
        </Tooltip>
      }
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      align: 'center',
      render: (v) => {
        return renderColumnCopy(v)
      }
    },
  ];

  return (
    <div className='flex-configModal-lookEnv-container'>
      {
        list.data && list.data.length > 0 && <List
          getData={getData}
          data={list.data}
          total={list.total}
          ref={listRef}
          showTableFilter={false}
          hasNavigation={false}
          showIndex={false}
          pageSize={50}
          columns={columns}>
        </List>
      }

    </div>
  );
}

export default Project
import React, { useEffect, useState, useRef } from 'react';
import { Tooltip } from 'antd'
import { CopyOutlined } from '@ant-design/icons'

import './style.less'
import { getOutputVariables, getInputVariables } from './service'
import List from '@/components/List'
import { getUrlParams, copyText } from '@/utils'

interface Props {
  tabIndex: number
  config: any
}
function Project(props: Props) {
  const { tabIndex, config } = props
  const [inputData, setInputData] = useState({})
  const [outputData, setOutputData] = useState({})
  const query = getUrlParams()


  const listRef = useRef(null)
  const inputListRef = useRef(null)


  const getInputData = async (params: any) => {
    params.size = 1000
    const { data } = await getInputVariables(config.logId, params)
    setInputData({
      data: data,
      total: data.length
    })
  }

  const getOutputData = async (params: any) => {
    params.size = 1000
    const { data } = await getOutputVariables(config.logId, params)
    setOutputData({
      data: data,
      total: data.length
    })
  }

  const renderColumnCopy = (v) => {
    return <div style={{ position: 'relative', padding: '0 20px' }}>
      {handleText(v)}
      <CopyOutlined className='copy' onClick={() => copyText(v)} />
    </div>
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

  const columns = [
    {
      title: '变量来源',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (v, record) => {
        return <div>
          {record.scope === 'pipeline' ? '全局' : record.scope}
        </div>
      }
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
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      align: 'center',
      render: (v) => {
        return renderColumnCopy(v)
      }
    },
  ];

  const outputColumns = [
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
    <div className='execModal-env-run-container'>
      <br />
      <div className='title'>环境变量：</div>
      <List
        getData={getInputData}
        data={inputData.data}
        total={inputData.total}
        ref={inputListRef}
        showTableFilter={false}
        hasNavigation={false}
        columns={columns}>
      </List>
      <br />
      <div className='title'>输出变量：</div>
      <List
        getData={getOutputData}
        data={outputData.data}
        total={outputData.total}
        ref={listRef}
        showTableFilter={false}
        hasNavigation={false}
        columns={outputColumns}>
      </List>
    </div>
  );
}

export default Project
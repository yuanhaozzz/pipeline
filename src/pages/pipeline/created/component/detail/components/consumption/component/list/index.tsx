import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, Popover, Tooltip } from 'antd'

import { PlusOutlined, CopyOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { renderStatus } from '@/pages/pipeline/created/common'

import { getListApi } from './service';
import './style.less'

import List from '@/components/List'
import moment from 'moment';
import { useParams } from 'react-router-dom';
const { TextArea } = Input;
export interface IAppProps {
}

function LoadModal(props: IAppProps, ref: any) {
  const { id } = props
  const [modal, setModal] = useState(false)
  const [record, setRecord] = useState({})
  const { pipelineId, runIid } = useParams() || {}

  const stageData = useRef({})
  const variableRef = useRef(null)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open
  }))

  useEffect(() => {
    listRef.current.update()
  }, [runIid])

  const open = (record: any) => {
    setRecord(record)
    stageData.current = record
    setModal(true)
  }

  const onCancel = () => {
    setModal(false)
  }

  const summit = async () => {
    const values = await form.validateFields()

  }

  const [tableData, setTableData] = useState<any>({})

  const listRef = useRef(null)

  const getData = async () => {

    let { data } = await getListApi(id)
    // let { data } = await getListApi(70785)

    setTableData({
      data: data,
      total: data.length
    })
  }

  const searchOptions: any[] = []

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (v, record) => {
        return <Tooltip title={v} placement="topLeft">
          <div className='run-name'>{v}</div>
        </Tooltip>
      }
    },
    // {
    //   title: '描述',
    //   dataIndex: 'description',
    //   key: 'description',
    //   align: 'center',
    // },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      align: 'center',
      render: (status: string) => {
        return <>
          {
            renderStatus(status?.toLocaleLowerCase())
          }
        </>
      }
    },
    {
      title: 'Job 名称',
      dataIndex: 'job_name',
      key: 'job_name',
      align: 'center',
      render: (v, record) => {
        return <Tooltip title={v} placement="topLeft">
          <div className='run-name'>{v}</div>
        </Tooltip>
      }
    },
    {
      title: 'Host Name',
      dataIndex: 'node_name',
      key: 'node_name',
      align: 'center',
    },
    {
      title: 'IP 地址',
      dataIndex: 'node_ip',
      key: 'node_ip',
      align: 'center',
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      align: 'center',
      render: (updated_at) => {
        return <>
          {
            updated_at ? moment(updated_at).format('YYYY-MM-DD HH:mm:ss') : '-'
          }
        </>
      }
    },
  ];

  const renderTitle = () => {
    return <div>
      <span>Case 详情</span>&nbsp;&nbsp;
      <span style={{ fontSize: '12px' }}> {record.name}</span>
    </div>
  }

  return (
    <List searchOptions={searchOptions}
      getData={getData}
      data={tableData.data}
      total={tableData.total}
      ref={listRef}
      hasNavigation={false}
      showTableFilter={false}
      columns={columns}>
    </List>
  );
}


export default forwardRef(LoadModal)
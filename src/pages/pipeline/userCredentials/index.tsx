import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom'
import { PlusOutlined, ApartmentOutlined, MoreOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined, LoadingOutlined, StopOutlined, EditOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Button, Dropdown, Popover, Tag, Popconfirm, message } from 'antd'
import moment from 'moment';

import { getListApi, removeApi } from './service'
import FormCredentials from './component/formCredentials'
import { useModel } from "umi";

import './style.less'
// import { send } from './service '

import List from '@/components/List'

function Project(props) {

  const [tableData, setTableData] = useState<any>({})

  const listRef = useRef(null)

  const variableRef = useRef(null)
  const formCredentialsRef = useRef(null)

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;


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
    },
    {
      type: 'select',
      form: {
        label: '类型',
        name: "type",
      },
      componentOptions: {
        placeholder: '请选择',
        options: [
          {
            label: 'token',
            value: 'token'
          },
          {
            label: 'ssh',
            value: 'ssh'
          },
        ]
      }
    },
  ]

  const getData = async (params: any) => {
    params.size = params.pageSize
    params.page_num = params.current
    let res = await getListApi(params)
    setTableData({
      data: res.data,
      total: res.total
    })
  }

  const add = () => {
    formCredentialsRef.current.open()
  }

  const edit = (record: any) => {
    formCredentialsRef.current.open(record)
  }

  const remove = async (id: string) => {
    try {
      await removeApi(id)
      message.success('删除成功')
      update()
    } catch (error) {
    }
  }

  const update = () => {
    listRef.current.update()
  }

  const hasAuth = (record) => {
    // const { is_public } = record
    // if (!is_public) {
    return currentUser.username !== record.user_id
    // }
    // return false
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
    },
    {
      title: '凭据类型',
      dataIndex: 'type',
      key: 'type',
      align: 'left',
      render: (type: any) => {
        switch (type) {
          case 'token':
            return <Tag color="#2db7f5">token</Tag>
          case 'ssh':
            return <Tag color="#3b5999">ssh</Tag>
        }
      }
    },
    {
      title: '别名',
      dataIndex: 'alias',
      key: 'alias',
      align: 'left',
    },
    // {
    //   title: '凭据内容',
    //   dataIndex: 'credential',
    //   key: 'credential',
    //  align: 'left',
    // },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      align: 'left',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'left',
      render: (v, record) => (
        <div className='flex-start'>
          <Popover content={hasAuth(record) ? '暂无权限' : '编辑'} trigger="hover">
            <div>
              <Button onClick={() => edit(record)} disabled={hasAuth(record)} type="primary" ghost icon={<EditOutlined style={{ fontSize: '12px', }} />}></Button>&nbsp;&nbsp;&nbsp;
            </div>
          </Popover>
          <Popover content={hasAuth(record) ? '暂无权限' : '删除'} trigger="hover">
            {
              hasAuth(record) ? <Button disabled={hasAuth(record)} danger icon={<DeleteOutlined />}></Button> : <Popconfirm onConfirm={() => remove(record.uuid)} title={'确定要删除吗？'} icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
                <Button disabled={hasAuth(record)} danger icon={<DeleteOutlined />}></Button>
              </Popconfirm>
            }

          </Popover>
        </div>
      )
    }
  ]

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
        columns={columns}>
        <br />
        <Button type='primary' icon={<PlusOutlined />} onClick={add}>新增</Button>
        <br />
        <br />
      </List>
    )
  }


  return (
    <div className='flow-recently-run-container common-reset' ref={variableRef}>
      {renderList()}
      <FormCredentials ref={formCredentialsRef} update={update} />
    </div>
  );
}

export default Project
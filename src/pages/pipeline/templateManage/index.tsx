import React, { useEffect, useState, useRef } from 'react';
import { Skeleton, Button, Table, Form, Input, Popover, } from 'antd';
import { PlusOutlined, CopyOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { getListApi } from './service';
import moment from 'moment';
// import Pagination from '@/components/Pagination';

import List from '@/components/List'

const TemplateManage = (props: any) => {
  const [tableData, setTableData] = useState<any>({})

  const listRef = useRef(null)

  const getData = async (params: any) => {
    let { data } = await getListApi(params)
    if (params.name) {
      data = data.filter(item => item.name.toLowerCase().includes(params.name))
    }

    setTableData({
      data: data,
      total: data.length
    })
  }

  const searchOptions: any[] = [
    {
      type: 'input',
      form: {
        label: '模板名称',
        name: "name",
      },
      componentOptions: {
        placeholder: '请输入',
      }
    },
  ]

  const columns = [
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
      render: (text: string, record: any) => {
        return <>
          {moment(record?.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </>
      }
    },
    {
      title: '修改时间',
      dataIndex: 'update_at',
      key: 'update_at',
      align: 'left',
      render: (text: string, record: any) => {
        return <>
          {moment(record?.update_at).format('YYYY-MM-DD HH:mm:ss')}
        </>
      }
    },
    {
      title: '使用次数',
      dataIndex: 'pipeline_cnt',
      key: 'pipeline_cnt',
      align: 'left',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'left',
      width: 260,
      render: (record: Object) => (<span >
        <Popover content='编辑' trigger="hover">
          <Button onClick={() => edit(record)} icon={<EditOutlined />} type='primary' ghost></Button >&nbsp;&nbsp;&nbsp;
        </Popover>
        <Popover content='删除' trigger="hover">
          <Button onClick={() => del(record)} icon={<DeleteOutlined />} danger></Button >&nbsp;&nbsp;&nbsp;
        </Popover>
        <Popover content='复制' trigger="hover">
          <Button onClick={() => copy(record)} icon={<CopyOutlined />}></Button >&nbsp;&nbsp;&nbsp;
        </Popover>
        <Popover content='预览' trigger="hover">
          <Button onClick={() => preview(record)} icon={<UnorderedListOutlined />}></Button >
        </Popover>
      </span>)
    },
  ];

  const copy = (record: Object) => {
    console.log('---copy', record);
  }

  const edit = (record: Object) => {
    console.log('---edit', record);
  }

  const del = (record: Object) => {
    console.log('---del', record);
  }

  const preview = (record: Object) => {
    console.log('---preview', record);
  }

  const add = () => {

  }

  return (
    <div>
      <List searchOptions={searchOptions}
        getData={getData}
        data={tableData.data}
        total={tableData.total}
        ref={listRef}
        showTableFilter={false}
        columns={columns}>
        <br />
        <Button type='primary' icon={<PlusOutlined />} onClick={() => add()}>新增</Button>
      </List>
    </div>
  );
};

export default TemplateManage;
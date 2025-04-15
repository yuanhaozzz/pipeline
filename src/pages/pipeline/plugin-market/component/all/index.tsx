import React, { useEffect, useState, useRef } from 'react';
import { Skeleton, List, message, Button, Table, Form, Input } from 'antd';
import { atoLlist } from '../../service';
import moment from 'moment';
import Pagination from '@/components/Pagination';
import Detail from '../detail';
import Unload from '../unload';
import ListComponent from '@/components/List'
import { PlusOutlined } from '@ant-design/icons'

import './style.less';

export interface IProps {
  type?: string;
}

const All = (props: IProps) => {
  const { type: tabType, } = props || {};
  const [tableData, setTableData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [page, setPageInfo] = useState({ current: 1, size: 10, total: 0 });

  const detailRef = useRef(null);
  const unloadRef = useRef(null);
  const listRef = useRef(null);
  const [form] = Form.useForm();



  const getData = async () => {
    // const pNum = current || 1, psize = size || 10;
    // setLoading(true);
    // atoLlist({
    //   type: tabType,
    //   name: form.getFieldValue('name') || '',
    //   page_num: pNum,
    //   size: psize,
    // }).then((res: any) => {
    //   const { data: { atom_info = [] } = {}, total = 0 } = res || {}
    //   setLoading(false);
    //   setList(atom_info || []);
    //   setPageInfo({ current: pNum, size: psize, total });
    // })
  }

  const columns = [
    // {
    //   title: 'logo_url',
    //   dataIndex: 'logo_url',
    //   key: 'logo_url',
    //   render: (text: string) => {
    //     return <span style={{ width: 60 }}><img width={38} src={text} /></span>
    //   }
    // },
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => {
        const { version, description, logo_url } = record || {};
        return <>
          <div className={'tdNm'}>
            <span className={'logo'}><img src={logo_url} /></span>
            <span>
              <b>{text}</b>
              <p>{description}</p>
            </span>
          </div>
        </>
      }
    },
    {
      title: 'creator_display_name',
      dataIndex: 'creator_display_name',
      key: 'creator_display_name',
      render: (text: string, record: any) => {
        return <>
          {text}安装于{moment(record?.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </>
      }
    },
    {
      title: '引用次数',
      dataIndex: 'pipeline_cnt',
      key: 'pipeline_cnt',
      render: (text: number, record: any) => {
        return <a onClick={() => detailRef.current && detailRef.current?.show(true, record)
        } > {text}</a >
      }
    },
    {
      title: 'operate',
      dataIndex: 'operate',
      key: 'operate',
      align: 'right',
      render: () => <Button disabled onClick={() => unloadRef.current && unloadRef.current?.setIsModalOpen(true)} >卸载</Button >
    },
  ];


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

  const add = () => {

  }

  return (
    <div className='allWrapper'>
      <ListComponent searchOptions={searchOptions}
        getData={getData}
        data={tableData.data}
        total={tableData.total}
        ref={listRef}
        showTableFilter={false}
        hasNavigation={false}
        columns={columns}>
        <br />
        <Button type='primary' icon={<PlusOutlined />} onClick={() => add()}>新增</Button>
      </ListComponent>
      {/* <div className={'formCnt'}>
        <Form
          form={form}
          name={`${tabType}Form`}
          layout="horizontal"
          onFinish={query}
          autoComplete="off"
        >
          <div className='flex-space-between'>
            <Form.Item label="插件名字" name="name" >
              <Input placeholder="请输入插件名字" style={{ width: '300px' }} />
            </Form.Item>
            <Form.Item>
              <Button onClick={handleReset}>重置 </Button>
              <Button type="primary" htmlType="submit">查询 </Button>
            </Form.Item>
          </div>
        </Form>
      </div> */}

      {/* <Skeleton loading={loading}>
        <Table
          columns={columns}
          showHeader={false}
          dataSource={list}
          rowKey="id"
          pagination={false}
        />
        <p>
          <Pagination {...page} onChange={handleSizeChange}></Pagination>
        </p>
      </Skeleton> */}
      <Detail ref={detailRef} />
      <Unload ref={unloadRef} />
    </div >
  );
};

export default All;
import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { RightOutlined } from '@ant-design/icons'
import { Drawer, Table, Skeleton, Popover } from 'antd';
import Pagination from '@/components/Pagination';
import { atoLlist } from '../../service';
import './style.less';

const Detail = (props: any, ref: any) => {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState({});
  const [page, setPageInfo] = useState({ current: 1, size: 10, total: 0 });
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    open,
    setOpen,
    show,
  }))

  const onClose = () => {
    setOpen(false);
  };

  const show = (bool: boolean, record: any = {}) => {
    setInfo(record)
    setOpen(bool);
  }

  const getList = (current?: number, size?: number) => {
    const pNum = current || 1, psize = size || 10;
    setLoading(true);
    atoLlist({
      // type: tabType,
      page_num: pNum,
      size: psize,
    }).then((res: any) => {
      const { data: { atom_info = [] } = {}, total = 0 } = res || {}
      setLoading(false);
      setList(atom_info || []);
      setPageInfo({ pNum, psize, total });
    })
  }

  const handleSizeChange = (current, size) => {
    setPageInfo((prevState) => (
      {
        ...prevState,
        current,
        size
      }
    ));
    getList(current, size);
  }

  const columns = [
    {
      title: '流水线名称',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '最近执行人',
      dataIndex: 'execer',
      key: 'execer',
      align: 'center',
    },
    {
      title: '最新执行时间',
      dataIndex: 'time',
      key: 'time',
      align: 'center',
      render: (text: string) => {
        return <>
          2023-05-15 01:00:00
        </>
      }
    },
  ];

  const renderLabels = () => {
    const { name = '', creator_display_name = '', description = '', } = info || {};
    return <ul className={'info'}>
      <li>名称： {name}</li>
      <li>简介：{description?.length >= 18 ? <Popover content={description} >
        {description.substr(0, 18)} ...
      </Popover> : description}</li>
      <li>发布者：{creator_display_name}</li>
      <li>发布时间：2022-12-03 22:15:18</li>
    </ul>
  }

  return <>
    <Drawer className={'detailWrapper'} title={info?.name} placement="right" onClose={onClose} open={open} width={644} closeIcon={<RightOutlined />}>
      {renderLabels()}
      <p><br /><b>关联流水线（{info?.list?.length || 0}）</b></p>
      <Skeleton loading={loading}>
        <Table
          columns={columns}
          dataSource={info?.list}
          rowKey="id"
          pagination={false}
        />
        <p>
          <Pagination current={page.current} size={page.size} total={page.total} onChange={handleSizeChange}></Pagination>
        </p>
      </Skeleton>
    </Drawer>
  </>
};

export default forwardRef(Detail);
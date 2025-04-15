import { useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, Popover } from 'antd'

import { PlusOutlined, CopyOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons'

import { getListApi } from './service';
import './style.less'

import List from '@/components/List'
const { TextArea } = Input;
export interface IAppProps {
}

function LoadModal(props: IAppProps, ref: any) {
  const [modal, setModal] = useState(false)
  const [record, setRecord] = useState({})

  const variableRef = useRef(null)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any) => {
    setRecord(record)
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

  const searchOptions: any[] = []

  const columns = [
    {
      title: '名字',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'center',
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
    <div ref={variableRef}>
      <Modal className='flow-create-stage-consumptionModal-container' title="消费信息" centered destroyOnClose={true} footer={null} open={modal} onCancel={onCancel}>
        <br />
        <List searchOptions={searchOptions}
          getData={getData}
          data={tableData.data}
          total={tableData.total}
          ref={listRef}
          hasNavigation={false}
          showTableFilter={false}
          columns={columns}>
        </List>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
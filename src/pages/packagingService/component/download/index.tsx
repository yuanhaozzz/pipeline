import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, Table, Checkbox, message } from 'antd'
import './style.less'
import { copyText, batchDownloadFiles } from '@/utils'
import { pipelineDetailDownloadApi } from './service'

export interface IAppProps {
}

function LoadModal(props: IAppProps, ref: any) {
  const [modal, setModal] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [record, setRecord] = useState({})

  const [data, setData] = useState([])

  const getData = async (id) => {
    const params = {
      size: 1000
    }
    const { data } = await pipelineDetailDownloadApi(id, params)
    // const data = [
    //   {
    //     key: 0,
    //     name: '测试0',
    //     created_at: '2023-09-15',
    //     url: `http://10.12.110.200:8080/checkin/dolphin/123.456-1694429834-master-c3def3676.tar.gz`
    //   },
    //   {
    //     key: 1,
    //     name: '测试1',
    //     created_at: '2023-09-15',
    //     url: `http://10.12.110.200:8080/checkin/dolphin/caps-master-c361a73-build_cmake_runtime-1694164000.tar.gz`
    //   },
    // ]
    // for (var i = 0; i < 5; i++) {
    //   data.push({
    //     key: i,
    //     name: '测试' + i,
    //     created_at: '2023-09-15',
    //     url: `http://10.12.110.200:8080/checkin/dolphin/caps-master-c361a73-build_cmake_runtime-1694164000.tar.gz`
    //   })
    // }
    setData(data.map((item, index) => {
      item.key = index
      return item
    }))
  }


  const variableRef = useRef(null)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any) => {
    setModal(true)
    getData(record.id)
    setRecord(record)
  }

  const onCancel = () => {
    setSelectedRowKeys([]);
    setModal(false)
  }

  const summit = () => {
    console.log(selectedRowKeys)
    if (selectedRowKeys.length <= 0) {
      message.error('请选择编译产物')
      return
    }
    const urls = []
    for (let i = 0; i < selectedRowKeys.length; i++) {
      const index = selectedRowKeys[i]
      const { name, url } = data[index]
      urls.push({
        name,
        url
      })
    }
    batchDownloadFiles(urls, downloadCallback)


  }

  const downloadCallback = () => {
    setTimeout(() => {
      getData(record.id)
    }, 100);
  }

  const columns = [
    {
      title: '',
      dataIndex: 'name',
      align: 'left',
      render: (v, record) => {
        return <div>
          <div style={{ color: '#1890ff' }}>{record.name}</div>
          <div style={{ color: '#999999' }}>{record.created_at}</div>
        </div>
      }
    },
    {
      title: '操作',
      dataIndex: 'address',
      align: 'center',
      width: 150,
      render: (v, record) => {
        return <div style={{ color: '#1890ff', cursor: 'pointer' }}>
          <div className='flex-start'>
            <Button size='small' onClick={() => copyText(record.url)}>复制地址</Button>&nbsp;&nbsp;
            <Button size='small' onClick={() => copyText(record.curl_url)}>curl 下载</Button>
          </div>
          <span style={{ color: '#999999', whiteSpace: 'nowrap' }}>已下载<span style={{ color: '#1890ff' }}> {record.download_count} </span>次</span>
        </div>
      }
    },
  ];


  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const indeterminate = () => {
    return !!selectedRowKeys.length && selectedRowKeys.length < data.length
  }

  const checkBoxChange = (e) => {
    const checked = e.target.checked
    if (checked) {
      setSelectedRowKeys(data.map(item => item.key));
    } else {
      setSelectedRowKeys([]);
    }
  }

  return (
    <div ref={variableRef}>
      <Modal title="下载列表" centered destroyOnClose={true} footer={[
        <div className='flex-space-between'>
          {/* <Button onClick={all}>全选</Button>, */}
          <Checkbox indeterminate={indeterminate()} onChange={checkBoxChange} checked={selectedRowKeys.length === data.length}>
            全选
          </Checkbox>
          <div>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" onClick={summit}>立即下载</Button>
          </div>
        </div>,
      ]} open={modal} onCancel={onCancel} width={700} className='replace-font-size-12'>
        <div className='packagingService-download-container common-scroll-bar'>
          {/* 说明 */}
          <div className='download-header flex-center'>共{data.length}个编译产物</div>
          {/* ，编译成功2个，编译失败3个 */}
          {/* 下载包 */}
          <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false} showHeader={false} />
        </div>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
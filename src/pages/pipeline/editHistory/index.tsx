import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Popover, Table, Modal, } from 'antd'
import { useModel } from 'umi';
import { OrderedListOutlined, RollbackOutlined, ExclamationCircleOutlined, } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import moment from 'moment'
import { getListApi, getRestoreApi, } from './service'
import './style.less'
import { getUrlParams, isUserAuth } from '@/utils'
import List from '@/components/List'
import Pagination from '@/components/Pagination'
import { setCompatiblePath } from '@/pages/pipeline/created/common'
import { checkPipilineAuth } from '@/utils/menu'

function EditHistroy(props: any) {
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;
  const query = getUrlParams()
  const { pipelineId, pipelineName, creator } = query || {}
  const [list, setList] = useState<any>([])
  const [loading, setLoading] = useState(false);
  const [page, setPageInfo] = useState({ current: 1, size: 10, total: 0 })
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const versionDiffRef = useRef(null)

  useEffect(() => {
    getData()
  }, [])

  const getData = async (current?: number, size?: number) => {
    setLoading(true)
    // const { current = 1, pageSize = 10 } = params
    const pNum = current || 1, psize = size || 10;
    let res = await getListApi(pipelineId, { page_num: pNum, size: 2000 })
    const { data, total = 0 } = res || {}
    setList(data)
    setPageInfo({
      current: pNum,
      size: psize,
      total
    });
    setLoading(false)
  }

  const getDiffData = async () => {
    const arr = selectedRowKeys?.sort()?.map(item => {
      const index = list?.findIndex((_: any) => _?.version === item);
      return {
        index,
        version: item,
        isHasAuth: isUserAuth(currentUser, list?.[index]?.creator?.user_id) || false
      }
    })
    versionDiffRef.current?.showModal({ pipelineId, versions: arr })
  }

  const goDetail = (record: any) => {
    const { version } = record
    window.open(setCompatiblePath(`/FlowLine/created/editHistory/preview?pipelineId=${pipelineId}&version=${version}&tab=1&from=editHistory`))
  }

  const restore = async (record: any) => {
    const { version } = record
    const res = await getRestoreApi(pipelineId, version)
    const { success = false } = res || {}
    if (success) {
      message.success('恢复成功')
      getData()
    }
  }

  const showConfirm = (record: any, cb?: Function) => {
    Modal.confirm({
      title: '版本恢复',
      icon: <ExclamationCircleOutlined />,
      content: '确认恢复到该版本吗 ?',
      onOk() {
        restore(record)
        cb && cb()
      },
    });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleDiff = () => {
    if (selectedRowKeys?.length !== 2) {
      message.destroy()
      return message.warning('请选择两条记录进行对比')
    }
    getDiffData()
  }

  const columns = [
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      align: 'left',
      width: 100,
      render: (v: any) => {
        return <>
          {v}
        </>
      }
    },
    {
      title: '编辑日期',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
      width: 300,
      render: (v: any) => {
        return <>
          {moment(v).format('YYYY-MM-DD HH:mm:ss')}
        </>
      }
    },
    {
      title: '编辑人',
      dataIndex: 'display_name',
      key: 'display_name',
      align: 'left',
      width: 300,
      render: (v: any, record: any) => {
        return <>
          {record?.updated_by?.display_name || ''}
        </>
      }
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'left',
      fixed: 'right',
      width: 100,
      render: (v: any, record: any, index: number) => {
        const isHasAuth = !checkPipilineAuth('Update') && !isUserAuth(currentUser, record?.creator?.user_id)
        return <div className='flex-start'>
          <Popover content='查看详情' trigger="hover">
            <Button icon={<OrderedListOutlined style={{ fontSize: '16px', }} />} onClick={() => goDetail(record)}></Button>
          </Popover>&nbsp;&nbsp;
          <Popover content={isHasAuth ? '暂无权限恢复' : '版本恢复'} trigger="hover">
            <Button disabled={isHasAuth || index === 0} icon={<RollbackOutlined style={{ fontSize: '16px', }} />} onClick={() => showConfirm(record)}></Button>
          </Popover>
        </div>
      }
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    hideSelectAll: true,
    onChange: onSelectChange,
    getCheckboxProps: (record: any) => ({
      disabled: selectedRowKeys.length >= 2 && !selectedRowKeys.includes(record?.version),
    }),
  };

  const handleSizeChange = (current, size) => {
    setSelectedRowKeys(selectedRowKeys)
    setPageInfo((prevState) => (
      {
        ...prevState,
        current,
        size
      }
    ));
    getData(current, size);
  }

  return (
    <PageContainer>
      <div className='editHistory-wrapper'>
        <p className='record-header flex-space-between'>
          <div className='record-title'>
            <b>流水线名称：</b><span>{pipelineName}</span>&nbsp;&nbsp;&nbsp;&nbsp;
            {
              (list && list.length > 0) && <>
                <b>创建人:</b> <span>{creator}</span>
              </>
            }
          </div>
          <div className='flex-center'>
            <Button type='primary' className='flex-center' onClick={() => handleDiff()} >对比</Button>
          </div>
        </p>
        <Table bordered rowSelection={rowSelection}
          columns={columns} dataSource={list} hideSelectAll={true}
          rowKey='version' loading={loading} pagination={false}
        // scroll={{ y: window.innerHeight - 265 }}
        />
        {/* <Table rowSelection={rowSelection} columns={columns} dataSource={list.slice((page.current - 1) * page.size, page.current * page.size)} rowKey='version' loading={loading} pagination={false} /> */}
        {/* <Pagination {...page} onChange={handleSizeChange}></Pagination> */}
      </div>
    </PageContainer>
  )
}

export default EditHistroy;
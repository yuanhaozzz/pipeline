import React, { useEffect, useState, useRef } from 'react';
import { Skeleton, Button, Table, Form, Input, Popover, } from 'antd';
import { PlusOutlined, CopyOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { getListApi } from './service';
import { renderStatus, renderTriggerIcon, renderTriggerType, setCompatiblePath } from '@/pages/pipeline/created/common'
import { renderColumnBranch } from '@/pages/packagingService/commonComponent'
import { getUrlParams, formatBytes, formatTime, copyText, isUserAuth } from '@/utils'
import moment from 'moment'

import List from '@/components/newList'

const TemplateManage = (props: any) => {
  const [tableData, setTableData] = useState<any>({})

  const listRef = useRef(null)

  const query = getUrlParams()

  const getData = async (params: any) => {
    params.ordering = '-create_datetime'
    let { data } = await getListApi(query.id, params)
    setTableData({
      data: data.data,
      total: data.total
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
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      width: 110,
      // filters: [
      //   {
      //     value: 'pending',
      //     text: '等待中',
      //   },
      //   {
      //     value: 'skipped',
      //     text: '跳过',
      //   },
      //   {
      //     value: 'running',
      //     text: '运行中',
      //   },
      //   {
      //     value: 'canceled',
      //     text: '已取消',
      //   },
      //   {
      //     value: 'success',
      //     text: '运行成功',
      //   },
      //   {
      //     value: 'failed',
      //     text: '运行失败',
      //   },
      //   {
      //     value: 'timeout',
      //     text: '超时',
      //   },
      // ],
      // filterSearch: true,
      // filterMultiple: true,
      render: (x: any, record: any) => {
        const { status, triggerCount, trigger_type: triggerType, last_trigger_user_display_name } = record
        return <div className='flex-center' style={{ cursor: 'pointer' }} onClick={() => preview(record)} >
          {/* 状态 */}
          <div className='flex-center'>
            <div>
              {
                renderStatus(status)
              }
            </div>
            {/* <span style={{ fontSize: '12px' }} className={`status-${status}`} >
              &nbsp; {
                renderText(status)
              }
            </span> */}
          </div>
        </div>
      }
    },
    {
      title: '触发方式',
      dataIndex: 'templateId',
      key: 'templateId',
      align: 'left',
      render: (x: any, record: any) => {
        let { last_run_status: status, triggerCount, trigger_type: triggerType, last_run_hook_from } = record
        return <div>
          <div className='flex-start'>
            <div>{renderTriggerIcon(triggerType, last_run_hook_from)}</div>&nbsp;&nbsp;
            <div>{renderTriggerType(triggerType, last_run_hook_from)}</div>
          </div>
          <span className='list-bottom'>{record.trigger_by_display_name}</span>
        </div>
      }
    },
    // {
    //   title: '仓库 & 分支',
    //   dataIndex: 'branch',
    //   key: 'branch',
    //   align: 'left',
    //   render: (v, record) => {
    //     return <div>
    //       {record.project_path}
    //       <div className='flex-start list-bottom'>
    //         {renderColumnBranch(record)}
    //       </div>
    //     </div>
    //   }
    // },
    {
      title: '触发时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
      render: (x: any, record: any) => {
        const { created_at, duration } = record
        return <div >
          <div >{moment(created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
          <div className='list-bottom'>{formatTime(duration)}</div>
        </div>
      }
    },
    {
      title: '结束时间',
      dataIndex: 'modify_at',
      key: 'updated_at',
      align: 'left',
      render: (x: any, record: any) => {
        const { updated_at, last_modify_user_display_name } = record
        return <div className='flex-start'>
          <div >{moment(updated_at).format('YYYY-MM-DD HH:mm:ss')}</div>&nbsp;&nbsp;
          <div >{last_modify_user_display_name}</div>
        </div>
      }
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'center',
      width: 60,
      render: (v, record: Object) => (<span >
        <Popover content='查看详情' trigger="hover">
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
    props.history.push(setCompatiblePath(`/FlowLine/created/detail/${record.uuid}/${record.run_iid}?pipelineId=${record.uuid}`))

    console.log('---preview', record);
  }

  const add = () => {

  }

  return (
    <div>
      <List
        getData={getData}
        data={tableData.data}
        total={tableData.total}
        ref={listRef}
        indexConfig={{
          isIndexReverse: true,
          title: '序号',
          content: (v) => `${v}`
        }}
        showTableFilter={false}
        indexConfig={{
          isIndexReverse: true,
          title: '序号',
          content: (v) => `${v}`
        }}
        columns={columns}>
        <br />
      </List>
    </div>
  );
};

export default TemplateManage;
import React, { useEffect, useState, useRef } from 'react';
import { Skeleton, Button, Table, Form, Input, Popover, Switch, Tooltip, Modal, message } from 'antd';
import { PlusOutlined, CopyOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined, HistoryOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { getListApi, removeApi, switchApi, getPipelineListApi } from './service';
import { getUrlParams } from '@/utils'

import Detail from './components/detail'
import { handleOtherValue, handleRepoValue, renderVariablesValue, setCompatiblePath } from '../../common'

import List from '@/components/newList'
import { weekNumberMap } from './data'
import './style.less'
import list from '@/pages/deviceReservations/component/list';
const { confirm } = Modal;

function Project(props) {
  const [tableData, setTableData] = useState<any>({})
  const query = getUrlParams()

  const [switchDisabled, setSwitchDisabled] = useState(false)
  const [searchData, setSearchData] = useState({ pipelineId: [] })

  const listRef = useRef(null)
  const detailRef = useRef(null)

  const isInitSearch = useRef(true)

  useEffect(() => {
    // getPipelineList()
  }, [])

  const getData = async (params: any) => {
    params.ordering = '-create_datetime'

    if (isInitSearch.current) {
      params.pipeline_uuid = query.uuid
      delete params.pipeline_name
    } else {
      delete params.uuid
    }
    // if () {

    // }
    // params.pipeline_uuid = query.uuid
    let { data } = await getListApi(params)
    setTableData({
      data: data.data,
      total: data.total
    })
  }

  const getPipelineList = async () => {
    try {
      const { data } = await getPipelineListApi({ size: 100, page_num: 1, filter: '' })
      const options = data.map((pipeline: any) => {
        const { uuid, name } = pipeline
        return {
          label: name,
          value: uuid
        }
      })
      setSearchData({ pipelineId: options })
    } catch (error) {

    }
  }

  const searchOptions: any[] = [
    {
      type: 'input',
      form: {
        label: '流水线名称',
        name: "pipeline_name",
      },
      componentOptions: {
        placeholder: '请输入',
        onInputChange: () => {
          isInitSearch.current = false
        }
      }
    },
    // {
    //   type: 'select',
    //   form: {
    //     label: '流水线',
    //     name: "uuid",
    //     initialValue: query.pipelineId
    //   },
    //   componentOptions: {
    //     placeholder: '请输入',
    //     options: searchData.pipelineId,
    //     onChange: (value) => {
    //       listRef.current.update({
    //         pipeline_uuid: value,
    //         current: 1
    //       })
    //       setActiveKey('')
    //       variableRef.current.actoveKey = ''
    //     }
    //   }
    // },
  ]

  const goHistory = (record) => {
    props.history.push(setCompatiblePath(`/FlowLine/created/scheduledTasks/history?id=${record.id}&uuid=${record.pipeline_uuid}&pipelineName=${query.pipeline_name}`))
  }

  const swtichChange = async (checked, record) => {
    console.log(checked)
    try {
      setSwitchDisabled(true)
      const params = {
        enable: checked
      }
      await switchApi(record.id, params)
      listRef.current.update()
      message.success(checked ? '已启用' : '已停用')
    } catch (error) {
    } finally {
      setSwitchDisabled(false)
    }

  }

  function filterEmptyParams(params) {
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        if (params[key] === undefined || params[key] === null) {
          params[key] = ''
        }
      }

    }
    return params
  }

  const columns = [
    {
      title: '流水线名称',
      dataIndex: 'pipeline_name',
      key: 'pipeline_name',
      align: 'left',
      render: (v) => {
        return <div className='column-title'>
          <Tooltip title={v}>
            {v}
          </Tooltip>
        </div>
      }
    },
    {
      title: '描述',
      dataIndex: 'schedule_description',
      key: 'schedule_description',
      align: 'left',
      width: 160,
      render: (v, record) => {
        // return <div style={{ maxWidth: '400px' }}>
        return <div style={{ maxWidth: '400px' }}>
          <Tooltip title={() => <span dangerouslySetInnerHTML={{ __html: v }} ></span>}>
            <span className='descEllipsis' dangerouslySetInnerHTML={{ __html: v }} ></span>
          </Tooltip>
        </div>
      }
    },
    {
      title: '参数',
      dataIndex: 'trigger_info',
      key: 'trigger_info',
      width: '20%',
      align: 'left',
      render: (value, record) => {
        const variables = value.variables || []
        const filterParameters = ['isBranch']
        const otherList = variables.filter(item => !filterParameters.includes(item.key) && !item.repo_info)
        const other = handleOtherValue([...otherList])
        const repoValue = handleRepoValue(variables.filter(item => !filterParameters.includes(item.key) && item.repo_info))
        const list = [...other, ...repoValue].filter(item => item.key)
        return <>
          <Tooltip overlayClassName="pipeline-detail-varables-item-tooltip" title={<div>
            {
              list.map((item, index) => (
                <div>
                  <span style={{ fontWeight: 'bold' }}>{item.key}：</span>
                  {renderVariablesValue(item)}
                </div>
              ))
            }
          </div>}>
            <div className='scheduleTasks-trigger_info'>
              {
                list.map((item, index) => (
                  <>
                    {index !== 0 && <> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</>} <span style={{ color: '#7F7F7F', fontWeight: 'bold' }}>{item.key}：</span>
                    {renderVariablesValue(item)}
                  </>
                ))
              }
            </div>
          </Tooltip>
        </>


        // <ul className='flex-start scheduleTasks-trigger_info'>
        //   {
        //     list.map(item => (
        //       <li style={{ marginRight: '40px' }}>
        //         <Tooltip overlayClassName="pipeline-detail-varables-item-tooltip" placement="topLeft" title={`${item.key}：${String(item.value) || '-'}`} >
        //           <span style={{ color: '#7F7F7F', fontWeight: 'bold' }}>{item.key}：</span>
        //           {renderVariablesValue(item)}
        //         </Tooltip>
        //       </li>
        //     ))
        //   }
        // </ul>
      }
    },
    {
      title: '是否启用',
      dataIndex: 'enable',
      key: 'enable',
      align: 'left',
      render: (v, record) => {
        return <>
          <Switch checked={v} disabled={switchDisabled} onChange={(checked) => swtichChange(checked, record)} />
        </>
      }
    },
    {
      title: '执行时间',
      dataIndex: 'schedule',
      key: 'schedule',
      align: 'left',
      render: (schedule) => {
        if (schedule.type === 'cron') {
          return <>{schedule?.cron}</>
        }
        return <div style={{ whiteSpace: 'nowrap' }}>
          {schedule.hour_minute}&nbsp; {schedule?.day_of_week.map((item, index) => (
            <>
              &nbsp;{index !== 0 && '、'}{weekNumberMap[item]}
            </>
          ))}
        </div>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'create_datetime',
      key: 'create_datetime',
      align: 'left',
      width: '150px'

    },
    {
      title: '最近执行时间',
      dataIndex: 'last_trigger_datetime',
      key: 'last_trigger_datetime',
      align: 'left',
      width: '150px'
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      width: 200,
      fixed: 'right',
      render: (v, record: Object) => (<span >
        <Popover content='执行历史' trigger="hover">
          <Button onClick={() => goHistory(record)} icon={<HistoryOutlined />}></Button >&nbsp;&nbsp;&nbsp;
        </Popover>
        <Popover content='复制' trigger="hover">
          <Button onClick={() => copy(record)} icon={<CopyOutlined />}></Button >&nbsp;&nbsp;&nbsp;
        </Popover>
        <Popover content='编辑' trigger="hover">
          <Button onClick={() => edit(record)} icon={<EditOutlined />} type='primary' ghost></Button >&nbsp;&nbsp;&nbsp;
        </Popover>
        <Popover content='删除' trigger="hover">
          <Button onClick={() => del(record)} icon={<DeleteOutlined />} danger></Button >
        </Popover>
      </span>)
    },
  ];

  const copy = (record: Object) => {
    record.from = 3
    detailRef.current.open(record)
  }

  const edit = (record: Object) => {
    console.log('---edit', record);
    record.from = 2
    detailRef.current.open(record)
  }

  const del = (record: Object) => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: <p>确定删除吗？</p>,
      async onOk() {
        try {
          await removeApi(record.id)
          message.success('删除成功')
          listRef.current.update()
        } catch (error) {
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  const preview = (record: Object) => {
    console.log('---preview', record);
  }

  const add = () => {
    detailRef.current.open({ from: 1 })
  }

  const update = () => {
    listRef.current.update()
  }

  return (
    <div className='flow-created-scheduledTasks-container'>
      <List searchOptions={searchOptions}
        getData={getData}
        data={tableData.data}
        total={tableData.total}
        ref={listRef}
        showTableFilter={false}
        columns={columns}>
        <br />
        <div className='flex-space-between'>
          <div>
            {/* <div>{query.pipelineName}</div>
            <div>创建人：{query.name}</div> */}
            <Button onClick={() => props.history.goBack()}>返回</Button>
          </div>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => add()}>新建定时任务</Button>
        </div>
      </List>
      <Detail ref={detailRef} updateList={update} />
    </div>
  );
}

export default Project
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { DownOutlined, SearchOutlined, ReloadOutlined, DeleteOutlined, UnorderedListOutlined, MoreOutlined, } from '@ant-design/icons'
import { Form, Input, Select, Button, DatePicker, Tooltip, Popover, Switch, Popconfirm, Dropdown, } from 'antd'
import moment from 'moment'
import CommitImage from './images/git-commit.png'

import './style.less'
import { send } from './service'
import FindUser from '@/components/findUser'
import { formatBytes, filterEmptyParams, copyText, formatHourText } from '@/utils'
import TableComponent from '../table'
import AnimationHeight from '@/components/animation/height'
import debounce from 'lodash/debounce';
import { useModel } from "@@/plugin-model/useModel";
import Gerrit from '@/assets/images/gerrit-icon.png'
import { weekList } from '@/pages/packagingService/data'
import { renderColumnBranch, renderTriggerIcon } from '@/pages/packagingService/commonComponent'
import { getUrlParams } from '@/utils'

const { Search } = Input;
const { RangePicker } = DatePicker;

interface Props {
  renderStatusText(status: any): any
  renderIcon(status: any): any
  getData(data: any): any
  data: any[]
  handleCancle(params: any): any
  handleRestart(params: any): any
  handleDownload(params: any): any
  handleView(params: any, type?: string): any
  handleCopy(params: any): any
  handleShare(params: any): any
  handleError(params: any): any
  refreshList(): any
  getStatusButtonsConfig(statu: any, data: any, from: string): any
  tabAction: any
  setListData: any
  removeSchedule(params: any): any
  handleSchedule: (record: any) => void
  scheduleEnableChange(e: any, record: any, query: any): any
}

let isQueryFirstLoad = true
let isFirstLoad = true
let isFirstLoadTable = true
let loadingStatusList = [false, false, false, false]
function Project(props: Props, ref) {
  const { getData, data, setListData, renderStatusText, renderIcon, handleCancle, handleRestart, handleDownload, handleView, handleCopy, handleShare, handleError, tabAction, getStatusButtonsConfig, refreshList, removeSchedule = () => { }, scheduleEnableChange = () => { }, handleSchedule = () => { }, } = props

  const [form] = Form.useForm();

  const [loading, setLoading] = useState([false, false, false, false]);
  // const [current, setCurrent] = useState(1);
  // const [pageSize, setPageSize] = useState(10);
  const [showTable, setShowTable] = useState(true);

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  const tableRef = useRef(null)
  const heightRef = useRef(null)
  const queueTimer = useRef(null)

  const variabledRef = useRef({ isFirstLoad: true, currentRecord: {} })

  const [query, setQuery] = useState({
    current: 1,
    pageSize: 10,
    tabAction
  })

  useImperativeHandle(ref, () => ({
    getQueryValue,
    handleRequestParams
  }))



  useEffect(() => {
    window.addEventListener('resize', debounceFetcher)
    return () => {
      window.removeEventListener('resize', debounceFetcher)
    }
  }, [])

  const resize = () => {
    const inerWidth = window.innerWidth
    if (inerWidth < 1400) {
      query.pageSize = 5
    } else {
      query.pageSize = 10
    }
    setQuery({ ...query })
  }

  const debounceFetcher = debounce(resize, 500);


  useEffect(() => {
    if (variabledRef.current.isFirstLoad) {
      reset()
    }
    variabledRef.current.isFirstLoad = true
  }, [tabAction])

  useEffect(() => {
    if (!isFirstLoadTable) {
      setShowTable(false)
    }
    variabledRef.current.isFirstLoad = true

    if (!isQueryFirstLoad) {
      search()
    }
    isQueryFirstLoad = false
  }, [query])

  useEffect(() => {
    const query: any = getUrlParams()
    if (query.keyword) {
      query.keyword = query.keyword.trim()
    }
    if (query.created_at_after) {
      query.date = [moment(query.created_at_after), moment(query.created_at_before)]
    } else {
      query.date = null
    }
    if (query.current) {
      query.current = query.current * 1
    }

    form.setFieldsValue(query)
    onChange({}, query.current)
  }, [])


  const getQueryValue = () => {
    return filterEmptyParams({ ...query })
  }

  const setLoadingValue = (stauts) => {
    loading[tabAction - 1] = stauts
    loadingStatusList[tabAction - 1] = stauts
    setLoading([...loading])
  }

  // 调用接口
  const search = async () => {
    try {
      setLoadingValue(true)
      clearTimeout(queueTimer.current)
      queueTimer.current = setTimeout(async () => {
        try {
          await getData(filterEmptyParams({ ...query }))
        } catch (error) {

        } finally {
          const loadingRunning = loading.filter(item => item === true)
          setLoadingValue(false)
        }

      }, 500);

    } catch (error) {
      console.log(error);

    }
  }

  const handleRequestParams = (newValue: any) => {
    setQuery({ ...query, ...newValue })
  }


  function disabledDate(current) {
    const today = moment().add(1, 'day').startOf('day');
    const sixDaysAgo = moment().subtract(6, 'days').startOf('day');
    return current && (current < sixDaysAgo || current > today);
  }

  const onChange = (data = {}, current?) => {
    const values = form.getFieldsValue()
    data.current = current || 1
    handleRequestParams({ ...values, ...data })
  }

  const userChange = (v) => {
    form.setFieldValue('trigger_by', v)
    onChange()
  }

  const switchHistory = () => {
    setShowTable(!showTable)
  }

  const renderMore = () => {
    return <div className='flex-center list-more'>
      <div className='box' onClick={() => switchHistory()}>查看历史 <DownOutlined className={`arrow ${showTable && 'arrow-rotate'}`} /></div>
    </div>
  }

  const reset = () => {
    form.resetFields()
    onChange({ current: 1 })
  }

  const renderForm = () => {
    return <Form form={form} >
      <div className='flex-space-between form-container'>
        <div className='flex-start form-left'>
          <Form.Item name="keyword" noStyle>
            <Input placeholder='CommitId/Patchset/分支/包名' suffix={<SearchOutlined />} onPressEnter={() => onChange()} allowClear />
          </Form.Item>
          &nbsp;&nbsp;
          <Button icon={<SearchOutlined />} type='primary' onClick={() => onChange()}>搜索</Button>
        </div>
        <div className='flex-end form-right'>
          <Form.Item name="status" noStyle>
            <Select
              allowClear
              onChange={v => onChange()}
              placeholder='编译状态'
              style={{ width: '12%' }}
              options={[
                {
                  value: 'running',
                  label: '编译中',
                },
                {
                  value: 'success',
                  label: '编译成功',
                },
                {
                  value: 'failed',
                  label: '编译失败',
                },
                {
                  value: 'canceled',
                  label: '编译取消',
                },
              ]}
            />
          </Form.Item>&nbsp;&nbsp;&nbsp;&nbsp;
          {/* <Form.Item name="package_type" noStyle>
            <Select
              allowClear
              placeholder='程序类型'
              onChange={v => onChange()}
              style={{ width: '12%' }}
              options={[
                // {
                //   value: 'jack',
                //   label: 'Jack',
                // },
              ]}
            />
          </Form.Item>&nbsp;&nbsp;&nbsp;&nbsp; */}
          {/* <Form.Item name="build_type" noStyle>
            <Select
              allowClear
              placeholder='编译类型'
              onChange={v => onChange()}
              style={{ width: '12%' }}
              options={[
                // {
                //   value: 'jack',
                //   label: 'Jack',
                // },
              ]}
            />
          </Form.Item>&nbsp;&nbsp;&nbsp;&nbsp; */}
          <Form.Item name="date" noStyle>
            <RangePicker style={{ width: '25%' }} format="YYYY-MM-DD" disabledDate={disabledDate} onChange={v => onChange()}
            />
          </Form.Item>&nbsp;&nbsp;&nbsp;&nbsp;
          <Form.Item name="trigger_by" noStyle>
            <FindUser selectProps={{ style: { width: '16%' }, onChange: userChange }} />
          </Form.Item>&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => reset()}>重置</Button>&nbsp;
          <Button onClick={() => refreshList()}>刷新</Button>
        </div>
      </div>
    </Form>
  }

  const renderSchduleForm = () => {
    return <Form form={form} >
      <div className='flex-space-between form-container'>
        <div className='flex-start form-left'>
          <Form.Item name="keyword" noStyle>
            <Input placeholder='CommitId' suffix={<SearchOutlined />} onPressEnter={() => onChange()} allowClear />
          </Form.Item>
          &nbsp;&nbsp;
          <Button icon={<SearchOutlined />} type='primary' onClick={() => onChange()}>搜索</Button>
        </div>
        <div className='flex-end form-right'>
          <Form.Item name="date" noStyle>
            <RangePicker style={{ width: '25%' }} format="YYYY-MM-DD" disabledDate={disabledDate} onChange={v => onChange()}
            />
          </Form.Item>&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => reset()}>重置</Button>&nbsp;
          <Button onClick={() => refreshList()}>刷新</Button>
        </div>
      </div>
    </Form>
  }

  const isAuth = (status, trigger_by_user_id) => {
    let disable = false
    if (status === 'canceled' || status === 'pending' || status === 'running') {
      if (trigger_by_user_id !== currentUser.username) {
        disable = true
      }
    }
    return disable
  }

  const renderStatusButton = (status, record) => {
    const { trigger_by_user_id } = record
    const disabled = isAuth(status, trigger_by_user_id)
    let buttonList = getStatusButtonsConfig(status, record, 'list')
    tabAction === 3 && buttonList.splice(1, 1)

    return <>
      {
        buttonList.map((button, index) => {

          return <>
            <Popover content={button.labelText}>
              {
                button.labelText === '取消编译' ? <div className={`list-column-cancle flex-center ${disabled ? 'cancle-disabled' : 'not-disabled'}`} onClick={!disabled && button.onClick}>{button.icon}</div> : <Button size='small' disabled={['查看详情', '定时任务', '复制任务'].includes(button.labelText) ? false : disabled} className='button-item' key={index} {...button}>{button.label}</Button>
              }
            </Popover>&nbsp;&nbsp;
          </>
        })
      }
    </>
  }

  const handlePackageType = (v) => {
    let value = v || '-'
    if (Array.isArray(v)) {
      value = value.join(',')
    }
    return value
  }

  const handleName = (value: any = '', end = 7) => {
    value = value || ''
    return <div >
      {
        value.length > end ? <Tooltip title={<div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>}>
          <div style={{ cursor: 'pointer' }}>{value.slice(0, end) + '...'}</div>
        </Tooltip> : value
      }
    </div >
  }

  const items: any = [
    {
      key: '1',
      label: <span onClick={() => handleSchedule(variabledRef.current.currentRecord)}>定时任务</span>,
    },
  ]

  const viewLog = (record) => {
    let url = `/FlowLine/created/detail/${record.uuid}/${record.run_iid}?from=packagingService`
    window.open(url)
  }

  const columns = [
    {
      title: '代码仓',
      dataIndex: 'url',
      key: 'url',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        {record.project_path && renderTriggerIcon(record.git_url?.includes('gerrit') ? 'gerrit' : '')}&nbsp;
        <div style={{ textAlign: 'left' }}>
          <div >{record.project_path || '-'}</div>
        </div>
      </div>,
    },
    {
      title: '分支/Patchset/Tag',
      dataIndex: 'branch',
      key: 'branch',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        {renderColumnBranch(record)}
      </div>,
    },
    {
      title: '执行状态',
      dataIndex: 'status',
      key: 'status',
      align: 'left',
      render: (status, record) => <div className='flex-start list-column'>
        <Tooltip title={renderStatusText(status)}>
          <div className='status-icon flex-start' style={{ cursor: 'pointer' }} onClick={() => viewLog(record)}>
            {renderIcon(status)}
          </div>
        </Tooltip>
      </div>,
    },
    {
      title: '包名',
      dataIndex: 'artifact_names',
      key: 'artifact_names',
      align: 'left',
      render: (v, record) => {
        const txt = (v || ['-']).join(', ');
        return <div className='flex-start list-column'>
          <Tooltip title={txt}>
            {(txt?.length > 11 ? txt.slice(0, 15) + '...' : txt) || '-'}
          </Tooltip>
        </div>
      },
    },
    {
      title: '触发人',
      dataIndex: 'trigger_by_display_name',
      key: 'trigger_by_display_name',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        {record.trigger_by_display_name}
      </div>,
    },
    {
      title: '包类型',
      dataIndex: 'build_type',
      key: 'build_type',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        <div style={{ textAlign: 'left' }}>
          <div style={{ marginTop: '5px' }}>{record.build_type || '-'}</div>
        </div>
      </div>,
    },
    {
      title: '程序类型',
      dataIndex: 'type',
      key: 'type',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        <div style={{ textAlign: 'left' }}>
          <div style={{ marginTop: '5px' }}>{handleName(handlePackageType(record.package_type), 10)}</div>
        </div>
      </div>,
    },
    {
      title: '创建时间',
      dataIndex: 'created_time',
      key: 'created_time',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        <div style={{ textAlign: 'left' }}>
          <div style={{ marginTop: '5px' }}>{formatTime(record.created_at)}</div>
        </div>
      </div>,
    },
    {
      title: '完成时间',
      dataIndex: 'done',
      key: 'done',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        <div style={{ textAlign: 'left' }}>
          <div style={{ marginTop: '5px' }}> {formatTime(record.end_at)}</div>
        </div>
      </div>,
    },
    {
      title: '耗时',
      dataIndex: 'type',
      key: 'type',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        {formatHourText(record.duration || 0)}
      </div>,
    },
    {
      title: '预计编包时长',
      dataIndex: 'estimated_duration',
      key: 'estimated_duration',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        {
          record.status === 'running' ? formatHourText(v || 0) : '-'
        }

      </div>,
    },
    {
      title: '包大小',
      dataIndex: 'download',
      key: 'download',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        {
          tabAction === 3 ? <div>排队中</div> : <div style={{ textAlign: 'left' }}>
            <div>{record.artifact_size ? formatBytes(record.artifact_size || 0) : '-'}</div>
          </div>
        }
      </div>,
    },
    {
      title: '操作',
      dataIndex: 'button',
      key: 'button',
      align: 'left',
      render: (v, record) => <div className='flex-start'>
        <div className='flex-end' style={{ flexWrap: 'wrap' }}>
          {
            renderStatusButton(record.status, record)
          }
          <Dropdown menu={{ items }} trigger={['click']} placement="bottom">
            <Button className='moreBtn' size='small' onClick={() => variabledRef.current.currentRecord = record}><MoreOutlined /></Button>
          </Dropdown>
        </div>
      </div>,
    },
  ];

  const renderTxt = (v: any) => {
    return <>{v || '-'}</>
  }

  const scheduleChange = (e: any, record: any, index: number) => {
    try {
      (data?.data || [])?.splice(index, 1, {
        ...record,
        loading: true
      });
      const _list = JSON.parse(JSON.stringify(data));
      setListData(_list || []);
      scheduleEnableChange(e, record, query)
    } catch (e) {
      console.log('---scheduleChange', e);
    }
  }

  const Timedcolumns = [
    {
      title: '编译分支',
      dataIndex: 'branch',
      key: 'branch',
      align: 'left',
      render: (v: any, record: any) => <div className='flex-start'>
        {renderColumnBranch(record)}
      </div>,
    },
    {
      title: '代码仓',
      dataIndex: 'repo_name',
      key: 'repo_name',
      align: 'left',
      render: (v: any) => renderTxt(v)
    },
    {
      title: '编译类型',
      dataIndex: 'build_type',
      key: 'build_type',
      align: 'left',
      render: (v: any) => renderTxt(v)
    },
    {
      title: '是否启用',
      dataIndex: 'enable',
      key: 'enable',
      align: 'left',
      render: (v: any, record: any, index: number) => {
        return <Switch checked={v} loading={record.loading} onChange={(e) => { scheduleChange(e, record, index) }} />
      }
    },
    {
      title: '执行时间',
      dataIndex: 'build_type',
      key: 'build_type',
      align: 'left',
      render: (v: any, record: any) => {
        return <>
          {record?.schedule?.hour_minute}
          &nbsp;&nbsp;&nbsp;
          {record?.schedule?.day_of_week?.sort()?.map((item: any, index: number) => {
            return <>
              {weekList[item - 1]?.label}{index + 1 === record?.schedule?.day_of_week?.length ? '' : '、'}
            </>
          })}
        </>
      }
    },
    {
      title: '程序类型',
      dataIndex: 'package_type',
      key: 'package_type',
      align: 'left',
      render: (v: any) => renderTxt(v)
    },
    {
      title: '创建时间',
      dataIndex: 'create_datetime',
      key: 'create_datetime',
      align: 'left',
      render: (v: any) => renderTxt(v)
    },
    {
      title: '最后执行日期',
      dataIndex: 'last_trigger_datetime',
      key: 'last_trigger_datetime',
      align: 'left',
      render: (v: any) => renderTxt(v)
    },
    {
      title: '操作',
      dataIndex: 'button',
      key: 'button',
      align: 'left',
      render: (v: any, record: any) => <div className='flex-start'>
        <Popover content='查看详情'><Button size='small' className='button-item' onClick={() => handleView(record, 'scheduleDetail')}><UnorderedListOutlined /></Button>&nbsp;&nbsp;</Popover>
        {/* <Popconfirm title="确定要删除吗？" onConfirm={() => removeSchedule(record)}  >
          <Popover content='删除'>
            <Button size='small' className='button-item'><DeleteOutlined /></Button>
          </Popover>
        </Popconfirm> */}
      </div>,
    },
  ];

  const formatTime = (time: any) => {
    if (!time) {
      return '-'
    }
    return moment(time).format('YYYY-MM-DD HH:mm')
  }

  const renderTable = () => {
    let _columns: Array<any> = columns;
    tabAction === 4 && (_columns = Timedcolumns)
    return <div className='list-table'>
      <TableComponent data={data} columns={_columns} getData={getData} ref={tableRef} loading={loadingStatusList[tabAction - 1]} current={query.current} pageSize={query.pageSize} setLoading={setLoading} handleRequestParams={handleRequestParams} />
    </div>
  }

  const renderNumber = () => {
    return <></>
    // return <div className='packagingService-list-number flex-center'>
    //   排队数共计 <span>16</span> 位  您在第 <span>5</span> 位
    // </div>
  }

  const renderList = () => {
    // if () {
    //   !showTable
    // }
    // if (tabAction === 1) {
    //   if (showTable) {
    //     return <></>
    //   }
    // }
    return <div>
      {
        tabAction === 3 ? renderNumber() : (tabAction === 4 ? renderSchduleForm() : renderForm())
      }
      {
        renderTable()
      }
    </div>
  }

  return (
    <div className='packagingService-list-container' ref={variabledRef}>
      {/* {
        tabAction === 1 && renderMore()
      } */}
      {/* <AnimationHeight status={!showTable} ref={heightRef}> */}
      {
        renderList()
      }
      {/* </AnimationHeight> */}

    </div>
  );
}

export default forwardRef(Project)
import React, { useEffect, useState, useRef, useReducer } from 'react';
import { Tag, Button, Popover, Switch, message, Dropdown, Tooltip, Select, Checkbox, Radio, Modal } from 'antd'
import { EditOutlined, DeleteOutlined, CopyOutlined, MoreOutlined, RollbackOutlined, LoadingOutlined, CodeOutlined, ExclamationCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import moment from 'moment'

import './style.less'
import { getListApi, getListRecordApi, reDeployApi, getuserList, removeApi } from './service'
import { getUrlParams } from '@/utils'

import List from '@/components/List'
import Detail from './component/detail'
import { handleName } from '@/pages/packagingService/commonComponent'
import { typeMap } from './data'
import { editApi } from './component/detail/service'
import SwitchComponent from './component/switch'
import RemoveComponent from './component/remove'
import LogComponent from './component/log'
import { SetElementLength } from '@/utils/commonComponent'


function Project() {

  const [tableData, setTableData] = useState<any>({})

  const listRef = useRef(null)
  const detailRef = useRef(null)
  const switchRef = useRef(null)
  const removeRef = useRef(null)
  const logRef = useRef(null)
  const [searchData, setSearchData] = useState({ pipelineId: [] })
  const [, forceUpdate] = useReducer(state => state + 1, 0)

  const variableRef = useRef(null)
  const itemData = useRef({})
  const query = getUrlParams()


  useEffect(() => {
    init()
  }, [])

  const init = () => {
    getPipelineList()
  }

  const getPipelineList = async () => {
    try {
      const { data } = await getListApi()
      const options = data.map((item: any) => {
        return {
          label: item,
          value: item
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
        initialValue: undefined
      },
      componentOptions: {
        placeholder: '请输入',
        options: [
          { label: 'Kubernetes', value: 'kubernetes' },
          { label: 'Docker', value: 'docker' },
          { label: 'Openstack 虚拟机', value: 'openstack' },
          { label: '物理机', value: 'metal' },
        ],
      }
    },
    {
      type: 'input',
      form: {
        label: 'IP 地址',
        name: "deploy_host",
      },
      componentOptions: {
        placeholder: '请输入',
      }
    },
    {
      type: 'selectRemote',
      form: {
        label: '创建人',
        name: "creator_id",
      },
      componentOptions: {
        getOptionsList: getuserList,
        placeholder: '请输入',
        style: {
          width: '220px'
        }
      }
    },
    {
      type: 'select',
      form: {
        label: '标签',
        name: "tag_name",
        initialValue: query.pipelineId,
      },

      componentOptions: {
        placeholder: '请输入',
        options: searchData.pipelineId,
      }
    },

  ]

  const getData = async (params: any) => {
    // if (params.tags && params.tags.length > 0) {
    //   params.tags = JSON.stringify(params.tags)
    // }
    params.size = params.pageSize
    params.page_num = params.current

    if (params.enable) {
      params.enable = JSON.parse(params.enable)[0]
    }

    if (params.is_public) {
      params.is_public = JSON.parse(params.is_public)[0]
    }

    if (params.is_online) {
      params.is_online = JSON.parse(params.is_online)[0]
    }

    let { data } = await getListRecordApi(params)
    setTableData({
      data: data.data,
      total: data.total
    })
  }

  const add = () => {
    detailRef.current.open()
  }

  const edit = (record) => {
    detailRef.current.open(record)
  }

  const ssh = (record) => {
    if (!record.ssh || record.type === 'metal') {
      return
    }
    window.open(record.ssh)
  }

  const redeploy = async (record) => {
    if (isRedeployDisabled(record)) {
      return
    }
    try {
      record.redeployLoading = true
      forceUpdate()
      await reDeployApi(record)
      listRef.current.update()
      message.success('部署成功')
    } catch (error) {

    } finally {
      record.redeployLoading = false
      forceUpdate()
    }
  }

  const copy = (record) => {
    detailRef.current.open({ ...record, isCopyButton: true })
  }

  const del = () => {

  }

  const updateList = () => {
    getPipelineList()
    listRef.current.update()
  }

  const openSwtich = (checked, record) => {
    switchRef.current.open(checked, record)
  }


  const isRedeployDisabled = (record) => {
    // enable 是否启用
    // is_online 是否在线
    const { enable, is_online } = record
    return !enable || !is_online
  }

  const remove = (record) => {
    if (record.enable) {
      removeRef.current.open(record)
    } else {
      Modal.confirm({
        title: '节点',
        icon: <ExclamationCircleOutlined />,
        content: '确定删除吗 ?',
        async onOk() {
          await removeApi(record.id)
          message.success('删除成功')
          listRef.current.update()
        },
      });
    }
  }

  const viewLog = (record) => {
    logRef.current.open(record)
  }

  const items: any = [

    {
      key: '1',
      label: (
        <div className='options-item' onClick={() => copy(itemData.current)}>
          <CopyOutlined />&nbsp; 复制
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className='options-item' onClick={() => edit(itemData.current)}>
          <EditOutlined />&nbsp; 编辑
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <Tooltip title={isRedeployDisabled(itemData.current) ? '在线和启用状态可重新部署' : ''}>
          <div className={`options-item ${isRedeployDisabled(itemData.current) ? 'disabled' : ''}`} onClick={() => redeploy(itemData.current)}>
            <RollbackOutlined />&nbsp; 重新部署
          </div>
        </Tooltip>
      ),
    },
    {
      key: '4',
      label: (
        <Tooltip>
          <div className={`options-item ${itemData.current?.type === 'metal' ? 'disabled' : ''}`} onClick={() => ssh(itemData.current)}>
            <CodeOutlined />&nbsp; SSH 登录
          </div>
        </Tooltip>
      ),
    },
    {
      key: '6',
      label: (
        <div className='options-item' onClick={() => viewLog(itemData.current)}>
          <FileTextOutlined />&nbsp; 查看日志
        </div>
      ),
    },
    {
      key: '5',
      label: (
        <div className='options-item' onClick={() => remove(itemData.current)}>
          <DeleteOutlined />&nbsp; 删除
        </div>
      ),
    },
  ];

  const availableColor = (v) => {
    if (v > 0) {
      return '#288759'
    } else if (v === 0) {
      return '#d53200'
    } else {
      return '#f8aa00'
    }
  }

  const columns = [
    // {
    //   title: 'uuid',
    //   dataIndex: 'uuid',
    //   key: 'uuid',
    //   align: 'left',
    // },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      render: (v) => {
        return handleName(v, 10)
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      align: 'left',
      render: (v) => {
        return handleName(v, 15)
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      align: 'left',
      render: (v) => {
        return <>
          {typeMap[v]}
        </>
      }
    },
    {
      title: 'IP 地址',
      dataIndex: 'deploy_host',
      key: 'deploy_host',
      align: 'left',
    },
    {
      title: 'host_name',
      dataIndex: 'hostname',
      key: 'hostname',
      align: 'left',
    },
    {
      title: '空闲',
      dataIndex: 'concurrent',
      key: 'concurrent',
      align: 'left',
      render: (v, record) => {
        if (!record.concurrent) {
          return <></>
        }
        return <>
          <span style={{ color: availableColor(record.is_available) }}>{record.is_available}</span>/<span>{record.concurrent}</span>
        </>
      }
    },
    {
      title: '管理员',
      dataIndex: 'admin_users_info',
      key: 'admin_users_info',
      align: 'left',
      render: (v) => {
        return <div>
          {
            v.map(item => (<div style={{ marginBottom: '5px' }}><Tag>{item.display_name}</Tag></div>))
          }
        </div>
      }
    },
    {
      title: 'tags',
      dataIndex: 'tags',
      key: 'tags',
      align: 'left',
      render: (tags) => {
        return <>
          {tags?.map((item: any, index: number) => (
            <>
              {/* {index !== 0 && '，'} <span key={item}>{item}</span>{ } */}
              <Tag >{item.name}</Tag>
            </>
          ))}
        </>
      }
    },
    {
      title: '是否启用',
      dataIndex: 'enable',
      key: 'enable',
      align: 'left',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Radio.Group
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys([e.target.value])}
          >
            <Radio value={'True'}>启用</Radio>
            <Radio value={'False'}>停止</Radio>
          </Radio.Group>
          <div style={{ marginTop: 8 }} className='flex-space-between'>
            <Button type='text' size='small' onClick={clearFilters}>重置</Button>
            <Button type='primary' size='small' onClick={() => confirm()}>确定</Button>
          </div>
        </div>
      ),
      render: (enable: boolean) => {
        return <>
          {enable ? <Tag color="#2db7f5">
            是
          </Tag> : <Tag color="#cd201f">
            否
          </Tag>}
        </>
      }
    },
    {
      title: '是否公开',
      dataIndex: 'is_public',
      key: 'is_public',
      align: 'left',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Radio.Group
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys([e.target.value])}
          >
            <Radio value={'True'}>公开</Radio>
            <Radio value={'False'}>非公开</Radio>
          </Radio.Group>
          <div style={{ marginTop: 8 }} className='flex-space-between'>
            <Button type='text' size='small' onClick={clearFilters}>重置</Button>
            <Button type='primary' size='small' onClick={() => confirm()}>确定</Button>
          </div>
        </div>
      ),
      render: (is_public: boolean) => {
        return <>
          {is_public ? <Tag color="#2db7f5">
            是
          </Tag> : <Tag color="#cd201f">
            否
          </Tag>}
        </>
      }
    },
    {
      title: '是否在线',
      dataIndex: 'is_online',
      key: 'is_online',
      align: 'left',
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Radio.Group
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys([e.target.value])}
          >
            <Radio value={'True'}>在线</Radio>
            <Radio value={'False'}>离线</Radio>
          </Radio.Group>
          <div style={{ marginTop: 8 }} className='flex-space-between'>
            <Button type='text' size='small' onClick={clearFilters}>重置</Button>
            <Button type='primary' size='small' onClick={() => confirm()}>确定</Button>
          </div>
        </div>
      ),
      render: (is_online: boolean) => {
        return <>
          {is_online ? <Tag color="#2db7f5">
            是
          </Tag> : <Tag color="#cd201f">
            否
          </Tag>}
        </>
      }
    },
    {
      title: '最后联系',
      dataIndex: 'last_seen',
      key: 'last_seen',
      align: 'left',
      render: (v) => {
        return <>
          {v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </>
      }
    },
    {
      title: '原因',
      dataIndex: 'status_change_reason',
      key: 'status_change_reason',
      align: 'left',
      render: (v) => {
        return <div style={{ maxWidth: '200px' }}>
          <SetElementLength text={v}>
            <div>{v || '-'}</div>
          </SetElementLength>
        </div>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
      render: (v) => {
        return <>
          {moment(v).format('YYYY-MM-DD HH:mm:ss')}
        </>
      }
    },
    {
      title: '创建人',
      dataIndex: 'creator_name',
      key: 'creator_name',
      align: 'left',
    },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      align: 'left',
      width: 150,
      fixed: 'right',
      render: (v, record) => (<span className='flex-center'>
        {/* <Popover content='复制' trigger="hover">
          <Button onClick={() => copy(record)} icon={<CopyOutlined />} type='primary' ghost></Button >&nbsp;&nbsp;&nbsp;
        </Popover>
        <Popover content='编辑' trigger="hover">
          <Button onClick={() => edit(record)} icon={<EditOutlined />} type='primary' ghost></Button >&nbsp;&nbsp;&nbsp;
        </Popover> */}
        <Switch checkedChildren="启用" unCheckedChildren="停用" onChange={(checked) => openSwtich(checked, { ...record })} checked={record.enable} />
        &nbsp;&nbsp;&nbsp;
        {/* 更多 */}
        {
          record.redeployLoading
            ?
            <div className='flex-center' style={{ width: '36px', height: '38px' }}>
              <LoadingOutlined style={{ fontSize: '20px', color: '#3c96ff' }} />
            </div>
            :
            <Dropdown menu={{ items }} placement="bottom" arrow overlayClassName="flow-nodeManagement-operate-more" trigger={['click']}>
              <div className='more' onClick={() => {
                itemData.current = record
                forceUpdate()
              }} >
                <Button icon={<MoreOutlined />}></Button>
              </div>
            </Dropdown>
        }
      </span>)
    },
  ]

  return (
    <div className='flow-nodeManagement-container'>
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
        <Button type='primary' onClick={() => add()}>新增</Button>
      </List>

      <Detail ref={detailRef} updateList={updateList} />
      <SwitchComponent ref={switchRef} update={listRef.current?.update} />
      <RemoveComponent ref={removeRef} update={listRef.current?.update} />
      <LogComponent ref={logRef} />
    </div>
  );
}

export default Project
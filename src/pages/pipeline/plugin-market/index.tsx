import React, { lazy, Suspense, useEffect, useState, useRef, useReducer } from 'react';
import { Tabs, Button, Popover, Switch, Modal, message } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading';
import { atoLlist } from './service';
import './style.less';
import ListComponent from '@/components/List'
import {
  PlusOutlined, EditOutlined, ExclamationCircleOutlined, DeleteOutlined, OrderedListOutlined
} from '@ant-design/icons'
import moment from 'moment'
import Detail from './component/detail';
import Unload from './component/unload';
import PluginDetail from './component/pluginDetail'
import { getUrlParams, removeUrlSearchField, replaceURL } from '@/utils'
import { formatTime, isUserAuth, getLocalStorage } from '@/utils'
import { useModel } from 'umi';
import { removeApi } from './service'
import { handleName } from '@/pages/packagingService/commonComponent'
import { SetElementLength } from '@/utils/commonComponent'

const All = lazy(() => import('./component/all'));
const { confirm } = Modal;
let isLoad = true
const PluginMarket: React.FC = (props) => {
  const [tabItems, setTabItems] = useState([]);
  const { type: searchType } = getUrlParams()
  const [type, setType] = useState(searchType || 'all');
  const [switchLoading, setSwitchLoading] = useState(false);

  const [tableData, setTableData] = useState<any>({});

  const [, forceUpdate] = useReducer(state => state + 1, 0)

  const detailRef = useRef(null);
  const unloadRef = useRef(null);
  const listRef = useRef(null);
  const pluginDetailRef = useRef(null);

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  useEffect(() => {
    setTimeout(() => {
      try {

        if (searchType) {
          setType(searchType)
        }
        const params = listRef.current.getQueryParams()
        removeUrlSearchField([...Object.keys({ ...params, ...getUrlParams() })])
      } catch (error) {
        console.log(error)
      }
    }, 100);
  }, [])


  const onChange = (key: string) => {
    listRef.current.setField([{ key: 'name', value: undefined }])
    setType(key);
  };

  const getData = async (params) => {
    console.log(params)
    params.type = type
    params.size = params.pageSize
    params.page_num = params.current
    delete params.pageSize
    delete params.current
    const res = await atoLlist(params)
    const table = res.data.atom_type || []
    res.data = res.data.atom_info || []
    
    setTabItems(table)
    setTableData(res)
  }

  const switchChange = (status, record) => {
    console.log(status)
    record.switchLoading = true
    forceUpdate()
    setTimeout(() => {
      listRef.current.update()
      record.switchLoading = false
    }, 1000);
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
      title: '图标',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => {
        const { version, description, logo_url } = record || {};
        return <div className={'logo'}><img src={logo_url} style={{ width: '30px' }} /></div>
      }
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (v, record) => {
        return <div className='common-link' onClick={() => goDetial(record, 'view')}>
          <SetElementLength text={v}>
            <div>{v}</div>
          </SetElementLength>
        </div>
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      // width: 400,
      render: (v) => {
        return <div >
          <SetElementLength text={v}>
            <div>{v}</div>
          </SetElementLength>
        </div>
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
      title: '创建人',
      dataIndex: 'creator_display_name',
      key: 'creator_display_name',
      render: (text: string, record: any) => {
        return <>
          {text || '-'}
        </>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string, record: any) => {
        return <>
          {moment(record?.created_at).format('YYYY-MM-DD HH:mm:ss')}
        </>
      }
    },
    // {
    //   title: '是否上线',
    //   dataIndex: 'online',
    //   key: 'online',
    //   render: (text: Number, record: any) => {
    //     return <Switch checkedChildren="已上线" unCheckedChildren="已下线" defaultChecked loading={record.switchLoading} onChange={(status) => switchChange(status, record)} />
    //   }
    // },
    {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      width: 160,
      render: (v, record, index) => {
        return <>
          {/* <Button disabled onClick={() => unloadRef.current && unloadRef.current?.setIsModalOpen(true)} >卸载</Button > */}
          <Popover content='查看详情' trigger="hover">
            {/* type='primary' ghost */}
            <Button icon={<OrderedListOutlined />} onClick={() => goDetial(record, 'view')}></Button >
          </Popover>&nbsp;&nbsp;&nbsp;
          <Popover content={`${isUserAuth(currentUser, record?.creator_user_id) ? '编辑' : '暂无权限'}`} trigger="hover">
            {/* type='primary' ghost */}
            <Button type='primary' disabled={!isUserAuth(currentUser, record?.creator_user_id)} ghost icon={<EditOutlined />} onClick={() => goDetial(record)}></Button >
          </Popover>
          &nbsp;&nbsp;&nbsp;
          {
            <Popover content={`${isUserAuth(currentUser, record?.creator_user_id) ? '删除' : '暂无权限'}`} trigger="hover">
              <Button disabled={!isUserAuth(currentUser, record?.creator_user_id)} danger onClick={() => remove(record, index)} icon={<DeleteOutlined />}></Button >
            </Popover>
          }

        </>
      }
    },
  ];

  const remove = (record: any, index: any) => {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: <p>确定删除吗？</p>,
      async onOk() {
        try {
          await removeApi(record.uuid)
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


  const searchOptions: any[] = [
    {
      type: 'input',
      form: {
        label: '插件名称',
        name: "name",
      },
      componentOptions: {
        placeholder: '请输入插件名称',
      }
    },
  ]

  const goDetial = (data: any = {}, from?) => {
    // pluginDetailRef.current.open(data)
    replaceURL({ ...listRef.current.getQueryParams(), type })
    props.history.push(`/FlowLine/pluginMarket/detail?id=${data.uuid || ''}&from=${from || ''}`)
  }


  return <PageContainer>
    <div className={'pluginMarketWrapper'}>
      <Suspense fallback={<PageLoading />}>
        <Tabs
          onChange={onChange}
          defaultActiveKey="all"
          destroyInactiveTabPane={true}
          activeKey={type}
        >
          {(tabItems || []).map((item: any) => {
            return <Tabs.TabPane tab={item?.name} key={item?.type}>
            </Tabs.TabPane>
          })}
        </Tabs>
      </Suspense>
      <ListComponent searchOptions={searchOptions}
        getData={getData}
        data={tableData.data}
        total={tableData.total}
        ref={listRef}
        showTableFilter={false}
        hasNavigation={false}
        columns={columns}>
        <div style={{ position: 'relative' }}>
          <Button type='primary' icon={<PlusOutlined />} onClick={() => goDetial()}>新增</Button>
        </div>
        <br />
      </ListComponent>
      <Detail ref={detailRef} />
      <Unload ref={unloadRef} />
      {/* <PluginDetail ref={pluginDetailRef} tabItems={tabItems} /> */}
    </div>

  </PageContainer>
};

export default PluginMarket;

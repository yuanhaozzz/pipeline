import React, { useEffect, useRef, useState } from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined, PauseCircleOutlined, LoadingOutlined, StopOutlined, CopyOutlined, FieldTimeOutlined, ExclamationCircleOutlined, MinusCircleOutlined, CaretRightOutlined, OrderedListOutlined, DownloadOutlined, PieChartOutlined } from '@ant-design/icons'
import { Button, Tooltip, Tabs, Modal, Popover, message } from 'antd';
import moment from 'moment';

import { tabItems } from './data'
import './style.less'
import { getRecordListApi, retryFailedApi, cancelAllJobApi, getBuildPageDataApi, getTimedRecordListApi, editSchedule, } from './service'

import Empty from './component/empty'
import FirstData from './component/firstData'
import List from './component/list'
import Download from './component/download'
import Share from './component/share'
import ErrorInfo from './component/errorInfo'
import Detail from './component/detail'
import Build from './component/buildComponent'
import Schedule from './component/schedule'
import { setStatistics } from '@/utils/statistics'
import { replaceURL, deepCopy, removeUrlSearchField, getUrlParams } from '@/utils'

import Loading from '@/components/transitionLoading'

import './style.less'
import { useModel } from "@@/plugin-model/useModel";
import { renderIcon, renderStatusText, getPipelineUuid } from './commonComponent'

let timerPackage = null
function Project(props) {
  const query = getUrlParams()
  const [tabAction, setTabAction] = useState<any>(Number(query.tabAction) || 1)
  const [listData, setListData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [buildPackage, setBuildPackage] = useState<any>({})
  const [displayEmpty, setDisplayEmpty] = useState([false, false, false, false])

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;
  const listRef = useRef(null)
  const downloadRef = useRef(null)
  const shareRef = useRef(null)
  const errorInfoRef = useRef(null)
  const detailRef = useRef(null)
  const buildRef = useRef(null)
  const scheduleRef = useRef(null)
  const loadingRef = useRef(null)
  const requestIndex = useRef(0)
  const requestQueue = useRef({})

  useEffect(() => {
    loadingRef.current.open()
    setTimeout(() => {
      loadingRef.current.close()
    }, 1000)
  }, [])

  // useEffect(() => {
  //   repeatTime()
  //   return () => {
  //     clearTimeout(timerPackage)d
  //   }
  // }, [])

  // const repeatTime = async () => {
  //   timerPackage = setTimeout(async () => {
  //     try {
  //       await refreshList()
  //       repeatTime()
  //     } catch (error) {
  //       clearTimeout(timerPackage)
  //     }
  //   }, 10000);
  // }

  useEffect(() => {
    if (query.tabAction) {
      setTabAction(query.tabAction * 1)
    }

  }, [])

  useEffect(() => {

    removeUrlSearchField(['created_at_after', 'created_at_before', 'current', 'pageSize', 'keyword', 'status', 'trigger_by', 'tabAction'])
  }, [])

  useEffect(() => {
    // 页面加载埋点
    // setStatistics({
    //   action_type: 'page',
    //   button_id: ''
    // })
  }, [])

  useEffect(() => {
    getBuildPackageData()
  }, [])

  const getBuildPackageData = async () => {
    const { data } = await getBuildPageDataApi()
    setBuildPackage(data)
  }

  const getTimedRecordList = async (params: any) => {
    setListData([])
    let { data } = await getTimedRecordListApi(params)
    setListData(data)
  }

  const getData = async (param) => {

    requestIndex.current++
    console.log(requestIndex.current, 'add')
    const params = Object.assign({}, param)
    try {
      if (params.date) {
        params.created_at_after = moment(params.date[0]).format('YYYY-MM-DD') + ' 00:00:00'
        params.created_at_before = moment(params.date[1]).format('YYYY-MM-DD') + ' 23:59:59'
        delete params.date
      }
      params.page_num = params.current
      params.size = params.pageSize
      params.pipeline_uuid = getPipelineUuid()
      const tabMap = {
        1: 'my',
        2: 'all',
        3: 'pending',
        4: 'SCHEDULED'
      }
      params.type = tabMap[tabAction]
      delete params.tabAction
      delete params.current
      delete params.pageSize
      if (Object.keys(params).length <= 4) {
        displayEmpty[tabAction - 1] = true
        setDisplayEmpty(displayEmpty)
      }
      if (tabAction === 4) {
        await getTimedRecordList(params)
        return;
      }
      let { data } = await getRecordListApi(params)
      if (Object.keys(params).length <= 4) {
        displayEmpty[tabAction - 1] = data.data.length > 0
        setDisplayEmpty(displayEmpty)
      }
      // // 每调用一次就序号记录
      // requestQueue.current[requestIndex.current] = data
      // // 找出最后一次请求
      // const maxIndex = Math.max(...Object.keys(requestQueue.current).map(item => Number(item)))
      // console.log(maxIndex)
      // setListData(requestQueue.current[maxIndex])
      setListData(data)

    } catch (error) {
    } finally {
      setLoading(false)
      loadingRef.current.close()
    }
  }

  const onChange = (key: string) => {
    setTabAction(Number(key))
  };

  const goFlow = (page = 'modify', record) => {
    let url = `/FlowLine/created/${page}?pipelineId=${getPipelineUuid()}&from=packagingService`
    if (page === 'detail') {
      url += `&triggerId=${record.id}&version=${record.version || ''}`
    }
    window.open(url)
  }

  const handleCancle = (record) => {
    Modal.confirm({
      title: <div style={{ fontWeight: 'bold' }}>取消编译</div>,
      icon: < ExclamationCircleOutlined />,
      content: '取消后编译将中断，中断后无法恢复，需要重新编译，是否确认取消？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await cancelAllJobApi(record.id)
          refreshList()
        } catch (error) {
        }
      }
    });
  }
  const handleRestart = (record) => {
    Modal.confirm({
      title: <div style={{ fontWeight: 'bold' }}>重新编译</div>,
      icon: < ExclamationCircleOutlined />,
      content: '确定要重新编译吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await retryFailedApi(record.id)
          refreshList()
        } catch (error) {
        }
        console.log(record)
      }
    });
  }

  const refreshList = () => {
    listRef.current.handleRequestParams()
  }

  const handleDownload = (record) => {
    const oneDay = 86400 * 1000, nowTime = new Date().getTime(), sevenDayTime = new Date(record?.end_at).getTime() + oneDay * 7;
    if (nowTime > sevenDayTime) {
      Modal.info({
        title: '提醒',
        okText: '确定',
        content: (
          <p>制品包已过期清除，请“复制任务”并重新执行。</p>
        ),
      });
      return;
    }
    downloadRef.current.open(record)
  }

  const handleView = (record, type?: string = 'detail') => {
    // detailRef.current.open(record)
    let params = listRef.current.getQueryValue()
    console.log(params)

    params.tabAction = tabAction
    if (params.date) {
      params.created_at_after = moment(params.date[0]).format('YYYY-MM-DD') + ' 00:00:00'
      params.created_at_before = moment(params.date[1]).format('YYYY-MM-DD') + ' 23:59:59'
      delete params.date
    } else {
      params.created_at_after = ''
      params.created_at_before = ''
    }
    // replaceURL(params)
    window.open(`/packagingService/${type}?id=${record.id}`)
    // props.history.push(`/packagingService/detail?id=${record.id}`)
  }

  const handleCopyTask = (record: any) => {
    buildRef.current.open({
      id: record.id,
      from: 'copyTask'
    })
  }

  const handleSchedule = (record: any) => {
    scheduleRef.current.show(record);
  }

  const removeSchedule = (record: any) => {
    console.log('--removeSchedule', record);
  }

  const scheduleEnableChange = async (checked: boolean, record: any, query: any) => {
    const _timed = {
      enable: checked,
    }
    const { success = false } = await editSchedule({ id: record?.id, pipeline_uuid: getPipelineUuid() }, _timed)
    if (success) {
      message.success('操作成功')
      getData(query)
    }
  }


  const handleCopy = (record) => {
    downloadRef.current.open(record)
  }
  const handleShare = () => {

  }
  const handleError = () => {

  }

  const startBuild = () => {
    setStatistics({
      action_type: 'button',
      button_id: tabAction !== 4 ? '开始编包' : '创建定时任务'
    })
    buildRef.current.open({ setMore: tabAction === 4, isCreated: true })
  }

  const getStatusButtonsConfig = (status, data, from) => {
    switch (status) {
      case 'running':
      case 'pending':
        return [
          {
            type: '',
            labelText: '查看详情',
            ghost: from === 'list' ? false : true,
            onClick: () => handleView(data),
            icon: <OrderedListOutlined />
          },
          ([1, 2].includes(tabAction)) && {
            type: '',
            labelText: '复制任务',
            ghost: from === 'list' ? false : true,
            onClick: () => handleCopyTask(data),
            icon: <CopyOutlined />
          },
          {
            type: '',
            labelText: '取消编译',
            ghost: from === 'list' ? false : true,
            onClick: () => handleCancle(data),
            icon: <i className='iconfont icon-stopcircle iconfont-stopcircle flow-color-running  flex-center' ></i>
          }
        ]
      case 'canceled':
        return [
          {
            type: '',
            labelText: '查看详情',
            ghost: from === 'list' ? false : true,
            onClick: () => handleView(data),
            icon: <OrderedListOutlined />
          },
          ([1, 2].includes(tabAction)) && {
            type: '',
            labelText: '复制任务',
            ghost: from === 'list' ? false : true,
            onClick: () => handleCopyTask(data),
            icon: <CopyOutlined />
          },
          {
            type: 'primary',
            labelText: '重新编译',
            ghost: from === 'list' ? false : true,
            onClick: () => handleRestart(data),
            icon: <CaretRightOutlined />
          }
        ]
      case 'success':
        const successList = [
          {
            type: '',
            labelText: '查看详情',
            ghost: from === 'list' ? false : true,
            onClick: () => handleView(data),
            icon: <OrderedListOutlined />
          },
          ([1, 2].includes(tabAction)) && {
            type: '',
            labelText: '复制任务',
            ghost: from === 'list' ? false : true,
            onClick: () => handleCopyTask(data),
            icon: <CopyOutlined />
          },
          {
            type: '',
            labelText: '立即下载',
            ghost: from === 'list' ? false : true,
            onClick: () => handleDownload(data),
            icon: <DownloadOutlined />
          },
          // {
          //   type: 'primary',
          //   label: '立即分享',
          //   ghost: true,
          //   onClick: () => handleShare(firstData)
          // },
        ]
        if (from !== 'list') {
          successList.unshift({
            type: '',
            labelText: '立即下载',
            ghost: from !== 'list' ? false : false,
            onClick: () => handleDownload(data),
            icon: <DownloadOutlined />
          })
        }
        return successList
      case 'failed':
      case 'timeout':
        return [
          {
            type: '',
            labelText: '查看详情',
            ghost: from === 'list' ? false : true,
            onClick: () => handleView(data),
            icon: <OrderedListOutlined />
          },
          ([1, 2].includes(tabAction)) && {
            type: '',
            labelText: '复制任务',
            ghost: from === 'list' ? false : true,
            onClick: () => handleCopyTask(data),
            icon: <CopyOutlined />
          },
          {
            type: 'primary',
            labelText: '重新编译',
            ghost: from === 'list' ? false : true,
            onClick: () => handleRestart(data),
            icon: <CaretRightOutlined />
          }
        ]
      default:
        return []
    }
  }

  const renderBuildPackagedata = () => {
    return <table>
      <tr align="right">
        <td>来访用户：</td>
        <td><span style={{ color: '#1890ff' }}>{buildPackage.visitor_count}</span> 人</td>
      </tr>
      <tr align="right">
        <td>访问次数：</td>
        <td><span style={{ color: '#1890ff' }}>{buildPackage.visitor_times}</span> 次</td>
      </tr>
      <tr align="right">
        <td>编包用户：</td>
        <td><span style={{ color: '#1890ff' }}>{buildPackage.build_users_count}</span> 人</td>
      </tr>
      <tr align="right">
        <td>编包次数：</td>
        <td><span style={{ color: '#1890ff' }}>{buildPackage.build_times}</span> 次</td>
      </tr>
      <tr align="right">
        <td>出包总量：</td>
        <td><span style={{ color: '#1890ff' }}>{buildPackage.total_package_count}</span> 个</td>
      </tr>
      <tr align="right">
        <td>下载包总数：</td>
        <td><span style={{ color: '#1890ff' }}>{buildPackage.total_package_download_times}</span> 次</td>
      </tr>
    </table>
  }


  const renderTab = () => {
    return <div className='packagingService-header flex-space-between'>
      {/* 左侧按钮 */}
      <div className='packagingService-header-left flex-start'>
        <div>
          <Button type='primary' onClick={() => startBuild()}>{tabAction !== 4 ? '开始编包' : '创建定时任务'}</Button>
          {/* <p className='left-button-description'></p> */}
        </div>
        &nbsp;&nbsp;
        {tabAction !== 4 && <Tooltip title="支持全量和模块化的编包功能，信息可留存7天" placement="right">
          <QuestionCircleOutlined className='left-icon' style={{ fontSize: '16px', marginTop: '8px' }} />
        </Tooltip>}
      </div>
      {/* Tab */}
      <div className='packagingService-header-center'>
        <Tabs items={tabItems} onChange={onChange} activeKey={tabAction} />
      </div>
      {/* 右侧参数设置 */}
      <div >
        <Popover content={renderBuildPackagedata()}>
          <Button style={{ marginRight: currentUser.is_superuser ? '0' : '23px' }} icon={<PieChartOutlined style={{ fontSize: '15px' }} />} onMouseEnter={() => getBuildPageDataApi()}></Button>&nbsp;&nbsp;&nbsp;
        </Popover>
        {
          currentUser.is_superuser && <>
            <Button type='primary' ghost onClick={() => goFlow()}>参数设置</Button>
          </>
        }
      </div>

    </div>
  }

  const renderMyFirstData = () => {
    return <FirstData handleCancle={handleCancle} handleRestart={handleRestart} handleDownload={handleDownload} handleView={handleView} handleCopy={handleCopy} handleShare={handleShare} handleError={handleError} renderIcon={renderIcon} renderStatusText={renderStatusText} getStatusButtonsConfig={getStatusButtonsConfig} getProgress={getProgress} refreshList={refreshList} />
  }



  return (
    <div className='packagingService-container replace-font-size-12'>
      <Loading ref={loadingRef} />
      <div style={{ display: loading ? 'none' : 'block' }}>
        {renderTab()}
        {/* 空UI */}
        {
          (!displayEmpty[tabAction - 1]) && ![2, 4].includes(tabAction) && <Empty type={tabAction} startBuild={startBuild} />
        }
        <div style={{ display: (displayEmpty[tabAction - 1] || [2, 4].includes(tabAction)) ? 'block' : 'none' }}>
          <List handleCancle={handleCancle} handleRestart={handleRestart} handleDownload={handleDownload} handleView={handleView} handleCopy={handleCopy} handleShare={handleShare} handleError={handleError} handleSchedule={handleSchedule} data={listData} setListData={setListData} getData={getData} renderIcon={renderIcon} renderStatusText={renderStatusText} ref={listRef} tabAction={tabAction} getStatusButtonsConfig={getStatusButtonsConfig} refreshList={refreshList} removeSchedule={removeSchedule} scheduleEnableChange={scheduleEnableChange} />
        </div>
      </div>
      <Download ref={downloadRef} />
      <Share ref={shareRef} />
      <ErrorInfo ref={errorInfoRef} />
      <Build ref={buildRef} getPipelineUuid={getPipelineUuid} refreshList={refreshList} setTabAction={setTabAction} tabAction={tabAction} />
      <Schedule ref={scheduleRef} getPipelineUuid={getPipelineUuid} refreshList={refreshList} setTabAction={setTabAction} />
      <Detail ref={detailRef} renderIcon={renderIcon} renderStatusText={renderStatusText} goFlow={goFlow} handleCancle={handleCancle} handleRestart={handleRestart} handleDownload={handleDownload} handleView={handleView} handleCopy={handleCopy} handleShare={handleShare} handleError={handleError} renderStatusText={renderStatusText} getStatusButtonsConfig={getStatusButtonsConfig} refreshList={refreshList} getPipelineUuid={getPipelineUuid} />
    </div >
  );
}

export default Project
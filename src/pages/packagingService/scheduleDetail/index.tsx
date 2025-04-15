import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Tabs, Button, Modal, } from 'antd'
import { LeftCircleOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons'
import { copyText, getUrlParams } from '@/utils'
import { getPipelineUuid, } from '../commonComponent'
import { getScheduleDetail, } from '@/pages/packagingService/service'
import { PageContainer } from '@ant-design/pro-layout';
import CommonLoading from '@/components/transitionLoading'
import Build from '@/pages/packagingService/component/buildComponent'
import Download from '../component/download'
import Info from './component/info'
import History from './component/history'
import Mode from './component/mode'
import '../detail/style.less'
import './style.less'

function Project(props: Props) {
  const [progressInfo, setProgress] = useState<any>({ progress: [] })
  const progress = progressInfo.progress
  const { status: status } = progressInfo
  const [row, setRow] = useState([])
  const [currentTab, setCurrentTab] = useState('1')
  const query: any = getUrlParams()
  const downloadRef = useRef(null)
  const loadingRef = useRef(null)
  const buildRef = useRef(null)
  const modeRef = useRef(null)

  useEffect(() => {
    loadingRef.current.open()
    getProgress()
  }, [])

  useEffect(() => {
    handleOptions()
  }, [progressInfo])

  const getProgress = async () => {
    try {
      const id = query.id
      const { data } = await getScheduleDetail({ id, pipeline_uuid: getPipelineUuid() })
      setProgress(data)
      setTimeout(() => {
        loadingRef.current?.close()
      }, 0);
    } catch (error) {
      loadingRef.current?.close()
    }
  }

  const editSchedule = () => {
    buildRef.current.open({
      setMore: true,
      from: 'scheduleDetail',
      id: query.id,
      cb: getProgress
    })
  }

  const saveSchedule = async () => {
    modeRef.current.saveSchedule()
  };

  const handleOptions = () => {
    const options = progressInfo.options || []
    const first = options.slice(0, 2)
    const fieldTextList = [
      [
        { name: '代码仓', value: 'project_path', isCopy: false, isSelf: true },
        { name: '分支/Patchset/Tag', value: 'branch', isCopy: false, isSelf: true },
        // { name: '组件包', value: 'components', isCopy: false, isSelf: true },
      ],
      [
        { name: 'CommitId', value: 'after_sha', isCopy: true, isSelf: true },
      ]
    ]
    fieldTextList[1].push(...first)
    if (options.length > 2) {
      const values = options.slice(2, options.length)
      const row = Math.ceil(values.length / 4)
      for (let i = 0; i < row; i++) {
        fieldTextList.push([
          ...values.slice(i * 4, i * 4 + 4)
        ])
      }
    }
    setRow(fieldTextList)
  }

  const handlePackageType = (v) => {
    let value = v || '-'
    if (Array.isArray(v)) {
      value = value.join(',')
    }
    return value
  }

  const formatTime = (date = '2023/09/19 16:00') => {
    let time = progressInfo.duration
    if (status === 'running') {
      const startTime = new Date(date).getTime()
      let nowTime = new Date().getTime()
      time = (nowTime - startTime) / 1000
    }
    return time
  }

  const renderBack = () => {
    return <div className='back'>
      <span className='back-button' onClick={() => props.history.goBack()}>
        <LeftCircleOutlined style={{ fontSize: '14px' }} /> 返回列表
      </span>
    </div>
  }

  const handleDownload = (record) => {
    const oneDay = 86400 * 1000, nowTime = new Date().getTime(), sevenDayTime = new Date(record?.end_at).getTime() + oneDay * 7;
    if (!!record?.end_at && nowTime > sevenDayTime) {
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

  const tabBarExtraContent = useMemo(() => {
    return <>
      {currentTab === '1' && <div><Button type='primary' onClick={editSchedule}><EditOutlined /> 编辑</Button></div>}
      {currentTab === '2' && <div><Button type='primary' onClick={saveSchedule}><SaveOutlined /> 保存</Button></div>}
    </>
  }, [currentTab])

  const changeTab = (value: any) => {
    setCurrentTab(value)
  }

  const tabList = [
    {
      label: `基本信息`,
      key: '1',
      children: <Info row={row} progressInfo={progressInfo} handleDownload={handleDownload} copyText={copyText} query={query} getProgress={getProgress} />
    },
    {
      label: `执行方式`,
      key: '2',
      children: <Mode ref={modeRef} progressInfo={progressInfo} query={query} getProgress={getProgress} />
    },
    {
      label: `执行历史`,
      key: '3',
      children: <History progressInfo={progressInfo} handleDownload={handleDownload} copyText={copyText} query={query} />
    },
  ]

  const renderTab = () => <Tabs defaultActiveKey="1" items={tabList} onChange={changeTab} tabBarExtraContent={tabBarExtraContent} destroyInactiveTabPane={true} />

  const renderLoading = () => {
    return <CommonLoading ref={loadingRef} />
  }

  const renderDownload = () => {
    return <Download ref={downloadRef} />
  }

  return (
    <PageContainer>
      {renderLoading()}
      {
        progressInfo.id && <div className='packagingService-schedule-detail-container replace-font-size-12'>
          {/* {renderBack()} */}
          {renderTab()}
          {renderDownload()}
        </div>
      }
      <Build ref={buildRef} getPipelineUuid={getPipelineUuid} refreshList={() => { }} setTabAction={() => { }} tabAction={0} />
    </PageContainer>
  );
}

export default Project
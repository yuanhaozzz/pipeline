import React, { useEffect, useState, useReducer, useRef } from 'react';
import { Empty, Button, Row, Col, Tooltip, Popover, Tabs, Tag } from 'antd'
import { PlusOutlined, ApartmentOutlined, MoreOutlined, CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined, PauseCircleOutlined, LoadingOutlined, StopOutlined, CopyOutlined, SyncOutlined, LeftCircleOutlined, DownloadOutlined } from '@ant-design/icons'
import './style.less'

import { copyText, formatHourText, getUrlParams } from '@/utils'
import moment from 'moment';

import StepsComponent from '../component/steps'
import { renderIcon, renderStatusText, getPipelineUuid, getStatusButtonsConfig } from '../commonComponent'
import { getLatestBuildApi } from './service'
import { PageContainer } from '@ant-design/pro-layout';
import CommonLoading from '@/components/transitionLoading'
import { renderColumnBranch, renderTriggerIcon } from '@/pages/packagingService/commonComponent'
import Download from '../component/download'

interface Props {

}
let timer: any = null
function Project(props: Props) {

  const [progressInfo, setProgress] = useState<any>({ progress: [] })

  const progress = progressInfo.progress
  const { status: status } = progressInfo

  const [row, setRow] = useState([])
  const query: any = getUrlParams()
  const downloadRef = useRef(null)

  const loadingRef = useRef(null)

  useEffect(() => {
    loadingRef.current.open()

    getProgress()
  }, [])

  useEffect(() => {
    if (progressInfo.progress.length > 0) {
      computedTime()
    }

    handleOptions()
  }, [progressInfo])

  useEffect(() => {
    return () => {
      clearTimeout(timer)
    }
  }, [])

  const getProgress = async () => {
    const id = query.id
    const { data } = await getLatestBuildApi(id)
    setProgress(data)
    setTimeout(() => {
      if (loadingRef.current) {
        loadingRef.current.close()
      }
    }, 0);
  }

  const refreshList = () => {

  }

  const handleOptions = () => {
    const options = progressInfo.options || []
    const first = options.slice(0, 2)
    const fieldTextList = [
      [
        { name: '代码仓', value: 'project_path', isCopy: false, isSelf: true },
        { name: '分支/Patchset/Tag', value: 'branch', isCopy: false, isSelf: true },
        { name: '组件包', value: 'components', isCopy: false, isSelf: true },
        { name: '编包数量', value: 'artifact_num', isCopy: false, isSelf: true },
      ],
      [
        { name: '包名称', value: 'artifact_names', isCopy: false, isSelf: true },
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

  const computedTime = () => {
    if (timer && progressInfo.progress_step !== 1) {
      clearTimeout(timer)
      refreshList()
    }
    clearTimeout(timer)
    timer = null
    // 进度条在编译中，同时状态时running时 启动计时器
    if (progressInfo.progress_step === 1) {
      if (timer) {
        return
      }
      repeatTime()
    } else {
      timer = null
      clearTimeout(timer)
    }
  }

  const repeatTime = async () => {
    timer = setTimeout(async () => {
      try {
        await getProgress()
        repeatTime()
      } catch (error) {
        clearTimeout(timer)
      }
    }, 1000);
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

  const viewLog = () => {
    let url = `/FlowLine/created/detail/${progressInfo.uuid}/${progressInfo.run_iid}?from=packagingService`
    window.open(url)
  }

  const renderBack = () => {
    return <div className='back'>
      <span className='back-button' onClick={() => props.history.goBack()}>
        <LeftCircleOutlined style={{ fontSize: '14px' }} /> 返回列表
      </span>
    </div>
  }

  const renderTab = () => {
    return <div className='tab-container '>
      {/* <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: `基本信息`,
            key: '1',
          },
        ]}
      /> */}
      基本信息
      <Button type='primary' ghost className='view-log' onClick={viewLog}>查看日志</Button>
    </div>
  }

  // const renderStatusButton = () => {
  //   return <>
  //     {
  //       getStatusButtonsConfig(status, firstData).map((button, index) => (
  //         <Button className='button-item' {...button} key={index}>{button.label}</Button>
  //       ))
  //     }
  //   </>
  // }

  const renderBuildName = (v) => {
    if (v === '-') {
      return v
    }
    const list = v.split(',')
    return <>
      {
        list.map(tag => (
          <Tag>{tag}</Tag>
        ))
      }
      <Popover content="立即下载">
        <Button icon={<DownloadOutlined />} size='small' onClick={() => handleDownload(progressInfo)}></Button>
      </Popover>

    </>
  }


  const handleDownload = (record) => {
    downloadRef.current.open(record)
  }

  const renderHeader = () => {
    return <div className='packagingService-firstData-header flex-start'>
      <div className='flex-start'>
        <div className='header-status flex-start'>
          {/* 状态图标 */}
          <div className='status-icon flex-center'>
            {renderIcon(status)}
          </div>
          {/* 状态名称 */}
          <div className='header-status-text'>
            {renderStatusText(status)}
          </div>
          {/* 按钮 */}
          {/* <div className='header-status-button flex-start'>
            {renderStatusButton()}
          </div> */}
        </div>
      </div>
      <p className='header-time'>{renderDurationText()}</p>
    </div>
  }

  const renderDurationText = () => {
    let text = `编包时长${formatHourText(progressInfo.duration || 0)}`
    if (status === 'running') {
      text = `预计编包时长${formatHourText(progressInfo.estimated_duration || 0)}`
    }
    return text
  }

  const renderRepoName = () => {
    return <div className='flex-start'>
      {progressInfo.project_path && renderTriggerIcon(progressInfo.http_url?.includes('gerrit') ? 'gerrit' : '')}&nbsp;
      <div style={{ textAlign: 'left' }}>
        <div >{progressInfo.project_path || '-'}</div>
      </div>
    </div>
  }

  const renderFieldText = () => {
    return <div className='packagingService-firstData-firld-text'>
      <div className='text-title'>配置信息</div>
      <table className='packagingService-firstData-firld'>
        {
          row.map((col, index) => (
            <>
              {
                col.map((field, index) => {
                  let { name, value, isCopy, isSelf } = field
                  let v = progressInfo[value] || '-'
                  if (value === 'artifact_names') {
                    v = v === '-' ? [] : v
                    v = v.join(',') || '-'
                  }
                  if (!isSelf) {
                    v = value || '-'
                  }
                  if (name === '包类型') {
                    if (Array.isArray(v)) {
                      v = v.join(',')
                    }
                  }
                  if (name === '分支/Patchset/Tag') {
                    v = renderColumnBranch(progressInfo)
                  }
                  if (name === '代码仓') {
                    v = renderRepoName()
                  }
                  if (name === '包名称') {
                    v = renderBuildName(v)
                  }
                  return <tr key={index} className='firstData-firld-container'>
                    <td className='name' align='right'>{name}：</td>
                    <td className='value'>
                      {v}
                      {/* 复制按钮 */}
                      {
                        isCopy && (v && v !== '-') && <CopyOutlined className='copy' onClick={() => copyText(v)} />
                      }
                    </td>
                  </tr>
                })
              }
            </>
          ))
        }
      </table>
    </div>
  }

  const renderStep = () => {
    if (progress.length <= 0) {
      return <></>
    }
    // 处理步骤条数据
    const stepItem = []
    stepItem.push({
      status: progress[0].status,
      title: progress[0].name,
      descriptionFirst: `当前第 ${progress[0].number || 0} 位`,
      // descriptionFirst: ``,
      // descriptionSecond: moment(progress[0].started_at).format('YYYY-MM-DD HH:mm'),
      descriptionSecond: progress[0].started_at ? moment(progress[0].started_at).format('YYYY-MM-DD HH:mm') : '',
      // icon: renderStepIcon(progress[0].status)
    })
    stepItem.push({
      status: progress[1].status,
      title: progress[1].name,
      descriptionFirst: `${progress[1].started_at ? `耗时：${formatHourText(formatTime(progress[1].started_at))}` : ''}`,
      descriptionSecond: progress[1].started_at ? moment(progress[1].started_at).format('YYYY-MM-DD HH:mm') : '',
      // icon: renderStepIcon(progress[1].status)
    })
    stepItem.push({
      status: progress[2].status,
      title: progress[2].name,
      descriptionFirst: `成功 ${progressInfo.artifact_num || 0}`,
      // descriptionFirst: `成功 ${progress[2].success}，失败 ${progress[2].failed}`,
      descriptionSecond: progress[2].started_at ? moment(progress[2].started_at).format('YYYY-MM-DD HH:mm') : '',
      // icon: renderStepIcon(progress[2].status)
    })

    const customDot = (dot, { status, index }) => (
      <>
        {dot}
      </>
    );

    return <div className='packagingService-firstData-step-container'>
      <div className='packagingService-firstData-step'>
        <StepsComponent
          current={progressInfo.progress_step}
          items={stepItem.map((item, index) => {
            const { title, descriptionFirst, descriptionSecond, status, icon } = item
            return {
              title,
              description: <div style={{ fontSize: '12px' }} key={index}>
                <div className={index === progressInfo.progress_step ? 'highlight' : ''}>{descriptionFirst}</div>
                <div>{descriptionSecond}</div>
              </div>,
            }
          })
          }
        />
        {/* <Steps
        current={progressInfo.progress_step}
        // size='small'
        progressDot={customDot}
        items={stepItem.map((item, index) => {
          const { title, descriptionFirst, descriptionSecond, status, icon } = item
          return {
            title,
            description: <div style={{ fontSize: '12px' }} key={index}>
              <div className={status === 'running' ? 'highlight' : ''}>{descriptionFirst}</div>
              <div>{descriptionSecond}</div>
            </div>,
          }
        })
        }
      /> */}
      </div>
    </div>
  }

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
        progressInfo.id && <div className='packagingService-new-detail-container replace-font-size-12'>
          {/* {renderBack()} */}
          {renderTab()}
          {renderHeader()}
          {renderStep()}
          {renderFieldText()}
          {renderDownload()}
        </div>
      }
    </PageContainer>
  );
}

export default Project
import React, { Fragment, useEffect, useRef } from 'react';
import { CloseOutlined, LoadingOutlined, CheckCircleOutlined, StopOutlined, MoreOutlined, SmileOutlined, PlayCircleOutlined, CaretRightOutlined, SyncOutlined, DownOutlined, UpOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Dropdown, Tooltip, Popover } from 'antd'

import './style.less'
import { send } from './service'
import { formatHour, copyText } from '@/utils'

import { setTimer } from '../../data'
import { useReducer } from 'react';
import { typeMap } from './data'

import { SetElementLength } from '@/utils/commonComponent'
import { CopyIcon } from '@/utils/commonComponent'

interface Props {
  // 1 新增/编辑 2 预览 3 执行
  type: 1 | 2 | 3
  jobs: any
  stageIndex: number
  renderStep(tasks: any, jobIndex: number, stageIndex: number, job: any, stageList: any): any
  addJob(e: any, type: number, stageIndex: number, jobIndex?: number, job?: any): void
  showConfigDetail(e: any, stage: any): void
  deleteJob(e: any, stageIndex: number, jobIndex: number): void
  renderExecStatusClassName(status: any): any
  handleJobCanceled(e: any, jobParam: any): any
  handleJobSkipped(e: any, jobParam: any): any
  handleJobManual(e: any, jobParam: any): any
  stageList: any
  retryServer(e: any, jobParam: any, status?: string): any
  update(): any
  handleShowJob(data): any
}
let jobDragElement = null
let jobDragStartY = 0
let oldDragBox = null
let isStepDragStart = false
function Project(props: Props) {
  const { jobs, showConfigDetail, addJob, renderStep, stageIndex, deleteJob, type, renderExecStatusClassName, stageList, handleJobCanceled, retryServer, handleJobSkipped, handleJobManual, update: parentUpdate, handleShowJob } = props

  const variableRef = useRef<any>({})

  const [, update] = useReducer(state => state += 1, 0)

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [])

  const clearTimer = () => {
    if (type === 3) {
      stageList.forEach((stage: any) => {
        stage.jobs.forEach((job: any) => {
          clearTimeout(job.timer)
          job.tasks.forEach(task => {
            clearTimeout(task.timer)
          })
        })
      })
    }
  }

  const renderRightLine = () => {
    if (stageIndex === stageList.length - 1) {
      if (type !== 1) {
        return <></>
      }
    }
    return <>
      {/* 右点 */}
      <div className='job-right-point other-right-point-common'></div>
      {/* 右线 */}
      <div className='job-right-line job-line'></div>
    </>
  }

  const renderFirstLine = (stageIndex: any, jobIndex: number) => {
    if (jobIndex !== 0) {
      return
    }
    return (
      <>
        {
          stageIndex !== 0 && jobIndex === 0 && <>
            {/* 左箭头 */}
            <div className='job-left-arrow first-left-arrow'>
              <CaretRightOutlined className='icon' />
            </div>
            {/* 左线 */}
            <div className='job-left-line job-line'></div>
          </>
        }
        {renderRightLine()}
      </>
    )
  }

  const renderOtherRightLine = () => {
    if (stageIndex === stageList.length - 1) {
      if (type !== 1) {
        return <></>
      }
    }
    return <>
      {/* 右点 */}
      <div className='other-right-point other-right-point-common'></div>
      {/* 右线 */}
      <div className='other-right-line job-line'></div>
    </>
  }

  const renderOtherLine = (job, stageIndex, jobIndex) => {
    if (jobIndex === job.length - 1) {
      return
    }
    return (
      <>
        {
          stageIndex !== 0 && <>
            {/* 左线 */}
            <div className='job-line other-left-line'></div>
          </>
        }
        {
          renderOtherRightLine()
        }
      </>
    )
  }

  const renderMore = (job: any) => {
    let items: any = [];
    switch (job.status) {
      case 'running':
        items = [
          {
            key: '1',
            label: (
              <div onClick={(e: any) => handleJobSkipped(e, job)}>
                <i className='iconfont icon-tiaoguofenxiang' style={{ fontSize: '17px' }}></i> 跳过
              </div>
            ),
          },
          {
            key: '2',
            label: <div onClick={(e: any) => handleJobCanceled(e, job)}>
              <StopOutlined /> &nbsp;取消
            </div>
          }
        ]
        break
      case 'canceled':
      case 'failed':
      case 'timeout':
      case 'timeout':
      case 'success':
        items = [
          {
            key: '3',
            label: (
              <div onClick={(e: any) => retryServer(e, job)}>
                <SyncOutlined /> &nbsp;重试
              </div>
            ),
          }
        ]
        break
      case 'skipped':
        items = [
          {
            key: '4',
            label: (
              <div onClick={(e: any) => retryServer(e, job, 'skipped')}>
                <SyncOutlined /> &nbsp;重试
              </div>
            ),
          }
        ]
        break
      default:
        return <></>
    }
    return (
      <>
        <Dropdown menu={{ items }} overlayClassName="job-more-dropdown">
          <Button type="text" className='detail-retry-op-more' icon={<MoreOutlined />} onClick={(e: any) => e.stopPropagation()}></Button>
        </Dropdown>
      </>
    )
  }

  const filterIndex = (v) => {
    return v.split('-')
  }

  const onDragStart = (e: Event) => {
    e.stopPropagation()
    isStepDragStart = true
    const target: any = e.target
    oldDragBox = target.parentNode
    target.style.opacity = '.3'
    jobDragElement = target
    jobDragStartY = e.clientX
  }

  const onDragEnd = (e: any) => {
    e.stopPropagation()
    isStepDragStart = false
    const { clientY } = e
    const target = e.target
    target.style.opacity = '1'

    const startIndex = target.dataset.currentIndex
    const [stagIndex, jobIndex] = filterIndex(startIndex)
    let location = []

    let insetData = target.previousElementSibling

    if (insetData) {
      insetData = target.previousElementSibling
      location = filterIndex(insetData.dataset.currentIndex)
      // 同组处理
      if (stagIndex === location[0]) {
        if (jobDragStartY > clientY) {
          location[1] = location[1] * 1 + 1
        }
      } else {
        location[1] = location[1] * 1 + 1
      }
      const len = stageList[location[0]].jobs.length - 1

      if (location[1] * 1 === len) {
        location[1] = len + 1
      }
    } else {
      insetData = target.nextElementSibling
      location = filterIndex(insetData.dataset.currentIndex)
      location[1] = 0
    }

    const moveEl = stageList[stagIndex].jobs.splice(jobIndex, 1)

    stageList[location[0]].jobs.splice(location[1], 0, moveEl[0])

    // 删除拖拽
    if (stagIndex !== location[0]) {
      target.parentNode.removeChild(target)
      oldDragBox.insertBefore(jobDragElement, oldDragBox.firstChild);
    }

    // 没有job 删除Stag
    if (stageList[stagIndex].jobs.length <= 0) {
      stageList.splice(stagIndex, 1)
    }

    jobDragStartY = clientY
    update()
    parentUpdate()
  }

  const onDragEnter = (e: any) => {
    e.stopPropagation()
    e.preventDefault();
    if (!isStepDragStart) {
      return
    }
    const { clientY } = e
    const target = e.target.closest('.job-item');
    if (jobDragElement) {
      if (target && target.dataset.id !== jobDragElement.dataset.id) {
        let container = target.closest('.jobs-box');
        if (container) {
          if (jobDragStartY > clientY) {
            container.insertBefore(jobDragElement, target);
          } else {
            container.insertBefore(jobDragElement, target.nextElementSibling);
          }
          jobDragStartY = clientY
        }
      }
    }
  }

  const onDragLeave = () => {
  }

  const handleType = (status) => {
    let text = '申请中'
    switch (status) {
      case 'pending':
        text = '待创建'
        break
      case 'progress':
        text = '创建中'
        break
      case 'created_failed':
        text = '创建失败'
        break
      case 'destroyed_failed':
        text = '销毁失败'
        break
      case 'running':
        text = '使用中'
        break
      case 'destroyed':
        text = '已销毁'
        break
      default:
        text = ''
    }
    return text
  }

  const renderServerPopover = (job, text, vmInfo) => {
    const vm = job.vm_info
    return <div style={{ width: '200px' }} className='flow-job-server-popover-container'>
      {
        vmInfo?.items.map(item => (
          <div style={{ marginBottom: '10px' }} >
            <div className='flex-space-between'>
              <div style={{ fontWeight: "bold" }}> {typeMap[item.type]}</div>
            </div>
            {
              type === 3 && <>
                {/* 状态 */}
                <div className='flex-start'>
                  <span style={{ color: '#7f7f7f', fontWeight: 'bold' }}>状态：</span>
                  <div className={`server-status-${item.status}`}>
                    <span className='text'>{handleType(item.status)}</span>
                  </div>
                </div>
                {/* 失败原因 */}
                {
                  item.failure_reason && <div style={{ wordBreak: 'break-all' }}>
                    <span style={{ color: '#7f7f7f', fontWeight: 'bold' }}>失败原因：</span>{item.failure_reason || ' '}&nbsp;<CopyIcon text={item.failure_reason} />
                  </div>
                }
                {/* 可用区 */}
                {
                  item.zone && <div style={{ wordBreak: 'break-all' }}>
                    <span style={{ color: '#7f7f7f', fontWeight: 'bold' }}>可用区：</span>{item.zone || ' '}&nbsp;<CopyIcon text={item.zone} />
                  </div>
                }
                {/* 规格 */}
                {
                  item.config_name && <div style={{ wordBreak: 'break-all' }}>
                    <span style={{ color: '#7f7f7f', fontWeight: 'bold' }}>规格：</span>{item.config_name || ' '}&nbsp;<CopyIcon text={item.config_name} />
                  </div>
                }
                {/* 节点 Tag */}
                {
                  item.name && <div style={{ wordBreak: 'break-all' }}>
                    <span style={{ color: '#7f7f7f', fontWeight: 'bold' }}>节点 Tag：</span>{item.name || ' '}&nbsp;<CopyIcon text={item.name} />
                  </div>
                }
              </>
            }
          </div>
        ))
      }
    </div>
  }

  const renderServerStatus = (job) => {
    const vmInfo = job?.mixed_info
    if (!vmInfo || job?.agent_type !== 'mixed') {
      return <></>
    }

    const status = vmInfo.status || (job.agent_type === 'mixed' && type !== 1 && 'pending') || ''
    // const status: any = 'failed'
    let text = handleType(status)
    if (!text) {
      return <></>
    }
    const el = <div className={`job-server-status-container server-status-${status}`} onClick={(e) => e.stopPropagation()}>
      <Popover placement="top" content={renderServerPopover(job, text, vmInfo)} trigger="hover">
        <div className={`img-box flex-center`}>
          <i className='iconfont icon-xuniji img'></i>
          {
            status === 'progress' && <div className='animation-line'></div>
          }
          {
            (status === 'created_failed' || status === 'destroyed_failed') && <div className='failed-text'>！</div>
          }
        </div>
        <div className='text'>{text}</div>
        {
          stageIndex === 0 && <div className={`first-line-box first-line-${type}`}>
            {/* 线 */}
            <div className='first-line'></div>
            {/* 三角 */}
            <div className='first-arrow'><CaretRightOutlined className='icon' /></div>
          </div>
        }
      </Popover>

    </div>

    return el
  }

  const renderItem = (job: any, jobIndex: number) => {
    setTimer(job, update, type)
    return (
      <>
        <div className='item-container'>
          <div style={{ position: 'relative' }}>
            {/* 左箭头 */}
            {
              stageIndex !== 0 && < div className='job-left-arrow other-left-arrow'>
                <CaretRightOutlined className='icon' />
              </div>
            }
            {/* {
              job.cloned && <div className='job-item-detail-cloned-el'>
                Dynamic
              </div>
            } */}
            {/* 机器申请状态 */}
            {renderServerStatus(job)}
            <h3 className={`job-item-detail flex-start ${job.cloned && 'job-item-detail-cloned'}`}>
              <div className='flow-mark-job'>Job</div>
              {/* 等待 */}
              {
                (job.status === 'pending' || !job.status) && <>
                  {/* 顺序 */}
                  <span className='detail-num flex-center'>{stageIndex + 1}-{jobIndex + 1}</span>
                </>
              }
              {
                (job.status === 'pending' || !job.status) && job.trigger_type === 'MANUAL' && <Tooltip title="手动触发">
                  <div className='flex-center job-item-manual-type'>
                    <CaretRightOutlined onClick={(e) => handleJobManual(e, job)} />
                  </div>
                </Tooltip>
              }
              {
                type === 3 && job.status !== 'pending' && <div className='detail-left-box'>
                  {/* 进行中 */}
                  {
                    job.status === 'running' && <div className='detail-runing flex-center'><LoadingOutlined />&nbsp;&nbsp;</div>
                  }

                  {/* 成功 */}
                  {
                    job.status === 'success' && <div className='detail-success flex-center animation-success'>
                      <i className='iconfont icon-success-fill success-icon'></i>
                      &nbsp;&nbsp;
                    </div>
                  }
                  {/* 失败 和 超时 */}
                  {
                    (job.status === 'failed' || job.status === 'timeout') && <div className='detail-failed flex-center'>
                      <i className='iconfont icon-error-fill success-icon'></i>
                      &nbsp;&nbsp;
                    </div>
                  }
                  {/* 取消 */}
                  {
                    (job.status === 'canceled') && <div className='detail-canceled flex-center'>
                      {
                        job?.fast_fail_cancel
                          ? <Tooltip title="FastFail">
                            <InfoCircleOutlined style={{ marginTop: '3px', fontSize: '16px' }} />
                          </Tooltip>
                          :
                          <StopOutlined style={{ marginTop: '3px', fontSize: '16px' }} />
                      }
                      &nbsp;&nbsp;
                    </div>
                  }
                  {/* 跳过 */}
                  {
                    (job.status === 'skipped') && <div className='detail-canceled flex-center'>
                      <i className='iconfont icon-tiaoguofenxiang success-icon'></i>&nbsp;&nbsp;
                    </div>
                  }
                </div>
              }

              {/* job名称 */}
              <div className='detail-name'>
                {/* <Tooltip placement="topLeft" title={job.name}></Tooltip> */}
                <SetElementLength text={job.name}>
                  <div>{job.name}</div>
                </SetElementLength>
              </div>
              {
                renderMore(job)
              }
              {/* 危险图标 */}
              {
                type === 1 && job.vaildFormError && <>
                  <div className='operate-danger flex-center'>
                    <i className='iconfont icon-weixian'></i>
                  </div>&nbsp;
                </>
              }

              {/* 用时 */}
              {
                (job.status && job.status !== 'pending') && <div className='detail-time'>{formatHour(job.localDuration || 10)}</div>
              }
              {/* 复制 */}
              <i className='iconfont icon-doc_on_clipboard_fill detail-operate-add' onClick={(e) => addJob(e, 2, stageIndex, jobIndex, job)}></i>
              {/* 删除 */}
              <div className='detail-operate-close flex-center' onClick={(e) => deleteJob(e, stageIndex, jobIndex)}>
                <CloseOutlined />
              </div>
            </h3>
          </div>
          {
            renderStep(job.tasks, jobIndex, stageIndex, job, stageList)
          }
        </div >
        {
          renderFirstLine(stageIndex, jobIndex)
        }
        {
          renderOtherLine(jobs, stageIndex, jobIndex)
        }
      </>
    )
  }

  const renderArrow = (job) => {
    return <div className={`job-item-arrow-expand flex-center common-animation-arrow ${job.taskShow && 'common-animation-arrow-active'}`} onClick={(e) => {
      e.stopPropagation()
      handleShowJob(job)
    }}>
      <UpOutlined />
    </div>
  }

  const handleConfigDetail = (e, job, jobIndex) => {
    job.stageIndex = stageIndex
    job.jobIndex = jobIndex
    showConfigDetail(e, job)
  }

  return (
    <ul className='jobs-box' ref={variableRef}>
      {
        jobs.map((job: any, jobIndex: number) =>
          // <li key={job.id} className={`job-item job-item-status-${renderExecStatusClassName(job.status)}`} onClick={(e) => showConfigDetail(e, job)}>
          <li key={job.id} className={`job-item ${!job.active && 'job-item-disabled'} job-item-status-${renderExecStatusClassName(job.status)}`} onClick={(e) => handleConfigDetail(e, job, jobIndex)} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onDragEnd={onDragEnd} draggable={type == 1} onDragStart={onDragStart} data-id={job.id} data-current-index={`${stageIndex}-${jobIndex}`}>
            {renderArrow(job)}
            {renderItem(job, jobIndex)}
          </li>
        )
      }
    </ul >
  );
}

export default Project
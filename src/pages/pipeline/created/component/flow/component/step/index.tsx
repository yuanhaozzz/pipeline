import React, { useEffect, useReducer } from 'react';
import { CaretRightOutlined, CloseOutlined, ClockCircleOutlined, LoadingOutlined, StopOutlined, UserOutlined, MoreOutlined, LinkOutlined } from '@ant-design/icons'
import DipelineDownload from '@/assets/images/pipeline-download.png'
import { Tooltip } from 'antd'

import './style.less'
import { send } from './service'
import { Dropdown, Button } from 'antd'
import { formatHour } from '@/utils'
import { setTimer } from '../../data'
import { SetElementLength } from '@/utils/commonComponent'
import { renderTaskStatsIcon } from '@/pages/pipeline/created/common'

interface Props {
  // 1 新增/编辑 2 预览 3 执行
  type: 1 | 2 | 3
  tasks: any
  job: any
  stageList: any
  jobIndex: number
  stageIndex: number
  showConfigDetail(e: any, stage: any): void
  openReviewModal(e: any, task: any): void
  addStep(e: any, type: number, stageIndex: number, jobIndex: number, stepIndex?: number, step?: any, isBottom?: boolean): void
  deleteStep(e: any, stageIndex: number, jobIndex: number, stepIndex: number): void
  renderExecStatusClassName(status: any): any
  update(): any
}

let stepDragElement = null
let stepDragStartY = 0
let oldStepDragBox = null
let isStepDragStart = false
function Project(props: Props) {
  const { tasks, job, showConfigDetail, jobIndex, stageIndex, addStep, deleteStep, type, renderExecStatusClassName, stageList, update: parentUpdate, openReviewModal } = props

  const [, update] = useReducer(state => state += 1, 0)

  const renderPluginIcon = (task: any) => {
    return task.atom_logo ? <img src={task.atom_logo} className='item-logo' draggable={false} /> : <i className='iconfont icon-placeholder_1 step-item-icon' draggable={false}></i>
  }

  const renderStepJobPendingIcon = (step: any, stepIndex) => {
    if (job.status !== 'pending') {
      switch (step.status) {
        case 'pending':
          return <ClockCircleOutlined className='step-item-icon-pending' />
        case 'running':
        case 'manual_confirm':
          return <LoadingOutlined className='step-item-icon-running' />
        // case 'manual_confirm':
        //   return <img src='http://10.12.110.200:8080/dolphin/weekly_report/1702891499.333052_710a86452a05f63123b57d55ce1fec2.png' style={{ width: '35px' }} onClick={(e) => handleReview(e, step, stepIndex)} draggable="false" />
        default:
          return <></>
      }
    }
    return <></>
  }

  const renderPlugin = (step: any, stepIndex: number) => {
    return (
      <>
        {
          step.vaildFormError ? <div className='step-operate-danger flex-center'>
            <i className='iconfont icon-weixian'></i>
          </div> :
            < i className='iconfont icon-doc_on_clipboard_fill step-operate-add' onClick={(e) => addStep(e, 2, stageIndex, jobIndex, stepIndex, step, true)}></i >
        }
      </>
    )
  }

  const handleConfigDetail = (e: any, step, stepIndex) => {
    step.stageIndex = stageIndex
    step.jobIndex = jobIndex
    step.stepIndex = stepIndex
    showConfigDetail(e, step)
  }

  const handleReview = (e: any, step, stepIndex) => {
    step.stageIndex = stageIndex
    step.jobIndex = jobIndex
    step.stepIndex = stepIndex
    openReviewModal(e, step)
  }

  const filterIndex = (v) => {
    return v.split('-')
  }

  const onDragStart = (e: Event) => {
    e.stopPropagation()
    isStepDragStart = true
    const target: any = e.target
    oldStepDragBox = target.parentNode
    target.style.opacity = '.3'
    stepDragElement = target
    stepDragStartY = e.clientX
  }

  const onDragEnd = (e: any) => {
    isStepDragStart = false
    e.stopPropagation()
    const { clientY } = e
    const target = e.target
    target.style.opacity = '1'

    const startIndex = target.dataset.currentIndex
    const [stagIndex, jobIndex, stepIndex] = filterIndex(startIndex)
    let location = []

    let insetData = target.previousElementSibling
    if (insetData) {
      insetData = target.previousElementSibling
      location = filterIndex(insetData.dataset.currentIndex)
      // 同组处理
      if (stagIndex === location[0] && jobIndex === location[1]) {
        if (stepDragStartY > clientY) {
          location[2] = location[2] * 1 + 1
        }
      } else {
        location[2] = location[2] * 1 + 1
      }
      const len = stageList[location[0]].jobs[location[1]].tasks.length - 1

      if (location[2] * 1 === len) {
        location[2] = len + 1
      }
    } else {
      insetData = target.nextElementSibling
      location = filterIndex(insetData.dataset.currentIndex)
      location[2] = 0
    }

    const moveEl = stageList[stagIndex].jobs[jobIndex].tasks.splice(stepIndex, 1)

    stageList[location[0]].jobs[location[1]].tasks.splice(location[2], 0, moveEl[0])
    // 删除拖拽
    if (stagIndex !== location[0] || jobIndex !== location[1]) {
      target.parentNode.removeChild(target)
      oldStepDragBox.insertBefore(stepDragElement, oldStepDragBox.firstChild);
    }

    // 没有task 删除job
    if (stageList[stagIndex].jobs[jobIndex].tasks.length <= 0) {
      stageList[stagIndex].jobs.splice(jobIndex, 1)
    }
    // 没有job 删除Stag
    if (stageList[stagIndex].jobs.length <= 0) {
      stageList.splice(stagIndex, 1)
    }

    stepDragStartY = clientY
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
    const target = e.target.closest('.step-item');
    if (stepDragElement) {
      if (target && target.dataset.id !== stepDragElement.dataset.id) {
        let container = target.closest('.step-box');
        if (container) {
          if (stepDragStartY > clientY) {
            container.insertBefore(stepDragElement, target);
          } else {
            container.insertBefore(stepDragElement, target.nextElementSibling);
          }
          stepDragStartY = clientY
        }
      }
    }
  }

  const renderMore = (step) => {
    let items: any = [];
    if (step.subpipeline_url) {
      items = [
        {
          key: '1',
          label: (
            <div onClick={(e: any) => {
              window.open(step.subpipeline_url)
            }}>
              <LinkOutlined /> 跳转
            </div>
          ),
        }
      ]
    }
    return <div className='step-item-more'>
      {
        items.length > 0 && <Dropdown menu={{ items }} overlayClassName="job-more-dropdown">
          <Button type="text" className='detail-retry-op-more' icon={<MoreOutlined />} onClick={(e: any) => e.stopPropagation()}></Button>
        </Dropdown>
      }
    </div>
  }

  const renderProgress = (task) => {

    if (task.atom_name !== "Redis MQ" || !task.message_count || task.message_count <= 0) {
      return <></>
    }
    // let num = task.message_left_count / task.message_count * 100
    let num = task?.progress_in_percent || 0
    return <div className='step-item-redis-progress'>
      <Tooltip title={num + '%'}>
        {/* 条 */}
        <div className='progress-line-box'>
          {/* 实际条 */}
          <div className={`box-line ${num === 100 && 'finish'} `} style={{ height: `${num}%` }}></div>
          {/* 数值 */}
          <div className={`box-round flex-center ${num === 100 && 'finish'}  scale`} style={{ top: 20 - (30 * (num / 100)) + 'px' }} >{num}%</div>
        </div>
      </Tooltip>
    </div>
  }

  const renderItem = (step: any, stepIndex: number) => {
    setTimer(step, update, type)
    return (
      <li
        className={`step-item flex-start ${(!step.active || (type === 3 && !step.runActive)) && 'step-item-disabled'} ${type === 1 && step.vaildFormError && 'step-empty'} step-item-status-${renderExecStatusClassName(step.status)} ${step?.variables?.atomType === 'manual' && type === 3 && (step.status === 'running' || step.status === 'manual_confirm') && 'task-manual-status'}`}
        key={step.id}
        onClick={(e) => handleConfigDetail(e, step, stepIndex)}
        onDragEnter={onDragEnter}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        draggable={type == 1}
        data-id={step.id}
        data-current-index={`${stageIndex}-${jobIndex}-${stepIndex}`}>
        <div className='flow-mark-task'>Task</div>
        {/* Redis MQ 进度条 */}
        {renderProgress(step)}
        {renderMore(step)}
        {/* 人工任务 */}
        {
          step?.variables?.atomType === 'manual' && <div className={`review-container ${((step.status === 'pending') ? 'review-action' : 'review-hover')}`} onClick={(e) => handleReview(e, step, stepIndex)}>
            {/* <UserOutlined style={{ fontSize: '15px' }} /> */}
            <img src='http://10.12.110.200:8080/dolphin/weekly_report/1702892530.803212_cd22e1f92c9e73b96150790a7ca5702.png' style={{ width: '20px' }} draggable="false" />
            &nbsp;
            <span>人工任务</span>
          </div>
        }

        {
          type === 1 && <>
            {/* 新增step按钮 上*/}
            {
              stepIndex === 0 && <div className='flex-center  common-add-button add-step-item-first' onClick={(e) => addStep(e, 3, stageIndex, jobIndex, stepIndex, {})}>
                <i className='iconfont icon-add_bold'></i>
              </div>
            }
            {/* 新增step按钮 下 */}
            <div className='flex-center add-step common-add-button add-step-item' onClick={(e) => addStep(e, 3, stageIndex, jobIndex, stepIndex, {}, true)}>
              <i className='iconfont icon-add_bold'></i>
            </div>
          </>
        }
        {
          type === 1 && renderPlugin(step, stepIndex)
        }
        {
          job.status !== 'pending' && step.status && <>
            <div className='step-item-left flex-center'>
              {
                renderStepJobPendingIcon(step, stepIndex)
              }
              {
                renderTaskStatsIcon(step.status)
              }
            </div>
          </>
        }
        {
          renderPluginIcon(step)
        }
        {/* 名称 */}
        <span className='step-item-name' style={{ maxWidth: type === 3 ? '110px' : '150px' }}>
          <SetElementLength text={step.name}>
            <div>{step.name}</div>
          </SetElementLength>
          {/* <Tooltip placement="topLeft" title={step.name}>{step.name}</Tooltip> */}
        </span>
        {/* 用时 */}
        {
          (step.status && step.status !== 'pending' && step.status !== 'skipped') && <div className={`step-item-time step-item-time-${step.status}`}>{formatHour(step.localDuration || step.duration || 2)}</div>
        }
        {/* 删除 */}
        {/* tasks.length > 1 && */}
        {
          <div className='step-operate-close flex-center' onClick={(e) => deleteStep(e, stageIndex, jobIndex, stepIndex)}>
            <CloseOutlined />
          </div>
        }
      </li >
    )
  }
  return (
    <ul className='step-box'>
      {
        tasks.map((step: any, stepIndex: number) => renderItem(step, stepIndex))
      }
      {/* 新增step按钮 */}
      {
        type === 1 && <div className='flex-center add-step common-add-button' onClick={(e) => addStep(e, 1, stageIndex, jobIndex)}>
          <i className='iconfont icon-add_bold'></i>
        </div>
      }
    </ul>
  );
}

export default Project
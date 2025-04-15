import React, { useEffect } from 'react';
import { CaretRightOutlined, CloseOutlined, LoadingOutlined, CheckCircleOutlined, StopOutlined, SyncOutlined, RobotOutlined, MoreOutlined } from '@ant-design/icons'
import { Tooltip, Dropdown, Button } from 'antd'

import './style.less'
import { send } from './service'
import { SetElementLength } from '@/utils/commonComponent'

interface Props {
  // 1 新增/编辑 2 预览 3 执行
  type: 1 | 2 | 3
  stage: any
  index: number
  stageList: any
  renderJobs(jobs: any, stageIndex: number, stageList: any): any
  stageAddStatus: boolean
  showConfigDetail(e: any, stage: any): void
  addStage(e: any, type: number, index?: number, stage?: any): void
  deleteStage(e: any, stageIndex: number): void
  handleShowAdd(e: any, stageIndex: number): void
  handleStageAdd(e: any): void
  retry(e: any, stageParam: any): void
  addJob(e: any, type: number, stageIndex: number, jobIndex?: number, job?: any): void
  renderExecStatusClassName(status: any): any
  update(): any
  openConsumptionModal(data: any): any
}
let stageDragElement = null
let stageDragStartX = 0
function Project(props: Props) {
  const { stage, index, stageList, showConfigDetail, addStage, deleteStage, handleShowAdd, handleStageAdd, stageAddStatus, addJob, renderJobs, type, renderExecStatusClassName, retry, update, openConsumptionModal } = props


  const renderLine = () => {
    return (
      <>
        {/* 左连线 */}
        {
          index > 0 && <div className='stage-arrow-left'>
            <CaretRightOutlined className='icon' />
          </div>
        }
        {/* 新增按钮 */}
        {
          type === 1 && <div className='left-add-stage common-add-button flex-center' onClick={(e) => handleShowAdd(e, index)}>
            {
              stage.showAddButton ? <i className='iconfont icon-jianhao'></i> : <i className='iconfont icon-add_bold'></i>
            }
          </div>
        }

        {/* 右连线 */}
        <div className='stage-arrow-right'>
          {/* 线 */}
          {
            index !== stageList.length - 1 && <div className='right-line'></div>
          }

          {/* 按钮 */}
          {
            type === 1 && <div className='right-add-stage common-add-button flex-center' onClick={(e) => handleStageAdd(e)}>
              <i className='iconfont icon-add_bold'></i>
              {
                index === stageList.length - 1 && stageAddStatus && <ul className='stage-add-layer-right'>
                  <li className='layer-item' onClick={(e) => addStage(e, 1)}>添加新Stage</li>
                </ul>
              }
            </div>
          }

        </div>
        {
          index !== 0 && stage.showAddButton && <>
            {/* 新增job */}
            {/* <div className='stage-add-job'>
              <button className='flex-center' onClick={(e) => addJob(e, 1, index)}>
                <i className='iconfont icon-add_bold'></i>&nbsp;
                <span>添加 Job</span>
              </button>
            </div> */}
            {/* 新增Stage */}
            <ul className='stage-add-layer'>
              <li className='layer-item' onClick={(e) => addStage(e, 1, index)}>添加新Stage</li>
            </ul>
          </>
        }
      </>
    )
  }

  const renderStateItem = (stage: any) => {
    const { status } = stage
    return <div className={`stage-item  flex-center stage-item-status-${renderExecStatusClassName(status)}`}>
      <div className='flow-mark-stage'>Stage</div>
      {/* {renderConsumption(stage)} */}
      <div className='stage-item-icon-box'>
        {/* 进行中 */}
        {
          status === 'running' && <><LoadingOutlined />&nbsp;&nbsp;</>
        }
        {/* 成功 */}
        {
          status === 'success' && <><CheckCircleOutlined style={{ color: '#34d97b', marginTop: '3px' }} />&nbsp;&nbsp;</>
        }
        {/* 跳过 */}
        {
          status === 'skipped' && <div className='stage-item-skipped flex-center'>
            <i className='iconfont icon-tiaoguofenxiang '></i>
            &nbsp;&nbsp;
          </div>
        }
        {/* 取消 */}
        {
          (status === 'canceled') && <><StopOutlined style={{ marginTop: '3px', color: '#f8b300' }} />&nbsp;&nbsp;</>
        }
        {/* 失败图标 */}
        {
          (status === 'failed' || status === 'timeout') && <div className='stage-item-failed flex-center'>
            <i className='iconfont icon-addfailed '></i>
            &nbsp;&nbsp;
          </div>
        }
      </div>
      {/* 名称 */}
      <span className='stage-item-name'>
        {/* <SetElementLength text={stage.name}>
          <div>{stage.name}</div>
        </SetElementLength> */}
        <Tooltip placement="topLeft" title={stage.name}>{stage.name}</Tooltip>
      </span>
      {/* 失败 和 超时 和 取消 */}
      {
        (status === 'failed' || status === 'timeout' || status === 'canceled' || status === 'success') && <>
          {/* 重试按钮 */}
          <Tooltip title="重试">
            <div className='stage-item-retry flex-center' onClick={(e) => retry(e, stage)}>
              <SyncOutlined />
            </div>
          </Tooltip>
        </>
      }
      {/* 危险图标 */}
      {
        type === 1 && stage.vaildFormError && <div className='stage-operate-danger flex-center'>
          <i className='iconfont icon-weixian'></i>
        </div>
      }
      {/* 复制 */}
      <i className='iconfont icon-doc_on_clipboard_fill stage-operate-add' onClick={(e) => addStage(e, 2, index, stage)}></i>
      {/* 删除 */}
      <div className='stage-operate-close flex-center' onClick={(e) => deleteStage(e, index)}>
        <CloseOutlined />
      </div>
    </div>
  }


  // const onDrag = (e: any) => {
  //   const target = e.target
  //   var targetRect = target.getBoundingClientRect();
  //   console.log(targetRect.left)

  // }

  const onDragStart = (e: any) => {
    const target = e.target
    target.style.opacity = '.3'
    stageDragElement = target
    stageDragStartX = e.clientX
  }

  const onDragEnd = (e: any) => {
    const target = e.target
    target.style.opacity = '1'
    stageDragElement = null
    const boxList = Array.from(document.querySelectorAll('.stage-box'))
    const startIndex = target.dataset.currentIndex
    const insetIndex = boxList.findIndex(el => el.dataset.currentIndex === startIndex)

    const moveEl = stageList.splice(startIndex, 1)


    stageList.splice(insetIndex, 0, moveEl[0])
    update()
  }

  const onDragEnter = (e: any) => {
    e.preventDefault();
    const { clientX } = e
    const target = e.target.closest('.stage-box');
    if (stageDragElement) {
      if (target && target.dataset.id !== stageDragElement.dataset.id) {
        let container = target.parentNode;
        if (stageDragStartX > clientX) {
          container.insertBefore(stageDragElement, target);
        } else {
          container.insertBefore(target, stageDragElement);
        }
        stageDragStartX = clientX
      }
    }

  }

  // const onDragLeave = (e) => {
  //   // stageIsDragOver = false
  //   // debugger
  //   // const dropBox = e.target.closest('.stage-box');
  //   // if (dropBox) {
  //   //   dropBox.style.background = 'none'
  //   // }
  // }

  const renderConsumption = (stage) => {
    let items: any = [];
    switch (stage.status) {
      case 'running':
        items = []
        break
      case 'canceled':
      case 'failed':
      case 'timeout':
      case 'success':
        items = [
          {
            key: '3',
            label: (
              <Tooltip title="重试">
                <div className='stage-item-retry flex-center' onClick={(e) => retry(e, stage)}>
                  <SyncOutlined />
                </div>
              </Tooltip>
            ),
          }
        ]
        break
      case 'skipped':
        items = []
        break
    }

    if (stage?.consumption) {
      items = [
        {
          key: '1',
          label: (
            <div onClick={(e: any) => {
              e.stopPropagation()
              openConsumptionModal(stage)
            }}>
              <RobotOutlined /> 消费信息
            </div>
          ),
        },
        ...items
      ]
    }

    return <div className='stage-item-consumptionIcon flex-center' onClick={() => () => { }}>
      {/* <RobotOutlined /> */}
      {
        items.length > 0 && <Dropdown menu={{ items }} overlayClassName="job-more-dropdown">
          <div className='stage-item-consumptionIcon-items flex-center'>
            <Button type="text" className='detail-retry-op-more' icon={<MoreOutlined />} onClick={(e: any) => e.stopPropagation()}></Button>
          </div>
        </Dropdown>
      }
    </div>
  }

  return (
    <div className={`stage-box ${!stage.active && 'stage-disabled'}`} onDragEnter={onDragEnter} onDragEnd={onDragEnd} draggable={type == 1} onDragStart={onDragStart} data-id={stage.id} data-current-index={index} onClick={(e) => showConfigDetail(e, stage)}>
      {/* <div className={`stage-box`} onClick={(e) => showConfigDetail(e, stage)}> */}
      {/* stage */}
      {
        renderStateItem(stage)
      }
      {/* jobs */}
      {
        renderJobs(stage.jobs, index, stageList)
      }
      {/* 线 */}
      {
        renderLine()
      }
      {
        type === 1 && <div className={`stage-add-job-first stage-add-job flex-center ${'stage-add-job-other-element'}`}>
          <button className='flex-center' onClick={(e) => addJob(e, 1, index)}>
            <i className='iconfont icon-add_bold'></i>&nbsp;
            <span>添加 Job</span>
          </button>
        </div>
      }

    </div>
  );
}

export default Project
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { message } from 'antd'
import { PlusOutlined, ApartmentOutlined, CaretRightOutlined, CloseOutlined } from '@ant-design/icons'
import { Button, Segmented } from 'antd'

import { tabList, stageTemplate, jobTemplate, stepTemplate } from './data'
import './style.less'
import { getUrlParams, deepCopy } from '@/utils'

import CIContainer from '@/components/ciContainer'
import List from '@/components/List'
import Stage from './component/stage'
import Job from './component/job'
import Step from './component/step'
import ConfigModal from './component/configModal'
import ExecModal from './component/execModal'
import RetryModal from './component/retryModal'
import CancelModal from './component/cancelModal'
import ReviewModal from './component/reviewModal'
import ConsumptionModal from './component/stage/component/consumptionModal'
import Code from './component/configModal/component/stepConfig/component/shell'
import { checkPipilineAuth } from '@/utils/menu'

import { retryJobApi, skipJobApi, triggerJobApi } from './service'


interface Props {
  data: any;
  setData(data: any): void;
  // 1 新增/编辑 2 预览 3 执行
  type: 1 | 2 | 3;
  // 轮询流水线
  repeatPipelineStatus(): any
  // 详情
  newRunDetail(): any
}

function Project(props: Props, ref: any) {
  const { data, setData, type, repeatPipelineStatus, newRunDetail } = props
  const [stageAddStatus, setStageAddStatus] = useState(false)
  const configDetailRef = useRef(null)
  const retryModalRef = useRef(null)
  const execModalRef = useRef(null)
  const cancelModalRef = useRef(null)
  const reviewModalRef = useRef(null)
  const consumptionModalModalRef = useRef(null)
  const query = getUrlParams()

  useImperativeHandle(ref, () => ({
    openJobLog: showConfigDetail
  }))

  useEffect(() => {
    if (data) {
      execModalRef.current.updateData(data)
    }
  }, [data])

  useEffect(() => {
    defaultShowExecModal()
  }, [])

  const defaultShowExecModal = () => {
    let stop = false
    for (let i = 0; i < data.stages.length; i++) {
      const stageIndex = i
      const stage = data.stages[i]
      for (let j = 0; j < stage.jobs.length; j++) {
        const jobIndex = j
        const job = stage.jobs[j]
        for (let k = 0; k < job.tasks.length; k++) {
          const stepIndex = k
          const task = job.tasks[k]
          // url 跳转携带task_id 优先展示弹窗
          if (task.logId + '' === query.open_modal_task_id) {
            newRunDetail()
            execModalRef.current.open({ ...task, stageIndex, jobIndex, stepIndex }, data)
            return
          }
          if (task.logId + '' === query.open_modal_followed_task_id) {
            // 判断下一个是否存在
            if (job.tasks[k + 1]) {
              newRunDetail()
              execModalRef.current.open({ ...job.tasks[k + 1], stageIndex, jobIndex, stepIndex: stepIndex + 1 }, job.tasks[k + 1])
            }
          }
          // 
          if (data.status !== 'running' && data.status !== 'pending') {
            if (!query.open_modal_task_id) {
              // 人工任务弹窗
              // if (task.atom_name === '人工任务' && (task.status === "failed" || task.status === "timeout")) {
              if (task.atom_name?.startsWith('人工任务') && (task.status === "failed" || task.status === "timeout")) {
                newRunDetail()
                execModalRef.current.open({ ...task, stageIndex, jobIndex, stepIndex }, data)
                return
              }
            }
          }
        }
      }

    }
  }

  // type 1 新增 2 复制
  const addStage = (e: any, type: number, index?: number, stage?: any) => {
    e.stopPropagation();
    let template = data.template
    if (type === 1) {
      // 创建stage
      const createStage = stageTemplate()
      createStage.id = template.length + 1
      createStage.name = 'stage' + (template.length + 1)
      // 创建一个job
      const createJob = jobTemplate()
      // 创建第一个step
      createJob.tasks.push(stepTemplate())
      createStage.jobs.push(createJob)

      modifyId(1, createStage, createStage.id)
      // index >= 0 插入
      if (index >= 0) {
        template.splice(index, 0, createStage)
      } else {
        template.push(createStage)
      }
    } else {
      const copyStage = deepCopy(stage)
      copyStage.id = template.length + 1
      modifyId(1, copyStage, copyStage.id)
      template.splice(index + 1, 0, copyStage)

    }
    setData({ ...data })
    hideAddButton()
  }

  const deleteStage = (e: any, stageIndex: number) => {
    e.stopPropagation();
    let template = data.template
    if (template.length <= 1) {
      message.error('已经是最后一个 Stage')
      return
    }
    template.splice(stageIndex, 1)
    setData({ ...data })
  }

  // type 1 新增 2 复制
  const addJob = (e: any, type: number, stageIndex: number, jobIndex?: number, job?: any) => {
    e.stopPropagation();
    let template = data.template
    const stage = template[stageIndex]
    const jobs = stage.jobs
    const id = `${stage.id}-${jobs.length + 1}`
    if (type === 1) {
      // 创建job
      const createJob = deepCopy(jobTemplate())
      // createJob.id = jobs.length + 1
      const jobId = Math.random()
      createJob.id = jobId
      createJob.name = 'job'
      // 创建第一个step
      createJob.tasks.push(stepTemplate())

      modifyId(2, createJob, jobId)
      stage.jobs.push(createJob)
    } else {
      const copyJob = deepCopy(job)
      copyJob.id = id
      modifyId(2, copyJob, copyJob.id)
      stage.jobs.splice(jobIndex + 1, 0, copyJob)
    }
    setData({ ...data })
    hideAddButton()
  }

  const deleteJob = (e: any, stageIndex: number, jobIndex: number) => {
    e.stopPropagation();
    let template = data.template
    const stage = template[stageIndex]
    if (stage.jobs.length <= 1) {
      if (template.length <= 1) {
        message.error('已经是最后一个 Stage')
        return
      }
      template.splice(stageIndex, 1)
    } else {
      stage.jobs.splice(jobIndex, 1)
    }
    setData({ ...data })
  }

  // type 1 新增 2 复制 3 新建插入
  const addStep = (e: any, type: number, stageIndex: number, jobIndex: number, stepIndex?: number, step?: any, isBottom) => {
    e.stopPropagation();
    let template = data.template
    const stage = template[stageIndex]
    const job = stage.jobs[jobIndex]
    const tasks = job.tasks
    const id = `${job.id}-${tasks.length}`
    if (type === 1) {
      const createStep: any = deepCopy(stepTemplate())
      const stepId = Math.random()
      createStep.id = stepId
      createStep.name = 'task'
      modifyId(3, createStep, stepId)
      tasks.push(createStep)
      // 新建插入
    } else if (type === 3) {
      const createStep: any = deepCopy(stepTemplate())
      const stepId = Math.random()
      createStep.id = stepId
      createStep.name = 'task'
      modifyId(3, createStep, stepId)
      if (stepIndex === 0 && !isBottom) {
        tasks.unshift(createStep)
      } else {
        tasks.splice(stepIndex + 1, 0, createStep)
      }
    } else {
      const copyStep = deepCopy(step)
      copyStep.id = id
      modifyId(3, copyStep, id)
      tasks.splice(stepIndex + 1, 0, copyStep)
    }
    setData({ ...data })
  }

  const deleteStep = (e: any, stageIndex: number, jobIndex: number, stepIndex: number) => {
    e.stopPropagation();
    let template = data.template
    const tasks = template[stageIndex].jobs[jobIndex].tasks

    const stage = template[stageIndex]
    const job = template[stageIndex].jobs[jobIndex]

    if (template.length <= 1 && stage.jobs.length <= 1 && tasks.length <= 1) {
      message.error('已经是最后一个 Stage')
      return
    } else if (template.length > 1 && stage.jobs.length <= 1 && tasks.length <= 1) {
      template.splice(stageIndex, 1)
    } else if (job.tasks.length <= 1) {
      template[stageIndex].jobs.splice(jobIndex, 1)
    } else {
      tasks.splice(stepIndex, 1)
    }
    setData({ ...data })
  }

  const modifyId = (type: number, data: any, id: any) => {
    switch (type) {
      case 1:
        data.id = id
        data.jobs.forEach((job: any, jobIndex: number) => {
          job.id = `${data.id}-${jobIndex + 1}`
          job.tasks.forEach((step: any, stepIndex: number) => {
            step.id = `${data.id}-${jobIndex + 1}-${stepIndex + 1}`
          })
        })
        break
      case 2:
        data.id = id
        data.tasks.forEach((step: any, stepIndex: number) => {
          step.id = `${data.id}-${stepIndex + 1}`
        })
        break
      case 3:
        data.id = `${id}`
        break
    }
  }

  const handleShowAdd = (e: any, stageIndex: number) => {
    e.stopPropagation();
    let template = data.template
    const stage = template[stageIndex]
    stage.showAddButton = !stage.showAddButton
    setData({ ...data })
  }

  const handleStageAdd = (e: any) => {
    e.stopPropagation();
    setStageAddStatus(!stageAddStatus)
  }

  const containerClick = () => {
    hideAddButton()
  }

  const hideAddButton = () => {
    setStageAddStatus(false)
    let template = data.template
    template.map(item => {
      item.showAddButton = false
      return item
    })
    setData({ ...data })
  }

  // from 
  const showConfigDetail = (e: any, config: any) => {
    if (e) {
      e.stopPropagation();
    }
    switch (type) {
      case 1:
      case 2:
        configDetailRef.current.open(config, data)
        break
      case 3:
        newRunDetail()
        execModalRef.current.open(config, data)
        break
    }
  }


  const update = () => {
    setData({ ...data })
  }

  const retry = (e: any, stageParam: any) => {
    e.stopPropagation();
    retryModalRef.current.open(stageParam)
  }

  const handleJobCanceled = async (e: Event, jobParam: any) => {
    e.stopPropagation()
    cancelModalRef.current.open(jobParam, data)
  }

  const handleJobSkipped = async (e: Event, jobParam: any) => {
    e.stopPropagation()
    if (!checkPipilineAuth('Skip')) {
      message.error('暂无权限')
      return
    }
    try {
      await skipJobApi(jobParam.pipelineId)
      repeatPipelineStatus('retry')
      message.success('正在跳过中，请稍后...')
    } catch (error) {

    }
  }

  const handleJobManual = async (e: Event, jobParam: any) => {
    e.stopPropagation()
    if (type !== 3) {
      return
    }
    try {
      await triggerJobApi(jobParam.pipelineId)
      repeatPipelineStatus('retry')
      message.success('正在手动触发中，请稍后...')
    } catch (error) {

    }
  }

  const openConsumptionModal = (stage) => {
    consumptionModalModalRef.current.open(stage)
  }

  const retryServer = async (e: any, jobParam: any, status: string) => {
    e.stopPropagation()
    if (!checkPipilineAuth('Trigger')) {
      message.error('暂无权限')
      return
    }
    if (status === 'skipped') {
      if (data.status === 'running') {
        message.error('重跑跳过状态需要流水线不能是运行中状态，请稍后再试...')
        return
      }
    }


    try {
      retryModalRef.current.open(jobParam, 'job')
      // await retryJobApi(jobParam.pipelineId)
      // repeatPipelineStatus()
      // message.success('正在重跑中，请稍后...')
    } catch (error) {

    }
  }

  // "pending"
  // "running"
  // "failed"
  // "success"
  // "canceled"
  // "timeout"
  const renderExecStatusClassName = (status: number) => {
    if (type === 3) {
      return status
    }
    return ''
  }

  const openReviewModal = (e: any, step: any) => {
    if (e) {
      e.stopPropagation();
    }
    // if (data.status === 'running' && step.status !== 'manual_confirm') {
    //   return
    // }
    switch (type) {
      case 3:
        // reviewModalRef.current.open(step)
        newRunDetail()
        execModalRef.current.open(step, data)
        break
    }
  }

  const handleShowJob = (job) => {
    job.taskShow = !job.taskShow

    setData({ ...data })
  }

  const renderStep = (tasks: any, jobIndex: number, stageIndex: number, job: any, stageList: any) => {
    return (
      <div style={{ display: !job.taskShow ? 'block' : 'none' }}>
        <Step type={type} tasks={tasks} stageList={stageList} job={job} jobIndex={jobIndex} stageIndex={stageIndex} deleteStep={deleteStep} addStep={addStep} showConfigDetail={showConfigDetail} renderExecStatusClassName={renderExecStatusClassName} update={update} openReviewModal={openReviewModal} />
      </div>
    )
  }

  const renderJobs = (jobs: any, stageIndex: number, stageList: any) => {
    return (
      <Job type={type} jobs={jobs} stageList={stageList} stageIndex={stageIndex} showConfigDetail={showConfigDetail} renderStep={renderStep} deleteJob={deleteJob} addJob={addJob} renderExecStatusClassName={renderExecStatusClassName} handleJobCanceled={handleJobCanceled} retryServer={retryServer} update={update} handleJobSkipped={handleJobSkipped} handleJobManual={handleJobManual} handleShowJob={handleShowJob} />
    )
  }

  const renderStage = (stage: any, index: number, stageList: any) => {

    return (
      <Stage type={type} stage={stage} index={index} stageList={stageList} showConfigDetail={showConfigDetail} addStage={addStage} deleteStage={deleteStage} handleShowAdd={handleShowAdd} handleStageAdd={handleStageAdd} stageAddStatus={stageAddStatus} renderJobs={renderJobs} key={stage.id} addJob={addJob} renderExecStatusClassName={renderExecStatusClassName} retry={retry} update={update} openConsumptionModal={openConsumptionModal} />
    )
  }

  if (!data) {
    return <></>
  }
  return (
    <>
      {/* <Code /> */}
      <div className={`pipeline-line-container flex-start flow-status-${type}`} onClick={() => containerClick()}>
        <div className='flex-start stage-container' >
          {/* 虚线 */}
          {
            type === 1 && <div className='add-stage-dotted'></div>
          }

          {
            data.template.map((item, index) => (
              renderStage(item, index, data.template)
            ))
          }
        </div>
      </div>
      {/* 新增/编辑 配置 */}
      <ConfigModal ref={configDetailRef} update={update} type={type}  {...props} />
      {/* 人工任务弹窗 */}
      <ReviewModal ref={reviewModalRef} update={update} type={type} config={data} />
      {/* 执行详情 日志 + 配置 */}
      <ExecModal ref={execModalRef} update={update} type={type} />
      {/* 重试弹窗 */}
      <RetryModal ref={retryModalRef} repeatPipelineStatus={repeatPipelineStatus} />
      {/* 取消job */}
      <CancelModal ref={cancelModalRef} />
      {/* 消费信息 */}
      <ConsumptionModal ref={consumptionModalModalRef} />
    </>
  );
}

export default forwardRef(Project)
import React, { useEffect, useState, useRef, useMemo, useReducer } from 'react';
import { useSelector, useDispatch } from 'dva'
import { PlusOutlined, ApartmentOutlined, MinusCircleOutlined, StopOutlined, LoadingOutlined, PauseCircleOutlined, PlayCircleOutlined, BranchesOutlined, SyncOutlined, CloseCircleOutlined, EditOutlined, DoubleLeftOutlined, DoubleRightOutlined, UpCircleOutlined, DownOutlined, LeftOutlined, RightOutlined, HistoryOutlined, SwapOutlined } from '@ant-design/icons'
import { Button, message, Popover, Tooltip, Empty, Modal, Progress, Alert } from 'antd'
// import { setPipeline } from '@/store/actions'
import './style.less'
// import { send } from './service'
import { getUrlParams, deepCopy, formatTime, replaceURL, scrollToHorizontalPosition, scrollToPosition } from '@/utils'
import Flow from '../flow'
import { tabList } from './data'
import Nav from '../nav'
import MinMap from '../minMap'
import { useScreenHeight } from '@/utils/hook'
import { PageContainer } from '@ant-design/pro-layout';
import PageLoading from '@/components/PageLoading'
import { pipelineDetailApi, getPipelineStatusApi, triggerPipelineApi, pipelineRunDetailApi, cancelAllJobApi, pipelineConfigDetailApi, getNewDetailApi } from './service'
import { canEditApi } from '../../service'
import { addType } from '../../data'
import { useModel, useNavigate } from "umi";
import { checkPipilineAuth } from '@/utils/menu'

import BuildDownload from './components/buildDownload'
import CriticalData from './components/criticalData'
import { renderColumnBranch } from '@/pages/packagingService/commonComponent'
import { isUserAuth } from '@/utils'
import { renderStatus, RenderMoreButton, commonHandleTriggerType, RenderToolButton, renderTaskStatsIcon, setCompatiblePath } from '@/pages/pipeline/created/common'
import ExecModal from '../../component/execModal'
import { SetElementLength } from '@/utils/commonComponent'
import moment from 'moment';
import { useParams } from 'react-router-dom';
import ProgressComponent from './components/progress'
import Consumption from './components/consumption'

import { testData1 } from './data'

function Project(props) {
  const [data, setData] = useState(null)
  const [runData, setRunData] = useState<any>({})
  const [tabIndex, setTabIndex] = useState(0)
  const [, forceUpdate] = useReducer(state => state + 1, 0)
  const [variableMore, setVariableMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [configData, setConfigData] = useState({})
  const [taskShow, setTaskShow] = useState(false)
  const [isAuth, setAuth] = useState(true)

  const navigate = useNavigate()

  const delayRequestRef = useRef(null)
  const isFirstLoad = useRef(true)
  const isBack = useRef(false)
  const currentStagePendingPositon = useRef(1)

  const { runIid } = useParams() || {}
  let { from, version, triggerId: urlTriggerIdId, pipelineName, tabIndex: urlTabIndex } = getUrlParams() || {}
  const uuid = getUrlParams()?.pipelineId || useParams()?.pipelineId;

  const pipeline = useSelector(({ pipeline }) => pipeline)
  const [triggerId, setTriggerId] = useState(urlTriggerIdId)
  const [pipelineId, setPipelineId] = useState(uuid)
  // const height = useScreenHeight(0.79)
  const variableRef = useRef(null)
  const flowRef = useRef(null)
  const execModalRef = useRef(null)
  const varablesListRef = useRef(null)
  const varableListArrowRef = useRef(null)
  const swtichRecordRef = useRef(null)
  const configDetailRef = useRef({})
  const versionDiffRef = useRef(null)
  const isFirstScrollLoad = useRef(true)
  const isFirstLoadDetail = useRef(true)
  const isFirstStepTip = useRef(true)
  const pipelineDataRef = useRef([])
  const renderToolButtonRef = useRef(false)
  const pipelineStatus = useRef([])
  const isLastStage = useRef(true)
  const dispatch = useDispatch()

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  useEffect(() => {
    const index = pipeline.list.findIndex((item: any) => item.uuid === pipelineId)
    // if (!data) {
    let data = pipeline.list[index]
    if (urlTabIndex !== undefined) {
      setTabIndex(Number(urlTabIndex))
    }
  }, [])

  const handleCopyPipeline = () => {

  }

  useEffect(() => {
    return () => {
      clearTimeout(delayRequestRef.current)
    }
  }, [])

  useEffect(() => {
    let index = pipeline.list.findIndex((item: any) => (item.id * 1) === (pipelineId * 1))
    // if (!data) {
    pipelineStatus.current = deepCopy(pipeline.list[index])

    clearTimeout(delayRequestRef.current)
    init('init')
    // setTaskShow(false)
  }, [triggerId])

  useEffect(() => {
    // getPipelineConfigDetail()
    return () => {
      clearJobAndTaskTimer()
    }
  }, [runIid])

  useEffect(() => {
    if (varablesListRef.current) {
      let element = varablesListRef.current
      // 获取元素的实际高度
      let elementHeight = element.scrollHeight;
      // 获取元素的一行高度
      let lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
      if ((elementHeight - 5) > lineHeight) {
        varableListArrowRef.current.style.display = 'block'
      } else {
        varableListArrowRef.current.style.display = 'none'
      }
    }
  }, [runData])

  useEffect(() => {
    setSwitchPosition()
  }, [])

  useEffect(() => {
    window.addEventListener('popstate', onPopstate)
    return () => {
      window.removeEventListener('popstate', onPopstate)
    }
  }, [])

  useEffect(() => {
    if (isFirstScrollLoad.current && data && tabIndex === 0) {
      // debugger
      // 滚动错误
      switch (data.status) {
        case 'failed':
        case 'timeout':
          handleScrollStatus(['failed', 'timeout'])
          break
        case 'running':
          handleScrollStatus(['running', 'pending'])
          break
        case 'canceled':
          // handleScrollStatus(['canceled'])
          break
      }
      isFirstScrollLoad.current = false
    }
  }, [data])

  useEffect(() => {
    if (data) {
      if (isFirstLoadDetail.current) {
        handlePendingPosition()
        isFirstLoadDetail.current = false
      }
      let findIndex = data.template.findIndex(stage => stage.status === 'pending')
      console.log(`
        查找${findIndex}
        当前${currentStagePendingPositon.current}
      `)
      // 单独处理最后一个
      if (findIndex === -1 && data.template[data.template.length - 1].status === 'running' && isLastStage.current) {
        findIndex = data.template.length
        isLastStage.current = false
      }
      // 边界判断
      if (findIndex - 1 <= 0) {
        return
      }
      if (findIndex > currentStagePendingPositon.current) {
        currentStagePendingPositon.current = findIndex
        init()
      }
    }
  }, [data])


  useEffect(() => {
    if (data && isFirstStepTip.current) {
      // handleStepTip()
      isFirstStepTip.current = false
    }
  }, [data])

  const handleStepTip = () => {
    setTimeout(() => {
      const local = localStorage.getItem('detail-StepTip')
      const el = document.querySelector('#icon-logo-pipeline-trigger')
      if (local || !el) {
        return
      }
    }, 100);
  }

  const oncomplete = () => {
    localStorage.setItem('detail-StepTip', '1')
  }

  const handlePendingPosition = () => {
    if (data) {
      const findIndex = data.template.findIndex(stage => stage.status === 'pending')
      currentStagePendingPositon.current = findIndex
    }
  }

  const onPopstate = () => {
    isBack.current = true
  }

  const setSwitchPosition = () => {
    // left: 261px;
    const pathname = location.pathname
    let left = 190
    if (pathname.includes('/created/recentlyRun/detail')) {
      left = 255
    }
    swtichRecordRef.current && (swtichRecordRef.current.style.left = left + 'px')
    swtichRecordRef.current && (swtichRecordRef.current.style.opacity = '1')
  }

  const init = async (type?) => {
    // if (!(triggerId)) return
    try {
      setLoading(true)
    
      // 流水线运行详情、流水线详情 合并为一个接口
      await newRunDetail('detail', type)
      // 获取流水线运行详情
      // const info = await getPipelineRunDetail()
      // 获取流水线详情
      // await getDetail(info)
      // 轮询状态
      await repeatPipelineStatus()
      showLogDetail()
      localStorage.setItem('FlowLine-detail-last-path', location.pathname)

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
      // reset()
      // start()
    }
  }

  const computedScrollDistance = () => {
    const stageBox = document.querySelector('.stage-box')
    if (stageBox) {
      const { width, marginRight } = window.getComputedStyle(stageBox)
      const elWidth = parseInt(width)
      const elMarginRight = parseInt(marginRight)
      return {
        width: elWidth + elMarginRight,
        height: 42 + 20
      }
    }

  }

  const findErrorPosition = (status) => {
    let targetX = 0
    let targetY = 0
    const data = variableRef.current.detailExecData
    const list = data.template
    // stage 高度 + 间距
    let height = 50
    outerLoop: for (let i = 0; i < list.length; i++) {
      const stage = list[i]
      height = 50
      for (let j = 0; j < stage.jobs.length; j++) {
        const job = stage.jobs[j]
        height += (42 + 16)
        for (let k = 0; k < job.tasks.length; k++) {
          const task = job.tasks[k]
          if (status.includes(task.status)) {
            targetX = targetX === 0 ? 0 : targetX - 1
            // targetY -= job.tasks.length 
            height -= job.tasks.length * (42 + 11)
            break outerLoop;
          }
          height += (42 + 11)
          targetY++
        }
      }
      targetX++
    }

    return {
      targetX,
      targetY,
      height
    }

  }

  const handleScrollStatus = (status: any) => {
    const { width } = computedScrollDistance()
    const scroll = document.querySelector('#content-container')
    const { targetX, targetY, height } = findErrorPosition(status)
    // 
    const innerWidth = window.innerWidth - 200
    const totalNumber = Math.ceil(innerWidth / width)
    let number = Math.floor(totalNumber / 2) - 1
    if (number <= 1) {
      number = 0
    }
    scrollToPosition(scroll, (targetX - number) * width, 0, 500)
    setTimeout(() => {
      scrollToPosition(scroll, (targetX - number) * width, height, 500)
    }, 500);
  }

  const newRunDetail = async (from?, type?) => {
    try {
      // const { data, success = false } = await getNewDetailApi(triggerId)
      let index = pipeline.list.findIndex((item: any) => (item.id * 1) === (pipelineId * 1))
      // if (!data) {
      let data = pipeline.list[index]
      data.status = 'running'
      let success = false
      data.stages.forEach((stage, stageIndex) => {
        stage.jobs.forEach((job, index) => {
          job.isManualExpand = variableRef.current.detailExecData?.stages?.[stageIndex]?.jobs?.[index]?.isManualExpand
          job.taskShow = variableRef.current.detailExecData?.stages?.[stageIndex]?.jobs?.[index]?.taskShow
        })
      })
      let runData = deepCopy(data)
      let configData = deepCopy(data)
      configData.stages.forEach(stage => {
        stage.status = 'pending'
        stage.jobs.forEach(job => {
          job.status = 'pending'
          job.tasks.forEach(task => {
            task.status = 'pending'
          })
        })
      })
      if (renderToolButtonRef.current && type === 'init') {
        renderToolButtonRef.current.setExpandTask(configData, configData.setting?.extra_data?.isExpandAll)
      }
      setRunData(runData)
      if (success) {
        let newPath = `/FlowLine/created/detail/${pipelineId}/${data.number || 0}${location.search}`
        // if (!!from) newPath += `?from=${from}`
        // 
        if (from === 'detail') {
          if (isFirstLoad.current) {
            replaceURL({})
            isFirstLoad.current = false
          } else {
            if (!isBack.current) {
              props.history.push(setCompatiblePath(newPath))
            }
          }
        }
      }

      addType(configData.stages)
      configData.template = configData.stages
      configData.configTriggerId = configData.id
      configData.id = pipelineId
      dispatch({
        type: 'pipeline/setList',
        payload: { list: pipeline.list }
      })
      variableRef.current.detailExecData = configData
      pipelineDataRef.current = configData
      switch (pipelineId) {
        case 'a-sdad':
          pipelineDataRef.current.template = pipelineDataRef.current.stages = testData1
          break
        default:
          pipelineDataRef.current.template = pipelineDataRef.current.stages = configData.stages
      }
      setAuth(true)
    } catch (error) {
      setAuth(false)
    }
  }

  const showLogDetail = () => {
    if (from === 'packagingService' && variableRef.current?.detailExecData) {
      const { stages } = variableRef.current?.detailExecData
      const jobs = stages?.[0]?.jobs || []
      if (jobs.length > 0) {
        setTimeout(() => {
          flowRef.current?.openJobLog(null, jobs?.[0])
        }, 0);
      }
    }
  }

  const openPipelineModal = (record) => {
    record.id = record.uuid
    execModalRef.current.open(record, data?.version)
  }

  const clearJobAndTaskTimer = () => {
  }

  const setPipelineStatus = (stage) => {
    start(stage)
  }

  const start = (stages) => {
    for (const stage of stages) {
      // 1. 如果 stage 未开始（pending），启动它并运行第一个 pending job
      if (stage.status === 'pending' || !stage.status) {
        stage.status = 'running';
        console.log(`Stage ${stage.name} started.`);
      }
  
      // 2. 如果 stage 正在运行，处理其 jobs
      if (stage.status === 'running') {
        let allJobsCompleted = true;
  
        for (const job of stage.jobs) {
          // 2.1 如果 job 未开始（pending），启动它并运行第一个 pending task
          if (job.status === 'pending' || !job.status) {
            job.status = 'running';
            console.log(`Job ${job.name} in stage ${stage.name} started.`);
          }
  
          // 2.2 如果 job 正在运行，处理其 tasks
          if (job.status === 'running') {
            let allTasksCompleted = true;
  
            for (const task of job.tasks) {
              // 2.2.1 如果 task 未开始（pending），启动它
              if (task.status === 'pending' || !task.status) {
                task.status = 'running';
                console.log(`Task ${task.name} in job ${job.name} started.`);
                allTasksCompleted = false;
                break; // 每次只处理一个 task
              }
  
              // 2.2.2 如果 task 正在运行，标记为 success（模拟完成）
              if (task.status === 'running') {
                task.status = 'success';
                console.log(`Task ${task.name} in job ${job.name} completed.`);
              }
            }
  
            // 2.3 检查 job 是否完成（所有 tasks 完成）
            if (allTasksCompleted || job.tasks.every(t => t.status === 'success')) {
              job.status = 'success';
              console.log(`Job ${job.name} in stage ${stage.name} completed.`);
            } else {
              allJobsCompleted = false;
            }
          } else if (job.status !== 'success') {
            allJobsCompleted = false;
          }
        }
  
        // 3. 检查 stage 是否完成（所有 jobs 完成）
        if (allJobsCompleted || stage.jobs.every(j => j.status === 'success')) {
          stage.status = 'success';
          console.log(`Stage ${stage.name} completed.`);
        } else {
          break; // 当前 stage 未完成，不继续检查后续 stages
        }
      }
  
      // 4. 如果当前 stage 未完成，停止处理后续 stages
      if (stage.status !== 'success') {
        break;
      }
    }
  
    // 5. 检查整个流水线是否完成（所有 stages 完成）
    if (stages.every(s => s.status === 'success')) {
      pipelineDataRef.current.status = 'success'
      if (pipelineId === '2') {
        console.log('Pipeline 2 failed (simulated).');
        stages[stages.length - 1].status = 'failed'; // 模拟失败
      }
    }
  };

  const repeatPipelineStatus = async (from?) => {
    if (from === 'retry') {
      isFirstLoadDetail.current = true
      isLastStage.current = true
    }
    if (variableRef.current) {
      clearTimeout(variableRef.current.retryTimer)
    }
    const pipelineData = pipelineStatus.current
    pipelineData.template = pipelineData.stages
    setPipelineStatus(pipelineData.stages)
    let statusData = pipelineData

    if (variableRef.current) {
      let data = variableRef.current.detailExecData
      // debugger
      const list = data.template
      data.status = pipelineDataRef.current.status
      data.started_at = statusData.started_at
      const statusList = statusData.stages
      for (let i = 0; i < list.length; i++) {
        const stage = list[i]
        const statusStage = statusList[i]
        stage.status = statusStage.status
        stage.logId = stage.pipelineId = statusStage.id
        stage.setup_status = statusStage.setup_status
        for (let j = 0; j < stage.jobs.length; j++) {
          const job = stage.jobs[j]
          const statusjob = statusStage.jobs[j]
          job.status = statusjob.status
          job.logId = job.pipelineId = statusjob.id
          job.duration = statusjob.duration
          job.setup_status = statusjob.setup_status
          job.started_at = statusjob.started_at
          job.vm_status = statusjob.vm_status
          job.vm_info = statusjob.vm_info
          job.fast_fail_cancel = statusjob.fast_fail_cancel
          job.mixed_info = statusjob.mixed_info
          job.have_retried_history = statusjob.have_retried_history
          job.warning = statusjob.warning
          job.canceled_by_name = statusjob.canceled_by_name
          if (!job.variables) {
            job.variables = {}
          }
          if (job?.variables?.expand === undefined) {
            job.variables.expand = true
          }
          console.log(job.isManualExpand)
          if (statusjob.expand && job?.variables?.expand && !job.isManualExpand) {
            job.taskShow = false
          }
          let taskMarkNumber = 0
          let prev = 0
          for (let k = 0; k < job.tasks.length; k++) {
            const task = job.tasks[k]
            const statusTask = statusjob.tasks[k]
            task.status = statusTask.status
            task.logId = statusTask.id
            task.duration = statusTask.duration
            task.setup_status = statusTask.setup_status
            task.started_at = statusTask.started_at
            task.runActive = statusTask.active
            task.subpipeline_url = statusTask.subpipeline_url
            task.message_count = statusTask.message_count
            task.message_left_count = statusTask.message_left_count
            task.progress_in_percent = statusTask.progress_in_percent
            task.jobRunId = job.logId
            // task省略号标记
            if (task.status === 'failed') {
              if (taskMarkNumber + 1 !== k) {
                job['taskMark' + k] = {
                  start: k,
                  total: 1
                }
                prev = k
                task.taskMark = prev
              }
              if (taskMarkNumber + 1 === k) {
                if (job['taskMark' + prev]?.total) {
                  job['taskMark' + prev].total += 1
                }
                task.taskMark = prev
              }
              taskMarkNumber = k
            }
          }
        }
      }
      if (data.status !== 'pending' && data.status !== 'running') {
        // 获取流水线运行详情
        // getPipelineRunDetail()
        // newRunDetail()
      }
      variableRef.current.detailExecData = data
      setData({ ...data })
      // 停止定时器
      if (data.status === 'running' || data.status === 'pending') {
        clearTimeout(delayRequestRef.current)
        variableRef.current.retryTimer = setTimeout(() => {
          repeatPipelineStatus()
        }, 1000);

      }
    }
  }

  const getPipelineConfigDetail = async () => {
    setLoading(true)
    let params = { run_iid: runIid, id: triggerId }
    !runIid && delete params?.run_iid
    !triggerId && delete params?.id
    // 后退时去除id
    if (isBack.current) {
      delete params?.id
    }
    const { data = [] } = await pipelineConfigDetailApi(pipelineId, params)
    const _config = data?.[0] || {}
    const { p_uid, from, p_verison, p_id, name, run_iid } = _config
    version = p_verison, pipelineName = name;
    if (location?.pathname?.includes('?pipelineId=')) {
      if (!isBack.current) {
        replaceURL()
      }
    }
    if (!p_id) return;
    configDetailRef.current = _config
    await setPipelineId(p_uid)
    await setTriggerId(p_id)
    await setConfigData(_config)
  }


  const triggerPipeline = async () => {
    const params = {
      // repo_url: '',
      // ref: '',
      // sha: '',
      // before_sha: '',
      // trigger_by: '用户id',
      trigger_type: 'MANUAL'
    }
    return await triggerPipelineApi(pipelineId, params)
  }

  const renderText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中'
      case 'running':
        return '运行中'
      case 'canceled':
        return '已取消'
      case 'success':
        return "运行成功"
      case 'failed':
        return "运行失败"
      case 'timeout':
        return "超时"
      case 'skipped':
        return "跳过"
      case 'manual_confirm':
        return "待审核"
    }
  }

  const renderVersion = useMemo(() => {
    const { config_version, creator_user_id, } = runData || {}
    return <div className='versionTitle'>
      Version: {config_version}
      <Popover content='版本对比' trigger="hover">
        <Button disabled={!checkPipilineAuth('EditHistory', uuid) || config_version === 1 || !isAuth} onClick={() => handleCopyPipeline(config_version)} type="link" size='small'><SwapOutlined /></Button>
      </Popover>
    </div>
  }, [runData, isAuth])


  const reset = (data) => {
    const detailData = deepCopy(data)
    const template = detailData.template
    // // 添加初始化状态
    template.forEach(stage => {
      stage.status = 'pending'
      stage.jobs.forEach(job => {
        job.status = 'pending'
        job.tasks.forEach(step => {
          step.status = 'pending'
        })
      })
    })
    variableRef.current.detailExecData = detailData
    // setData({ ...detailData })
  }

  const switchTab = (index: number) => {
    setTabIndex(index)
  }

  const handleCancel = async () => {
    if (!checkPipilineAuth('Cancel', uuid)) {
      message.error('暂无权限')
      return
    }
    try {
      await cancelAllJobApi(triggerId)
      message.success('终止构建请求发送成功，请稍后..')
    } catch (error) {
      console.log(error);
    } finally {
    }
  }

  const judgeEdit = async () => {
    const res = await canEditApi({ uuid: pipelineId })
    const { status, } = res || {}  // true 可以编辑，false为不可编辑
    return status
  }

  const edit = async () => {
   navigate(setCompatiblePath(`/FlowLine/created/modify?pipelineId=${pipelineId}&tab=1`))
  }

  const exec = async () => {

  }

  const goHistory = () => {
    if (!checkPipilineAuth('History', uuid)) {
      message.error('暂无权限')
      return
    }
    props.history.push(setCompatiblePath(`/FlowLine/created/recentlyRun?pipelineId=${pipelineId}&pipelineName=${data?.name || configData?.name}`))
    // props.history.push(`/FlowLine/recentlyRun?pipelineId=${pipelineId}&pipelineName=${data?.name}`)
  }

  const prev = () => {
    currentStagePendingPositon.current = 1
    const info = runData.next_run_info
    handleSwitchPipeline('prev', info)
  }

  const next = () => {
    currentStagePendingPositon.current = 1
    const info = runData.last_run_info
    handleSwitchPipeline('next', info)
  }

  const handleSwitchPipeline = (type, info) => {
    if (info) {
      submitCallback(info.id, 'detail')
    } else {
      if (type === 'prev') {
        message.warn('已是最新啦...')
      } else {
        message.warn('已经到底啦...')
      }
    }
  }

  const submitCallback = (triggerId, from?) => {
    isFirstLoadDetail.current = true
    isLastStage.current = true
    if (variableRef.current) {
      clearTimeout(variableRef.current.retryTimer)
    }
    setTriggerId(triggerId)

    const urlParams: any = {
      pipelineId,
      triggerId,
    }

    if (version) {
      urlParams.version = version
    }
    if (from !== 'detail') {
      setTabIndex(0)
    }

    variableRef.current.detailExecData.stages.forEach((stage) => {
      stage.jobs.forEach((job, index) => {
        job.isManualExpand = undefined
      })
    })
    isFirstScrollLoad.current = true
  }

  const goRerecord = () => {
    props.history.push(setCompatiblePath(`/FlowLine/created/recentlyRun?pipelineId=${pipelineId}&pipelineName=${encodeURIComponent(configData?.name) || ''}`))
  }

  const renderState = (status: string) => {
    return (
      <>
        {
          status === 'success' && <i className='iconfont icon-success-filling flow-color-success flex-center'></i>
        }
        {
          (status === 'failed' || status === 'timeout') && <CloseCircleOutlined style={{ color: '#e23f3c' }} />
        }
        {
          status === 'pending' && <>
            <i className='iconfont icon-stopcircle iconfont-stopcircle  flex-center flow-color-pending' style={{ fontSize: '14px' }} onClick={() => handleCopyPipeline()}></i>
            {/* <MinusCircleOutlined className='flow-color-pending iconfont' onClick={() => handleCancel()} /> */}
          </>
        }
        {
          (status === 'canceled') && <>
            {/* <PlayCircleOutlined className='flow-color-cancel iconfont' /> */}
            <StopOutlined style={{ marginTop: '0px', color: '#f8b300', fontSize: '15px' }} />
          </>
        }
        {
          (status === 'skipped') && <>
            <i className='iconfont icon-tiaoguofenxiang success-icon'></i>
          </>
        }
        {
          status === 'running' && <>
            <i className='iconfont icon-stopcircle iconfont-stopcircle flow-color-running  flex-center' onClick={() => handleCopyPipeline()}></i>
          </>
        }
      </>
    )
  }

  const renderHandle = () => {
    return <>
      {/* 操作 */}
      <div className='flex-start content-tab-header-handle'>
        <Popover content="运行记录">
          <Button disabled={!checkPipilineAuth('History', uuid) || !isAuth} onClick={handleCopyPipeline} icon={<HistoryOutlined />}></Button>&nbsp;&nbsp;
        </Popover>
        {/* {
          !isUserAuth(currentUser, data?.creator_user_id) ? <Tooltip placement="top" title={'暂无权限编辑'}>
            <Button className='flex-center' onClick={edit} icon={<EditOutlined className='flow-created-EditOutlined-icon' />} disabled></Button>
          </Tooltip> :
            <Popover content='编辑'>
              <Button className='flex-center' onClick={edit} icon={<EditOutlined className='flow-created-EditOutlined-icon' />} ></Button>
            </Popover>
        } */}
        <Popover content='编辑'>
          <Button className='flex-center' onClick={edit} icon={<EditOutlined className='flow-created-EditOutlined-icon' />} ></Button>
        </Popover>

        &nbsp;&nbsp;
        {
          commonHandleTriggerType(data?.setting?.trigger_type) ? <Tooltip placement="bottomRight" title={commonHandleTriggerType(data?.setting?.trigger_type)}>
            <Button className='flex-center' type='primary' icon={<SyncOutlined className='flow-created-EditOutlined-icon' />} disabled></Button>
          </Tooltip> :
            <Popover content='重新执行'>
              <Tooltip placement="left" title={commonHandleTriggerType(data?.trigger_type)}>
                <Button type='primary' disabled={(!data || !!commonHandleTriggerType(data?.trigger_type)) || !checkPipilineAuth('Trigger', uuid)} className='flex-center' onClick={() => handleCopyPipeline({ ...runData })} icon={<SyncOutlined className='flow-created-EditOutlined-icon' />} ></Button>
              </Tooltip>
            </Popover>
        }
        {<RenderMoreButton data={data} {...props} uuid={uuid} isAuth={isAuth} />}
        {/* <Button onClick={edit} type='primary'>编辑</Button> */}
        {/* <Button type='primary' onClick={exec}>在执行一次流水线</Button> */}
        {/* <Button type='primary' onClick={preview}>预览</Button> */}
      </div>
    </>
  }

  const renderTabAll = () => {
    return <>
      <div className={`content-tab-item ${0 === tabIndex && 'item-action'}`} onClick={() => handleCopyPipeline(0)}>
        <h3>执行详情</h3>
        {
          0 === tabIndex && <div className='item-line'></div>
        }
      </div>
      <div className={`content-tab-item ${1 === tabIndex && 'item-action'}`} onClick={() => handleCopyPipeline(1)}>
        <h3>制品查看</h3>
        {
          1 === tabIndex && <div className='item-line'></div>
        }
      </div>
      <div className={`content-tab-item ${2 === tabIndex && 'item-action'}`} onClick={() => handleCopyPipeline(2)}>
        <h3>构建结果</h3>
        {
          2 === tabIndex && <div className='item-line'></div>
        }
      </div>
      <div className={`content-tab-item ${3 === tabIndex && 'item-action'}`} onClick={() => handleCopyPipeline(3)}>
        <h3>数据洞察</h3>
        {
          3 === tabIndex && <div className='item-line'></div>
        }
      </div>
      {
        data?.consumption && <div className={`content-tab-item ${4 === tabIndex && 'item-action'}`} onClick={() => switchTab(4)}>
          <h3>测试数据</h3>
          {
            4 === tabIndex && <div className='item-line'></div>
          }
        </div>
      }

    </>
  }

  const renderTab = () => {
    return (
      <div className='content-tab flex-space-between'>
        {/* tab */}
        <div className='content-tab-left flex-start'>
          {
            renderTabAll()
          }
          {/* {
            tabList.map((item, index) => (
              <div key={item.id} className={`content-tab-item ${index === tabIndex && 'item-action'}`} onClick={() => switchTab(index)}>
                <h3>{item.name}</h3>
                {
                  index === tabIndex && <div className='item-line'></div>
                }
              </div>
            ))
          } */}
          {
            <div className='flow-detail-swtich-record flex-start' ref={swtichRecordRef}>
              <div className='arrow'>
                <Button size='small' disabled={!runData.last_run_info} icon={<LeftOutlined />} type='text' loading={loading} onClick={handleCopyPipeline}></Button>
              </div>
              #{runData.number || 0}
              <div className='arrow'>
                <Button size='small' disabled={!runData.next_run_info} icon={<RightOutlined />} type='text' loading={loading} onClick={handleCopyPipeline}></Button>
              </div>
            </div>
          }
        </div>
        {/* 数据 */}
        <div className='content-tab-right flex-space-between'>
          <div className='content-tab-right-item flex-start'>
            <h3>流水线名称：</h3>
            <span className='common-Jumpable-color' style={{ cursor: 'pointer', maxWidth: '170px', whiteSpace: 'nowrap' }} onClick={handleCopyPipeline}>
              {
                data?.name && <Tooltip title={data?.name}>
                  {data?.name?.length > 6 ? data?.name.substr(0, 6) + '...' : data?.name}
                </Tooltip>
              }
            </span>
            （{renderVersion}）
          </div>

          {
            (runData.branch || runData.patchset) ? <Tooltip color='#fff' title={<>
              <div className='flex-start' style={{ fontSize: '12px', color: '#000' }}>
                <h3 style={{ margin: 0, fontSize: '12px', color: '#c4cdd6', whiteSpace: 'nowrap' }}>仓库：</h3>
                <span>{runData.project_path}</span>
              </div>
              <div className='flex-start' style={{ fontSize: '12px', color: '#000' }}>
                <h3 style={{ margin: 0, fontSize: '12px', color: '#c4cdd6', whiteSpace: 'nowrap' }}>分支/Patchset：</h3>
                {renderColumnBranch(runData)}
              </div>
            </>}>
              <div className='content-tab-right-item flex-start' style={{ cursor: 'pointer' }}>
                <h3>状态：</h3>
                <span className={`flow-color-${data?.status} flex-start`} style={{ fontSize: '12px', backgroundColor: '#fafbfd' }}>{renderState(data?.status)}&nbsp;{renderText(data?.status)}</span>
              </div>
            </Tooltip> : <div className='content-tab-right-item flex-start' >
              <h3>状态：</h3>
              <span className={`flow-color-${data?.status} flex-start`} style={{ fontSize: '12px', backgroundColor: '#fafbfd' }}>{renderState(data?.status)}&nbsp;{renderText(data?.status)}</span>
            </div>
          }
          <Tooltip color='#fff' title={<>
            <div className='flex-start' style={{ fontSize: '12px', color: '#000' }}>
              <h3 style={{ margin: 0, fontSize: '12px', color: '#c4cdd6', whiteSpace: 'nowrap' }}>开始时间：</h3>
              <span>{moment(data?.started_at).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
          </>}>
            <div className='content-tab-right-item  flex-start' style={{ cursor: 'pointer' }}>
              <h3>执行耗时：</h3>
              <span >{data?.status === 'pending' || data?.status === 'running' || !data?.status ? '--' : formatTime(runData?.duration || 0)}</span>
            </div>
          </Tooltip>

          <div className='content-tab-right-item  flex-start'>
            <h3>触发人：</h3>
            <span >{runData?.trigger_by_display_name}&nbsp;&nbsp;</span>
          </div>
          {renderHandle()}
        </div>
      </div>
    )
  }

  const renderPipelineContent = () => {
    if (!data) {
      return <div className='content-container common-content-container' id='content-container'>
        <br /><br /><br /><br />
        {loading && <PageLoading />}
        {!loading && <Empty description={'运行记录不存在或您没有权限查看该记录'} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      </div>
    }
    // return <div className='content-container common-content-container' style={{ height }}>
    return <div className='content-container common-content-container' id='content-container'>
      <div className='common-reset' style={{ display: tabIndex === 0 ? 'block' : 'none' }}>
        <Flow data={data} type={3} setData={setData} repeatPipelineStatus={repeatPipelineStatus} ref={flowRef} newRunDetail={newRunDetail} />
      </div>
      <div className='common-reset' style={{ display: tabIndex === 1 ? 'block' : 'none' }}>
        {
          tabIndex === 1 && <BuildDownload tabIndex={tabIndex} triggerId={triggerId} runData={runData} />
        }
      </div>
      <div style={{ display: tabIndex === 2 ? 'block' : 'none' }}>
        {
          tabIndex === 2 && <CriticalData tabIndex={tabIndex} id={runData?.id || triggerId} configData={configData} data={data} />
        }

      </div>
      <div style={{ display: tabIndex === 3 ? 'block' : 'none' }}>
    
      </div>

    </div>
  }

  const renderVariablesValue = (item) => {
    let value = item.value
    switch (item.type) {
      case 'bool':
        value = String(value || '')
        break
      case 'multiple':
        const v = value || []
        value = v.join('、')
        break
    }
    return value || '-'
  }

  const renderRepoValue = (item) => {
    const value = item.value
    // 处理仓库
    if (item.repo_info && item.repo_info.length > 0) {

    }
    if (typeof value === 'boolean') {
      return String(value)
    }
    return value || '-'
  }

  const handleRepoValue = (repo) => {
    if (repo?.length <= 0) {
      return []
    }
    const repoList = repo?.[0]?.repo_info
    const list = []
    if (!repoList) {
      return []
    }
    repoList.forEach((item, index) => {
      const currentList = []
      currentList.push(
        { key: 'repo_name', value: item.base_info.name, displayName: item.base_info.display_name },
        { key: 'repo_url', value: item.base_info.repo_url, displayName: item.base_info.display_name },
      )
      const type = item.branch_patchset.type
      switch (type) {
        case 'branch':
          currentList.push(
            { key: 'branch', value: item.branch_patchset.ref, displayName: item.branch_patchset.display_name },
            { key: 'commit', value: item.commit.sha, displayName: item.commit.display_name },
          )
          break
        case 'patchset':
          currentList.push(
            { key: 'patchset', value: item.branch_patchset.patchset, displayName: item.branch_patchset.display_name },
          )
          break
        case 'tag':
          currentList.push(
            { key: 'tag', value: item.branch_patchset.tag, displayName: item.branch_patchset.display_name },
          )
          break
      }
      const repoList = data?.setting?.pipeline_variable?.filter(item => item.type === 'repo' && item.prompt_on_trigger)?.reverse()
      const name = repoList?.[index]?.repo?.[0]?.['repo-display_name'] || ''
      list.push(...currentList.map(k => {
        k.key = `${name || `仓库${item.index}${k.displayName ? `-${k.displayName}` : ''}`}（${k.key}）`
        return k
      }))
    })

    return list
  }

  const handleOtherValue = (list) => {
    return list.map(itemData => {
      const item = { ...itemData }
      if (item.display_name) {
        item.key = `${item.display_name}（${item.key}）`
      }
      return item
    })
  }

  const goParentPipeline = () => {
    window.open(data?.parent_url)
  }

  const renderVariableList = () => {
    const variables = runData?.trigger_info?.variables || []
    if (variables.length <= 0) {
      return <></>
    }
    const filterParameters = ['isBranch']
    const otherList = variables.filter(item => !filterParameters.includes(item.key) && !item.repo_info)
    const other = handleOtherValue([...otherList])
    const repoValue = handleRepoValue(variables.filter(item => !filterParameters.includes(item.key) && item.repo_info))
    const list = [...other, ...repoValue].filter(item => item.key)
    return <div className='pipeline-detail-varable-list flex-start' >
      <div className='varable-list-title'>触发参数</div>
      <ul className='list-varables common-reset' ref={varablesListRef} style={{ height: variableMore ? 'auto' : '18px' }}>
        {
          list.map(item => (
            <li className='list-varables-item'>
              <Tooltip overlayClassName="pipeline-detail-varables-item-tooltip" placement="topLeft" title={`${item.key}：${String(item.value || '') || '-'}`} >
                <span style={{ color: '#7F7F7F', fontWeight: 'bold' }}>{item.key}：</span>
                {renderVariablesValue(item)}
              </Tooltip>
            </li>
          ))
        }
      </ul>
      <div ref={varableListArrowRef} style={{ position: 'relative' }}>
        <div onClick={() => handleCopyPipeline(!variableMore)} className={`varable-list-arrow flex-center ${variableMore && 'varable-list-arrow-active'}`}><DownOutlined /></div>
      </div>
    </div>

  }

  const renderAlerts = () => {
    return <div className='content-alerts-container'>
      {
        data?.alerts?.map((item, index) => (
          <>
            <Alert
              style={{ marginBottom: '5px' }}
              description={<div>
                <span>流水线报错{index + 1}/{data?.alerts?.length}：{item.name} 失败</span>
                {/* <span>{item.message}</span> */}
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;点击 <a target='_blank' href={item.url} rel="noreferrer">查看详情</a></span>
              </div>}
              type={item.level}
              showIcon
              closable
            />
          </>
        ))
      }
    </div>
  }

  const renderPipeline = () => {
    return (
      <div className='pipeline-detail-content'>
        {renderTab()}
        {tabIndex === 0 && renderAlerts()}
        {(tabIndex === 0 || tabIndex === 1) && renderVariableList()}
        {renderToolButton()}
        {renderPipelineContent()}
      </div>
    )
  }


  const renderToolButton = () => {
    if (tabIndex !== 0) {
      return <></>
    }
    return <>
      <br />
      <div className='flex-start detail-content-tool-button-box'>
        <RenderToolButton data={data} setData={setData} setTaskShow={setTaskShow} taskShow={taskShow} ref={renderToolButtonRef} />
        <ProgressComponent data={data} computedScrollDistance={computedScrollDistance} />
        {
          (runData.branch || runData.patchset) && <div style={{ marginLeft: '30px', whiteSpace: 'nowrap' }} className='flex-start'>
            <div className='flex-start' style={{ fontSize: '12px', color: '#000', marginRight: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '12px', color: '#868686', whiteSpace: 'nowrap' }}>仓库：</h3>
              <span>{runData.project_path}</span>
            </div>
            <div className='flex-start' style={{ fontSize: '12px', color: '#000' }}>
              <h3 style={{ margin: 0, fontSize: '12px', color: '#868686', whiteSpace: 'nowrap' }}>分支/Patchset：</h3>
              {renderColumnBranch(runData)}
            </div>
          </div>
        }
        {
          data?.parent_url && <Button type='link' icon={<i className='iconfont icon-logo-pipeline' style={{ fontSize: '12px', marginRight: '3px' }}></i>} ghost onClick={handleCopyPipeline} style={{ marginLeft: '20px' }} size='small'>跳转父流水线（{data?.parent_name}）</Button>
        }
        {
          data?.author?.display_name && <div style={{ marginLeft: '10px' }}>
            <span style={{ color: '#868686' }}>作者：</span>
            {data?.author?.display_name || '-'}
          </div>
        }

      </div>
    </>
  }

  const renderMap = () => {
    if (!data || tabIndex !== 0) {
      return <></>
    }
    return <MinMap data={data} type={3} />
  }

  return (
    <PageContainer>
      <div className='pipeline-container pipeline-detail-container replace-font-size-12' ref={variableRef}>
        {renderPipeline()}
        <span className="common-reset">
          {renderMap()}
          <ExecModal ref={execModalRef} {...props} submitCallback={submitCallback} />
        </span>
      </div>
    </PageContainer>
  );
}

export default Project
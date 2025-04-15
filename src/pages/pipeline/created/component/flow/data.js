import moment from "moment"
import { formatHour } from '@/utils'

export const tabList = [
  {
    id: 1,
    name: '流水线',
  },
  {
    id: 2,
    name: '通知',
  },
  {
    id: 3,
    name: '基础设置',
  },
]

export const stageTemplate = () => {
  return {
    id: 1,
    name: 'stage-1',
    type: 1,
    jobs: [],
    showAddButton: false,
    active: true
  }
}

export const jobTemplate = () => {
  return {
    id: 1,
    name: 'job',
    type: 2,
    tasks: [],
    active: true
  }
}

export const stepTemplate = () => {
  return {
    id: 1,
    name: 'task',
    type: 3,
    vaildFormError: true,
    active: true,
    allow_failure: false,
    run_condition: 'pre_task_success'
  }
}


export const setTimer = (data, update, type) => {
  const startTimer = () => {
    data.timer = setTimeout(() => {
      if (type !== 3) {
        stopTimer()
      }
      data.localDuration += 1
      startTimer(data)
      update && update()
    }, 1000);
  }

  const stopTimer = () => {
    clearTimeout(data.timer)
    data.timerRunning = false
  }

  const handleStartTime = () => {
    const { started_at } = data
    const nowTimerFormat = moment(new Date).format('YYYY-MM-DD HH:mm:ss')
    const nowTime = moment(nowTimerFormat).valueOf();
    const startTime = moment(moment(started_at || nowTimerFormat).format('YYYY-MM-DD HH:mm:ss')).valueOf();
    const value = (nowTime - startTime) / 1000
    return value
  }

  if (type !== 3) {
    return
  }


  const { status } = data
  switch (status) {
    case 'running':
      if (data.timerRunning) {
        return
      }
      const start = handleStartTime()
      data.localDuration = start
      data.duration = 0
      startTimer(data)
      data.timerRunning = true
      break
    case 'success':
    case 'failed':
    case 'timerout':
    case 'canceled':
    case 'skipped':
      stopTimer(data)
  }
}


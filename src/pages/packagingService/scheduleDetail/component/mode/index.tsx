import React, { useState, useImperativeHandle, forwardRef, useRef, useEffect, } from 'react'
import Form from '@/pages/packagingService/component/schedule/component/form'
import { message } from 'antd'
import moment from 'moment'
import { getPipelineUuid } from '@/pages/packagingService/commonComponent'
import { editSchedule, } from '@/pages/packagingService/service'

const page = (props: any, ref: any) => {
  const { query = {}, progressInfo, getProgress = () => { } } = props || {}
  const formRef = useRef(null)

  useImperativeHandle(ref, () => ({
    saveSchedule,
  }))

  const saveSchedule = async () => {
    await formRef.current?.validateFields()
    const { id } = query || {}
    let { schedule = false, hour_minute, day_of_week = [] } = await formRef.current?.getValues()
    const _timed = {
      schedule: {
        day_of_week,
        hour_minute: hour_minute ? moment(hour_minute).format('HH:mm') : '00:00',
        type: 'basic',
      },
      // trigger_info: null,
      enable: schedule,
    }
    const { success = false } = await editSchedule({ id, pipeline_uuid: getPipelineUuid() }, _timed)
    if (success) {
      message.success('保存成功')
      getProgress()
    }
    console.log('---schedule---', _timed, schedule, hour_minute, day_of_week, formRef.current?.getValues());
  };

  return <div className='scheduleDetail-container'>
    <div className='left'>
      <div className='item active'>定时任务</div>
    </div>
    <div className='right'>
      <p><b>定时编包</b> &nbsp;按照设置时间进行执行</p><br />
      <Form ref={formRef} info={progressInfo} />
    </div>
  </div>;
}

export default forwardRef(page)
import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { Modal } from 'antd';
import moment from 'moment';
import Form from './component/form'
import { createSchedule } from '@/pages/packagingService/service'
import './style.less'

const Schedule = (props, ref: any) => {
  const { getPipelineUuid, setTabAction = () => { }, refreshList = () => { }, } = props
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [record, setRecord] = useState({})
  const formRef = useRef(null);

  useImperativeHandle(ref, () => ({
    show,
    close,
    setIsModalOpen,
  }));

  const show = (record: Object) => {
    formRef.current?.resetFields()
    setRecord(record);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    await formRef.current?.validateFields()
    const { id } = record || {}
    let { schedule = false, hour_minute, day_of_week = [] } = await formRef.current?.getValues()
    const _timed = {
      schedule: {
        day_of_week,
        hour_minute: hour_minute ? moment(hour_minute).format('HH:mm') : '00:00',
        type: 'basic',
      },
      // trigger_info: {
      //   trigger_type: 'SCHEDULED'
      // },
      enable: schedule,
      pipeline_run_info_id: id,
    }
    const res = await createSchedule(getPipelineUuid(), _timed)
    console.log('---schedule---', _timed, schedule, hour_minute, day_of_week, formRef.current?.getValues());
    const { success = false } = res || {}
    if (!success) return
    schedule && formRef.current.timedReminder(() => {
      setTabAction(4)
      refreshList()
    })
    setIsModalOpen(false)
    formRef.current.resetFields()
  };

  const close = () => {
    setIsModalOpen(false);
  };

  return (
    <Modal title='定时任务' open={isModalOpen} onOk={handleOk} onCancel={close}>
      <Form ref={formRef} />
    </Modal>
  );
};

export default forwardRef(Schedule);
import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { Form, Switch, Checkbox, TimePicker, Modal } from 'antd';
import { weekList } from '@/pages/packagingService/data';
import moment from 'moment';
import { ExclamationCircleOutlined } from '@ant-design/icons'

const page = (props: any, ref: any) => {
  const { info = {}, } = props
  const [execWeek, setExecWeek] = useState(false)
  const [form] = Form.useForm()

  useImperativeHandle(ref, () => ({
    form,
    timedReminder,
    getValues,
    validateFields,
    resetFields
  }))

  useEffect(() => {
    initData()
  }, [info])

  const initData = () => {
    !form.getFieldValue('hour_minute') && form.setFieldValue('hour_minute', moment('2023-12-28 00:00:00'))
    if (!info?.schedule) {
      // form.setFieldValue('hour_minute', moment('2023-12-28 00:00:00'))
      return
    }
    const { day_of_week, hour_minute = '00:00' } = info?.schedule || {}
    setExecWeek(info.enable)
    form.setFieldsValue({
      schedule: info.enable,
      day_of_week: day_of_week,
      hour_minute: moment(`2023-12-28 ${hour_minute}:00`),
    })
  }

  const getValues = () => {
    return form.getFieldsValue() || {}
  }

  const validateFields = () => {
    return form.validateFields()
  }

  const resetFields = () => {
    setExecWeek(false)
    form.resetFields()
  }

  const execChange = (checked: boolean) => {
    setExecWeek(checked);
    checked && form.validateFields(['day_of_week', 'hour_minute']);
  }

  const timedExecValid = (rule, value) => {
    const { field } = rule;
    if (form.getFieldValue('schedule')) {
      if (field === 'day_of_week' && (!value || value.length <= 0)) {
        return Promise.reject('请选择执行日');
      }
      if (field === 'hour_minute' && !value) {
        return Promise.reject('请选择执行时间');
      }
    }
    return Promise.resolve();
  }

  const timedReminder = (cb?: Function) => {
    Modal.confirm({
      title: '提醒',
      icon: <ExclamationCircleOutlined />,
      content: '您设置了“定时任务”，将按照设置时间执行编包。可以在“定时任务”列表内查看任务详情',
      okText: '确认',
      onOk: () => {
        cb && cb()
      }
    });
  }

  return <>
    <Form form={form} layout='vertical'>
      <Form.Item name="schedule" label="启用定时执行" valuePropName="checked">
        <Switch defaultChecked={false} onChange={execChange} />
      </Form.Item>
      <Form.Item name="day_of_week" label="执行日" rules={[{ required: true, validator: timedExecValid }]}>
        <Checkbox.Group disabled={!execWeek}>
          {weekList?.map(({ label, value }) => (
            <Checkbox value={value} >{label}</Checkbox>
          ))}
        </Checkbox.Group>
      </Form.Item>
      <Form.Item name="hour_minute" label="执行时间" rules={[{ required: true, validator: timedExecValid }]}>
        <TimePicker disabled={!execWeek} defaultValue={moment('2023-12-28 00:00:00')} format='HH:mm' allowClear={false} />
      </Form.Item>
    </Form>
  </>;
}

export default forwardRef(page)
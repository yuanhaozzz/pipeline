import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, Tabs, message, Radio, Checkbox, TimePicker } from 'antd'

import EnvironmentVariable from '../../../baseConfig/component/environmentVariable'
import Env from '../../../preview/components/env'
import { searchPipelineApi, addApi, detailApi, editApi } from './service'
import { formatVariabledValue } from '../../../execModal/data'
import EditorComponent from '@/components/Editor';

import './style.less'
import moment from 'moment'
import { formatPrevVariables } from '../../../execModal/data'
import { getUrlParams } from '@/utils'

const { TextArea } = Input;
export interface IAppProps {
  updateList(): any
}

function LoadModal(props: IAppProps, ref: any) {
  const { updateList } = props

  const [modal, setModal] = useState(false)
  const [content, setContent] = useState('')
  const [activeKey, setActiveKey] = useState<any>('1')
  const [detail, setDetail] = useState([])
  const [data, setData] = useState(null)
  const urlParams = getUrlParams();

  // 1 新建 2 编辑 3 复制
  const [type, setType] = useState(-1)

  const variableRef = useRef(null)
  const environmentVariableRef = useRef(null)
  const envRef = useRef(null)
  const describeInitVal = useRef('')
  const uuid = useRef(urlParams.uuid)
  const envListRef = useRef([])
  const recordRef = useRef({})

  const [form] = Form.useForm();
  const [envForm] = Form.useForm();
  const [descriptionForm] = Form.useForm();


  useImperativeHandle(ref, () => ({
    open
  }))

  useEffect(() => {
    if (type > 0) {
      getDetail()
    }

  }, [type])

  const open = (record: any) => {
    uuid.current = record?.pipeline_uuid ? record.pipeline_uuid : urlParams.uuid
    setModal(true)

    setType(record.from)

    recordRef.current = record
  }

  const getDetail = async () => {
    try {
      const res = await searchPipelineApi(uuid.current)
      const data = res.data
      setData({ ...data })
      let { pipeline_variable: env = [] } = data.setting
      envListRef.current = env
      // 编辑、复制，获取详情
      if (type === 2 || type === 3) {
        const { data } = await detailApi(recordRef.current.id)
        const trigger_info = data.trigger_info
        const schedule = data.schedule
        if (schedule.hour_minute) {
          schedule.hour_minute = moment('2024/02/28 ' + schedule.hour_minute)
        }
        // 设置表单
        descriptionForm.setFieldsValue(trigger_info)
        setContent(trigger_info.description)
        describeInitVal.current = trigger_info.description
        form.setFieldsValue(schedule)
        // 修改环境变量值
        formatPrevVariables(trigger_info.variables, env, res.data, setData)
      }

      setDetail(env)
    } catch (error) {
      console.log(error)
    } finally {
    }
  }

  const onCancel = () => {
    setModal(false)
    setType(-1)
    form.resetFields()
    // envForm.resetFields()
    descriptionForm.resetFields()
    setActiveKey('1')
  }

  const submit = async () => {
    const env = await envForm.validateFields()
    const { description = '' } = await descriptionForm.validateFields()
    const trigger_info = {
      variables: formatVariabledValue(env, envListRef.current),
      "trigger_type": "SCHEDULED",
      description
    }
    try {
      let schedule = await form.validateFields()
      schedule.hour_minute = moment(schedule.hour_minute).format('HH:mm')
      if (schedule.type === 'cron') {
        schedule = {
          type: 'cron',
          cron: schedule.cron
        }
      }

      const params = {
        trigger_info,
        schedule,
      }

      if (type === 1 || type === 3) {
        await addApi(uuid.current, params)
      } else {
        await editApi(recordRef.current.id, params)
      }
      message.success(`${type === 1 ? '添加' : '编辑'}成功`)
      updateList()
      onCancel()

    } catch (error) {
      const { errorFields = [] } = error
      let errorInfo = errorFields[0]?.errors[0]
      if (!errorInfo.replace(/\s/g, '')) {
        if (errorFields.length > 1) {
          errorInfo = errorFields[1]?.errors[0]
        }
      }
      if (errorInfo) {
        message.error(errorInfo || '', 2)
      }
      setActiveKey('2')
    }

  }


  const tabChange = (key) => {
    setActiveKey(key)
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


  const validatorCron = (info, value) => {
    if (!value) {
      return Promise.reject('请填写 Cron 表达式')
    }
    return Promise.resolve()
  }

  const renderExecDate = () => {
    return <Form form={form} name="control-hooks" layout="vertical">
      <Form.Item name="type" label="执行方式" required initialValue='basic'>
        <Radio.Group >
          <Radio value='basic'>基础规则</Radio>
          <Radio value='cron'>自定义 </Radio>
        </Radio.Group>
      </Form.Item>


      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const type = form.getFieldValue('type')
            if (type === 'basic') {
              return <>
                <Form.Item name="day_of_week" label="执行日" initialValue={[]} rules={[{ required: true, message: '请选择' }]} >
                  <Checkbox.Group >
                    <Checkbox value={1}>周一</Checkbox>
                    <Checkbox value={2}>周二</Checkbox>
                    <Checkbox value={3}>周三</Checkbox>
                    <Checkbox value={4}>周四</Checkbox>
                    <Checkbox value={5}>周五</Checkbox>
                    <Checkbox value={6}>周六</Checkbox>
                    <Checkbox value={7}>周日</Checkbox>
                  </Checkbox.Group>
                </Form.Item>
                {/* defaultValue={moment('2023-12-28 00:00:00')}  */}
                <Form.Item name="hour_minute" label="执行时间" rules={[{ required: true, message: '请选择' }]} initialValue={moment('2023-12-28 00:00:00')}>
                  <TimePicker format='HH:mm' allowClear={false} style={{ width: '200px' }} />
                </Form.Item>
              </>
            }
            return <Form.Item name="cron" label="Cron 表达式" colon={false} required rules={[{ validator: validatorCron }]} className='flex-start' style={{ flex: 1 }} initialValue={'0 8 * * *'} >
              <div className='flex-start' style={{ alignItems: 'center' }}>
                <Form.Item name='cron' noStyle>
                  <Input placeholder='请输入 Cron 表达式，如： 0 8 * * *' style={{ width: '100%' }} />
                </Form.Item>&nbsp;&nbsp;
                <span className='link' style={{ whiteSpace: 'nowrap' }}>Cron 表达式教程，请参考<a href='https://docs.gitlab.com/ee/topics/cron/' target='_blank' className='common-link' rel="noreferrer">链接</a></span>
              </div>
            </Form.Item>
          }
        }
      </Form.Item>

    </Form>
  }

  const renderEnv = () => {
    if (detail.length <= 0) {
      return <div style={{ marginTop: '10px' }}>暂无环境变量...</div>
    }
    return <Env env={detail} form={envForm} ref={envRef} data={data} pipelineId={uuid.current} />
  }

  const optionsWithDisabled = [
    { label: '流水线变量', value: '1' },
    { label: '执行时间', value: '2' },
  ];

  const renderTitle = () => {
    switch (type) {
      case 1:
        return '新建'
      case 2:
        return '编辑'
      case 3:
        return '复制'
    }
  }

  return (
    <div ref={variableRef}>
      <Modal width={'800px'} title={<div style={{ fontSize: '14px' }}>
        {renderTitle()}定时任务<span style={{ color: '#AAAAAA', fontSize: '12px', marginLeft: '5px' }}>按照设置时间执行流水线</span>
      </div>} className='flow-created-scheduledTasks-detail-container' centered destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Button type="primary" onClick={submit}>确定</Button>,
      ]} open={modal} onCancel={onCancel}>
        <div style={{ margin: '15px 0' }}>
          {/* <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onTabClick={(key) => tabChange(key)}>
            <Tabs.TabPane tab="流水线变量" key="1"></Tabs.TabPane>
            <Tabs.TabPane tab="执行时间" key="2"></Tabs.TabPane>
          </Tabs> */}
          <Radio.Group
            options={optionsWithDisabled}
            onChange={(e) => tabChange(e.target.value)}
            value={activeKey}
            optionType="button"
            buttonStyle="solid"
          />

        </div>
        {/* 环境变量 */}
        <div className={`variable-container ${activeKey === '1' && 'variable-show'}`} id='flow-scheduledTasks-detail-scroll'>
          {
            // detail && <EnvironmentVariable ref={environmentVariableRef} data={detail} type={type} />
          }
          {/* 填写项 */}
          <Form layout="vertical" form={envForm} >
            {data && detail && renderEnv()}
          </Form >
          <br />
          {/* 描述 */}
          <Form layout="vertical" form={descriptionForm} className='env-form'>
            <div style={{ marginBottom: '7px' }}>描述：</div>
            <Form.Item label="" name="description" className='flowLine-desc-editor' style={{ padding: '0 10px' }}>
              <EditorComponent title='' content={describeInitVal.current} hideTitle={true} isSimple={true} />
            </Form.Item>
            {/* <Form.Item name="description" label="描述">
              <TextArea autoSize={{ minRows: 2 }} placeholder='定时触发描述' />
            </Form.Item> */}
          </Form >
        </div>
        {/* 执行时间 */}
        <div className={`variable-container ${activeKey === '2' && 'variable-show'}`} >
          {
            renderExecDate()
          }
        </div>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
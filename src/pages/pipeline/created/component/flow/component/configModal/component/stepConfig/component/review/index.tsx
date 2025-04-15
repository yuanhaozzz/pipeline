import React, { useEffect, useRef, useState } from 'react';
import { Form, Select, Input, Button, Radio, message, TimePicker, DatePicker, Checkbox, Space } from 'antd'
import { LoadingOutlined, SwapOutlined, UpOutlined, PlusOutlined, MinusCircleOutlined, PlusCircleOutlined, MinusOutlined } from '@ant-design/icons'

import './style.less'
import NewFindUser from '@/components/formComponent/newFindUser'
import Outlook from '@/components/formComponent/outlook'
import { useModel } from 'umi';
import { formatTime, isUserAuth, getLocalStorage } from '@/utils'
import { reviewStateApi, getReviewInfoApi } from './service'
import RadioComponent from '@/components/formComponent/radio'
import { day, minute, hour, dateOptions, weekData } from './data'
import moment from 'moment'

const { TextArea } = Input;
function Project(props) {
  const { form, from, config, onValuesChange, close } = props
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  const [reviewData, setReviewData] = useState<any>({})
  const [control, setControl] = useState(true)

  const [scheduledTasks, setScheduledTasks] = useState(false)

  const [formTest] = Form.useForm();

  const variableRef = useRef(null)
  const radioRef = useRef(null)

  useEffect(() => {
    if (config.variables.periodic) {
      setScheduledTasks(true)
    }
  }, [])


  const renderReviewText = (state) => {
    let text = <span>待审核 &nbsp;<LoadingOutlined /></span>
    let color = '#459fff'
    switch (state) {
      case 'PASS':
        text = <span>通过</span>
        color = '#4dcb4f'
        break
      case 'REJECT':
        text = <span>驳回</span>
        color = '#ff5656'
        break
      case 'TIMEOUT':
        text = <span>超时</span>
        color = '#ff5656'
        break
    }
    if (reviewData.result !== 'PENDING' && state === 'PENDING') {
      text = <span>-</span>
    }
    return <span style={{ color }}>{text}</span>
  }

  const validatorUser = (info, value = []) => {
    const direct_leader = form.getFieldValue('direct_leader')
    if (direct_leader) {
      return Promise.resolve()
    }
    if (value.length <= 0) {
      return Promise.reject('请至少选择一个操作人')
    }
    return Promise.resolve()
  }

  const getVarStrValue = (str) => {
    const regex = /^\$\{[\s\S]*?\}$/;
    return regex.test(str)
  }

  const validatorUserInput = (info, value = []) => {
    if (from === 3) {
      return Promise.resolve()
    }
    const direct_leader = form.getFieldValue('direct_leader')
    if (direct_leader) {
      return Promise.resolve()
    }
    if (!value || value.length <= 0) {
      return Promise.reject('请输入 ${xxx} 格式')
    }
    if (!getVarStrValue(value)) {
      return Promise.reject('请输入 ${xxx} 格式')
    }

    return Promise.resolve()
  }


  const validatorDate = (info, value) => {
    const periodic = form.getFieldValue('periodic')
    if (periodic) {
      return Promise.resolve()
    }
    if (!value) {
      return Promise.reject('请选择任务时长时间')
    }
    const currentDateTime = moment();
    const expirationDateTime = moment(value);
    if (currentDateTime.isAfter(expirationDateTime)) {
      return Promise.reject('需大于当前时间')
    }
    return Promise.resolve()
  }


  function disabledDate(current) {
    // 禁止选择小于当前时间的日期
    return current && current < moment().startOf('day');
  }


  const validatorTimePicker = (info, value) => {
    const periodic = form.getFieldValue('periodic')
    if (periodic) {
      return Promise.resolve()
    }
    const day = form.getFieldValue('review_day')
    const hour = form.getFieldValue('review_hour')
    const minute = form.getFieldValue('review_minute')
    const sum = day + hour + minute
    if (sum <= 0) {
      return Promise.reject('至少大于0')
    }
    return Promise.resolve()
  }

  const renderExtraFooter = () => (
    <div className='flex-space-between' style={{ padding: '0 4px' }}>
      <div>天</div>
      <div>小时</div>
      <div>分钟</div>
    </div>
  );

  const handleRemove = (e, remove, index, name) => {
    e.stopPropagation()
    remove(name)
    form.validateFields()
  }

  const handleAdd = (add) => {
    add()
    setTimeout(() => {
      form.validateFields()
    }, 200);
  }

  const validatorInterval = (info, value) => {
    const reg = /^[1-9]\d*$/
    if (!reg.test(value)) {
      return Promise.reject('1~10整数')
    }
    if (value > 10) {
      return Promise.reject('1~10整数')
    }
    return Promise.resolve()
  }

  const renderScheduledTasks = () => {
    const periodic = form.getFieldValue('periodic')
    const weekInterval = form.getFieldValue('week_interval')
    return <>
      <Form.Item name="periodic" valuePropName='checked' style={{ marginBottom: '0' }}>
        <Checkbox onChange={(e) => {
          form.validateFields(['confirm_expire_date', 'expired_at_date'])
          setScheduledTasks(e.target.checked)
        }}>周期任务</Checkbox>
      </Form.Item>
      {
        periodic && <>
          <div>
            <div className='common-form-required' style={{ width: '80px' }}>任务时间</div>
            <Form.Item label="" name='hour_minute' rules={[{ required: true, message: '请选择' }]}>
              <TimePicker format={'HH:mm'} />
            </Form.Item>
          </div>
          <div>
            <div className='common-form-required' style={{ width: '80px' }}>定期模式</div>
            <div className='flex-start' style={{ alignItems: 'flex-start' }}>
              <Form.Item label="" name='by' rules={[{ required: true, message: '请选择' }]} initialValue={'week'} style={{ margin: 0 }}>
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value='week'>周</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
              <div>
                <div className='flex-start' style={{ alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '7px' }}>重复间隔为(C)&nbsp;</div>
                  <Form.Item initialValue={2} name="week_interval" style={{ margin: 0 }} rules={[{ required: true, message: '' }, { validator: validatorInterval }]}>
                    <Input placeholder='1~10' style={{ width: '55px' }} onChange={(e) => {
                      const value = e.target.value
                      if (!value || value > 10) {
                        form.setFieldValue('week_index_week_day', undefined)
                        config.variables.week_index_week_day = undefined
                      }
                    }} />
                  </Form.Item>
                  <div style={{ marginTop: '7px' }}>&nbsp;周后的</div>
                </div>

              </div>
            </div>
            <div>
              <Form.Item name="week_index_week_day" rules={[{ required: true, message: '请选择' }]}>
                <Radio.Group >
                  {(weekInterval && weekInterval <= 10) && Array.from({ length: weekInterval }).map((item, index) => (
                    <div>
                      <Radio className='first-title'><b>第{index + 1}周</b></Radio>
                      {
                        weekData.map(weekItem => (
                          <Radio value={`${index + 1}-${weekItem.value}`}>{weekItem.label}</Radio>
                        ))
                      }
                    </div>
                  ))}
                </Radio.Group>
              </Form.Item>
            </div>
          </div>

        </>
      }
    </>
  }

  return (
    <div ref={variableRef} className='stepConfig-review-container'>
      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const from_trigger_env = form.getFieldValue('from_trigger_env')
            const isDisabled = from === 3 || form.getFieldValue('direct_leader')
            return <div className='flex-space-between'>
              {
                from_trigger_env
                  ?
                  <Form.Item name={'users'} label={'操作人'} style={{ flex: 1, marginBottom: '13px' }} rules={[{ required: !isDisabled, message: `格式错误`, validator: validatorUserInput }]}>
                    <Input
                      disabled={isDisabled}
                      placeholder='自定义格式为 ${x}'
                      style={{ height: '32px' }}
                    />
                  </Form.Item>
                  :
                  <NewFindUser formItem={{ label: '操作人', name: 'users', rules: [{ required: !isDisabled, message: '' }, { validator: validatorUser }], style: { marginBottom: '13px', flex: 1 } }} selectProps={{ mode: 'multiple', placeholder: '请选择操作人', disabled: isDisabled }} form={form} isInitLoad={true} idField={'user_id'} />
              }
              &nbsp;&nbsp;
              <Form.Item label="" name="from_trigger_env" style={{ marginTop: '16px' }} valuePropName="checked" initialValue={false} >
                <Checkbox
                  disabled={isDisabled}
                  onChange={(e) => {
                    config.variables.users = undefined
                    config.variables.userValue = undefined
                    form.setFieldValue('users', undefined)
                    form.setFieldValue('userValue', undefined)
                  }}
                >自定义</Checkbox>
              </Form.Item>
              {/* <Form.Item label="" name="direct_leader" noStyle valuePropName="checked" initialValue={false}>
                <Checkbox
                  onChange={(e) => {
                    config.variables.users = undefined
                    config.variables.userValue = undefined
                    form.setFieldValue('users', undefined)
                    form.setFieldValue('userValue', undefined)
                    form.validateFields(['users'])
                  }}
                >直属上级</Checkbox>
              </Form.Item> */}
            </div>

          }
        }
      </Form.Item>

      {
        // config?.atom_name === '人工任务' && <Form.Item name="event" label="类型" initialValue={'task'} style={{ marginBottom: '10px' }}>
        config?.atom_name?.startsWith('人工任务') && <Form.Item name="event" label="类型" initialValue={'task'} style={{ marginBottom: '10px' }}>
          <Radio.Group >
            <Radio value='task'>操作</Radio>
            <Radio value='approve'>审批</Radio>
          </Radio.Group>
        </Form.Item>
      }

      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const value = form.getFieldValue('confirm_expire')
            const confirmDateType = form.getFieldValue('expire_type')
            let label = '任务时长'
            const str = moment(value).format('HH:mm')
            const time = moment.duration(str).asMinutes()

            const confirm_expire_button = form.getFieldValue('confirm_expire_button')
            if (time > 0 && confirmDateType === 1) {
              label = `任务时长（${moment(value).format('HH')}小时${moment(value).format('mm')}分钟）`
            }

            return <div style={{ border: '1px solid #eee', padding: '5px 10px', marginBottom: '10px' }}>
              <Form.Item label={label} style={{ width: '100%', marginBottom: '0' }} >
                <div className='flex-start'>
                  <Form.Item name="expire_type" noStyle initialValue={'never'} style={{ width: '28%' }}>
                    <Radio.Group disabled={scheduledTasks}>
                      <Radio value='never'>无超时</Radio>
                      <Radio value='duration'>时间段</Radio>
                      <Radio value='timestamp'>时间点</Radio>
                    </Radio.Group>
                  </Form.Item>
                  {
                    confirmDateType === 'duration' && <>
                      {
                        confirm_expire_button === 1
                          ?
                          <Form.Item name="confirm_expire_var" noStyle rules={[{ required: true, message: '请输入' }]}>
                            <Input placeholder='请输入' style={{ width: '44%', height: '32px' }} disabled={scheduledTasks} />
                          </Form.Item>
                          :
                          <Form.Item name="confirm_expire_date" noStyle required rules={[{ validator: validatorTimePicker }]} style={{ width: '100%' }}>
                            <div className='flex-start'>
                              <Form.Item name="review_day" initialValue={0} style={{ width: '50px', margin: 0 }}>
                                <Select disabled={scheduledTasks} options={day} size='small' onChange={() => form.validateFields(['confirm_expire_date'])}></Select>
                              </Form.Item>
                              &nbsp;天&nbsp;
                            </div>
                            <div className='flex-start'>
                              <Form.Item name="review_hour" initialValue={0} style={{ width: '50px', margin: 0 }}>
                                <Select disabled={scheduledTasks} options={hour} size='small' onChange={() => form.validateFields(['confirm_expire_date'])}></Select>
                              </Form.Item>
                              &nbsp;小时&nbsp;
                            </div>
                            <div className='flex-start'>
                              <Form.Item name="review_minute" initialValue={0} style={{ width: '50px', margin: 0 }}>
                                <Select disabled={scheduledTasks} options={minute} size='small' onChange={() => form.validateFields(['confirm_expire_date'])}></Select>
                              </Form.Item>
                              &nbsp;分钟&nbsp;
                            </div>
                            {/* <TimePicker placeholder='请选择任务时长' style={{ width: '44%' }} format={'HH:mm:ss'} showNow={false} renderExtraFooter={renderExtraFooter} className='review-TimePicker-ok' /> */}

                          </Form.Item>
                      }
                    </>
                  }

                  {
                    confirmDateType === 'timestamp' && <>
                      {
                        confirm_expire_button === 1
                          ?
                          <Form.Item name="expired_at_var" noStyle rules={[{ required: true, message: '请输入' }]} >
                            <Input disabled={scheduledTasks} placeholder='请输入' style={{ width: '44%', height: '32px' }} />
                          </Form.Item>
                          :
                          <Form.Item name="expired_at_date" noStyle rules={[{ required: false, message: '' }, { validator: validatorDate }]}>
                            <DatePicker disabled={scheduledTasks} style={{ width: '44%' }} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" disabledDate={disabledDate} allowClear={false} />
                          </Form.Item>
                      }
                    </>
                  }
                  {
                    confirmDateType !== 'never' && <>
                      &nbsp;&nbsp;&nbsp;
                      <Form.Item name={'confirm_expire_button'} noStyle initialValue={2}>
                        <Button disabled={scheduledTasks} style={{ padding: '5px' }} icon={<SwapOutlined />} onClick={() => {
                          const v = confirm_expire_button === 1 ? 2 : 1
                          config.variables['confirm_expire_button'] = v
                          form.setFieldValue('confirm_expire_button', v)
                        }}>
                          {
                            confirm_expire_button === 1 ? '时间' : '变量'
                          }
                        </Button>
                      </Form.Item>
                    </>
                  }

                </div>
              </Form.Item>
              {
                renderScheduledTasks()
              }

            </div>
          }
        }
      </Form.Item>


      <Form.Item noStyle shouldUpdate>
        {
          () => {
            const expire_type = form.getFieldValue('expire_type')
            const confirmDate = form.getFieldValue(expire_type === 'never' ? 'remind_every' : 'remind_again_at') || 60
            const d = dateOptions.find(item => item.value === confirmDate)
            if (expire_type === 'never') {
              return <></>
              // return <Form.Item name="remind_every" label={`每隔${d?.label}提醒一次用户`} initialValue={60}>
              //   <Select
              //     options={dateOptions}
              //   />
              // </Form.Item>
            }
            return <Form.Item name="remind_again_at" label={`距离截止日期${d?.label}前再次提醒`} initialValue={60}>
              <Select
                options={dateOptions}
              />
            </Form.Item>
          }
        }
      </Form.Item>


      <Form.Item name="confirm_description" label="操作说明" rules={[{ required: true, message: '请输入操作说明' }]}>
        <TextArea
          placeholder="请填写操作说明"
          autoSize={{ minRows: 2, maxRows: 14 }}
        />
      </Form.Item>

      <Form.Item name="confirm_rule" label="验证者方式" initialValue='OR'>
        <Radio.Group>
          <Radio value='OR'>或签（一名审批人同意或拒绝即可）</Radio>
          <Radio value='AND'>会签（须所有审批人同意）</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item name="archive_comments" label="" initialValue={false} valuePropName='checked'>
        <Checkbox>将评论归档到构建结果</Checkbox>
      </Form.Item>
      {/* ------------运行时环境变量---------------- */}
      <div className='control-box flow-add-key-value-container '>
        <div className='control flex-space-between' onClick={() => setControl(!control)}>
          运行时环境变量
          <UpOutlined className={`control-arrow ${!control && 'control-arrow-action'}`} />
        </div>
        {
          <div className='form-control' style={{ display: control ? 'block' : 'none' }}>
            <Form.List name="runtime_var">

              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div className='item-runtime_var'>
                      <div className='flex-space-between' style={{ alignItems: 'flex-start', marginBottom: '5px' }}>
                        <Form.Item  {...restField} name={[name, 'key']} initialValue={''} rules={[{ required: true, message: '请输入' }]} style={{ marginBottom: '0px', width: '26%' }}>
                          <Input prefix={'key:'} maxLength={100} />
                        </Form.Item>
                        <Form.Item  {...restField} name={[name, 'display_name']} initialValue={''} style={{ marginBottom: '0px', width: '34%' }}>
                          <Input prefix={'显示名称:'} maxLength={100} />
                        </Form.Item>
                        <Form.Item  {...restField} name={[name, 'required']} initialValue={''} label="" valuePropName='checked' style={{ marginBottom: '0px' }}>
                          <Checkbox>必填</Checkbox>
                        </Form.Item>
                        <Form.Item  {...restField} name={[name, 'is_summarized']} initialValue={false} label="" style={{ margin: '0px' }} valuePropName='checked'>
                          <Checkbox >加入构建结果</Checkbox>
                        </Form.Item>
                        {
                          from === 1 && <div className='minus flex-center' onClick={(e) => handleRemove(e, remove, index, name)}><MinusOutlined /></div>
                        }

                      </div>
                      <Form.Item  {...restField} name={[name, 'description']} initialValue={''} label="描述" style={{ marginBottom: '0px' }}>
                        <TextArea
                          maxLength={100}
                          autoSize={{ minRows: 1, maxRows: 4 }}
                        />
                      </Form.Item>
                    </div>
                  ))}
                  {
                    <Form.Item>
                      {/* <Button type="dashed" onClick={() => {
                        add()
                      }} block icon={<PlusOutlined />}>
                        新增触发方式
                      </Button> */}
                      {/* 加 */}
                      {
                        from === 1 && <div className='plus flex-center' onClick={() => handleAdd(add)}>
                          {/* <PlusOutlined className='plus-icon' /> */}
                          {/* <Button icon={<PlusOutlined />} size='small' shape="circle"></Button> */}
                          <PlusOutlined />
                        </div>
                      }
                    </Form.Item>
                  }
                </>
              )}
            </Form.List>
          </div>
        }
      </div>

      {
        from === 3 && <>
          {/* <div style={{ marginBottom: '6px' }}>
            当前审核状态：{renderReviewText(reviewData.result)}
          </div> */}
        </>
      }

    </div>
  );
}

export default Project
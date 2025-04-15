import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, message } from 'antd'
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import FindUser from '@/components/findUser'

import { getPipelineDetailApi, triggerApi, } from './service'
import { getScheduleDetail, createSchedule, editSchedule, triggerVariablesApi, } from '@/pages/packagingService/service'
import './style.less'
import moment from 'moment';
import FirstComponent from './component/first'
import SecondComponent from './component/second'
import { setStatistics } from '@/utils/statistics'

export interface IAppProps {
  getPipelineUuid(): any
  refreshList(): any
  tabAction: number
  setTabAction(index: number): any
}

function LoadModal(props: IAppProps, ref: any) {
  const { getPipelineUuid, refreshList, setTabAction, tabAction } = props

  const [modal, setModal] = useState(false)
  const [step, setStep] = useState(1)
  const [detail, setDetail] = useState({})
  const [buildOptions, setBuildOptions] = useState({ components: [], options: [], package_type: {} })
  const [loading, setLoading] = useState(false)
  const [sumbitTxt, setSumbitTxt] = useState('立即编包')

  const variableRef = useRef(null)
  const firstComponentRef = useRef(null)
  const secondComponentRef = useRef(null)
  const detailVariableRef = useRef(null)
  const pipelineId = getPipelineUuid()

  useImperativeHandle(ref, () => ({
    open
  }))

  useEffect(() => {
    getData()
  }, [])

  const getData = async () => {
    try {
      const { data } = await getPipelineDetailApi(pipelineId)
      setDetail(data)
    } catch (error) {

    }
  }

  const getScheduleData = async (id) => {
    const { data } = await getScheduleDetail({ id, pipeline_uuid: pipelineId });
    setDetail(prev => {
      return { ...prev, ...data }
    })
  }

  const getTriggerVariables = async (id) => {
    const { data } = await triggerVariablesApi(id);
    setDetail(prev => {
      return { ...prev, ...data }
    })
  }

  const open = (params) => {
    setModal(true)
    if (!params) return;
    handleDetail(params)
    // getData()
  }

  const handleDetail = (params: any) => {
    detailVariableRef.current = params
    const { id, setMore = false, from = '' } = params || {}
    !id && firstComponentRef.current?.restSchedule()
    setTimeout(() => {
      setMore && firstComponentRef.current?.setMore(true)
    }, 0)
    id && from === 'scheduleDetail' && getScheduleData(id)
    id && from === 'copyTask' && getTriggerVariables(id)
  }

  const timedReminder = () => {
    Modal.confirm({
      title: '提醒',
      icon: <ExclamationCircleOutlined />,
      content: '您设置了“定时执行”，将在定时时间执行编包。可以在“定时任务”列表内查看任务详情',
      okText: '确认',
      // footer: <></>,
      onOk: () => {
        setTabAction(4)
        refreshList()
      }
    });
  }

  const handlecreateSchedule = async (firstData, params) => {
    const { day_of_week, hour_minute } = firstData || {}
    const _timed = {
      schedule: {
        day_of_week,
        hour_minute: hour_minute ? moment(hour_minute).format('HH:mm') : '00:00',
        type: 'basic',
      },
      trigger_info: {
        ...params,
        trigger_type: 'SCHEDULED'
      }
    }
    const res = await createSchedule(getPipelineUuid(), _timed)
    const { success = false } = res || {}
    handleCancel()
    success && timedReminder()
  }

  const handleEitSchedule = async (params: any = {}) => {
    try {
      const { id, from } = detailVariableRef.current || {}
      const { day_of_week, hour_minute, schedule } = await firstComponentRef.current?.getFormValue() || {}
      params.trigger_type = 'SCHEDULED'
      const _timed = {
        schedule: {
          day_of_week,
          hour_minute: hour_minute ? moment(hour_minute).format('HH:mm') : '00:00',
          type: 'basic',
        },
        trigger_info: params,
        enable: schedule,
      }
      const { success = false } = await editSchedule({ id, pipeline_uuid: pipelineId }, _timed)
      if (!success) return
      handleCancel()
      detailVariableRef.current?.cb && detailVariableRef.current?.cb()
    } catch (err) {
      console.log('--handleEitSchedule-err', err);
    }
  }

  const onCancel = () => {
    handleCancel()
    // Modal.confirm({
    //   title: '关闭窗口',
    //   icon: <ExclamationCircleOutlined />,
    //   content: '关闭后填写信息将不会被保留，是否确认关闭？',
    //   okText: '确认',
    //   cancelText: '取消',
    //   onOk: () => {
    //     handleCancel()
    //   }
    // });
  }

  const handleCancel = () => {
    setStep(1)
    setModal(false)
  }

  const summit = async () => {
    try {
      const firstData = await firstComponentRef.current.getFormValue()
      const secondData = await secondComponentRef.current.getFormValue()
      const { schedule } = firstData || {}
      const { id, from } = detailVariableRef.current || {}
      setLoading(true)
      const data = { ...firstData, ...secondData }
      delete data.search
      const variables = []
      Object.keys(data).forEach(key => {
        let value = data[key]
        if (Array.isArray(value)) {
          value = value.join(',')
        }
        variables.push({
          key,
          value,
          type: 'component'
        })
      })

      const params = {
        trigger_type: "MANUAL",
        variables
      }
      console.log('--summit', schedule, detailVariableRef.current, firstData, secondData)
      if (!schedule || from === 'copyTask') {
        await triggerApi(getPipelineUuid(), params)
        message.success('开始编包中...')
        if (tabAction === 1) {
          refreshList()
        } else {
          setTabAction(1)
        }
        handleCancel()
      } else {
        !id && await handlecreateSchedule(firstData, params)
      }
      if (id && from === 'scheduleDetail') await handleEitSchedule(params)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const userChange = (v) => {
    // form.setFieldValue('user', v)
    // onChange()
  }

  const next = async () => {
    try {
      await getFirstValue()
      const firstData = await firstComponentRef.current.getFormValue()
      const { schedule } = firstData || {};
      console.log('--next-', buildOptions.options.length <= 0, buildOptions, 'schedule:', schedule, firstData, detailVariableRef.current);
      const { id, from } = detailVariableRef.current || {}
      let txt = !!schedule ? (id && from === 'scheduleDetail' ? '保存' : '创建定时任务') : '立即编包';
      if (from === 'copyTask') txt = '立即编包';
      setSumbitTxt(txt)
      if (buildOptions.options.length <= 0) {
        // message.error('您的分支下没有找到 .dfbuild.json 文件，请先 rebase master 分支后重新操作')
        return
      }
      // 页面加载埋点
      setStatistics({
        action_type: 'button',
        button_id: '下一步'
      })
      setStep(2)
    } catch (error) {

    }
  }

  const getFirstValue = async () => {
    const values = await firstComponentRef.current.getFormValue()
    return values
  }

  const prev = () => {
    setStep(1)
  }

  const closeButton = (e: Event) => {
    e.stopPropagation()
    onCancel()
  }

  const reset = () => {
    Modal.confirm({
      title: '重置',
      icon: <ExclamationCircleOutlined />,
      content: '重置后填写信息将将被清空，是否确认重置？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        // form.resetFields()
        firstComponentRef.current.reset()
      }
    });
  }

  const rederTitle = () => {
    return <div className='build-title flex-space-between'>
      <div>编译打包</div>
      <div className={`build-tab flex-start ${step === 1 ? 'first' : 'second'}`}>
        <div className='flex-start tab-item'><div className='circle flex-center'>1</div> 代码选择</div>&nbsp;&nbsp;&nbsp;&nbsp;
        <div className='flex-start tab-item'><div className='circle flex-center'>2</div> 编译配置</div>
      </div>
    </div>
  }

  return (
    <div ref={variableRef}>
      <Modal title={rederTitle()} centered destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        step === 1 ? <Button onClick={reset}>重置</Button> : <Button onClick={prev}>上一步</Button>
        ,
        step === 1 ? <Button type="primary" onClick={next}>下一步</Button> : <Button loading={loading} type="primary" onClick={summit}>{sumbitTxt}</Button>,
      ]} closeIcon={<CloseOutlined onClick={closeButton} />} open={modal} onCancel={onCancel} className="packagingService-build-container replace-font-size-12" width="40%">

        {/* 代码选择 */}
        <div style={{ display: step === 1 ? 'block' : 'none' }}>
          <FirstComponent ref={firstComponentRef} detail={detail} pipelineId={pipelineId} buildOptions={buildOptions} setBuildOptions={setBuildOptions} from={detailVariableRef.current?.from} isCreated={detailVariableRef.current?.isCreated} />
        </div>
        {/* 编译配置 */}
        <div style={{ display: step === 2 ? 'block' : 'none' }}>
          {
            <SecondComponent ref={secondComponentRef} detail={detail} buildOptions={buildOptions} getFirstValue={getFirstValue} step={step} />
          }
        </div>
      </Modal>
    </div >
  );
}


export default forwardRef(LoadModal)
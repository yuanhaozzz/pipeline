import React, { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { useSelector, useDispatch } from 'dva'
// import { setPipeline } from '@/store/actions'
import moment from 'moment'

import { Modal, DatePicker, Select, Empty, Button, Form, Input, message, Radio } from 'antd'
import './style.less'
import { templateList, res } from './data'
import { addApi } from './service'
import FileContent from './component/fileContentComponent'
import { updateApi, editApi } from '../modify/service'
import { setCompatiblePath } from '@/pages/pipeline/created/common'
import { fetchMenuData } from '@/utils/menu'
import {useNavigate} from 'umi'

function LoadModal(props: any, ref: any) {
  const [modal, setModal] = useState(false)
  const [templateIndex, setTemplateIndex] = useState(0)
  const [radioValue, setRadioValue] = useState(1)

  const [addLoading, setAddLoading] = useState(false)

  const [form] = Form.useForm();
  const { list } = useSelector(({ pipeline }) => pipeline)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const fileContentRef = useRef(null)

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any) => {
    setModal(true)
  }

  const onCancel = () => {
    setModal(false)
    setRadioValue(1)
    form.resetFields()
  }

  const swtichTemplate = (index: number) => {
    setTemplateIndex(index)
  }

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const submit = () => {
    form.validateFields()
      .then(async (values) => {
        try {
          setAddLoading(true)
          let jsonValue = JSON.stringify({})
          // 模板
          const selectTemplate = templateList[templateIndex]
          // 新建
          // const { data } = await addApi(params)
          // await fetchMenuData()
          const id = Math.floor(Math.random() * 10000)
          // 本地添加
          const pipelineList = [...list, {
            id,
            name: values.name,
            templateId: selectTemplate.id,
            templateName: selectTemplate.name,
            template: selectTemplate.template,
            setting: {
              trigger_type: 'HOOK',
              git_info: {},
              enabled: true,
              run_lock_type: true,
              notification: {
                success: {},
                failed: {},
                canceled: {}
              }
            },
            create_time: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
            changeTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), timeConsuming: 2, newExecTime: moment(new Date()).format('YYYY-MM-DD'), username: '袁浩', triggerType: 1, triggerCount: 10, status: 1,
          }]

          const dispatchData = {
            type: 'pipeline/setList',
            payload: { list: [...pipelineList], }
          }
          if (radioValue === 2) {
            dispatchData.payload.importData = JSON.parse(jsonValue)
            // const resValue = res
            // params.stages = jsonValue.stages
            // params.setting = resValue.setting
            // params.run_lock_type = jsonValue.run_lock_type
            // await editApi(data.pipeline_uuid, params)
          }

          dispatch(dispatchData)
          onCancel()
          message.success(`创建成功`)
          navigate(setCompatiblePath(`/FlowLine/created/modify?pipelineId=${id}&from=add&tab=0`))
        } catch (error) {
          console.log(error)
        } finally {
          setAddLoading(false)

        }
      })
  }

  const radioChange = (e) => {
    setRadioValue(e.target.value)
  }

  const options = [
    { label: '模版列表', value: 1 },
    { label: '导入流水线', value: 2 },
  ];

  const renderTemplatList = () => {
    return <ul className='content-left-list flex-start'>
      {
        templateList.map((item, index) => (
          <li key={item.id} className={`${index === templateIndex && 'action'}`} onClick={() => swtichTemplate(index)}>
            <i className={`iconfont icon-success-fill right-icon`}></i>
            <div className='item-icon flex-center'>
              <i className={`iconfont ${item.icon}`} style={{ fontSize: '60px' }}></i>
            </div>
            <div className='item-name flex-center'>{item.name}</div>
          </li>
        ))
      }
    </ul>
  }

  const renderContentLeft = () => {
    return (
      <div className='content-left'>
        <div className='flex-center'>
          <Radio.Group
            options={options}
            onChange={radioChange}
            value={radioValue}
            optionType="button"
            buttonStyle="solid"
          />
        </div>
        {/* <h4>模版列表（{templateList.length}）</h4> */}
        <br />
        {
          // radioValue === 1 && renderTemplatList()
        }
        <div style={{ display: radioValue === 1 ? 'block' : 'none' }}>{renderTemplatList()}</div>
        <div style={{ marginTop: '-10px', padding: '0 10px', display: radioValue === 2 ? 'block' : 'none' }}>
          <FileContent ref={fileContentRef} />
        </div>
      </div>

    )
  }

  const renderContentRight = () => {
    return (
      <div className='content-right'>
        <Form
          form={form}
          layout="vertical"
        // onFinish={onFinish}
        >
          <Form.Item label="流水线名称：" name="name" rules={[{ required: true, message: '请输入流水线名称' }]} >
            <Input placeholder="请输入流水线名称,不超过50个字符" maxLength={50} />
          </Form.Item>
        </Form>
        <div className='content-right-bottom'>
          <Button type='primary' onClick={submit} loading={addLoading}>确认</Button>&nbsp;&nbsp;
          <Button onClick={() => onCancel()}>取消</Button>
        </div>
      </div>
    )
  }

  return (
    <Modal title="" width={1000} className="pipeline-template-modal-container" centered destroyOnClose={true} footer={null} open={modal} onCancel={onCancel}>
      <div className='pipeline-template-container'>
        <div className='pipeline-template-top flex-space-between'>
          <h2>新建流水线</h2>
        </div>
        <div className='pipeline-template-content flex-start'>
          {
            renderContentLeft()
          }
          {/* <div>asd</div> */}
          {
            renderContentRight()
          }
        </div>
      </div>
    </Modal>
  );
}


export default forwardRef(LoadModal)
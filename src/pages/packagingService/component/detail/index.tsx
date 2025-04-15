import { useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input } from 'antd'
import { CopyOutlined } from '@ant-design/icons'
import moment from 'moment'
import FindUser from '@/components/findUser'
import './style.less'
import { fieldList } from './data'
import { copyText, formatHourText } from '@/utils'
import { getLatestBuildApi } from './service'

import FirstData from '../firstData'

let recordData: any = {}
export interface IAppProps {
  renderIcon(status: any): any
  renderStatusText(status: any): any
  goFlow(params: any, record: any): any
  getPipelineUuid(): any
  refreshList(): any
}

function LoadModal(props: IAppProps, ref: any) {

  const { renderIcon, renderStatusText, goFlow, getPipelineUuid, refreshList } = props

  const [progressInfo, setProgress] = useState({ progress: [] })
  const [record, setRecord] = useState<any>({
    status: 'running',
    name: '123'
  },)

  const [modal, setModal] = useState(false)
  const [options, setOptions] = useState([])

  const variableRef = useRef(null)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open
  }))


  const getProgress = async () => {
    const { id } = recordData
    const { data } = await getLatestBuildApi(id)
    setProgress(data)
  }

  const open = (record: any) => {
    // record.options = record.options || []
    recordData = record
    setRecord(record)
    // const selfOptions = []
    // const fieldTextList = [
    //   [
    //     { name: '代码仓', value: 'project_path', isCopy: false, isSelf: true },
    //     { name: '代码分支', value: 'branch', isCopy: false, isSelf: true },
    //     { name: '组件包', value: 'components', isCopy: false, isSelf: true },
    //     { name: '编包数量', value: 'artifact_num', isCopy: false, isSelf: true },
    //   ],
    //   [
    //     { name: '编包名称', value: 'artifact_names', isCopy: false, isSelf: true },
    //     { name: 'CommitId', value: 'after_sha', isCopy: true, isSelf: true },
    //   ]
    // ]
    // fieldTextList.forEach(arr => {
    //   arr.forEach(option => {
    //     selfOptions.push(option)
    //   })
    // })
    // setOptions([...selfOptions, ...record.options])

    getProgress()
    setModal(true)
  }

  const onCancel = () => {
    setModal(false)
    // refreshList()

  }

  const summit = () => {
    onCancel()
  }

  const userChange = (v) => {
    form.setFieldValue('user', v)
    // onChange()
  }
  const { status, duration, created_at, estimated_duration } = record
  return (
    <div ref={variableRef}>
      <Modal title="编包详情" width='60%' centered destroyOnClose={true} footer={[
        <Button onClick={() => goFlow('detail', record)} type='primary' ghost >查看日志</Button>,
        <Button type="primary" onClick={summit}>确定</Button>,
      ]} open={modal} onCancel={onCancel} className='detail-modal'>

        <div className='packagingService-detail-container'>
          {/* <div className='flex-start'>
            <div className='status-icon'>
              {
                renderIcon(status)
              }
            </div>
            <div className='status-text'>
              {
                renderStatusText(status)
              }
            </div>
          </div>
          {
            status === 'running' ? <div style={{ margin: '10px 0' }}>
              <span className='name'>预计编包时长:</span> <span className='value'>{formatHourText(estimated_duration || 0)}</span>
            </div> : <div style={{ margin: '10px 0' }}>
              <span className='name'>编包时长:</span> <span className='value'>{formatHourText(duration || 0)}</span>
            </div>
          }
          <div style={{ margin: '10px 0' }}>
            <span className='name'>开始时间:</span> <span className='value'>{moment(created_at).format('YYYY-MM-DD HH:mm')}</span>
          </div>
          {
            options.length > 0 && <h4 className='config-title'>配置详情</h4>
          }
          {
            options.map(item => {
              const { name, value, isCopy, isSelf } = item
              let v = record[value] || '-'
              if (value === 'artifact_names') {
                v = v === '-' ? [] : v
                v = v.join(',') || '-'
              }
              if (!isSelf) {
                v = value || '-'
              }
              if (name === '包类型') {
                v = v.join(',')
              }
              return <div className='config-options'>
                <span className='name'>{name}:</span> <span className='value'>{v}</span>
                {
                  isCopy && <CopyOutlined className='copy' onClick={() => copyText(v)} />
                }
              </div>
            })
          } */}
          <FirstData {...props} firstData={progressInfo} progressInfo={progressInfo} getProgress={getProgress} />
        </div>
      </Modal>
    </div >
  );
}


export default forwardRef(LoadModal)
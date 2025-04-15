import { useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, message, Radio, Checkbox, Tooltip, Spin } from 'antd'
import { getLogApi } from './service'
import { QuestionCircleOutlined } from '@ant-design/icons'
import Ansi from "ansi-to-react";
import './style.less'
import moment from 'moment'
import { typeMap } from '../../data';
const { TextArea } = Input;

function LoadModal(props: any, ref: any) {
  const { update } = props

  const [switchLoading, setSwitchLoading] = useState(false)

  const [logList, setLogList] = useState([])

  const [modal, setModal] = useState(false)
  const [record, setRecord] = useState<any>({})

  const variableRef = useRef(null)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any) => {
    setRecord(record)
    setModal(true)
    getLog(record)
  }

  const getLog = async (record) => {
    try {
      setSwitchLoading(true)
      const { data } = await getLogApi(record.id)
      setLogList(data)
    } catch (error) {

    } finally {
      setSwitchLoading(false)
    }
  }

  const onCancel = () => {
    setModal(false)
    setLogList([])
  }

  const summit = async () => {

  }

  const renderTitle = () => {
    return <div>
      <span>{record.name}</span>&nbsp;&nbsp;
      <span style={{ fontSize: '12px' }}> {typeMap[record['type']]}</span>&nbsp;&nbsp;
      <span style={{ fontSize: '12px' }}> {record.ip}</span>
    </div>
  }

  return (
    <div ref={variableRef}>
      <Modal className="flow-nodeManagement-log-container" title={renderTitle()} centered destroyOnClose={true} footer={[
      ]} open={modal} onCancel={onCancel}>
        <ul className='log-scroll common-scroll-bar'>
          {
            switchLoading && <div className='flex-center' style={{ height: '100%' }}>
              <Spin size="large" />
            </div>
          }
          {
            logList.length <= 0 && !switchLoading && <div className='flex-center' style={{ height: '100%' }}>
              <div>
                暂无数据
              </div>
            </div>
          }
          {
            logList.map(item => (
              <li>
                <span className='item-num'>{item.line_num <= 0 ? '' : item.line_num}</span>
                <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', display: 'inline' }}>
                  <span className='item-date'>{item.timestamp ? moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
                  <Ansi useClasses>
                    {item.content}
                  </Ansi>
                </pre>
              </li>
            ))
          }
        </ul>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
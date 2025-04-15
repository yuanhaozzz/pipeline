import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input } from 'antd'

import './style.less'
import { getDataApi } from './service'
import { getUrlParams } from '@/utils'
import { useParams } from 'react-router-dom';
import FileContentComponent from './component/fileContentComponent'

const { TextArea } = Input;
export interface IAppProps {
}

function LoadModal(props: IAppProps, ref: any) {
  const [modal, setModal] = useState(false)
  const [record, setRecord] = useState({})

  const query = getUrlParams()
  const { pipelineId } = useParams() || {}

  const variableRef = useRef(null)
  const [form] = Form.useForm();



  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any) => {
    setRecord(record)
    setModal(true)
  }

  const onCancel = () => {
    setModal(false)
  }

  return (
    <div ref={variableRef}>
      <Modal title="导入更新" centered destroyOnClose={true} footer={[

      ]} open={modal} onCancel={onCancel} className='flow-created-detail-import-container'>
        <div className='import-box'>
          <div>请上传一个流水线 JSON 文件</div>
        </div>
        <FileContentComponent {...props} onCancel={onCancel} record={record} />
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, message } from 'antd'

import './style.less'
import { getDataApi } from './service'
import { getUrlParams } from '@/utils'
import { useParams } from 'react-router-dom';

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

  const summit = async () => {
    const values = await form.validateFields()
  }

  const download = (blob, data) => {
    // 创建一个隐藏的<a>标签  
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${data.name}.json`; // 设置下载文件的名称  
    link.style.display = 'none';
    // 将<a>标签添加到DOM中  
    document.body.appendChild(link);
    // 触发下载  
    link.click();

    // 然后从DOM中移除<a>标签  
    document.body.removeChild(link);
    message.success('导出成功')
    onCancel()
  }

  const exportJSON = async () => {
    try {
      const uuid = pipelineId || query.pipelineId || record.uuid
      const { data } = await getDataApi(uuid, 0)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
      download(blob, data)
    } catch (error) {

    }

  }

  return (
    <div ref={variableRef}>
      <Modal title="导出配置" centered destroyOnClose={true} footer={[

      ]} open={modal} onCancel={onCancel} className='flow-created-detail-export-container'>
        <div className='export-box'>
          <div className='export-icon'>
            <i className="iconfont icon-logo-pipeline"></i>
          </div>
          <p style={{ textAlign: 'center', margin: '10px', fontSize: '18px', fontWeight: 'bold', color: '#63656e' }}>Pipeline Json</p>
          <p>通过导入功能，可以快速创建流水线，也可以实现跨项目、跨平台环境的流水线导入。</p>
          <Button className='button' onClick={() => exportJSON()}>导出</Button>
        </div>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
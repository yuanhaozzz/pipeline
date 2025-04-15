import { useState, useImperativeHandle, forwardRef, useRef } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input } from 'antd'
import FindUser from '@/components/findUser'
import './style.less'

export interface IAppProps {
}

function LoadModal(props: IAppProps, ref: any) {
  const [modal, setModal] = useState(false)

  const variableRef = useRef(null)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any) => {
    setModal(true)
  }

  const onCancel = () => {
    setModal(false)
  }

  const summit = () => {

  }

  const userChange = (v) => {
    form.setFieldValue('user', v)
    // onChange()
  }

  return (
    <div ref={variableRef}>
      <Modal title="" centered destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Button type="primary" onClick={summit}>确定</Button>,
      ]} open={modal} onCancel={onCancel}>
        <br />
        暂不确定错误信息
      </Modal>
    </div >
  );
}


export default forwardRef(LoadModal)
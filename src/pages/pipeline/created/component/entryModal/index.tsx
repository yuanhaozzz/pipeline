import { useState, useImperativeHandle, forwardRef, useRef } from 'react';
import EditorComponent from '@/components/Editor';
import { Modal, DatePicker, Select, Empty, Button, Form, Input } from 'antd'

const { TextArea } = Input;


function LoadModal(props: any, ref: any) {

  const { addEntrySubmit } = props

  const [modal, setModal] = useState(false)
  const [record, setRecord] = useState({})

  const variableRef = useRef(null)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any) => {
    setRecord(record)
    form.setFieldValue('description', record.description || '')
    setModal(true)
  }

  const onCancel = () => {
    setModal(false)
    form.resetFields()
  }

  const summit = async () => {
    const values = await form.validateFields()
    values.description = values.description || null
    try {
      await addEntrySubmit({ uuid: record.uuid, ...values })
      onCancel()
    } catch (error) {

    }

  }

  return (
    <div ref={variableRef}>
      <Modal title="" centered destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Button type="primary" onClick={summit}>确定</Button>,
      ]} open={modal} onCancel={onCancel}>
        <br />
        <Form form={form} name="control-hooks" layout="vertical">
          <Form.Item name="description" label="流水线描述" className='flowLine-desc-editor'>
            {/* <TextArea maxLength={50} placeholder='最多可输入50个字' autoSize={{ minRows: 2 }} /> */}
            <EditorComponent title='' content={record?.description || ''} hideTitle={true} isSimple={true} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
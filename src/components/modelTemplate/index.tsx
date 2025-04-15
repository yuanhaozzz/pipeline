import { useState, useImperativeHandle, forwardRef } from 'react';

import { Modal, DatePicker, Select, Empty } from 'antd'

export interface IAppProps {
}

function LoadModal(props: IAppProps, ref: any) {
  const [modal, setModal] = useState(false)

  useImperativeHandle(ref, () => ({
    open
  }))

  const open = (record: any) => {
    setModal(true)
  }

  const onCancel = () => {
    setModal(false)
  }

  return (
    <Modal title="负载趋势图" width={1000} className="device-manage-Load-modal" centered destroyOnClose={true} footer={null} open={modal} onCancel={onCancel}>

    </Modal>
  );
}


export default forwardRef(LoadModal)
import React, { useState, useImperativeHandle, forwardRef, } from 'react';
import { Modal, Checkbox } from 'antd';
import './style.less';

const Unload = (props: any, ref: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const options = ['使用频率不高', '下载后发现不符合使用需求', '不够好用'];

  useImperativeHandle(ref, () => ({
    isModalOpen,
    setIsModalOpen,
  }))

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onChange = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues);
  };

  return (
    <Modal title="卸载原因" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <div className='unloadWrapper'>
        <Checkbox.Group options={options} defaultValue={['使用频率不高']} onChange={onChange} />
      </div>
    </Modal>
  );
};

export default forwardRef(Unload);
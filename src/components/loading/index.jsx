import React, { useEffect } from 'react';
import { Spin, Alert } from 'antd'

import './style.less'
import { send } from './service'

function Project() {

  return (
    <div className='common-component-loading-container position-center'>
      <Spin tip="Loading..."></Spin>
    </div>
  );
}

export default Project
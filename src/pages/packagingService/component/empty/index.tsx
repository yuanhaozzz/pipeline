import React, { useEffect } from 'react';
import { Empty, Button } from 'antd'

import './style.less'

interface Props {
  // 1 我的编包 2 全部编包 3 编包排队
  type: 1 | 2 | 3
  startBuild(): any
}
function Project(props: Props) {
  const { type, startBuild } = props

  const renderTypeDescription = () => {
    switch (type) {
      case 1:
        return '默认只展示7天内的数据，暂时没有查到您的编包记录'
      case 2:
      case 3:
        return '未查到相关数据'
    }
  }

  return (
    <div className='packagingService-empty-container'>
      <div className='empty-box'>
        {/* <Empty description="" image="http://10.12.110.200:8080/dolphin/weekly_report/1701228667.047675_17012284559595.png" className='empty'> */}

        {
          type === 3 && <img src='http://10.12.110.200:8080/dolphin/weekly_report/1701229409.809759_20231129114319.png' className='img-status-3' />
        }
        {
          type === 1 && <p className='empty-description'>欢迎使用编包服务</p>
        }
        <p className='empty-description'>{renderTypeDescription()}</p>
        {
          type === 1 && <Button type='primary' onClick={startBuild}>开始编包</Button>
        }
        <br />
        <br />
        <br />
        {
          type === 1 && <img src='http://10.12.110.200:8080/dolphin/weekly_report/1701770622.18076_20231205134845.png' className='img' />
        }
        {/* </Empty> */}
      </div>
    </div>
  );
}

export default Project
import React, { useEffect, memo } from 'react';
import { createPortal } from 'react-dom'
import { Button, Popover } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'

import './style.less'

function Project(props: any) {
  const { url, from } = props
  if (!url) {
    return <></>
  }

  const renderJobButton = () => {
    return <Button className='logDetail-link-job-button flex-center' size='small' onClick={() => window.open(url)}>查看原始日志</Button>
    return <Popover content={'查看原始日志'} >
      <div className='logDetail-link-job-button flex-center' onClick={() => window.open(url)}><FileTextOutlined /></div>
    </Popover>
  }

  const renderTaskButton = () => {
    return <Button className='logDetail-link-task-button ' size='small' onClick={() => window.open(url)}>查看原始日志</Button>
    return <Popover placement="topRight" content={'查看原始日志'} >
      <div className='logDetail-link-task-button ' onClick={() => window.open(url)}><FileTextOutlined /></div>
    </Popover>
  }

  return <>
    {
      from === 'job' && renderJobButton()
    }
    {
      from === 'task' && renderTaskButton()
    }
  </>
}

export default memo(Project)
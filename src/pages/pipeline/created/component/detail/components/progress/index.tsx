import React, { useEffect, useState } from 'react';
import { Progress, Tooltip } from 'antd'
import { renderTaskStatsIcon } from '@/pages/pipeline/created/common'
import { LoadingOutlined } from '@ant-design/icons'
import { scrollToHorizontalPosition } from '@/utils'
import { RenderLoadingIcon } from '@/pages/pipeline/created/common'
import './style.less'


function Project(props) {
  const { data, computedScrollDistance } = props

  const [percentData, setPercentData] = useState({
    total: 10,
    current: 0
  })

  useEffect(() => {
    init()
  }, [data])

  const init = () => {
    const total = data?.stages?.length
    let current = 1

    // if (data?.status === 'running') {
    //   current = data.stages.findIndex(item => item.status === 'running')
    // } else {
    let reversedArr = data?.stages.slice().reverse() || []
    let index = reversedArr.findIndex(item => item.status !== 'pending');
    current = total - index

    if (index <= 0) {
      current = total
    }

    if (data?.status === 'running') {
      if (index === 0) {
        current = total - 1
        // 运行状态，但是都是pending的时候
      } else if (data?.stages[0].status === 'pending' && data?.stages[total - 1].status === 'pending') {
        current = 0
      }

    }
    // && data?.status !== 'pending' && data?.status !== 'running'

    // }

    setPercentData({
      total,
      current
    })
  }

  const progressColor = (status) => {
    let color = '#d7d7d7'
    switch (status) {
      case 'success':
        color = '#34d97b'
        break
      case 'skipped':
        color = '#9BABB8'
        break
      case 'failed':
      case 'timeout':
        color = '#ff5656'
        break
      case 'canceled':
        color = '#f8b300'
        break
      case 'running':
        color = '#459fff'
        break
    }
    return color
  }

  const scrollToTask = (index) => {
    // 获取滚动条
    const target = index * computedScrollDistance().width
    const scroll = document.querySelector('#content-container')
    scrollToHorizontalPosition(scroll, target, 300, 'x')
  }

  const progressStatus = () => {
    return data?.status === 'running' ? 'active' : 'normal'
  }



  return (
    <div className='flow-detail-tool-progress flex-start'>
      <span className='progress-text' style={{ color: '#8b8b8b', marginLeft: '10px' }}>执行进度</span>
      {
        data?.stages.map((stage, index) => (
          <Tooltip title={stage.name}>
            <div className={`progress-item progress-item-${stage.status}`} onClick={() => scrollToTask(index)}>
              {/* 线 */}
              {
                index !== data.stages.length - 1 && <div className='progress-item-line' style={{ backgroundColor: progressColor(data.stages[index + 1]?.status) }}></div>
              }
              {
                stage.status === 'running'
                  // index === 0
                  ?
                  <div className='progress-item-running'>
                    {/* <LoadingOutlined style={{ color: '#459fff' }} /> */}
                    <RenderLoadingIcon style={{ width: '12px' }} />
                  </div>
                  :
                  <div className='progress-item-circle' style={{ backgroundColor: progressColor(stage.status) }}></div>
              }
            </div>
          </Tooltip>
        ))
      }
      <span>{percentData.current}/{percentData.total}</span>
    </div>
  );
}

export default Project
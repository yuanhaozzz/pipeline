import React, { useEffect, useState, useMemo } from 'react';
import { RightOutlined } from '@ant-design/icons'

import './style.less'
import { send } from './service'
import { deepCopy } from '@/utils'

import LogDetail from '../logDetailNew'

interface Props {
  config: any
  renderState(status: string): any
}
function Project(props: Props) {
  const { config, renderState } = props
  const [data, setData] = useState(deepCopy(config))

  useEffect(() => {
    const copyData = { ...deepCopy(config) }
    if (copyData.type === 2) {
      copyData.name = '环境准备'
      copyData.tasks.unshift(copyData)
    }
    setData(copyData)
  }, [])


  const selectStep = (index: number) => {
    data.tasks[index].open = !data.tasks[index].open
    setData({ ...data })
  }

  // const useMemoLogDetail = useMemo(() => {
  //   return <LogDetail />
  // }, [data])

  const renderJob = () => {
    const { tasks } = config
    return (
      <ul className='flow-log-job common-scroll-bar'>
        {
          [config, ...tasks].map((task: any, index: number) => (
            <li className={`flew-log-job-item`} key={index}>
              {/* 导航栏 */}
              <div className={`item-nav flex-start ${data.tasks[index]?.open && 'action-log'}`} onClick={() => selectStep(index)}>
                {/* 箭头 */}
                <RightOutlined className='item-arrow' />
                {/* 状态 */}
                <div className='item-status'>
                  {
                    renderState(task.setup_status)
                  }
                </div>
                {/* 名字 */}
                <span className='item-name'>{data.tasks[index]?.name}</span>
              </div>
              {
                data.tasks[index]?.open && <LogDetail config={config} task={task} from='job' />
              }
            </li>
          ))
        }
      </ul>
    )
  }

  const renderTask = () => {
    return (
      <>
        <br />
        <LogDetail config={config} task={config} from='task' />
      </>
    )
  }

  return (
    // 
    <div className='flow-log-container '>
      {config.type === 2 && renderJob()}
      {config.type === 3 && renderTask()}
    </div>
  );
}

export default Project
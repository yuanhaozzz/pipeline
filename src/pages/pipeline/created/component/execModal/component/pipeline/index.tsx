import React, { useEffect, useState, memo, useRef, useImperativeHandle, forwardRef } from 'react';
import { StepForwardOutlined } from '@ant-design/icons'
// import Tree from 'react-d3-tree';
import { Tree, Tooltip } from 'antd';

import './style.less'
import { send } from './service'
import { checkPipilineAuth } from '@/utils/menu'

interface Props {
  stages: any[]
}

function Project(props, ref) {
  const { stages = [], selectData = [] } = props

  const [data, setData] = useState([])

  const [treeCheckedKeys, setTreeCheckedKeys] = useState([])
  const [defaultExpandedKeys, setDefaultExpandedKeys] = useState([])

  const variableREf = useRef(null)

  useImperativeHandle(ref, () => (
    getSelectData
  ))

  useEffect(() => {
    clearTimeout(variableREf.current?.pipelineTimer)
    variableREf.current.pipelineTimer = setTimeout(() => {
      init()
    }, 300);

  }, [stages, selectData])

  const getSelectData = () => {
    console.log(variableREf.current.checkedData)
    return variableREf.current.checkedData
  }


  const handleText = (value: any = '') => {
    value = value || ''
    return <div >
      {
        <Tooltip title={<div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>}>
          <div style={{ cursor: 'pointer' }} className='content'>{value}</div>
        </Tooltip>
      }
    </div >
  }

  const init = () => {
    variableREf.current && (variableREf.current.checkedData = [])
    if (stages.length > 0) {
      const newList = []
      const keys = []
      const defaultList = []
      stages.forEach((stage: any, stageIndex: number) => {
        const { name, id } = stage
        const nStage = {
          id,
          key: stageIndex + '',
          title: <div className='stage'>{handleText(name)}</div>,
          index: stageIndex + '',
          // selectable: false,
          children: [],
        }
        defaultList.push(stageIndex + '')

        newList.push(nStage)
        variableREf.current.checkedData[stageIndex] = []
        const stageCheckedData = variableREf.current.checkedData[stageIndex]
        // 设置选中

        const selectStage = selectData[stageIndex]
        if (!selectStage || (selectStage && selectStage.selectable)) {
          stageCheckedData.push(nStage.key)
          keys.push(stages.key)
        }

        stage.jobs.forEach((job: any, jobIndex: number) => {
          const { name, id } = job
          const nJob = {
            id,
            title: <div className='job flex-start'>
              <div className='job-index flex-center'>
                {stageIndex + 1}-{jobIndex + 1}
              </div>
              <div className='job-name'>
                {handleText(name)}
              </div>
            </div>,
            key: `${stageIndex}-${jobIndex}`,
            index: `${stageIndex}-${jobIndex}`,
            // selectable: false,
            children: []
          }
          const selectJob = selectData[stageIndex]?.jobs[jobIndex]
          // 设置选中
          if (!selectData[stageIndex] || (selectJob && selectJob.selectable === true)) {
            // Task 必须都为选中状态
            if (stage.jobs[jobIndex].tasks.every(obj => obj.selectable === true)) {
              keys.push(nJob.key)
              stageCheckedData.push(nJob.key)
            }
          }
          if (selectJob?.selectable && !selectData[stageIndex]?.jobs[jobIndex]?.tasks) {
            keys.push(nJob.key)
            stageCheckedData.push(nJob.key)
          }

          // Task
          stage.jobs[jobIndex].tasks.forEach((task, taskIndex) => {
            const { name, id } = task
            const nTask = {
              id,
              title: <div className='task flex-start'>
                <div className='task-index flex-center'>
                  {/* {stageIndex + 1}-{jobIndex + 1}-{taskIndex + 1} */}
                </div>
                <div className='task-name'>
                  {handleText(name)}
                </div>
              </div>,
              key: `${stageIndex}-${jobIndex}-${taskIndex}`,
              index: `${stageIndex}-${jobIndex}-${taskIndex}`,
            }


            let selectTask = {}
            if (selectData[stageIndex]?.jobs[jobIndex]?.tasks) {
              selectTask = selectData[stageIndex]?.jobs[jobIndex].tasks[taskIndex]
            }
            // 设置选中
            if (!selectData[stageIndex]?.jobs[jobIndex] || (selectTask && selectTask.selectable === true)) {
              keys.push(nTask.key)
              stageCheckedData.push(nTask.key)
            }

            // 兼容之前的数据，没有Task
            // if (selectData[stageIndex]?.jobs[jobIndex] && !(selectTask && selectTask.selectable === true)) {
            //   keys.push(nTask.key)
            //   stageCheckedData.push(nTask.key)
            // }
            nJob.children.push(nTask)
          })

          nStage.children.push(nJob)
        })
      })
      // 如果是detial 在这里设置选中效果，需要过滤下selectable = true的下标即可
      setTreeCheckedKeys(keys)
      // setTreeCheckedKeys(['0-0'])
      setData(newList)
      setDefaultExpandedKeys(defaultList)
    }
  }

  const onCheck = (checkedKeys, info, index) => {
    // debugger
    variableREf.current.checkedData[index] = checkedKeys
    console.log(variableREf.current.checkedData)
  };

  const onExpand = () => {
    const el = document.querySelector('.flow-line-execModal-layer')
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 200);
  }


  return (
    <>
      <div className='flow-execModal-wrap ' ref={variableREf}>
        <div className='flex-start' style={{ alignItems: 'flex-start' }}>

          {
            defaultExpandedKeys.length > 0 && data.map((item, index) => (
              <Tree
                checkable
                defaultExpandedKeys={defaultExpandedKeys}
                // defaultExpandedKeys={['0-0-0', '0-0-1']}
                // defaultSelectedKeys={['0-0-0', '0-0-1']}
                defaultCheckedKeys={treeCheckedKeys}
                onCheck={(...arg) => onCheck(...arg, index)}
                treeData={[item]}
                disabled={!checkPipilineAuth('Check')}
                onExpand={onExpand}
              />
            ))
          }
        </div>
      </div>
    </>

  );
}

export default forwardRef(Project)
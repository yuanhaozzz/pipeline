import React, { useState, useEffect, useRef } from 'react';

import './style.less'

export interface IAppProps {
  data: any
  // 1 新增/编辑 2 预览 3 执行
  type: 1 | 2 | 3
}

function Project(props: IAppProps) {
  const { data, type } = props

  const [display, setDisplay] = useState<boolean>(true)
  const [layerData, setLayerData] = useState<any>({ w: 0, h: 0 })

  const canvasRef = useRef<any>(null)
  const variableRef = useRef<any>(null)
  const layerRef = useRef<any>(null)

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    resize()
  }, [])

  useEffect(() => {
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    const commonScroll: any = document.querySelector('.common-content-container')
    commonScroll.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      commonScroll.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    drawMap()
  }, [data])

  const init = () => {
  }

  const resize = () => {
    setLayerData({
      w: window.innerWidth,
      h: window.innerHeight
    })
  }

  // 找出纵轴元素最多的列
  const findMaxLength = (stages: any): number => {
    let max = 0
    let num = 0
    stages.forEach((stage: any, index: number) => {
      num += 1
      stage.jobs.forEach((job: any, jobIndex: number) => {
        num += 1
        job.tasks.forEach((step: any, stepIndex: number) => {
          if (!job.taskShow) {
            num += 1
          }
        })
      })
      if (num > max) {
        max = num
      }
      num = 0
    })
    return max
  }

  const onScroll = (e: any) => {
    const { scrollTop, scrollLeft } = e.target
    const stageContainer: any = document.querySelector('.stage-container')

    const { offsetHeight: canvasOffsetHeight, offsetWidth: canvasOffsetWidth } = canvasRef.current
    let { offsetWidth: stageOffsetWidth, offsetHeight: stageOffsetHeight } = stageContainer

    const left = canvasOffsetWidth * scrollLeft / stageOffsetWidth
    const top = canvasOffsetHeight * scrollTop / stageOffsetHeight

    layerRef.current.style.left = left + 'px'
    layerRef.current.style.top = top + 'px'
  }

  const drawMap = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 画背景颜色
    ctx.fillStyle = '#e6e6e6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let { offsetWidth: stageOffsetWidth, offsetHeight: stageOffsetHeight } = document.querySelector('.stage-container')
    const { offsetWidth: scrollOffsetWidth, offsetHeight: scrollOffsetHeight } = document.querySelector('.common-content-container')
    const { offsetWidth: canvasOffsetWidth, offsetHeight: canvasOffsetHeight } = canvasRef.current
    const stages = data.template
    // x 轴 宽度 和 间距计算
    // 有滚动条
    const itemWidth = canvasOffsetWidth / (stages.length)
    let marginRight = itemWidth / 5
    let width = itemWidth - marginRight
    // 没有滚动条
    if (scrollOffsetWidth > stageOffsetWidth) {
      const windowWidth = window.innerWidth - 60
      width = 280 * canvasOffsetWidth / windowWidth
      marginRight = 80 * canvasOffsetWidth / windowWidth
    }

    // y 轴 宽度 和 间距计算
    const itemHeight = canvasOffsetHeight / findMaxLength(stages)
    let marginBottom = itemHeight / 5
    let height = itemHeight - marginBottom
    // 没有滚动条
    if (scrollOffsetHeight > stageOffsetHeight) {
      const containerHeight = scrollOffsetHeight
      height = 45 * canvasOffsetHeight / containerHeight
      marginBottom = 15 * canvasOffsetHeight / containerHeight
    }
    // 画
    stages.forEach((stage: any, index: number) => {
      const x = index * (width + marginRight)
      const w = width - marginRight
      // 画stage
      drawStageRect(ctx, x, 0, w, height, stage)
      let stepLength = 0
      stage.jobs.forEach((job: any, jobIndex: number) => {
        // 画job
        const stageY = height + marginBottom

        let jobY = stageY + (jobIndex * (height + marginBottom)) + (stepLength * (height + marginBottom))
        drawJobRect(ctx, x, jobY, w, height, job)


        stepLength += job.tasks.length

        if (job.taskShow) {
          stepLength -= job.tasks.length
        }

        if (!job.taskShow) {
          job.tasks.forEach((step: any, stepIndex: number) => {
            // 画step
            drawStepRect(ctx, x, jobY + ((stepIndex + 1) * (height + marginBottom)), w, height, step)
          })
        }

      })
    })
  }

  const drawStageRect = (ctx: any, x: number, y: number, w: number, height: number, data: any) => {
    ctx.save()
    if (type === 1) {
      ctx.fillStyle = '#d4e8ff'
    } else if (type === 3) {
      ctx.fillStyle = drawExecColor(data)
    }
    ctx.fillRect(x, y, w, height)
    ctx.restore()
  }

  const drawJobRect = (ctx: any, x: number, y: number, w: number, height: number, data: any) => {
    ctx.save()
    if (type === 1) {
      ctx.fillStyle = '#3c96ff'
    } else if (type === 3) {
      ctx.fillStyle = drawExecColor(data)
    }
    ctx.fillRect(x, y, w, height)
    ctx.restore()
  }

  const drawStepRect = (ctx: any, x: number, y: number, w: number, height: number, data: any) => {
    ctx.save()
    if (type === 1) {
      ctx.fillStyle = '#99999f'
    } else if (type === 3) {
      ctx.fillStyle = drawExecColor(data)

    }
    ctx.fillRect(x, y, w, height)
    ctx.restore()
  }

  const drawExecColor = (data: any) => {
    let color = '#99999f'
    switch (data.status) {
      case 'pending':
        color = '#99999f'
        break
      case 'canceled':
      case 'skipped':
        color = '#63656e'
        break
      case 'failed':
      case 'timeout':
        color = '#ff5656'
        break
      case 'success':
        color = '#34d97b'
        break
      case 'running':
        color = '#459fff'
        break
    }
    return color
  }

  const open = () => {
    setDisplay(false)
  }

  const close = () => {
    setDisplay(true)
  }

  const onMouseDown = (e: any) => {
    const { clientX, clientY, target } = e
    const { offsetLeft: layerOffsetLeft, offsetTop: layerOffsetTop } = layerRef.current
    const { offsetLeft: minMapOffsetLeft, offsetTop: minMapOffsetTop } = variableRef.current
    const { offsetWidth: canvasRefOffsetWidth, offsetHeight: canvasRefOffsetHeight } = canvasRef.current
    // 是否可以移动
    variableRef.current.isMove = true
    // 计算点击元素时的距离
    variableRef.current.clickClientX = (clientX - (minMapOffsetLeft + 12 - canvasRefOffsetWidth)) - layerOffsetLeft
    variableRef.current.clickClientY = (clientY - (minMapOffsetTop + 19 - canvasRefOffsetHeight)) - layerOffsetTop
  }

  const onMouseMove = (e: any) => {
    if (variableRef.current?.isMove) {
      const { clientX, clientY, target } = e
      const { offsetWidth: layerOffsetWidth, offsetHeight: layerOffsetHeight } = layerRef.current
      const { offsetLeft: minMapOffsetLeft, offsetTop: minMapOffsetTop, clickClientX, clickClientY } = variableRef.current
      const { offsetWidth: canvasRefOffsetWidth, offsetHeight: canvasRefOffsetHeight, offsetWidth: canvasOffsetWidth, offsetHeight: canvasOffsetHeight } = canvasRef.current
      // 计算 x y 移动距离
      let left = clientX - (minMapOffsetLeft + 12 - canvasRefOffsetWidth) - clickClientX
      let top = clientY - (minMapOffsetTop + 19 - canvasRefOffsetHeight) - clickClientY
      // left边界处理
      if (left < 0) {
        left = 0
      } else if (left + layerOffsetWidth > canvasOffsetWidth) {
        left = canvasOffsetWidth - layerOffsetWidth
      }
      // top边界处理
      if (top < 0) {
        top = 0
      } else if (top + layerOffsetHeight > canvasOffsetHeight) {
        top = canvasOffsetHeight - layerOffsetHeight
      }
      layerRef.current.style.left = left + 'px'
      layerRef.current.style.top = top + 'px'
      // 处理拖拽滚动条
      handleDrawScroll(left, top)
    }
  }

  const onMouseUp = () => {
    variableRef.current.isMove = false
  }

  const handleDrawScroll = (left: number, top: number) => {
    const commonContentContainer: any = document.querySelector('.common-content-container')
    const stageContainer: any = document.querySelector('.stage-container')
    const { offsetHeight: canvasOffsetHeight, offsetWidth: canvasOffsetWidth } = canvasRef.current
    let { offsetWidth: stageOffsetWidth, offsetHeight: stageOffsetHeight } = stageContainer
    // 设置滚动条X、Y
    commonContentContainer.scrollTop = stageOffsetHeight * top / canvasOffsetHeight
    commonContentContainer.scrollLeft = stageOffsetWidth * left / canvasOffsetWidth
  }

  const scaleWidth = () => {
    const { width: canvasOffsetWidth } = canvasRef.current || {}
    const windowWidth = window.innerWidth - 60 - 300
    let { offsetWidth: stageOffsetWidth } = document.querySelector('.stage-box') || {}

    const stages = data.template
    // 80是margin
    const stageWidth = (stageOffsetWidth + 80) * stages.length - 60
    let width = windowWidth * canvasOffsetWidth / stageWidth
    if (width > canvasOffsetWidth) {
      width = canvasOffsetWidth
    }
    return width
  }

  const scaleHeight = () => {
    const { height: canvasOffsetHeight } = canvasRef.current || {}
    const { offsetHeight: scrollOffsetHeight } = document.querySelector('.common-content-container') || {}
    let { offsetHeight: stageOffsetHeight } = document.querySelector('.job-item-detail') || {}
    const itemHeight = (stageOffsetHeight + 15) * findMaxLength(data.template)
    let height = scrollOffsetHeight * canvasOffsetHeight / itemHeight
    if (height > canvasOffsetHeight) {
      height = canvasOffsetHeight
    }
    return height
  }

  const renderMap = () => {
    return <div className={`min-map-render ${display && 'show-min-map'}`}>
      {/* 画布 */}
      <canvas width="200" height="134" className='min-map-canvas' ref={canvasRef}></canvas>
      {/* 遮罩层 */}
      <div className='min-map-layer' style={{ width: `${scaleWidth()}px`, height: `${scaleHeight()}px` }} onMouseDown={onMouseDown} ref={layerRef}></div>
    </div>
  }

  const renderIcon = () => {
    return display ?
      // 展开
      <i className='iconfont icon-eye3 min-map-open min-map-icon' onClick={() => open()} title='隐藏'></i> :
      // 隐藏
      <i className='iconfont icon-eye-off min-map-close min-map-icon' onClick={() => close()} title='显示'></i>
  }

  return (
    <div className='min-map-container' ref={variableRef}>
      {renderIcon()}
      {renderMap()}
    </div>
  );
}

export default Project
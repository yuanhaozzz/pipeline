import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { LoadingOutlined, FileOutlined } from '@ant-design/icons'
import { useScreenHeight } from '@/utils/hook'

import './style.less'
import { createData, filterLog } from './data'
import { getJobLog, getTaskLog } from './service'
import { getUrlParams } from '@/utils'
import { Fragment } from 'react';
import LinkButton from './component/linkButton'

interface Props {
  config: any
  task: any
  from: 'job' | 'task'
}

let isAuthScroll = true
let scrollTimer = null

function Project(props: Props, ref: any) {
  const { task, from } = props
  // const { task } = config
  const [data, setData] = useState<any>(null)
  const [url, setUrl] = useState<any>('')
  const changeWindowSize = useScreenHeight(0.69)
  const [screenHeight, setScreenHeight] = useState(0)
  const itemHeight = 20
  const initCount = Math.ceil(screenHeight / itemHeight) + 4
  const fontHeight = 5
  const { triggerId } = getUrlParams()

  const scrollElRef = useRef<HTMLDivElement>(null)
  const itemBox = useRef<HTMLUListElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const variableRef = useRef<any>({})
  const navRef = useRef<any>(null)

  useEffect(() => {
    handleRequestLog()
  }, [task])

  useEffect(() => {
    let initValue = changeWindowSize
    if (from === 'task') {
      initValue = document.querySelector('.flow-log-container').offsetHeight - 10 - 20
    }
    setScreenHeight(initValue)
  }, [changeWindowSize])

  useEffect(() => {
    variableRef.current.logScrollHeight = screenHeight
    variableRef.current.initCount = Math.ceil(screenHeight / itemHeight) + 4
  }, [screenHeight])

  useEffect(() => {
    const { setup_status } = task
    if (setup_status !== 'pending' && setup_status !== 'running') {
      // initData()
    }

  }, [])

  useEffect(() => {
    scrollElRef.current.addEventListener('scroll', onScroll)
    document.body.addEventListener('wheel', wheel);
    return () => {
      scrollElRef.current?.removeEventListener('scroll', onScroll)
      document.body.removeEventListener('wheel', wheel);
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    if (data) {
      let scrollTop = scrollElRef.current.scrollTop
      if (isAuthScroll) {
        const { scrollHeight } = scrollElRef.current
        scrollElRef.current.scrollTop = scrollHeight
        scrollTop = scrollHeight
      }
      onScroll({ target: { scrollTop: scrollTop - 5 } })
    }
  }, [data])

  const wheel = () => {
    // 控制是否自动滚动开关
    isAuthScroll = false
    clearTimeout(scrollTimer)
    scrollTimer = setTimeout(() => {
      isAuthScroll = true
    }, 10000);
  }


  const initData = async () => {
    try {
      const { type, logId, setup_status, logContent, web_path } = task
      const cache = logContent
      const url = web_path
      if (cache && setup_status !== 'pending') {
        setUrl(url)
        applyInitData(cache, url)
        return
      }

      const api = type === 2 ? getJobLog : getTaskLog
      let res: any = await api(triggerId, logId)
      let data = res.data
      setUrl(res.web_path)
      data = filterLog(data || '', res.first_line_num)
      applyInitData(data, res.web_path)
    } catch (error) {
      console.log(error);
    }
  }

  const applyInitData = (data: any, url?: string) => {
    const { logId } = task
    setTimeout(() => {
      setData(data)
      task.logContent = data
      task.web_path = url
      initValue(data)
    }, 1000);
  }

  // "pending"
  // "running"
  // "failed"
  // "success"
  // "canceled"
  // "timeout"
  const handleRequestLog = () => {
    let { setup_status, logContent } = task
    switch (setup_status) {
      case 'pending':
        break
      case 'running':
        requestLog()
        break
      case 'failed':
      case 'canceled':
      case 'skipped':
      case 'timeout':
      case 'success':
        // 停止重复请求
        stopRequestLog()
        if (!variableRef.current.isLoadData) {
          initData()
        }
        variableRef.current.isLoadData = true
        break
    }
  }

  const requestLog = async () => {
    const { id } = task
    if (variableRef.current) {
      clearTimeout(variableRef.current.timer)
      const { type, logId } = task
      const api = type === 2 ? getJobLog : getTaskLog
      let res: any = await api(triggerId, logId)
      let data = res.data
      setUrl(res.web_path)
      let log = filterLog(data || '', res.first_line_num)
      const value = [...log, 0]
      variableRef.current.logData = value
      setData(value)
      // 设置滚动条高度
      itemBox.current.style.height = (log.length * itemHeight) + Math.floor(Math.random() * 10) + 'px'
      setRequestContainer()
      variableRef.current.timer = setTimeout(async () => {
        //递归
        handleRequestLog()
      }, 5000);
    }
  }

  const setRequestContainer = () => {
    // 设置nav
    drawMiniNav()
    // 设置右上角遮罩层
    setLayerSize()
    // 移动
    moveLayer(scrollElRef.current.scrollTop)
    // 显示导航
    showNav()

  }

  const stopRequestLog = () => {
    if (variableRef.current) {
      clearTimeout(variableRef.current.timer)
    }
  }

  const computeMoveTop = () => {
    const { logData: data } = variableRef.current
    // 滚动条的高度
    const boxItemHeight = itemHeight * data.length
    const { scrollTop } = scrollElRef.current
    const { offsetHeight: navHeight } = navRef.current
    const { offsetHeight: layerHeight } = layerRef.current
    const { offsetHeight: canvasHeight } = canvasRef.current

    const layerTop = scrollTop * (navHeight) / (boxItemHeight)
    layerRef.current.style.top = layerTop + 'px'
    const canvasTop = layerTop * canvasHeight / navHeight
    canvasRef.current.style.transform = `translateY(-${canvasTop}px)`
  }

  const initValue = (data: any) => {
    if (!variableRef.current) {
      return
    }
    variableRef.current.logData = data
    // 设置滚动条高度
    itemBox.current.style.height = itemHeight * data.length + 'px'
    setLayerSize()
    drawMiniNav()
    showNav()
  }

  const onScroll = (e: any) => {
    const { scrollTop } = e.target
    if (scrollTop < itemBox.current.offsetHeight) {
      renderVirtualList(scrollTop)
    }
    // 显示导航
    showNav()
    moveLayer(e.target.scrollTop)
  }

  const renderVirtualList = (scrollTop: number) => {
    const { logData } = variableRef.current
    const { children } = itemBox.current
    const { initCount } = variableRef.current
    const num = Math.floor(scrollTop / itemHeight)
    // 虚拟滚动 初始数量 一定是小于总数的
    if (logData.length >= initCount) {
      Array.from(children).forEach((el: HTMLDivElement, index) => {
        // 上下2个元素
        let numIndex = num - 2
        // 边界处理
        if (num >= (logData.length - 1) - initCount) {
          numIndex = logData.length - initCount
        }
        // 更新位置
        el.style.top = (numIndex + index) * itemHeight + 'px'
        const liChildren: any = el.children
        const current = logData[numIndex + index]
        // debugger
        // 设置展示内容
        if (current?.name) {
          // 序号
          liChildren[0].innerText = current?.index
          // 名称
          liChildren[1].innerText = current?.name
          liChildren[1].style.color = `rgb(${current.fg ? current.fg : '255, 255, 255'})`
        } else {
          // 序号
          liChildren[0].innerText = ''
          // 名称
          liChildren[1].innerText = ''
          liChildren[0].parentNode.style.display = 'none'
        }
      })
    }
  }

  const moveLayer = (scrollTop: number) => {
    const { offsetHeight } = scrollElRef.current
    const { offsetHeight: canvasHeight } = canvasRef.current
    const { offsetHeight: navHeight } = navRef.current
    // const { offsetHeight: stageOffsetHeight } = itemBox.current
    const { offsetHeight: layerHeight } = layerRef.current
    const { logData } = variableRef.current

    // 滚动条的高度
    const itemBoxHeight = itemHeight * logData.length

    let top = (canvasHeight) * scrollTop / itemBoxHeight
    if (canvasHeight >= offsetHeight) {
      top = (navHeight - layerHeight) * scrollTop / (itemBoxHeight - navHeight)
    }

    const rightScroll = top * ((fontHeight * logData.length + fontHeight) - navHeight) / (navHeight - layerHeight)
    layerRef.current.style.top = top + 'px'
    canvasRef.current.style.transform = `translateY(${-rightScroll}px)`
  }

  const resize = () => {
    initValue(variableRef.current.logData)
    const { scrollTop } = scrollElRef.current
    if (scrollTop < itemBox.current.offsetHeight) {
      renderVirtualList(scrollTop)
    }
  }

  const drawMiniNavHeight = () => {
    const { offsetHeight: scrollHeight } = scrollElRef.current
    navRef.current.style.height = scrollHeight + 'px'
  }

  const showNav = () => {
    const { logData: data } = variableRef.current
    const { offsetHeight: ScrollHeight } = scrollElRef.current
    const itemBoxHeight = itemHeight * data.length
    if (itemBoxHeight > ScrollHeight) {
      navRef.current.style.display = 'block'
    } else {
      navRef.current.style.display = 'none'
    }
  }

  const setLayerSize = () => {
    setTimeout(() => {
      const { logData: data } = variableRef.current
      const { offsetHeight: scrollHeight } = scrollElRef.current
      // const { offsetHeight: itemBoxHeight } = itemBox.current
      // 滚动条的高度
      const itemBoxHeight = itemHeight * data.length
      const { offsetHeight: navHeight } = navRef.current
      const { offsetTop: layerTop } = layerRef.current
      const { logData } = variableRef.current
      let height = (scrollHeight * (navHeight) / itemBoxHeight)
      // 大于可视区域
      if (navHeight >= scrollHeight) {
        height = (scrollHeight * (fontHeight * logData.length) / (itemHeight * logData.length))
      }
      layerRef.current.style.top = layerTop + 'px'
      layerRef.current.style.height = height + 'px'
    }, 0);
  }

  const drawMiniNav = () => {
    const { logScrollHeight: scrollHeight } = variableRef.current
    const { logData } = variableRef.current
    const canvas = canvasRef.current

    canvas.width = 130
    canvas.height = scrollElRef.current.offsetHeight
    // 设置css像素
    const canvasHeight = fontHeight * logData.length
    canvas.style.height = fontHeight * logData.length + fontHeight + 'px'
    canvas.height = fontHeight * logData.length + fontHeight
    navRef.current.style.height = canvasHeight + 'px'

    if (canvasHeight >= scrollHeight) {
      navRef.current.style.height = scrollHeight + 'px'
    }

    handleDrawFont()
  }

  const onMouseDown = (e: any) => {
    const { clientY } = e
    const { offsetTop: layerOffsetTop } = layerRef.current
    const { offsetTop: minMapOffsetTop } = variableRef.current
    const { offsetHeight: canvasRefOffsetHeight } = navRef.current
    wheel()
    // 是否可以移动
    variableRef.current.isMove = true
    variableRef.current.clickClientY = (clientY - (minMapOffsetTop + 19 - canvasRefOffsetHeight)) - layerOffsetTop
  }

  const onMouseMove = (e: any) => {
    if (variableRef.current?.isMove) {
      wheel()
      const { clientY } = e
      const { offsetHeight: layerOffsetHeight } = layerRef.current
      const { offsetTop: minMapOffsetTop, clickClientY } = variableRef.current
      const { offsetHeight: canvasRefOffsetHeight, offsetHeight: canvasOffsetHeight } = navRef.current


      // 计算 y 移动距离
      let top = clientY - (minMapOffsetTop + 19 - canvasRefOffsetHeight) - clickClientY

      // top边界处理
      if (top < 0) {
        top = 0
      } else if (top + layerOffsetHeight > canvasOffsetHeight) {
        top = canvasOffsetHeight - layerOffsetHeight
      }
      layerRef.current.style.top = top + 'px'
      // 处理拖拽滚动条
      handleDrawScroll(top)
      handleMoveFont(top)
    }
  }

  const handleDrawScroll = (top: number) => {
    const commonContentContainer = scrollElRef.current

    const scrollTop = computedLeftScrollTop(top)
    // 设置滚动条X、Y
    commonContentContainer.scrollTop = scrollTop
  }

  const computedLeftScrollTop = (top: number) => {
    const stageContainer = itemBox.current
    const { offsetHeight: canvasOffsetHeight } = navRef.current
    // let { offsetHeight: stageOffsetHeight } = stageContainer
    const { offsetHeight: scrollHeight } = scrollElRef.current
    const { offsetHeight: layerHeight } = layerRef.current
    const { logData } = variableRef.current

    const stageOffsetHeight = logData.length * itemHeight

    let scrollTop = stageOffsetHeight * top / canvasOffsetHeight

    if (canvasOffsetHeight >= scrollHeight) {
      scrollTop = (stageOffsetHeight - scrollHeight) * top / (canvasOffsetHeight - layerHeight)
    }
    return scrollTop
  }

  const handleMoveFont = (top: number) => {
    const { logData } = variableRef.current
    const { offsetHeight: canvasOffsetHeight } = navRef.current
    const { offsetHeight: scrollHeight } = scrollElRef.current
    const { offsetHeight: layerHeight } = layerRef.current

    let scrollTop = top * (fontHeight * logData.length) / canvasOffsetHeight

    if (canvasOffsetHeight >= scrollHeight) {
      scrollTop = top * ((fontHeight * logData.length + fontHeight) - canvasOffsetHeight) / (canvasOffsetHeight - layerHeight)
      canvasRef.current.style.transform = `translateY(${-scrollTop}px)`
    }
  }

  const handleDrawFont = () => {
    const { logData } = variableRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    // // 清除画布
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 画背景
    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // 画字体
    ctx.save()

    ctx.font = "normal bold  1px SimSun, Songti SC";
    logData.forEach((item: any, index: number) => {
      let text = item.name || ''
      if (item.fg) {
        ctx.fillStyle = `rgb(${item.fg})`
      } else {
        if (text) {
          ctx.fillStyle = '#fff'
        }
      }
      ctx.fillText(text, 0, (index + 1) * (fontHeight));
    })
    ctx.restore()
  }

  const onMouseUp = () => {
    variableRef.current.isMove = false
  }

  const handleHeight = () => {
    let height = screenHeight - 20
    if (!data) {
      return 0
    }
    if (data && data.length * itemHeight < screenHeight) {
      return data.length * itemHeight
    }

    return height
  }


  const renderColor = (color) => {
    // return '245, 84, 82'
    if (color === '187, 0, 0') {
      return '245, 84, 82'
    }
    return color
  }

  const renderLoading = () => {
    if (data) {
      return <></>
    }
    return <div className='flex-center flow-log-detail-loading'>
      {
        task.setup_status === 'pending' ? task.type === 2 ? '准备环境中...' : task.active ? '等待运行中...' : '暂未未启用' : <LoadingOutlined style={{ fontSize: '20px' }} />
      }
    </div>
  }

  const renderEmpty = () => {
    return <div className='flex-center log-empty'>

      <div className='empty'>
        <FileOutlined />
        <p>The log is empty</p>
      </div>
    </div>
  }

  const renderItemLi = useMemo(() => {
    if (!data) {
      return
    }
    return <>
      {
        [...Array(initCount)].map((item: any, index: number) => (
          <Fragment key={data[index]?.index}>
            {
              data[index]?.name && <li key={index} className='flex-start log-detail-list-item' style={{ top: index * itemHeight + 'px' }}>
                {/* 序号 */}
                <span className='item-num'>{data[index]?.index}</span>
                {/* log日志 */}
                <span className='item-name' style={{ color: `rgb(${renderColor(data[index]?.fg)})` }} >{data[index]?.name}</span>
                {/* {
                      symbol.map(item => (
                        <span className='a'>{item}</span>
                      ))
                    } */}
              </li>
            }
          </Fragment>
        ))
      }
    </>
  }, [data])

  const renderList = () => {
    return (
      <div className='log-detail-list-scroll' ref={scrollElRef} style={{ height: handleHeight() + 'px' }}>
        <ul className='log-detail-list' ref={itemBox}>
          {renderItemLi}
        </ul>
      </div>
    )
  }

  const renderLinkButton = () => {
    return <LinkButton url={url} from={from} />
  }

  const renderMiniNav = () => {
    return <div className='log-detail-mini-nav' ref={navRef}>
      {/* 画布 */}
      <canvas ref={canvasRef} style={{ width: '130px' }}></canvas>
      {/* 遮罩层 */}
      <div className='mini-nav-layer' ref={layerRef} onMouseDown={onMouseDown}></div>
    </div>
  }

  const renderLogLoading = () => {
    const { type, setup_status } = task
    // Job
    if (type === 2) {
      if (setup_status !== 'running' || !data) {
        return <></>
      }

    } else {
      if ((task.status !== 'running' && task.status !== 'manual_confirm') || !data) {
        return <></>
      }
    }
    return <div className='log-loading-container'>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  }

  return (
    <div className='flow-log-detail-container' ref={variableRef}>
      {/* 链接 */}
      {renderLinkButton()}
      {/* loading */}
      {renderLoading()}
      {/* 列表内容 */}
      {renderList()}
      {/* 空图标 */}
      {data && data.length <= 0 && renderEmpty()}
      {/* 小导航 */}
      {renderMiniNav()}
      {/* 加载中loading */}
      {renderLogLoading()}
    </div>
  );
}

export default forwardRef(Project)
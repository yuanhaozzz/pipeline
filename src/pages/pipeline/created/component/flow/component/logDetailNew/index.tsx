import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { LoadingOutlined, FileOutlined } from '@ant-design/icons'
import { useScreenHeight } from '@/utils/hook'

import './style.less'
import { createData, filterLog, requestList, filterAnser, testJSON } from './data'
import { getJobLog, getTaskLog } from './service'
import { getUrlParams, deepCopy } from '@/utils'
import { Fragment } from 'react';
import LinkButton from './component/linkButton'
import Ansi from "ansi-to-react";

interface Props {
  globalData: any
  task: any
  from: 'job' | 'task'
}

let isAuthScroll = true
let scrollTimer = null

function Project(props: Props, ref: any) {
  const { task, from, globalData } = props
  // const { task } = config
  const [data, setData] = useState<any>(null)
  const [logList, setLogList] = useState(null)
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
  const logItemNameRef = useRef<any>({})

  const totalNavCount = useRef(0)

  const lineHeight = 18.8
  const navWidth = 120
  const logListData = useRef([])

  useEffect(() => {
    handleRequestLog()
    // createData()
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

  const setContainerHeight = (data) => {
    if (from === 'job') {
      let boxHeight = 500
      if (data.length * itemHeight < boxHeight) {
        boxHeight = data.length * itemHeight
      }
      if (!data.length) {
        boxHeight = 60
      }
      variableRef.current.style.height = boxHeight + 'px'
    }
  }

  const initData = async () => {
    try {
      const { type, logId, setup_status, logContent, web_path, jobRunId } = task
      const cache = logContent
      const url = web_path
      if (cache && setup_status !== 'pending') {
        setUrl(url)
        applyInitData(cache, url)
        return
      }

      const params = {
        line: 1000,
        job_runinfo_id: jobRunId
      }

      const api = type === 2 ? getJobLog : getTaskLog
      let res: any = await api(triggerId, logId, params)
      // let res: any = await api(triggerId, 1930)
      let data = res.data
      setContainerHeight(data)
      setUrl(res.web_path)
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
      // 模拟数据
      const vData = data
      setLogList(vData)
      logListData.current = vData
      task.web_path = url
      drawMiniNav()
      initValue()
    }, 1000);
  }

  // "pending"
  // "running"
  // "failed"
  // "success"
  // "canceled"
  // "timeout"
  const handleRequestLog = () => {
    let { setup_status } = task
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
    if (variableRef.current) {
      clearTimeout(variableRef.current.timer)
      const { type, logId } = task
      const api = type === 2 ? getJobLog : getTaskLog
      let res: any = await api(triggerId, logId)
      let data = res.data
      setUrl(res.web_path)
      setContainerHeight(data)

      // let log = filterLog(data || '', res.first_line_num)
      // const value = [...log, 0]
      // variableRef.current.logData = value
      setData(data)
      // 模拟数据
      const vData = data
      setLogList(vData)
      logListData.current = vData
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

  const initValue = () => {
    if (!variableRef.current) {
      return
    }
    setLayerSize()
    drawMiniNav()
    showNav()
  }

  const onScroll = (e: any) => {
    const { scrollTop } = e.target
    // if (scrollTop < itemBox.current.offsetHeight) {
    //   renderVirtualList(scrollTop)
    // }
    // 显示导航
    showNav()
    moveLayer(e.target.scrollTop)
  }

  const moveLayer = (scrollTop: number) => {
    const { offsetHeight } = scrollElRef.current
    const { offsetHeight: canvasHeight } = canvasRef.current
    const { offsetHeight: navHeight } = navRef.current
    const { offsetHeight: layerHeight } = layerRef.current
    const { offsetHeight: itemBoxHeight } = itemBox.current

    let top = (canvasHeight) * scrollTop / itemBoxHeight
    if (canvasHeight >= offsetHeight) {
      top = (navHeight - layerHeight) * scrollTop / (itemBoxHeight - navHeight)
    }

    const rightScroll = top * ((fontHeight * totalNavCount.current + fontHeight) - navHeight) / (navHeight - layerHeight)
    layerRef.current.style.top = top + 'px'
    canvasRef.current.style.transform = `translateY(${-rightScroll}px)`
  }

  const resize = () => {
    initValue()
  }

  const showNav = () => {
    // const { logData: data } = variableRef.current
    // const { offsetHeight: ScrollHeight } = scrollElRef.current
    // const itemBoxHeight = itemHeight * data.length
    // if (itemBoxHeight > ScrollHeight) {
    //   navRef.current.style.display = 'block'
    // } else {
    //   navRef.current.style.display = 'none'
    // }
  }

  const setLayerSize = () => {
    setTimeout(() => {
      const { offsetHeight: scrollHeight } = scrollElRef.current
      // 滚动条的高度
      const itemBoxHeight = itemBox.current.offsetHeight
      const { offsetHeight: navHeight } = navRef.current
      let height = (scrollHeight * (navHeight) / itemBoxHeight)
      const { offsetTop: layerTop } = layerRef.current
      // 大于可视区域
      if (navHeight >= scrollHeight) {
        height = (scrollHeight * (fontHeight * totalNavCount.current) / itemBoxHeight)
      }
      layerRef.current.style.top = (layerTop || 0) + 'px'
      layerRef.current.style.height = height + 'px'
    }, 0);
  }

  const drawMiniNav = () => {
    const { offsetHeight } = variableRef.current
    const canvas = canvasRef.current

    canvas.width = navWidth
    // 计算高度
    let index = 0
    deepCopy(logListData.current).forEach((item: any) => {
      // ctx.fillStyle = '#fff'
      item.content = item.timestamp + '  ' + item.content
      // 计算文字宽度，超过 nav 宽度则换行
      const nameList = splitStringByLength(item.content)
      nameList.forEach(v => {
        // 计算圆度到canvas 每行的宽度
        index++
      })
    })
    const canvasHeight = fontHeight * index

    canvas.style.height = canvasHeight + 'px'
    canvas.height = canvasHeight
    navRef.current.style.height = canvasHeight + 'px'

    if (canvasHeight >= offsetHeight) {
      navRef.current.style.height = offsetHeight + 'px'
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

    const { offsetHeight: canvasOffsetHeight } = navRef.current
    const { offsetHeight: scrollHeight } = scrollElRef.current
    const { offsetHeight: layerHeight } = layerRef.current
    const { offsetHeight } = itemBox.current

    let scrollTop = offsetHeight * top / canvasOffsetHeight

    if (canvasOffsetHeight >= scrollHeight) {
      scrollTop = (offsetHeight - scrollHeight) * top / (canvasOffsetHeight - layerHeight)
    }
    return scrollTop
  }

  const handleMoveFont = (top: number) => {

    const { offsetHeight } = itemBox.current

    const { offsetHeight: canvasOffsetHeight } = navRef.current
    const { offsetHeight: scrollHeight } = scrollElRef.current
    const { offsetHeight: layerHeight } = layerRef.current

    let scrollTop = top * offsetHeight / canvasOffsetHeight

    if (canvasOffsetHeight >= scrollHeight) {
      scrollTop = top * ((fontHeight * totalNavCount.current + fontHeight) - canvasOffsetHeight) / (canvasOffsetHeight - layerHeight)
      canvasRef.current.style.transform = `translateY(${-scrollTop}px)`
    }
  }

  const handleDrawFont = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    // // 清除画布
    // ctx.clearRect(0, 0, canvas.width, canvas.height)
    // 画背景
    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // 画字体
    ctx.save()
    ctx.font = "normal bold 2px SimSun, Songti SC";
    let index = 0

    deepCopy(logListData.current).forEach((item: any) => {
      ctx.fillStyle = item.color ? item.color : '#fff'
      item.content = item.timestamp + '  ' + item.content
      // 计算文字宽度，超过 nav 宽度则换行
      const nameList = splitStringByLength(item.content)
      nameList.forEach(v => {
        // 计算圆度到canvas 每行的宽度
        ctx.fillText(v, 0, (index + 1) * (fontHeight));
        index++
      })
    })
    totalNavCount.current = index

    ctx.restore()
  }

  function splitStringByLength(lineStr) {
    const str = filterAnser(lineStr)
    let result = [];
    let width = 0
    let pushStr = ''
    const elWidth = logItemNameRef.current.getBoundingClientRect().width
    const navFontWidth = elWidth

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = 'normal 14px SimSun, Songti SC';
    // 字体宽度
    for (let i = 0; i < str.length; i++) {
      const value = str[i]

      const metrics = ctx.measureText(value)
      width += metrics.width
      pushStr += value

      if (width > navFontWidth) {
        result.push(pushStr)
        width = 0
        pushStr = ''
      }
    }
    if (pushStr) {
      result.push(pushStr)
    }
    return result
  }

  const onMouseUp = () => {
    variableRef.current.isMove = false
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
    if (!logList) {
      return
    }
    return <>
      {
        logList?.map((item: any, index: number) => (
          <Fragment key={item.line_num}>
            {
              <li key={item.line_num} className='flex-start log-detail-list-item'>
                {/* 序号 */}
                <div className='item-num'>{item.line_num < 0 ? '' : item.line_num}</div>
                {/* log日志 */}
                <div className='item-name' style={{ color: item.color }} ref={logItemNameRef}>
                  <pre style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap', display: 'inline' }}>
                    <span className='item-date'>{item.timestamp}</span>
                    <Ansi useClasses>
                      {item.content}
                    </Ansi>
                  </pre>
                </div>
              </li>
            }
          </Fragment>
        ))
      }
    </>
  }, [logList])

  const renderList = () => {
    return (
      <div className='log-detail-list-scroll' ref={scrollElRef}>
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
      <canvas ref={canvasRef} style={{ width: navWidth + 'px' }}></canvas>
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
      {/* 空图标 */}
      {data && data.length <= 0 && renderEmpty()}
      {/* 列表内容 */}
      {renderList()}

      {/* 小导航 */}
      {renderMiniNav()}
      {/* 加载中loading */}
      {renderLogLoading()}
    </div>
  );
}

export default forwardRef(Project)
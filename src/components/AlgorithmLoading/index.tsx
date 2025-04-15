import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

import { Spin, Popover, message } from 'antd'

import './style.less'

export interface IAppProps {
  text?: string
  textColor?: string
  textSize?: number
  loadingSize?: number
  loadingColor?: string

  getQueueInfo(params: any): void
  handleSuccess(data: any): void
  handleError(data: any): void
  // showQueue?: boolean
}

let timer: any = null
function Project(props: IAppProps, ref: any) {
  const { text = 'i20', textColor = "#333", textSize = 16, loadingSize = 40, loadingColor = "#00A4FF", getQueueInfo, handleSuccess, handleError } = props

  const [count, setCount] = useState<any>(0)

  const variableRef = useRef<any>({})

  useImperativeHandle(ref, () => ({
    repeatedCalls
  }))

  useEffect(() => {
    variableRef.current.count = 100000
    return () => {
      clearTimeout(timer)
    }
  }, [])

  const repeatedCalls = async (key: any) => {
    try {
      const params = {
        request_key: key
      }
      const data: any = await getQueueInfo(params)
      const resCount = data.count_in_queue
      const { count } = variableRef.current
      console.log(`count出错\n 当前：${count}\n响应${resCount}`)
      if (resCount <= 0) {
        setCount(0)
        variableRef.current.count = 0
      } else {
        if ((count <= 0 || count >= resCount)) {
          setCount(resCount)
          variableRef.current.count = resCount
        } else {
          console.log(`-----------------------count出错\n 当前：${count}\n响应${resCount}`)
        }
      }

      // status 0 轮询 1 失败 2 超时
      if (Object.keys(data.data).length > 0) {
        handleSuccess(data.data)

        clearTimeout(timer)
      } else {
        if (data.status === 0) {
          timer = setTimeout(() => {
            repeatedCalls(key)
          }, 2000);
        } else {
          message.warn(data.msg)
          handleError({})
          clearTimeout(timer)
        }
      }
    } catch (error) {
      clearTimeout(timer)
      handleError(error)
    }
  }

  return (
    <>
      <div className='algorithm-loading-wrap' ref={variableRef}>
        <div className='loading'>
          <Spin indicator={<LoadingOutlined style={{ fontSize: loadingSize, color: loadingColor }} spin />} />
        </div>
        <span className='text' style={{ color: textColor, fontSize: textSize + 'px' }}>{text}</span>
      </div>
      {
        <>
          <br />
          <br />
          {/* <div style={{ fontSize: '14px', marginTop: '25px' }}>{count > 0 && `等待中，前面还有${count}位...`}</div> */}
          {
            count > 0 && <div style={{ color: textColor, fontSize: '14px', marginTop: '55px' }}>{`等待中，前面还有${count}位...`}</div>
          }
        </>
      }

    </>

  );
}

export default forwardRef(Project)
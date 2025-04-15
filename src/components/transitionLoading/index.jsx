import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom'
import { Spin, Alert } from 'antd'

import './style.less'
import { send } from './service'

function Project(props, ref) {
  const [loading, setLoading] = useState(false)

  useImperativeHandle(ref, () => ({
    open,
    close
  }))

  const transitonLoadingRef = useRef(null)

  useEffect(() => {

    transitonLoadingRef.current.addEventListener('transitionend', transitionend);
    return () => {
      if (transitonLoadingRef.current) {
        transitonLoadingRef.current.removeEventListener('transitionend', transitionend);
      }
    }
  }, [])

  const transitionend = () => {
    close()
    // setTimeout(() => {
    //   transitonLoadingRef.current.style.display = 'none'
    // }, 100);
  }

  const open = () => {
    setLoading(true)
  }

  const close = () => {
    setLoading(false)
  }

  return (
    <>
      {createPortal(
        <div ref={transitonLoadingRef} className={`common-component-transiton-loading-container ${!loading && 'common-component-transiton-loading-hide'}`}>
          <div className='position-center'>
            <Spin tip="加载中..."></Spin>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default forwardRef(Project)
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { Button, Tooltip, Spin } from 'antd'
import './commonComponent.less'

import { CopyOutlined } from '@ant-design/icons'
import { copyText } from '@/utils'


export const SetElementLength = (props) => {
  const { text = '' } = props
  const tooltipRef = useRef(null);
  const [isShowTooltip, showTooltip] = useState(false)

  useEffect(() => {
    setWidth()
  }, [text])

  const setWidth = () => {
    const el = tooltipRef.current
    let elementWidth = el.getBoundingClientRect().width;
    const text = el.innerText

    if (elementWidth < 100) {
      elementWidth = 100
    }
    // 获取文字大小
    let totalWidth = 0
    let textStr = ''
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')
    let tooltipText = ''
    // 按照12px计算
    context.font = "12px 宋体";
    for (let i = 0; i < text.length; i++) {
      const value = text[i]
      if ((totalWidth + 40) > elementWidth) {
        tooltipText = textStr + '...'
        break
      } else {
        // 计算文字大小
        const charWidth = context.measureText(value).width
        totalWidth += charWidth;
        textStr += value
        tooltipText = textStr
      }
    }
    el.innerText = tooltipText
    if (elementWidth <= 100) {
      totalWidth -= 10
    }
    if ((totalWidth + 40) > elementWidth) {
      showTooltip(true)
    } else {
      showTooltip(false)
    }
  }

  return <>
    {
      <Tooltip title={isShowTooltip ? text : ''}>
        {React.cloneElement(props.children, { ref: tooltipRef })}
      </Tooltip>
    }
  </>
}


const LoadingComponent = (props, ref) => {
  const [display, setDisplay] = useState(false)

  useImperativeHandle(ref, () => ({
    handleDisplay
  }))

  const handleDisplay = (status) => {
    setDisplay(status)
  }

  if (!display) {
    return <></>
  }

  return <div className='utils-common-loading-container flex-center'>
    <Spin tip="Loading..."></Spin>

  </div>

}

export const Loading = forwardRef(LoadingComponent)


export const CopyIcon = (props) => {
  const { text } = props
  return <CopyOutlined onClick={() => copyText(text)} />
}
import React, { useEffect, useRef } from 'react';
import { ZoomOutOutlined, ZoomInOutlined, CloseOutlined, SwapLeftOutlined, SwapRightOutlined } from '@ant-design/icons'

import './style.less'
import { send } from './service'

function Project() {

  const containerRef = useRef<any>(null)
  const imageRef = useRef<any>(null)

  const scaleValue = 0.20
  const rotateValue = 90

  // 1 向左旋转 2 向右旋转
  const handleRotate = (type: number) => {
    const { scale, rotate } = getScale(imageRef.current.style.transform)
    let value = rotate + (type === 1 ? -rotateValue : rotateValue)
    imageRef.current.style.transform = `scale(${scale}) rotate(${value}deg)`
  }

  // 1 缩小 2 放大
  const handleScale = (type: number) => {
    const { scale, rotate } = getScale(imageRef.current.style.transform)
    let value = scale * scaleValue
    if (type === 1) {
      value = -value
    }
    imageRef.current.style.transform = `scale(${scale + value}) rotate(${rotate}deg)`
  }


  // 关闭
  const close = () => {
    containerRef.current.classList.remove('common-preview-image-container-show')
    imageRef.current.style.transform = `scale(1) rotate(0deg)`
  }

  const getScale = (str: string): any => {
    const map: any = {}
    const value = str.split(' ')
    let scale = value[0].slice(0, value[0].length - 1)

    let rotate = value[1].slice(0, value[1].length - 4)
    map.scale = Number(scale.slice(scale.indexOf('(') + 1))
    map.rotate = Number(rotate.slice(rotate.indexOf('(') + 1))

    return map
  }

  return (
    <div className="common-preview-image-container" ref={containerRef} onClick={close}>
      {/* 操作 */}
      <div className='preview-image-operations flex-end' onClick={(e: any) => e.stopPropagation()}>
        <ul className='operations-right flex-start'>
          {/* 向左旋转 */}
          <li className='flex-center' onClick={() => handleRotate(1)}>
            <SwapLeftOutlined />
          </li>
          {/* 向右旋转 */}
          <li className='flex-center' onClick={() => handleRotate(2)}>
            <SwapRightOutlined />
          </li>
          {/* 缩小 */}
          <li className='flex-center' onClick={() => handleScale(1)}>
            <ZoomOutOutlined />
          </li>
          {/* 放大 */}
          <li className='flex-center' onClick={() => handleScale(2)}>
            <ZoomInOutlined />
          </li>
          {/* 关闭 */}
          <li className='flex-center' onClick={close}>
            <CloseOutlined />
          </li>
        </ul>
      </div>
      <div className='image-box flex-center'>
        {/* 图片 */}
        <img className='img' src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?undefined" ref={imageRef} style={{ transform: 'scale(1) rotate(0deg)' }} onClick={(e: any) => e.stopPropagation()} />
      </div>
    </div>
  );
}

export default Project
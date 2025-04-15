import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

import './style.less'
import { send } from './service'

interface Props {
  status: boolean
}
function Project(props: Props, ref) {
  const { status } = props

  const heightRef = useRef(null)

  useImperativeHandle(ref, () => ({
    init,
    changeHeight
  }))

  const init = () => {
    setTimeout(() => {
      heightRef.current.infoHeight = heightRef.current.getBoundingClientRect().height
      heightRef.current.style.height = heightRef.current.infoHeight + 'px'
    }, 300);
  }

  const changeHeight = () => {
    heightRef.current.style.height = 'auto'
    setTimeout(() => {
      heightRef.current.infoHeight = heightRef.current.getBoundingClientRect().height
      heightRef.current.style.height = heightRef.current.infoHeight + 'px'
    }, 300);

  }

  useEffect(() => {
    console.log(heightRef.current.getBoundingClientRect().height)
    if (heightRef.current.isLoad) {
      heightRef.current.style.height = status ? heightRef.current.infoHeight + 'px' : '0'
    }
    heightRef.current.isLoad = true
  }, [status])

  return (
    // <div style={{ height: envContent ? '300px' : '0', transition: 'all 2s' }} >
    <div ref={heightRef} style={{ transition: 'all .5s', overflow: 'hidden' }}>
      {props.children}
    </div>
  );
}

export default forwardRef(Project)
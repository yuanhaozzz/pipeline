import React, { useEffect } from 'react';

import './style.less'
import { send } from './service'

interface Props {
  current: any;
  items: any[]
}
function Project(props: Props) {
  const { items, current } = props
  return (
    <div className='packagingService-steps-container'>
      {
        items.map((item, index) => (
          <div className={`step-item ${current === index && 'step-item-action'} `}>
            <div className='step-item-container'>
              {
                index !== items.length - 1 && <div className='item-tail'>
                  <div className='item-tail-line' style={{ backgroundColor: current > index ? '#1890ff' : '#f0f0f0' }}></div>
                </div>
              }

              <div className='item-icon'>
                <span className='item-icon-dot' style={{ backgroundColor: current >= index ? '#1890ff' : '#bfbfbf' }}></span>
              </div>
              <div className='item-content'>
                <div style={{ color: current >= index ? '#000000d9' : '#00000073' }}>{item.title}</div>
                <div style={{ color: current === index ? '#000000d9' : '#00000073' }}>
                  {item.description}
                </div>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

export default Project
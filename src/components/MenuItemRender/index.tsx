import { useState, useEffect } from 'react';
import newImage from '@/assets/images/new.png'
import { history } from 'umi';
import { Link } from 'react-router-dom'
import { Tooltip } from 'antd'
import { LockOutlined } from '@ant-design/icons';
import './style.less';

function Project(props: any) {
  const { config, component, route } = props

  const lockList = [
    {
      id: 4,
      path: '/corporatePartner'
    },
    // {
    //   id: 6,
    //   path: '/packagingService'
    // },
    // {
    //   id: 4,
    //   path: '/workflowService'
    // },
  ]

  if (config.collapsed) {
    return <Link to={route.path}>
      <div className='menu-item-container'>
        {component}
      </div>
    </Link >

  }
  return <Link to={route.path}>
    <div className='menu-item-container'>
      {route.name}
      {
        lockList.map(item => (
          <>
            {
              route.path === item.path && <Tooltip placement="top" title={'管理员可见'}>
                <LockOutlined className='icon-right-lock-top' />
              </Tooltip>
            }
          </>

        ))
      }
      {/* {
        route.path === '/algorithm/maas' && <img src={newImage} className='menu-item-new-icon' />
      }
      {
        route.path === '/algorithm/chat' && <img src={newImage} className='menu-item-new-icon' />
      } */}
      {/* {
        route.path === '/privateCloud/deviceReservations' && <img src={newImage} className='icon-right-top icon-right-top-current' />
      } */}
      {/* {
        route.path === '/packagingService' && <img src={newImage} className='menu-item-new-icon' />
      } */}
    </div>
  </Link >
}

export default Project
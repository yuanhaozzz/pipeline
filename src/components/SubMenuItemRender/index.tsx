import { useState, useEffect } from 'react';
import { Tooltip } from 'antd'
import newImage from '@/assets/images/new.png'
import { LockOutlined } from '@ant-design/icons'

import './style.less'

function Project(props: any) {

  const lockList = [
    // {
    //   id: 1,
    //   path: '/FlowLine'
    // },
    {
      id: 2,
      path: '/resource'
    },
    {
      id: 3,
      path: '/permissionCenter'
    },
    // {
    //   id: 4,
    //   path: '/corporatePartner'
    // },
    // {
    //   id: 4,
    //   path: '/workflowService'
    // },
  ]

  const { config, component, route } = props
  if (config.collapsed) {
    return component
  }

  return <div className='menu-subitem-container'>
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
      route.path === '/corporatePartner' && <img src={newImage} className='subMenu-new-icon' />
    }*/}
    {/* {
      route.path === '/myVoice' && <img src={newImage} className='subMenu-new-icon' />
    }
    {/* {
      route.path === '/resource' && '( 新 )'
    } */}
    {/*  {
      route.path === '/algorithm' && <img src={newImage} className='subMenu-new-icon' />
    } */}
  </div>
}

export default Project
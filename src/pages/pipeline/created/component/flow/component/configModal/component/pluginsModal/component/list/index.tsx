import React, { useEffect } from 'react';
import { Button, Empty } from 'antd'

import './style.less'
import { send } from './service'
import { formItemMap } from '../../../stepConfig/data'

function Project(props: any) {
  const { config, hide, modifyField, setConfig } = props
  const { list } = props

  const selectPlugin = (plugin: any) => {
    config.atom_id = plugin.uuid
    config.atom_name = plugin.name
    config.atom_logo = plugin.logo_url
    config.atom_version = plugin.version
    // setConfig({ ...config })
    // config.atomForm = formItemMap[plugin.name]
    modifyField('name', plugin.name)
    hide()
  }

  return (
    <>
      {
        list.length <= 0 ? <>
          <br /> <br /> <br />
          <Empty />
        </> : <ul className='flow-plugins-list-container common-scroll-bar'>
          {
            list.map((plugin: any, index: number) => (
              <li className='plugin-item flex-start'>
                {/* logo */}
                <div className='item-left'>
                  <img src={plugin.logo_url} />
                </div>
                <div className='item-center'>
                  {/* 插件名称 */}
                  <h2>{plugin.name}</h2>
                  {/* 插件描述 */}
                  <span dangerouslySetInnerHTML={{ __html: plugin?.description }}></span>
                </div>
                {/* 按钮 */}
                <Button disabled={plugin.name === config.atom_name} onClick={() => selectPlugin(plugin)}>{plugin.name === config.atom_name ? '已选择' : '选择'}</Button>
              </li>
            ))
          }
        </ul>
      }
    </>
  );
}

export default Project
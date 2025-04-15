import type { DropDownProps } from 'antd/es/dropdown';
import { Dropdown, Menu } from 'antd';
import { LogoutOutlined, FileSyncOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useRef, useEffect, useState } from 'react';
import classNames from 'classnames';
import { setLocale } from 'umi';
import styles from './index.less';
import './index.less'
import MarkImage from '@/assets/images/mark.png'

import ChangeLog from '@/components/ChangeLog'
import { showLog } from './service'

import TopIcon from '@/pages/chat/component/testTopIcon'


export type HeaderDropdownProps = {
  overlayClassName?: string;
  overlay: React.ReactNode | (() => React.ReactNode) | any;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & Omit<DropDownProps, 'overlay'>;

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ overlayClassName: cls, ...restProps }) => {
  const [locale, updateLocale] = useState((localStorage.getItem('currentLocal') || navigator.language).includes('zh'));  // 中文true  英文fale
  const changeLogRef = useRef<any>(null)

  useEffect(() => {
    getShowLog()
  }, [])

  useEffect(() => {
    const currentLocal = locale ? 'zh-CN' : 'en-US';
    localStorage.setItem('currentLocal', currentLocal);
    setLocale(currentLocal, true);
  }, [locale])

  const getShowLog = async () => {
    const { data } = await showLog()
    if (data?.popup) {
      changeLogRef.current.open(data.version)
    }
  }

  const menuHeaderDropdown = (
    <Menu className={styles.menu} >
      <Menu.Divider />
      <Menu.Item onClick={() => changeLogRef.current.open()}>
        <FileSyncOutlined />
        版本日志
      </Menu.Item>
    </Menu>
  );

  const renderTopIcon = () => {
    return <TopIcon />
  }

  const renderTips = () => {
    return (
      <Dropdown overlay={menuHeaderDropdown} trigger={['click']}>
        <div className='layout-header-tips flex-center' >
          <div className='layout-header-tips-image flex-center'>
            <img src={MarkImage} />
          </div>
        </div>
      </Dropdown>
    )
  }

  const switchLocle = () => {
    return (
      <span className='locle' onClick={() => updateLocale(!locale)}>
        {!locale ? '中文' : 'English'}
      </span>
    )
  }

  return <div className='flex-start' style={{ height: '100%' }}>
    {renderTopIcon()}
    {renderTips()}
    {switchLocle()}
    <Dropdown trigger={['click']} overlayClassName={classNames(styles.container, cls)} {...restProps} />
    <ChangeLog ref={changeLogRef} />
  </div>
};

export default HeaderDropdown;

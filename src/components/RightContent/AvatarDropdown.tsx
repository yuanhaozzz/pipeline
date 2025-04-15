import React, { useCallback } from 'react';
import { LogoutOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin, message } from 'antd';
import { FormattedMessage, history, useModel } from 'umi';
import { stringify } from 'querystring';
import { logout } from '@/apis/login';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import type { MenuInfo } from 'rc-menu/lib/interface';
import { deleteCookie } from '@/utils'

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  const res = await logout();
  const { success = false, msg = '' } = res || {};
  if (success) {
    const { query = {}, search, pathname } = history.location;
    const { redirect } = query;
    // deleteCookie('token');
    // localStorage.clear();
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
    msg && message.success(msg);
  }
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const onMenuClick = useCallback(
    async (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        await loginOut();
        setInitialState((s) => ({ ...s, currentUser: undefined, menuData: {} }));
        return;
      }
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser = {} } = initialState;

  if (!currentUser || !currentUser?.display_name) {
    return loading;
  }

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {/* {menu && (
        <Menu.Item key="center">
          <UserOutlined />
          个人中心
        </Menu.Item>
      )} */}
      {/* {menu && (
        <Menu.Item key="settings">
          <SettingOutlined />
          个人设置
        </Menu.Item>
      )} */}
      {menu && <Menu.Divider />}

      <Menu.Item key="logout">
        <LogoutOutlined />
        <FormattedMessage id="menu.account.logout" />
      </Menu.Item>
    </Menu>
  );
  return (
    <HeaderDropdown overlay={menuHeaderDropdown}>
      <span className={`${styles.action} ${styles.account}`}>
        {currentUser?.avatar ? <Avatar size="small" className={styles.avatar} src={currentUser?.avatar} alt="avatar" />
          : <UserOutlined style={{ fontSize: '14px' }} />
        }
        <span className={`${styles.name} anticon`}>&nbsp;{currentUser?.display_name}</span>
      </span>
    </HeaderDropdown>
  );
};

export default AvatarDropdown;

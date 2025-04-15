import { LockOutlined, UserOutlined, } from '@ant-design/icons';
import { message, Modal } from 'antd';
import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { CloseOutlined } from '@ant-design/icons'
import { LoginForm, ProFormText } from '@ant-design/pro-form';
import { history, SelectLang, useIntl, useModel } from 'umi';
import { login } from '@/apis/login';
import { addCookie, deleteCookie } from '@/utils';
import './index.less';

const Login = (props: any, ref: any) => {
  const [isShow, setShow] = useState(true);
  const commonLoginDlgRef = useRef();
  const { initialState, setInitialState } = useModel('@@initialState');
  const isEn = (localStorage.getItem('currentLocal') || navigator.language).includes('en');

  useImperativeHandle(ref, () => ({
    show,
  }));

  const show = () => {
    // commonLoginDlgRef.current && (commonLoginDlgRef.current.classList.add('common-login-dlg-show'));
    setShow(true);
  }

  const onCancel = () => {
    setShow(false);
    commonLoginDlgRef.current && (commonLoginDlgRef.current.classList.remove('common-login-dlg-show'));
  }

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    const menuInfo = await initialState?.fetchMenuData?.();
    if (userInfo?.success) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo?.data,
        menuData: menuInfo,
      }));
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      const res = await login({ ...values });
      const { success = false, msg = '' } = res || {};
      if (success) {
        addCookie('token', res?.data?.access || '');
        addCookie('refresh', res?.data?.refresh || '');
        onCancel();
        await fetchUserInfo();
      } else {
        msg && message.warn(msg);
        addCookie('token', '');
      }
    } catch (error) {
      addCookie('token', '');
      const defaultLoginFailureMessage = isEn ? 'Login failed, please try again!' : '登录失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  return (
    <div className="common-login-dlg" ref={commonLoginDlgRef}>
      <div className='loginDlgWrapper'>
        <div className='cnt'>
          <div className='tip'>需要进行身份验证
            <span className='close' onClick={() => onCancel()}> <CloseOutlined /></span>
          </div>
          <p className='tip noBorder font13'>登录已过期，请重新登录</p>
          <div className='content'>
            <div className='content2'>
              <div className='user'>
                <LoginForm
                  className='loginForm'
                  onFinish={async (values) => {
                    await handleSubmit(values as API.LoginParams);
                  }}
                  submitter={{
                    searchConfig: { submitText: isEn ? 'Login' : '登录' }
                  }}
                >
                  <ProFormText
                    name="username"
                    // label="用户名："
                    fieldProps={{
                      size: 'large',
                      prefix: <UserOutlined className='prefixIcon' />,
                      autoComplete: 'on'
                    }}
                    placeholder={isEn ? 'Please input your username!' : '请输入用户名'}
                    rules={[
                      {
                        required: true,
                        message: (
                          isEn ? 'Please input your username!' : '请输入用户名!'
                        ),
                      },
                    ]}
                  />
                  <ProFormText.Password
                    name="password"
                    // label="密　码："
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined className='prefixIcon' />,
                      autoComplete: 'on'
                    }}
                    placeholder={isEn ? 'Please input your password!' : '请输入密码'}
                    rules={[
                      {
                        required: true,
                        message: (
                          isEn ? 'Please input your password!' : '请输入密码'
                        ),
                      },
                    ]}
                  />
                </LoginForm>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Modal title="需要进行身份验证" width={430} open={true} onCancel={onCancel} destroyOnClose={true} footer={null} className='loginDlgWrapper'
      // keyboard={false} closeIcon={<></>} maskClosable={false}
      >
        <div className='cnt'>
          <p className='tip'>登录已过期，请重新登录</p>
          <div className='content'>
            <div className='content2'>
              <div className='user'>
                <LoginForm
                  className='loginForm'
                  onFinish={async (values) => {
                    await handleSubmit(values as API.LoginParams);
                  }}
                  submitter={{
                    searchConfig: {
                      submitText: isEn ? 'Login' : '登录',
                    }
                  }}
                >
                  <ProFormText
                    name="username"
                    label="用户名："
                    fieldProps={{
                      size: 'large',
                      prefix: <UserOutlined className='prefixIcon' />,
                      autoComplete: 'on'
                    }}
                    placeholder={isEn ? 'Please input your username!' : '请输入用户名'}
                    rules={[
                      {
                        required: true,
                        message: (
                          isEn ? 'Please input your username!' : '请输入用户名!'
                        ),
                      },
                    ]}
                  />
                  <ProFormText.Password
                    name="password"
                    label="密　码："
                    fieldProps={{
                      size: 'large',
                      prefix: <LockOutlined className='prefixIcon' />,
                      autoComplete: 'on'
                    }}
                    placeholder={isEn ? 'Please input your password!' : '请输入密码'}
                    rules={[
                      {
                        required: true,
                        message: (
                          isEn ? 'Please input your password!' : '请输入密码'
                        ),
                      },
                    ]}
                  />
                </LoginForm>
              </div>
            </div>
          </div>
        </div>
      </Modal > */}
    </div>
  );
};

export default forwardRef(Login);

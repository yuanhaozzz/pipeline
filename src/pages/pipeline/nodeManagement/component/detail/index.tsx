import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, Checkbox, message } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import AddKeyValue from '../addKeyValue'
import CommonAddKeyValue from '@/components/formComponent/newAddKeyValue'
import { getCredentialApi, editApi, addApi, findUser, vaildCredentialApi } from './service'
import { validator } from '@/pages/pipeline/created/component/flow/component/configModal/data'
import { debounce } from 'lodash';

import './style.less'
import { deepCopy } from '@/utils'

const { TextArea } = Input;

export interface IAppProps {
  updateList?(): any
}

function LoadModal(props: IAppProps, ref: any) {
  const { updateList } = props
  const [modal, setModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userList, setUserList] = useState([]);

  const [credential, setCredential] = useState([])
  const [record, setRecord] = useState<any>({})

  const variableRef = useRef(null)
  const refreshRef = useRef(null)
  const addKeyValueRef = useRef(null)
  const commonAddKeyValueRef = useRef(null)
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open
  }))

  useEffect(() => {
    handleCredential()
  }, [credential, record])

  const handleCredential = async () => {
    if (credential.length > 0 && record.id) {
      const deploy_credential = record.deploy_credential
      const isExist = credential.find(item => item.uuid === deploy_credential)
      if (!isExist && deploy_credential) {
        try {
          const params = {
            credential_uuid: deploy_credential
          }

          const { data } = await vaildCredentialApi(params)
          let value = deploy_credential
          if (!data.is_public) {
            value = '***（暂无权限）'
          }
          if (data.is_deleted) {
            value = ''
          }
          form.setFieldValue('deploy_credential', value)
        } catch (error) {

        }
      }
    }
  }

  const getCredential = async () => {
    const params = {
      page_num: 1,
      size: 1000
    }
    const { data } = await getCredentialApi(params)
    setCredential(data.map(item => {
      return {
        label: item.name,
        value: item.uuid
      }
    }))
  }

  const open = (record: any = {}) => {
    record = deepCopy(record)
    getCredential()
    if (record.id) {
      form.setFieldsValue(record)
      form.setFieldValue('admin_users', record.admin_users_info?.map(item => item.display_name + '   ' + item.user_id) || [])
      setTimeout(() => {
        addKeyValueRef.current.setValue(record.tags || [])
        commonAddKeyValueRef.current.setValue(record.environment || [])
      }, 100);
    }
    if (record.isCopyButton) {
      form.setFieldValue('deploy_host', undefined)
    }
    setModal(true)

    setRecord(record)

  }

  const onCancel = () => {
    form.resetFields()
    addKeyValueRef.current.setValue([])
    commonAddKeyValueRef.current.setValue([])
    setModal(false)
    setRecord({})
    setCredential([])
  }

  const summit = async () => {
    try {
      const values = await form.validateFields()
      values.admin_users = values.admin_users?.map(item => (item.value || item).split('   ')[1]) || []
      values.tags = addKeyValueRef.current.getValue().map(item => {
        return {
          name: item.name,
          // concurrent: item.concurrent || 0
        }
      })
      values.environment = commonAddKeyValueRef.current.getValue()
      for (let key in values) {
        if (key.includes('0.')) {
          delete values[key]
        }
      }
      values.deploy_credential = values.deploy_credential.includes('***') ? record.deploy_credential : values.deploy_credential
      delete values['keyValue']
      setLoading(true)
      const api = record.id && !record.isCopyButton ? editApi : addApi
      await api(values, record.id)
      message.success(`${record.id ? '编辑' : '新增'}成功`)
      updateList()
      onCancel()
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }


  const validatorPort = (info, value) => {
    const reg = /^[1-9]\d*$/
    if (!reg.test(value)) {
      return Promise.reject(new Error('请填写大于0的整数'))
    }
    if (value > 65535) {
      return Promise.reject(new Error('不超过65535'))
    }
    return Promise.resolve()
  }

  const validatorHost = (info, value) => {
    const reg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
    if (!reg.test(value)) {
      return Promise.reject('格式不正确，例：10.9.122.122')
    }
    return Promise.resolve()
  }

  const validatorName = (info, value = '') => {
    if (!value.trim()) {
      return Promise.reject('请输入名称')
    }
    return Promise.resolve()
  }


  const validatorConcurrent = (info, value) => {
    const reg = /^[1-9]\d*$/
    if (!reg.test(value)) {
      return Promise.reject(new Error('请填写大于0的整数'))
    }

    if (value > 2147483647) {
      return Promise.reject(new Error('不超过2147483647'))
    }

    return Promise.resolve()
  }

  const refresh = () => {
    refreshRef.current.style.transform = 'rotate(360deg)'
    refreshRef.current.style.transition = 'all 0.6s'
    getCredential()
    setTimeout(() => {
      refreshRef.current.style.transition = 'none'
      refreshRef.current.style.transform = 'rotate(0deg)'
    }, 300);
  }

  const openUserCredentials = () => {
    window.open('/FlowLine/userCredentials')
  }


  const handleFindUser = async (value: string) => {
    const res = await findUser({ username: value });
    setUserList(res || []);
  };

  const userSearch = debounce(handleFindUser, 100);

  return (
    <div ref={variableRef}>
      <Modal title={record.id ? record.isCopyButton ? '复制' : '编辑' : '新增'} centered width={'800px'} className='flow-line-nodeManagement-container' destroyOnClose={true} footer={[
        <Button onClick={onCancel}>取消</Button>,
        <Button type="primary" onClick={summit} loading={loading}>确定</Button>,
      ]} open={modal} onCancel={onCancel}>
        <br />
        <Form form={form} name="control-hooks" labelCol={{ span: 3 }} preserve={false} className='nodeManagement-box common-scroll-bar'>
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '' }, { validator: validatorName }]}>
            <Input placeholder='50个字符以内' maxLength={50} />
          </Form.Item>
          <Form.Item name="description" label="描述" >
            <TextArea
              showCount
              placeholder='200个字符以内'
              maxLength={200}
              autoSize={{ minRows: 2 }}
            />
          </Form.Item>
          <Form.Item name="type" label="类型" initialValue={'openstack'} required>
            <Select options={[{ label: '物理机', value: 'metal' }, { label: 'Openstack 虚拟机', value: 'openstack' },]}></Select>
          </Form.Item>
          <Form.Item name="deploy_host" label="IP 地址" rules={[{ required: true, message: '' }, { validator: validatorHost }]}>
            <Input placeholder='请输入 IP 地址' />
          </Form.Item>
          <Form.Item name="deploy_port" label="端口号" required rules={[{ validator: validatorPort }]} initialValue={22}>
            <Input placeholder='请输入端口号' />
          </Form.Item>
          <Form.Item label="用户凭证" name={'deploy_credential'} rules={[{ required: true, message: '请选择用户凭证' }]} >
            <div className='flex-start'>
              <div style={{ position: 'relative', flex: 1 }}>
                <Form.Item name={'deploy_credential'} noStyle>
                  <Select
                    allowClear
                    showSearch
                    placeholder="请选择用户凭证"
                    onChange={() => {
                      form.validateFields(['deploy_credential'])
                    }}
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.label ?? '').toLocaleLowerCase().includes(input.toLocaleLowerCase())}
                    options={credential}
                  />
                </Form.Item>
                <div onClick={refresh} className='nodeManagement-detail-refresh' ref={refreshRef}>
                  <ReloadOutlined style={{ color: '#9f9999', cursor: 'pointer' }} />
                </div>
              </div>
              <Button type='link' onClick={openUserCredentials}>新增</Button>
            </div>
          </Form.Item>

          <Form.Item label={'并发数'} required name={`concurrent`} rules={[{ validator: validatorConcurrent }]} initialValue={1}>
            <Input placeholder='请输入并发数' />
          </Form.Item>
          <Form.Item name="admin_users" label='管理员' >
            <Select
              showSearch
              allowClear
              mode='multiple'
              filterOption={false}
              onSearch={userSearch}
              placeholder='请输入管理员'
              labelInValue
            >
              {(userList || []).map((user: any) => (
                <Select.Option key={`${user?.user_id}`} value={`${user?.username}   ${user?.user_id}`}>{user?.username}   {user?.user_id}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <AddKeyValue ref={addKeyValueRef} form={form} />
          <CommonAddKeyValue ref={commonAddKeyValueRef} form={form} formConfig={{ label: '环境变量', name: 'environment', style: { margin: 0 } }} value={'value'} keys={'key'} required={false} rightConfig={{ rules: [{ require: true, message: '' }, { validator: validator['stringNotEmpty'] }] }} />

          <Form.Item name="enable" label="是否启用" valuePropName='checked' initialValue={true}>
            <Checkbox ></Checkbox>
          </Form.Item>
          <Form.Item name="is_public" label="是否公开" valuePropName='checked' initialValue={false} >
            <Checkbox ></Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}


export default forwardRef(LoadModal)
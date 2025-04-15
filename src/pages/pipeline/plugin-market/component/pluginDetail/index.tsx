import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

import { Modal, DatePicker, Select, Empty, Button, Form, Input, Popconfirm, Popover, Checkbox, message } from 'antd'
import UploadImage from '@/components/uploadImage'
import './style.less'
import CodeMirror from '@uiw/react-codemirror';
import { xcodeDark } from '@uiw/codemirror-theme-xcode';
import { langs } from '@uiw/codemirror-extensions-langs';
import { atoLlist } from '../../service';
import { addApi, saveApi, publishApi, detailApi } from './service'
import { validator } from '@/pages/pipeline/created/component/flow/component/configModal/data'
import { shellTemplate, formTemplate } from './data'
import { PlusOutlined, MinusOutlined, EditOutlined } from '@ant-design/icons'
import { getUrlParams, isUserAuth } from '@/utils'
import { useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import OutVariables from '../outVariables'

function LoadModal(props: IAppProps, ref: any) {
  const [modal, setModal] = useState(true)
  const [record, setRecord] = useState({})
  const [detail, setDetail] = useState({})
  const [loading, setLoading] = useState(false)

  const [checkboxValue, setCheckboxValue] = useState(true)
  const [isAuth, setAuth] = useState(true)

  const [tabItems, setTabItems] = useState([]);
  const [variables, setVariables] = useState([]);

  const query = getUrlParams()
  const variableRef = useRef(null)
  const uploadImageRef = useRef(null)
  const outVariablesRef = useRef(null)

  const [form] = Form.useForm();

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;


  useEffect(() => {
    getTab()
  }, [])

  useEffect(() => {
    getDetail()
  }, [])

  useEffect(() => {
    if (query.from === 'view') {
      setAuth(false)
    }
    // isUserAuth(currentUser, record?.creator_user_id)
  }, [])

  const getDetail = async () => {
    const { id } = query
    if (id) {
      const { data } = await detailApi(id)
      data.json_form = data.json_form || formTemplate
      data.script = data.script || ''
      form.setFieldsValue(data)
      if (outVariablesRef.current) {
        outVariablesRef.current.setValue(data.out_variables || [])
      }
      setRecord(data)
      uploadImageRef.current.setImage(data.logo_url)
    }
  }

  const getTab = async (params?) => {
    const res = await atoLlist(params)
    const table = res.data.atom_type || []
    table.shift()
    res.data = res.data.atom_info || []
    setTabItems(table)
  }

  const validatorImage = (info, value) => {
    const v = uploadImageRef.current.getImage()
    if (!v) {
      return Promise.reject('请上传插件图标')
    }
    return Promise.resolve()
  }

  const update = () => {
    form.validateFields(['logo_url'])
  }

  const handleScript = () => {

  }



  const handleFormValue = async (type) => {
    const values = await form.validateFields()
    if (outVariablesRef.current) {
      values.out_variables = outVariablesRef.current.getValue()
    }

    values.logo_url = uploadImageRef.current.getImage()
    const atomForm = values.json_form.trim()
    if (!atomForm) {
      values.json_form = "[]"
    }
    values.json_form = values.json_form

    // if (type === 'publish') {
    //   values.upgrade = checkboxValue
    // }
    if (query.id) {
      values.uuid = query.id
    }
    return values
  }

  // 保存
  const save = async () => {
    try {
      const params = await handleFormValue('save')
      await saveApi(params)
      message.success(`${query.id ? '保存' : '新增'}成功`)
      props.history.push(`/FlowLine/pluginMarket`)
    } catch (error) {

    }
  }

  // 发布
  const submit = async () => {
    const params = await handleFormValue('publish')
    // console.log(JSON.stringify(values.atomForm))
  }

  const reset = () => {
    form.resetFields()
  }

  const edit = () => {
    setAuth(true)
  }

  const renderPopver = () => {
    return <div>
      <Checkbox value={checkboxValue} onChange={(e) => setCheckboxValue(e.target.checked)}>是否升级版本</Checkbox>
      <Button type='primary' onClick={submit} loading={loading} >确定</Button>
    </div>
  }

  return (
    <PageContainer>
      <div ref={variableRef} className='pluginMarket-plugin-detail common-scroll-bar'>
        <Form form={form} name="control-hooks" labelCol={{ span: 3 }} wrapperCol={{ span: 19 }} disabled={!isAuth}>
          {/* <div className='flex-center'>
            <Form.Item name="note" label="" >
              <Select placeholder="请选择插件版本" style={{ width: '200px' }}>
                <Option value="1">
                  s
                </Option>
              </Select>
            </Form.Item>
          </div> */}
          <Form.Item name="name" label="插件名称" rules={[{ required: true, message: '请输入插件名称' }]}>
            <Input placeholder='请输入插件名称，最多50个字符' maxLength={50} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder='请输入描述，最多50个字符' maxLength={50} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型" >
              {
                tabItems.map(item => (
                  <Select.Option value={item.type} key={item.name}>
                    {item.name}
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>
          <Form.Item name="image" label="镜像" rules={[{ validator: validator['stringEnglishNotRequired'] }]}>
            <Input placeholder='请输入镜像' />
          </Form.Item>
          <Form.Item name="logo_url" label="插件图标" required rules={[{ validator: validatorImage }]}>
            <UploadImage ref={uploadImageRef} update={update} disabled={!isAuth} />
          </Form.Item>
          <Form.Item name="json_form" label="配置表单" initialValue={formTemplate} rules={[{ validator: validator['vaildJSON'] }]} className={!isAuth ? 'CodeMirrorReadonly' : ''}>
            <CodeMirror
              height="500px"
              extensions={[langs.json()]}
              theme={xcodeDark}
              readOnly={!isAuth}
            // readOnly={type !== 1 || component.readOnly}
            />
          </Form.Item>
          <Form.Item name="script" label="脚本" rules={[{ required: true, message: '请填写脚本' }]} initialValue={shellTemplate} className={!isAuth ? 'CodeMirrorReadonly' : ''}>
            <CodeMirror
              height="500px"
              extensions={[langs.shell()]}
              theme={xcodeDark}
              readOnly={!isAuth}
            // readOnly={type !== 1 || component.readOnly}
            />
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {
              () => {
                if (record?.language === 'shell' || (!isAuth && record?.out_variables?.length <= 0)) {
                  return <></>
                }
                return <OutVariables form={form} isAuth={isAuth} ref={outVariablesRef} label="输出环境变量" variables={variables} />
              }
            }
          </Form.Item>
          <div className='flex-center'>
            <Button onClick={() => props.history.goBack()} disabled={false}>返回</Button>&nbsp;&nbsp;&nbsp;&nbsp;
            <Button type='primary' onClick={() => save()}>保存</Button>
            {
              query.from === 'view' && <Popover placement="bottom" content={`${isUserAuth(currentUser, record?.creator_user_id) ? '编辑' : '暂无权限'}`} trigger="hover">
                {/* type='primary' ghost */}&nbsp;&nbsp;&nbsp;&nbsp;
                {/* icon={<EditOutlined />} */}
                <Button type='primary' disabled={!isUserAuth(currentUser, record?.creator_user_id)} ghost onClick={() => edit()}>编辑</Button >
              </Popover>
            }
            {/* &nbsp;&nbsp;&nbsp;&nbsp;
          <Popover placement="top" content={renderPopver()} trigger="click">
            <Button type='primary' >提交</Button>
          </Popover> */}
          </div>
        </Form>
      </div>
    </PageContainer>
  );
}


export default forwardRef(LoadModal)
import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'dva'
import { PlusOutlined, ApartmentOutlined, DownOutlined, HistoryOutlined, CaretRightOutlined, EditOutlined, UserOutlined, SwapOutlined } from '@ant-design/icons'
import { Button, message, Tooltip, Form, Input, Radio, Select, Spin, Switch, Popover } from 'antd'
import { PageContainer } from '@ant-design/pro-layout';
// import { setPipeline } from '@/store/actions'

import Nav from '../nav'
import { useScreenHeight } from '@/utils/hook'
import './style.less'
import { tabList } from './data'
import { searchRepo, searchBranch, searchCommitId } from '../baseConfig/component/environmentVariable/components/repo/service'
import debounce from 'lodash/debounce';
import Flow from '../flow'
import { getUrlParams, deepCopy, isUserAuth } from '@/utils'
import { searchPipelineApi, triggerPipelineApi, getPiplineJsonApi } from './service'
import { canEditApi } from '@/pages/pipeline/created/service'
import { addType } from '../../data'
import BaseConfig from '../baseConfig'
import { updateApi } from '../modify/service'
import AnimationHeight from '@/components/animation/height'
import Notify from '../modify/component/notify'
import Env from './components/env'
import ExecModal from '../execModal'
import JsonEditor from '@/components/JsonEditor'
import { useModel } from "umi";
import PlayImage from '@/assets/images/play.png'
import { handleVariableList } from '../../common'
import MinMap from '../minMap'
import { checkPipilineAuth } from '@/utils/menu'
import { RenderMoreButton, commonHandleTriggerType, RenderToolButton, setCompatiblePath } from '@/pages/pipeline/created/common'

const { Option } = Select;

function Project(props) {
  // const height = useScreenHeight(0.79)
  const [data, setData] = useState(null)
  const [tabIndex, setTabIndex] = useState(1)
  const [envContent, setEnvContent] = useState(true)
  const [execLoading, setExecLoading] = useState(false)
  const [tableData, setTableData] = useState<any>({ data: [] })
  const [canEdit, setCanEdit] = useState({}) // 是否可以编辑, success: true 可以编辑，false为不可编辑
  const [viewType, setViewType] = useState('pipline')
  const [taskShow, setTaskShow] = useState(false)
  const renderToolButtonRef = useRef(false)

  const nofityRef = useRef(null)
  const baseConfigRef = useRef(null)
  const variableRef = useRef(null)
  const envRef = useRef(null)
  const heightRef = useRef(null)
  const execModalRef = useRef(null)
  const [form] = Form.useForm();

  const { pipelineId, version, from, } = getUrlParams()
  const pipeline = useSelector(({ pipeline }) => pipeline)
  const query = getUrlParams()

  const dispatch = useDispatch()

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  useEffect(() => {
    // if (query.from === 'add') {
    setTabIndex(((query.tab as any) * 1) || 0)
    // }
  }, [])

  useEffect(() => {
    getDetail()
    judgeEdit()
  }, [])

  const getDetail = async () => {
    try {
      const index = pipeline.list.findIndex((item: any) => (item.id * 1) === (pipelineId * 1))
      let data = pipeline.list[index]
        addType(data.stages)
        data.template = data.stages
        data.iid = data.id
        data.id = pipelineId
        pipeline.list[index] = deepCopy(data)
        // dispatch(setPipeline({ list: [...pipeline.list] }))
        dispatch({
          type: 'pipeline/setList',
          payload: { list: [...pipeline.list] }
        })
      if (renderToolButtonRef.current) {
        renderToolButtonRef.current.setExpandTask(data, data.setting?.extra_data?.isExpandAll)
      }
      setData({ ...data })
      let { pipeline_variable: env = [] } = data.setting
      if (env) {
        setTimeout(() => {
          // envRef.current.setEnv(env)
          const repo = env.find(item => item.type.includes('git_url')) || {}
          variableRef.current.repoInfo = repo.urlValue
          // if (heightRef?.current) {
          //   heightRef.current.init()
          // }
        }, 300);
      }
    } catch (error) {
      console.log(error)
    } finally {
    }
  }

  const jumpToRecord = () => {
    let path = setCompatiblePath(`/FlowLine/created/preview?pipelineId=${pipelineId}&pipelineName=${data.name}&tab=1`)
    !!query?.from && (path += `&from=${query.from}`)
    props.history.push(path)
  }

  const judgeEdit = async () => {
    const res = await canEditApi({ uuid: pipelineId })
    const { status, data, msg } = res || {}  // true 可以编辑，false为不可编辑
    setCanEdit({ ...data, status })
    !status && data?.user_id !== currentUser?.id && query?.from !== 'entry' && message.warn(msg)
    return status
  }

  const edit = async () => {
    query.from = ''
    const status = await judgeEdit()
    if (status || canEdit?.user_id === currentUser?.id) {
      props.history.push(setCompatiblePath(`/FlowLine/created/modify?pipelineId=${pipelineId}&tab=${tabIndex}`))
    } else {
      jumpToRecord()
    }
  }

  const goRerecord = () => {
    props.history.push(setCompatiblePath(`/FlowLine/created/recentlyRun?pipelineId=${data.uuid}&pipelineName=${data.name}`))
  }

  const changeView = () => {
    setViewType(viewType === 'json' ? 'pipline' : 'json')
  }

  const switchTab = (index: number) => {
    setTabIndex(index)
  }

  const getFormValue = async () => {
    return handleVariableList(data.setting?.pipeline_variable || [])
  }

  const openPipelineModal = (record) => {
    execModalRef.current.open({ id: record.uuid })
  }


  const changeHeight = () => {
    // heightRef.current.changeHeight()
  }

  const exec = async () => {
    openPipelineModal(data)
  }

  const goHistory = () => {
    if (!checkPipilineAuth('History', query.pipelineId)) {
      message.error('暂无权限')
      return
    }
    props.history.push(setCompatiblePath(`/FlowLine/created/recentlyRun?pipelineId=${pipelineId}&pipelineName=${data?.name}`))
    // props.history.push(`/FlowLine/recentlyRun?pipelineId=${pipelineId}&pipelineName=${data?.name}`)
  }

  const renderTab = () => {
    return (
      <div className='content-tab flex-space-between'>
        <div className='flex-start'>
          {
            tabList.map((item, index) => (
              <div key={item.id} className={`content-tab-item ${index === tabIndex && 'item-action'}`} onClick={() => switchTab(index)}>
                <h3>{item.name}</h3>
                {
                  index === tabIndex && <div className='item-line'></div>
                }
              </div>
            ))
          }

        </div>
        <div style={{ paddingRight: '17px' }}>
          {
            data?.name && <div className='content-tab-right-item flex-start'>
              <div style={{ color: '#c4cdd6' }}>流水线名称：</div>
              <span className='common-Jumpable-color' style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={goHistory}>
                {
                  data?.name
                }
              </span>
            </div>
          }

        </div>
        {/* 操作  */}
        <div className='flex-start content-tab-header-handle'>
          {!canEdit?.status && canEdit?.name && canEdit?.user_id !== currentUser?.id && <span className='canEdit'><UserOutlined /> {canEdit?.name ?? ''} 正在编辑中... &nbsp;&nbsp;&nbsp;</span>}
          {from === 'editHistory' && <>
            <Switch onChange={() => changeView()} checkedChildren="UI" unCheckedChildren="Raw" />
            &nbsp;&nbsp;</>}
          {from !== 'editHistory' && <>
            <Popover content="运行记录">
              <Button disabled={!checkPipilineAuth('History', query.pipelineId)} onClick={goRerecord} icon={<HistoryOutlined />}></Button>&nbsp;&nbsp;
            </Popover>

            {
              checkPipilineAuth('Update', query.pipelineId)
                ?
                <Popover content="编辑流水线"><Button onClick={edit} disabled={!canEdit?.status && canEdit?.user_id !== currentUser?.id} className='flex-center' icon={<EditOutlined className='flow-created-EditOutlined-icon' />}></Button></Popover>
                :
                <Tooltip placement="top" title={'暂无权限编辑'}>
                  <Popover content="编辑流水线"><Button onClick={edit} disabled className='flex-center' icon={<EditOutlined className='flow-created-EditOutlined-icon' />}></Button></Popover>
                </Tooltip>
            }
            {/* <Button onClick={edit} >编辑</Button> */}
            &nbsp;&nbsp;
          <Popover content="运行流水线"><Button type='primary' onClick={exec} loading={execLoading} icon={<CaretRightOutlined />}></Button></Popover>
            {<RenderMoreButton data={data} {...props} uuid={pipelineId} />}
          </>}
        </div>
      </div >
    )
  }



  const renderEnv = () => {
    if (!data?.setting) {
      return <></>
    }
    let { pipeline_variable: env = [] } = data.setting
    if (!env || env.filter((item: any) => item.prompt_on_trigger).length <= 0) {
      return <></>
    }
    env = env.filter((item: any) => item.name || item.type === 'component' || item.type === 'repo')

    return <div className='preview-content-env'>
      <header className='env-header'>
        <span className='env-header-content' onClick={() => setEnvContent(!envContent)}>
          流水线变量：<span style={{ fontSize: '10px', color: '#1890ff' }}>{envContent ? '收起' : '展开'}</span>
          {/* <DownOutlined className={`arrow ${envContent && 'rotate-arrow'}`} /> */}
        </span>
      </header>
      {/* 填写项 */}
      <Form layout="vertical" form={form} className='env-form'>
        {
          // <AnimationHeight status={envContent} ref={heightRef}>
          <div style={{ display: envContent ? 'block' : 'none' }}>
            <Env env={env} form={form} ref={envRef} data={data} pipelineId={pipelineId} changeHeight={changeHeight} />
          </div>

          // </AnimationHeight>
        }
      </Form>
    </div >
  }

  const renderPipelineContent = () => {
    if (!data) {
      return <></>
    }
    // return <div className={`content-container common-content-container ${tabIndex === 0 && 'content-container-show-action'}`} style={{ height }}>
    return <div className={`content-container common-content-container ${tabIndex === 1 && 'content-container-show-action'}`} >
      {/* {renderEnv()} */}
      <Flow data={data} type={2} setData={setData} getEnvForm={getFormValue} />
    </div>
  }

  const rendeJsonContent = () => {
    return (
      <div className={`jsoneditor-viewer`} style={{ display: viewType === 'json' ? 'block' : 'none' }}>
        <JsonEditor value={data} mode='view' />
      </div>
    );
  }

  const renderPipleCnt = () => {
    // 
    return <div style={{ height: '100%', display: viewType === 'pipline' ? 'block' : 'none' }}>
      {renderToolButton()}
      {renderPipelineContent()}
      {renderBaseConfig()}
      {/* 通知 */}
      {renderNotify()}
    </div>
  }

  const renderPipeline = () => {
    return (
      <div className='pipeline-preview-content'>
        {renderTab()}
        {renderPipleCnt()}
        {rendeJsonContent()}
      </div>
    )
  }
  const renderToolButton = () => {
    if (tabIndex !== 1) {
      return <></>
    }
    return <RenderToolButton data={data} setData={setData} setTaskShow={setTaskShow} taskShow={taskShow} ref={renderToolButtonRef} />
  }

  const renderBaseConfig = () => {
    if (!data) {
      return <></>
    }
    return <div className={`content-container common-content-container  ${tabIndex === 0 && 'content-container-show-action'}`}>
      <BaseConfig ref={baseConfigRef} data={data} setTabIndex={setTabIndex} {...props} type={2} />
    </div>
  }

  const renderNotify = () => {
    if (!data) {
      return <></>
    }
    return <div className={`content-container common-content-container  ${tabIndex === 2 && 'content-container-show-action'}`}>
      <Notify ref={nofityRef} data={data} setTabIndex={setTabIndex} {...props} type={2} defaultSwitchTabIndex={0} />
    </div>
  }

  const renderMap = () => {
    if (!data || tabIndex !== 1 || viewType !== 'pipline') {
      return <></>
    }
    return <MinMap data={data} type={1} />
  }

  return (
    <PageContainer>
      <div className='pipeline-container pipeline-preview-container common-reset replace-font-size-12' ref={variableRef}>
        {renderPipeline()}
        {renderMap()}
        <ExecModal ref={execModalRef} {...props} />
      </div>
    </PageContainer>
  );
}

export default Project
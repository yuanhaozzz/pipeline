import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'dva'
import { message, Modal, Popover, Tabs } from 'antd'

// import { setPipeline } from '@/store/actions'
import { ApartmentOutlined, ExclamationCircleOutlined, SaveOutlined, CloseSquareOutlined, DownOutlined } from '@ant-design/icons'
import { Button, Segmented } from 'antd'
import { tabList } from './data'

import { getUrlParams, deepCopy, replaceURL } from '@/utils'
import './style.less'
import { useModel, useNavigate} from 'umi';
import { useScreenHeight } from '@/utils/hook'
import { PageContainer } from '@ant-design/pro-layout';
import MinMap from '../minMap'
import Flow from '../flow'
import BaseConfig from '../baseConfig'
import Notify from './component/notify'
import CancelModal from './component/cancelModal';
import Nav from '../nav'
import { editApi, updateApi, searchPipelineApi, lockEditApi, releaseCanEditApi, setTriggerListAPi } from './service'
import { canEditApi } from '@/pages/pipeline/created/service'

import { templateList } from '../template/data'
import { addType } from '../../data'
import moment from 'moment';
import { handleVariableList } from '../../common'
import { renderStatus, RenderMoreButton, RenderToolButton, setCompatiblePath } from '@/pages/pipeline/created/common'
import { useLocation } from 'react-router-dom';
const { confirm } = Modal;
import { checkPipilineAuth } from '@/utils/menu'

function Project(props: any) {
  // const height = useScreenHeight(0.79)
  // const [height, setHeight] = useState('calc(100% - 60px)')
  const [tabIndex, setTabIndex] = useState(1)
  const [data, setData] = useState(null)
  const [settingValue, setSettingValue] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [taskShow, setTaskShow] = useState(false)
  // const [canEdit, setCanEdit] = useState({}) // 是否可以编辑, success: true 可以编辑，false为不可编辑
  const query = getUrlParams()
  const pipeline = useSelector(({ pipeline }) => pipeline)
  const dispatch = useDispatch()
  const { initialState, } = useModel('@@initialState');
  const { currentUser = {} } = initialState;
  const navigate = useNavigate()

  const variableRef = useRef(null)
  const cancelModalRef = useRef(null)
  const baseConfigRef = useRef(null)
  const nofityRef = useRef(null)
  const rawDataRef = useRef({})
  const isLoadPage = useRef(false)
  const renderToolButtonRef = useRef(false)
  const confirmationMessage = useRef('')
  let canEdit = {} // 是否可以编辑, success: true 可以编辑，false为不可编辑

  const location = useLocation();

  useEffect(() => {
    // if (query.from === 'add') {
    setTabIndex(((query.tab as any) * 1) || 0)
    // }

    return () => {
      (currentUser.id === canEdit?.user_id) && releaseEdit()
      dispatch({
        type: 'pipeline/setList',
        payload: { list: [...pipeline.list], importData: {} }
      })
    }
  }, [])

  useEffect(() => {
    getDetail()
    judgeEdit()
  }, [location.search])

  useEffect(() => {
    if (data) {
      variableRef.current.isLoad
      if (variableRef.current?.isModifyLoad) {
        variableRef.current.isModify = true
      } else {
        variableRef.current.isModifyLoad = true
      }
    }
  }, [data])

  useEffect(() => {
    window.addEventListener('unload', unload)
    window.addEventListener('beforeunload', beforeunload)
    return () => {
      window.removeEventListener('unload', unload)
      window.removeEventListener('beforeunload', beforeunload)
    }
  }, [])

  const getDetail = async () => {
    try {
      const { pipelineId, source } = query
      const index = pipeline.list.findIndex((item: any) => (item.id * 1) === (pipelineId * 1))
      // if (!data) {
      // let res = await searchPipelineApi(pipelineId)
      let data = pipeline.list[index]
      data.stages = data.template
      rawDataRef.current = deepCopy(data)
      // 导入存在
      if (pipeline.importData?.stages) {
        data.stages = deepCopy(pipeline.importData.stages)
        data.setting = deepCopy(pipeline.importData.setting)
        data.run_lock_type = pipeline.importData.run_lock_type
        data.setting.hook_url = rawDataRef.current.setting.hook_url
        // res = { data: pipeline.importData }
        variableRef.current.isModify = true
      }

      if (!data.stages || data.stages.length <= 0) {
        data.stages = deepCopy(templateList[0].template)
      }
      data.run_lock_type = true
      data.setting = {
        trigger_type: 'HOOK',
        git_info: {},
        enabled: true,
        run_lock_type: true,
        notification: {
          success: {},
          failed: {},
          canceled: {}
        }
      }
      if (renderToolButtonRef.current) {
        renderToolButtonRef.current.setExpandTask(data, data.setting?.extra_data?.isExpandAll)
      }
      addType(data.stages)
      data.template = data.stages
      data.iid = data.id
      data.id = pipelineId
      if (index < 0) {
        pipeline.list.push(deepCopy(data))
      } else {
        pipeline.list[index] = deepCopy(data)
      }
      // dispatch(setPipeline({ list: [...pipeline.list] }))
      dispatch({
        type: 'pipeline/setList',
        payload: { list: [...pipeline.list] }
      })
      // }


      setData({ ...data })
      setSettingValue({ ...data })


    } catch (error) {
      console.log(error)
    } finally {

    }
  }

  const judgeEdit = async () => {
    const res = await canEditApi({ uuid: query.pipelineId })
    const { status, data, msg, success } = res || {}  // true 可以编辑，false为不可编辑
    // setCanEdit({ ...data, status })
    canEdit = { ...data, status }
    status && handleLockEdit()
    !status && props.history.push(setCompatiblePath(`/FlowLine/created/preview?pipelineId=${query.pipelineId}&tab=${tabIndex}`))
  }

  const handleLockEdit = async () => {
    const res = await lockEditApi({ uuid: query.pipelineId })
    const { status, data, msg, success } = res || {}
    canEdit = { ...data, status }
  }

  const releaseEdit = async () => {
    const res = await releaseCanEditApi({ uuid: query.pipelineId })
    canEdit = { ...canEdit, status: true }  // true 可以编辑，false为不可编辑
    const { success, } = res || {}
    return success
  }

  const beforeunload = (e: any) => {

    (currentUser.id === canEdit?.user_id) && releaseEdit()
    e.returnValue = null;
  }

  const unload = (event) => {
    // const q = getUrlParams()
    // delete q.source
    // replaceURL(q);
    console.log(321)
  }

  const vaildStep = (list) => {
    for (let i = 0; i < list.length; i++) {
      const stage = list[i]
      const stageErrorPosition = i + 1
      if (stage.vaildFormError) {
        throw new Error(`请输入正确填写配置 具体位置：${stageErrorPosition}`)
      }
      for (let j = 0; j < stage.jobs.length; j++) {
        const job = stage.jobs[j]
        const jobErrorPosition = `${stageErrorPosition}-${j + 1}`
        if (job.vaildFormError) {
          throw new Error(`请输入正确填写配置 具体位置：${jobErrorPosition}`)
        }
        for (let k = 0; k < job.tasks.length; k++) {
          const step = job.tasks[k]
          const taskErrorPosition = `${jobErrorPosition}-${k + 1}`
          if (step.vaildFormError) {
            throw new Error(`请输入正确填写配置 具体位置：${taskErrorPosition}`)
          }
        }
      }
    }
  }

  const replaceQeury = () => {
    const { origin, pathname } = window.location
    const { pipelineId } = query
    window.history.replaceState('', '', origin + pathname + `?pipelineId=${pipelineId}`)
  }

  const setSettingData = async (params) => {
    const { pipelineId } = query
    const oldIndex = pipeline.list.findIndex(item => item.id === pipelineId)
    const currentData = pipeline.list[oldIndex]
    const notification = await nofityRef.current.getFormValue()
    const { name, description, run_lock_type, trigger_type, schedule, repo_url, timer_info, label, pipeline_env, timeout, enabled, is_public, magic_comment, hook_url, include_branch, exclude_branch, env, file_path, repo_name, envComponentList, relationList, default_trigger_info, trigger_list, history_limit, isExpandAll } = await baseConfigRef.current.getFormValue()

    const settingData = {
      trigger_list,
      notification,
      file_path,
      pipeline_variable: env,
      trigger_type: rawDataRef.current?.setting?.trigger_type,
      schedule,
      timer_info: timer_info ? moment(timer_info).format('YYYY-MM-DD HH:mm:ss') : '',
      label,
      pipeline_env,
      timeout,
      repo_name,
      enabled,
      is_public,
      magic_comment,
      hook_url,
      description,
      include_branch,
      exclude_branch,
      default_trigger_info: default_trigger_info || [],
      extra_data: currentData.setting.extra_data || {},
      git_info: {
        repo_url
      },
      history_limit
    }
    if (envComponentList) {
      const pipelineId = getUrlParams().pipelineId
      settingData.extra_data = settingData.extra_data || {}
      if (!settingData.extra_data.envComponentList) {
        settingData.extra_data.envComponentList = {}
      }
      settingData.extra_data.envComponentList[pipelineId] = envComponentList
    }

    if (isExpandAll !== undefined) {
      settingData.extra_data.isExpandAll = isExpandAll
    }
    // 设置关系
    if (relationList) {
      settingData.extra_data.relationList = relationList
    }

    params.run_lock_type = run_lock_type
    params.name = name
    return settingData
  }

  const saveTrigger = async () => {
    const { trigger } = await baseConfigRef.current.getFormValue()
    const defaultValue = {
      exclude_branch: '',
      file_path: '',
      hook_from: '',
      hook_url: ''
    }
    await setTriggerListAPi(data.iid, {
      trigger_config_data: trigger.map(item => {
        delete item.active
        return { ...defaultValue, ...item }
      })
    })
  }

  // 保存
  const save = async () => {
    try {
      setSaveLoading(true)
      const { template } = data
      vaildStep(template)
      const { pipelineId, from } = query
      const oldIndex = pipeline.list.findIndex(item => item.id === pipelineId)

      const params: any = {
        stages: filterKey(template),
        project_id: 'test1'
      }
      params.setting = await setSettingData(params)
      // 新增进来 是创建记录   编辑进来 是添加记录
      // const api = from === 'add' ? editApi : updateApi
      // 触发接口
      // await saveTrigger()
      // // 保存
      // await api(pipelineId, params)
      // 去除from字段标识
      replaceQeury()
      pipeline.list[oldIndex] = { ...data, ...params }
      // 本地保存数据
      // dispatch(setPipeline({ list: pipeline.list }))
      dispatch({
        type: 'pipeline/setList',
        payload: { list: [...pipeline.list] }
      })
      message.success(`保存成功`);
      navigate(`/pipeline/created/preview?pipelineId=${pipelineId}&tab=${tabIndex}`)
    } catch (error) {
      console.log(error);
      if (error?.message) {
        message.error(error?.message)
      }
    } finally {
      setSaveLoading(false)
    }
  }

  const saveVariables = async () => {
    const { pipelineId } = query
    const oldIndex = pipeline.list.findIndex(item => item.id === pipelineId)

    const { env, default_trigger_info } = await baseConfigRef.current.getFormValue()

    data.setting.pipeline_variable = env
    data.setting.default_trigger_info = default_trigger_info



    pipeline.list[oldIndex] = { ...data }

    dispatch({
      type: 'pipeline/setList',
      payload: { list: [...pipeline.list] }
    })
  }

  const filterKey = (list: any) => {
    let newList = []
    list.forEach((stage: any, stageIndex: number) => {
      const { name, id, type, vaildFormError } = stage
      const nStage = {
        ...stage,
        name,
        jobs: [],
        type: 1,
        position: stageIndex,
      }
      delete nStage.id
      newList.push(nStage)
      stage.jobs.forEach((job: any, jobIndex: number) => {
        const { name, id, type, vaildFormError } = job
        const nJob = {
          ...job,
          name,
          tasks: [],
          type: 2,
          parallel_position: 0,
          position: jobIndex,
        }
        delete nJob.id
        nStage.jobs.push(nJob)
        job.tasks.forEach((step: any, stepIndex: number) => {
          const { name, id, type, atom_id, vaildFormError } = step
          delete step.id
          nJob.tasks.push({
            ...step,
            name,
            type: 3,
            position: stepIndex,
            atom_id
          })
        })
      })
    })
    return newList
  }

  // 取消
  const cancel = async () => {
    const { pipelineId, from } = query

    if (from === 'add') {
      props.history.goBack()
      return
    }
    
    navigate('/pipeline/created')
  }

  const switchTab = async (index: number) => {
    try {
      await saveVariables()
      setTabIndex(index)
    } catch (error) {

    }

  }

  const filterEnvForm = async () => {
    const data = await baseConfigRef?.current?.getFormValue()
    const variableList = handleVariableList(data.env)

    return variableList
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
        {/* 操作 */}
        <div className='flex-start content-tab-header-handle'>
          <Popover content="取消"><Button className='flex-center' onClick={cancel} icon={<CloseSquareOutlined className='flow-created-EditOutlined-icon' />}></Button></Popover>&nbsp;&nbsp;
          <Popover content="保存"><Button className='flex-center' type='primary' onClick={save} loading={saveLoading} icon={<SaveOutlined className='flow-created-EditOutlined-icon' />}></Button></Popover>
          {query.from !== 'add' && <RenderMoreButton data={data} {...props} from="add" />}

        </div>
      </div>
    )
  }

  const renderPipelineContent = () => {
    if (!data) {
      return <></>
    }
    // return <div className={`content-container common-content-container  ${tabIndex === 0 && 'content-container-show-action'}`} style={{ height }}>
    return <div className={`content-container common-content-container  ${tabIndex === 1 && 'content-container-show-action'}`} >
      <Flow data={data} type={1} setData={setData}  {...props} getEnvForm={filterEnvForm} />
    </div>
  }

  const renderToolButton = () => {
    if (tabIndex !== 1) {
      return <></>
    }
    return <RenderToolButton data={data} setData={setData} setTaskShow={setTaskShow} taskShow={taskShow} ref={renderToolButtonRef} />
  }

  const renderPipeline = () => {
    return (
      <div className={`pipeline-modify-content`}>
        {renderTab()}
        {/* 工具按钮 */}
        {renderToolButton()}
        {/* 流水线 */}
        {renderPipelineContent()}
        {/* 基本配置 */}
        {renderBaseConfig()}
        {/* 通知 */}
        {renderNotify()}
      </div>
    )
  }

  const renderNotify = () => {
    if (!settingValue) {
      return <></>
    }
    return <div className={`content-container common-content-container  ${tabIndex === 2 && 'content-container-show-action'}`}>
      <Notify ref={nofityRef} data={settingValue} setTabIndex={setTabIndex} {...props} type={1} defaultSwitchTabIndex={0} />
    </div>
  }

  const renderBaseConfig = () => {
    if (!settingValue) {
      return <></>
    }
    return <div id='flowline-modify-base-scroll-container' className={`content-container common-content-container  ${tabIndex === 0 && 'content-container-show-action'}`}>
      <BaseConfig ref={baseConfigRef} data={settingValue} setTabIndex={setTabIndex} {...props} type={1} defaultSwitchTabIndex={0} />
    </div>
  }

  const renderMap = () => {
    if (!data || tabIndex !== 1) {
      return <></>
    }
    return <MinMap data={data} type={1} />
  }

  const renderCancelModal = () => {
    return <CancelModal ref={cancelModalRef} />
  }

  return (
    <PageContainer>
      <div className='pipeline-container pipeline-modify-container replace-font-size-12' ref={variableRef}>
        {renderPipeline()}
        {renderMap()}
        {/* {renderCancelModal()} */}
      </div>
    </PageContainer>
  );
}

export default Project
import { CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined, LoadingOutlined, StopOutlined, PauseCircleOutlined, DownOutlined, MoreOutlined, UpOutlined, CopyOutlined } from '@ant-design/icons'
import moment from 'moment'
import { Tooltip, Dropdown, Space, Button, message } from 'antd'
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'

import './common.less'
import ExportCompnent from './component/detail/components/exportCompnent'
import ImportComponent from './component/detail/components/importComponent'
import { checkPipilineAuth } from '@/utils/menu'
import { copyText } from '@/utils'
import LoadingImage from '@/pages/pipeline/created/images/loading.svg'
import { handleCopyPipeline } from '@/pages/pipeline/created/data'


export const RenderLoadingIcon = (props) => {
  return <img src={LoadingImage} className='flow-created-common-loadingIcon' style={props?.style || {}} />

}

export const setCompatiblePath = (url) => {
  const path = location.pathname.split('/')
  const first = path[1]
  const urlPath = url.split('/')
  urlPath[1] = first
  const replaceUrl = urlPath.join('/')
  return replaceUrl
}

// export const renderStatus = (status) => {
//   switch (status) {
//     case 'pending':
//       return <MinusCircleOutlined className={`status-${status}`} />
//     case 'running':
//       return <LoadingOutlined className={`status-${status}`} />
//     case 'canceled':
//       return <StopOutlined className={`status-${status}`} />
//     case 'skipped':
//       return <i className='iconfont icon-tiaoguofenxiang' style={{ color: '#9BABB8', fontSize: '19px' }}></i>
//     case 'success':
//       return <CheckCircleOutlined className={`status-${status}`} />
//     case 'failed':
//     case 'timeout':
//       return <CloseCircleOutlined className={`status-${status}`} />
//   }
// }

const renderIcon = (status) => {
  switch (status) {
    case 'pending':
      return <PauseCircleOutlined style={{ color: '#63656e' }} />
    case 'running':
    case 'manual_confirm':
      // return <LoadingOutlined style={{ color: '#459fff' }} />
      return <RenderLoadingIcon style={{ width: '17px' }} />
    case 'canceled':
      return <StopOutlined style={{ color: '#f6b026' }} />
    case 'skipped':
      return <i className='iconfont icon-tiaoguofenxiang' style={{ color: '#9BABB8', fontSize: '19px' }}></i>
    case 'success':
    case 'pass':
      return <CheckCircleOutlined style={{ color: '#4dcb4f' }} />
    case 'failed':
    case 'timeout':
      return <CloseCircleOutlined style={{ color: '#e23f3c' }} />
  }
}

export const renderStatus = (status) => {
  // status = 'canceled'
  return <div style={{ fontSize: '16px' }}>
    {
      renderIcon(status)
    }
  </div>
}


export const renderTriggerIcon = (type, hook_type = '') => {
  switch (type) {
    case undefined:
    case '':
      return ''
    case 'MANUAL':
    case 'manual':
      return <i className='iconfont icon-shoudong'></i>
    case 'GITLAB_HOOK':
      return <img src="http://xnas.enflame.cn/dolphin/gitlab-logo-1.svg" style={{ width: '16px', display: 'inline-block' }} />
    case 'GERRIT_HOOK':
      return <img src="http://xnas.enflame.cn/dolphin/gerrit.png" style={{ width: '16px', display: 'inline-block' }} />
    case "SCHEDULED":
      return <i className='iconfont icon-naozhong' ></i>
    default:
      if (hook_type.includes('GITLAB') || hook_type.includes('gitlab')) {
        return <img src="http://xnas.enflame.cn/dolphin/gitlab-logo-1.svg" style={{ width: '16px', display: 'inline-block' }} />
      } else {
        return <img src="http://xnas.enflame.cn/dolphin/gerrit.png" style={{ width: '16px', display: 'inline-block' }} />
      }
  }
}


export const renderTriggerType = (type, hook_type = '') => {
  switch (type) {
    case undefined:
    case '':
      return ''
    case 'MANUAL':
    case 'manual':
      return '手动触发'
    case 'GITLAB_HOOK':
      return 'Gitlab Hook 触发'
    case 'GERRIT_HOOK':
      return 'Gerrit Hook 触发'
    case "SCHEDULED":
      return '定时触发'
    default:
      if (hook_type.includes('GITLAB') || hook_type.includes('gitlab')) {
        return 'Gitlab Hook 触发'
      } else {
        return 'Gerrit Hook 触发'
      }
  }
}

export const handleVariableList = (env) => {
  const list = []
  env.forEach(item => {
    if (!item.prompt_on_trigger) {
      return
    }
    const newData = {
      key: item.name,
      value: item.default,
      type: item.type,
      scope: 'pipeline',
      description: item.description
    }
    switch (item.type) {
      case 'repo':
        const repo = item.repo
        const repoList = env.filter(i => i.type === 'repo')
        const index = repoList.findIndex(r => r.id === item.id)
        const currentIndex = repoList.length - index
        list.push(
          { key: 'repo_name' + `（仓库${currentIndex}）`, name: '全局', scope: 'pipeline', description: repo[0]['git_url-description'] || '', type: 'repo', value: repo[0]['repo-name'] },
          { key: 'repo_url' + `（仓库${currentIndex}）`, name: '全局', scope: 'pipeline', description: repo[0]['git_url-description'] || '', type: 'repo', value: repo[0]['repo-url'] }
        )
        if (repo[1]['patchset']) {
          list.push(
            { key: 'patchset' + `（仓库${currentIndex}）`, name: '全局', scope: 'pipeline', description: repo[1]['ref-description'] || '', type: 'repo', value: repo[1]['patchset'] },
          )
        }
        if (repo[1]['ref']) {
          list.push(
            { key: 'branch' + `（仓库${currentIndex}）`, name: '全局', scope: 'pipeline', description: repo[1]['ref-description'] || '', type: 'repo', value: repo[1]['ref'] },
          )
        }
        // if (repo[2]['sha']) {
        list.push(
          { key: 'commit' + `（仓库${currentIndex}）`, name: '全局', scope: 'pipeline', description: repo[2]['sha-description'] || '', type: 'repo', value: repo[2]['sha'] || '' },
        )
        // }
        break
      case 'component':
        break
      case 'date':
        newData.value = moment(newData.value).format('YYYY-MM-DD HH:mm:ss')
        list.push(newData)
        break
      default:
        list.push(newData)
    }
  })

  return list
}



export const handleOtherValue = (list) => {
  return list.map(itemData => {
    const item = { ...itemData }
    if (item.display_name) {
      item.key = `${item.display_name}（${item.key}）`
    }
    return item
  })
}

export const handleRepoValue = (repo) => {
  if (repo.length <= 0) {
    return []
  }
  const repoList = repo[0].repo_info
  const list = []
  if (!repoList) {
    return []
  }
  repoList.forEach((item) => {
    const currentList = []
    currentList.push(
      // { key: 'repo_type', value: item.platform },
      { key: 'repo_name', value: item.base_info.name, displayName: item.base_info.display_name },
      // { key: 'repo_id', value: item.base_info.repo_id },
      { key: 'repo_url', value: item.base_info.repo_url, displayName: item.base_info.display_name },
      // { key: 'repo_key', value: item.base_info.key },
    )
    const type = item.branch_patchset.type
    switch (type) {
      case 'branch':
        currentList.push(
          // { key: 'branch_key', value: item.branch_patchset.key },
          { key: 'branch', value: item.branch_patchset.ref, displayName: item.branch_patchset.display_name },
          // { key: 'commit_key', value: item.commit.key },
          { key: 'commit', value: item.commit.sha, displayName: item.commit.display_name },
        )
        break
      case 'patchset':
        currentList.push(
          // { key: 'patchset_key', value: item.branch_patchset.key },
          { key: 'patchset', value: item.branch_patchset.patchset, displayName: item.branch_patchset.display_name },
        )
        break
      case 'tag':
        currentList.push(
          { key: 'tag', value: item.branch_patchset.tag, displayName: item.branch_patchset.display_name },
        )
        break
    }

    list.push(...currentList.map(k => {
      k.key = `仓库${item.index}${k.displayName ? `-${k.displayName}` : ''}（${k.key}）`
      return k
    }))
  })

  return list
}


export const renderVariablesValue = (item) => {
  const value = item.value
  if (typeof value === 'boolean') {
    return String(value)
  }
  return value || '-'
}

export const RenderVariableList = (props) => {
  const { variables, varRef, variableMore, varableListArrowRef, setVariableMore } = props
  // const variables = runData?.trigger_info?.variables || []
  if (variables.length <= 0) {
    return <></>
  }
  const filterParameters = ['isBranch']
  const otherList = variables.filter(item => !filterParameters.includes(item.key) && !item.repo_info)
  const other = handleOtherValue([...otherList])
  const repoValue = handleRepoValue(variables.filter(item => !filterParameters.includes(item.key) && item.repo_info))
  const list = [...other, ...repoValue].filter(item => item.key)

  return <div className='pipeline-detail-varable-list flex-start' >
    <div className='varable-list-title'>触发参数</div>
    <ul className='list-varables common-reset' ref={varRef} style={{ height: variableMore ? 'auto' : '18px' }}>
      {
        list.map(item => (
          <li className='list-varables-item'>
            <Tooltip overlayClassName="pipeline-detail-varables-item-tooltip" placement="topLeft" title={`${item.key}：${String(item.value) || '-'}`} >
              <span style={{ color: '#7F7F7F', fontWeight: 'bold' }}>{item.key}：</span>
              {renderVariablesValue(item)}
            </Tooltip>
          </li>
        ))
      }
    </ul>
    <div ref={varableListArrowRef} style={{ position: 'relative' }}>
      <div onClick={() => setVariableMore(!variableMore)} className={`varable-list-arrow flex-center ${variableMore && 'varable-list-arrow-active'}`}><DownOutlined /></div>
    </div>
  </div>
}

export const RenderMoreButton = (props) => {
  const { data, uuid, from, isAuth } = props

  const [items, setItems] = useState([
    {
      label: '导入更新',
      key: '2',
    },
  ])

  useEffect(() => {
    const path = location.pathname
    if (!path.includes('/created/modify')) {
      items.unshift({
        label: '导出配置',
        key: '1',
      })
      setItems([...items])
    }
  }, [])

  const exportRef = useRef(null)
  const importRef = useRef(null)

  const onClick = (data) => {
    switch (data.key) {
      case '1':
        exportRef.current.open(data)
        break
      case '2':
        if (!checkPipilineAuth('Import')) {
          message.error('暂无权限')
          return
        }
        importRef.current.open(data)
        break
    }
  }
  return <>
    {
      from === 'add' || checkPipilineAuth('More', uuid)
        ?
        <>
          {
            isAuth === false
              ?
              <Button style={{ width: '20px', padding: 0, marginLeft: '7px' }} disabled><MoreOutlined /></Button>
              :
              <Dropdown menu={{ items, onClick: handleCopyPipeline }}>
                <Button disabled style={{ width: '20px', padding: 0, marginLeft: '7px' }} onClick={e => e.preventDefault()}><MoreOutlined /></Button>
              </Dropdown>
          }
        </>
        :
        <Button style={{ width: '20px', padding: 0, marginLeft: '7px' }} disabled><MoreOutlined /></Button>
    }

    <ExportCompnent ref={exportRef} />
    <ImportComponent ref={importRef} {...props} />
  </>

}

export const commonHandleTriggerType = (type = '') => {
  if (type.includes('HOOK') || type.includes('hook')) {
    return '触发方式为 Hook ，无法手动触发'
  }
  return ''
}

const RenderToolButtonComponent = (props, ref) => {
  const { taskShow, setTaskShow, data, setData } = props

  useImperativeHandle(ref, () => ({
    setExpandTask
  }))

  const setExpandTask = (data, status) => {
    if (status === undefined) {
      status = true
    }
    status = !status

    data.stages.forEach((stage, stageIndex) => {
      stage.jobs.forEach((job, jobIndex) => {
        job.taskShow = status
        data.stages[stageIndex].jobs[jobIndex].taskShow = status
      })
    })
    setTaskShow(status)
    // setData({ ...data })
  }

  const expandTask = () => {
    data.stages.forEach((stage, stageIndex) => {
      stage.jobs.forEach((job, jobIndex) => {
        job.taskShow = !taskShow
        job.isManualExpand = true
        data.stages[stageIndex].jobs[jobIndex].taskShow = !taskShow
      })
    })
    setTaskShow(!taskShow)
    setData({ ...data })
  }

  return <div className='content-tool-box common-flow-Buttoncontent-tool-box flex-start' >
    <div className='flex-start box' onClick={expandTask}>
      {!taskShow ? '全部收起' : '全部展开'}
      <div className={`common-animation-arrow ${taskShow && 'common-animation-arrow-active'}`} style={{ marginLeft: '3px' }} >
        <UpOutlined />
      </div>
    </div>
  </div>
}

export const RenderToolButton = forwardRef(RenderToolButtonComponent)

export const renderTaskStatsIcon = (status) => {
  switch (status) {
    case 'success':
      return <i className='iconfont icon-success-fill step-item-icon-success animation-icon-success' style={{ color: '#34d97b' }}></i>
    case 'skipped':
      return <i className='iconfont icon-tiaoguofenxiang step-item-icon-faild animation-icon-success' style={{ color: '#9BABB8' }}></i>
    case 'failed':
    case 'timeout':
      return <i className='iconfont icon-error-fill step-item-icon-faild' style={{ color: '#ff5656' }}></i>
    case 'canceled':
      return <StopOutlined style={{ marginTop: '3px', color: '#f8b300', fontSize: '15px' }} />
  }
  return <>

  </>
}

export const renderCopy = (text) => {
  return <CopyOutlined onClick={() => copyText(text)} />
}

import { Popover, Tooltip } from 'antd'
import Gerrit from '@/assets/images/gerrit-icon.png'
import TagIcon from '@/assets/images/tag-icon.png'
import { DownOutlined, SearchOutlined, ReloadOutlined, BranchesOutlined, CopyOutlined, LoadingOutlined, StopOutlined, CheckCircleOutlined, CloseCircleOutlined, OrderedListOutlined } from '@ant-design/icons'
import CommitImage from '@/assets/images/git-commit.png'
import { getUrlParams, formatBytes, formatTime, copyText, judgeLink } from '@/utils'
import './commomStyle.less'

export const handleName = (value = '', end = 7) => {
  value = value || ''
  return <div >
    {
      value.length > end ? <Tooltip overlayClassName='packagingService-antd-Tooltip-container' title={<div style={{ whiteSpace: 'pre-wrap', padding: '6px 8px' }} onClick={e => e.stopPropagation()}>{value}</div>}>
        <div style={{ cursor: 'pointer' }}>{value.slice(0, end) + '...'}</div>
      </Tooltip> : value
    }
  </div >
}

const renderPatchsets = (record) => {
  return <>
    {record.patchsets?.map(item => (
      <div className={`flex-start`}>
        <img src={Gerrit} style={{ width: '14px' }} />&nbsp;
        <span className={`${judgeLink(item?.url) && 'common-Jumpable-color'}`} onClick={() => openTab(item?.url)}>{item.patchset}</span>&nbsp;&nbsp;
        <CopyOutlined className='copy' style={{ float: 'right' }} onClick={(e) => {
          e.stopPropagation()
          copyText(item?.patchset || '')
        }} />
      </div>
    ))}
  </>
}

const renderContent = (record) => {
  if (typeof record.patchset === 'string' && record.patchset) {
    return renderPatchsets({
      patchsets: [{
        patchset: record.patchset,
        url: record.http_url
      }]
    })
  }

  if (record?.patchsets?.length > 0) {
    if (record?.patchsets?.length === 1) return renderPatchsets(record)
    return <Popover placement="top" title={''} content={renderPatchsets(record)}>
      <img src={Gerrit} style={{ width: '14px' }} />&nbsp;{record?.patchsets?.[0]?.patchset} ...
    </Popover>
  }

  if (record.tag) {
    return <div className='flex-start'>
      <img src={TagIcon} style={{ width: '14px' }} />&nbsp;{record.tag}&nbsp;<CopyOutlined className='copy' style={{ color: '#707070' }} onClick={(e) => {
        e.stopPropagation()
        copyText(record.tag)
      }} />
    </div>
  }
  if (!record.after_sha && record.branch) {
    return <><BranchesOutlined style={{ color: '#707070', fontSize: '13px' }} />&nbsp; {handleName(record.branch, 20)}</>
  }
  return <div className='flex-start'>
    {
      record.branch && <><BranchesOutlined style={{ color: '#707070', fontSize: '13px' }} />&nbsp; {handleName(record.branch)}</>
    }
    {
      record.after_sha && <>&nbsp;|&nbsp;<img src={CommitImage} style={{ width: '20px' }} />&nbsp; {handleName(record.after_sha, 4)} &nbsp;<CopyOutlined className='copy' style={{ color: '#707070' }} onClick={(e) => {
        e.stopPropagation()
        copyText(record.after_sha)
      }} /></>
    }
  </div>
}

const openTab = (url) => {
  if (url) {
    window.open(url)
  }
}

export const renderColumnBranch = (record) => {
  return <div className={`flex-start ${record.http_url && 'common-Jumpable-color'}`} onClick={() => openTab(record.http_url)}>
    {
      renderContent(record)
    }
  </div>
}

export const renderIcon = (status) => {
  switch (status) {
    case 'pending':
    case 'running':
      return <LoadingOutlined style={{ color: 'rgba(64, 158, 255, 1)', fontSize: '14px' }} />
    // return <div className='running flex-center'>
    //   <SyncOutlined />
    // </div>
    case 'canceled':
      return <StopOutlined style={{ color: '#f6b026', fontSize: '14px' }} />
    case 'success':
      return <CheckCircleOutlined style={{ color: '#4dcb4f', fontSize: '14px' }} />
    case 'failed':
      return <CloseCircleOutlined style={{ color: '#e23f3c', fontSize: '14px' }} />
  }
}



export const renderStatusText = (status) => {
  switch (status) {
    case 'pending':
    case 'running':
      return '编译中'
    case 'canceled':
      return '编译取消'
    case 'success':
      return '编译成功'
    case 'failed':
      return '编译失败'
    default:
      return []
  }
}


export const getPipelineUuid = () => {
  const host = location.host
  let uuid = 'p-66626b6764c443ccae120bb2b841d0ea'
  if (host.includes('dolphin.enflame.cn')) {
    uuid = 'p-8f982dd63f5d4f478575604a33d4f5db'
  }
  return uuid
}

export const renderTriggerIcon = (type) => {
  switch (type) {
    case 'gerrit':
      return <img src="http://xnas.enflame.cn/dolphin/gerrit.png" style={{ width: '16px', display: 'inline-block' }} />
    default:
      return <img src="http://xnas.enflame.cn/dolphin/gitlab-logo-1.svg" style={{ width: '16px', display: 'inline-block' }} />
  }
}

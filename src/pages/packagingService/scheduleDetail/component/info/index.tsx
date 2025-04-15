import React, { useState, useImperativeHandle, forwardRef, useRef, } from 'react'
import { renderColumnBranch, renderTriggerIcon, getPipelineUuid, } from '@/pages/packagingService/commonComponent'
import { CopyOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Popover, Tag } from 'antd'

const page = (props: any, ref: any) => {
  const { row, progressInfo, handleDownload = () => { }, copyText = () => { }, query = {}, getProgress = () => { } } = props || {}

  useImperativeHandle(ref, () => ({
  }))

  const renderRepoName = () => {
    return <div className='flex-start'>
      {progressInfo.repo_name && renderTriggerIcon(progressInfo.http_url?.includes('gerrit') ? 'gerrit' : '')}&nbsp;
      <div style={{ textAlign: 'left' }}>
        <div >{progressInfo.repo_name || '-'}</div>
      </div>
    </div>
  }

  const renderBuildName = (v) => {
    if (v === '-') {
      return v
    }
    const list = v.split(',')
    return <>
      {
        list.map(tag => (
          <Tag>{tag}</Tag>
        ))
      }
      <Popover content="立即下载">
        <Button icon={<DownloadOutlined />} size='small' onClick={() => handleDownload(progressInfo)}></Button>
      </Popover>
    </>
  }

  const renderFieldText = () => {
    return <div className='packagingService-firstData-firld-text'>
      <table className='packagingService-firstData-firld'>
        {
          row?.map((col, index) => (
            <>
              {
                col.map((field, index) => {
                  let { name, value, isCopy, isSelf } = field
                  let v = progressInfo[value] || '-'
                  if (value === 'artifact_names') {
                    v = v === '-' ? [] : v
                    v = v.join(',') || '-'
                  }
                  if (!isSelf) {
                    v = value || '-'
                  }
                  if (name === '包类型') {
                    if (Array.isArray(v)) {
                      v = v.join(',')
                    }
                  }
                  if (name === '分支/Patchset/Tag') {
                    v = renderColumnBranch(progressInfo)
                  }
                  if (name === '代码仓') {
                    v = renderRepoName()
                  }
                  if (name === '包名称') {
                    v = renderBuildName(v)
                  }
                  return <tr key={index} className='firstData-firld-container'>
                    <td className='name' align='right'>{name}：</td>
                    <td className='value'>
                      {v}
                      {/* 复制按钮 */}
                      {
                        isCopy && (v && v !== '-') && <CopyOutlined className='copy' onClick={() => copyText(v)} />
                      }
                    </td>
                  </tr>
                })
              }
            </>
          ))
        }
      </table>
    </div>
  }

  return <>
    {renderFieldText()}
  </>;
}

export default forwardRef(page)
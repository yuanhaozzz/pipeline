import React, { useEffect } from 'react';

import './style.less'
import { send } from './service'

import { PageContainer } from '@ant-design/pro-layout';
import { Radio, Form } from 'antd'

function Project(props) {

  const { relationList, env, envAllList, form, renderChooseConfig, renderUploadComponent, renderDate, renderType, renderRepoComponent, renderRefComponent, renderCommitIdComponent, renderFileContent, renderUserList } = props

  const renderItemRadio = (id) => {
    const currentItem = envAllList.find(v => v.id === id)
    const name = currentItem?.name
    const displayName = currentItem?.display_name
    if (name === undefined) {
      return <></>
    }
    return <Radio value={id} >{displayName || name}</Radio>
  }

  const renderRelationList = (relationItem) => {
    const envList = env.filter(item => {
      return relationItem.options.find(id => id.includes(item.id))
    })

    return <div style={{ marginTop: '8px' }}>
      <div>
        <Form.Item name={relationItem.value} label="" initialValue={relationItem.value} noStyle>
          <Radio.Group >
            {
              relationItem.options.map(id => (
                renderItemRadio(id)
              ))
            }
          </Radio.Group>
        </Form.Item>
      </div>
      <div className='preview-relation-value-component-item'>
        <Form.Item noStyle shouldUpdate>
          {
            () => {
              const id = form.getFieldValue(relationItem.value)
              const component = envList.find(item => id.includes(item.id))
              if (!component) {
                return <></>
              }

              switch (component.type) {
                case 'repo':
                  const repoList = env.filter((item: any) => item.type === 'repo').reverse()
                  const index = repoList.findIndex(v => v.id === component.id)
                  const repoData = component.repo[0]
                  const refData = component.repo[1]
                  const shaData = component.repo[2]
                  const isShowRepo = relationList.find(item => item.options.find(id => id.includes(repoData.newId)))
                  const isShowRef = relationList.find(item => item.options.find(id => id.includes(refData.newId)))
                  const isShowCommitId = relationList.find(item => item.options.find(id => id.includes(shaData.newId)))
                  if (isShowRepo) {
                    return renderRepoComponent(component, index + 1)
                  }
                  if (isShowRef) {
                    return renderRefComponent(component, index + 1)
                  }
                  if (isShowCommitId) {
                    component.repo[2]['sha-show'] = true
                    return renderCommitIdComponent(component, index + 1)
                  }
                case 'choose':
                  return renderChooseConfig(false, component, 'relation')
                case 'multiple':
                  return renderChooseConfig(true, component, 'relation')
                case 'upload':
                  return renderUploadComponent(component, 'relation')
                case 'fileContent':
                  return renderFileContent(component, 'relation')
                case 'date':
                  return renderDate([component], 'relation')
                case 'string':
                  return renderType([component], 'relation')
                case 'bool':
                  return renderType([component], 'relation')
                case 'user':
                  return renderUserList([component], 'relation')
              }
            }
          }
        </Form.Item>
      </div>
    </div>
  }

  return (
    <>
      {
        relationList.map(item => (
          renderRelationList(item)
        ))
      }
    </>
  );
}

export default Project
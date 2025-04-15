import React, { useEffect, useState, useMemo, useRef, useImperativeHandle, forwardRef } from 'react';
import { ReloadOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons'
import { Input, Tabs } from 'antd'
import { createPortal } from 'react-dom'
import { useDebounce } from '@/utils'

import List from './component/list'
import './style.less'
import { getListApi } from './service'

function Project(props: any, ref: any) {
  const { config, update, modifyField, setConfig } = props
  const [data, setData] = useState({
    atom_info: [],
    atom_type: []
  })
  const [atomType, setAtomType] = useState([])
  const [activeKey, setActiveKey] = useState(0)
  const [search, setSeach] = useState('')

  const variableRef = useRef<any>(null)
  const refreshRef = useRef<any>(null)

  useEffect(() => {
    if (variableRef.current.isLoad) {
      saveContent(search)
    }
    variableRef.current.isLoad = true
  }, [search])

  useImperativeHandle(ref, () => ({
    show,
    hide
  }))

  const show = () => {
    variableRef.current.style.right = '660px'
  }

  const hide = (key, value) => {
    variableRef.current.style.right = '0px'
    update()
  }

  useEffect(() => {
    variableRef.current.dataMap = {}
    getData()
  }, [])

  const getData = async (type: string = '', name: string = '', refesh?: 'string') => {
    try {
      const params = {
        name,
        type,
        size: 100,
        page_num: 1
      }
      let data = variableRef.current.dataMap[type]
      if (data === undefined || (refesh as any) === 'update') {
        const res = await getListApi(params)
        data = res.data
        variableRef.current.dataMap[type] = data
      }
      setData({ ...data })
      setAtomType(data.atom_type)
    } catch (error) {

    } finally {

    }
  }

  const saveContent = useDebounce(async (value: any) => {
    try {
      getData('all', value, 'update')
    } catch (error) {
      // clearTimeout(variableRef.current.saveTimer)
    }
  }, 100)

  const onKeyDown = (e: any) => {
    const { keyCode, target } = e
    if (keyCode === 13) {
      setActiveKey(0)
      getData('all', target.value, 'update')
    }
  }

  const switchTab = (index: number, type: string) => {
    setActiveKey(index)
    getData(type)
  }

  const refresh = () => {
    refreshRef.current.style.transform = 'rotate(360deg)'
    refreshRef.current.style.transition = 'all 0.6s'
    getData(atomType[activeKey].type, '', 'update')
    setTimeout(() => {
      refreshRef.current.style.transition = 'none'
      refreshRef.current.style.transform = 'rotate(0deg)'
    }, 300);
  }


  const renderHeader = () => {
    return <div className='plugins-header flex-space-between'>
      <div className='flex-start'>
        请选择一个插件&nbsp;&nbsp;
        <div onClick={() => refresh()} className='plugins-header-refresh' ref={refreshRef}>
          <ReloadOutlined style={{ color: '#3c96ff', cursor: 'pointer' }} />
        </div>
      </div>
      <Input style={{ width: '220px' }} placeholder='输入后回车搜索' suffix={
        <SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
      } onKeyDown={onKeyDown} value={search} onChange={(e) => setSeach(e.target.value)} />
    </div>
  }

  const renderContent = () => {
    return <div className='plugins-content'>
      {/* <Tabs
        onChange={onChange}
        activeKey={activeKey}
        items={atomType.map((item: any, index: number) => {
          item.key = index + ''
          item.label = item.name
          item.children = <List list={data.atom_info || []} />
          return item
        })}
      /> */}
      {
        search ? <></> : <nav className='plugins-content-nav flex-start'>
          {
            atomType.map((item: any, index: number) => (
              <div className={`nav-item flex-center ${index === activeKey && 'nav-item-action'}`} onClick={() => switchTab(index, item.type)}>
                {item.name}
                <div className='nav-item-line' style={{ opacity: index === activeKey ? 1 : 0 }}></div>
              </div>
            ))
          }
        </nav>
      }

      <List list={data.atom_info || []} config={config} hide={hide} modifyField={modifyField} setConfig={setConfig} />
    </div>
  }

  return <div className='flow-plugins-container common-reset-style' ref={variableRef} onClick={(e: Event) => e.stopPropagation()}>
    {/* 顶部 */}
    {renderHeader()}
    {/* tab bug 因为编剧导致重影*/}
    {renderContent()}
    {/* 箭头 */}
    <div className='flow-plugins-arrow'></div>
    {/* 关闭 */}
    <div className='plugins-close flex-center' onClick={() => hide()}>
      <CloseOutlined />
    </div>
  </div>
}

// export default forwardRef(createPortal(Project, document.querySelector('.config-detail-container')))
export default forwardRef(Project)
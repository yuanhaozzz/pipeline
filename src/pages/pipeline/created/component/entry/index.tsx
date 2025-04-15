import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';

import { Tooltip, Button, message, Modal } from 'antd'
import { AppstoreOutlined, SettingOutlined, MinusCircleOutlined, createFromIconfontCN, ExclamationCircleOutlined } from '@ant-design/icons'

import './style.less'
import { checkPipilineAuth } from '@/utils/menu'
const { confirm } = Modal;
const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_4376956_qfktbjo68p.js',
})

function Project(props, ref) {
  const { list, jumpToRecord, removeEntry, sortEntry } = props

  // 控制更多弹窗显示隐藏
  const [displayMore, setDisplayMore] = useState(false)
  // 控制是否显示更多
  const [displayMoreButton, setDisplayMoreButton] = useState(false)
  // 是否编辑
  const [isEdit, setEdit] = useState(false)
  // 是否在删除状态
  const [isDelete, setDeleteStatus] = useState(false)

  const listContainerRef = useRef(null)
  const homeItemRef = useRef(null)
  const recordButtonRef = useRef(null)
  const draggableRef = useRef<any>({})
  const variableRef = useRef<any>({})

  useImperativeHandle(ref, () => ({
    handleMore,
    setDelete
  }))

  useEffect(() => {
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    handleElHeight()
  }, [listContainerRef, list])

  useEffect(() => {
    setDisplayMore(isEdit)
  }, [isEdit])

  useEffect(() => {
    if (!displayMore) {
      setEdit(displayMore)
    }
  }, [displayMore])

  const resize = () => {
    handleElHeight()
  }

  const setDelete = () => {
    setDeleteStatus(false)
  }

  const handleElHeight = () => {
    // 判断是否超过1行
    let element = listContainerRef.current
    // 获取元素的实际高度
    if (listContainerRef.current) {
      let elementHeight = element.scrollHeight;
      // 95为一行的高度，更多按钮是否展示
      if ((elementHeight - 20) > 95) {
        setDisplayMoreButton(true)
      } else {
        setDisplayMoreButton(false)
      }
      if (homeItemRef.current) {
        const gridContainer = homeItemRef.current
        const gridItems = Array.from(gridContainer.children);
        if (gridItems.length >= 3) {
          // 获取第一个网格项的位置信息
          const firstItemRect = gridItems[1].getBoundingClientRect();
          // 获取第二个网格项的位置信息
          const secondItemRect = gridItems[2].getBoundingClientRect();
          // 计算间距
          const spacing = secondItemRect.left - (firstItemRect.left + firstItemRect.width) + 20
          // 设置button间距
          recordButtonRef.current.style.right = (spacing / 2 + 20 + 5) + 'px'

          // 输出间距
          // gridContainer.style.paddingRight = (117 + spacing) + 'px'
          if ((elementHeight - 20) > 95) {
            gridContainer.style.paddingRight = (127 + spacing) + 'px'
          } else {
            gridContainer.style.paddingRight = 20 + 'px'
          }
        }
      }
    }
  }

  const handleMore = (status) => {
    setDisplayMore(status)
  }


  // if (list.length <= 0) {
  //   return <></>
  // }

  const handleEdit = (e) => {
    e.stopPropagation()
    // if (isDelete) {
    //   message.warn('保存中，请稍等...')
    //   return
    // }
    setEdit(!isEdit)
  }

  const jump = (e, item) => {
    e.stopPropagation()
    if (!checkPipilineAuth('Detail', item.uuid)) {
      message.error('暂无权限')
      return
    }
    if (isEdit) {
      message.warn('您正在编辑中，无法跳转')
      return
    }
    jumpToRecord(item)
  }

  const onDragEnter = (e) => {
    e.stopPropagation()
    e.preventDefault();
    const { isMove, stepDragElement, stepDragStartX } = draggableRef.current
    const { clientX } = e
    if (!isMove) {
      return
    }
    const target = e.target.closest('.draggable-item');
    // 元素存在 & id存在 & 不是自己
    if (target && target.dataset.id && target.dataset.id !== stepDragElement.dataset.id) {
      // 找到共同父节点
      let container = target.closest('.record-list');
      // 判断向左还是向右移动 插入
      if (stepDragStartX > clientX) {
        container.insertBefore(stepDragElement, target);
      } else {
        container.insertBefore(stepDragElement, target.nextElementSibling);
      }
      draggableRef.current.stepDragStartX = clientX
    }
  }

  const onDragEnd = (e) => {
    e.stopPropagation()
    // 取消移动状态
    const target = e.target
    target.style.opacity = '1'
    // 设置移动状态
    draggableRef.current.isMove = false
    const dragElement = draggableRef.current.stepDragElement
    const children = dragElement.closest('.record-list').children
    const data = Array.from(children).filter(el => el.dataset.id).map((el: any, index) => {
      return {
        id: el.dataset.id,
        sort: index + 1
      }
    })

    setDeleteStatus(true)
    sortEntry(data)
  }

  const onDragStart = (e) => {
    e.stopPropagation()
    // 设置移动状态
    const target: any = e.target
    target.style.opacity = '.3'
    // 设置移动状态
    draggableRef.current.isMove = true
    // 当前拖拽元素
    draggableRef.current.stepDragElement = target.closest('.draggable-item')
    // 设置点击时X坐标，方便拖拽时判断插入
    draggableRef.current.stepDragStartX = e.clientX
  }

  const handleRemove = async (e, item) => {
    e.stopPropagation()
    if (isDelete) {
      return
    }
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: <p>仅从快捷入口内移除，可在流水线列表再次添加到快捷入口。</p>,
      title: '移除',
      async onOk() {
        try {
          setDeleteStatus(true)
          await removeEntry(item)
        } catch (error) {
        }
      }
    });
  }

  const renderEntryItem = (item, type?) => {
    return <li
      key={item.id}
      onClick={(e) => jump(e, item)}
      className={`${type === 'hover' && 'flow-create-entry-draggable'} draggable-item ${isDelete && 'item-loading'} ${item.is_fixed && 'item-fixed'}`}
      style={{ cursor: isEdit ? item.is_fixed ? 'default' : 'move' : 'pointer', userSelect: isEdit ? 'none' : 'auto' }}
      draggable={isEdit && !item.is_fixed && !isDelete}
      data-id={item.is_fixed ? '' : item.id}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      {/* <img className='image' src={item.logo_url} /> */}
      <Tooltip title={() => <span dangerouslySetInnerHTML={{ __html: !isEdit ? item.description : '' }}></span>} placement="bottom">
        <div className={`background flex-center`} style={{ background: item.logo ? `url(${item.logo}) no-repeat center` : '#1890ff', backgroundSize: '100%', borderRadius: item.logo ? '0' : '100px' }} >
          {item.logo ? '' : item.name.slice(0, 3)}
          {/* 删除按钮 */}
          {
            isEdit && !item.is_fixed && <div className='background-reduce flex-center' onClick={(e) => handleRemove(e, item)}>
              {/* <IconFont type="icon-reduce-btn-fill" /> */}
              <img src='http://10.12.110.200:8080/dolphin/weekly_report/1705025029.304327_reduce-btn-fill.png' style={{ width: '15px' }} />
            </div>
          }
          {/* 管理员头像 */}
          {
            item.is_fixed && <img className='background-avatar' src='http://10.12.110.200:8080/dolphin/weekly_report/1705037992.193204_4adc6407ebce50e7489b1f841c8ef10.png' />
          }

        </div>
      </Tooltip>
      <Tooltip title={!isEdit ? item.name : ''} placement="bottom">
        <div className='text' onMouseOver={(e) => e.stopPropagation()} onMouseEnter={(e) => e.stopPropagation()}>{item.name}</div>
      </Tooltip>
    </li >
  }

  const renderTitle = () => {
    return <div className='record-title flex-space-between'>
      <div>
        <span className='title'>快捷入口</span>
        <div className='description'>可将列表内流水线拖动到快捷入口内，最多添加10个流水线</div>
      </div>
      <div className='record-title-right' onClick={handleEdit} style={{ opacity: isDelete ? '0.3' : 1 }}>
        <SettingOutlined />&nbsp;
        {
          isEdit ? '取消编辑' : '编辑'
        }

      </div>
    </div>
  }

  const renderHomeList = () => {
    // style={{ paddingRight: displayMoreButton ? '117px' : 0 }}
    return <div className='card-home-record-container'  >
      <ul className={`record-list`} ref={homeItemRef}>
        {
          list.map(item => (
            renderEntryItem(item, 'home')
          ))
        }
      </ul>
      <div style={{ display: displayMoreButton ? 'block' : 'none' }}>
        <div className='record-button flex-center' ref={recordButtonRef} onClick={(e) => {
          e.stopPropagation()
          handleMore(true)
        }}>
          <div className='background flex-center'></div>
          <div className='description'>更多</div>
        </div>
      </div>
    </div >
  }

  const renderHoverList = () => {
    return <div className='card-hover-record-container' style={{ display: displayMore ? 'block' : 'none' }}>
      <div style={{ background: '#fff' }} onClick={(e) => e.stopPropagation()}>
        <ul className='record-list' >
          {
            list.map(item => (
              renderEntryItem(item, 'hover')
            ))
          }
        </ul>
      </div>
    </div>
  }

  const renderComputeList = () => {
    return <div className='card-compute-record-container' ref={listContainerRef}>
      <ul className='record-list'>
        {
          list.map(item => (
            renderEntryItem(item, 'compute')
          ))
        }
      </ul>
    </div>
  }

  return (
    <div className='flow-pipeline-card-container'>
      {/* 标题 */}
      {renderTitle()}
      <div style={{ position: 'relative' }}>
        {/* 首页展示 */}
        {renderHomeList()}
        {/* 悬浮展示 */}
        {renderHoverList()}
        {/* 计算展示 */}
        {renderComputeList()}
      </div>
    </div>
  );
}

export default forwardRef(Project)
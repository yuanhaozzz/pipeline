import React, { useEffect, useRef, useState } from 'react';

import './style.less'
import { getDataApi } from './service'

import { Button, Form, Input, Select, DatePicker, Spin, message } from 'antd';
import moment from 'moment'
import { selectOptions, colorMap } from './data'
import { useParams } from 'react-router-dom';

import timeImage from './time.png'
import { getUrlParams } from '@/utils'
import FindRid from './component/findRid'
import { getListApi } from './component/findRid/service'

const { RangePicker } = DatePicker;

function Project() {

  const [form] = Form.useForm();

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const { pipelineId: pipelineIdUrl } = getUrlParams()

  const [findList, setFindList] = useState([])

  const findRef = useRef()

  let { pipelineId, runIid } = useParams() || {}
  if (!pipelineId) {
    pipelineId = pipelineIdUrl
  }

  useEffect(() => {
    init()
  }, [])

  const init = async () => {

    try {
      setLoading(true)
      await getVersionList()
      await getData()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getVersionList = async () => {
    let { data } = await getListApi({}, pipelineId)
    data = data.map(item => {
      item.created_at = moment(item.created_at).format('YYYY-MM-DD HH:mm')
      return item
    })
    const first = data[0]
    if (first) {
      form.setFieldValue('current_id', first.run_info_id)
    }
    setFindList(data)
  }


  const getData = async (value?) => {
    // if (pipelineId !== 'p-36f6619c139c4a09904b62a0bbe470de' && pipelineId !== 'p-28359d1735234acaa011200b9a5f811f') {
    //   return <></>
    // }

    const { current_id, compare_id } = await form.validateFields()
    const params = {
      current_id,
      compare_id
    }
    const { data } = await getDataApi(params, pipelineId)
    setData(data)
  }

  const renderColor = () => {
    return <div className='warning-color flex-start'>
      <div className='flex-start rect-box'>
        <div className='rect' style={{ background: colorMap['normal'] }}></div>
        <span>正常</span>
      </div>
      <div className='flex-start rect-box'>
        <div className='rect' style={{ background: colorMap['warning'] }}></div>
        <span>预警</span>
      </div>
      <div className='flex-start rect-box'>
        <div className='rect' style={{ background: colorMap['danger'] }}></div>
        <span>偏高</span>
      </div>
    </div>
  }

  const findChange = async () => {
    const { current_id, compare_id } = await form.validateFields()
    if (current_id === compare_id) {
      message.error('请选择两个不同的版本')
      return
    }
    getData()
  }

  const renderHeader = () => {
    return <div className='flex-space-between'>
      <div style={{ marginTop: '-8px' }}>平均构建时间</div>
      <Form form={form} name="control-hooks" className='flex-start'>
        <FindRid pipelineId={pipelineId} ref={findRef} findChange={findChange} name="current_id" findList={findList} />
        &nbsp;&nbsp;&nbsp;
        <div className='compared-header-text'>对比</div>
        &nbsp;&nbsp;&nbsp;
        <FindRid pipelineId={pipelineId} ref={findRef} findChange={findChange} name="compare_id" findList={findList} />
      </Form>
    </div>
  }

  // if (pipelineId !== 'p-36f6619c139c4a09904b62a0bbe470de' && pipelineId !== 'p-28359d1735234acaa011200b9a5f811f') {
  //   return <></>
  // }

  return (
    <div className='FlowLine-detail-analysis-compared-container'>
      {/* 操作 */}
      {renderHeader()}
      {/* 颜色 */}
      {renderColor()}
    </div>
  );
}

export default Project
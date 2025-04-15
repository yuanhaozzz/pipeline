import React, { useEffect, useState } from 'react';

import './style.less'
import { getDataApi } from './service'

import { Button, Form, Input, Select, DatePicker, Spin } from 'antd';
import moment from 'moment'
import { selectOptions, colorMap } from './data'
import { useParams } from 'react-router-dom';

import timeImage from './time.png'
import { getUrlParams } from '@/utils'

const { RangePicker } = DatePicker;

function Project() {

  const [form] = Form.useForm();

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const { pipelineId: pipelineIdUrl } = getUrlParams()

  let { pipelineId, runIid } = useParams() || {}
  if (!pipelineId) {
    pipelineId = pipelineIdUrl
  }

  useEffect(() => {
    getData()
  }, [runIid])

  const handleSelectChange = (value: string) => {
    form.setFieldValue('date', [moment().subtract(value, 'minutes'), moment()])
    getData()
  };

  const getData = async (value?) => {
    if (pipelineId !== 'p-6b7487560bdc4c31afc19384b3dd1740' && pipelineId !== 'p-7d4ee5154ee34a769fbaead092310474') {
      return <></>
    }
    setLoading(true)
    try {
      const date = value || form.getFieldValue('date')
      let start = ''
      let end = ''
      if (date) {
        start = date[0] ? moment(date[0]).format('YYYY-MM-DD HH:mm') : ''
        end = date[1] ? moment(date[1]).format('YYYY-MM-DD HH:mm') : ''
      }
      const params = {
        start_datetime: start,
        end_datetime: end
      }
      const { data } = await getDataApi(params)
      const list = []
      Object.keys(data).forEach(key => {
        list.push({
          name: key,
          ...data[key]
        })
      })
      setData(list)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const onTimeChange = (value) => {
    form.setFieldValue('scope', undefined)
    setTimeout(() => {
      getData(value)
    }, 100);
  };

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

  const renderHeader = () => {
    return <div className='flex-space-between'>
      <div style={{ marginTop: '-8px' }}>平均构建时间</div>
      <Form form={form} name="control-hooks" className='flex-start'>
        <Form.Item name="scope" label="" initialValue={60 * 24 * 7}>
          <Select
            placeholder="请选择范围"
            style={{ width: 110 }}
            onChange={handleSelectChange}
            options={selectOptions}
          />
        </Form.Item>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Form.Item name="date" label="" initialValue={[moment().subtract(60 * 24 * 7, 'minutes'), moment()]} >
          <RangePicker
            allowClear={false}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
            onChange={onTimeChange}
          />
        </Form.Item>
      </Form>
    </div>
  }

  const renderCard = () => {
    return <div className='warning-card flex-space-around'>
      {
        data.map(item => (
          <div className='warning-card-item'>
            <div className='item-title'>{item.name}</div>
            <div className='item-content'>
              <div className='flex-start text-box'>
                <img className='rect' src={timeImage} />
                {/* <div className='rect' style={{ background: colorMap[item?.overall_pass?.label] }}></div> */}
                总&nbsp;&nbsp;时&nbsp;&nbsp;间
                <div className='content'><span style={{ color: colorMap[item?.overall_pass?.label] }}>{item?.overall_pass?.value}</span> mins</div>
                {/* <span> mins</span> */}
              </div>
              <div className='flex-start text-box'>
                <img className='rect' src={timeImage} />
                {/* <div className='rect' style={{ background: colorMap[item?.in_queue_duration?.label] }}></div> */}
                排队时间
                <div className='content' ><span style={{ color: colorMap[item?.in_queue_duration?.label] }}>{item?.in_queue_duration?.value}</span> mins</div>
                {/* <span> mins</span> */}
              </div>
              <div className='flex-start text-box'>
                {/* <div className='rect' style={{ background: colorMap[item?.run_duration?.label] }}></div> */}
                <img className='rect' src={timeImage} />
                执行时间
                <div className='content' ><span style={{ color: colorMap[item?.run_duration?.label] }}>{item?.run_duration?.value}</span> mins</div>
                {/* <span> mins</span> */}
              </div>
            </div>
          </div>
        ))
      }
      {/* loading */}
      {
        loading && <div className='warning-card-loading flex-center'>
          <Spin size='small' />
        </div>
      }

    </div>
  }

  if (pipelineId !== 'p-6b7487560bdc4c31afc19384b3dd1740' && pipelineId !== 'p-7d4ee5154ee34a769fbaead092310474') {
    return <></>
  }

  return (
    <div className='FlowLine-detail-analysis-warning-container'>
      {/* 操作 */}
      {renderHeader()}
      {/* 颜色 */}
      {renderColor()}
      {/* 卡片 */}
      {renderCard()}
    </div>
  );
}

export default Project
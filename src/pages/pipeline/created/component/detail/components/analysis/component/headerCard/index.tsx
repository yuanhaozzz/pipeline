import React, { useEffect, useState, useMemo, useRef } from 'react';

import './style.less'
import { getDataApi } from './service'

import { Button, Form, Input, Select, DatePicker, Spin, Card } from 'antd';
import DateWeek from '@/components/DateWeek'
import moment from 'moment'
import { useParams } from 'react-router-dom';
import { Pie } from '@ant-design/plots';
import { colorMap, colorStatusMap, selectOptions } from '../warning/data'
import { getUrlParams } from '@/utils'


const { RangePicker } = DatePicker;

function Project() {

  const [form] = Form.useForm();

  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)

  const variableRef = useRef<any>({})

  const { pipelineId, runIid } = useParams() || {}
  const { pipelineId: pipelineIdUrl } = getUrlParams()

  const [pieData, setPieData] = useState([])

  const config = {
    data: pieData,
    angleField: 'value',
    colorField: 'type',
    label: {
      type: 'inner',
      offset: '-30%',
      content: '',
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    legend: {
      offsetX: -90,
      itemName: {
        formatter: (text: string, item, index) => {
          let rate = 0
          let number = 0
          switch (text) {
            case '运行成功':
              rate = data.success_rate
              number = data.success_count
              break
            case '运行失败':
              rate = data.failed_rate
              number = data.failed_count
              break
            default:
              rate = data.canceled_rate
              number = data.canceled_count
              break
          }
          return `${text}${text === '已  取  消' ? ' ' : ' ' + (rate || 0) + '%   '}${number || 0} 次`
        }
      }
    },
    color: ({ type }) => {
      switch (type) {
        case '运行成功':
          return colorStatusMap['success']
        case '运行失败':
          return colorStatusMap['failed']
        case '已  取  消':
          return colorStatusMap['canceled']
      }
    },
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: '',
      },
    },
  };

  useEffect(() => {
    getData()
  }, [runIid])

  const getData = async (value?) => {
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
      const { data } = await getDataApi(pipelineIdUrl || pipelineId, params)
      setData(data)
      const pie = [
        { type: '运行成功', value: data.success_count },
        { type: '运行失败', value: data.failed_count },
        { type: '已  取  消', value: data.canceled_count },
      ]
      setPieData(pie)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const pieMime = useMemo(() => {
    return <Pie {...config} />
  }, [pieData])

  const renderItem = () => {
    return <div className='headerCard-card flex-start'>
      <div className='headerCard-card-item flex-center'>
        <div className='headerCard-card-item-box flex-center'>
          <div className='box-text'>
            <span style={{ fontSize: '22px', marginRight: '4px' }}>{data.total}</span>
            次
          </div>
          <span style={{ color: '#aaaaaa' }}>运行次数</span>
        </div>
      </div>
      <div className='headerCard-card-item flex-center'>
        <div className='headerCard-card-item-box flex-center'>
          <div className='box-text'>
            <span style={{ fontSize: '22px', marginRight: '4px' }}>{data.avg_run_duration}</span>
            分钟
          </div>
          <span style={{ color: '#aaaaaa' }}>平均耗时</span>
        </div>
      </div>
      <div className='headerCard-card-item flex-center'>
        <div className='headerCard-card-item-box flex-center'>
          <div className='box-text'>
            <span style={{ fontSize: '22px', marginRight: '4px' }}>{data.avg_run_times_per_day}</span>
            次
          </div>
          <span style={{ color: '#aaaaaa' }}>日均运行</span>
        </div>
      </div>
      <div className='headerCard-card-item flex-center'>
        <div className='headerCard-card-item-box flex-center'>
          <div className='box-text'>
            <span style={{ fontSize: '22px', marginRight: '4px' }}>{data.p80_run_duration || 0}</span>
            分钟
          </div>
          <span style={{ color: '#aaaaaa' }}>80分位</span>
        </div>
      </div>
      <div className='headerCard-card-item-pie'>
        {pieMime}
      </div>
    </div>
  }

  const onTimeChange = (value) => {
    form.setFieldValue('scope', undefined)
    setTimeout(() => {
      getData(value)
    }, 100);
  };

  const handleSelectChange = (value: string) => {
    form.setFieldValue('date', [moment().subtract(value, 'minutes'), moment()])
    getData()
  };

  return <div style={{ marginBottom: '10px' }} className='FlowLine-detail-analysis-headerCard-container-parent'>
    <Card title={
      <div>运行概况</div>
    } extra={<>
      <div className='flex-end'>
        <Form form={form} name="control-hooks" className='flex-start'>
          <Form.Item name="scope" label="" initialValue={60 * 24 * 7} style={{ marginBottom: '0px' }}>
            <Select
              placeholder="请选择范围"
              style={{ width: 110 }}
              onChange={handleSelectChange}
              options={selectOptions}
            />
          </Form.Item>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Form.Item name="date" label="" initialValue={[moment().subtract(60 * 24 * 7, 'minutes'), moment()]} style={{ marginBottom: '0px' }} >
            <RangePicker
              allowClear={false}
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              onChange={onTimeChange}
            />
          </Form.Item>
        </Form>
      </div>
    </>}>
      <div className='FlowLine-detail-analysis-headerCard-container' ref={variableRef}>
        {renderItem()}
      </div>
      <br />
    </Card>
  </div>;
}

export default Project

import React, { useEffect, useState, useMemo } from 'react';

import './style.less'
import { getDataApi } from './service'

import { Button, Form, Input, Select, DatePicker, Spin, Radio } from 'antd';
import moment from 'moment'
import { selectOptions, colorMap, typeDateMap } from './data'
import { useParams } from 'react-router-dom';
import SecondData from './component/secondData'
import ThirdDataData from './component/thirdData'

import timeImage from './time.png'
import { getUrlParams } from '@/utils'

const { RangePicker } = DatePicker;

function Project(props) {
  const { name, from } = props
  const [form] = Form.useForm();

  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('day')
  const { pipelineId: pipelineIdUrl } = getUrlParams()

  let { pipelineId, runIid } = useParams() || {}
  if (!pipelineId) {
    pipelineId = pipelineIdUrl
  }

  useEffect(() => {
    getData()
  }, [runIid, type])

  const handleSelectChange = (value: string) => {
    form.setFieldValue('date', [moment().subtract(value, 'minutes'), moment()])
    getData()
  };

  const getData = async (value?) => {
    setLoading(true)
    try {
      const date = value || form.getFieldValue('date')
      const cycle = form.getFieldValue('cycle')
      let start = ''
      let end = ''
      switch (type) {
        case 'day':
          start = moment(date[0]).format('YYYY-MM-DD HH:mm')
          end = moment(date[1]).format('YYYY-MM-DD HH:mm')
          break
        case 'week':
          start = moment(date[0]).format('YYYY-MM-DD') + ' 00:00'
          end = moment(date[1]).format('YYYY-MM-DD ') + ' 23:59'
          break
        case 'month':
          start = moment(date[0]).startOf('month').format('YYYY-MM-DD HH:mm')
          end = moment(date[1]).endOf('month').format('YYYY-MM-DD HH:mm')
          break
      }
      const params = {
        start_datetime: start,
        end_datetime: end,
        type: from,
        cycle
      }
      console.log(params)
      const { data } = await getDataApi(params)
      setData(data)
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

  const radioChange = (e) => {

    const { value } = e.target
    setType(value)
    setTimeout(() => {
      form.setFieldValue('scope', undefined)
    }, 100);
  }

  const renderHeader = () => {
    return <div className='flex-space-between'>
      <div style={{ marginTop: '-8px' }}>{name}</div>
      <Form form={form} name="control-hooks" className='flex-start'>
        {
          type === 'day' && <Form.Item name="scope" label="" initialValue={60 * 24 * 7} style={{ marginRight: '15px' }}>
            <Select
              placeholder="请选择范围"
              style={{ width: 110 }}
              onChange={handleSelectChange}
              options={selectOptions}
            />
          </Form.Item>
        }

        <Form.Item name="cycle" label="" initialValue={'day'} >
          <Radio.Group
            onChange={radioChange}
            options={[
              { label: '月', value: 'month' },
              { label: '周', value: 'week' },
              { label: '日', value: 'day' },
            ]}
            optionType="button"
            buttonStyle="solid"
          />
        </Form.Item>

        &nbsp;&nbsp;&nbsp;&nbsp;
        <Form.Item name="date" label="" initialValue={[moment().subtract(60 * 24 * 7, 'minutes'), moment()]} >
          <RangePicker
            allowClear={false}
            style={{ width: '300px' }}
            picker={type === 'month' ? 'month' : 'date'}
            showTime={type === 'day' ? { format: 'HH:mm' } : null}
            format={typeDateMap[type]}
            onChange={onTimeChange}
          />
        </Form.Item>
      </Form>
    </div>
  }

  const secondMemo = useMemo(() => {
    return <SecondData data={data} />
  }, [data])

  const thirdMemo = useMemo(() => {
    return <ThirdDataData data={data} />
  }, [data])

  return (
    <div className='FlowLine-detail-analysis-lineList-container'>
      {/* 操作 */}
      {renderHeader()}
      {/* 第二层数据 */}
      {secondMemo}
      {/* 第三层数据 */}
      {thirdMemo}
      {/* loading */}
      {
        loading && <div className='lineList-card-loading flex-center'>
          <Spin size='small' />
        </div>
      }
    </div>
  );
}

export default Project
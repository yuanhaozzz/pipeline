import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment'

import { Card } from 'antd'
import PlaceholderContainer from '@/components/PlaceholderContainer'
import { Line } from '@ant-design/plots';
import DateWeek from '@/components/DateWeek'
import { useParams } from 'react-router-dom';

import { getDataApi, getWeekApi } from './service'

import { getType } from './data'
import { getTypeColor } from '../runCountLine/data'
import { getUrlParams } from '@/utils'

interface Props {
  field: string
}

const height = 420
const Project = (props: Props) => {
  const { field, tabIndex } = props

  const [data, setData] = useState([]);
  const [params, setParams] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [week, setWeek] = useState([{}])

  const dateRef = useRef(null)
  const variableRef = useRef<any>({})
  const isLoad = useRef(false)

  const { pipelineId, runIid } = useParams() || {}
  const { pipelineId: pipelineIdUrl } = getUrlParams()

  useEffect(() => {
    if (params.startDate && tabIndex === 3 && isLoad.current) {
      getData()
    }
    isLoad.current = true
  }, [field, params, runIid, tabIndex])

  const getData = async () => {
    try {
      setLoading(true)
      const { startDate, endDate, type } = params
      const paramsData = {
        field,
        start_date: startDate,
        end_date: endDate,
        cycle: type === 'dateWeek' ? 'week' : type
      }
      const { data } = await getDataApi(pipelineId || pipelineIdUrl, paramsData)
      setData(data)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const config = {
    data,
    xField: 'date',
    yField: 'value',
    seriesField: 'option',
    yAxis: {
      title: {
        text: '耗时（分钟）',
      },
      label: {
        formatter: (v) => `${v}`
      }
    },
    meta: {
      option: {
        formatter: (val) => {
          return getType(val)
        },
      }
    },
    color: ({ option }) => {
      return getTypeColor(option)
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: true,
      },
    },
    tooltip: {
      formatter: (datum: any) => {
        return { name: getType(datum.option), value: datum.value + '分钟' };
      },
    },
    point: {
    },
    legend: {
      selected: {
        all: true,
        success: true,
        failed: false,
      },
      // layout: 'vertical',
      position: 'bottom',
      flipPage: true,
      maxRow: 3,
      itemName: {
        style: {
          fontSize: 11,
        }
      },
      marker: {
        symbol: 'hyphen',
        style: (style: any) => {
          style.lineWidth = 4
          style.lineAppendWidth = 4
          style.fill = style.stroke
          return style
        }
      },
    },
  };

  // return ;

  const memoWordCloud = useMemo(() => {
    return <PlaceholderContainer height={height} data={data} loading={loading}>
      <Line {...config} />
    </PlaceholderContainer>
  }, [data, loading])


  const disabledDate = (current) => {
    const targetDate = new Date('2023-09-14');
    return current && current < targetDate; // 禁用目标日期之前的日期
  };

  const defaultDayComponentOptions = {
    disabledDate
  }

  const defaultDateWeekComponentOptions = {
    disabledDate
  }

  const handleStartTime = () => {
    return moment().subtract(1, 'month')
  }

  return <Card title={
    <div>流水线运行平均耗时</div>
  } extra={<>
    <div className='flex-end'>
      <DateWeek setParams={setParams} ref={dateRef} week={week} defaultDateString="day" formatType='month-dateWeek-day' defaultDayDate={[handleStartTime(), moment()]} />
    </div>
  </>}>
    <div style={{ height: height + 'px' }} ref={variableRef}>
      {memoWordCloud}
    </div>
    <br />
  </Card>
};


export default Project
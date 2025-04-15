import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment'

import { Card } from 'antd'
import PlaceholderContainer from '@/components/PlaceholderContainer'
import { DualAxes } from '@ant-design/plots';
import DateWeek from '@/components/DateWeek'
import { useParams } from 'react-router-dom';

import { getDataApi, getWeekApi } from './service'
import { getType, getTypeColor } from './data'
import { getUrlParams } from '@/utils'

interface Props {
  field: string
}

const height = 420
const Project = (props: Props) => {
  const { field, tabIndex } = props

  const [data, setData] = useState([]);
  const [newData, setNewData] = useState({ left: [], right: [] });
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
      const left = []
      const right = []
      data.forEach(item => {
        if (item.option === "success_rate") {
          item.v = item.value
          right.push(item)
        } else {
          left.push(item)
        }
      })
      setData(data)
      setNewData({
        left,
        right
      })
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const config = {
    data: [newData.left, newData.right],
    seriesField: 'option',
    xField: 'date',
    yField: ['value', 'v'],
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: true,
      },
    },
    yAxis: {
      v: {
        title: {
          text: '成功率',
        },
        max: 100,
        tickInterval: 10,
        label: {
          formatter: (v) => `${v}%`
        }
      },
      value: {
        title: {
          text: '运行次数'
        },
        label: {
          formatter: (v) => `${v}`
        }
      }
    },
    area: {

    },
    geometryOptions: [
      {
        geometry: 'line',
        seriesField: 'option',
        point: {},
        color: ({ option }) => {
          return getTypeColor(option)
        },
      },
      {
        geometry: 'line',
        seriesField: 'option',
        point: {},
        color: ({ option }) => {
          return getTypeColor(option)
        }
      },
    ],
    meta: {
      option: {
        formatter: (val) => {
          return getType(val)
        },
      }
    },
    tooltip: {
      formatter: (datum: any) => {
        const value = { name: getType(datum.option), value: (datum.value === undefined ? datum.v : datum.value) + (datum.option === 'success_rate' ? '%' : '次') }
        return value;
      },
    },

    legend: {
      selected: {
        all: true,
        success: true,
        failed: false,
        success_rate: false,
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

  const memoWordCloud = useMemo(() => {
    return <PlaceholderContainer height={height} data={data} loading={loading}>
      <DualAxes {...config} />
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
    <div>流水线运行次数</div>
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
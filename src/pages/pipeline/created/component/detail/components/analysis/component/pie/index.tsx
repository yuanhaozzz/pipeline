import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment'

import { Card, Tooltip } from 'antd'
import PlaceholderContainer from '@/components/PlaceholderContainer'
import { Pie } from '@ant-design/plots';
import DateWeek from '@/components/DateWeek'
import { useParams } from 'react-router-dom';
import { chartColor } from './data'

import { getDataApi, getWeekApi } from './service'

import { getType } from './data'
import { getTypeColor } from '../runCountLine/data'
import { deepCopy } from '@/utils'
import { getUrlParams } from '@/utils'
import './style.less'

interface Props {
  field: string
}

const height = 420
const Project = (props: Props) => {
  const { field, tabIndex, repoName } = props

  const pieRef = useRef(null)
  const legendListHandle = useRef([])

  const [legendList, setLegendList] = useState([])

  const [data, setData] = useState([]);
  const [params, setParams] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [week, setWeek] = useState([{}])

  const dateRef = useRef(null)
  const isLoad = useRef(false)
  const variableRef = useRef<any>({})

  const { pipelineId, runIid } = useParams() || {}

  useEffect(() => {
    if (params.startDate && tabIndex === 3 && isLoad.current) {
      getData()
    }
    isLoad.current = true
  }, [field, params, runIid, tabIndex])

  const getData = async () => {
    try {
      const { startDate, endDate, type } = params
      const paramsData = {
        field,
        start_date: startDate,
        end_date: endDate,
        repo_name: repoName
      }
      const { data } = await getDataApi(paramsData)

      data.forEach((item, index) => {
        item.color = chartColor[index % chartColor.length]
      })
      setInitLegendList(deepCopy(data).sort((a, b) => b.value - a.value))
      legendListHandle.current = deepCopy(data).sort((a, b) => b.value - a.value)
      setData(data)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  const config = {
    data: data || [],
    angleField: 'value',
    colorField: 'option',
    radius: 0.8,
    style: {
      position: 'relative',
      left: '-20%', // 向左偏移10%
      // 其他配置项
    },
    activeShape: {
      lineWidth: 2,
      stroke: '#fff',
    },
    color: ({ option }) => {
      const current = data.find(item => item.option === option)
      return current.color
    },
    label: null,
    // label: {
    //   type: 'spider',
    //   labelHeight: 28,
    //   formatter: ({ value, option }) => `${option}\n${value}次`
    // },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    tooltip: {
      formatter: (datum) => {
        return { name: datum.option, value: datum.value + '次' };
      },
    },
    legend: false
  };


  const memoWordCloud = useMemo(() => {
    return <PlaceholderContainer height={height} data={data} loading={loading}>
      <Pie {...config} ref={pieRef} />
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

  const LeaveTegend = () => {
    const elements = pieRef.current.getChart().chart.geometries?.[0].elements
    elements.forEach((element) => {
      element.setState('active', false);
    });
  }

  const hoverTegend = (option) => {
    const elements = pieRef.current.getChart().chart.geometries?.[0].elements
    elements.forEach((element) => {
      const value = element.getData().option
      if (value === option) {
        element.setState('active', true);
      } else {
        element.setState('active', false);
      }

    });
  }

  const setInitLegendList = (data) => {
    setLegendList(data.map(item => {
      item.active = false
      return item
    }))
  }

  const handleText = (value: any = '', end = 30) => {
    value = value + ''
    return <div >
      {
        value.length > end ? <Tooltip title={<div style={{ whiteSpace: 'pre-wrap' }}>{value}</div>}>
          <div style={{ cursor: 'pointer' }}>{value.slice(0, end) + '...'}</div>
        </Tooltip> : value
      }
    </div >
  }

  const clickTegend = (item) => {
    item.active = !item.active
    setLegendList([...legendList])

    let newLegendList = legendListHandle.current
    let index = legendList.findIndex(legend => legend.option === item.option)
    if (item.active) {
      // newLegendList.splice(index, 1)
      newLegendList[index] = null
    } else {
      // newLegendList.splice(index, 0, item)
      newLegendList[index] = item
    }
    const d = newLegendList.filter(Boolean)
    pieRef.current.getChart().changeData(d)
  }

  const renderLegendList = () => {
    // return <ul className='legend-list common-scroll-bar'>
    //   {
    //     legendList.map(item => (
    //       <li
    //         className={`legend-list-item flex-start ${item.active && 'legend-list-item-active'}`}
    //         onMouseEnter={() => hoverTegend(item.value)}
    //         onMouseLeave={LeaveTegend}
    //         onClick={() => clickTegend(item)}
    //       >

    //         <div className='item-line' style={{ background: item.color }}></div>
    //         {item.option}
    //       </li>
    //     ))
    //   }
    // </ul>
    return <div className='legend-list common-scroll-bar'>
      {
        legendList.length > 0 && <table >
          <tr>
            <th width="10%"></th>
            <th width="60%"></th>
            <th align='center' width="10%" style={{ whiteSpace: 'nowrap' }}>运行次数</th>
            <th align='center' width="20%" style={{ whiteSpace: 'nowrap' }}>成功率</th>
          </tr>
          {
            legendList.map(item => (
              <tr
                className={`legend-list-item ${item.active && 'legend-list-item-active'}`}
                onMouseEnter={() => hoverTegend(item.option)}
                onMouseLeave={LeaveTegend}
                onClick={() => clickTegend(item)}
              >
                <td ><div className='item-line' style={{ background: item.color, marginTop: '3px' }}></div></td>
                <td >{handleText(`${item.option}`, 20)}</td>
                <td align='center'>{item.value}次</td>
                <td align='center'>{item.rate}%</td>
              </tr>
            ))
          }

        </table>
      }

    </div>
  }

  return <Card title={
    <div>{repoName}</div>
  } extra={<>
    <div className='flex-end'>
      <DateWeek setParams={setParams} ref={dateRef} week={week} defaultDateString="day" formatType='day' defaultDayDate={[handleStartTime(), moment()]} />
    </div>
  </>}>
    <div style={{ height: height + 'px' }} ref={variableRef} className='flow-plugin-reportAnalysis-pie-container'>
      {renderLegendList()}
      {memoWordCloud}
    </div>
    <br />
  </Card>
};


export default Project
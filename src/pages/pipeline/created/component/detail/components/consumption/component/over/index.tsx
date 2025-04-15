import React, { useState, useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from 'react';
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
import './style.less'

interface Props {
  field: string
}

const height = 220
const Project = (props: Props, ref) => {
  const { field, repoName, data } = props

  const pieRef = useRef(null)
  const legendListHandle = useRef([])

  const [legendList, setLegendList] = useState([])

  const [params, setParams] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [week, setWeek] = useState([{}])

  const dateRef = useRef(null)
  const isLoad = useRef(false)
  const variableRef = useRef<any>({})

  useImperativeHandle(ref, () => ({
    closeLoading
  }))

  const closeLoading = () => {
    setLoading(false)
  }

  const config = {
    data: data || [],
    angleField: 'count',
    colorField: 'job_name',
    radius: 0.8,
    activeShape: {
      lineWidth: 2,
      stroke: '#fff',
    },
    label: {
      type: 'inner',
      labelHeight: 28,
      formatter: ({ count, option }) => `${count}个`
    },
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
        return { name: datum.job_name, value: datum.count + '个' };
      },
    },
  };


  const memoWordCloud = useMemo(() => {
    return <PlaceholderContainer height={height} data={data} loading={loading}>
      <Pie {...config} ref={pieRef} />
    </PlaceholderContainer>
  }, [data, loading])


  return <Card title={
    <div>测试用例分布</div>
  } extra={<>
  </>}>
    <div style={{ height: height + 'px' }} ref={variableRef} className='flow-plugin-reportAnalysis-pie-container'>
      {memoWordCloud}
    </div>
    <br />
  </Card>
};


export default forwardRef(Project)
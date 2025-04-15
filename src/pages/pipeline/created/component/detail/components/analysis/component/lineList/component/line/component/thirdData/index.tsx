import React, { useEffect } from 'react';

import './style.less'
import { send } from './service'
import { Pie } from '@ant-design/plots';
import { Line } from '@ant-design/plots';
import { colorStatusMap } from '../../../../../warning/data'
import { Row, Col } from 'antd'


function Project(props) {
  const { data } = props


  const renderText = () => {
    const left = [
      { label: '构建总数', value: data.total, unit: '次' },
      { label: '构建成功数', value: data.success_count, unit: '次' },
      { label: '成功平均耗时', value: data.success_avg_run_duration, unit: '分钟' },
      { label: '最长时间', value: data.longest_run_duration, unit: '分钟' },
    ]
    const right = [
      { label: '取消次数', value: data.canceled_count || 0, unit: '次' },
      { label: '构建失败数', value: data.failed_count, unit: '次' },
      { label: '失败平均耗时', value: data.failed_avg_run_duration, unit: '分钟' },
      { label: '最短时间', value: data.shortest_run_duration, unit: '分钟' },
    ]
    return <div className='secondData-text'>
      <div className='secondData-text-title'>性能洞察</div>
      <div className='secondData-text-content flex-start'>
        <div className='secondData-text-content-left'>
          {
            left.map(item => (
              <div>
                <div className='secondData-text-content-left-title'>
                  {item.label}
                </div>
                <div className='secondData-text-content-left-content'>{item.value}<span style={{ fontSize: '12px' }}> {item.unit}</span></div>
              </div>
            ))
          }
        </div>
        <div className='secondData-text-content-right'>
          {
            right.map(item => (
              <div>
                <div className='secondData-text-content-left-title'>
                  {item.label}
                </div>
                <div className='secondData-text-content-left-content'>{item.value}<span style={{ fontSize: '12px' }}> {item.unit}</span></div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  }

  const getType = (val) => {
    switch (val) {
      case 'all':
        return '全部'
      case 'success':
        return '成功'
      case 'failed':
        return '失败'
      case 'canceled':
        return '取消'
    }
  }
  const renderLine = () => {
    if (!data.avg_run_duration_list) {
      return <></>
    }
    const config = {
      data: data.avg_run_duration_list || [],
      // padding: 'auto',
      xField: 'date',
      yField: 'value',
      seriesField: 'option',
      meta: {
        option: {
          formatter: (val) => {
            const v = getType(val)
            return v || '全部'
          },
        }
      },
      tooltip: {
        formatter: (datum: any) => {
          return { name: getType(datum.option), value: datum.value + ' mins' };
        },
      },
      yAxis: {
        title: {
          text: '构建耗时',
        },
        label: {
          formatter: (value) => {
            return value + ' mins'
          },
          style: {
            fill: '#bfbfbf'
          },
        },

      },
      xAxis: {
        // type: 'timeCat',
        label: {
          autoHide: true,
          autoRotate: true,
        },
      },
      point: {
      },
      legend: {
        position: 'top-left',
        offsetX: 25,
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
      color: ({ option }) => {
        switch (option) {
          case 'success':
            return colorStatusMap['success']
          case 'failed':
            return colorStatusMap['failed']
          case 'canceled':
            return colorStatusMap['canceled']
        }
      },
    }
    return <div className='secondData-line'>
      <Line {...config} />
    </div>
  }

  return (
    <div className='FlowLine-detail-analysis-warning-thirdData-container'>
      <Row wrap={false} >
        <Col flex="330px">
          {renderText()}
        </Col>
        <Col flex="auto">
          {renderLine()}
        </Col>
      </Row>
    </div>
  );
}

export default Project
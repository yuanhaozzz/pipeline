import React, { useEffect } from 'react';

import './style.less'
import { send } from './service'
import { Pie } from '@ant-design/plots';
import { Line } from '@ant-design/plots';
import { colorStatusMap } from '../../../../../warning/data'
import { Row, Col } from 'antd'


function Project(props) {
  const { data } = props


  const renderPie = () => {
    const pieData = [
      {
        type: '成功',
        value: data.success_count,
      },
      {
        type: '失败',
        value: data.failed_count,
      },
      {
        type: '取消',
        value: data.canceled_count || 0,
      },
    ];
    const pieConfig = {
      appendPadding: 10,
      data: pieData,
      angleField: 'value',
      colorField: 'type',
      radius: 1,
      smooth: true,
      innerRadius: .8,
      // style: {
      //   position: 'relative',
      //   left: '12%', // 向左偏移10%
      //   // 其他配置项
      // },
      color: ({ type }) => {
        switch (type) {
          case '成功':
            return colorStatusMap['success']
          case '失败':
            return colorStatusMap['failed']
          case '取消':
            return colorStatusMap['canceled']
        }
      },
      legend: {
        visible: false, // 将 legend 设置为 false 即可隐藏图例
      },
      label: {
        type: 'inner',
        offset: '-50%',
        content: '',
        style: {
          textAlign: 'center',
          fontSize: 14,
        },
      },
      interactions: [
        {
          type: 'element-selected',
        },
        {
          type: 'element-active',
        },
      ],
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
    return <div className='secondData-pie-container'>
      <div className='secondData-pie '>
        <Pie {...pieConfig} />

      </div>
      <div className='text'>
        <div style={{ marginBottom: '10px', textAlign: 'center', color: '#aaaaaa' }}>成功率</div>
        <div style={{ marginBottom: '10px', fontSize: '20px', textAlign: 'center', color: '#000' }}>{data?.success_rate}%</div>
        <div style={{ textAlign: 'center', color: '#aaaaaa' }}>共{data?.total}次</div>
      </div>
    </div>
  }
  const renderLine = () => {

    const config = {
      data: data.success_rate_list || [],
      // padding: 'auto',
      xField: 'date',
      yField: 'rate',
      tooltip: {
        formatter: (datum: any) => {
          return { name: '成功率', value: datum.rate + '%' };
        },
      },
      point: {
      },
      yAxis: {
        title: {
          text: '成功率',
        },
        label: {
          formatter: (value) => {
            return value + '%'
          },
          style: {
            fill: '#bfbfbf'
          },
        },
      },
      xAxis: {
        label: {
          autoRotate: true,
          autoHide: true,
        },
      },
      color: '#4dcb4f'
    }
    return <div className='secondData-line'>
      <Line {...config} />
    </div>
  }

  return (
    <div className='FlowLine-detail-analysis-warning-secondData-container'>
      <Row wrap={false} >
        <Col flex="330px">
          {renderPie()}
        </Col>
        <Col flex="auto">
          {renderLine()}
        </Col>
      </Row>
    </div>
  );
}

export default Project
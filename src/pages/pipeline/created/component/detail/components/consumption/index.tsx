import { Select, Row, Col } from 'antd';
import { useEffect, useRef, useState } from 'react';
import PieStatus from './component/status'
import PieOver from './component/over'
import List from './component/list'
import { useParams } from 'react-router-dom';
import { getRepoPieList } from './service'

import './style.less'

const TimeSelect = (props) => {
  const { tabIndex, data: runData, id } = props

  const [consumptionData, setConsumptionData] = useState({
    state_count: [],
    job_case_count: [],
    "success_rate": { "pass": 0, "total": 0 },
    "progress_rate": { "done": 0, "total": 0 }
  })
  const { pipelineId, runIid } = useParams() || {}

  const statusRef = useRef(null)
  const overRef = useRef(null)

  useEffect(() => {
    if (tabIndex === 4) {
      getPieList()
    }
  }, [tabIndex, runIid])

  const getPieList = async () => {
    const { data } = await getRepoPieList(id)
    // const data = {
    //   "state_count": [
    //     {
    //       "state": "FAILED",
    //       "count": 1
    //     },
    //     {
    //       "state": "PASS",
    //       "count": 1
    //     },
    //     {
    //       "state": "PENDING",
    //       "count": 2
    //     },
    //     {
    //       "state": "RUNNING",
    //       "count": 1
    //     }
    //   ],
    //   "job_case_count": [
    //     {
    //       "job_name": "job",
    //       "count": 5
    //     },
    //     {
    //       "job_name": "job1",
    //       "count": 25
    //     },
    //     {
    //       "job_name": "job2",
    //       "count": 35
    //     },
    //   ],
    //   "success_rate": { "pass": 3, "total": 5 },
    //   "progress_rate": { "done": 3, "total": 6 }
    // }
    statusRef.current.closeLoading()
    overRef.current.closeLoading()
    setConsumptionData({
      state_count: [],
      job_case_count: [],
      "success_rate": { "pass": 0, "total": 0 },
      "progress_rate": { "done": 0, "total": 0 },
      ...data
    })
  }

  const renderCard = () => {
    return <div className='consumption-header'>
      <b>运行概况</b>
      <div className='flex-start header-item-box'>

        <div className='header-item flex-center'>
          <div>
            <div><span style={{ fontSize: '30px' }}>{Math.round((consumptionData?.success_rate?.pass || 0) / (consumptionData?.success_rate?.total || 0) * 100) || 0}%</span></div>
            <div style={{ color: '#9c9c9c', textAlign: 'center' }}>成功率({consumptionData?.success_rate?.pass}/{consumptionData?.success_rate?.total})</div>
          </div>
        </div>
        {/* 线 */}
        <div className='item-line'></div>
        <div className='header-item flex-center'>
          <div>
            <div><span style={{ fontSize: '30px' }}>{consumptionData?.progress_rate?.done}/{consumptionData?.progress_rate?.total}</span></div>
            <div style={{ color: '#9c9c9c', textAlign: 'center' }}>进度</div>
          </div>
        </div>
        {/* <div className='header-item'>
          <div className=' flex-space-around'>
            <div>
              <div><span style={{ fontSize: '30px' }}>12</span></div>
              <div style={{ color: '#9c9c9c', textAlign: 'center' }}>已通过</div>
            </div>
            <div>
              <div><span style={{ fontSize: '30px' }}>12</span></div>
              <div style={{ color: '#9c9c9c', textAlign: 'center' }}>总数</div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>xxx</div>
        </div> */}
      </div>
    </div>
  }

  const renderPie = () => {
    return <>
      <Row gutter={24} >
        <Col xxl={12} xl={12} lg={12} xs={12} sm={12} md={12}>
          <div className='flow-plugin-analysis-item' >
            <PieStatus tabIndex={tabIndex} data={consumptionData?.state_count} ref={statusRef} />
          </div>
        </Col>
        <Col xxl={12} xl={12} lg={12} xs={12} sm={12} md={12}>
          <div className='flow-plugin-analysis-item' >
            <PieOver tabIndex={tabIndex} data={consumptionData?.job_case_count} ref={overRef} />
          </div>
        </Col>
      </Row>
    </>
  }

  const renderList = () => {
    return <List id={id} />
  }

  return (
    <div className='flow-plugin-consumption-container'>
      {renderCard()}
      {renderPie()}
      {renderList()}
    </div>
  );
};

export default TimeSelect;
import { Select, Row, Col } from 'antd';
import { useEffect, useState } from 'react';
import Pie from './component/pie'
import RunCountLine from './component/runCountLine'
import RunCountFailedLine from './component/runCountFailedLine'
import { getRepoPieList } from './service'
import { useParams } from 'react-router-dom';
import { getUrlParams } from '@/utils'

import './style.less'
import WarningCard from './component/warning'
import HeaderCard from './component/headerCard'
import LineList from './component/lineList'
import Compared from './component/compared'

const TimeSelect = (props) => {
  const { tabIndex, data: runData } = props

  const [pieList, setPieList] = useState([])
  const { pipelineId, runIid } = useParams() || {}
  const { pipelineId: pipelineIdUrl } = getUrlParams()

  useEffect(() => {
    getPieList()
  }, [])

  const getPieList = async () => {
    if (runData?.setting?.label !== '质量门禁') {
      return
    }
    const { data } = await getRepoPieList(pipelineId || pipelineIdUrl)
    // const data = ['test1', 'test2', 'test3', 'test4', 'test5']
    setPieList(data)
  }

  return (
    <div className='flow-plugin-analysis-container'>
      <HeaderCard />
      <Compared />
      <WarningCard />
      <LineList />
      <Row gutter={24} >
        <Col xxl={12} xl={24}>
          <div className='flow-plugin-analysis-item' >
            <RunCountLine tabIndex={tabIndex} />
          </div>
        </Col>
        <Col xxl={12} xl={24}>
          <div className='flow-plugin-analysis-item' >
            <RunCountFailedLine tabIndex={tabIndex} />
          </div>
        </Col>
      </Row>
      {
        runData?.setting?.label === '质量门禁' && <>
          <Row gutter={24} >
            {
              pieList.map(pieRepo => (
                <Col xxl={12} xl={24}>
                  <div className='flow-plugin-analysis-item' >
                    <Pie repoName={pieRepo} tabIndex={tabIndex} />
                  </div>
                </Col>
              ))
            }
          </Row>
        </>
      }
    </div>
  );
};

export default TimeSelect;

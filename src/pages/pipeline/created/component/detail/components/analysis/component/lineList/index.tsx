import React, { useEffect } from 'react';

import './style.less'
import { send } from './service'
import Line from './component/line'

import { useParams } from 'react-router-dom';
import { getUrlParams } from '@/utils'

function Project() {

  const { pipelineId: pipelineIdUrl } = getUrlParams()

  let { pipelineId, runIid } = useParams() || {}
  if (!pipelineId) {
    pipelineId = pipelineIdUrl
  }

  if (pipelineId !== 'p-6b7487560bdc4c31afc19384b3dd1740' && pipelineId !== 'p-7d4ee5154ee34a769fbaead092310474') {
    return <></>
  }

  return (
    <div className='flow-line-detail-analysis-lineList-container'>
      <Line name="构建数据-全部" from="all" />
      <Line name="构建数据-GCC 5" from="gcc5" />
      <Line name="构建数据-Clang 9" from="clang9" />
      <Line name="构建数据-ARM Cross" from="arm_cross" />
    </div>
  );
}

export default Project
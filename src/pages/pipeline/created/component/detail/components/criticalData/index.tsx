import React, { useEffect, useState, useRef } from 'react';
import { Radio } from 'antd'

import './style.less'

import Description from './component/description'
import Comment from './component/comment'

interface Props {
  tabIndex: any
  id: any
  configData?: any
  data?: any
}
function Project(props: Props) {
  const { data } = props
  const [radioType, setRadioType] = useState(1)
  const options = [
    { label: '构建参数', value: 1 },
    { label: '全部评论', value: 2 },
  ]

  const onChange = ({ target: { value } }) => {
    setRadioType(value)
  }

  return (
    <div className='critical-data-wrapper'>
      {/* <Radio.Group size='small' options={options} onChange={onChange} value={radioType} optionType="button" style={{ marginBottom: '5px' }} /> */}
      <Description {...props} />
      {/* {
        data?.setting?.label === '流程服务'
          ?
          <Comment {...props} />
          :
          <Description {...props} />
      } */}
    </div >
  );
}

export default Project
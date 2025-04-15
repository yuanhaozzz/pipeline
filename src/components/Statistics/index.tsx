import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Tooltip } from 'antd';

import { getStatistics, setStatistics } from '@/utils/statistics'

import UserImage from './images/user.png'
import SuccessImage from './images/success.png'
import PVImage from './images/pv.png'
import './style.less'

export interface IAppProps {
}

function Project(props: IAppProps, ref?: any) {

  const [data, setData] = useState<any>(null)

  useImperativeHandle(ref, () => ({
    updateStatistics
  }))


  useEffect(() => {
    init()
  }, [])



  const init = async () => {
    // await setStatistics({})
    updateStatistics()
  }

  const updateStatistics = async () => {
    const { data } = await getStatistics()
    setData(data)
  }


  if (!data) {
    return <></>
  }

  return (
    <div className='common-statistics-wrap flex-start'>
      {/* PV */}
      <Tooltip placement="top" title={'访问量'}>
        <div className='margin-right-10 flex-start statistics-item'>
          <img src={PVImage} />
          {data.page_hits}
        </div>
      </Tooltip>
      {/* 用户 */}
      <Tooltip placement="top" title={'用户数量'}>
        <div className='margin-right-10 flex-start'>
          <img src={UserImage} />
          {data.visitor_count}
        </div>
      </Tooltip>
      {/* 识别成功 */}
      <Tooltip placement="top" title={'已成功'}>
        <div className='margin-right-10 flex-start'>
          <img src={SuccessImage} />
          {data.interface_success_hits}
        </div>
      </Tooltip>
    </div>
  );
}

export default forwardRef(Project)
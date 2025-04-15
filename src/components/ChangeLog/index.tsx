import { useState, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';

import { Modal, DatePicker, Select, Empty } from 'antd'
import moment from 'moment'
import './style.less'
import { getHistoryApi } from './service'

export interface IAppProps {
}
let bigVersion = ''
function LoadModal(props: IAppProps, ref: any) {
  const [modal, setModal] = useState(false)

  const [data, setData] = useState([])

  const [versionIndex, setVersionIndex] = useState(0)

  const variableRef = useRef<any>()

  useEffect(() => {
    // getData()
  }, [])

  useImperativeHandle(ref, () => ({
    open
  }))


  const open = (version: any) => {
    setModal(true)
    bigVersion = version
    getData()
  }

  const getData = async () => {
    const { data } = await getHistoryApi()
    if (bigVersion) {
      const findVersionIndex = data.findIndex(item => item.version === bigVersion)
      setVersionIndex(findVersionIndex)
    }
    setData(data)
  }

  const onCancel = () => {
    setModal(false)
    bigVersion = ''
  }

  const renderLeft = () => {
    return (
      <div className='content-left' ref={variableRef}>
        <ul className='content-left-list'>
          {
            data.map((item: any, index: number) => (
              <li onClick={() => setVersionIndex(index)}>
                <h3>{item.version}</h3>
                <span>{moment(item.release_date).format('YYYY-MM-DD')}</span>
                {
                  index === 0 && <span className='current'>当前版本</span>
                }
                {
                  index === versionIndex && <div className='line'></div>
                }
              </li>
            ))
          }
        </ul>
      </div>
    )
  }

  const renderRight = () => {
    return (
      <div className='content-right'>
        <h2 className='content-right-title'>{data[versionIndex]?.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: data[versionIndex]?.content.replace(/\\/g, '') }}></div>
      </div>
    )
  }

  return (
    <Modal title="" width={1000} className="change-log-container" centered destroyOnClose={true} footer={null} open={modal} onCancel={onCancel}>
      <div className='change-log-content flex-start'>
        {renderLeft()}
        {renderRight()}
      </div>
    </Modal>
  );
}


export default forwardRef(LoadModal)
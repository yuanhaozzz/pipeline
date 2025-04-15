import { useState, useEffect } from 'react';
import { PartitionOutlined } from '@ant-design/icons'
import './style.less'

export interface IAppProps {
  children?: any;
  title: string;
  pipelineName?: string;
}

function Project(props: IAppProps) {
  const { title, children, pipelineName } = props
  return (
    <div className='common-pipeline-nav flex-space-between'>
      <div className='pipeline-nav-left flex-start'>
        <PartitionOutlined />
        <h2>{title}</h2>
        {/* <span className='pipeline-name'>{pipelineName}</span> */}
      </div>
      {children}
    </div>
  );
}

export default Project
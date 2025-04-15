import React, { useState, useImperativeHandle, forwardRef, useRef, useMemo } from 'react';
import { Modal, Popover, Button, } from 'antd';
import { RollbackOutlined, } from '@ant-design/icons'
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import { getJsonDiffApi, } from './service'
import PageLoading from '@/components/PageLoading'
import './style.less'
import { checkPipilineAuth } from '@/utils/menu'


const VersionDiff = (props: any, ref: any) => {
  const { selectedRowKeys = [], showConfirm = () => { } } = props
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonData, setJsonData] = useState({ oldJSON: {}, newJSON: {} })
  const [loading, setLoading] = useState(false)
  const versionRef = useRef({})

  useImperativeHandle(ref, () => ({
    showModal,
  }))

  const getDiffData = async (pipelineId: string, versions: Array<number>) => {
    setLoading(true)
    const oldJSON = await getJsonDiffApi(pipelineId, versions[0]?.version)
    setLoading(false)
    const newJSON = await getJsonDiffApi(pipelineId, versions[1]?.version)
    setJsonData({ oldJSON: oldJSON?.data || {}, newJSON: newJSON?.data || {} })
  }

  const showModal = (params: any = {}) => {
    const { pipelineId, versions, isNeedRestore = true } = params
    setIsModalOpen(true);
    versionRef.current = { versions, isNeedRestore }
    getDiffData(pipelineId, versions)
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const newStyles = {
    variables: {
      light: {
        codeFoldGutterBackground: "#6F767E",
        codeFoldBackground: "#E2E4E5"
      }
    }
  };

  const renderTitle = useMemo(() => {
    return <div className='versionTitle'>
      {versionRef.current?.versions?.map((item: any) => {
        let { version, isHasAuth, index } = item || {}

        isHasAuth = !checkPipilineAuth('Update') || !isHasAuth
        return <div>
          <b>version: {version}</b>&nbsp;&nbsp;
          {versionRef.current?.isNeedRestore && <Popover content={isHasAuth ? '版本恢复' : '暂无权限恢复'} trigger="hover">
            <Button disabled={isHasAuth || index === 0} size='small' icon={<RollbackOutlined style={{ fontSize: '16px', }} />} onClick={() => showConfirm({ version }, handleCancel)}></Button>
          </Popover>}
        </div>
      })}
    </div>
  }, [versionRef.current])

  const renderViewer = () => {
    return <div className='viewer'>
      <ReactDiffViewer
        oldValue={JSON.stringify(jsonData?.oldJSON, undefined, 4)}
        newValue={JSON.stringify(jsonData?.newJSON, undefined, 4)}
        splitView={true}
        // leftTitle={renderTitle(0)}
        // rightTitle={renderTitle(1)}
        compareMethod={DiffMethod.WORDS}  // WORDS_WITH_SPACE CHARS 、WORDS、  CSS
        styles={newStyles}
      />
    </div>
  }

  return (
    <Modal title="编辑历史对比" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} wrapClassName='VersionDiff-wrapper' footer={false}>
      {loading
        ? <PageLoading />
        : <>
          {renderTitle}
          {renderViewer()}
        </>
      }
    </Modal>
  );
};

export default forwardRef(VersionDiff);
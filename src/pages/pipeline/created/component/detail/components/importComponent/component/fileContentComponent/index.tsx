import React, { useEffect, useRef, useState } from 'react';
import { Input, message, Button, Form } from 'antd'

import './style.less'

import { useSelector, useDispatch } from 'umi'
import { getUrlParams } from '@/utils'
import { useParams } from 'react-router-dom';
import { setCompatiblePath } from '@/pages/pipeline/created/common'

function Project(props) {

  const { value, onCancel, record } = props

  const fileRef = useRef(null)
  const jsonValueRef: any = useRef('')

  const { pipelineId } = useParams() || {}
  const [form] = Form.useForm();

  const pipeline = useSelector(({ pipeline }) => pipeline)
  const dispatch = useDispatch()
  const query = getUrlParams()

  const vaildExt = (name: string) => {
    const map: any = {
      // jpg: true,
      // jpeg: true,
      // png: true,
      // // gif: true,
      // jfif: true,
      // JPG: true,
      // JPEG: true,
      // PNG: true,
      // JFIF: true,
      json: true,
      // xlsx: true,
      // docx: true
      // pdf: true,
    }


    const extSplit = name.split('.')
    const ext: any = extSplit[extSplit.length - 1]

    const v = map[ext]
    if (!v) {
      message.error(`仅支持 ${Object.keys(map).join('、')} 格式`)
      clearFile()
    }
    return v
  }

  const goCreated = () => {
    const json = jsonValueRef.current

    dispatch({
      type: 'pipeline/setList',
      payload: { list: [...pipeline.list], importData: JSON.parse(json) }
    })
    const uuid = pipelineId || query.pipelineId || record.uuid

    props.history.push(setCompatiblePath(`/FlowLine/created/modify?pipelineId=${uuid}&tab=1&source=import&t=${Date.now()}`))
    message.success('导入成功')
    setTimeout(() => {
      onCancel()
    }, 500);
  }

  const uploadChange = async (e) => {
    const file = e.target.files[0];

    if (!vaildExt(file.name)) {
      return
    }

    const limitSize = file.size / 1024 / 1024
    // 低于10M
    if (limitSize > 10) {
      message.error('请上传的文件小于10M')
      clearFile()
      return
    }


    const reader = new FileReader();
    clearFile()
    reader.onload = async function (e) {
      const v = e.target.result;
      jsonValueRef.current = v
      await form.validateFields()
      goCreated()

    };
    reader.readAsText(file);
  }

  const clearFile = () => {
    let file: any = fileRef.current
    file.value = ''
  }

  const validator = (info, v) => {

    try {
      const data = JSON.parse(jsonValueRef.current)
      if (!data.setting || !data.stages) {
        return Promise.reject('该文件配置无效')
      }
    } catch (error) {
      return Promise.reject('格式错误')
    }
    return Promise.resolve()
  }

  const renderEl = () => {
    return <div >
      <div className='flex-center'>
        <button className='ocr-upload-button'>上传文件</button>
      </div>
      <p className="ant-upload-text">单击或拖动到此区域上传，仅支持 json 格式，文件大小不超过10M。</p>
    </div>
  }


  return (
    <>
      <div className='common-uploadfile-container variable-file-content-container'>
        <Form form={form} name="control-hooks" layout="vertical">
          <Form.Item name="content" label="" rules={[{ validator }]}>
            <div>
              <div className={`ocr-upload flex-center `} >
                {/* 上传 */}
                <input type="file" name="file" id="file" ref={fileRef} accept=".json" className='ocr-upload-input' onChange={uploadChange} />
                {
                  renderEl()
                }
              </div>
            </div>
          </Form.Item>
        </Form>

      </div>
    </>
  );
}

export default Project
import React, { useEffect, useRef, useState } from 'react';
import { Form, Input, message, Button } from 'antd'

import './style.less'
import { send } from './service'

const { TextArea } = Input;
function Project(props) {

  const { item, form, name, value } = props
  const [fileContent, setFileContent] = useState<any>(value || '');

  const fileRef = useRef(null)

  // useEffect(() => {
  //   if (value) {
  //     setFileContent(value)
  //   }
  // }, [value])

  useEffect(() => {
    form.setFieldValue(name, fileContent)
  }, [fileContent])

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
      txt: true,
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
    reader.onload = function (e) {
      const v = e.target.result;
      if (!v) {
        message.error('文件为空')
        return
      }
      form.setFieldValue(name, v)
      setFileContent(v)
      form.validateFields([name])
    };
    reader.readAsText(file);
  }

  const clearFile = () => {
    let file: any = fileRef.current
    file.value = ''
  }

  const renderEl = () => {
    return <div >
      <div className='flex-center'>
        <button className='ocr-upload-button'>上传文件</button>
      </div>
      <p className="ant-upload-text">单击或拖动到此区域上传，仅支持 txt 格式，文件大小不超过10M。</p>
    </div>
  }

  const reupload = () => {
    // setFileContent('')
    fileRef.current.click()
  }

  const reset = () => {
    setFileContent('')
  }

  return (
    <>
      <div className='common-uploadfile-container variable-file-content-container'>
        <div style={{ display: value ? 'block' : 'none' }}>
          <div className='flex-center image-box' style={{ alignItems: 'flex-start' }}>
            <Form.Item name={name} noStyle>
              <TextArea
                placeholder=""
                disabled
                className="flow-var-file-content-text"
                autoSize={{ minRows: 3, maxRows: 7 }}
              />
            </Form.Item>&nbsp;&nbsp;
            <div className='flex-center' style={{ flexDirection: 'column' }}>
              <Button onClick={() => reupload()} style={{ marginBottom: '10px' }}>重新上传</Button>
              <Button onClick={() => reset()} danger style={{ width: '80px' }}>重置</Button>
            </div>
          </div>
        </div>
        <div style={{ display: !value ? 'block' : 'none' }}>
          <div className={`ocr-upload flex-center `} >
            {/* 上传 */}
            <input type="file" name="file" id="file" ref={fileRef} accept=".txt" className='ocr-upload-input' onChange={uploadChange} />
            {
              renderEl()
            }
          </div>
        </div>
      </div>
    </>
  );
}

export default Project
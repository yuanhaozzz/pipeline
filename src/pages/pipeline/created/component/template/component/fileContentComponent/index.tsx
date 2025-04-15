import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { message, Form } from 'antd'
import { LoadingOutlined, PlusOutlined, EyeOutlined, DeleteOutlined, FileDoneOutlined } from '@ant-design/icons';
import { getUrlParams } from '@/utils'
import './style.less'

interface Props {
  update(): any
  disabled?: boolean
  styleType?: number
  img?: string
}
function Project(props: Props, ref) {
  const { update = () => { }, disabled = false, styleType = 1, img } = props
  const [imageUrl, setImageUrl] = useState<string>('');
  const query = getUrlParams()
  const [loading, setLoading] = useState(false);

  const [fileName, setFileName] = useState('')

  const fileRef = useRef(null)
  const jsonValueRef: any = useRef('')

  const [form] = Form.useForm();

  // useEffect(() => {
  //   if (img) {
  //     const s = img.split('/')
  //     const str = s[s.length - 1].split('_')
  //     str.shift()
  //     setFileName(str.join(''))
  //   }
  // }, [img])

  useImperativeHandle(ref, () => ({
    getImage,
    setImage,
    checkUploading
  }))

  useEffect(() => {
    setImageUrl(img)
  }, [img])

  const checkUploading = () => {
    console.log(loading)
    return loading
  }

  const viewImage = () => {

    window.open(imageUrl)
  }

  const setImage = (url) => {
    setImageUrl(url)
  }

  const getImage = async () => {
    await form.validateFields()
    return imageUrl
  }


  const remove = async () => {
    if (query.view === '1') {
      return
    }
    jsonValueRef.current = ''
    setImageUrl('')
    update()
    await form.validateFields()

  }

  const clearFile = () => {
    // var file: any = document.querySelector("#file") 
    let file: any = fileRef.current
    file.value = ''
    setLoading(false)
  }

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

  const uploadChange = async () => {
    if (loading) {
      message.error('请不要重复上传')
      return
    }
    setLoading(true)
    let file: any = fileRef.current.files[0];
    if (!file) {
      setLoading(false)
      return
    }
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
    setFileName(file.name)
    try {

      // var formData = new FormData();
      // formData.append("file", file);
      // // 请求文件
      // const data: any = await uploadFile(formData)

      const reader = new FileReader();
      reader.onload = async function (e) {
        const v = e.target.result;
        jsonValueRef.current = v
        await form.validateFields()
        setImageUrl(v)
      };
      reader.readAsText(file);

      setLoading(false)
      update()

    } catch (error) {
      // clearRightContent()
      message.error('上传失败，请重新上传..')
      clearFile()
      update()
    }
  }

  const renderEl = () => {
    switch (styleType) {
      default:
        return <div >
          <div className='flex-center'>
            <button className='ocr-upload-button'>{loading ? <span><LoadingOutlined /> 上传中...</span> : '上传文件'}</button>
          </div>
          <p className="ant-upload-text">单击或拖动到此区域上传，支持 json 格式，文件大小不超过10M。</p>
        </div>
    }
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

  return (<div className='common-uploadfile-container'>
    <Form form={form} name="control-hooks" layout="vertical">
      <Form.Item name="content" label="" rules={[{ validator }]}>


        {
          imageUrl ? <div className='flex-center image-box' >
            {/* <img src={imageUrl} className='image' /> */}
            <div style={{ textAlign: 'center' }}>
              <FileDoneOutlined style={{ fontSize: '50px', marginBottom: '10px' }} />
              <div>{fileName}</div>
            </div>
            <div className='image-layer flex-center'>
              <div>
                {/* <EyeOutlined style={{ fontSize: '20px' }} onClick={() => viewImage()} /> */}
                {!disabled && <>
                  &nbsp;&nbsp;&nbsp;
                  <DeleteOutlined style={{ fontSize: '20px' }} onClick={() => remove()} /></>}
              </div>
            </div>
          </div> : <div className={`ocr-upload flex-center ${styleType === 2 && 'common-upload-style-2'} ${disabled && 'disabled-upload'}`}>
            {/* 上传 */}
            <input type="file" name="file" id="file" ref={fileRef} accept=".json" className='ocr-upload-input' onChange={uploadChange} disabled={disabled || loading} />
            {
              renderEl()
            }

          </div>
        }
      </Form.Item>
    </Form>
  </div>
  );
}

export default forwardRef(Project)
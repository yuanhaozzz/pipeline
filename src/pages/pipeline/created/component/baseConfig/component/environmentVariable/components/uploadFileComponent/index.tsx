import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { message } from 'antd'
import { LoadingOutlined, PlusOutlined, EyeOutlined, DeleteOutlined, FileDoneOutlined } from '@ant-design/icons';
import { getUrlParams } from '@/utils'
import './style.less'
import { send } from './service'
import { uploadFile } from './service'

interface Props {
  update(): any
  getImageUrl?(url: string): any
  disabled?: boolean
  styleType?: number
  img?: string
}
function Project(props: Props, ref) {
  const { update = () => { }, disabled = false, styleType = 1, getImageUrl = () => { }, img } = props
  const [imageUrl, setImageUrl] = useState<string>();
  const query = getUrlParams()
  const [loading, setLoading] = useState(false);

  const [fileName, setFileName] = useState('')

  const fileRef = useRef(null)

  useEffect(() => {
    if (img) {
      const s = img.split('/')
      const str = s[s.length - 1].split('_')
      str.shift()
      setFileName(str.join(''))
    }
  }, [img])

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

  const getImage = () => {
    return imageUrl
  }


  const remove = () => {
    if (query.view === '1') {
      return
    }
    setImageUrl('')
    getImageUrl('')
    update()
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
      csv: true,
      txt: true,
      xlsx: true,
      // docx: true
      pdf: true,
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
    // var file: any = (document.querySelector("#file") as any).files[0];
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
      let formData = new FormData();
      formData.append("file", file);
      // 请求文件
      const data: any = await uploadFile(formData)
      // debugger
      setImageUrl(data.url)
      getImageUrl(data.url)
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
          <p className="ant-upload-text">单击或拖动到此区域上传，支持 txt、xlsx、pdf、csv 格式，文件大小不超过10M。</p>
        </div>
    }
  }

  return (<div className='common-uploadfile-container'>
    {
      imageUrl ? <div className='flex-center image-box' >
        {/* <img src={imageUrl} className='image' /> */}
        <div style={{ textAlign: 'center' }}>
          <FileDoneOutlined style={{ fontSize: '50px', marginBottom: '10px' }} />
          <div>{fileName}</div>
        </div>
        <div className='image-layer flex-center'>
          <div>
            <EyeOutlined style={{ fontSize: '20px' }} onClick={() => viewImage()} />{!disabled && <>&nbsp;&nbsp;&nbsp;<DeleteOutlined style={{ fontSize: '20px' }} onClick={() => remove()} /></>}
          </div>
        </div>
      </div> : <div className={`ocr-upload flex-center ${styleType === 2 && 'common-upload-style-2'} ${disabled && 'disabled-upload'}`}>

        {/* 上传 */}
        <input type="file" name="file" id="file" ref={fileRef} accept=".txt,.xlsx,.pdf,.csv" className='ocr-upload-input' onChange={uploadChange} disabled={disabled || loading} />
        {
          renderEl()
        }

      </div>
    }
  </div>
  );
}

export default forwardRef(Project)
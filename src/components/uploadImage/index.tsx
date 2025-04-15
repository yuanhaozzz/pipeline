import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { message } from 'antd'
import { LoadingOutlined, PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const { update = () => { }, disabled = false, styleType = 1, getImageUrl = function () { }, img } = props
  const [imageUrl, setImageUrl] = useState<string>();
  const query = getUrlParams()
  const [loading, setLoading] = useState(false);

  const fileRef = useRef(null)

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
      jpg: true,
      jpeg: true,
      png: true,
      // gif: true,
      jfif: true,
      JPG: true,
      JPEG: true,
      PNG: true,
      JFIF: true,
    }
    const extSplit = name.split('.')
    const ext: any = extSplit[extSplit.length - 1]
    return map[ext]
  }

  const uploadChange = async () => {
    // debugger
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
      message.error('格式仅支持png、jpg')
      clearFile()
      return
    }
    const limitSize = file.size / 1024 / 1024
    // 低于5M
    if (limitSize > 5) {
      message.error('请上传的文件小于5M')
      clearFile()
      return
    }

    try {
      let formData = new FormData();
      formData.append("file", file);
      // 请求图片
      const data: any = await uploadFile(formData)
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
      case 2:
        return <div className='style-2' style={{ color: loading ? '#1890ff' : '#000' }}>
          {loading ? <LoadingOutlined style={{ fontSize: '15px' }} /> : <PlusOutlined />}
          <div style={{ marginTop: '5px' }}>上传图片</div>
        </div>
      default:
        return <div >
          <div className='flex-center'>
            <button className='ocr-upload-button'>{loading ? <span><LoadingOutlined /> 上传中...</span> : '上传图片'}</button>
          </div>
          <p className="ant-upload-text">单击或拖动到此区域上传，支持PNG、JPG、JPEG格式，图片大小不超过5M。</p>
        </div>
    }
  }

  return (<div className='common-uploadImage-container'>
    {
      imageUrl ? <div className='flex-center image-box' >
        <img src={imageUrl} className='image' />
        <div className='image-layer flex-center'>
          <div>
            <EyeOutlined onClick={() => viewImage()} />{!disabled && <>&nbsp;&nbsp;&nbsp;<DeleteOutlined onClick={() => remove()} /></>}
          </div>
        </div>
      </div> : <div className={`ocr-upload flex-center ${styleType === 2 && 'common-upload-style-2'} ${disabled && 'disabled-upload'}`}>

        {/* 上传 */}
        <input type="file" name="file" id="file" ref={fileRef} accept="image/jpg,image/jpeg,image/png" className='ocr-upload-input' onChange={uploadChange} disabled={disabled || loading} />
        {
          renderEl()
        }

      </div>
    }
  </div>
  );
}

export default forwardRef(Project)
import { message } from 'antd'
import { uploadFile } from './service'


class MyUploadAdapter {
  xhr: any
  loader: any
  constructor(loader: any) {
    this.loader = loader;
  }

  vaildExt(name: string) {
    const map: any = {
      jpg: true,
      jpeg: true,
      png: true,
      gif: true,
      jfif: true,
      JPG: true,
      JPEG: true,
      PNG: true,
      JFIF: true,
      GIF: true,
    }
    const extSplit = name.split('.')
    const ext: any = extSplit[extSplit.length - 1]
    return map[ext]
  }

  getImageWidth(url: any) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = url
      img.onload = function () {
        resolve(img.width)
      }
    })
  }

  upload() {
    return this.loader.file
      .then((file: any) => new Promise(async (resolve, reject) => {
        if (!this.vaildExt(file.name)) {
          message.error('格式仅支持png、jpg、jpeg、gif')
          reject()
          return
        }
        const limitSize = file.size / 1024 / 1024
        // 低于5M
        if (limitSize > 5) {
          message.error('请上传的文件小于5M')
          reject()
          return
        }
        let formData = new FormData();

        formData.append("file", file);
        // formData.append("timestamp", Date.now() as any);
        try {
          const data = await uploadFile(formData)
          const width: any = await this.getImageWidth(data.url)
          const obj = {}
          obj[width] = data.url
          resolve(obj)
        } catch (error) {
          reject()
        }

      }));
  }

  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

}

export function MyCustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    return new MyUploadAdapter(loader);
  };
}
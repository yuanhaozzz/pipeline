import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
// import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
// import DecoupledEditor from 'ckeditor5-custom-build/build/ckeditor';
// import DecoupledEditor from '../../../ckeditor5/build/ckeditor';
// import DecoupledEditor from 'ckeditor5-suiyuan';
import { useIntl } from 'umi';
import DecoupledEditor from 'ckeditor5-suiyuan-test';
import { toolbar, simpleToobar, heading, fontSize, fontColor, fontBackgroundColor, tableProperties, tableCellProperties } from './config'

import './style.less'
import { getTableTemplate, getDefaultTemplate, uploadFile } from './service'
import { MyCustomUploadAdapterPlugin } from './uplaod'
import { message, Spin } from 'antd';
import { transformFile } from '@/utils'


interface Props {
  content: string
  title: string
  hideTitle?: boolean
  onChange?(value: string): void
  changeTitle?(value: string): void
  disabled?: boolean
  isSimple?: boolean // 是否是简单模式
}

const Editor = (props: Props, ref: any) => {
  const intl = useIntl();
  const { content = '', title, hideTitle = false, onChange, changeTitle, disabled = false, isSimple = false } = props
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const [showLayer, setLayer] = useState(false)
  const [titleInput, setTitleInput] = useState<any>('')
  const [template, setTemplate] = useState<string>('')
  const [showTextarea, setShowTextarea] = useState(false)

  const placeholderRef = useRef<any>(null)
  const editorRef = useRef<any>(null)
  const textareaRef = useRef<any>(null)
  const variableRef = useRef<any>({})

  useImperativeHandle(ref, () => ({
    getValue,
    setValue,
    setTemplateData
  }))


  useEffect(() => {
    variableRef.current.pasteImageMap = {};
    return () => {
      // (document.querySelector('.ck-content') as any).removeEventListener('paste', paste)
    }
  }, [])

  useEffect(() => {
    init()
  }, [content, editorInstance])

  useEffect(() => {
    setTitleInput(title)
  }, [title, editorInstance])

  useEffect(() => {
    if (editorRef.current && editorRef.current.editorCK) {
      editorRef.current.titleInput = titleInput
    }
  }, [titleInput, editorInstance])



  const init = async () => {
    if (editorRef.current && editorRef.current.editorCK) {
      // 优先内容 => 模板
      if (content) {
        setValue(content)
      } else {
        // const { data } = await getTableTemplate()
        // setValue(data.report_template)
      }
    }
  }

  const paste = (e: any) => {
    if (!(e.clipboardData && e.clipboardData.items)) {
      return;
    }
    const clipboardDataItems = [...e.clipboardData.items]
    const isFile = clipboardDataItems.find(item => item.kind === "file")
    if (isFile && clipboardDataItems.length >= 2) {
      const file = isFile.getAsFile()
      const str = clipboardDataItems.find(item => item.kind === "string")
      // str.getAsString(key => {
      //   console.log(key, '-------------------------')
      // })
      if (str && str.type.match('^text/html')) {
        str.getAsString(key => {
          console.log(key, '-------------------------')
          if (key) {
            const image = (key.match(/src=".*?"/) as any)[0]
            const value = image?.substring(5, image.length - 1)
            console.log(value)
            if (value.includes('.enflame.cn') && !value.includes('10.12.110.200:8080')) {
              variableRef.current.pasteImageMap[value] = file
            }
          }
        })
      }
    }
    e.preventDefault()
  }

  const handleString = (str: string) => {
    // const col = 'col'
    // let index = 0
    // let 
    // for (var i = 0; i < str.length; i++) {
    //   const value = str[i]


    //   if (value === col[index]) {
    //     index++
    //   } else {
    //     if (index === col.length - 1) {

    //     } else {
    //       index = 0
    //     }
    //   }
    // }
  }

  // const handleTagCol = (value: string) => {

  // }

  const getTemplate = async () => {
    const { data } = await getTableTemplate()
    setTemplate(data.report_template)
  }

  const setTemplateData = async () => {
    try {
      const { data } = await getDefaultTemplate({})
      const { content: value } = await getValue()
      setValue((data || '') + value)
      message.success(intl.formatMessage({ id: 'pages.reportManage.templateAddsucc' }))
    } catch (error) {
      console.log(error)
    }
  }

  const handleTagCol = (str: string) => {
    const tag = str.match(/<col\s.*?>/g)
    if (tag) {
      tag.forEach((item) => {
        let value = item
        const style = value.match(/style=".*?;/)
        if (style) {
          value = `<td ${style[0]}border: none;background-color:#fff;\">`
        }
        str = str.replace(item, value)
      })
    }
    return str
  }

  // const handleColgroup = (str: string) => {
  //   const tag = str.match(/<colgroup>/g)
  //   if (tag) {
  //     tag.forEach((item) => {
  //       let value = item
  //       value = value.replace(/colgroup/, 'tr style=\"background-color: #fff;\" ')
  //       str = str.replace(item, value)
  //     })
  //   }
  //   return str.replace(/colgroup>/g, 'tr>')
  // }

  const handleColgroup = (str: string) => {
    return str.replace(/<colgroup /g, '<tr style=\"background-color: #fff;\"').replace(/colgroup>/g, 'tr>')
  }

  const showPlaceholder = (status: boolean) => {
    placeholderRef.current.style.display = status ? 'block' : 'none'
  }

  const replaceImage = (str: any) => {
    const imgs = document.querySelectorAll('.ck-content img')
    const regex = /<img.*?>/g;
    const strImgs = str?.match(regex);
    try {
      imgs.forEach((img, index) => {
        let imgWidth = parseInt(getComputedStyle(img).width)
        if (imgWidth > 500) {
          imgWidth = 500
        }
        const srcImg = decodeURIComponent(img.src)
        const imgSplit = img.srcset.split(' ')
        let srcFilterEmpty = imgSplit[0]
        if (imgSplit.length > 2) {
          srcFilterEmpty = imgSplit.slice(0, imgSplit.length - 1).join(' ')
        }
        const newImg = `<img src="${srcFilterEmpty || srcImg}" sizes="100vw" width="${imgWidth}">`

        // 匹配url
        const strSrcsetReg = /(srcset|src)="(.*?)"/;
        const strSrcset = strImgs[index].match(strSrcsetReg) ? strImgs[index].match(strSrcsetReg)[2] : '';
        const imgSrcset = img.srcset || srcImg
        if (strSrcset === imgSrcset) {
          str = str.replace(strImgs[index], newImg)
        }
      })
      return str
    } catch (error) {
      console.log(error)
    }
  }

  const getValue = async () => {
    const content = editorRef.current?.getData()
    let title = editorRef.current?.titleInput
    const filterContent = await handleImage(content)
    return {
      content: replaceImage(filterContent),
      title
    }
  }

  const filterImage = (img: any, str: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        // const file = await transformFile(img)
        const { file, origin } = img
        let formData = new FormData();
        formData.append("file", file);
        const data = await uploadFile(formData)
        resolve({
          origin,
          url: data.url
        })
      } catch (error) {
        reject()
      }
    })
  }

  const handleImage = (str: string) => {
    return new Promise(resolve => {
      // const imgArr = str.match(/<img\s.*?>/g)
      // imgArr?.forEach((img) => {
      //   if (img.includes('.enflame.cn') && !img.includes('10.12.110.200:8080')) {
      //     const image = (img.match(/src=".*?"/) as any)[0]
      //     const imageStr = image?.substring(5, image.length - 1)
      //     imageAll.push(filterImage(imageStr, str))
      //     // str = filterImage(img, str)
      //   }
      // })
      const imageAll: any = []
      variableRef.current?.pasteImageMap && Object.keys(variableRef.current?.pasteImageMap).forEach(url => {
        const map = variableRef.current?.pasteImageMap
        imageAll.push(filterImage({ origin: url, file: map[url] }, str))
      })

      Promise.all(imageAll).then((res: any) => {
        res.forEach((imgObj: any) => {
          const { origin, url } = imgObj
          str = str.replace(origin, url)
        })
        resolve(str)
      }).catch(() => {
        resolve(str)
      })
    })
  }

  const setValue = (value: string) => {
    editorRef.current?.setData(value)
  }

  const titleFocus = () => {
    setLayer(true)
  }

  const titleBlur = () => {
    setLayer(false)
  }

  const titleChange = (e: any) => {
    const { value } = e.target
    setTitleInput(value)
    changeTitle && changeTitle(value)
  }

  const titleKeydown = (e: any) => {
    const { keyCode, target } = e
    if (keyCode == 13) {
      target.blur()
      const container = editorRef.current.ui.getEditableElement()
      container.focus()
    }
  }

  const textareaChange = async () => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";


  }

  const renderInput = () => {
    return <div className='editor-title-input' >
      {
        showTextarea
          ?
          <textarea rows={1} placeholder={intl.formatMessage({ id: 'pages.reportManage.reportTitlePlaceholder' })} onFocus={() => titleFocus()} ref={textareaRef} onBlur={() => {
            titleBlur()
            setShowTextarea(false)

          }} onInput={textareaChange} value={titleInput} onChange={titleChange} onKeyDown={titleKeydown} />
          :
          <input placeholder={intl.formatMessage({ id: 'pages.reportManage.reportTitlePlaceholder' })} onFocus={() => {
            titleFocus()
            setShowTextarea(true)
            setTimeout(() => {
              textareaRef.current.focus()
              textareaChange()
            }, 100);
          }} onBlur={() => titleBlur()} value={titleInput} onChange={titleChange} onKeyDown={titleKeydown} />
      }
    </div>
  }

  const onReday = (editor: any) => {
    const container = editor.ui.getEditableElement()
    // container.parentElement.insertBefore(
    //   editor.ui.view.toolbar.element,
    //   container
    // );
    editor.editorCK = true
    editor.editorScrollContainer = document.querySelector('.editor-title-input textarea')
    editorRef.current = editor
    setEditorInstance(editor)
    // 滚动事件，控制标题输入框显示隐藏
    container.addEventListener('scroll', () => {
      const scrollTop = container.scrollTop
      try {
        if (scrollTop > 40) {
          editorRef.current.editorScrollContainer.style.display = 'none'
        } else {
          editorRef.current.editorScrollContainer.style.display = 'block'
        }
      } catch (error) {
      }
    })
  }

  const change = (event: any, editor: any) => {
    const value = editor.getData();
    onChange && onChange(value)
  }

  return (
    <div className="common-editor-wrap" ref={variableRef} >
      {/* 图片上传loading */}
      <div className='common-editor-upload-loading-container'>
        <div className='box flex-center'>
          <Spin tip="图片上传中，请勿提交以免图片丢失" size='large'>
          </Spin>
        </div>
      </div>
      <div className={`${!hideTitle && 'show-title'}`}>
        <CKEditor
          editor={DecoupledEditor}
          data={content}
          disabled={disabled}
          config={{
            // plugins: [Image],
            // removePlugins: ["ImageStyle", "ImageToolbar", "ImageCaption", "ImageResize"],
            removePlugins: ["ImageStyle", "ImageToolbar", "ImageCaption", 'Title', 'Code', "CodeBlock", 'Superscript', 'Subscript'],
            // 'TableProperties', 'TableCaption', 'TableCellProperties'
            toolbar: isSimple ? simpleToobar : toolbar,
            heading,
            extraPlugins: [MyCustomUploadAdapterPlugin],
            fontSize,
            fontColor,
            fontBackgroundColor,
            // tableBorderColor: [
            //   {
            //     value: '#000'
            //   }
            // ],
            table: {
              tableProperties,
              tableCellProperties
            }
            // tableBackgroundColor: [
            //   {
            //     value: '#000'
            //   }
            // ]
            // updateSourceElementOnDestroy: true
          }}
          onReady={editor => {
            document.querySelector('.ck-content') && (document.querySelector('.ck-content') as any).addEventListener('paste', paste)
            onReday(editor)
            // textareaChange()
          }}
          onFocus={() => {
          }}
          onBlur={() => {
            // setTimeout(() => {
            // }, 0)
          }}
          onChange={change}
          onError={(error, { willEditorRestart }) => {
            if (willEditorRestart) {
              editorRef.current.ui.view.toolbar.element.remove();
            }
          }}
          ref={editorRef}
        />
      </div>
      {/* input输入框 */}
      {
        !hideTitle && renderInput()
      }
      {/* 遮挡物 */}
      {
        showLayer && <div className='layer'></div>
      }
    </div>
  );
}

export default forwardRef(Editor);


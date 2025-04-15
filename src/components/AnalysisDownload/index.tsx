import React, { useEffect, useState } from 'react';
import { Tooltip, message, Button } from 'antd'
import { DownloadOutlined, FileTextOutlined } from '@ant-design/icons'

import './style.less'
import { downloadImage } from '@/utils'
import { useIntl } from 'umi';


interface Props {
  downloadCanvasRef: any
  name: string
  params: any
  org1: any
  org2?: any
  data?: {
    tableTitle: string[],
    value: any[],
    leftTitle?: string[],
  }
}

function Project(props: Props) {
  const { downloadCanvasRef, name, params, org1, org2, data } = props

  const [show, setShow] = useState(false)

  // if (data) {
  //   debugger
  // }


  const intl = useIntl();

  const download = () => {
    if (!downloadCanvasRef.current) {
      message.error(intl.formatMessage({ id: 'pages.empty' }))
      return
    }
    const img = downloadCanvasRef.current.getChart().toDataURL('image/png')
    const createImage = new Image()
    createImage.src = img
    createImage.onload = function () {
      const { width, height } = createImage
      const canvas = document.createElement('canvas')
      const canvasHeight = height + 60
      const canvasWidth = width + 100
      canvas.width = canvasWidth
      canvas.height = canvasHeight
      const ctx: any = canvas.getContext('2d')
      ctx.save()
      // 背景
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      // 图片
      ctx.drawImage(createImage, 50, 50, width, height)
      ctx.restore()
      // 标题
      ctx.save()
      ctx.font = 'bold 24px Arial'
      ctx.textAlign = 'center';
      ctx.fillText(name, canvasWidth / 2, 35);
      ctx.restore()
      ctx.save()
      // 日期
      const { startDate, endDate } = params
      ctx.font = '14px Arial'
      ctx.fillText(`${startDate} ~ ${endDate}`, canvasWidth - 200, 35);
      // 部门
      if (org1 !== undefined) {
        ctx.fillText(`Entity：${org1 || intl.formatMessage({ id: 'pages.AllCompany' })}     ${org2 === undefined ? '' : `Function：${org2 || intl.formatMessage({ id: 'pages.All' })}`}`, 20, 35);
      }
      ctx.restore()

      // 下载图片
      downloadImage(canvas, 'image/jpeg', name)
    }
  }

  const renderDefaultData = (title) => {
    let value = title.replace('（', '|').replace('）', '').split('|')
    return (
      value.map(v => (
        <td align='center' style={{ whiteSpace: 'nowrap' }}>{v}</td>
      ))
    )
  }

  const renderDefaultDataTh = (title) => {
    return <th style={{ whiteSpace: 'nowrap' }} colSpan={2}>{title}</th>
  }

  return (
    <div className='common-analysis-download-container'>
      {
        data && data.tableTitle?.length ? <Tooltip title={intl.formatMessage({ id: 'pages.reportManage.reportAnalysis.hr.DataView' })}>
          <FileTextOutlined className='button' onClick={() => setShow(!show)} />
        </Tooltip> : <></>
      }
      &nbsp;&nbsp;
      <Tooltip title={intl.formatMessage({ id: 'pages.reportManage.reportAnalysis.hr.SaveAsImage' })}>
        <DownloadOutlined className='button' onClick={() => download()} />
      </Tooltip>
      {/* 数据视图 */}
      {
        show && <div className='analysis-data'>
          <div className='analysis-data-content common-scroll-bar'>
            <table onClick={(e: any) => e.stopPropagation()} border={1}>
              <thead>
                <tr>
                  {
                    data.tableTitle?.length > 0 && <th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                  }
                  {
                    data.tableTitle?.map(title => {
                      if (data.type === undefined) {
                        return renderDefaultDataTh(title)
                      }
                      return <th style={{ whiteSpace: 'nowrap' }}>{title}</th>
                    })
                  }
                </tr>
              </thead>
              <tbody>
                {
                  data.value.map((item: any, index: number) => (
                    <tr>
                      <td style={{ whiteSpace: 'nowrap' }}>{data?.leftTitle && data.leftTitle[index]}</td>
                      {
                        data?.value[index]?.map(title => {
                          if (data.type === undefined) {
                            return renderDefaultData(title)
                          }
                          return <td align='center' style={{ whiteSpace: 'nowrap' }}>{title}</td>
                        })
                      }
                    </tr>
                  ))
                }
              </tbody>
            </table>
            {
              !data.tableTitle || data.tableTitle?.length <= 0 && <div className='flex-center'>{intl.formatMessage({ id: 'pages.empty' })}</div>
            }

          </div>
          <Button className='close' onClick={() => setShow(false)}>{intl.formatMessage({ id: 'pages.close' })}</Button>
        </div>
      }

    </div>
  );
}

export default Project 
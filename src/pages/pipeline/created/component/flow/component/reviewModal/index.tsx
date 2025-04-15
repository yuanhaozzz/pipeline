import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

// import { Modal, DatePicker, Select, Empty, Button, Form, Input } from 'antd'
import { Modal, Form, Select, Input, Button, Radio, message, TimePicker, DatePicker } from 'antd'
import { getReviewInfoApi, reviewStateApi } from './service'
import './style.less'
import { WarningOutlined, createFromIconfontCN, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons'

import { useModel } from 'umi';
import moment from 'moment'
import { formatHour } from '@/utils'
import Loading from '@/components/loading'

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_4376956_po55h0nn5k.js',
});
const { TextArea } = Input;
function LoadModal(props: any, ref: any) {
  const { type, config, onValuesChange } = props
  const [modal, setModal] = useState(false)
  const [value, setValue] = useState('')
  const [comment, setComment] = useState('')
  const [record, setRecord] = useState<any>({})
  const [load, setLoad] = useState(true)
  const [buttonLoading, setButtonLoading] = useState(false)

  const [reviewData, setReviewData] = useState<any>({})

  const variableRef = useRef(null)
  const [form] = Form.useForm();

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  useImperativeHandle(ref, () => ({
    open
  }))

  useEffect(() => {
    if (variableRef.current) {
      try {
        const { stageIndex, jobIndex, stepIndex } = variableRef.current
        if (stageIndex === undefined || jobIndex === undefined || stepIndex === undefined) {
          return
        }
        const data = config.template[stageIndex].jobs[jobIndex].tasks[stepIndex]
        setRecord({ ...data })
      } catch (error) {
        console.log(error)
      }
    }
  }, [config])

  useEffect(() => {
    if (record.status === 'manual_confirm') {
      if (variableRef.current) {
        if (variableRef.current.reviewInfoApiRun === false) {
          handleRepeatApi()
        }
        variableRef.current.reviewInfoApiRun = true
      }
    } else {
      if (variableRef.current) {
        variableRef.current.reviewInfoApiRun = false
      }
    }
  }, [record])

  const handleRepeatApi = () => {
    getReviewInfo()
    setTimeout(() => {
      if (variableRef.current.reviewInfoApiRun) {
        handleRepeatApi()
      }
    }, 1000);
  }

  const open = (record: any) => {
    setModal(true)
    getReviewInfo(record)
    setRecord(record)
    setTimeout(() => {
      variableRef.current.reviewInfoApiRun = false
      // 记录当时点击弹窗位置
      variableRef.current.stageIndex = record.stageIndex
      variableRef.current.jobIndex = record.jobIndex
      variableRef.current.stepIndex = record.stepIndex
    }, 0);
  }


  const timePickerChange = (v) => {
    // form.setFieldValue('confirm_expire', moment(v))
  }

  const validatorReason = (info, value) => {
    const opinions = form.getFieldValue('opinions')
    if (opinions === 2 && !value) {
      return Promise.reject('请输入理由')
    }
    return Promise.resolve()
  }


  const getReviewInfo = async (r?) => {
    try {
      const { data } = await getReviewInfoApi({
        user_ids: (r || record)?.variables?.users.map(item => {
          return item.user_id
        }).join(',')
      }, (r || record).logId)
      setReviewData({ ...data })
      setLoad(false)
    } catch (error) {

    }
  }

  const onCancel = () => {
    if (variableRef.current) {
      variableRef.current.reviewInfoApiRun = null
    }
    setModal(false)
    setValue('')
  }



  const summit = () => {

  }

  const isOperate = () => {
    const approveInfo = reviewData.approve_info || []

    const expired = reviewData.expired_at * 1000
    const nowDate = Date.now()
    // 接口状态、Task 状态、倒计时隐藏按钮
    if (reviewData.result !== 'PENDING' || record.status !== 'manual_confirm' || nowDate >= expired - 500) {
      return false
    }
    const findInfo = approveInfo.find(item => item.user_id === currentUser.username)
    if (findInfo && findInfo.state === 'PENDING') {
      return true
    }
  }

  const renderTitle = () => {
    const status = reviewData.result
    let title = ''
    if (config?.status === 'pending') {
      title = '待操作'
    }
    if (status === 'PENDING') {
      title = "操作中"
    } else {
      title = "人工操作结果"
    }
    return <div style={{ fontSize: '12px', fontWeight: 'bold' }} >{title}</div>
  }

  const reject = async () => {
    if (!value) {
      message.error('请填写原因')
      return
    }
    handleSubmit(false)
  }

  const pass = async () => {
    handleSubmit(true)
  }
  const handleSubmit = async (status) => {
    try {
      setButtonLoading(true)
      const params = {
        task_run_info_id: record.logId,
        user_id: currentUser.username,
        reason: value,
        state: status ? 'PASS' : 'REJECT',
      }
      await reviewStateApi(params, record.logId)
      getReviewInfo()
      message.success('操作成功')
      onCancel()
    } catch (error) {
      console.log(error)
    } finally {
      setButtonLoading(false)
    }
  }

  const handleStatus = () => {
    return reviewData.result === 'PENDING' && (record.status === 'pending' || record.status === 'running' || record.status === 'manual_confirm')
  }

  const renderTips = () => {
    return <div className='review-tips flex-start'><IconFont type="icon-ai43" style={{ color: '#ee9900', fontSize: '18px', marginTop: '-1px' }} />&nbsp;流水线【{config.name}】，当前任务进入人工阶段</div>
  }

  const renderStatusIcon = (state) => {
    let icon = <div className='status-pending' ></div>
    switch (state) {
      case 'PASS':
        icon = <CheckCircleOutlined style={{ color: '#4dcb4f' }} />
        break
      case 'REJECT':
      case 'TIMEOUT':
        icon = <CloseCircleOutlined style={{ color: '#e23f3c' }} />
        break
    }

    return <div className='item-box' style={{ width: '15px' }}>{icon}</div>
  }



  const renderApproved = () => {
    const approveInfo = reviewData.approve_info || []
    // "user_id": "tristan.niu",
    // "state": "PENDING",
    // "display_name": "牛德利",
    // "reason": ""
    if (approveInfo.length <= 0) {
      return <></>
    }
    return <div className='review-approved'>
      <p className='review-approved-title'>{handleStatus() ? '正在等待以下成员操作' : '成员操作记录'}：</p>
      <ul className='review-approved-list'>
        {
          approveInfo.map(item => (
            <li className='flex-start'>
              {renderStatusIcon(item.state)}
              <div className='item-box' >{item.display_name}</div>
              <div className='item-box' style={{ flex: 1, color: '#333', wordBreak: 'break-all' }}>{item.reason && <>{item.reason}</>}</div>
              {/* <div>操作状态：{renderReviewText(item.state)}</div> */}
            </li>
          ))
        }
      </ul>
    </div>
  }

  const handleCountdown = (started_at?) => {
    const targetDate = moment(started_at || 0); // 设置目标日期时间
    const now = moment(); // 获取当前时间

    const diff = targetDate.diff(now); // 计算时间差

    const duration = moment.duration(diff); // 转换为持续时间

    const days = duration.days().toString().padStart(2, '0'); // 剩余天数，自动补 0
    const hours = duration.hours().toString().padStart(2, '0'); // 剩余小时数，自动补 0
    const minutes = duration.minutes().toString().padStart(2, '0'); // 剩余分钟数，自动补 0
    const seconds = duration.seconds().toString().padStart(2, '0'); // 剩余秒数，自动补 0

    function format(v) {
      return v <= 0 ? '00' : v
    }

    return `${format(days)} 天 ${format(hours)} 小时 ${format(minutes)} 分钟 ${format(seconds)} 秒`
  }

  const setTime = () => {
    return <>
      {handleCountdown(reviewData.expired_at * 1000 || 0)}
    </>
  }

  const renderInstructions = () => {
    return <div className='review-instructions'>
      <p className='review-instructions-title'>操作说明：</p>
      <div>{record?.variables?.confirm_description || '-'}</div>
      {/* 剩余操作时间 */}
      {
        reviewData.expired_at > 0 && <div style={{ marginTop: '8px' }}>
          <div style={{ color: '#7F7F7F' }}>剩余操作时间：</div><span style={{ color: '#FF2262' }}>{setTime()}</span>
        </div>
      }

    </div>
  }

  const renderDescription = () => {
    return <div className='review-description'>
      <p>请参照以上说明操作相关结果，选择点击以下按钮完成操作:</p>
      <p>继续: 该人工操作任务成功，流水线继续执行</p>
      <p>终止: 该人工操作任务失败，流水线终止执行</p>
    </div>
  }

  const renderInput = () => {
    return <div className='review-input'>
      {/* <p className='review-input-title'>请参照以上说明操作相关结果，选择点击以下按钮完成操作:</p> */}
      <div>
        <TextArea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="终止/继续原因"
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
      </div>
    </div>
  }

  const renderResult = () => {
    let status = <div style={{ color: '#4dcb4f' }}>成功</div>
    switch (reviewData.result) {
      case 'REJECT':
        status = <div style={{ color: '#e23f3c' }}>失败</div>
        break
      case 'TIMEOUT':
        status = <div style={{ color: '#e23f3c' }}>超时</div>
        break
    }

    if (record.status !== 'pending' && record.status !== 'running' && record.status !== 'manual_confirm' && record.status !== 'success') {
      status = <div style={{ color: '#e23f3c' }}>失败</div>
    }
    return <div className='review-result'>
      <p className='review-result-title'>执行结果</p>
      {status}
    </div>
  }

  const renderButton = () => {
    const canceledText = record?.variables?.event === 'task' ? '取消' : '拒绝'
    const passText = record?.variables?.event === 'task' ? '完成' : '通过'
    return <div className='review-button flex-center'>

      {
        isOperate()
          ?
          <div>
            <Button type='primary' onClick={() => pass()} loading={buttonLoading}>{passText}</Button>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Button type='primary' danger onClick={() => reject()} loading={buttonLoading}>{canceledText}</Button>

          </div>
          :
          <Button type='primary' onClick={() => onCancel()}>关闭</Button>
      }
    </div>
  }

  const renderComment = () => {
    return <>
      {
        isOperate() && <div className='review-comment'>
          <div className='review-comment-title'>评论</div>
          <TextArea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="发布评论，评论信息可单独提交"
            autoSize={{ minRows: 3, maxRows: 5 }}
          />
          {/* 提交评论 */}
          <Button type='link' className='review-comment-submit'>提交</Button>
        </div>
      }
      {renderCommentList()}

    </>
  }

  const renderCommentList = () => {
    return <div className='review-comment-list'>
      <span style={{ color: '#7f7f7f' }}>暂无评论</span>
      <ul>
        <li className='flex-start comment-list-item'>
          {/* 头像 */}
          <div className='item-avatar flex-center'>
            <UserOutlined />
          </div>
          <div className='item-right'>
            <div className='flex-space-between item-right-info'>
              <div>姜子牙</div>
              <div>2024-04-07 13:50</div>
            </div>
            <div className='item-right-comment'>啊实打实大大阿三大苏打是</div>
          </div>
        </li>
      </ul>
    </div>
  }

  const renderContent = () => {
    return <>
      {/* 提示和结果 */}
      {
        handleStatus() && renderTips()
      }
      <div className='review-scroll common-scroll-bar'>
        {
          !handleStatus() && <>
            {renderResult()}
            {renderCommentList()}
          </>
        }

        {/* 审批人 */}
        {renderApproved()}
        {
          handleStatus() && <>
            {/* 说明 */}
            {renderInstructions()}
            {/* 评论 */}
            {renderComment()}
            {/* 描述 */}
            {renderDescription()}
          </>
        }

      </div>
      {
        handleStatus() && <>
          {/* 输入框 */}
          {isOperate() && renderInput()}
        </>
      }

      {/* 操作按钮 */}
      {renderButton()}
    </>
  }

  return (
    <div ref={variableRef}>
      <Modal className='flow-created-review-modal-container' title="" centered destroyOnClose={true} footer={null} open={modal} onCancel={onCancel} title={renderTitle()}>
        {
          load ? <Loading /> : renderContent()
        }

      </Modal>

    </div>
  );
}


export default forwardRef(LoadModal)
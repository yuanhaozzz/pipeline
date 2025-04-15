import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

// import { Modal, DatePicker, Select, Empty, Button, Form, Input } from 'antd'
import { Modal, Form, Select, Input, Button, Radio, message, TimePicker, DatePicker, Checkbox, Popover, Popconfirm, Tooltip, Alert } from 'antd'
import { getReviewInfoApi, reviewStateApi, getCommentApi, submitCommentApi, setRunVarApi, getRunVarApi, getVarContentApi, setDelayDateApi } from './service'
import './style.less'
import { WarningOutlined, createFromIconfontCN, LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons'

import { useModel } from 'umi';
import moment from 'moment'
import { formatHour } from '@/utils'
import Loading from '@/components/loading'
import { day, minute, hour } from '@/pages/pipeline/created/component/flow/component/configModal/component/stepConfig/component/review/data'
import { checkPipilineAuth } from '@/utils/menu'

const IconFont = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/c/font_4376956_po55h0nn5k.js',
});
const { TextArea } = Input;
function LoadModal(props: any, ref: any) {
  const { config: record } = props

  const [value, setValue] = useState('')
  const [comment, setComment] = useState('')
  // const [record, setRecord] = useState<any>({})
  const [load, setLoad] = useState(true)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [variable, setVariable] = useState([])
  const [popoverDisplay, setPopoverDisplay] = useState(false);

  const [reviewData, setReviewData] = useState<any>({})
  const [commentList, setCommentList] = useState([])
  const [commentSubmitLoading, setCommentSubmitLoading] = useState(false)

  const userValueList = useRef([])
  const variableRef = useRef({})
  const [form] = Form.useForm();
  const [formDelay] = Form.useForm();

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} } = initialState;

  const canceledText = record?.variables?.event === 'task' ? '取消' : '拒绝'
  const passText = record?.variables?.event === 'task' ? '完成' : '通过'

  useImperativeHandle(ref, () => ({
    open
  }))

  useEffect(() => {
    getReviewInfo()
    setTimeout(() => {
      variableRef.current.reviewInfoApiRun = false
    }, 0);
    form.setFieldValue('runtime_var', record?.variables?.runtime_var || [])
  }, [])

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

  const getComment = async () => {
    try {
      const { data } = await getCommentApi({}, record.logId)
      setCommentList(data)
    } catch (error) {
    }
  }

  const handleRepeatApi = () => {
    getReviewInfo()
    setTimeout(() => {
      if (variableRef.current?.reviewInfoApiRun) {
        handleRepeatApi()
      }
    }, 3000);
  }

  const getVarStrValue = (str) => {
    const regex = /\$\{([^}]*)\}/;
    const match = str.match(regex) || []
    const s = match[1] || ''
    return s.trim()
  }

  const getReviewInfo = async () => {
    try {
      getComment()
      getVar()

      let users: any = record?.variables?.users

      // 如果是字符串 需要 获取用户信息
      if (userValueList.current.length <= 0 && typeof users === 'string') {
        let { data: userData = [] } = await getVarContentApi({ key: getVarStrValue(users) }, record.logId)
        userData = userData || []
        users = userValueList.current = userData
      }

      if (userValueList.current.length > 0) {
        users = userValueList.current
      }


      if (Array.isArray(users)) {
        users = users.map(item => {
          return item.user_id
        }).join(',')
      }

      // 获取审核信息
      const params = {
        user_ids: users
      }

      const { data } = await getReviewInfoApi(params, record.logId)
      setReviewData({ ...data })
      setLoad(false)
    } catch (error) {

    }
  }

  const getVar = async () => {
    try {
      const { data } = await getRunVarApi({}, record.logId)
      setVariable(data)
    } catch (error) {
    }
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

  const reject = async () => {
    await form.validateFields()
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

      const varParams = await form.validateFields()


      await reviewStateApi(params, record.logId)
      // 设置运行时环境变量
      const varList = []
      varParams.runtime_var?.forEach(item => {
        item.scope = 'pipeline'
        // 1.不能出现在环境变量列表中 2 不能为空
        const findVar = variable.find(variableItem => item.key === variableItem.key && item.description === variableItem.description)
        item.value = item.value || ''
        if (!findVar && item.value.trim()) {
          varList.push(item)
        }
      })

      await setRunVarApi(varList, record.logId)
      getReviewInfo()
      message.success('操作成功')
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
    return <div className='review-tips flex-start'><IconFont type="icon-ai43" style={{ color: '#ee9900', fontSize: '18px', marginTop: '-1px' }} />&nbsp;流水线【{record.name}】，当前任务进入人工阶段</div>
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
              <div className='item-box' style={{ flex: 1, color: '#333', wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: linkifyText(item.reason || '') }}></div>
              {/* <div>操作状态：{renderReviewText(item.state)}</div> */}
            </li>
          ))
        }
      </ul>
    </div>
  }

  const handleCountdown = (started_at?) => {
    // 获取当前时间
    let currentDate = new Date().getTime();

    // 计算剩余时间(秒)
    let remainingSeconds = Math.floor((started_at - currentDate) / 1000);

    // 计算天、小时、分钟、秒
    let days: any = Math.floor(remainingSeconds / (24 * 60 * 60));
    let hours: any = Math.floor((remainingSeconds % (24 * 60 * 60)) / (60 * 60));
    let minutes: any = Math.floor((remainingSeconds % (60 * 60)) / 60);
    let seconds: any = Math.floor(remainingSeconds % 60);

    // 格式化数字,如果小于10则在前面加0
    days = String(days).padStart(2, '0');
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    return `${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`
  }

  const setTime = () => {
    return <>
      {handleCountdown(reviewData.expired_at * 1000 || 0)}
    </>
  }

  const popoverSubmit = async () => {
    try {
      const { review_day, review_hour, review_minute } = await formDelay.validateFields()
      const num = review_hour + review_day * 24
      if (num <= 0) {
        message.error('请选择')
        return
      }
      const params = {
        delay_interval: num
      }
      await setDelayDateApi(params, record.logId)
      message.success('延期成功')
      setPopoverDisplay(false)
      formDelay.resetFields()
      getReviewInfo()
    } catch (error) {

    }
  }

  const validator = () => {
    const review_day = formDelay.getFieldValue('review_day')
    const review_hour = formDelay.getFieldValue('review_hour')
    if (review_day + review_hour <= 0) {
      return Promise.reject('请选择')
    }
    return Promise.resolve()
  }

  const linkifyText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank">${url}</a>`;
    });
  };

  const renderDelay = () => {
    return <Form layout="vertical" form={formDelay}>
      <Form.Item name="review_day" rules={[{ validator }]}>
        <div className='flex-start'>
          <div className='flex-start'>
            <Form.Item name="review_day" initialValue={0} style={{ width: '50px', margin: 0 }}>
              <Select options={day} size='small' onChange={() => formDelay.validateFields()}></Select>
            </Form.Item>
            &nbsp;天&nbsp;
          </div>
          <div className='flex-start'>
            <Form.Item name="review_hour" initialValue={0} style={{ width: '50px', margin: 0 }}>
              <Select options={hour} size='small' onChange={() => formDelay.validateFields()} ></Select>
            </Form.Item>
            &nbsp;小时
          </div>
        </div>
      </Form.Item>
      {/* <div className='flex-start'>
          <Form.Item name="review_minute" initialValue={0} style={{ width: '50px', margin: 0 }}>
            <Select options={minute} size='small' ></Select>
          </Form.Item>
          &nbsp;分钟&nbsp;
        </div> */}
      <div className='flex-end' style={{ margin: '10px 0' }}>
        <Button type='primary' size='small' onClick={() => popoverSubmit()}>提交</Button>&nbsp;&nbsp;
        <Button size='small' onClick={() => {
          setPopoverDisplay(false)
        }}>取消</Button>
      </div>
    </Form>
  }

  const renderInstructions = () => {
    return <div className='review-instructions'>
      <b className='review-instructions-title'>操作说明：</b>
      <div style={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: linkifyText(record?.variables?.confirm_description || '-') }}></div>
      {/* 剩余操作时间 */}
      {
        handleStatus() && reviewData.expired_at > 0 && <>
          <div style={{ marginTop: '8px' }}>
            <div style={{ color: '#7F7F7F' }}>剩余操作时间：</div>
            <span style={{ color: '#FF2262' }}>{setTime()}</span>&nbsp;&nbsp;&nbsp;
            <Popover open={popoverDisplay} content={renderDelay()} title="设置延期时间" trigger="click">
              <Button size='small' disabled={!checkPipilineAuth('Delay', record.uuid)} type='primary' ghost onClick={() => setPopoverDisplay(true)}>延期</Button>
            </Popover>&nbsp;&nbsp;&nbsp;
          </div>
          {
            !checkPipilineAuth('Delay', record.uuid) && <Alert style={{ marginTop: '8px' }} message='您没有权限进行延期操作，请联系管理员处理。Caps 发布流程联系袁燕艳，其他流程联系盛海英' type="warning" showIcon />
          }
        </>
      }
    </div >
  }

  const renderDescription = () => {
    if (!checkPipilineAuth('Delay', record.uuid)) {
      return <></>
    }
    return <div className='review-description'>
      <p>请参照以上说明操作相关结果，选择点击以下按钮完成操作:</p>
      <p><b>{passText}:</b> 该人工操作任务成功，流程继续</p>
      <p><b>{canceledText}:</b> 该人工操作任务失败，流程终止</p>
      <p><b>仅评论：</b> 仅添加评论，暂时不审批或者不做任何操作</p>
    </div>
  }

  const renderInput = () => {
    return <div className='review-input'>
      {/* <p className='review-input-title'>请参照以上说明操作相关结果，选择点击以下按钮完成操作:</p> */}
      <div>
        <TextArea
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={`可输入评论，也可以输入${passText}/${canceledText}的原因`}
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

    if (record.status === 'skipped') {
      status = <div style={{ color: '#9BABB8' }}>跳过</div>
    }

    return <div className='review-result'>
      <p className='review-result-title'>执行结果</p>
      {status}
    </div>
  }

  const renderButton = () => {

    return <div className='review-button flex-center'>

      {
        isOperate()
          ?
          <div>
            <Button type='primary' ghost className='review-comment-submit' disabled={commentSubmitLoading} onClick={() => submitComment()}>仅评论</Button>
            <Button type='primary' onClick={() => pass()} loading={buttonLoading}>{passText}</Button>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <Button type='primary' danger onClick={() => reject()} loading={buttonLoading}>{canceledText}</Button>

          </div>
          :
          <>

          </>

      }
    </div>
  }

  const submitComment = async () => {
    try {
      setCommentSubmitLoading(true)

      if (!value.trim()) {
        message.error('请填写评论')
        return
      }

      const params = {
        content: value,
      }
      await submitCommentApi(params, record.logId)
      message.success('评论成功')
      getComment()
    } catch (error) {

    } finally {
      setValue('')
      setCommentSubmitLoading(false)
    }
  }

  const renderComment = () => {
    return <>
      {
        // isOperate() && <div className='review-comment'>
        //   <div className='review-comment-title'>评论</div>
        //   <TextArea
        //     value={comment}
        //     onChange={e => setComment(e.target.value)}
        //     placeholder="发布评论，评论信息可单独提交"
        //     autoSize={{ minRows: 3, maxRows: 5 }}
        //   />
        //   {/* 提交评论 */}
        //   <Button type='link' className='review-comment-submit' disabled={commentSubmitLoading} onClick={() => submitComment()}>提交</Button>
        // </div>
      }
      {renderCommentList()}

    </>
  }

  const renderCommentList = () => {
    return <div className='review-comment-list'>
      {
        commentList.length > 0 && <div style={{ color: '#7F7F7F', marginBottom: '2px' }}>评论列表</div>
      }

      {
        commentList.length <= 0
          ?
          <span style={{ color: '#7f7f7f' }}></span>
          :
          <ul>
            {
              commentList.map(item => (
                <li className='flex-start comment-list-item'>
                  {/* 头像 */}
                  <div className='item-avatar flex-center'>
                    <UserOutlined />
                  </div>
                  <div className='item-right'>
                    <div className='flex-space-between item-right-info'>
                      <div>{item?.user?.display_name}</div>
                      <div>{item.created_at}</div>
                    </div>
                    <div className='item-right-comment' dangerouslySetInnerHTML={{ __html: linkifyText(item.content) }}></div>
                  </div>
                </li>
              ))
            }
          </ul>
      }
    </div>
  }

  const findCurrentVariable = (item) => {
    return variable.find(variableItem => item.key === variableItem.key && item.description === variableItem.description)
  }

  const renderVar = () => {
    const runtimeVar = record?.variables?.runtime_var || []
    if (runtimeVar.length <= 0) {
      return <></>
    }
    return <Form form={form} name="control-hooks" layout="vertical" style={{ marginTop: '10px' }}>
      <div style={{ color: '#7F7F7F' }}>运行时环境变量</div>

      <Form.List name="runtime_var">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => {
              const item = runtimeVar[index]

              const variableData = findCurrentVariable(item) || {}
              const variableValue = variableData?.value
              const isVarExist = variableData.key
              return <div className='item-runtime_var' style={{ marginBottom: '0px' }}>
                <>
                  {
                    isOperate() && (!isVarExist)
                      ?
                      <div className='flex-start' style={{ alignItems: 'flex-start' }}>
                        <div className='flex-space-between' style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Form.Item extra={item.description}  {...restField} name={[name, 'value']} rules={[{ required: item.required, message: '请输入' }]} initialValue={undefined} label={item.display_name || item.key} style={{ marginBottom: '0px', width: '100%' }}>
                            <TextArea
                              autoSize={{ minRows: 1, maxRows: 4 }}
                              placeholder='请输入'
                            />
                          </Form.Item>
                        </div>
                      </div>
                      :
                      <>
                        <div style={{ wordBreak: 'break-all' }}>
                          {
                            item.display_name
                              ?
                              <span>{item.display_name}({item.key})：<span style={{ color: '#7f7f7f' }} dangerouslySetInnerHTML={{ __html: linkifyText(variableValue ? variableValue : '-') }}></span></span>
                              :
                              <span>{item.key}：<span style={{ color: '#7f7f7f' }} dangerouslySetInnerHTML={{ __html: linkifyText(variableValue ? variableValue : '-') }}></span></span>
                          }
                        </div>
                      </>
                  }
                </>
              </div>
            })}
          </>
        )}
      </Form.List>
    </Form >
  }

  const renderContent = () => {
    return <>
      {/* 提示和结果 */}
      {
        handleStatus() && renderTips()
      }
      <div className={`review-scroll common-scroll-bar ${handleStatus() && 'review-scroll-running'}`}>
        {!handleStatus() && renderResult()}
        {renderInstructions()}
        {/* 审批人 */}
        {renderApproved()}
        {
          handleStatus() && <>
            {/* 说明 */}
            {/* 运行时环境变量 */}
            {renderVar()}
            {/* 描述 */}
            {renderDescription()}
            {/* 评论 */}
            {renderComment()}

          </>
        }
        {
          !handleStatus() && <>

            {/* 运行时环境变量 */}
            {renderVar()}
            {/* 描述 */}
            {/* {renderDescription()} */}
            {renderCommentList()}
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
    <div ref={variableRef} className='flow-created-new-review-container'>
      {
        load ? <Loading /> : renderContent()
      }
    </div>
  );
}


export default forwardRef(LoadModal)
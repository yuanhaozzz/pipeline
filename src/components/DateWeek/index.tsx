import { useEffect, useState, useImperativeHandle, useRef, forwardRef } from 'react';

import { Select, Radio, DatePicker, message } from 'antd';
import moment from 'moment';
import { useIntl } from 'umi';
import { DownOutlined, UpOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'

import { getWeekList } from './service'
import './style.less'

const { Option } = Select

const { RangePicker } = DatePicker;

export interface IAppProps {
  formatType?: string
  defaultDateString?: string
  defaultMonthDate?: any
  defaultDateWeek?: any
  defaultDayDate?: any
  defaultDayComponentOptions?: any
  defaultDateWeekComponentOptions?: any
  setParams(params: any): void
  week: any[]
}

function DateWeek(props: IAppProps, ref) {
  const intl = useIntl();
  const { formatType = 'month-week', defaultDateString = 'week', defaultMonthDate, defaultDateWeek, setParams, defaultDayDate, week, defaultDayComponentOptions = {}, defaultDateWeekComponentOptions = {} } = props
  const [dateType, setType] = useState(defaultDateString)

  const [rangePickerDate, setRangePickerDate] = useState(defaultMonthDate || [moment().add(-2, 'month'), moment().add(0, 'month')])

  const [rangeDateWeek, setRangeDateWeek] = useState(defaultDateWeek || [moment().add(-2, 'month'), moment().add(0, 'month')])
  const [rangePickerDay, setRangePickerDay] = useState(defaultDayDate || [moment().add(0, 'day'), moment().add(-0, 'day')])
  const [weekIndex, setWeekIndex] = useState(0)

  const dateParams = useRef<any>(null)

  const dateMap = {
    'month': {
      label: intl.formatMessage({ id: 'pages.month' }),
      value: 'month'
    },
    'dateWeek': {
      label: intl.formatMessage({ id: 'pages.week' }),
      value: 'dateWeek'
    },
    'week': {
      label: intl.formatMessage({ id: 'pages.week' }),
      value: 'week'
    },
    'day': {
      label: intl.formatMessage({ id: 'pages.day' }),
      value: 'day'
    },
  }

  const formatTypeArray = formatType ? formatType.split('-').map(item => {
    return dateMap[item]
  }) : []

  useImperativeHandle(ref, () => ({ getDateParams, down, setExpandWeekIndex }))

  useEffect(() => {
    if (week.length <= 0) {
      return
    }

    switch (dateType) {
      case 'month':
        setParams({
          startDate: rangePickerDate[0].startOf('month').format('YYYY-MM-DD'),
          endDate: rangePickerDate[1].endOf('month').format('YYYY-MM-DD'),
          type: dateType
        })
        break
      case 'dateWeek':
        setParams({
          startDate: rangeDateWeek[0].format('YYYY-MM-DD'),
          endDate: rangeDateWeek[1].format('YYYY-MM-DD'),
          type: dateType
        })
        break
      case 'week':
        setParams({
          startDate: week[weekIndex]?.start_date,
          endDate: week[weekIndex]?.end_date,
          type: dateType
        })
        break
      case 'day':
        setParams({
          startDate: rangePickerDay[0].format('YYYY-MM-DD'),
          endDate: rangePickerDay[1].format('YYYY-MM-DD'),
          type: dateType
        })
        break
    }
  }, [dateType, week, weekIndex, rangePickerDate, rangePickerDay, rangeDateWeek])

  const weekChange = (value) => {
    setWeekIndex(value)
  }

  const getDateParams = () => {
    return dateParams.current
  }

  const machineTimeChange = (dates: any) => {
    // const startDate = dates[0].startOf('month').format('YYYY-MM-DD')
    // const endDate = dates[1].endOf('month').format('YYYY-MM-DD')
    setRangePickerDate(dates)
  }

  const machineTimeChangeDate = (dates: any) => {
    // const startDate = dates[0].startOf('month').format('YYYY-MM-DD')
    // const endDate = dates[1].endOf('month').format('YYYY-MM-DD')
    setRangeDateWeek(dates)
  }

  const dayTimeChange = (dates: any) => {
    // const startDate = dates[0].startOf('month').format('YYYY-MM-DD')
    // const endDate = dates[1].endOf('month').format('YYYY-MM-DD')
    setRangePickerDay(dates)
  }

  const up = () => {
    if (weekIndex <= 0) {
      message.warn(intl.formatMessage({ id: 'pages.reportManage.latestWweek' }))
      return
    }
    setWeekIndex(weekIndex - 1)
  }

  const setExpandWeekIndex = (index: number) => {
    setWeekIndex(index)
  }

  const down = (type: string) => {
    if (weekIndex >= week.length - 1) {
      if (type !== 'init') {
        message.warn(intl.formatMessage({ id: 'pages.reportManage.alreadyAtEnd' }))
      }
      return
    }
    setWeekIndex(weekIndex + 1)
  }

  const onchangeType = (e) => {
    const { value } = e.target
    setType(value)
  }

  const click = () => {
    console.log(dateParams.current);
  }


  const downMonth = () => {
    const start = moment(rangePickerDate[0]).add(-1, 'month')
    const end = moment(rangePickerDate[1]).add(-1, 'month')
    setRangePickerDate([start, end])
  }

  const upMonth = () => {
    const start = moment(rangePickerDate[0]).add(+1, 'month')
    const end = moment(rangePickerDate[1]).add(+1, 'month')
    setRangePickerDate([start, end])
  }

  const dateWeekDownMonth = () => {
    const start = moment(rangeDateWeek[0]).add(-1, 'month')
    const end = moment(rangeDateWeek[1]).add(-1, 'month')
    setRangeDateWeek([start, end])
  }

  const dateWeekUpMonth = () => {
    const start = moment(rangeDateWeek[0]).add(+1, 'month')
    const end = moment(rangeDateWeek[1]).add(+1, 'month')
    setRangeDateWeek([start, end])
  }

  const renderMonth = () => {
    return <div className='flex-start'>
      {/* 箭头 */}
      <div className='date-arrow-container flex-center' onClick={downMonth}>
        <LeftOutlined />
      </div>
      <RangePicker onChange={machineTimeChange} picker="month" value={rangePickerDate} allowClear={false} style={{ width: '195px' }} />
      {/* 箭头 */}
      <div className='date-arrow-container flex-center' onClick={upMonth}>
        <RightOutlined />
      </div>
    </div>
  }

  const renderDateWeek = () => {
    return <div className='flex-start'>
      {/* 箭头 */}
      <div className='date-arrow-container flex-center' onClick={dateWeekDownMonth}>
        <LeftOutlined />
      </div>
      <RangePicker onChange={machineTimeChangeDate} picker="date" value={rangeDateWeek} allowClear={false} style={{ width: '215px' }} {...defaultDateWeekComponentOptions} />
      {/* 箭头 */}
      <div className='date-arrow-container flex-center' onClick={dateWeekUpMonth}>
        <RightOutlined />
      </div>
    </div>
  }


  const renderDay = () => {
    return <div className='margin-left-10'>
      <RangePicker onChange={dayTimeChange} picker="date" value={rangePickerDay} allowClear={false} style={{ width: '225px' }} {...defaultDayComponentOptions} />
    </div>
  }

  const removeYear = (str) => {
    return str.slice(5)
  }

  const renderWeek = () => {
    return <div className='flex-start'>
      {/* 箭头 */}
      <div className='date-arrow-container flex-center' onClick={down}>
        <LeftOutlined />
      </div>
      <Select value={weekIndex} onChange={weekChange}>
        {
          week.map((item: any, index: number) => (
            <Option value={index} key={item.week_num}>
              <span >
                {item.week_num}：{removeYear(item.start_date)}~{removeYear(item.end_date)}
              </span>
            </Option>
          ))
        }
      </Select>
      {/* 箭头 */}
      <div className='date-arrow-container flex-center' onClick={up}>
        <RightOutlined />
      </div>
    </div>
  }
  return (
    <div className='common-date-week-wrap flex-start'>
      <Radio.Group buttonStyle="solid" value={dateType} onChange={onchangeType}>
        {
          formatTypeArray.map(item => (
            <Radio.Button value={item.value}>{item.label}</Radio.Button>
          ))
        }
      </Radio.Group>
      {/* 月 */}
      {
        dateType === 'month' && renderMonth()
      }
      {/* 时间范围周 */}
      {
        (dateType === 'dateWeek') && renderDateWeek()
      }
      {/* 周 */}
      {
        dateType === 'week' && renderWeek()
      }
      {/* 日 */}
      {
        dateType === 'day' && renderDay()
      }
      {/* <button onClick={click}>+++</button> */}
    </div>
  );
}

export default forwardRef(DateWeek)

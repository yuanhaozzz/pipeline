import { useState } from 'react';

import { Select, Card, Row, Col, DatePicker, Radio, RadioChangeEvent, RangePickerValue, Button, Empty } from 'antd';
import moment from 'moment';
import { useIntl } from 'umi';
import { BarChartOutlined, DotChartOutlined, LineChartOutlined } from '@ant-design/icons'

import './style.less'

const { RangePicker } = DatePicker;

const cycleList = [
    { label: '近一个月', value: 'month' },
    { label: '近一周', value: 'week' }
];

export interface IAppProps {
    cycleChange: (value: string) => void
    machineTimeChange: (dates: RangePickerValue) => void
    cycle: string;
    machineDefaultVal: []
    formatType?: string
    formatDate?: string
    type: any;
    setType(params: any): void
    rangePickerOptions: any
    format?: string

}
export default function Date(props: IAppProps) {
    const intl = useIntl();
    const { cycle, type, setType, formatType = '', formatDate = 'month-week', rangePickerOptions = { format: "YYYY-MM-DD" } } = props
    const dateMap = {
        'month': {
            label: intl.formatMessage({ id: 'pages.month' }),
            value: 'month'
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

    const dateRangeMap = {
        'month': {
            label: intl.formatMessage({ id: 'pages.lastMonth' }),
            value: 'month'
        },
        'week': {
            label: intl.formatMessage({ id: 'pages.lastWeek' }),
            value: 'week'
        },
    }


    const formatTypeArray = formatType ? formatType.split('-').map(item => {
        return dateMap[item]
    }) : []

    const formatDateArray = formatDate ? formatDate.split('-').map(item => {
        return dateRangeMap[item]
    }) : []

    const cycleChange = ({ target: { value } }: RadioChangeEvent) => {
        props.cycleChange(value)
    };

    const machineTimeChange = (dates: RangePickerValue) => {
        props.machineTimeChange(dates)
    }

    const onchangeType = (e) => {
        const { value } = e.target
        setType(value)
    }
    return (<div className={'common-data-search-container charts-search flex-end'}>
        <Radio.Group buttonStyle="solid" value={type} onChange={onchangeType}>
            {
                formatTypeArray.map(item => (
                    <Radio.Button value={item.value}>{item.label}</Radio.Button>
                ))
            }
        </Radio.Group>
        {
            cycle !== undefined && <div className='charts-search-item'>
                <Radio.Group
                    onChange={cycleChange}
                    value={props.cycle}
                    buttonStyle="solid"
                >
                    {
                        formatDateArray.map(item => (
                            <Radio.Button value={item.value}>{item.label}</Radio.Button>
                        ))
                    }
                </Radio.Group>
            </div>
        }
        <div className='charts-search-item' style={{ width: '230px' }}>
            <RangePicker
                allowClear={false}
                onChange={machineTimeChange}
                value={props.machineDefaultVal}
                {...rangePickerOptions}
            // disabledDate={disabledDate}
            >
            </RangePicker>
        </div>
        {/* {
            iconType && <Button icon={iconType === 1 ? <BarChartOutlined /> : <LineChartOutlined />} style={{ marginLeft: '10px' }} onClick={setIconType}></Button>
        } */}

    </div >
    );
}

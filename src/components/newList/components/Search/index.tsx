import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Moment } from 'moment';
import { Button, Divider, Form, Input, Select, Spin, Empty, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons'
import { FormattedMessage } from 'umi';
import debounce from 'lodash/debounce';
import { SearchOptionsKeys, ButtonType } from '../../type'
import { getUrlParams } from '@/utils'

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue = [Moment | null, Moment | null] | null;

export interface IAppProps {
	searchOptions: SearchOptionsKeys[]
	search(params: any): void
	searchButton?: ButtonType[]
	handleRequestParams(params: any): void
	setCurrent(page: number): void
	hideReset: boolean
	hideSearchButton: boolean
}



function Search(props: IAppProps, ref: any) {
	const { searchOptions, searchButton, handleRequestParams, setCurrent, hideReset, hideSearchButton } = props

	const [mapData, setMapData] = useState({})
	const [fetchMap, setFetchMap] = useState({})
	// const [dates, setDates] = useState<RangeValue>(null);

	const [form] = Form.useForm();

	useImperativeHandle(ref, () => ({
		setField
	}))

	useEffect(() => {
		initUrlParams()
		getSelectRemote()
		// 初始化
		submit()
	}, [])

	const initUrlParams = () => {
		form.setFieldsValue(getUrlParams())
	}

	const getSelectRemote = () => {
		const remote = searchOptions.filter(item => item.type === 'selectRemote')
		remote.forEach((item) => {
			initSelectOptions(item)
		})
	}



	/** 重置 接口调用 */
	const onReset = () => {
		const keys = Object.keys(form.getFieldsValue())

		keys.forEach(key => {
			const current: any = searchOptions.find(item => item.form.name === key)
			if (current?.type === 'selectMultiple') {
				form.setFieldValue(key, [''])
			} else {
				if (current.type === 'select') {
					form.setFieldValue(key, '')
				} else {
					form.setFieldValue(key, undefined)
				}
			}
		})
		submit()
	};

	// 条件查询
	const submit = () => {
		const newValue = formatDate(form.getFieldsValue())
		const keys = searchOptions.filter((item: any) => item.type === 'select' || item.type === 'selectMultiple')
		keys.forEach(item => {
			const name = item.form.name
			const type = item.type
			if (type === 'select' && newValue[name] === '') {
				form.setFieldValue(name, '')
			}
			if (type === 'selectMultiple' && newValue[name].length === 0) {
				form.setFieldValue(name, [''])
			}
		})


		const { current, page_num } = getUrlParams()
		const pageNum = parseInt(current) || parseInt(page_num) || 1
		newValue.page_num = pageNum
		setCurrent(pageNum)
		handleRequestParams(newValue)
	}


	const formatDate = (qeury: any) => {
		if (qeury.date && qeury.date.length > 0) {
			qeury.startTime = qeury.date[0].format('yyyy-MM-DD')
			qeury.endTime = qeury.date[1].format('yyyy-MM-DD')
			delete qeury.date
		} else {
			qeury.startTime = ''
			qeury.endTime = ''
		}
		return qeury
	}


	const handleLoading = (key: string, status: boolean) => {
		if (status) {
			mapData[key] = []
			setMapData({ ...mapData })
		}
		fetchMap[key] = status
		setFetchMap({ ...fetchMap })
	}

	const initSelectOptions = async (options: SearchOptionsKeys, value = '') => {
		const { form, componentOptions } = options
		try {
			handleLoading(form.name, true)
			const data = await componentOptions?.getOptionsList(value)
			mapData[form.name] = data
			setMapData({ ...mapData })

		} catch (error) {
			console.log(error);
		} finally {
			handleLoading(form.name, false)
		}
	}

	const renderItem = (options: any) => {
		switch (options.type) {
			case 'input':
				return renderInput(options);
			case 'select':
				return renderSelect(options);
			case 'selectMultiple':
				return renderSelectMultiple(options);
			case 'selectMultipleNotAll':
				return renderSelectMultipleNotAll(options);
			case 'selectRemote':
				return renderSelectRemote(options);
			case 'rangePicker':
				return renderRangePicker(options);
			default:
				return <></>
		}
	}
	const loadOptions = (options: SearchOptionsKeys, value: string) => {
		initSelectOptions(options, value)
	};

	const debounceFetcher = debounce(loadOptions, 500);

	const handleBlur = (e: any, name) => {
		// 去除头尾空格
		const value = e.target.value.trim();
		form.setFieldValue(name, value)
	}

	const selectMultiple = (value: any, name: any, options: any) => {
		if (value.length > 0) {
			const empty = value.find((item: any) => item === '')
			if (value.length === options.length - 1 && !empty) {
				form.setFieldValue(name, [''])
				submit()
				return
			}
			if (value[value.length - 1] !== '') {
				form.setFieldValue(name, value.filter((item: any) => item !== ''))
			} else {
				form.setFieldValue(name, [''])
			}
			// if (empty) {
			// 	form.setFieldValue(name, [''])
			// }
			// form.setFieldValue(name, value)
		}
		submit()
	}

	const setField = (fields: any[]) => {
		fields.forEach(item => {
			form.setFieldValue(item.key, item.value)
		})
		submit()
	}

	const inputChange = (e, options) => {
		if (options?.componentOptions?.onInputChange) {
			options.componentOptions.onInputChange(e.target.value)
		}
		submit()
	}

	const debounceInputChange = debounce(inputChange, 500);

	const renderInput = (options: SearchOptionsKeys) => {
		const { width = '200px' } = options?.componentOptions || {};
		return <Form.Item
			className='layout'
			{
			...options.form
			}
		>
			<Input
				allowClear
				style={{ width }}
				placeholder="请输入"
				onBlur={(e) => handleBlur(e, options.form.name)}
				onChange={e => debounceInputChange(e, options)}
				{
				...options.componentOptions
				}
			/>
		</Form.Item>
	}

	const renderSelect = (options: SearchOptionsKeys) => {

		return <Form.Item
			className='layout'
			{
			...options.form
			}
		>
			<Select
				allowClear
				showSearch
				placeholder="请选择"
				style={{ width: '200px' }}
				optionFilterProp="children"
				onChange={() => submit()}
				filterOption={(input, option) => (option?.label ?? '').includes(input)}
				{
				...options.componentOptions
				}
			/>
		</Form.Item>
	}

	const renderSelectMultiple = (options: SearchOptionsKeys) => {

		return <Form.Item
			className='layout'
			{
			...options.form
			}
		>
			<Select
				// allowClear
				showSearch
				placeholder="请选择"
				// style={{ width: '200px' }}
				optionFilterProp="children"
				onChange={(value) => selectMultiple(value, options.form.name, options.componentOptions.options)}
				filterOption={(input, option) => (option?.label ?? '').includes(input)}
				{
				...options.componentOptions
				}
			/>
		</Form.Item>
	}

	const renderSelectMultipleNotAll = (options: SearchOptionsKeys) => {

		return <Form.Item
			className='layout'
			{
			...options.form
			}
		>
			<Select
				mode='multiple'
				allowClear
				showSearch
				placeholder="请选择"
				onChange={(value) => submit()}
				// style={{ width: '200px' }}
				optionFilterProp="children"
				filterOption={(input, option) => (option?.label ?? '').includes(input)}
				{
				...options.componentOptions
				}
			/>
		</Form.Item>
	}

	const renderSelectRemote = (options: SearchOptionsKeys) => {
		return <Form.Item
			className='layout'
			{
			...options.form
			}
		>
			<Select
				{
				...options.componentOptions
				}
				allowClear
				showSearch
				style={{ width: '200px' }}
				optionFilterProp="children"
				filterOption={false}
				placeholder="请选择"
				notFoundContent={fetchMap[options.form.name] ? <Spin size="small" /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
				onSearch={(value) => debounceFetcher(options, value)}
			// options={mapData[options.form.name]}
			>
				{
					mapData[options.form.name]?.map(item => (
						<Option value={item.value} label={item.label}>
							<div className="demo-option-label-item">
								<span role="img" aria-label="China">
									{item.label}
								</span>
								{
									item.user_id && <span>&nbsp;&nbsp;&nbsp;{item.user_id}</span>
								}
							</div>
						</Option>
					))
				}

			</Select>
		</Form.Item>
	}

	const renderRangePicker = (options: SearchOptionsKeys) => {
		return <Form.Item
			className='layout'
			{
			...options.form
			}
		>
			<RangePicker
				style={{ width: '200px' }}
				onChange={(value) => submit()}
				// onCalendarChange={val => setDates(val)}
				// disabledDate={disabledDate}
				// value={dates || value}
				// disabledDate={disabledDate}
				// onCalendarChange={val => setDates(val)}
				// onChange={val => setValue(val)}
				// onOpenChange={onOpenChange}
				// onBlur={() => console.log('blur has been triggered')}
				{
				...options.componentOptions
				}
			/>
		</Form.Item>
	}

	return (
		<div className='common-list-search-wrapper'>
			<Form
				name="basic"
				// layout='inline'
				//initialValues={{ remember: true }}
				form={form}
				onFinish={submit}
			// autoComplete="off"
			>
				<div className='flex-start search-options' style={{ alignItems: 'flex-start' }}>
					<div style={{ width: '80%', flexWrap: 'wrap' }} className='flex-start'>
						{
							searchOptions.map(item => (
								<>
									{
										renderItem(item)
									}
								</>
							))
						}
					</div>
					<div className='searchBtn layout-button flex-end' style={{ flex: 1, height: '100%' }}>
						{
							searchButton && searchButton.length > 0 && searchButton.map(button => (
								<div className='button'>
									<Button {...button}>
										{button.label}
									</Button>
								</div>
							))
						}
						{
							!hideReset && <div className='button'>
								<Button className={'Bt-01'} onClick={onReset}>
									<FormattedMessage id="pages.reset" />
								</Button>
							</div>
						}
						{
							!hideSearchButton && <div className='button'>
								<Button type="primary" htmlType="submit">
									<FormattedMessage id="pages.query" />
								</Button>
							</div>
						}

					</div>
				</div>

			</Form>
		</div>
	);
}

export default forwardRef(Search)

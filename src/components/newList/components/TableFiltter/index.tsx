import { useState, useEffect, useReducer, useRef } from 'react';
import { FormattedMessage } from 'umi';
import { Button, Tooltip, Modal, Radio, Checkbox, Popconfirm } from 'antd'
import type { RadioChangeEvent } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

import { DragElementType } from '../../type'
import { deepCopy } from '@/utils'


import {
	TableOutlined,
	HolderOutlined
} from '@ant-design/icons';

export interface IAppProps {
	columns: any[],
	tableColumn: any[],
	setTableColumn(list: any): void
	resetSetting(): void
}
let commonListDragElement = null
let commonListDragStartX = 0
let commonListCLear = null
let commonLeftFixed = []
let commonRightFixed = []
export default function TableModifyColumns(props: IAppProps) {
	let { tableColumn, setTableColumn, columns, resetSetting } = props
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [radio, setRadio] = useState(1)
	const [indeterminate, setIndeterminate] = useState(true);
	const [checkAll, setCheckAll] = useState(false);
	const [, forceUpdate] = useReducer((state) => state + 1, 0)

	const elementRef = useRef(null)

	const title = {
		1: <FormattedMessage id="pages.dashboard.selectDisplayColumn" />,
		2: <FormattedMessage id="pages.dashboard.dragDisplaysequence" />
	}

	useEffect(() => {
		computeCheckbox()
	}, [tableColumn])

	const options = [
		{ label: <FormattedMessage id="pages.dashboard.showColumns" />, value: 1 },
		{ label: <FormattedMessage id="pages.dashboard.sortColumns" />, value: 2 },
	];

	const showModal = () => {
		setIsModalOpen(true);
	};

	const handleOk = () => {
		setLocalStorage(tableColumn)
		setTableColumn([...tableColumn])
		setIsModalOpen(false);
	};

	const setLocalStorage = (column: any) => {
		const path = window.location.pathname
		const value = column.map(item => {
			return {
				status: item.status,
				key: item.key
			}
		})
		localStorage.setItem(path + 'sort', JSON.stringify(value))
	}

	const handleCancel = () => {
		setIsModalOpen(false);
	};

	const onChangeRadio = ({ target: { value } }: RadioChangeEvent) => {
		console.log('radio3 checked', value);
		setRadio(value);
	};

	const computeCheckbox = () => {
		const list = tableColumn.filter(item => item.status)
		setIndeterminate(!!list.length && list.length < tableColumn.length);
		setCheckAll(list.length === tableColumn.length);
	}

	const onChangeCheckbox = (e: CheckboxChangeEvent, key) => {
		const index = tableColumn.findIndex(item => item.key === key)
		tableColumn[index].status = !tableColumn[index].status
		computeCheckbox()
		forceUpdate()
	}

	const onCheckAllChange = (e: CheckboxChangeEvent) => {
		const { checked } = e.target
		setIndeterminate(false);
		setCheckAll(e.target.checked);
		tableColumn.forEach(item => {
			item.status = true
			if (!checked) {
				if (item.key !== "operator") {
					item.status = false
				}
			}
		})
		forceUpdate()
	};

	const onDragStart = (e: any) => {
		const target = e.target
		target.style.opacity = '.3'
		commonListDragElement = e.target
		commonListDragStartX = e.clientX
	}

	const onDragEnd = (e: any) => {
		const target = e.target
		target.style.opacity = '1'
		commonListDragElement = null

		const box = e.target.closest('.item-drap-box');
		if (box) {
			const children = Array.from(box.parentNode.children)
			const copyTabColumn = deepCopy(tableColumn).filter(item => item.key !== 'operator' && !item.fixed)
			children.forEach((item: any, index: number) => {
				const key = item.dataset.key
				const fixed = item.dataset.fixed
				const tableColumnIndex = copyTabColumn.findIndex(prevData => prevData.key === key)
				const findData = copyTabColumn.splice(tableColumnIndex, 1)[0]
				copyTabColumn.splice(index, 0, findData);
			})

			handleTableDragEndData(copyTabColumn, commonLeftFixed, 'left')
			handleTableDragEndData(copyTabColumn, commonRightFixed, 'right')

			tableColumn = copyTabColumn
		}
	}

	const handleTableDragEndData = (target: any[], fixed: any, type: string) => {
		fixed.forEach(item => {
			if (type === 'left') {
				target.unshift(item)
			} else {
				target.push(item)
			}
		})
	}

	const onDragOver = (e) => {
		e.preventDefault();
		try {
			const { clientX } = e
			const target = e.target.closest('.item-drap-box');

			// if (!target || !commonListDragElement) {
			if (!target) {
				return
			}
			let container = target.parentNode;
			container.insertBefore(commonListDragElement, commonListDragStartX > clientX ? target : target.nextSibling);
			commonListDragStartX = clientX
		} catch (error) {
			console.log(error)
		}
	}

	const filterWhitelist = (column: any) => {
		commonLeftFixed = column.filter(item => item.fixed === 'left')
		commonRightFixed = column.filter(item => item.fixed === 'right')
		return column.filter(item => item.key !== 'operator' && !item.fixed)
	}

	const confirm = () => {
		resetSetting()
		setIsModalOpen(false);
	}

	// 表格列展示
	const renderShowColumns = () => {
		return <div className='icon-columns flex-start'>
			{/* 全选 */}
			<div className='icon-columns-item'>
				<Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}><FormattedMessage id="pages.selectAll" /></Checkbox>
			</div>
			{/* 筛选 */}
			{
				filterWhitelist(tableColumn).map((item, index) => (
					<div className='icon-columns-item ' key={item.key}>
						<Tooltip title={item.title}>
							<Checkbox onChange={(e) => onChangeCheckbox(e, item.key)} checked={item.status}>
								<div className='icon-columns-item-title'>{item.title}</div>
							</Checkbox>
						</Tooltip>

					</div>

				))
			}
		</div>
	}

	// 表格列排序
	const renderSortColumn = () => {
		return <div className='icon-columns flex-start' onDragOver={onDragOver}>
			{
				filterWhitelist(tableColumn).map((item, index) => (
					<div className='icon-columns-item item-drap-box flex-start' data-key={item.key} draggable="true" onDragStart={(e) => onDragStart(e)} onDragEnd={onDragEnd} ref={elementRef} data-fixed={item.fixed} key={item.key} onDrag={(e) => e.preventDefault()}>
						{/* <Tooltip title={item.title}> */}
						<div className='icon-columns-item-sort flex-start'>
							<HolderOutlined style={{ fontSize: '16px' }} />
							<div className='sort-title'>{item.title}</div>
						</div>
						{/* </Tooltip> */}
					</div>
				))
			}
		</div >
	}

	return (
		<div className='common-list-icon'>
			<Tooltip title="格式化表格列">
				<Button icon={<TableOutlined style={{ fontSize: '40px' }} />} onClick={showModal}></Button>
			</Tooltip>
			<Modal title={title[radio]} className='common-list-icon-model-table' style={{ width: '100px' }} mask={false} open={isModalOpen} footer={[
				<Popconfirm title={'确定重置设置吗？'} onConfirm={confirm}>
					<Button danger>重置设置</Button>
				</Popconfirm>,
				<Button onClick={handleCancel}>取消</Button>,
				<Button type='primary' onClick={handleOk}>确定</Button>
			]} onCancel={handleCancel}>
				<div className='icon-radio'>
					<Radio.Group options={options} onChange={onChangeRadio} value={radio} optionType="button" />
				</div>
				{
					radio === 1 ? renderShowColumns() : renderSortColumn()
				}
			</Modal>
		</div>
	);
}

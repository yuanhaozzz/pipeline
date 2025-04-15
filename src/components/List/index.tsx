import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useReducer } from 'react';

import { Button } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { FormattedMessage } from 'umi';
import Search from './components/Search'
import TableFilter from './components/TableFiltter'
import CustomTable from './components/Table'

import { SearchOptionsKeys, ButtonType } from './type'
import { filterEmptyParams, getUrlParams } from '@/utils'
import './style.less'


export interface IAppProps {
    searchOptions?: SearchOptionsKeys[]
    getData(params: any): void
    columns: any[]
    searchButton?: ButtonType[]
    total: number
    data: any[]
    pageSize?: number
    showTableFilter?: boolean
    tableHeaderButtons?: ButtonType[]
    children?: any;
    hasNavigation?: boolean
    isInitLoad?: boolean
    showPagination?: boolean
    leftButtons: any[]
    showIndex?: boolean
    indexConfig?: any
    hideReset?: boolean
    hideSearchButton?: boolean
    rowSelection?: object
    rowKey?: string
}

function List(props: IAppProps, ref: any) {
    const { getData, showTableFilter, columns = [], searchButton, total, data, pageSize: size, tableHeaderButtons = [], searchOptions = [], hasNavigation = true, isInitLoad = true, showPagination = true, rowSelection = null, rowKey = undefined, leftButtons = [], showIndex = true, hideReset = false, hideSearchButton = false, indexConfig = {} } = props
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(size || 10);
    // const [tableHeaderButton, setTableHeaderButton] = useState<any>([])
    const tableHeaderButton = tableHeaderButtons?.slice()
    const [, forceUpdate] = useReducer(state => state + 1, 0)

    const requestTimer = useRef(null)

    const didMountRef = useRef(true)
    const loadtRef = useRef(false)

    const searchRef = useRef(null)

    const [query, setQuery] = useState({
        current,
        pageSize
    })
    const [tableColumn, setTableColumn] = useState<any[]>([])

    useEffect(() => {
        if (!isInitLoad) {
            didMountRef.current = false
            // debugger
            forceUpdate()
        }
    }, [])

    useImperativeHandle(ref, () => ({
        // 更新列表接口  需要更新列表数据时调用
        update,
        // 获取请求参数
        getQueryParams,
        reset,
        setField
    }))

    // useEffect(() => {
    //     setTableHeaderButton(tableHeaderButtons?.slice())
    // }, [tableHeaderButtons])

    useEffect(() => {
        // 初始化table过滤
        initTableColumns()
    }, [columns])

    useEffect(() => {
        if (searchOptions.length === 0) {
            search()
        } else {
            // 初始化不执行
            if (loadtRef.current) {
                initRequestData()
            } else {
                loadtRef.current = true
            }
        }

        // initRequestData()
    }, [query])

    const setIndexData = (index) => {
        let num = index + (current - 1) * pageSize + 1
        if (indexConfig.isIndexReverse) {
            console.log(index)
            num = total - (index + ((current - 1) * pageSize))
        }
        return num
    }

    const initRequestData = () => {
        if (searchOptions.length === 0) {
            search()
        } else {
            didMountRef.current ? search() : setTimeout(() => {
                didMountRef.current = true
            }, 100);
        }
    }

    const initTableColumns = () => {
        // 添加序号列和status字段
        let newColumn = [...columns]
        if (showIndex) {
            newColumn.unshift({
                title: indexConfig.title || <FormattedMessage id="pages.dashboard.number" />,
                dataIndex: '',
                key: 'pageIndex',
                align: 'center',
                width: 70,
                render: (text: any, record: any, index: number) => {
                    const value = setIndexData(index)
                    if (typeof indexConfig.content === 'function') {
                        return indexConfig.content(value)
                    }
                    return value
                },
            })
        }
        // 取出存储的当前页排序
        const pathname = window.location.pathname
        let arr = parseLocalStorage(localStorage.getItem(pathname + 'sort'))
        if (arr.length > 0) {
            arr = sortColumn(arr, [...newColumn])
        } else {
            arr = newColumn.map((item) => {
                item.status = true
                return item
            })
        }
        setTableColumn(arr)
    }

    const sortColumn = (sort: any, column: any): any[] => {
        const arr = []
        for (let i = 0; i < sort.length; i++) {
            const { status, key } = sort[i]
            const columnIndex = column.findIndex(item => item.key === key)
            if (columnIndex >= 0) {
                column[columnIndex].status = status
                arr.push(column[columnIndex])
                column.splice(columnIndex, 1)
            }

        }
        return [...arr, ...column]
    }

    const parseLocalStorage = (value: any): any[] => {
        if (!value) return []
        return JSON.parse(value)
    }

    const getQueryParams = () => {
        return filterEmptyParams({ ...query })
    }

    const handleGetData = () => {
        clearTimeout(requestTimer.current)
        requestTimer.current = setTimeout(async () => {
            try {
                await getData(filterEmptyParams({ ...query }))
            } catch (error) {
            } finally {
                setLoading(false)
            }
        }, 500);
    }

    // 调用接口
    const search = async () => {
        try {
            setLoading(true)
            await handleGetData()
        } catch (error) {
            console.log(error);

        }
    }

    const update = (params: any = {}) => {
        // if (params.current === 1) {
        if (params.current > 0) {
            setCurrent(params.current)
        }
        setQuery({ ...query, ...params })
    }

    const handleRequestParams = (newValue: any) => {
        setQuery({ ...query, ...newValue })
    }

    const reset = () => {

    }

    const setField = (fields: any[]) => {
        searchRef.current.setField(fields)
    }

    const resetSetting = () => {
        const path = window.location.pathname
        localStorage.removeItem(path + 'sort')
        // setTableColumn([{
        //     title: <FormattedMessage id="pages.dashboard.number" />,
        //     dataIndex: '',
        //     key: 'pageIndex',
        //     align: 'center',
        //     width: 70,
        //     render: (text: any, record: any, index: number) => index + (current - 1) * pageSize + 1,
        // }, ...columns])
        location.reload()
    }

    const renderContent = () => {
        return <div className='common-list-wrapper'>
            {/* 搜索区 */}
            {
                searchOptions.length > 0 && <Search searchOptions={searchOptions} search={search} searchButton={searchButton} handleRequestParams={handleRequestParams} setCurrent={setCurrent} hideReset={hideReset} ref={searchRef} hideSearchButton={hideSearchButton} />
            }
            {
                didMountRef.current && <div className="common-list-content">
                    {/* 扩展区 */}
                    <div className='common-list-content-extends'>
                        {props.children}
                    </div>
                    <div className='common-list-context-header flex-space-between'>
                        <div className='flex-start'>
                            {/* 图标区 */}
                            {
                                columns.length > 0 && showTableFilter && <TableFilter tableColumn={tableColumn} setTableColumn={setTableColumn} resetSetting={resetSetting} />
                            }
                            {
                                leftButtons.map((item: ButtonType, index: number) => (
                                    <Button {...item} style={{ marginLeft: '20px' }}>{item.label}</Button>
                                ))
                            }
                        </div>
                        {/* 按钮区 */}
                        <div className='common-list-button'>
                            {
                                tableHeaderButton.map((item: ButtonType, index: number) => (
                                    <Button {...item} style={{ marginLeft: '20px' }}>{item.label}</Button>
                                ))
                            }
                        </div>
                    </div>
                    {/* 表格区 */}
                    <CustomTable data={data} columns={tableColumn} total={total} loading={loading} current={current} pageSize={pageSize} setCurrent={setCurrent} setLoading={setLoading} setPageSize={setPageSize} handleRequestParams={handleRequestParams} showPagination={showPagination} rowSelection={rowSelection} rowKey={rowKey}></CustomTable>
                </div>
            }
        </div>
    }

    const renderRoot = () => {
        const root = hasNavigation ? <PageContainer>{renderContent()}</PageContainer> : <>{renderContent()}</>
        return root
    }

    return (
        <>
            {renderRoot()}
        </>
    );
}

export default forwardRef(List)

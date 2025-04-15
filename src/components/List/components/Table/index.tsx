import { useState, } from 'react';
import { useIntl } from 'umi';
import { Table } from 'antd';

import type { ColumnsType, TableProps } from 'antd/es/table';
import { deepCopy } from '@/utils'

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

export interface IAppProps {
  columns: any[]
  total: number
  data: any[]
  loading: boolean
  current: number
  pageSize: number
  setCurrent(page: number): void
  setPageSize(size: number): void
  setLoading(status: boolean): void
  handleRequestParams(params: any): void
  showPagination: boolean
  rowSelection?: object
  rowKey?: string
}

export default function CustomTable(props: IAppProps) {
  const intl = useIntl();
  const { handleRequestParams } = props
  const { columns, total, data, loading, current, pageSize, rowSelection, rowKey, setCurrent, setLoading, setPageSize, showPagination } = props
  const tableProps = {
    // bordered,
    loading,
    // 多选
    // rowSelection: true
    // size,
    // expandable,
    // title: showTitle ? defaultTitle : undefined,
    // showHeader,
    // footer: showfooter ? defaultFooter : undefined,
    // rowSelection,
    // 横向自适应滚动
    scroll: {
      x: 'max-content'
    },
    // tableLayout,
  };


  // const tableOnChange = (pagination, filters, sorter, extra) => {
  //   console.log(tableOnChange, '--tableOnChange--')
  //   console.log(filters, '--filters--')
  //   console.log(sorter, '--sorter--')
  //   console.log(extra, '--extra--')
  //   handleRequestParams()

  // }

  const tableOnChange: TableProps<DataType>['onChange'] = (pagination: any, filters, sorter: any, extra) => {
    // if (sorter?.column?.sorter) {
    //   if (typeof sorter.column.sorter === 'function') {
    //     return
    //   }
    // }
    const sort = handleSorter(sorter)
    const filter = handleFilters(filters)
    const { current, pageSize } = pagination
    setLoading(true)
    setCurrent(current)
    setPageSize(pageSize)
    handleRequestParams({
      ...sort, ...filter, current, pageSize
    })
  };

  const handleFilters = (filters: any) => {
    const copyFilter = deepCopy(filters)
    for (let key in copyFilter) {
      if (copyFilter.hasOwnProperty(key)) {
        if (copyFilter[key]) {
          copyFilter[key] = JSON.stringify(copyFilter[key])
        }
      }
    }
    return copyFilter
  }

  const handleSorter = (sorter: any) => {
    const { order, columnKey } = sorter
    let value = null
    let column = columnKey
    switch (order) {
      // 升序
      case "ascend":
        value = 1
        break
      // 降序
      case "descend":
        value = 0
        break
      default:
        column = ''
    }
    return {
      column_name: column,
      order: value
    }
  }

  return (
    <>
      <Table dataSource={data || []} columns={columns.filter(item => item.status)} bordered {...tableProps}
        rowSelection={rowSelection}
        rowKey={(data, index) => {
          return !!rowKey && data?.[rowKey] ? data?.[rowKey] : index
        }}
        onChange={tableOnChange} pagination={{ // 具体配置可看antd官网文档Pagination的API部分
          position: ['bottomRight'],
          size: 'small',
          showQuickJumper: true,
          defaultCurrent: 1,
          total: total,
          pageSize: pageSize,
          current: current,
          showSizeChanger: true,
          showTotal: total => `${intl.formatMessage({ id: 'pages.tabTotal' })} ${total} ${intl.formatMessage({ id: 'pages.tabItems' })}`,
          // onChange: () => getDevicePrtObj()
        }} />
      {
        !(total > pageSize && showPagination) && <br />
      }
    </>
  );
}

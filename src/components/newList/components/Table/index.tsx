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
  isMultiple: boolean
  setMultipleList(list: any): any
  setMultipleValueList(list: any): any
  multipleList: any[]
}

export default function CustomTable(props: IAppProps) {
  const intl = useIntl();
  const { handleRequestParams } = props
  const { columns, total, data, loading, current, pageSize, setCurrent, setLoading, setPageSize, showPagination, isMultiple, setMultipleList, multipleList, setMultipleValueList } = props
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
      ...sort, ...filter, page_num: current, size: pageSize
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

  const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys, '--', selectedRows);
    setMultipleList(newSelectedRowKeys);
    setMultipleValueList(selectedRows)
  };

  const rowSelection = {
    selectedRowKeys: multipleList,
    onChange: onSelectChange,
    getCheckboxProps: (record: any) => {
      record.original_url = record.original_url || ''
      return {
        // disabled: record.original_url.includes('.txt'),
        disabled: false,
        name: record.name,
      }
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  return (
    <>
      <Table rowSelection={isMultiple ? rowSelection : null} dataSource={data || []} columns={columns.filter(item => item.status)} bordered {...tableProps}
        rowKey={(data, index) => {
          return index
        }}
        onChange={tableOnChange} pagination={showPagination ? { // 具体配置可看antd官网文档Pagination的API部分
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
        } : null} />
      {
        !(total > pageSize && showPagination) && <br />
      }
    </>
  );
}

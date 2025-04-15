import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';

import './style.less'
import { send } from './service'

import { Form, Input, Select, Button, DatePicker, Table, Tooltip } from 'antd'
import { deepCopy } from '@/utils'

function Project(props, ref) {

  const { columns, data, getData, loading, current, pageSize, setCurrent, setLoading, setPageSize, handleRequestParams } = props
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

  const tableOnChange = async (pagination: any, filters, sorter: any, extra) => {
    if (sorter?.column?.sorter) {
      if (typeof sorter.column.sorter === 'function') {
        return
      }
    }
    const sort = handleSorter(sorter)
    const filter = handleFilters(filters)
    const { current, pageSize } = pagination
    // setCurrent(current)
    // setPageSize(pageSize)
    handleRequestParams({
      ...sort, ...filter, current, pageSize
    })
  };



  return (
    <Table columns={columns} scroll={{
      x: 'max-content'
    }} loading={loading} dataSource={data.data} onChange={tableOnChange} className='table-container' rowKey={(record, index) => index} pagination={{ // 具体配置可看antd官网文档Pagination的API部分
      size: 'small',
      showQuickJumper: true,
      defaultCurrent: 1,
      total: data.total,
      pageSize: pageSize,
      current: current,
      showSizeChanger: true,
      pageSizeOptions: [
        5, 10, 20, 50, 100
      ]
      // onChange: () => getDevicePrtObj()
    }} />
  );
}

export default forwardRef(Project)
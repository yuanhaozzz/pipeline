import React from 'react';
import { Pagination } from 'antd';
import type { PaginationProps } from 'antd';
import './style.less';

interface IProps {
    current: number,
    size: number,
    total: number,
    onChange?: Function,
    showSizeChanger?: boolean,
    showQuickJumper?: boolean,
}

const PaginationCom = (props: IProps) => {
    const { total = 0, current = 1, size = 10, showSizeChanger = true, showQuickJumper = true, onChange: sizeChange } = props;

    const onChange: PaginationProps['onChange'] = (page, pageSize) => {
        sizeChange(page, pageSize);
    };

    const showTotal = (total: number) => `共 ${total} 条`;

    return (
        <div className='paginationWrap'>
            <Pagination
                total={total}
                current={current}
                pageSize={size}
                defaultCurrent={current}
                responsive={true}
                onChange={onChange}
                showTotal={showTotal}
                defaultPageSize={10}
                pageSizeOptions={[10, 20, 50, 100]}
                showSizeChanger={showSizeChanger}
                showQuickJumper={showQuickJumper}
            />
        </div>
    )
};

export default PaginationCom;
import React, { useImperativeHandle, forwardRef, useState } from 'react';
import { Select } from 'antd';

interface labelValue {
    label: string | number,
    value: string | number,
}
interface IProps {
    options: Array<labelValue>,
    placeholder: string,
    value?: string,
    classNm?: string,
    style?: Object,
    onSearch?: (value: string) => void,
    onChange?: (value: string, option: any) => void,
}

const SelectSearch = (props: IProps, ref: any) => {
    const { classNm= '', style={}, options = [], placeholder = '', value, onChange, onSearch } = props || {};
    const [newVal, setValue]= useState();

    useImperativeHandle(ref, () => ({
        getValue,
        setValue
    }));

    const getValue = ()=>{
        return newVal;
    };

    if(!options) return <></>;
    return (
        <Select
            showSearch
            style={style}
            className={classNm}
            value={newVal}
            defaultValue={value}
            onChange={onChange}
            onSearch={onSearch}
            placeholder={placeholder}
            optionFilterProp="children"
            filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={options}
        />
    );
};

export default React.memo(forwardRef(SelectSearch));
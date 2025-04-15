

export type Form = {
    label: string;
    name: string;
    initialValue?: any
}

// 输入框
export type InputOptions = {
    [key: string]: any;
}

// 下拉框数据格式
export type SelectOptionsContent = {
    value: string | number;
    label: string;
}

// 下拉框
export type SelectOptions = {
    options?: SelectOptionsContent[],
    [key: string]: any;
}

// 下拉远程搜索
export type SelectRemoteOptions = {
    getOptionsList(value: string): any
    options?: SelectOptionsContent[],
    [key: string]: any;
}

// 日期
export type RangePickerOptions = {
    [key: string]: any;
}

export type SearchOptionsKeys = {
    type: 'input',
    form: Form,
    componentOptions?: InputOptions

} | {
    type: 'select',
    form: Form,
    componentOptions: SelectOptions
} | {
    type: 'selectMultiple',
    form: Form,
    componentOptions: SelectOptions
} | {
    type: 'selectRemote',
    form: Form,
    componentOptions: SelectRemoteOptions
} | {
    type: 'rangePicker',
    form: Form,
    componentOptions?: RangePickerOptions
}


export interface DragElementType {
    width: number;
    height: number;
    offsetLeft: number;
    offsetTop: number;

}

export type ButtonType = {
    // 联合类型有问题，暂时先any
    type: any;
    icon?: any;
    label: string;
    danger?: boolean;
    ghost?: boolean;
    onClick(e: any): void;
    [key: string]: any;
}


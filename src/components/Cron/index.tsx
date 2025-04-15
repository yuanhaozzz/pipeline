import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Space, Modal, TimePicker, Checkbox, Select } from 'antd';
import React, { useImperativeHandle, forwardRef, useState } from 'react'
import moment from 'moment';
import { useIntl } from 'umi';
import { weekList } from './data';
import styles from './style.less';

interface Iprops {
  isShow: boolean,
  list: Array<any>,
  handleOk?: Function,
  handleCancel?: Function,
}

const CronComp = (props: Iprops, ref: any) => {
  const intl = useIntl();
  const { isShow = false, list = [], handleOk = () => { }, handleCancel = () => { } } = props || {};
  const [isTimeOpen, setTimeOpen] = useState(false);
  const [form] = Form.useForm();
  const isEn = (localStorage.getItem('currentLocal') || navigator.language).includes('en');

  useImperativeHandle(ref, () => ({}));

  const onFinish = (values: any) => {
    const arr = values?.remind?.map(({ week, time, last_week }) => {
      const hms = moment(time).hours() + ':' + moment(time).minutes() + ':' + moment(time).seconds();
      return {
        week,
        time: hms,
        last_week: last_week || false,
      }
    })
    handleOk(arr || []);
    form.resetFields();
  };

  const handleTimeOpen = (open: boolean) => {
    setTimeOpen(open);
  }

  return (
    <Modal wrapClassName={styles.CroModal} title={intl.formatMessage({ id: 'pages.reportManage.SetReminderTime' })} open={isShow} onOk={onFinish} onCancel={handleCancel} maskClosable={false} width={660} footer={false} >
      <div className={styles.CronWrap}>
        <Form form={form} onFinish={onFinish} autoComplete="off">
          <Form.List name="remind" initialValue={list}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} className={styles.inner} align="baseline">
                    <Form.Item {...restField} name={[name, 'week']} rules={[{ required: true, message: intl.formatMessage({ id: 'pages.reportManage.selectDatePlaceholder' }) }]}>
                      <Select className={styles.comWidth} options={weekList} placeholder={intl.formatMessage({ id: 'pages.reportManage.selectDatePlaceholder' })} allowClear />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'time']} rules={[{ required: true, message: intl.formatMessage({ id: 'pages.reportManage.selecTimePlaceholder' }) }]}>
                      <TimePicker onOpenChange={handleTimeOpen} className={styles.comWidth} format="HH:mm:ss" value-format="HH:mm:ss" placeholder={intl.formatMessage({ id: 'pages.reportManage.selecTimePlaceholder' })} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'last_week']} valuePropName="checked">
                      <Checkbox>提醒上周周报</Checkbox>
                    </Form.Item>
                    <MinusCircleOutlined className={styles.font14} onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={!isEn && <PlusOutlined />} >{isEn && intl.formatMessage({ id: 'pages.add' })}</Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <p className={styles.btnSubmit}>
              <Button disabled={isTimeOpen} type="primary" htmlType="submit">{intl.formatMessage({ id: 'pages.confirm' })}</Button>
            </p>
          </Form.Item>
        </Form>
      </div>
    </Modal >
  );
};

export default forwardRef(CronComp);
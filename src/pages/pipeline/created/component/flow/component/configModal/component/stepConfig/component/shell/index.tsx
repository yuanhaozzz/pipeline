import React, { useEffect, useState, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { Form, Input, Select, Button, Tabs } from 'antd'
import { xcodeDark } from '@uiw/codemirror-theme-xcode';
import { langs } from '@uiw/codemirror-extensions-langs';

import './style.less'
import { send } from './service'

function Project(props: any) {
  const { form, config, type } = props
  const variableRef = useRef<any>(null)

  useEffect(() => {
    initForm()
  }, [])

  const initForm = () => {
    form.setFieldValue('script', config.script || '#!/usr/bin/env bash\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
  }

  return (
    <Form.Item name="script" label="shell" rules={[{ required: true, message: '请输入' }]}>
      <CodeMirror
        height="500px"
        extensions={[langs.shell()]}
        theme={xcodeDark}
        readOnly={type !== 1}
      />
    </Form.Item>
  );
}

export default Project
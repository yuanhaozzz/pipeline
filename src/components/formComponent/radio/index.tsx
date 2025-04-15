import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';

import './style.less'
import { send } from './service'

function Project(props, ref) {
  const { options = [], disabled = false, defaultValue } = props


  const [selectedOption, setSelectedOption] = useState(defaultValue || options[0]?.value);

  useImperativeHandle(ref, () => ({
    getValue,
    setValue,
  }))

  const getValue = () => {
    return selectedOption
  }

  const setValue = (value) => {
    setSelectedOption(value)
  }

  const handleOptionClick = (select) => {
    setSelectedOption(select)
  }

  return (
    <div className="common-component-radio-container">
      {
        options.map(item => (
          <label key={item.value} >
            <div className={`radio-option flex-center`}>
              <span className={`redio ${selectedOption === item.value && 'radio-checked'} ${disabled && 'radio-disabled'}`}>
                <input type="radio" value={item.value} checked={selectedOption === item.value} onChange={() => handleOptionClick(item.value)} disabled={disabled} />
                <span className='radio-inner'></span>
              </span>
              <span className="radio-label">{item.label}</span>
            </div>
          </label>
        ))
      }
    </div>
  );
}

export default forwardRef(Project)
import React, { CSSProperties } from 'react';
import classNames from 'classnames';
import styles from './index.less';

export interface IProps {
  src: string;
  style?: CSSProperties;
  className?: string;
  size?: number | string;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  id?: string;
}

const Icon: React.FC<IProps> = ({
  src,
  style = {},
  size = '',
  className,
  onClick = () => { },
  id = '',
}) => {
  const initStyle = {
    backgroundImage: `url(${src})`,
    width: size,
    height: size,
    ...style,
  };
  const cx = classNames(styles.icon, className);
  return <div id={id} className={cx} style={initStyle} onClick={onClick} />;
};

export default Icon;

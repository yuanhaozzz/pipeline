import { Spin } from 'antd';
import styles from './style.less';

interface IProps {
  size?: 'small' | 'default' | 'large'
}
export default (props: IProps) => {
  const { size = 'large' } = props

  return <div className={styles.loading}>
    <Spin size={size} />
  </div>
}

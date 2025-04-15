import { useModel } from 'umi';
import { WaterMark } from '@ant-design/pro-components';
import styles from './style.less';

interface IProps {
    children: any,
    content?: string,
    zIndex?: number,
    gapX?: number,
    gapY?: number,
}

export default (props: IProps) => {
    const { initialState } = useModel('@@initialState');
    const { display_name = '', username = '', } = initialState?.currentUser || {};
    const { content = `${display_name}(${username})`, zIndex = 10000, gapX = 320, gapY = 280, children } = props;

    return <WaterMark
        zIndex={zIndex}
        gapX={gapX}
        gapY={gapY}
        content={content}
    >
        <div className={styles.flowRoot}>
            {children}
        </div>
    </WaterMark>
};

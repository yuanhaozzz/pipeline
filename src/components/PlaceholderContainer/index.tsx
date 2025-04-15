import { Spin, Empty } from 'antd'
import { FormattedMessage } from 'umi'

export interface IAppProps {
    loading: boolean
    height: number
    data: any[]
    children: any
}

export default function PlaceholderContainer(props: IAppProps) {
    const { loading, height, children, data } = props
    return (
        <>
            {
                loading ? <div className='flex-center' style={{ height }}><Spin tip="Loading..."></Spin></div> : data?.length > 0 ? <>
                    {children}
                </> : <div className='flex-center' style={{ height }}><Empty description={<FormattedMessage id="pages.empty" />} /></div>
            }
        </>
    );
}

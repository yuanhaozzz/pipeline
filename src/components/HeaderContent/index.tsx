import { useEffect, useState, useRef } from 'react';
import { notification } from '@/apis/login';
import { history } from 'umi'
import { SoundOutlined } from '@ant-design/icons';
import { useClientSize } from '@/utils/Hooks/clientSize';
import { getCookie } from '@/utils'
import './style.less';

const Header: React.FC = () => {
    const [data, setData] = useState<any>({});
    const [width, setWidth] = useState(0);
    const marqueeRef = useRef<any>();
    const { width: clientWidth } = useClientSize();

    useEffect(() => {
        init();
    }, []);

    const init = () => {
        resize();
        getCookie('token') && getInfo();
    };

    useEffect(() => {
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        }
    }, [])

    const resize = () => {
        const _width = document.querySelector('.headerNotice')?.offsetWidth;
        setWidth(_width);
    }

    const getInfo = async () => {
        try {
            const res = await notification();
            setData(res?.data || {});
        } catch (err) {
            console.log('--notification-err', err);
        }
    };

    const toPackag = () => {
        history.push('/packagingService');
    }
    const toVoice = () => {
        history.push('/myVoice/goodIdeas');
    }
    const voiceDetail = () => {
        history.push(`/myVoice/goodIdeas/detail?id=12`);
    }

    const marqueeStop = () => {
        marqueeRef.current.stop();
    }
    const marqueeStart = () => {
        marqueeRef.current.start();
    }

    return <div className='headerNotice'>
        {/* {
            clientWidth < 1281 && width > 980
                ? <marquee ref={marqueeRef} scrolldelay='110' scrollamount='8' onMouseOut={marqueeStart} onMouseOver={marqueeStop}>
                    <SoundOutlined />&nbsp;&nbsp;平台上线一周年&双节庆，欢迎参与“<a href="http://dolphin.enflame.cn/myVoice/goodIdeas" target='_blank'>My Voice-燧新声发帖集赞</a>”、“<a href="http://dolphin.enflame.cn/myVoice/goodIdeas/detail/?id=12" target='_blank'>曜图相机斗图</a>”活动，更多奖励等你来拿！“<a href="http://dolphin.enflame.cn/packagingService" target='_blank'>编包服务</a>”也已上线，欢迎使用和意见反馈！
                </marquee >
                : <><SoundOutlined />&nbsp;&nbsp;平台上线一周年&双节庆，欢迎参与“<a href="http://dolphin.enflame.cn/myVoice/goodIdeas" target='_blank'>My Voice-燧新声发帖集赞</a>”、“<a href="http://dolphin.enflame.cn/myVoice/goodIdeas/detail/?id=12" target='_blank'>曜图相机斗图</a>”活动，更多奖励等你来拿！“<a href="http://dolphin.enflame.cn/packagingService" target='_blank'>编包服务</a>”也已上线，欢迎使用和意见反馈！</>
        } */}

        {data?.status === 'enabled' && !!data?.content && <>
            {
                (width > 468 && data?.content?.length > 72) || (width > 1165 && data?.content?.length > 182)
                    ? <marquee ref={marqueeRef} scrolldelay='110' scrollamount='8' onMouseOut={marqueeStart} onMouseOver={marqueeStop}>
                        <SoundOutlined />&nbsp;&nbsp;{data?.content}
                    </marquee >
                    : <><SoundOutlined /> &nbsp;&nbsp;{data?.content}</>
            }
        </>
        }
    </div >
}

export default Header;
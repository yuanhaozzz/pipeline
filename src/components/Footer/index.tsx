import { useIntl } from 'umi';
//import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';
import { history } from 'umi';

const Footer: React.FC = () => {
  const intl = useIntl();
  const loginPath = '/user/login';
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '',
  });

  const currentYear = new Date().getFullYear();

  return <>
    {
      history.location.pathname !== loginPath && 
      <DefaultFooter copyright={`${currentYear} ${defaultMessage}`} />
    }
  </>
  
};

export default Footer;

import { Card } from 'antd';
import { useLocation } from 'react-router-dom';

const UnderDevelopment = () => {
    const location = useLocation();
    const pageName = location.pathname.substring(1); // 移除开头的 '/'

    return (
        <div>
            <Card>
                {pageName} 功能正在开发中...
            </Card>
        </div>
    );
};

export default UnderDevelopment; 
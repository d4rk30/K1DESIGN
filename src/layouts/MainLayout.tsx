import { Layout, Menu, theme, Dropdown, Space, Breadcrumb } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import {
    DashboardOutlined,
    HomeOutlined,
    AlertOutlined,
    GlobalOutlined,
    KeyOutlined,
    RadarChartOutlined,
    SafetyCertificateOutlined,
    EyeInvisibleOutlined,
    SettingOutlined,
    FileOutlined,
    ToolOutlined,
    UserOutlined,
    LogoutOutlined,
    LockOutlined,
} from '@ant-design/icons';
import logo from '../assets/images/logo.png';

const { Header, Content, Sider } = Layout;

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const menuItems = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: '首页',
        },
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: '仪表盘',
        },
        {
            key: 'attack-monitor',
            icon: <AlertOutlined />,
            label: '攻击监测告警',
            children: [
                {
                    key: 'attack-logs',
                    label: '攻击监测日志',
                },
                {
                    key: 'attack-ip-analysis',
                    label: '攻击IP分析',
                },
                {
                    key: 'attacked-ip-analysis',
                    label: '被攻击IP分析',
                },
            ],
        },
        {
            key: 'external-monitor',
            icon: <GlobalOutlined />,
            label: '外联检测告警',
            children: [
                {
                    key: 'external-logs',
                    label: '外联检测日志',
                },
                {
                    key: 'controlled-host',
                    label: '受控主机分析',
                },
                {
                    key: 'external-target',
                    label: '外联目标分析',
                },
            ],
        },
        {
            key: 'weak-password',
            icon: <KeyOutlined />,
            label: '弱口令登录告警',
        },
        {
            key: 'exposure-monitor',
            icon: <RadarChartOutlined />,
            label: '暴露面监测告警',
            children: [
                {
                    key: 'exposure-logs',
                    label: '暴露面检测日志',
                },
                {
                    key: 'exposure-assets',
                    label: '暴露面资产情况',
                },
            ],
        },
        {
            key: 'threat-intelligence',
            icon: <SafetyCertificateOutlined />,
            label: '威胁情报',
            children: [
                {
                    key: 'threat-trace',
                    label: '威胁情报溯源',
                },
                {
                    key: 'public-intelligence',
                    label: '公有情报管理',
                },
                {
                    key: 'private-intelligence',
                    label: '私有情报管理',
                },
                {
                    key: 'false-positive',
                    label: '误报反馈',
                },
            ],
        },
        {
            key: 'app-stealth',
            icon: <EyeInvisibleOutlined />,
            label: '应用隐身',
        },
        {
            key: 'policy',
            icon: <SettingOutlined />,
            label: '策略配置',
            children: [
                {
                    key: 'attack-policy',
                    label: '攻击监测策略',
                },
                {
                    key: 'external-policy',
                    label: '外联检测策略',
                },
                {
                    key: 'password-policy',
                    label: '弱口令登录策略',
                },
                {
                    key: 'ip-access-control',
                    label: 'IP访问控制',
                },
                {
                    key: 'blackwhite-list',
                    label: '黑白名单',
                },
                {
                    key: 'exposure-policy',
                    label: '暴露面监测策略',
                },
            ],
        },
        {
            key: 'reports',
            icon: <FileOutlined />,
            label: '报表导出',
        },
        {
            key: 'system',
            icon: <ToolOutlined />,
            label: '系统管理',
            children: [
                {
                    key: 'asset-management',
                    label: '防护资产管理',
                },
                {
                    key: 'system-config',
                    label: '系统配置',
                },
                {
                    key: 'system-status',
                    label: '系统状态',
                },
                {
                    key: 'network-config',
                    label: '网络配置',
                },
                {
                    key: 'v01-config',
                    label: 'V01通道配置',
                },
                {
                    key: 'license',
                    label: '许可授权',
                },
                {
                    key: 'syslog-config',
                    label: 'Syslog配置',
                },
                {
                    key: 'upgrade',
                    label: '升级管理',
                },
                {
                    key: 'backup',
                    label: '备份及回退',
                },
                {
                    key: 'system-operation',
                    label: '系统操作',
                },
                {
                    key: 'maintenance-tools',
                    label: '运维工具',
                },
                {
                    key: 'central-management',
                    label: '集中管理配置',
                },
                {
                    key: 'about',
                    label: '关于我们',
                },
            ],
        },
    ];

    const userMenuItems = [
        {
            key: 'change-password',
            icon: <LockOutlined />,
            label: '修改密码',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
        },
    ];

    const handleMenuClick = (key: string) => {
        navigate(`/${key}`);
    };

    const handleUserMenuClick = ({ key }: { key: string }) => {
        if (key === 'logout') {
            console.log('logout clicked');
        } else if (key === 'change-password') {
            console.log('change-password clicked');
        }
    };

    const getSelectedKeys = () => {
        const pathname = location.pathname.substring(1);
        return [pathname];
    };

    const getOpenKeys = (pathname: string) => {
        const parentKey = menuItems.find(item =>
            item.children?.some(child => child.key === pathname)
        )?.key;

        return parentKey ? [parentKey] : [];
    };

    useEffect(() => {
        const pathname = location.pathname.substring(1);
        if (!collapsed) {
            setOpenKeys(getOpenKeys(pathname));
        }
    }, [location.pathname, collapsed]);

    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys);
    };

    const breadcrumbItems = useMemo(() => {
        const pathname = location.pathname.substring(1);

        const findMenuItem = (menuItems: any[], path: string): any[] => {
            for (const item of menuItems) {
                if (item.key === path) {
                    return [{ title: item.label }];
                }
                if (item.children) {
                    const found = findMenuItem(item.children, path);
                    if (found.length > 0) {
                        return [{ title: item.label }, ...found];
                    }
                }
            }
            return [];
        };

        return findMenuItem(menuItems, pathname);
    }, [location.pathname, menuItems]);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 24px',
                backgroundColor: 'rgba(0, 80, 173, 1)',
                justifyContent: 'space-between',
                position: 'fixed',
                width: '100%',
                zIndex: 1000,
            }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={logo}
                        alt="Logo"
                        style={{
                            height: '32px',
                            marginRight: '16px'
                        }}
                    />
                    <div style={{ color: '#fff', fontSize: '16px' }}>
                        网盾K01 | 网络威胁联防阻断系统
                    </div>
                </div>

                <Dropdown
                    menu={{
                        items: userMenuItems,
                        onClick: handleUserMenuClick,
                    }}
                    placement="bottomRight"
                >
                    <Space style={{
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}>
                        <UserOutlined />
                        <span>Admin</span>
                    </Space>
                </Dropdown>
            </Header>

            <Layout style={{ marginTop: 64 }}>
                <Sider
                    width={200}
                    style={{
                        position: 'fixed',
                        left: 0,
                        top: 64,
                        bottom: 0,
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                >
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 'calc(100vh - 64px)',
                    }}>
                        <Menu
                            theme="dark"
                            mode="inline"
                            selectedKeys={getSelectedKeys()}
                            openKeys={collapsed ? [] : openKeys}
                            onOpenChange={handleOpenChange}
                            style={{
                                height: '100%',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                            }}
                            items={menuItems}
                            onClick={({ key }) => handleMenuClick(key)}
                            motion={{
                                motionName: '',
                                motionAppear: false,
                                motionEnter: false,
                                motionLeave: false
                            }}
                        />
                    </div>
                </Sider>

                <Layout style={{
                    padding: '0 0 24px',
                    marginLeft: collapsed ? 80 : 200,
                    transition: 'margin-left 0.2s',
                }}>
                    <div style={{
                        padding: '16px 24px',
                        background: colorBgContainer,
                        position: 'sticky',
                        top: 64,
                        zIndex: 2,
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <div style={{ padding: '24px' }}>
                        <Outlet />
                    </div>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default MainLayout; 
import { Layout, Menu, theme, Dropdown, Space, Breadcrumb, Switch, Tooltip } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import {
    DashboardOutlined,
    HomeOutlined,
    AlertOutlined,
    GlobalOutlined,
    KeyOutlined,
    RadarChartOutlined,
    EyeInvisibleOutlined,
    SettingOutlined,
    FileOutlined,
    ToolOutlined,
    UserOutlined,
    LogoutOutlined,
    LockOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import LabelRangePicker from '@/components/LabelRangePicker';

const { Header, Sider } = Layout;

const MainLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const {
        token: { colorBgContainer },
    } = theme.useToken();
    const [autoRefresh, setAutoRefresh] = useState(false);

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
            key: 'anti-mapping',
            icon: <RadarChartOutlined />,
            label: '反测绘监测告警',
            children: [
                {
                    key: 'anti-mapping-logs',
                    label: '反测绘日志',
                },
                {
                    key: 'anti-mapping-sources',
                    label: '测绘源分析',
                },
                {
                    key: 'anti-mapping-assets',
                    label: '测绘资产分析',
                },
            ],
        },
        {
            key: 'threat-intelligence',
            icon: <RadarChartOutlined />,
            label: '威胁情报',
            children: [
                {
                    key: 'threat-intelligence-trace',
                    label: '威胁情报溯源',
                },
                {
                    key: 'public-intelligence',
                    label: '公有情报源管理',
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
                    key: 'anti-mapping-policy',
                    label: '反测绘监测策略',
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

    const currentPath = location.pathname;

    const getSelectedKeys = () => {
        if (currentPath.startsWith('/asset-management/')) {
            return ['asset-management'];
        }
        if (currentPath.startsWith('/threat-intelligence-trace/')) {
            return ['threat-intelligence-trace'];
        }
        return [currentPath.substring(1)];
    };

    const getOpenKeys = (pathname: string) => {
        if (currentPath.startsWith('/asset-management/')) {
            return ['system'];
        }
        if (currentPath.startsWith('/threat-intelligence-trace/')) {
            return ['threat-intelligence'];
        }
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

        if (pathname === 'threat-intelligence-trace/detail') {
            const type = location.state?.type;
            return [
                { title: '威胁情报' },
                {
                    title: '威胁情报溯源',
                    onClick: () => navigate('/threat-intelligence-trace')
                },
                { title: type === 'attack' ? '攻击情报查询' : '外联情报查询' }
            ];
        }

        if (pathname.startsWith('asset-management/')) {
            return [
                { title: '系统管理' },
                {
                    title: '防护资产管理',
                    onClick: () => navigate('/asset-management')
                },
                { title: '资产列表' }
            ];
        }

        const findMenuItem = (items: any[], path: string): any[] => {
            for (const item of items) {
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

        const pathParts = pathname.split('/');
        const mainPath = pathParts[0];
        const items = findMenuItem(menuItems, mainPath);

        return items;
    }, [location.pathname, location.state, menuItems, navigate]);

    const renderUpdateTime = () => {
        const pathname = location.pathname.substring(1);
        if (pathname === 'dashboard') {
            return (
                <div style={{
                    fontSize: '14px',
                    color: '#666',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginLeft: '16px'
                }}>
                    <span style={{
                        width: '6px',
                        height: '6px',
                        background: '#52c41a',
                        borderRadius: '50%',
                        display: 'inline-block'
                    }} />
                    最近更新: 10分钟前
                </div>
            );
        }
        return null;
    };

    const renderAntiMappingControls = () => {
        const pathname = location.pathname.substring(1);
        const antiMappingPages = [
            'anti-mapping-logs',
            'anti-mapping-sources',
            'anti-mapping-assets'
        ];

        if (antiMappingPages.includes(pathname)) {
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginLeft: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                    }}>
                        <span>自动刷新</span>
                        <Tooltip title="开启自动刷新后每隔两分钟刷新一次数据，数据受到右侧时间筛选器的影响">
                            <InfoCircleOutlined style={{ color: '#999', fontSize: '14px' }} />
                        </Tooltip>
                        <Switch
                            checked={autoRefresh}
                            onChange={(checked) => {
                                setAutoRefresh(checked);
                            }}
                        />
                    </div>
                    <LabelRangePicker
                        label="时间范围"
                        placeholder={['开始时间', '结束时间']}
                        presets={[
                            {
                                label: '今日',
                                value: [dayjs().startOf('day'), dayjs().endOf('day')]
                            },
                            {
                                label: '本周',
                                value: [dayjs().startOf('week'), dayjs().endOf('week')]
                            },
                            {
                                label: '当月',
                                value: [dayjs().startOf('month'), dayjs().endOf('month')]
                            }
                        ]}
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                    />
                </div>
            );
        }
        return null;
    };

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
                        src="/images/logo.png"
                        alt="logo"
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
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Breadcrumb items={breadcrumbItems} />
                            <div style={{
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {renderUpdateTime()}
                                {renderAntiMappingControls()}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        padding: '24px',
                        flex: 1,
                        minHeight: 'calc(100% - 55px)',
                    }}>
                        <Outlet />
                    </div>
                </Layout>
            </Layout>
        </Layout >
    );
};

export default MainLayout; 
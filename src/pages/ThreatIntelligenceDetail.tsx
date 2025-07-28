import React, { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, Table, Tag, Space, Button, Input, message, Modal, Form, Upload, Carousel, Alert, Empty, Spin } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { SearchOutlined, ReloadOutlined, UpOutlined, DownOutlined, CopyOutlined, ApartmentOutlined, GlobalOutlined, ApiOutlined, LinkOutlined, InboxOutlined, LeftOutlined, RightOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import LabelSelect from '@/components/LabelSelect';
import { US, CN, GB, FR, DE, RU } from 'country-flag-icons/react/3x2';
import LabelInput from '@/components/LabelInput';
import LabelTextArea from '@/components/LabelTextArea';
import type { UploadFile, UploadProps } from 'antd';
import ReactECharts from 'echarts-for-react';

// 置信度星星组件
const ConfidenceStars: React.FC<{ level: number }> = ({ level }) => {
    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3].map((star) => (
                star <= level ? (
                    <StarFilled key={star} style={{ color: '#faad14', fontSize: 16 }} />
                ) : (
                    <StarOutlined key={star} style={{ color: '#d9d9d9', fontSize: 16 }} />
                )
            ))}
        </div>
    );
};

// 自定义波浪移动loading组件
const WaveLoading: React.FC<{ size?: number; color?: string }> = ({ size = 12, color = '#1890ff' }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        backgroundColor: color,
                        animation: `waveMove 1.4s ease-in-out infinite`,
                        animationDelay: `${index * 0.2}s`
                    }}
                />
            ))}
            <style>
                {`
                    @keyframes waveMove {
                        0%, 60%, 100% {
                            transform: translateY(0);
                            opacity: 0.4;
                        }
                        30% {
                            transform: translateY(-8px);
                            opacity: 1;
                        }
                    }
                `}
            </style>
        </div>
    );
};

const VendorCardWithLoading: React.FC<{
    vendor: string;
    isLoading: boolean;
    children: React.ReactNode;
}> = ({ isLoading, children }) => {
    return (
        <div style={{ position: 'relative' }}>
            {children}
            {isLoading && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        borderRadius: '6px'
                    }}
                >
                    <WaveLoading size={8} color="#1890ff" />
                </div>
            )}
        </div>
    );
};

const ThreatIntelligenceDetail: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryType = location.state?.type;
    const inputType = location.state?.inputType;
    const query = location.state?.query;

    const [activeTabKey, setActiveTabKey] = useState<string>('attackTrace');
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [feedbackForm] = Form.useForm();
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const carouselRef = useRef<any>(null);
    const [showAlert, setShowAlert] = useState(true);
    const [countdown, setCountdown] = useState(5);
    const [attackTraceLoading, setAttackTraceLoading] = useState(true);
    const [fingerprintLoading, setFingerprintLoading] = useState(false);
    const [portsLoading, setPortsLoading] = useState(false);
    const [sameSegmentLoading, setSameSegmentLoading] = useState(false);
    const [reverseDomainLoading, setReverseDomainLoading] = useState(false);
    const [dnsRecordsLoading, setDnsRecordsLoading] = useState(false);
    const [whoisLoading, setWhoisLoading] = useState(false);
    const [subdomainsLoading, setSubdomainsLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [vendorLoadingList, setVendorLoadingList] = useState(Array(8).fill(true));
    const [overviewFieldsLoading, setOverviewFieldsLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [communicationModalVisible, setCommunicationModalVisible] = useState(false);
    const [currentVendor, setCurrentVendor] = useState<string>('');
    const [virusFamilyModalVisible, setVirusFamilyModalVisible] = useState(false);
    const [currentVirusFamily, setCurrentVirusFamily] = useState<string>('');
    const [threatTypeModalVisible, setThreatTypeModalVisible] = useState(false);
    const [vendorLoadingStates, setVendorLoadingStates] = useState({
        '奇安信': true,
        '腾讯': true,
        '360': true,
        '华为': true,
        '阿里云': true,
        '长亭': true
    });

    const attackTabs = [
        { key: 'attackTrace', tab: '攻击实时轨迹' },
        { key: 'fingerprint', tab: '指纹信息' },
        { key: 'ports', tab: '端口信息' },
        { key: 'sameSegment', tab: '同C段信息' },
        { key: 'reverseDomain', tab: '反查域名' }
    ];

    const externalTabsDomain = [
        { key: 'dnsRecords', tab: 'DNS解析记录' },
        { key: 'whois', tab: 'WHOIS' },
        { key: 'fingerprint', tab: '指纹信息' },
        { key: 'subdomains', tab: '子域名' }
    ];

    const externalTabsIp = [
        { key: 'fingerprint', tab: '指纹信息' },
        { key: 'ports', tab: '端口信息' },
        { key: 'sameSegment', tab: '同C段信息' },
        { key: 'reverseDomain', tab: '反查域名' }
    ];

    const getTabs = () => {
        if (queryType === 'attack') {
            return attackTabs;
        }
        if (queryType === 'external') {
            if (inputType === 'ip') {
                return externalTabsIp;
            }
            return externalTabsDomain;
        }
        return [];
    };

    useEffect(() => {
        if (!location.state?.type) {
            navigate('/threat-intelligence-trace');
        }
    }, [location.state, navigate]);

    useEffect(() => {
        const tabs = getTabs();
        if (tabs.length > 0) {
            setActiveTabKey(tabs[0].key);
        }
    }, [queryType, inputType]);


    useEffect(() => {
        if (showAlert) {
            setCountdown(10);
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev === 1) {
                        setShowAlert(false);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [showAlert]);

    // 控制威胁情报概览字段的loading状态
    useEffect(() => {
        const timer = setTimeout(() => {
            setOverviewFieldsLoading(false);
        }, 2000); // 2秒后显示内容

        return () => clearTimeout(timer);
    }, []);

    // 控制多源威胁情报厂商的loading状态
    useEffect(() => {
        const timers: NodeJS.Timeout[] = [];

        // 为每个厂商设置不同的loading时间，模拟真实场景
        const vendors = ['奇安信', '腾讯', '360', '华为', '阿里云', '长亭'];
        vendors.forEach((vendor, index) => {
            const timer = setTimeout(() => {
                setVendorLoadingStates(prev => ({
                    ...prev,
                    [vendor]: false
                }));
            }, 1500 + index * 300); // 1.5秒到3.3秒之间，每个厂商间隔300ms

            timers.push(timer);
        });

        return () => {
            timers.forEach(timer => clearTimeout(timer));
        };
    }, []);

    useEffect(() => {
        if (activeTabKey === 'attackTrace') {
            setAttackTraceLoading(true);
            const timer = setTimeout(() => {
                setAttackTraceLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (activeTabKey === 'fingerprint') {
            setFingerprintLoading(true);
            const timer = setTimeout(() => {
                setFingerprintLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (activeTabKey === 'ports') {
            setPortsLoading(true);
            const timer = setTimeout(() => {
                setPortsLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (activeTabKey === 'sameSegment') {
            setSameSegmentLoading(true);
            const timer = setTimeout(() => {
                setSameSegmentLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (activeTabKey === 'reverseDomain') {
            setReverseDomainLoading(true);
            const timer = setTimeout(() => {
                setReverseDomainLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (activeTabKey === 'dnsRecords') {
            setDnsRecordsLoading(true);
            const timer = setTimeout(() => {
                setDnsRecordsLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (activeTabKey === 'whois') {
            setWhoisLoading(true);
            const timer = setTimeout(() => {
                setWhoisLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
        if (activeTabKey === 'subdomains') {
            setSubdomainsLoading(true);
            const timer = setTimeout(() => {
                setSubdomainsLoading(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [activeTabKey]);

    useEffect(() => {
        setStatsLoading(true);
        setVendorLoadingList(Array(8).fill(true));
        const timer = setTimeout(() => {
            setStatsLoading(false);
            setVendorLoadingList(Array(8).fill(false));
        }, 1000);
        return () => clearTimeout(timer);
    }, [queryType, inputType]);

    const handleTabChange = (key: string) => {
        setActiveTabKey(key);
    };

    const RecordDisplay: React.FC<{
        leftRecords: { label: string; value: string }[];
        rightRecords: { label: string; value: string }[];
        leftStartNumber?: number;
        rightStartNumber?: number;
    }> = ({ leftRecords, rightRecords, leftStartNumber = 1, rightStartNumber = 5 }) => {
        const renderNumberColumn = (start: number, count: number) => (
            <Col span={1} style={{ maxWidth: 30 }}>
                <div style={{ width: 24, backgroundColor: '#E3F1FD', textAlign: 'center', padding: 4, borderRadius: 4, color: '#999' }}>
                    {[...Array(count)].map((_, i) => (
                        <div key={i}>{start + i}</div>
                    ))}
                </div>
            </Col>
        );

        const renderRecordColumn = (records: { label: string; value: string }[]) => (
            <>
                <Col span={3}>
                    <div style={{ padding: 4, color: '#999' }}>
                        {records.map((record, i) => (
                            <div key={i}>{record.label}</div>
                        ))}
                    </div>
                </Col>
                <Col span={8}>
                    <div style={{ padding: 4 }}>
                        {records.map((record, i) => (
                            <div key={i}>{record.value}</div>
                        ))}
                    </div>
                </Col>
            </>
        );

        return (
            <div style={{ fontSize: 14, color: '#333', fontWeight: 400, backgroundColor: '#F7FBFF', padding: '12px 16px', borderRadius: 4, border: '1px solid #f3f3f3' }}>
                <Row gutter={[24, 24]} style={{ borderRadius: 4 }}>
                    {renderNumberColumn(leftStartNumber, leftRecords.length)}
                    {renderRecordColumn(leftRecords)}
                    {renderNumberColumn(rightStartNumber, rightRecords.length)}
                    {renderRecordColumn(rightRecords)}
                </Row>
            </div>
        );
    };

    const renderDNSRecords = () => {
        return (
            <Table
                columns={[
                    {
                        title: '解析结果',
                        dataIndex: 'resolveResult',
                        key: 'resolveResult',
                        width: '25%',
                    },
                    {
                        title: '地理位置',
                        dataIndex: 'location',
                        key: 'location',
                        width: '25%',
                        render: ({ country, city }) => {
                            return <span>{country} | {city}</span>;
                        },
                    },
                    {
                        title: 'ASN',
                        dataIndex: 'asn',
                        key: 'asn',
                        width: '25%',
                    },
                    {
                        title: '记录类型',
                        dataIndex: 'recordType',
                        key: 'recordType',
                        width: '25%',
                        render: (type) => <Tag color="blue">{type}</Tag>
                    }
                ]}
                dataSource={[
                    {
                        key: '1',
                        resolveResult: '156.254.127.112',
                        location: {
                            country: '美国',
                            city: '洛杉矶'
                        },
                        asn: 'AS7922 Comcast Cable Communications',
                        recordType: 'A'
                    },
                    {
                        key: '2',
                        resolveResult: '2001:db8::1',
                        location: {
                            country: '中国',
                            city: '北京'
                        },
                        asn: 'AS4134 China Telecom',
                        recordType: 'AAAA'
                    },
                    {
                        key: '3',
                        resolveResult: '3.46.8.12',
                        location: {
                            country: '德国',
                            city: '柏林'
                        },
                        asn: 'AS3320 Deutsche Telekom AG',
                        recordType: 'NS'
                    },
                    {
                        key: '4',
                        resolveResult: '5.99.6.3',
                        location: {
                            country: '英国',
                            city: '伦敦'
                        },
                        asn: 'AS2856 British Telecommunications PLC',
                        recordType: 'MX'
                    },
                    {
                        key: '5',
                        resolveResult: '3.55.67.23',
                        location: {
                            country: '法国',
                            city: '巴黎'
                        },
                        asn: 'AS3215 Orange S.A.',
                        recordType: 'TXT'
                    }
                ]}
                pagination={{
                    total: 5,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
            />
        );
    };

    const renderWhois = () => {
        const leftRecords = [
            { label: '注册者:', value: 'REDACTED FOR PRIVACY' },
            { label: '注册机构:', value: 'REDACTED FOR PRIVACY' },
            { label: '邮箱:', value: '信息已设置隐私保护' },
            { label: '地址:', value: 'Redacted for Privacy Purposes' },
            { label: '电话:', value: 'ALLOCATED UNSPECIFIED REDACTED FOR PRIVACY' }
        ];

        const rightRecords = [
            { label: '注册时间:', value: '2024-02-29 06:11:09' },
            { label: '过期时间:', value: '2024-02-29 06:11:09' },
            { label: '更新时间:', value: '2024-02-29 06:11:09' },
            { label: '域名服务商:', value: 'Chengdu west dimension digital technology Co., LTD' },
            { label: '域名服务器:', value: 'ns3.4cun.com; ns4.4cun.com' }
        ];

        return <RecordDisplay
            leftRecords={leftRecords}
            rightRecords={rightRecords}
            leftStartNumber={1}
            rightStartNumber={6}
        />;
    };

    const renderSubdomains = () => {
        return (
            <Table
                columns={[
                    {
                        title: '域名',
                        dataIndex: 'domain',
                        key: 'domain',
                        width: '30%',
                    },
                    {
                        title: '威胁等级',
                        dataIndex: 'threatLevel',
                        key: 'threatLevel',
                        width: '20%',
                    },
                    {
                        title: '创建时间',
                        dataIndex: 'firstParseTime',
                        key: 'firstParseTime',
                        width: '25%',
                        sorter: (a, b) => new Date(a.firstParseTime).getTime() - new Date(b.firstParseTime).getTime(),
                    },
                    {
                        title: '更新时间',
                        dataIndex: 'lastParseTime',
                        key: 'lastParseTime',
                        width: '25%',
                        sorter: (a, b) => new Date(a.lastParseTime).getTime() - new Date(b.lastParseTime).getTime(),
                    }
                ]}
                dataSource={[
                    {
                        key: '1',
                        domain: 'mail.example.com',
                        threatLevel: <Tag color="red">高危</Tag>,
                        firstParseTime: '2024-01-15 08:30:00',
                        lastParseTime: '2024-02-29 10:15:23'
                    },
                    {
                        key: '2',
                        domain: 'api.example.com',
                        threatLevel: <Tag color="orange">中危</Tag>,
                        firstParseTime: '2024-01-16 09:45:12',
                        lastParseTime: '2024-02-29 11:20:45'
                    },
                    {
                        key: '3',
                        domain: 'blog.example.com',
                        threatLevel: <Tag color="red">高危</Tag>,
                        firstParseTime: '2024-01-17 14:22:33',
                        lastParseTime: '2024-02-29 09:05:18'
                    },
                    {
                        key: '4',
                        domain: 'dev.example.com',
                        threatLevel: <Tag color="green">低危</Tag>,
                        firstParseTime: '2024-01-18 16:40:55',
                        lastParseTime: '2024-02-29 08:30:42'
                    }
                ]}
                pagination={{
                    total: 4,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
            />
        );
    };

    const TagList: React.FC<{
        title: string;
        tags: string[];
        maxDisplayCount?: number;
    }> = ({ title, tags, maxDisplayCount = 10 }) => {
        const [expanded, setExpanded] = useState(false);
        const shouldShowExpand = tags.length > maxDisplayCount;
        const displayTags = expanded ? tags : tags.slice(0, maxDisplayCount);

        return (
            <div style={{ marginBottom: 16 }}>
                <Row wrap={false} align="middle">
                    <Col flex="120px">
                        <span style={{ color: '#666' }}>{title}</span>
                    </Col>
                    <Col flex="auto">
                        <Space size={[8, 8]} wrap style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {displayTags.map((tag, index) => (
                                <Tag key={index} color="blue">{tag}</Tag>
                            ))}
                            {shouldShowExpand && (
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => setExpanded(!expanded)}
                                    style={{ padding: '0 4px' }}
                                >
                                    {expanded ? '收起' : '展开全部'}
                                </Button>
                            )}
                        </Space>
                    </Col>
                </Row>
            </div>
        );
    };

    const renderFingerprint = () => {
        const fingerprintData = {
            assetTags: [
                'Windows Server', 'IIS 8.5', 'Microsoft-HTTPAPI/2.0',
                'ASP.NET', '.NET Framework 4.0', 'Windows Server 2012',
                'Microsoft SQL Server 2014', 'Windows防火墙', 'Windows更新服务',
                'Remote Desktop Services', 'Windows Management Instrumentation',
                'Windows任务计划程序', 'Windows事件日志'
            ],
            components: [
                'jQuery 1.12.4', 'Bootstrap 3.3.7', 'Vue.js 2.6.11',
                'Axios 0.19.2', 'Moment.js 2.24.0', 'Lodash 4.17.15',
                'ECharts 4.7.0', 'React 16.13.1', 'Webpack 4.42.0',
                'Node.js 12.16.1'
            ],
            titles: [
                '登录页面', '系统管理', '用户管理', '权限管理',
                '日志查询', '数据统计', '监控中心', '配置中心',
                '任务管理', '资源管理'
            ],
            certificates: [
                'DigiCert SHA2 Secure Server CA', 'Let\'s Encrypt Authority X3',
                'Symantec Class 3 EV SSL CA', 'GlobalSign Organization Validation CA',
                'Comodo RSA Domain Validation Secure Server CA'
            ]
        };

        return (
            <div>
                <TagList title="资产标签" tags={fingerprintData.assetTags} />
                <TagList title="组件信息" tags={fingerprintData.components} />
                <TagList title="网站标题" tags={fingerprintData.titles} />
                <TagList title="HTTPS证书" tags={fingerprintData.certificates} />
            </div>
        );
    };

    const PortCard: React.FC<{
        port: number;
        service: string;
    }> = ({ port, service }) => {
        return (
            <div style={{
                padding: '24px 20px',
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                backgroundColor: '#fff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1890ff';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#f0f0f0';
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
            >
                {/* 背景装饰 */}
                <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 60,
                    height: 60,
                    background: 'linear-gradient(135deg, #1890ff10, #1890ff05)',
                    borderRadius: '50%',
                    zIndex: 0
                }} />

                {/* 端口号 */}
                <div style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: '#1890ff',
                    lineHeight: 1,
                    marginBottom: 8,
                    zIndex: 1
                }}>
                    {port}
                </div>

                {/* 服务名称 */}
                <div style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#666',
                    textAlign: 'center',
                    zIndex: 1,
                    letterSpacing: '0.5px'
                }}>
                    服务：{service}
                </div>


            </div>
        );
    };

    // 将renderPorts改为组件
    const RenderPorts: React.FC = () => {
        const [expanded, setExpanded] = useState(false);

        const portsData = [
            { port: 21, service: 'FTP' },
            { port: 22, service: 'SSH' },
            { port: 23, service: 'Telnet' },
            { port: 25, service: 'SMTP' },
            { port: 53, service: 'DNS' },
            { port: 80, service: 'HTTP' },
            { port: 110, service: 'POP3' },
            { port: 143, service: 'IMAP' },
            { port: 443, service: 'HTTPS' },
            { port: 993, service: 'IMAPS' },
            { port: 995, service: 'POP3S' },
            { port: 1433, service: 'MSSQL' },
            { port: 1521, service: 'Oracle' },
            { port: 3306, service: 'MySQL' },
            { port: 3389, service: 'RDP' },
            { port: 5432, service: 'PostgreSQL' },
            { port: 5900, service: 'VNC' },
            { port: 6379, service: 'Redis' },
            { port: 8080, service: 'HTTP Proxy' },
            { port: 8443, service: 'HTTPS Alt' },
            { port: 27017, service: 'MongoDB' }
        ];

        const displayPorts = expanded ? portsData : portsData.slice(0, 12);

        return (
            <div style={{ position: 'relative' }}>
                <Row gutter={[16, 16]} style={{
                    marginBottom: portsData.length > 5 ? 16 : 0,
                }}>
                    {displayPorts.map((port, index) => (
                        <Col key={index} span={4} style={{ paddingLeft: 8, paddingRight: 8 }}>
                            <PortCard {...port} />
                        </Col>
                    ))}
                </Row>

                {portsData.length > 12 && (
                    <div style={{
                        position: 'absolute',
                        bottom: -32,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        cursor: 'pointer',
                        color: '#0E7CFD'
                    }}
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <UpOutlined /> : <DownOutlined />}
                    </div>
                )}
            </div>
        );
    };

    // 保证tabContentsRaw定义在tabContents前面，且只包含纯JSX
    const tabContentsRaw = {
        sameSegment: <Table
            columns={[
                {
                    title: 'IP地址',
                    dataIndex: 'ip',
                    key: 'ip',
                },
                {
                    title: '威胁等级',
                    dataIndex: 'threatLevel',
                    key: 'threatLevel',
                    render: (level) => {
                        const colors: Record<string, string> = {
                            '高危': 'red',
                            '中危': 'orange',
                            '低危': 'green'
                        };
                        return <Tag color={colors[level]}>{level}</Tag>;
                    }
                },
                {
                    title: '情报类型',
                    dataIndex: 'intelType',
                    key: 'intelType',
                },
                {
                    title: '归属地',
                    dataIndex: 'location',
                    key: 'location',
                    render: ({ country, city }) => {
                        // getFlagComponent不是hook，只是普通函数
                        const FlagComponent = getFlagComponent(country);
                        return (
                            <Space>
                                {FlagComponent && <FlagComponent style={{ width: 16 }} />}
                                <span>{country} | {city}</span>
                            </Space>
                        );
                    },
                },
                {
                    title: '创建时间',
                    dataIndex: 'firstAttackTime',
                    key: 'firstAttackTime',
                    sorter: (a, b) => new Date(a.firstAttackTime).getTime() - new Date(b.firstAttackTime).getTime(),
                },
                {
                    title: '更新时间',
                    dataIndex: 'updateTime',
                    key: 'updateTime',
                    sorter: (a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(),
                }
            ]}
            dataSource={[
                {
                    key: '1',
                    ip: '192.168.1.100',
                    threatLevel: '高危',
                    intelType: '恶意扫描',
                    location: {
                        country: '美国',
                        city: '纽约'
                    },
                    firstAttackTime: '2023-12-01 15:30:00',
                    updateTime: '2023-12-05 10:20:00'
                },
                {
                    key: '2',
                    ip: '192.168.1.101',
                    threatLevel: '中危',
                    intelType: 'DDoS攻击',
                    location: {
                        country: '中国',
                        city: '北京'
                    },
                    firstAttackTime: '2023-11-28 09:15:00',
                    updateTime: '2023-12-04 16:45:00'
                },
                {
                    key: '3',
                    ip: '192.168.1.102',
                    threatLevel: '高危',
                    intelType: '漏洞利用',
                    location: {
                        country: '俄罗斯',
                        city: '莫斯科'
                    },
                    firstAttackTime: '2023-11-25 14:20:00',
                    updateTime: '2023-12-03 11:30:00'
                },
                {
                    key: '4',
                    ip: '192.168.1.103',
                    threatLevel: '低危',
                    intelType: '可疑流量',
                    location: {
                        country: '英国',
                        city: '伦敦'
                    },
                    firstAttackTime: '2023-11-20 08:40:00',
                    updateTime: '2023-12-02 09:15:00'
                }
            ]}
            pagination={{
                total: 4,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
            }}
        />,
        reverseDomain: <Table
            columns={[
                {
                    title: '域名',
                    dataIndex: 'domain',
                    key: 'domain',
                    width: '40%',
                },
                {
                    title: '情报状态',
                    dataIndex: 'intelStatus',
                    key: 'intelStatus',
                    width: '30%',
                    render: (status) => {
                        const colors: Record<string, string> = {
                            '有效': 'green',
                            '未知': 'orange'
                        };
                        return <Tag color={colors[status]}>{status}</Tag>;
                    }
                },
                {
                    title: '情报类型',
                    dataIndex: 'intelType',
                    key: 'intelType',
                    width: '30%',
                }
            ]}
            dataSource={[
                {
                    key: '1',
                    domain: 'malware.example.com',
                    intelStatus: '有效',
                    intelType: '远控木马'
                },
                {
                    key: '2',
                    domain: 'phishing.test.org',
                    intelStatus: '有效',
                    intelType: '钓鱼网站'
                },
                {
                    key: '3',
                    domain: 'botnet.attack.net',
                    intelStatus: '未知',
                    intelType: '僵尸网络'
                },
                {
                    key: '4',
                    domain: 'spam.mail.com',
                    intelStatus: '未知',
                    intelType: '垃圾邮件'
                },
                {
                    key: '5',
                    domain: 'c2.server.io',
                    intelStatus: '有效',
                    intelType: 'C2服务器'
                }
            ]}
            pagination={{
                total: 5,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
            }}
        />
    };

    // tabContents所有tab都用WaveLoading样式，loading时渲染占位div，否则渲染内容
    const tabContents = {
        attackTrace: (
            <div>
                {attackTraceLoading ? (
                    <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WaveLoading size={8} color="#1890ff" />
                    </div>
                ) : (
                    <div>
                        <Row style={{ marginBottom: 16 }}>
                            <Col flex="auto">
                                <Space>
                                    <LabelSelect
                                        label="历史攻击单位"
                                        placeholder="请选择历史攻击单位"
                                        style={{ width: 300 }}
                                        options={[
                                            { label: '中******部', value: '中******部' },
                                            { label: '航******院', value: '航******院' },
                                            { label: '天******公司', value: '天******公司' },
                                            { label: '北******局', value: '北******局' }
                                        ]}
                                    />
                                    <LabelSelect
                                        label="攻击类型"
                                        placeholder="请选择"
                                        style={{ width: 200 }}
                                        options={[
                                            { label: 'SQL注入', value: 'SQL注入' },
                                            { label: 'XSS攻击', value: 'XSS攻击' },
                                            { label: 'DDOS攻击', value: 'DDOS攻击' },
                                            { label: '暴力破解', value: '暴力破解' }
                                        ]}
                                    />
                                </Space>
                            </Col>
                            <Col>
                                <Space>
                                    <Button type="primary" icon={<SearchOutlined />}>
                                        查询
                                    </Button>
                                    <Button icon={<ReloadOutlined />}>
                                        重置
                                    </Button>
                                </Space>
                            </Col>
                        </Row>
                        <Table
                            columns={[
                                {
                                    title: '最近攻击时间',
                                    dataIndex: 'lastAttackTime',
                                    key: 'lastAttackTime',
                                    sorter: (a, b) => new Date(a.lastAttackTime).getTime() - new Date(b.lastAttackTime).getTime(),
                                },
                                {
                                    title: '攻击目标',
                                    dataIndex: 'target',
                                    key: 'target',
                                },
                                {
                                    title: '历史攻击单位',
                                    dataIndex: 'historyTargets',
                                    key: 'historyTargets',
                                },
                                {
                                    title: '所属行业',
                                    dataIndex: 'industry',
                                    key: 'industry',
                                },
                                {
                                    title: '攻击类型',
                                    dataIndex: 'attackType',
                                    key: 'attackType',
                                },
                                {
                                    title: '攻击次数',
                                    dataIndex: 'attackCount',
                                    key: 'attackCount',
                                    sorter: (a, b) => a.attackCount - b.attackCount,
                                }
                            ]}
                            dataSource={[
                                {
                                    key: '1',
                                    lastAttackTime: '2023-12-01 15:30:00',
                                    target: '192.168.1.109',
                                    historyTargets: '北*******部',
                                    industry: '金融行业',
                                    attackType: 'SQL注入',
                                    attackCount: 156
                                },
                                {
                                    key: '2',
                                    lastAttackTime: '2023-11-30 18:45:00',
                                    target: '192.168.1.109',
                                    historyTargets: '上*******院',
                                    industry: '教育行业',
                                    attackType: 'XSS攻击',
                                    attackCount: 89
                                },
                                {
                                    key: '3',
                                    lastAttackTime: '2023-11-28 11:20:00',
                                    target: '192.168.1.109',
                                    historyTargets: '中*******公司',
                                    industry: '政府机构',
                                    attackType: 'DDoS攻击',
                                    attackCount: 234
                                }
                            ]}
                            pagination={{
                                total: 3,
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total) => `共 ${total} 条记录`,
                            }}
                        />
                    </div>
                )}
            </div>
        ),
        dnsRecords: (
            <div>
                {dnsRecordsLoading ? (
                    <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WaveLoading size={8} color="#1890ff" />
                    </div>
                ) : renderDNSRecords()}
            </div>
        ),
        whois: (
            <div>
                {whoisLoading ? (
                    <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WaveLoading size={8} color="#1890ff" />
                    </div>
                ) : renderWhois()}
            </div>
        ),
        subdomains: (
            <div>
                {subdomainsLoading ? (
                    <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WaveLoading size={8} color="#1890ff" />
                    </div>
                ) : renderSubdomains()}
            </div>
        ),
        fingerprint: (
            <div>
                {fingerprintLoading ? (
                    <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WaveLoading size={8} color="#1890ff" />
                    </div>
                ) : renderFingerprint()}
            </div>
        ),
        ports: (
            <div>
                {portsLoading ? (
                    <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WaveLoading size={8} color="#1890ff" />
                    </div>
                ) : <RenderPorts />}
            </div>
        ),
        sameSegment: (
            <div>
                {sameSegmentLoading ? (
                    <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WaveLoading size={8} color="#1890ff" />
                    </div>
                ) : tabContentsRaw.sameSegment}
            </div>
        ),
        reverseDomain: (
            <div>
                {reverseDomainLoading ? (
                    <div style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <WaveLoading size={8} color="#1890ff" />
                    </div>
                ) : tabContentsRaw.reverseDomain}
            </div>
        )
    };

    const getFlagComponent = (country: string) => {
        const componentMap: { [key: string]: any } = {
            '美国': US,
            '中国': CN,
            '英国': GB,
            '法国': FR,
            '德国': DE,
            '俄罗斯': RU
        };
        return componentMap[country];
    };

    const uploadProps: UploadProps = {
        fileList,
        onChange: ({ fileList: newFileList }) => {
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            const isValidType = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ].includes(file.type);

            if (!isValidType) {
                message.error('只支持上传图片、PDF和Word文件！');
                return Upload.LIST_IGNORE;
            }

            if (fileList.length >= 5) {
                message.error('最多只能上传5个文件！');
                return Upload.LIST_IGNORE;
            }

            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('文件大小不能超过10MB！');
                return Upload.LIST_IGNORE;
            }

            return false; // 阻止自动上传
        },
        multiple: true,
    };

    const handleFeedback = async (values: any) => {
        console.log('Feedback values:', values);
        console.log('Uploaded files:', fileList);
        message.success('反馈提交成功');
        setFeedbackVisible(false);
        setFileList([]);
        feedbackForm.resetFields();
    };



    const renderExternalContent = () => (
        <>
            <Row gutter={[24, 24]} align="middle">
                <Col style={{ width: 200, marginRight: 24 }}>
                    <img
                        src="/images/ThreatOut.png"
                        alt="威胁分数"
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col flex="1">
                    <Row gutter={[0, 16]}>
                        <Col span={24}>
                            <div style={{ marginBottom: 8 }}>
                                <Row justify="space-between" align="middle">
                                    <Col>
                                        <Space size={36} align="center">
                                            <Space align="center">
                                                <span style={{ fontSize: 24, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                                                    {query}
                                                    <CopyOutlined
                                                        style={{ cursor: 'pointer', color: '#1890ff', fontSize: 14, marginLeft: 8 }}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(query);
                                                            message.success('已复制到剪贴板');
                                                        }}
                                                    />
                                                </span>
                                            </Space>
                                        </Space>
                                    </Col>
                                    <Col>
                                        <Button onClick={() => setFeedbackVisible(true)}>
                                            误报反馈
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                            <Space size={8} wrap>
                                {statsLoading ? (
                                    <Spin size="small" style={{ marginLeft: 0 }} />
                                ) : (
                                    <>
                                        <Tag color="blue">SQL注入</Tag>
                                        <Tag color="blue">XSS攻击</Tag>
                                        <Tag color="blue">DDoS攻击</Tag>
                                        <Tag color="blue">暴力破解</Tag>
                                    </>
                                )}
                            </Space>
                        </Col>
                        <Col span={24}>
                            <Row wrap gutter={[24, 12]}>
                                <Col xs={6}>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ color: '#999' }}>情报归属：</span>
                                        {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span>公有情报源</span>}
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ color: '#999' }}>运营商：</span>
                                        {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span>--</span>}
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ color: '#999' }}>归属地：</span>
                                        {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span>--</span>}
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <div style={{ display: 'flex' }}>
                                        <span style={{ color: '#999' }}>经纬度：</span>
                                        {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span>--</span>}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24}>
                            <Row gutter={0}>
                                {inputType === 'domain' ? (
                                    <>
                                        <Col span={6}>
                                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                                    <ApartmentOutlined style={{ color: '#fff', fontSize: 16 }} />
                                                </div>
                                                <span style={{ color: '#999', marginRight: 8 }}>DNS解析记录</span>
                                                {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 500 }}>2</span>}
                                            </div>
                                        </Col>
                                        <Col span={6}>
                                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                                    <GlobalOutlined style={{ color: '#fff', fontSize: 16 }} />
                                                </div>
                                                <span style={{ color: '#999', marginRight: 8 }}>子域名</span>
                                                {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 500 }}>4</span>}
                                            </div>
                                        </Col>
                                    </>
                                ) : (
                                    <>
                                        <Col span={6}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                <GlobalOutlined style={{ color: '#fff', background: '#1890ff', borderRadius: '50%', fontSize: 16, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }} />
                                                <span style={{ color: '#999', marginRight: 8 }}>端口信息</span>
                                                {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 500 }}>10</span>}
                                            </div>
                                        </Col>
                                        <Col span={6}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                <LinkOutlined style={{ color: '#fff', background: '#1890ff', borderRadius: '50%', fontSize: 16, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }} />
                                                <span style={{ color: '#999', marginRight: 8 }}>同C段信息</span>
                                                {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 500 }}>4</span>}
                                            </div>
                                        </Col>
                                        <Col span={6}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                                <ApartmentOutlined style={{ color: '#fff', background: '#1890ff', borderRadius: '50%', fontSize: 16, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }} />
                                                <span style={{ color: '#999', marginRight: 8 }}>反查域名</span>
                                                {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 500 }}>5</span>}
                                            </div>
                                        </Col>
                                    </>
                                )}
                                <Col span={6}>
                                    <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                                            <ApiOutlined style={{ color: '#fff', fontSize: 16 }} />
                                        </div>
                                        <span style={{ color: '#999', marginRight: 8 }}>情报厂商总数</span>
                                        {statsLoading ? <Spin size="small" style={{ marginLeft: 4, marginRight: 4 }} /> : <span style={{ color: '#1890ff', fontSize: 20, fontWeight: 500 }}>8</span>}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <div style={{ height: '1px', background: '#f0f0f0', margin: '16px 0 8px 0' }} />
            <Row>
                <Col flex="1">
                    <Row gutter={[0, 16]}>
                        <Col span={24}>
                            {showAlert && vendorLoadingList.every(v => v === false) && (
                                <Alert
                                    message={
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 32 }}>
                                            <span>
                                                已完成对 8 家情报厂商的检索，7 家返回情报，1 家暂无结果，可通过左右按钮查看更多。
                                            </span>
                                            <span>{countdown}秒后关闭</span>
                                        </span>
                                    }
                                    type="info"
                                    showIcon
                                    closable
                                    closeText={<span style={{ color: '#1890ff', fontSize: 15, display: 'flex', alignItems: 'center', height: 32 }}>不再提示</span>}
                                    onClose={() => setShowAlert(false)}
                                    style={{ margin: '16px 0 8px 0', fontSize: 15, minHeight: 32 }}
                                />
                            )}
                            <div style={{ position: 'relative' }}>
                                <div
                                    style={{
                                        position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%)',
                                        width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #d9d9d9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f9ff'; e.currentTarget.style.borderColor = '#1890ff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
                                    onClick={() => { if (carouselRef.current) carouselRef.current.prev(); }}
                                >
                                    <LeftOutlined style={{ fontSize: 14, color: '#666' }} />
                                </div>
                                <div
                                    style={{
                                        position: 'absolute', right: -40, top: '50%', transform: 'translateY(-50%)',
                                        width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #d9d9d9',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f9ff'; e.currentTarget.style.borderColor = '#1890ff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
                                    onClick={() => { if (carouselRef.current) carouselRef.current.next(); }}
                                >
                                    <RightOutlined style={{ fontSize: 14, color: '#666' }} />
                                </div>
                                <Carousel
                                    ref={carouselRef}
                                    dots={false}
                                    arrows={false}
                                    autoplay={false}
                                    style={{ padding: '0 40px' }}
                                    slidesToShow={5}
                                    slidesToScroll={1}
                                    infinite={true}
                                    responsive={[
                                        { breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 1 } },
                                        { breakpoint: 768, settings: { slidesToShow: 3, slidesToScroll: 1 } }
                                    ]}
                                >
                                    {(() => {
                                        const allVendors = [
                                            { logo: '/images/奇安信.png', name: '奇安信威胁情报' },
                                            { logo: '/images/腾讯.png', name: '腾讯威胁情报' },
                                            { logo: '/images/360.png', name: '360威胁情报' },
                                            { logo: '/images/阿里.png', name: '阿里云威胁情报' },
                                            { logo: '/images/华为.png', name: '华为威胁情报' },
                                            { logo: '/images/绿盟.png', name: '绿盟威胁情报' },
                                            { logo: '/images/知道创宇.png', name: '知道创宇威胁情报' },
                                            { logo: '/images/长亭.png', name: '长亭威胁情报' }
                                        ];

                                        return allVendors.map((vendor, index) => (
                                            <div key={index} style={{ padding: '0 8px' }}>
                                                <div style={{ padding: '8px 0', marginBottom: '8px', height: '40px', position: 'relative' }}>
                                                    <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto', height: '40px', lineHeight: '40px' }}>
                                                        <div style={{ position: 'absolute', right: '100%', top: '47%', transform: 'translateY(-50%)', marginRight: '12px' }}>
                                                            <img src={vendor.logo} alt={vendor.name} style={{ width: 32, height: 32 }} />
                                                        </div>
                                                        <span style={{ fontSize: 16, fontWeight: 500, whiteSpace: 'nowrap' }}>{vendor.name}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    {index === 7 ? (
                                                        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                            <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ fontSize: 14 }} />
                                                        </div>
                                                    ) : (
                                                        vendorLoadingList[index] ? (
                                                            <div style={{ height: 180, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                <Spin size="large" />
                                                            </div>
                                                        ) : (
                                                            <>
                                                                {[
                                                                    { label: '威胁等级', value: index === 0 ? <Tag color="red">高危</Tag> : index === 1 ? <Tag color="green">低危</Tag> : <Tag color="orange">中危</Tag> },
                                                                    { label: '置信度', value: '高' },
                                                                    { label: '情报类型', value: '远控木马类' },
                                                                    { label: '情报相关组织', value: index === 6 ? '--' : (index === 1 ? 'APT32' : 'Lazarus') },
                                                                    { label: '关联病毒家族', value: index === 6 ? '--' : 'Lockbit勒索病毒' },
                                                                    { label: '入库时间', value: '2024-12-11 12:03:44' },
                                                                    { label: '过期时间', value: '2024-12-31 11:22:31' }
                                                                ].map((item, idx) => (
                                                                    <div key={idx} style={{ padding: '12px 0', borderBottom: idx !== 6 ? '1px solid #f0f0f0' : 'none', textAlign: 'center' }}>
                                                                        <div style={{ color: '#666', marginBottom: '8px', textAlign: 'center' }}>{item.label}</div>
                                                                        <div style={{ textAlign: 'center' }}>{item.value}</div>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </Carousel>
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </>
    );

    // 各厂商的通信样本数据
    const vendorSamples: Record<string, Array<{ key: string; hash: string }>> = {
        '奇安信': [
            { key: '1', hash: 'd41d8cd98f00b204e9800998ecf8427e' },
            { key: '2', hash: '5d41402abc4b2a76b9719d911017c592' },
            { key: '3', hash: '098f6bcd4621d373cade4e832627b4f6' },
            { key: '4', hash: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3' },
            { key: '5', hash: '7c4a8d09ca3762af61e59520943dc26494f8941b' }
        ],
        '腾讯': [
            { key: '1', hash: 'e10adc3949ba59abbe56e057f20f883e' },
            { key: '2', hash: '25f9e794323b453885f5181f1b624d0b' }
        ],
        '360': [
            { key: '1', hash: '96e79218965eb72c92a549dd5a330112' },
            { key: '2', hash: 'fcea920f7412b5da7be0cf42b8c93759' },
            { key: '3', hash: 'e3ceb5881a0a1fdaad01296d7554868d' }
        ],
        '华为': [
            { key: '1', hash: 'c4ca4238a0b923820dcc509a6f75849b' }
        ],
        '阿里云': [
            { key: '1', hash: 'c81e728d9d4c2f636f067f89cc14862c' },
            { key: '2', hash: 'eccbc87e4b5ce2fe28308fd9f2a7baf3' }
        ],
        '长亭': [
            { key: '1', hash: 'a87ff679a2f3e71d9181a67b7542122c' },
            { key: '2', hash: 'e4da3b7fbbce2345d7772b0674a318d5' },
            { key: '3', hash: '1679091c5a880faf6fb5e6087eb1b2dc' },
            { key: '4', hash: '8f14e45fceea167a5a36dedd4bea2543' }
        ]
    };

    const handleVendorSampleClick = (vendor: string) => {
        setCurrentVendor(vendor);
        setCommunicationModalVisible(true);
    };

    const handleVirusFamilyClick = (familyName: string) => {
        setCurrentVirusFamily(familyName);
        setVirusFamilyModalVisible(true);
    };

    // 病毒家族详细信息数据
    const virusFamilyDetails: Record<string, {
        name: string;
        type: string;
        description: string;
        firstSeen: string;
        threatLevel: string;
        targets: string[];
        techniques: string[];
        iocExamples: string[];
    }> = {
        'Lockbit勒索病毒': {
            name: 'Lockbit勒索病毒',
            type: '勒索软件',
            description: 'Lockbit是一个高度复杂的勒索软件家族，以其快速加密能力和双重勒索策略而闻名。该恶意软件主要针对企业网络，通过加密关键文件并要求支付赎金来获取解密密钥。',
            firstSeen: '2019年9月',
            threatLevel: '高危',
            targets: ['企业网络', '政府机构', '医疗机构', '金融机构'],
            techniques: ['网络钓鱼', '漏洞利用', '横向移动', '权限提升'],
            iocExamples: ['lockbit.exe', 'lockbit.bit', '*.lockbit']
        },
        'Emotet木马': {
            name: 'Emotet木马',
            type: '银行木马',
            description: 'Emotet是一种模块化的银行木马，最初设计用于窃取银行凭证。它通过垃圾邮件传播，能够下载其他恶意软件，并作为其他威胁的传播媒介。',
            firstSeen: '2014年',
            threatLevel: '高危',
            targets: ['银行用户', '企业员工', '政府机构'],
            techniques: ['垃圾邮件', '宏病毒', '凭证窃取', '模块化加载'],
            iocExamples: ['emotet.exe', 'emotet.dll', '*.emotet']
        },
        'WannaCry勒索病毒': {
            name: 'WannaCry勒索病毒',
            type: '勒索软件',
            description: 'WannaCry是一个全球性的勒索软件攻击，利用Windows SMB协议的漏洞进行传播。它在2017年造成了全球性的网络安全事件，影响了超过150个国家的30多万台计算机。',
            firstSeen: '2017年5月',
            threatLevel: '高危',
            targets: ['Windows系统', '企业网络', '医疗机构', '政府机构'],
            techniques: ['漏洞利用', '蠕虫传播', '文件加密', '勒索'],
            iocExamples: ['wcry.exe', '@WanaDecryptor@.exe', '*.wcry']
        },
        'Fancy Bear间谍软件': {
            name: 'Fancy Bear间谍软件',
            type: '高级持续性威胁(APT)',
            description: 'Fancy Bear是一个与俄罗斯政府相关的APT组织，专门从事网络间谍活动。该组织使用多种恶意软件工具进行长期的情报收集和网络渗透。',
            firstSeen: '2007年',
            threatLevel: '高危',
            targets: ['政府机构', '军事组织', '外交部门', '媒体机构'],
            techniques: ['鱼叉式钓鱼', '零日漏洞', '凭证窃取', '数据窃取'],
            iocExamples: ['x-agent.exe', 'x-tunnel.exe', '*.bear']
        }
    };

    // 威胁类型数据
    const vendorThreatTypes: Record<string, string[]> = {
        '奇安信': ['远控木马类', '勒索软件', '间谍软件', '钓鱼网站', '挖矿木马', '后门程序'],
        '腾讯': ['钓鱼网站', '恶意软件', '网络攻击'],
        '360': ['勒索软件', '木马程序', '病毒'],
        '华为': ['可疑行为', '异常访问', '恶意扫描'],
        '阿里云': ['挖矿木马', 'DDoS攻击', '数据窃取'],
        '长亭': ['间谍软件', 'APT攻击', '零日漏洞']
    };

    return (
        <div>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Row gutter={16} align="middle">
                        <Col flex="auto">
                            <Input
                                placeholder={'攻击情报仅支持输入IP，外联情报支持IP、域名和URL'}
                                style={{ height: 50, border: '1px solid #f0f0f0', fontSize: 18, padding: '0 16px' }}
                                defaultValue={query}
                            />
                        </Col>
                        <Col>
                            <Space>
                                <Button type={'default'} style={{ height: 50, fontSize: 16, padding: '0 24px' }}
                                    onClick={() => {
                                        setStatsLoading(true);
                                        setTimeout(() => setStatsLoading(false), 1000);
                                        // 这里可以加实际的查询逻辑
                                    }}
                                >
                                    攻击情报查询
                                </Button>
                                <Button type={'default'} style={{ height: 50, fontSize: 16, padding: '0 24px' }}
                                    onClick={() => {
                                        setStatsLoading(true);
                                        setTimeout(() => setStatsLoading(false), 1000);
                                        // 这里可以加实际的查询逻辑
                                    }}
                                >
                                    外联情报查询
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Col>
                {/* 威胁情报概览卡片 */}
                <Col span={24}>
                    <Card title="威胁情报概览">
                        <div style={{ position: 'relative' }}>
                            <Row gutter={24}>
                                {/* 左侧IP信息 */}
                                <Col flex="auto">
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                                        <div style={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: '#EFF6FF',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 12
                                        }}>
                                            {inputType === 'ip' ? (
                                                <img
                                                    src="/images/ip.png"
                                                    alt="IP"
                                                    style={{ width: 24, height: 24 }}
                                                />
                                            ) : inputType === 'domain' ? (
                                                <GlobalOutlined style={{ fontSize: 24, color: '#2663EB' }} />
                                            ) : inputType === 'url' ? (
                                                <LinkOutlined style={{ fontSize: 28, color: '#2663EB' }} />
                                            ) : (
                                                <img
                                                    src="/images/ip.png"
                                                    alt="IP"
                                                    style={{ width: 24, height: 24 }}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                                <div
                                                    style={{
                                                        fontSize: query.length > 100 ? 14 : query.length > 50 ? 20 : 32,
                                                        fontWeight: 600,
                                                        color: '#262626',
                                                        maxWidth: '800px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                    title={query}
                                                >
                                                    {query}
                                                </div>
                                                <Button
                                                    type="text"
                                                    icon={<CopyOutlined />}
                                                    style={{
                                                        marginLeft: 4,
                                                        background: '#f5f5f5',
                                                        color: '#666',
                                                        boxShadow: 'none',
                                                        padding: '0 8px',
                                                        height: 28,
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                    onClick={() => {
                                                        if (query) {
                                                            navigator.clipboard.writeText(query);
                                                            message.success('已复制');
                                                        }
                                                    }}
                                                    title="复制"
                                                />
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <Tag>攻击情报</Tag>
                                                    <Tag>IP情报</Tag>
                                                    <Tag>黑名单</Tag>
                                                    <Tag>私有情报</Tag>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    <Row gutter={[24, 16]}>
                                        {(() => {
                                            if (inputType === 'ip') {
                                                return (
                                                    <>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>运营商</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>中国电信</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>归属地</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>中国·北京</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>经纬度</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>39.9042, 116.4074</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>ASN</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>AS4134 (中国电信)</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </>
                                                );
                                            } else if (inputType === 'domain') {
                                                return (
                                                    <>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>域名注册商</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>阿里云</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>域名注册时间</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>2023-01-15 10:30:00</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>域名过期时间</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>2024-01-15 10:30:00</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>注册邮箱</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>admin@example.com</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </>
                                                );
                                            } else if (inputType === 'url') {
                                                return (
                                                    <>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>标题</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>示例网站首页</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>响应状态码</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>200</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>网站</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>example.com</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>SHA256</span>
                                                                {overviewFieldsLoading ? (
                                                                    <WaveLoading size={8} color="#1890ff" />
                                                                ) : (
                                                                    <span style={{ fontSize: 14, color: '#262626' }}>a1b2c3d4...</span>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </Row>
                                </Col>

                                {/* 右侧多源风险评分 */}
                                <Col span={5}>
                                    <div style={{
                                        borderLeft: '1px solid #f0f0f0',
                                        paddingLeft: '16px',
                                        marginLeft: '12px'
                                    }}>
                                        <div style={{ fontSize: 16, fontWeight: 500, color: '#262626', marginBottom: 16 }}>
                                            多源风险评分
                                        </div>
                                        {/* 三类风险类型的厂商判断分布 */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                {/* 白名单 */}
                                                <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        color: '#52c41a',
                                                        fontSize: 15,
                                                        padding: '4px 8px',
                                                        background: 'linear-gradient(to right, #ffffff, #f6ffed, #ffffff)',
                                                        borderRadius: '4px',
                                                        width: '100px',
                                                        display: 'inline-block',
                                                        textAlign: 'center'
                                                    }}>白名单</span>
                                                    {(queryType === 'attack' ? ['绿盟'] : ['360', '长亭']).map((vendor, index) => (
                                                        <Tag
                                                            key={index}
                                                            color="green"
                                                            style={{
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                padding: '2px 8px',
                                                                border: '1px solid #b7eb8f',
                                                                backgroundColor: '#f6ffed'
                                                            }}
                                                        >
                                                            {vendor}
                                                        </Tag>
                                                    ))}
                                                </div>
                                                {/* 恶意威胁 */}
                                                <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        color: '#f5222d',
                                                        fontSize: 15,
                                                        padding: '4px 8px',
                                                        background: 'linear-gradient(to right, #ffffff, #fff1f0, #ffffff)',
                                                        borderRadius: '4px',
                                                        width: '100px',
                                                        display: 'inline-block',
                                                        textAlign: 'center'
                                                    }}>恶意</span>
                                                    {(queryType === 'attack' ? ['公安一所'] : ['奇安信', '华为']).map((vendor, index) => (
                                                        <Tag
                                                            key={index}
                                                            style={{
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                padding: '2px 8px',
                                                                border: '1px solid #ffccc7',
                                                                backgroundColor: '#fff2f0',
                                                                color: '#f5222d'
                                                            }}
                                                        >
                                                            {vendor}
                                                        </Tag>
                                                    ))}
                                                </div>
                                                {/* 未知 */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        color: '#faad14',
                                                        fontSize: 15,
                                                        padding: '4px 8px',
                                                        background: 'linear-gradient(to right, #ffffff, #fffbe6, #ffffff)',
                                                        borderRadius: '4px',
                                                        width: '100px',
                                                        display: 'inline-block',
                                                        textAlign: 'center'
                                                    }}>未知</span>
                                                    {(queryType === 'attack' ? ['知道创宇'] : ['腾讯', '阿里云']).map((vendor, index) => (
                                                        <Tag
                                                            key={index}
                                                            color="orange"
                                                            style={{
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                padding: '2px 8px',
                                                                border: '1px solid #ffe58f',
                                                                backgroundColor: '#fffbe6'
                                                            }}
                                                        >
                                                            {vendor}
                                                        </Tag>
                                                    ))}
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </Col>
                                <Col span={3}>
                                    {/* 饼图 */}
                                    <div style={{ marginLeft: 24 }}>
                                        <ReactECharts
                                            style={{ width: '160px', height: 160 }}
                                            option={{
                                                series: [
                                                    {
                                                        type: 'pie',
                                                        radius: ['70%', '90%'],
                                                        avoidLabelOverlap: false,
                                                        label: { show: false },
                                                        labelLine: { show: false },
                                                        itemStyle: {
                                                            borderRadius: 12,
                                                            borderColor: '#fff',
                                                            borderWidth: 2,
                                                        },
                                                        data: [
                                                            {
                                                                value: queryType === 'attack' ? 1 : 2,
                                                                name: '白名单',
                                                                itemStyle: {
                                                                    color: {
                                                                        type: 'linear',
                                                                        x: 0,
                                                                        y: 0,
                                                                        x2: 0,
                                                                        y2: 1,
                                                                        colorStops: [
                                                                            { offset: 0, color: '#52c41a' },
                                                                            { offset: 0.5, color: '#52c41a' },
                                                                            { offset: 1, color: 'rgba(82, 196, 26, 0.3)' }
                                                                        ]
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                value: queryType === 'attack' ? 1 : 2,
                                                                name: '恶意威胁',
                                                                itemStyle: {
                                                                    color: {
                                                                        type: 'linear',
                                                                        x: 0,
                                                                        y: 0,
                                                                        x2: 0,
                                                                        y2: 1,
                                                                        colorStops: [
                                                                            { offset: 0, color: '#f5222d' },
                                                                            { offset: 0.5, color: '#f5222d' },
                                                                            { offset: 1, color: 'rgba(245, 34, 45, 0.3)' }
                                                                        ]
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                value: queryType === 'attack' ? 1 : 2,
                                                                name: '未知',
                                                                itemStyle: {
                                                                    color: {
                                                                        type: 'linear',
                                                                        x: 0,
                                                                        y: 0,
                                                                        x2: 0,
                                                                        y2: 1,
                                                                        colorStops: [
                                                                            { offset: 0, color: '#faad14' },
                                                                            { offset: 0.5, color: '#faad14' },
                                                                            { offset: 1, color: 'rgba(250, 173, 20, 0.3)' }
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        ],
                                                    },
                                                ],
                                                graphic: [
                                                    {
                                                        type: 'text',
                                                        left: 'center',
                                                        top: '30%',
                                                        style: {
                                                            text: queryType === 'attack' ? '1' : '2',
                                                            fontSize: 48,
                                                            fontWeight: 'bold',
                                                            fill: '#333333',
                                                            textAlign: 'center'
                                                        }
                                                    },
                                                    {
                                                        type: 'text',
                                                        left: 'center',
                                                        top: '60%',
                                                        style: {
                                                            text: queryType === 'attack' ? '/3' : '/6',
                                                            fontSize: 16,
                                                            fill: '#999',
                                                            textAlign: 'center'
                                                        }
                                                    }
                                                ],
                                                tooltip: {
                                                    show: true,
                                                    formatter: function (params: any) {
                                                        const vendors: { [key: string]: string[] } = {
                                                            '白名单': queryType === 'attack' ? ['绿盟'] : ['360', '长亭'],
                                                            '恶意威胁': queryType === 'attack' ? ['公安一所'] : ['奇安信', '华为'],
                                                            '未知': queryType === 'attack' ? ['知道创宇'] : ['腾讯', '阿里云']
                                                        };
                                                        const vendorList = vendors[params.name] || [];
                                                        const tagColors: { [key: string]: string } = {
                                                            '白名单': '#52c41a',
                                                            '恶意威胁': '#f5222d',
                                                            '未知': '#faad14'
                                                        };
                                                        const tagBgColors: { [key: string]: string } = {
                                                            '白名单': '#f6ffed',
                                                            '恶意威胁': '#fff2f0',
                                                            '未知': '#fffbe6'
                                                        };
                                                        const tagBorderColors: { [key: string]: string } = {
                                                            '白名单': '#b7eb8f',
                                                            '恶意威胁': '#ffccc7',
                                                            '未知': '#ffe58f'
                                                        };
                                                        const color = tagColors[params.name] || '#52c41a';
                                                        const bgColor = tagBgColors[params.name] || '#f6ffed';
                                                        const borderColor = tagBorderColors[params.name] || '#b7eb8f';

                                                        const vendorTags = vendorList.map(vendor =>
                                                            `<span style="display: inline-block; padding: 2px 8px; background-color: ${bgColor}; color: ${color}; border: 1px solid ${borderColor}; border-radius: 12px; font-size: 11px; margin-right: 4px;">${vendor}</span>`
                                                        ).join('');

                                                        return `${vendorTags} 判断为 ${params.name}`;
                                                    },
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    borderColor: '#d9d9d9',
                                                    borderWidth: 1,
                                                    textStyle: {
                                                        color: '#333',
                                                        fontSize: 12
                                                    }
                                                },
                                                legend: { show: false },
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </Col>

                {/* 多源威胁情报卡片 */}
                <Col span={24}>
                    <Card
                        title="多源威胁情报"
                        style={{ borderRadius: 8 }}
                        extra={
                            <Button
                                type="link"
                                onClick={() => setFeedbackVisible(true)}
                                style={{ padding: 0, height: 'auto' }}
                            >
                                误报反馈
                            </Button>
                        }
                    >
                        <div style={{ position: 'relative', overflow: 'hidden', paddingRight: '3px' }}>
                            <div
                                ref={carouselRef}
                                style={{
                                    display: 'flex',
                                    gap: 16,
                                    transition: 'transform 0.3s ease',
                                    transform: `translateX(${currentSlide * -20}%)`
                                }}
                            >
                                <div style={{ flex: '1 0 calc(20% - 12.8px)', minWidth: 0 }}>
                                    <VendorCardWithLoading vendor="奇安信" isLoading={vendorLoadingStates['奇安信']}>
                                        <Card type="inner" title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>奇安信威胁情报</span>
                                                <img src="/images/奇安信.png" alt="奇安信" style={{ width: 32, height: 32 }} />
                                            </div>
                                        }>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁等级</span>
                                                <Tag color="red" style={{ margin: 0 }}>高危</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>置信度</span>
                                                <ConfidenceStars level={3} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁类型</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {vendorThreatTypes['奇安信'].length <= 2 ? (
                                                        vendorThreatTypes['奇安信'].map((type, index) => (
                                                            <Tag key={index} color="volcano" style={{ margin: 0 }}>{type}</Tag>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <Tag color="blue" style={{ margin: 0, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{vendorThreatTypes['奇安信'].length}</Tag>
                                                            <Button type="link" size="small" onClick={() => setThreatTypeModalVisible(true)}>更多</Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>关联APT组织</span>
                                                <Tag color="orange" style={{ margin: 0 }}>Lazarus</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>恶意病毒家族</span>
                                                <Tag
                                                    color="#f00"
                                                    style={{ margin: 0, cursor: 'pointer' }}
                                                    onClick={() => handleVirusFamilyClick('Lockbit勒索病毒')}
                                                >
                                                    Lockbit勒索病毒
                                                </Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>首次发现时间</span>
                                                <span>2024-12-01 10:00:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>最近发现时间</span>
                                                <span>2024-12-11 12:03:44</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>情报过期时间</span>
                                                <span>2024-12-31 11:22:31</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>通信样本</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Tag color="blue" style={{ margin: 0, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>5</Tag>
                                                    <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => handleVendorSampleClick('奇安信')}>详情</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </VendorCardWithLoading>
                                </div>
                                <div style={{ flex: '1 0 calc(20% - 12.8px)', minWidth: 0 }}>
                                    <VendorCardWithLoading vendor="腾讯" isLoading={vendorLoadingStates['腾讯']}>
                                        <Card type="inner" title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>腾讯威胁情报</span>
                                                <img src="/images/腾讯.png" alt="腾讯" style={{ width: 32, height: 32 }} />
                                            </div>
                                        }>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁等级</span>
                                                <Tag color="orange" style={{ margin: 0 }}>中危</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>置信度</span>
                                                <ConfidenceStars level={2} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁类型</span>
                                                <Tag color="volcano" style={{ margin: 0 }}>钓鱼网站</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>关联APT组织</span>
                                                <Tag color="orange" style={{ margin: 0 }}>APT29</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>恶意病毒家族</span>
                                                <Tag
                                                    color="#f00"
                                                    style={{ margin: 0, cursor: 'pointer' }}
                                                    onClick={() => handleVirusFamilyClick('Emotet木马')}
                                                >
                                                    Emotet木马
                                                </Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>首次发现时间</span>
                                                <span>2024-12-02 15:30:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>最近发现时间</span>
                                                <span>2024-12-12 09:45:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>情报过期时间</span>
                                                <span>2024-12-30 15:30:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>通信样本</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Tag color="blue" style={{ margin: 0, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>2</Tag>
                                                    <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => handleVendorSampleClick('腾讯')}>详情</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </VendorCardWithLoading>
                                </div>
                                <div style={{ flex: '1 0 calc(20% - 12.8px)', minWidth: 0 }}>
                                    <VendorCardWithLoading vendor="360" isLoading={vendorLoadingStates['360']}>
                                        <Card type="inner" title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>360威胁情报</span>
                                                <img src="/images/360.png" alt="360" style={{ width: 32, height: 32 }} />
                                            </div>
                                        }>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁等级</span>
                                                <Tag color="red" style={{ margin: 0 }}>高危</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>置信度</span>
                                                <ConfidenceStars level={3} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁类型</span>
                                                <Tag color="volcano" style={{ margin: 0 }}>勒索软件</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>关联APT组织</span>
                                                <Tag color="orange" style={{ margin: 0 }}>WannaCry</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>恶意病毒家族</span>
                                                <Tag
                                                    color="#f00"
                                                    style={{ margin: 0, cursor: 'pointer' }}
                                                    onClick={() => handleVirusFamilyClick('WannaCry勒索病毒')}
                                                >
                                                    WannaCry勒索病毒
                                                </Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>首次发现时间</span>
                                                <span>2024-12-03 08:15:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>最近发现时间</span>
                                                <span>2024-12-13 14:20:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>情报过期时间</span>
                                                <span>2024-12-29 08:15:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>通信样本</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Tag color="blue" style={{ margin: 0, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>3</Tag>
                                                    <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => handleVendorSampleClick('360')}>详情</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </VendorCardWithLoading>
                                </div>
                                <div style={{ flex: '1 0 calc(20% - 12.8px)', minWidth: 0 }}>
                                    <VendorCardWithLoading vendor="华为" isLoading={vendorLoadingStates['华为']}>
                                        <Card type="inner" title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>华为威胁情报</span>
                                                <img src="/images/华为.png" alt="华为" style={{ width: 32, height: 32 }} />
                                            </div>
                                        }>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁等级</span>
                                                <Tag color="green" style={{ margin: 0 }}>低危</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>置信度</span>
                                                <ConfidenceStars level={1} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁类型</span>
                                                <Tag color="volcano" style={{ margin: 0 }}>可疑行为</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>关联APT组织</span>
                                                <span>--</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>恶意病毒家族</span>
                                                <span>--</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>首次发现时间</span>
                                                <span>2024-12-04 11:20:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>最近发现时间</span>
                                                <span>2024-12-14 16:10:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>情报过期时间</span>
                                                <span>2024-12-28 11:20:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>通信样本</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Tag color="blue" style={{ margin: 0, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>1</Tag>
                                                    <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => handleVendorSampleClick('华为')}>详情</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </VendorCardWithLoading>
                                </div>
                                <div style={{ flex: '1 0 calc(20% - 12.8px)', minWidth: 0 }}>
                                    <VendorCardWithLoading vendor="阿里云" isLoading={vendorLoadingStates['阿里云']}>
                                        <Card type="inner" title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>阿里云威胁情报</span>
                                                <img src="/images/阿里.png" alt="阿里云" style={{ width: 32, height: 32 }} />
                                            </div>
                                        }>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁等级</span>
                                                <Tag color="orange" style={{ margin: 0 }}>中危</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>置信度</span>
                                                <ConfidenceStars level={2} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁类型</span>
                                                <Tag color="volcano" style={{ margin: 0 }}>挖矿木马</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>关联APT组织</span>
                                                <Tag color="orange" style={{ margin: 0 }}>挖矿组织</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>恶意病毒家族</span>
                                                <span>--</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>首次发现时间</span>
                                                <span>2024-12-05 13:45:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>最近发现时间</span>
                                                <span>2024-12-15 10:30:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>情报过期时间</span>
                                                <span>2024-12-27 13:45:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>通信样本</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Tag color="blue" style={{ margin: 0, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>2</Tag>
                                                    <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => handleVendorSampleClick('阿里云')}>详情</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </VendorCardWithLoading>
                                </div>
                                <div style={{ flex: '1 0 calc(20% - 12.8px)', minWidth: 0 }}>
                                    <VendorCardWithLoading vendor="长亭" isLoading={vendorLoadingStates['长亭']}>
                                        <Card type="inner" title={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>长亭威胁情报</span>
                                                <img src="/images/长亭.png" alt="长亭" style={{ width: 32, height: 32 }} />
                                            </div>
                                        }>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁等级</span>
                                                <Tag color="red" style={{ margin: 0 }}>高危</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>置信度</span>
                                                <ConfidenceStars level={3} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>威胁类型</span>
                                                <Tag color="volcano" style={{ margin: 0 }}>间谍软件</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>关联APT组织</span>
                                                <Tag color="orange" style={{ margin: 0 }}>APT28</Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>恶意病毒家族</span>
                                                <Tag
                                                    color="#f00"
                                                    style={{ margin: 0, cursor: 'pointer' }}
                                                    onClick={() => handleVirusFamilyClick('Fancy Bear间谍软件')}
                                                >
                                                    Fancy Bear间谍软件
                                                </Tag>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>首次发现时间</span>
                                                <span>2024-12-06 07:30:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>最近发现时间</span>
                                                <span>2024-12-16 12:15:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>情报过期时间</span>
                                                <span>2024-12-26 07:30:00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 }}>
                                                <span style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>通信样本</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Tag color="blue" style={{ margin: 0, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>4</Tag>
                                                    <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => handleVendorSampleClick('长亭')}>详情</Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </VendorCardWithLoading>
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                position: 'absolute', left: -15, top: '60%', transform: 'translateY(-50%)',
                                width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #d9d9d9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f9ff'; e.currentTarget.style.borderColor = '#1890ff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
                            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        >
                            <LeftOutlined style={{ fontSize: 14, color: '#666' }} />
                        </div>
                        <div
                            style={{
                                position: 'absolute', right: -15, top: '60%', transform: 'translateY(-50%)',
                                width: 32, height: 32, borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #d9d9d9',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f9ff'; e.currentTarget.style.borderColor = '#1890ff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#d9d9d9'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; }}
                            onClick={() => setCurrentSlide(Math.min(1, currentSlide + 1))}
                        >
                            <RightOutlined style={{ fontSize: 14, color: '#666' }} />
                        </div>




                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="关联IOC信息">
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <Table
                                    pagination={false}
                                    dataSource={[
                                        { key: '1', port: '80', uri: '-', type: '恶意IP', firstSeen: '2024-12-01 10:00:00', vendor: '奇安信' },
                                        { key: '2', port: '443', uri: '-', type: '恶意域名', firstSeen: '2024-12-02 14:30:00', vendor: '腾讯' },
                                        { key: '3', port: '80', uri: '/payload.exe', type: '恶意URL', firstSeen: '2024-12-03 09:15:00', vendor: '360' },
                                        { key: '4', port: '10023', uri: '-', type: '恶意文件MD5', firstSeen: '2024-12-04 16:45:00', vendor: '华为' },
                                        { key: '5', port: '554', uri: '-', type: '恶意文件SHA256', firstSeen: '2024-12-05 11:20:00', vendor: '阿里云' }
                                    ]}
                                    columns={[
                                        { title: '端口号', dataIndex: 'port', key: 'port', width: 80 },
                                        { title: 'URI', dataIndex: 'uri', key: 'uri', width: 120 },
                                        { title: '威胁情报类型', dataIndex: 'type', key: 'type', width: 120 },
                                        { title: '首次发现时间', dataIndex: 'firstSeen', key: 'firstSeen', width: 150 },
                                        { title: '厂商', dataIndex: 'vendor', key: 'vendor', width: 100 }
                                    ]}
                                    style={{
                                        fontSize: 12,
                                        border: '1px solid #F0F0F0',
                                        borderRadius: '6px'
                                    }}
                                />
                            </div>
                            <div style={{ width: 300 }}>
                                <Card type="inner" title="证据链" style={{ height: '100%' }}>
                                    <Empty
                                        description="暂无信息"
                                        style={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            minHeight: 200
                                        }}
                                    />
                                </Card>
                            </div>
                        </div>
                    </Card>
                </Col>


                <Col span={24}>
                    <Card
                        title="情报测绘信息"
                        tabList={getTabs()}
                        activeTabKey={activeTabKey}
                        onTabChange={handleTabChange}
                    >
                        <div>
                            {tabContents[activeTabKey as keyof typeof tabContents]}
                        </div>
                    </Card>
                </Col>
            </Row>
            <Modal
                title={`${currentVendor}威胁情报 - 通信样本`}
                open={communicationModalVisible}
                onCancel={() => setCommunicationModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    pagination={false}
                    dataSource={vendorSamples[currentVendor]}
                    columns={[
                        { title: '样本Hash', dataIndex: 'hash', key: 'hash', ellipsis: true }
                    ]}
                    style={{
                        fontSize: 12,
                        border: '1px solid #F0F0F0',
                        borderRadius: '6px'
                    }}
                />
            </Modal>

            <Modal
                title="误报反馈"
                open={feedbackVisible}
                onCancel={() => {
                    setFeedbackVisible(false);
                    setFileList([]);
                    feedbackForm.resetFields();
                }}
                footer={null}
                width={480}
            >
                <Form
                    form={feedbackForm}
                    onFinish={handleFeedback}
                    initialValues={{ intelContent: query }}
                >
                    <Form.Item
                        name="intelContent"
                        rules={[{ required: true, message: '请输入情报内容' }]}
                    >
                        <LabelInput label="情报内容" required placeholder="请输入情报内容" disabled />
                    </Form.Item>
                    <Form.Item
                        name="feedbackContent"
                        rules={[{ required: true, message: '请输入反馈内容' }]}
                    >
                        <LabelTextArea label="反馈内容" required placeholder="请输入反馈内容" rows={4} />
                    </Form.Item>
                    <Form.Item
                        name="attachments"
                        labelCol={{ style: { width: '80px' } }}
                        rules={[{ required: true, message: '请上传附件' }]}
                    >
                        <Upload.Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                            <p className="ant-upload-text">上传附件</p>
                            <p className="ant-upload-hint" style={{ color: '#999', fontSize: 12, paddingLeft: 16, paddingRight: 16 }}>
                                支持png、jpg、jpeg、gif、pdf、docx、doc格式，最多上传5个文件，单个文件不超过5MB。
                            </p>
                        </Upload.Dragger>
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => { setFeedbackVisible(false); setFileList([]); feedbackForm.resetFields(); }}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit">
                                提交
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title={`${currentVirusFamily}病毒家族详细信息`}
                open={virusFamilyModalVisible}
                onCancel={() => setVirusFamilyModalVisible(false)}
                footer={null}
                width={600}
            >
                {currentVirusFamily && virusFamilyDetails[currentVirusFamily] && (
                    <div>
                        <p style={{ lineHeight: 1.6, color: '#595959', fontSize: 14 }}>{virusFamilyDetails[currentVirusFamily].description}</p>
                    </div>
                )}
            </Modal>
            <Modal
                title="奇安信威胁情报 - 威胁类型"
                open={threatTypeModalVisible}
                onCancel={() => setThreatTypeModalVisible(false)}
                footer={null}
                width={600}
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {vendorThreatTypes['奇安信'].map((type, index) => (
                        <Tag key={index} color="volcano" style={{ margin: 0, padding: '4px 8px' }}>
                            {type}
                        </Tag>
                    ))}
                </div>
            </Modal>
        </div >
    );
};

export default ThreatIntelligenceDetail;

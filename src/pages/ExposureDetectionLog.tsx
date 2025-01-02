import React, { useState } from 'react';
import { Card, Form, Select, Button, Table, Space, Tag, Row, Col, Modal, Input, message, Drawer, Typography, List, Timeline, Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import LabelSelect from '../components/LabelSelect';
import LabelInput from '../components/LabelInput';
import LabelCascader from '../components/LabelCascader';
import AttackPathVisualization from '../components/AttackPathVisualization';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';

interface DataType {
    key: string;
    sourceIP: string;
    location: string;
    targetIP: string;
    targetPort: number;
    assetGroup: string;
    protectionType: string;
    ruleName: string;
    riskLevel: string;
    action: string;
    time: string;
}

const { Option } = Select;

const timelineItemStyle = `
  .ant-timeline {
    .ant-timeline-item-head {
      margin-top: 10px;
    }

    .ant-timeline-item-tail {
        height: 100%;
    }
  }
`;

const ExposureDetectionLog: React.FC = () => {
    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [conditionName, setConditionName] = useState('');
    const [savedConditions, setSavedConditions] = useState<{ label: string; value: string; conditions: any }[]>([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<DataType | null>(null);

    // 模拟数据
    const mockData: DataType[] = [
        {
            key: '1',
            sourceIP: '10.21.23.4',
            location: '美国 | 纽约',
            targetIP: '172.18.0.41',
            targetPort: 900,
            assetGroup: 'Default_v4',
            protectionType: 'Nmap',
            ruleName: 'nmap Kerberos扫描',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 12:03'
        },
        {
            key: '2',
            sourceIP: '192.168.1.100',
            location: '中国 | 北京',
            targetIP: '172.18.0.42',
            targetPort: 443,
            assetGroup: 'Web_Server',
            protectionType: 'SQL注入',
            ruleName: 'SQL注入攻击检测',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 12:05'
        },
        {
            key: '3',
            sourceIP: '172.16.0.123',
            location: '英国 | 伦敦',
            targetIP: '172.18.0.43',
            targetPort: 80,
            assetGroup: 'Web_Server',
            protectionType: 'XSS',
            ruleName: 'XSS攻击检测',
            riskLevel: '中级',
            action: '监控',
            time: '2024-03-11 12:08'
        },
        {
            key: '4',
            sourceIP: '10.0.0.50',
            location: '法国 | 巴黎',
            targetIP: '172.18.0.44',
            targetPort: 8080,
            assetGroup: 'App_Server',
            protectionType: 'WebShell',
            ruleName: 'WebShell检测',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 12:15'
        },
        {
            key: '5',
            sourceIP: '192.168.2.200',
            location: '德国 | 柏林',
            targetIP: '172.18.0.45',
            targetPort: 3306,
            assetGroup: 'DB_Server',
            protectionType: 'Brute Force',
            ruleName: 'MySQL暴力破解',
            riskLevel: '中级',
            action: '监控',
            time: '2024-03-11 12:20'
        },
        {
            key: '6',
            sourceIP: '10.10.10.10',
            location: '中国 | 上海',
            targetIP: '172.18.0.46',
            targetPort: 22,
            assetGroup: 'Linux_Server',
            protectionType: 'SSH扫描',
            ruleName: 'SSH暴力破解',
            riskLevel: '低级',
            action: '监控',
            time: '2024-03-11 12:25'
        },
        {
            key: '7',
            sourceIP: '192.168.3.150',
            location: '美国 | 洛杉矶',
            targetIP: '172.18.0.47',
            targetPort: 1433,
            assetGroup: 'DB_Server',
            protectionType: 'SQL注入',
            ruleName: 'MSSQL注入检测',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 12:30'
        },
        {
            key: '8',
            sourceIP: '172.20.0.100',
            location: '德国 | 慕尼黑',
            targetIP: '172.18.0.48',
            targetPort: 21,
            assetGroup: 'FTP_Server',
            protectionType: 'FTP扫描',
            ruleName: 'FTP弱密码检测',
            riskLevel: '中级',
            action: '监控',
            time: '2024-03-11 12:35'
        },
        {
            key: '9',
            sourceIP: '192.168.4.200',
            location: '法国 | 里昂',
            targetIP: '172.18.0.49',
            targetPort: 5432,
            assetGroup: 'DB_Server',
            protectionType: 'SQL注入',
            ruleName: 'PostgreSQL注入检测',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 12:40'
        },
        {
            key: '10',
            sourceIP: '10.30.0.15',
            location: '中国 | 深圳',
            targetIP: '172.18.0.50',
            targetPort: 6379,
            assetGroup: 'Redis_Server',
            protectionType: 'Redis扫描',
            ruleName: 'Redis未授权访问',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 12:45'
        },
        {
            key: '11',
            sourceIP: '192.168.5.150',
            location: '英国 | 曼彻斯特',
            targetIP: '172.18.0.51',
            targetPort: 27017,
            assetGroup: 'DB_Server',
            protectionType: 'MongoDB扫描',
            ruleName: 'MongoDB访问控制',
            riskLevel: '中级',
            action: '监控',
            time: '2024-03-11 12:50'
        },
        {
            key: '12',
            sourceIP: '172.25.0.80',
            location: '美国 | 芝加哥',
            targetIP: '172.18.0.52',
            targetPort: 9200,
            assetGroup: 'ES_Server',
            protectionType: 'ES扫描',
            ruleName: 'Elasticsearch未授权',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 12:55'
        },
        {
            key: '13',
            sourceIP: '10.40.0.25',
            location: '中国 | 广州',
            targetIP: '172.18.0.53',
            targetPort: 8443,
            assetGroup: 'Web_Server',
            protectionType: 'SSL扫描',
            ruleName: 'SSL漏洞检测',
            riskLevel: '低级',
            action: '监控',
            time: '2024-03-11 13:00'
        },
        {
            key: '14',
            sourceIP: '192.168.6.100',
            location: '德国 | 汉堡',
            targetIP: '172.18.0.54',
            targetPort: 445,
            assetGroup: 'Windows_Server',
            protectionType: 'SMB扫描',
            ruleName: 'SMB漏洞检测',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 13:05'
        },
        {
            key: '15',
            sourceIP: '172.30.0.90',
            location: '法国 | 马赛',
            targetIP: '172.18.0.55',
            targetPort: 25,
            assetGroup: 'Mail_Server',
            protectionType: 'SMTP扫描',
            ruleName: 'SMTP漏洞检测',
            riskLevel: '中级',
            action: '监控',
            time: '2024-03-11 13:10'
        },
        {
            key: '16',
            sourceIP: '10.50.0.35',
            location: '英国 | 利物浦',
            targetIP: '172.18.0.56',
            targetPort: 161,
            assetGroup: 'Network_Device',
            protectionType: 'SNMP扫描',
            ruleName: 'SNMP弱密码',
            riskLevel: '低级',
            action: '监控',
            time: '2024-03-11 13:15'
        },
        {
            key: '17',
            sourceIP: '192.168.7.120',
            location: '美国 | 波士顿',
            targetIP: '172.18.0.57',
            targetPort: 3389,
            assetGroup: 'Windows_Server',
            protectionType: 'RDP扫描',
            ruleName: 'RDP暴力破解',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 13:20'
        },
        {
            key: '18',
            sourceIP: '172.35.0.70',
            location: '中国 | 杭州',
            targetIP: '172.18.0.58',
            targetPort: 11211,
            assetGroup: 'Cache_Server',
            protectionType: 'Memcached扫描',
            ruleName: 'Memcached未授权',
            riskLevel: '中级',
            action: '监控',
            time: '2024-03-11 13:25'
        },
        {
            key: '19',
            sourceIP: '10.60.0.45',
            location: '德国 | 法兰克福',
            targetIP: '172.18.0.59',
            targetPort: 2181,
            assetGroup: 'ZK_Server',
            protectionType: 'ZooKeeper扫描',
            ruleName: 'ZK未授权访问',
            riskLevel: '高级',
            action: '阻断',
            time: '2024-03-11 13:30'
        },
        {
            key: '20',
            sourceIP: '192.168.8.140',
            location: '法国 | 波尔多',
            targetIP: '172.18.0.60',
            targetPort: 9092,
            assetGroup: 'Kafka_Server',
            protectionType: 'Kafka扫描',
            ruleName: 'Kafka未授权访问',
            riskLevel: '中级',
            action: '监控',
            time: '2024-03-11 13:35'
        }
    ];

    const columns: ColumnsType<DataType> = [
        {
            title: '源IP',
            dataIndex: 'sourceIP',
            key: 'sourceIP',
        },
        {
            title: '归属地',
            dataIndex: 'location',
            key: 'location',
            render: (text) => {
                const country = text.split('|')[0].trim();
                const FlagComponent = getFlagComponent(country);
                return (
                    <Space>
                        {FlagComponent && <FlagComponent style={{ width: 16 }} />}
                        {text}
                    </Space>
                );
            },
        },
        {
            title: '目的IP',
            dataIndex: 'targetIP',
            key: 'targetIP',
        },
        {
            title: '目的端口',
            dataIndex: 'targetPort',
            key: 'targetPort',
        },
        {
            title: '所属资产分组',
            dataIndex: 'assetGroup',
            key: 'assetGroup',
        },
        {
            title: '防护类型',
            dataIndex: 'protectionType',
            key: 'protectionType',
        },
        {
            title: '规则名称',
            dataIndex: 'ruleName',
            key: 'ruleName',
        },
        {
            title: '严重级别',
            dataIndex: 'riskLevel',
            key: 'riskLevel',
            render: (text) => (
                <Tag color={text === '高级' ? 'error' : 'warning'}>{text}</Tag>
            ),
        },
        {
            title: '处理动作',
            dataIndex: 'action',
            key: 'action',
        },
        {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: '操作',
            key: 'operation',
            render: (_, record) => (
                <Button
                    type="link"
                    size="small"
                    onClick={() => {
                        setCurrentRecord(record);
                        setDrawerVisible(true);
                    }}
                >
                    详情
                </Button>
            ),
        },
    ];

    const onFinish = (values: any) => {
        console.log('Search form values:', values);
    };

    const handleReset = () => {
        form.resetFields();
    };

    // 添加级联选择器的选项数据
    const locationOptions = [
        {
            value: 'world',
            label: '世界',
            children: [
                { value: 'usa', label: '美国' },
                { value: 'uk', label: '英国' },
                { value: 'france', label: '法国' },
                { value: 'germany', label: '德国' },
                { value: 'italy', label: '意大利' },
                { value: 'spain', label: '西班牙' },
                { value: 'portugal', label: '葡萄牙' },
                { value: 'greece', label: '希腊' },
                { value: 'turkey', label: '土耳其' },
                { value: 'australia', label: '澳大利亚' },
                { value: 'canada', label: '加拿大' },
                { value: 'brazil', label: '巴西' },
                { value: 'argentina', label: '阿根廷' },
                { value: 'chile', label: '智利' },
                { value: 'peru', label: '秘鲁' },
                // ... 其他国家
            ]
        },
        {
            value: 'china',
            label: '中国',
            children: [
                { value: 'beijing', label: '北京' },
                { value: 'shanghai', label: '上海' },
                { value: 'guangzhou', label: '广州' },
                // ... 其他城市
            ]
        },
        {
            value: 'foreign',
            label: '国外',
            children: [
                { value: 'usa', label: '美国' },
                { value: 'uk', label: '英国' },
                { value: 'france', label: '法国' },
                { value: 'germany', label: '德国' },
                { value: 'italy', label: '意大利' },
                { value: 'spain', label: '西班牙' },
                { value: 'portugal', label: '葡萄牙' },
                { value: 'greece', label: '希腊' },
                { value: 'turkey', label: '土耳其' },
                { value: 'australia', label: '澳大利亚' },
                { value: 'canada', label: '加拿大' },
                { value: 'brazil', label: '巴西' },
                { value: 'argentina', label: '阿根廷' },
                { value: 'chile', label: '智利' },
                { value: 'peru', label: '秘鲁' },
                // ... 其他国家
            ]
        }
    ];

    // 添加选择框配置
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // 添加一个辅助函数来获取对应的国旗组件
    const getFlagComponent = (country: string) => {
        const componentMap: { [key: string]: any } = {
            '美国': US,
            '中国': CN,
            '英国': GB,
            '法国': FR,
            '德国': DE,
        };
        return componentMap[country];
    };

    // 计算当前页的数据
    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * pageSize;
        return mockData.slice(startIndex, startIndex + pageSize);
    };

    // 处理页码改变
    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        size && setPageSize(size);
        setSelectedRowKeys([]); // 切换页面时清空选中项
    };

    // 处理每页条数改变
    const handleSizeChange = (_: number, size: number) => {
        setPageSize(size);
        setCurrentPage(1); // 重置到第一页
        setSelectedRowKeys([]); // 清空选中项
    };

    // 处理保存条件按钮点击
    const handleSaveCondition = () => {
        const currentConditions = form.getFieldsValue();
        // 检查是否有设置任何条件
        const hasConditions = Object.values(currentConditions).some(value => value !== undefined && value !== '');
        if (!hasConditions) {
            message.warning('请至少设置一个搜索条件');
            return;
        }
        setIsModalVisible(true);
    };

    // 处理模态框确认
    const handleModalOk = () => {
        if (!conditionName.trim()) {
            message.warning('请输入条件名称');
            return;
        }

        const currentConditions = form.getFieldsValue();
        const newCondition = {
            label: conditionName,
            value: conditionName,
            conditions: currentConditions
        };

        setSavedConditions([...savedConditions, newCondition]);
        setIsModalVisible(false);
        setConditionName('');
        message.success('搜索条件保存成功');
    };

    // 处理快捷搜索选择
    const handleQuickSearch = (value: string) => {
        const selectedCondition = savedConditions.find(item => item.value === value);
        if (selectedCondition) {
            form.setFieldsValue(selectedCondition.conditions);
        }
    };

    // 添加一个获取端口颜色的辅助函数
    const getPortColor = (port: string) => {
        const portNumber = parseInt(port.split('/')[0]);
        if (portNumber === 80 || portNumber === 443) return 'blue';    // Web服务端口
        if (portNumber === 22 || portNumber === 3389) return 'purple'; // 远程管理端口
        if (portNumber === 3306 || portNumber === 1433) return 'orange'; // 数据库端口
        if (portNumber === 8080 || portNumber === 8443) return 'cyan';  // 应用服务端口
        return 'default';  // 其他端口
    };

    return (
        <Card bordered={false}>
            <Form
                form={form}
                name="exposure_log_search"
                onFinish={onFinish}
                style={{ marginBottom: 24 }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={4}>
                        <Form.Item name="quickSearch" style={{ marginBottom: 0 }}>
                            <LabelSelect
                                label="快捷搜索"
                                placeholder="请选择"
                                onChange={handleQuickSearch}
                            >
                                {savedConditions.map(item => (
                                    <Option key={item.value} value={item.value}>
                                        {item.label}
                                    </Option>
                                ))}
                            </LabelSelect>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="sourceIP" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="源IP"
                                placeholder="请输入"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="targetIP" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="目的IP"
                                placeholder="请输入"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="protectionType" style={{ marginBottom: 0 }}>
                            <LabelSelect
                                label="防护类型"
                                placeholder="请选择"
                            >
                                <Option value="all">全部</Option>
                                <Option value="nmap">Nmap</Option>
                            </LabelSelect>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="assetGroup" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="资产分组"
                                placeholder="请输入"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="riskLevel" style={{ marginBottom: 0 }}>
                            <LabelSelect
                                label="严重级别"
                                placeholder="请选择"
                            >
                                <Option value="high">高级</Option>
                                <Option value="medium">中级</Option>
                                <Option value="low">低级</Option>
                            </LabelSelect>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="action" style={{ marginBottom: 0 }}>
                            <LabelSelect
                                label="处理动作"
                                placeholder="请选择"
                            >
                                <Option value="all">全部</Option>
                                <Option value="block">阻断</Option>
                                <Option value="monitor">监控</Option>
                            </LabelSelect>
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item name="location" style={{ marginBottom: 0 }}>
                            <LabelCascader
                                label="归属地"
                                options={locationOptions}
                                placeholder="请选择"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={4}>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Space>
                                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                    查询
                                </Button>
                                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                                    重置
                                </Button>
                                <Button icon={<SaveOutlined />} onClick={handleSaveCondition}>
                                    保存条件
                                </Button>
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            {/* 条件渲染按钮 */}
            {selectedRowKeys.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Button icon={<ExportOutlined />}>
                            导出{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}
                        </Button>
                        <Button icon={<DeleteOutlined />}>
                            清空{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}
                        </Button>
                    </Space>
                </div>
            )}

            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={getCurrentPageData()}
                pagination={{
                    total: mockData.length,
                    current: currentPage,
                    pageSize: pageSize,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                    onChange: handlePageChange,
                    onShowSizeChange: handleSizeChange,
                    pageSizeOptions: ['10', '20', '50', '100']
                }}
            />

            {/* 添加保存条件的模态框 */}
            <Modal
                title="保存搜索条件"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => {
                    setIsModalVisible(false);
                    setConditionName('');
                }}
            >
                <Form layout="vertical">
                    <Form.Item
                        label="条件名称"
                        required
                        rules={[{ required: true, message: '请输入条件名称' }]}
                    >
                        <Input
                            placeholder="请输入条件名称"
                            value={conditionName}
                            onChange={e => setConditionName(e.target.value)}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 添加抽屉组件 */}
            <Drawer
                title="详细信息"
                placement="right"
                width={960}
                onClose={() => {
                    setDrawerVisible(false);
                    setCurrentRecord(null);
                }}
                open={drawerVisible}
            >
                <Card title="暴露面路径">
                    <AttackPathVisualization
                        attackerInfo={{
                            ip: currentRecord?.sourceIP || '',
                            port: String(currentRecord?.targetPort) || '',
                            time: currentRecord?.time || '',
                            location: currentRecord?.location || '',
                            deviceType: '移动设备',
                            browserType: 'Chrome Mobile 121.0',
                            OSType: 'Windows 11'
                        }}
                        deviceInfo={{
                            protocolType: 'HTTP',
                            protectionRule: currentRecord?.ruleName || '',
                            protectionType: currentRecord?.protectionType || '',
                            reverseMappingType: '爬虫类型工具'
                        }}
                        victimInfo={{
                            ip: currentRecord?.targetIP || '',
                            port: String(currentRecord?.targetPort) || '',
                            assetGroup: currentRecord?.assetGroup || ''
                        }}
                        threatLevel={currentRecord?.riskLevel || ''}
                        action={currentRecord?.action || ''}
                    />
                </Card>
                <Card title="暴露面分析" style={{ marginTop: 24 }}>
                    <div style={{
                        background: 'linear-gradient(to right, rgba(255, 77, 79, 0.08) 0%, rgba(255, 77, 79, 0.05) 50%, rgba(255, 77, 79, 0.02) 100%)',
                        borderRadius: '4px',
                        padding: '20px',
                        marginBottom: '24px'
                    }}>
                        <Row gutter={[24, 24]} align="middle">
                            <Col span={16}>
                                <Space direction="vertical" size={12}>
                                    <Space size={16}>
                                        <Typography.Title level={4} style={{ margin: 0, fontSize: 16 }}>
                                            高危风险
                                        </Typography.Title>
                                        <Tag color="error">需立即处理</Tag>
                                    </Space>
                                    <Typography.Text type="secondary">
                                        检测到 3 个高危漏洞，1 个中危漏洞，建议及时进行安全加固
                                    </Typography.Text>
                                </Space>
                            </Col>
                            <Col span={8} style={{ textAlign: 'right' }}>
                                <Progress
                                    type="circle"
                                    percent={30}
                                    size={80}
                                    strokeWidth={6}
                                    strokeColor={{
                                        '0%': '#ff4d4f',
                                        '100%': '#ff7875'
                                    }}
                                    format={() => (
                                        <div style={{ fontSize: 20, color: '#000000d9' }}>
                                            30
                                            <div style={{ fontSize: 12, color: '#00000073' }}>分</div>
                                        </div>
                                    )}
                                />
                            </Col>
                        </Row>
                    </div>

                    <Row gutter={[16, 16]}>

                        {/* 运行服务卡片 */}
                        <Col span={24}>
                            <h3>运行服务</h3>
                            <List
                                split={false}
                                dataSource={[
                                    {
                                        name: 'WordPress',
                                        version: '5.2.4',
                                        risk: 'high',
                                        ports: ['80/TCP', '443/TCP']
                                    },
                                    {
                                        name: 'Tomcat',
                                        version: '9.0.30',
                                        risk: 'low',
                                        ports: ['8080/TCP']
                                    },
                                    {
                                        name: 'MySQL',
                                        version: '5.7.26',
                                        risk: 'medium',
                                        ports: ['3306/TCP']
                                    },
                                    {
                                        name: 'Nginx',
                                        version: '1.18.0',
                                        risk: 'low',
                                        ports: ['80/TCP', '443/TCP']
                                    },
                                    {
                                        name: 'SSH',
                                        version: '8.9p1',
                                        risk: 'low',
                                        ports: ['22/TCP']
                                    }
                                ]}
                                renderItem={item => (
                                    <List.Item style={{ padding: '8px 0' }}>
                                        <div style={{
                                            padding: '12px 16px',
                                            background: '#fff',
                                            width: '100%',
                                            border: '1px solid #f0f0f0',
                                            borderRadius: '4px'
                                        }}>
                                            <Row justify="space-between" align="middle">
                                                <Col>
                                                    <Space size={16}>
                                                        <Space>
                                                            <Typography.Text strong>{item.name}</Typography.Text>
                                                            <Typography.Text type="secondary">v{item.version}</Typography.Text>
                                                        </Space>
                                                        <Space size={4}>
                                                            {item.ports.map(port => (
                                                                <Tag
                                                                    key={port}
                                                                    color={getPortColor(port)}
                                                                    style={{
                                                                        borderRadius: '2px',
                                                                        fontSize: '12px',
                                                                        padding: '0 6px',
                                                                        lineHeight: '20px'
                                                                    }}
                                                                >
                                                                    {port}
                                                                </Tag>
                                                            ))}
                                                        </Space>
                                                    </Space>
                                                </Col>
                                                <Col>
                                                    {item.risk === 'high' && (
                                                        <Tag color="error">需更新</Tag>
                                                    )}
                                                </Col>
                                            </Row>
                                        </div>
                                    </List.Item>
                                )}
                            />

                        </Col>

                        {/* 风险详情卡片 */}
                        <Col span={24}>
                            <h3 style={{ marginBottom: '16px' }}>风险详情</h3>
                            <div style={{ position: 'relative' }}>
                                <style>{timelineItemStyle}</style>
                                <Timeline
                                    style={{
                                        padding: '0 10px',
                                        marginTop: '16px'
                                    }}
                                    items={[
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        WordPress 5.2.4 版本存在 SQL 注入漏洞
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        该版本存在高危安全漏洞，可能导致数据库被非法访问。建议立即升级到最新版本，并及时进行安全补丁更新。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        },
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                        marginBottom: '-20px'
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        MySQL 5.7.26 版本已过期
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        当前版本已不再获得官方安全更新支持，建议升级到 8.0 系列最新版本。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        }
                                    ]}
                                />
                            </div>

                        </Col>

                        {/* 处置建议卡片 */}
                        <Col span={24}>
                            <h3>处置建议</h3>
                            <div style={{ position: 'relative' }}>
                                <style>{timelineItemStyle}</style>
                                <Timeline
                                    style={{
                                        padding: '0 10px',
                                        marginTop: '16px'
                                    }}
                                    items={[
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        立即更新 WordPress
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        升级到最新的稳定版本，并安装所有可用的安全补丁。更新后请确保网站功能正常运行。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        },
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        升级 MySQL 数据库
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        计划在合适的时间窗口进行数据库版本升级。建议先在测试环境验证，确保业务兼容性。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        },
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        开启K01应用隐身功能
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        建议开启K01应用隐身功能，以避免暴露面被爬虫工具发现。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        },
                                        {
                                            children: (
                                                <Card
                                                    size="small"
                                                    bordered={false}
                                                    style={{
                                                        boxShadow: 'none',
                                                        marginBottom: '-20px'
                                                    }}
                                                >
                                                    <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                        持续监控
                                                    </Typography.Text>
                                                    <Typography.Text type="secondary">
                                                        启用安全审计功能，定期检查系统日志。建议配置异常行为告警，实时监控潜在威胁。
                                                    </Typography.Text>
                                                </Card>
                                            )
                                        }
                                    ]}
                                />
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Drawer >
        </Card >
    );
};

export default ExposureDetectionLog; 
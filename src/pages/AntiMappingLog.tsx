import React, { useState } from 'react';
import { Card, Form, Select, Button, Table, Space, Tag, Row, Col, Modal, Input, message, Drawer, Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
import LabelCascader from '@/components/LabelCascader';
import AntiMappingPathVisualization from '@/components/AntiMappingPathVisualization';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';
import LabelRangePicker from '@/components/LabelRangePicker';
import dayjs from 'dayjs';

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


const AntiMappingLog: React.FC = () => {
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

    return (
        <Card>
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
                                label="所属资产分组"
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
                    <Col span={8}>
                        <Form.Item name="timeRange" style={{ marginBottom: 0 }}>
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
                <Card title="反测绘日志详情">
                    <AntiMappingPathVisualization
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
                <Card title="防护规则详情" style={{ marginTop: 24 }}>
                    <Descriptions column={3}>
                        <Descriptions.Item label="规则号">70881</Descriptions.Item>
                        <Descriptions.Item label="反测绘分类">扫描器类测绘</Descriptions.Item>
                        <Descriptions.Item label="防护类型">POC脆弱性</Descriptions.Item>
                        <Descriptions.Item label="CVE编号">-</Descriptions.Item>
                        <Descriptions.Item label="规则名称">疑似libssh密码泄露</Descriptions.Item>
                    </Descriptions>
                </Card>
                <Card title="TCP详情" style={{ marginTop: 24 }}>
                    <Descriptions column={1}>
                        <Descriptions.Item label="匹配特征">
                            <span style={{ color: 'red' }}>libssh_</span>30 2E 31 30 2E 35 \u000D\u000A\u0000\u0000\u0003BC \u0008\u0014</Descriptions.Item>
                    </Descriptions>
                </Card>
            </Drawer>
        </Card>
    );
};

export default AntiMappingLog; 
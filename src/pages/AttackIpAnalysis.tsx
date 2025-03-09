import React, { useState } from 'react';
import { Card, Form, Select, Button, Table, Space, Row, Col, Modal, Input, message, Drawer, Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
import LabelCascader from '@/components/LabelCascader';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';

interface DataType {
    key: string;
    attackIP: string;
    location: string;
    lastAttackTime: string;
    attackedIPCount: number;
    attackCount: number;
    intelType: string;
    lastAttackTarget: string;
}

const { Option } = Select;

const AttackIpAnalysis: React.FC = () => {
    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [conditionName, setConditionName] = useState('');
    const [savedConditions, setSavedConditions] = useState<{ label: string; value: string; conditions: any }[]>([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<DataType | null>(null);
    const [sortField, setSortField] = useState<string | null>(null);

    // 模拟数据
    const mockData: DataType[] = [
        {
            key: '1',
            attackIP: '192.168.1.100',
            location: '中国 | 北京',
            lastAttackTime: '2024-03-11 12:05',
            attackedIPCount: 15,
            attackCount: 78,
            intelType: '恶意扫描',
            lastAttackTarget: '金融服务中心'
        },
        {
            key: '2',
            attackIP: '10.21.23.4',
            location: '美国 | 纽约',
            lastAttackTime: '2024-03-11 12:03',
            attackedIPCount: 8,
            attackCount: 42,
            intelType: '暴力破解',
            lastAttackTarget: '数据中心'
        },
        {
            key: '3',
            attackIP: '172.16.0.123',
            location: '英国 | 伦敦',
            lastAttackTime: '2024-03-11 12:08',
            attackedIPCount: 5,
            attackCount: 23,
            intelType: 'DDoS攻击',
            lastAttackTarget: '云服务平台'
        },
        {
            key: '4',
            attackIP: '10.0.0.50',
            location: '法国 | 巴黎',
            lastAttackTime: '2024-03-11 12:15',
            attackedIPCount: 12,
            attackCount: 56,
            intelType: 'SQL注入',
            lastAttackTarget: '电子商务平台'
        },
        {
            key: '5',
            attackIP: '192.168.2.200',
            location: '德国 | 柏林',
            lastAttackTime: '2024-03-11 12:20',
            attackedIPCount: 3,
            attackCount: 17,
            intelType: 'XSS攻击',
            lastAttackTarget: '政府网站'
        },
        {
            key: '6',
            attackIP: '10.10.10.10',
            location: '中国 | 上海',
            lastAttackTime: '2024-03-11 12:25',
            attackedIPCount: 20,
            attackCount: 95,
            intelType: '恶意扫描',
            lastAttackTarget: '医疗系统'
        },
        {
            key: '7',
            attackIP: '192.168.3.150',
            location: '美国 | 洛杉矶',
            lastAttackTime: '2024-03-11 12:30',
            attackedIPCount: 7,
            attackCount: 38,
            intelType: '暴力破解',
            lastAttackTarget: '教育机构'
        },
        {
            key: '8',
            attackIP: '172.20.0.100',
            location: '德国 | 慕尼黑',
            lastAttackTime: '2024-03-11 12:35',
            attackedIPCount: 9,
            attackCount: 47,
            intelType: 'DDoS攻击',
            lastAttackTarget: '能源公司'
        },
        {
            key: '9',
            attackIP: '192.168.4.200',
            location: '法国 | 里昂',
            lastAttackTime: '2024-03-11 12:40',
            attackedIPCount: 4,
            attackCount: 21,
            intelType: 'SQL注入',
            lastAttackTarget: '物流系统'
        },
        {
            key: '10',
            attackIP: '10.30.0.15',
            location: '中国 | 深圳',
            lastAttackTime: '2024-03-11 12:45',
            attackedIPCount: 18,
            attackCount: 86,
            intelType: 'XSS攻击',
            lastAttackTarget: '社交媒体平台'
        },
        {
            key: '11',
            attackIP: '192.168.5.150',
            location: '英国 | 曼彻斯特',
            lastAttackTime: '2024-03-11 12:50',
            attackedIPCount: 6,
            attackCount: 32,
            intelType: '恶意扫描',
            lastAttackTarget: '零售系统'
        },
        {
            key: '12',
            attackIP: '172.25.0.80',
            location: '美国 | 芝加哥',
            lastAttackTime: '2024-03-11 12:55',
            attackedIPCount: 11,
            attackCount: 53,
            intelType: '暴力破解',
            lastAttackTarget: '制造业系统'
        }
    ];

    const columns: ColumnsType<DataType> = [
        {
            title: '攻击IP',
            dataIndex: 'attackIP',
            key: 'attackIP',
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
            title: '当日最近攻击时间',
            dataIndex: 'lastAttackTime',
            key: 'lastAttackTime',
        },
        {
            title: '被攻击IP数量',
            dataIndex: 'attackedIPCount',
            key: 'attackedIPCount',
            sorter: (a, b) => a.attackedIPCount - b.attackedIPCount,
        },
        {
            title: '攻击次数',
            dataIndex: 'attackCount',
            key: 'attackCount',
            sorter: (a, b) => a.attackCount - b.attackCount,
        },
        {
            title: '情报类型',
            dataIndex: 'intelType',
            key: 'intelType',
        },
        {
            title: '最近攻击单位',
            dataIndex: 'lastAttackTarget',
            key: 'lastAttackTarget',
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
        },
        columnWidth: 50
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
        let data = [...mockData];
        if (sortField) {
            data.sort((a, b) => {
                if (sortField === 'attackedIPCount') {
                    return a.attackedIPCount - b.attackedIPCount;
                } else if (sortField === 'attackCount') {
                    return a.attackCount - b.attackCount;
                }
                return 0;
            });
        }

        const startIndex = (currentPage - 1) * pageSize;
        return data.slice(startIndex, startIndex + pageSize);
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
                name="attacked_ip_analysis_search"
                onFinish={onFinish}
                style={{ marginBottom: 24 }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={6}>
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
                    <Col span={6}>
                        <Form.Item name="attackIP" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="攻击IP"
                                placeholder="请输入"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="location" style={{ marginBottom: 0 }}>
                            <LabelCascader
                                label="归属地"
                                options={locationOptions}
                                placeholder="请选择"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Space>
                                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                                    搜索
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
                onChange={(_, __, sorter) => {
                    if (Array.isArray(sorter)) {
                        setSortField(sorter.length ? sorter[0].field as string : null);
                    } else if (sorter.field) {
                        setSortField(sorter.field as string);
                    } else {
                        setSortField(null);
                    }
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
                title="攻击IP详细信息"
                placement="right"
                width={960}
                onClose={() => {
                    setDrawerVisible(false);
                    setCurrentRecord(null);
                }}
                open={drawerVisible}
            >
                {currentRecord && (
                    <>
                        <Card title="基本信息">
                            <Descriptions column={2}>
                                <Descriptions.Item label="攻击IP">{currentRecord.attackIP}</Descriptions.Item>
                                <Descriptions.Item label="归属地">{currentRecord.location}</Descriptions.Item>
                                <Descriptions.Item label="最近攻击时间">{currentRecord.lastAttackTime}</Descriptions.Item>
                                <Descriptions.Item label="情报类型">{currentRecord.intelType}</Descriptions.Item>
                                <Descriptions.Item label="被攻击IP数量">{currentRecord.attackedIPCount}</Descriptions.Item>
                                <Descriptions.Item label="攻击次数">{currentRecord.attackCount}</Descriptions.Item>
                                <Descriptions.Item label="最近攻击单位">{currentRecord.lastAttackTarget}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="攻击趋势" style={{ marginTop: 24 }}>
                            <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
                                此处可放置攻击趋势图表
                            </div>
                        </Card>

                        <Card title="攻击目标分布" style={{ marginTop: 24 }}>
                            <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
                                此处可放置攻击目标分布图表
                            </div>
                        </Card>

                        <Card title="威胁情报" style={{ marginTop: 24 }}>
                            <Descriptions column={1}>
                                <Descriptions.Item label="威胁等级">高</Descriptions.Item>
                                <Descriptions.Item label="情报来源">全球威胁情报联盟</Descriptions.Item>
                                <Descriptions.Item label="情报描述">
                                    该IP地址被多个安全机构标记为恶意IP，主要从事扫描、暴力破解等攻击活动。
                                    在过去30天内，该IP已对全球超过100个目标发起攻击，主要针对金融、政府和医疗行业。
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </>
                )}
            </Drawer>
        </Card>
    );
};

export default AttackIpAnalysis;

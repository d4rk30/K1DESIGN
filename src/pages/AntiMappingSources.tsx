import React, { useState } from 'react';
import { Card, Form, Select, Button, Table, Space, Tag, Row, Col, Modal, Input, message, Drawer } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
import LabelCascader from '@/components/LabelCascader';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';

interface DataType {
    key: string;
    sourceIP: string;
    location: string;
    targetIPCount: number;
    mappingCount: number;
    time: string;
}

const { Option } = Select;

const AntiMappingSources: React.FC = () => {
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
            location: '中国 | 北京',
            targetIPCount: 23,
            mappingCount: 156,
            time: '2024-03-11 12:03'
        },
        {
            key: '2',
            sourceIP: '10.21.23.5',
            location: '美国 | 加利福尼亚',
            targetIPCount: 15,
            mappingCount: 89,
            time: '2024-03-11 12:05'
        },
    ];

    const columns: ColumnsType<DataType> = [
        {
            title: '源IP',
            dataIndex: 'sourceIP',
            key: 'sourceIP',
            width: 140,
        },
        {
            title: '归属地',
            dataIndex: 'location',
            key: 'location',
            width: 200,
            render: (text: string) => {
                const country = text.split('|')[0].trim();
                const FlagComponent = getFlagComponent(country);
                return (
                    <Space>
                        {FlagComponent && <FlagComponent style={{ width: 16 }} />}
                        <span>{text}</span>
                    </Space>
                );
            }
        },
        {
            title: '目的IP总数',
            dataIndex: 'targetIPCount',
            key: 'targetIPCount',
            width: 120,
            render: (count: number) => (
                <span>
                    {count} 个
                </span>
            ),
        },
        {
            title: '测绘次数',
            dataIndex: 'mappingCount',
            key: 'mappingCount',
            width: 120,
            sorter: {
                compare: (a, b) => a.mappingCount - b.mappingCount,
                multiple: 2
            },
            showSorterTooltip: true,
            render: (count: number) => {
                let color = 'blue';
                return (
                    <Tag color={color}>
                        {count} 次
                    </Tag>
                );
            },
        },
        {
            title: '最近测绘时间',
            dataIndex: 'time',
            key: 'time',
            width: 180,
        },
        {
            title: '操作',
            key: 'operation',
            width: 100,
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


    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * pageSize;
        return mockData.slice(startIndex, startIndex + pageSize);
    };

    const handlePageChange = (page: number, size?: number) => {
        setCurrentPage(page);
        size && setPageSize(size);
        setSelectedRowKeys([]);
    };

    const handleSizeChange = (_: number, size: number) => {
        setPageSize(size);
        setCurrentPage(1);
        setSelectedRowKeys([]);
    };

    const handleSaveCondition = () => {
        const currentConditions = form.getFieldsValue();
        const hasConditions = Object.values(currentConditions).some(value => value !== undefined && value !== '');
        if (!hasConditions) {
            message.warning('请至少设置一个搜索条件');
            return;
        }
        setIsModalVisible(true);
    };

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

    const handleQuickSearch = (value: string) => {
        const selectedCondition = savedConditions.find(item => item.value === value);
        if (selectedCondition) {
            form.setFieldsValue(selectedCondition.conditions);
        }
    };

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
                title={`详细信息 - ${currentRecord?.sourceIP || ''}`}
                placement="right"
                width={960}
                onClose={() => {
                    setDrawerVisible(false);
                    setCurrentRecord(null);
                }}
                open={drawerVisible}
            >
                <Table
                    columns={[
                        {
                            title: '最近测绘时间',
                            dataIndex: 'time',
                            key: 'time',
                            width: 180,
                        },
                        {
                            title: '目的IP',
                            dataIndex: 'targetIP',
                            key: 'targetIP',
                            width: 140,
                        },
                        {
                            title: '目的端口',
                            dataIndex: 'targetPort',
                            key: 'targetPort',
                            width: 100,
                            render: (port: number) => `${port}`,
                        },
                        {
                            title: '测绘次数',
                            dataIndex: 'mappingCount',
                            key: 'mappingCount',
                            width: 120,
                            sorter: (a, b) => a.mappingCount - b.mappingCount,
                            render: (count: number) => (
                                <Tag color="blue">
                                    {count} 次
                                </Tag>
                            ),
                        },
                        {
                            title: '防护类型',
                            dataIndex: 'protectionType',
                            key: 'protectionType',
                            width: 140,
                        }
                    ]}
                    dataSource={currentRecord ? [
                        {
                            key: '1',
                            time: currentRecord.time,
                            targetIP: '172.18.0.41',
                            targetPort: 80,
                            mappingCount: currentRecord.mappingCount,
                            protectionType: 'Nmap扫描'
                        },
                        // ... 其他数据项
                    ] : []}
                    pagination={{
                        total: 3,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`
                    }}

                />
            </Drawer>
        </Card>
    );
};

export default AntiMappingSources; 
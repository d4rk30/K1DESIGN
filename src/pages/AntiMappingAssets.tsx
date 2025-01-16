import React, { useState } from 'react';
import { Card, Form, Select, Button, Table, Space, Tag, Row, Col, Modal, Input, message, Drawer } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';
import { US, CN, GB, FR, DE } from 'country-flag-icons/react/3x2';  // 导入国旗图标

interface DataType {
    key: string;
    targetIP: string;
    targetPort: number;
    targetDomain: string;
    targetURL: string;
    assetGroup: string;
    mappingCount: number;
    time: string;
}

const { Option } = Select;

const AntiMappingAssets: React.FC = () => {
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
            targetIP: '172.18.0.41',
            targetPort: 80,
            targetDomain: 'example.com',
            targetURL: 'https://example.com/api/v1/users',
            assetGroup: 'Web_Server',
            mappingCount: 156,
            time: '2024-03-11 12:03'
        },
        {
            key: '2',
            targetIP: '172.18.0.42',
            targetPort: 443,
            targetDomain: 'api.example.com',
            targetURL: 'https://api.example.com/v2/products',
            assetGroup: 'API_Server',
            mappingCount: 89,
            time: '2024-03-11 12:05'
        },
        // ... 可以继续添加更多模拟数据
    ];

    const columns: ColumnsType<DataType> = [
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
        },
        {
            title: '最近被测绘目的URL',
            dataIndex: 'targetURL',
            key: 'targetURL',
            ellipsis: true,
        },
        {
            title: '所属资产分组',
            dataIndex: 'assetGroup',
            key: 'assetGroup',
            width: 180,
        },
        {
            title: '被测绘次数',
            dataIndex: 'mappingCount',
            key: 'mappingCount',
            width: 120,
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
            title: '最近被测绘时间',
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


    // 添加选择框配置
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
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
                        <Form.Item name="targetIP" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="目的IP"
                                placeholder="请输入"
                            />
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
                title={`详细信息 - ${currentRecord?.targetIP || ''}`}
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
                            title: '最近被测绘时间',
                            dataIndex: 'time',
                            key: 'time',
                            width: 180,
                        },
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
                            width: 180,
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
                            title: '被测绘次数',
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
                            sourceIP: '192.168.1.100',
                            location: '中国 | 北京',
                            protectionType: 'Nmap扫描',
                            mappingCount: currentRecord.mappingCount
                        },
                        {
                            key: '2',
                            time: '2024-03-21 13:25:30',
                            sourceIP: '192.168.1.101',
                            location: '中国 | 上海',
                            protectionType: 'Web爬虫',
                            mappingCount: 45
                        }
                    ] : []}
                    pagination={{
                        total: 2,
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

export default AntiMappingAssets; 
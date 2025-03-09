import React, { useState } from 'react';
import { Card, Form, Select, Button, Table, Space, Row, Col, Modal, Input, message, Drawer, Descriptions } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import LabelSelect from '@/components/LabelSelect';
import LabelInput from '@/components/LabelInput';

interface DataType {
    key: string;
    attackedIP: string;
    lastAttackTime: string;
    assetGroup: string;
    attackIPCount: number;
    attackCount: number;
}

const { Option } = Select;

const AttackedIpAnalysis: React.FC = () => {
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
            attackedIP: '172.18.0.41',
            lastAttackTime: '2024-03-11 12:05',
            assetGroup: '金融服务中心',
            attackIPCount: 15,
            attackCount: 78
        },
        {
            key: '2',
            attackedIP: '172.18.0.42',
            lastAttackTime: '2024-03-11 12:03',
            assetGroup: '数据中心',
            attackIPCount: 8,
            attackCount: 42
        },
        {
            key: '3',
            attackedIP: '172.18.0.43',
            lastAttackTime: '2024-03-11 12:08',
            assetGroup: '云服务平台',
            attackIPCount: 5,
            attackCount: 23
        },
        {
            key: '4',
            attackedIP: '172.18.0.44',
            lastAttackTime: '2024-03-11 12:15',
            assetGroup: '电子商务平台',
            attackIPCount: 12,
            attackCount: 56
        },
        {
            key: '5',
            attackedIP: '172.18.0.45',
            lastAttackTime: '2024-03-11 12:20',
            assetGroup: '政府网站',
            attackIPCount: 3,
            attackCount: 17
        },
        {
            key: '6',
            attackedIP: '172.18.0.46',
            lastAttackTime: '2024-03-11 12:25',
            assetGroup: '医疗系统',
            attackIPCount: 20,
            attackCount: 95
        },
        {
            key: '7',
            attackedIP: '172.18.0.47',
            lastAttackTime: '2024-03-11 12:30',
            assetGroup: '教育机构',
            attackIPCount: 7,
            attackCount: 38
        },
        {
            key: '8',
            attackedIP: '172.18.0.48',
            lastAttackTime: '2024-03-11 12:35',
            assetGroup: '能源公司',
            attackIPCount: 9,
            attackCount: 47
        },
        {
            key: '9',
            attackedIP: '172.18.0.49',
            lastAttackTime: '2024-03-11 12:40',
            assetGroup: '物流系统',
            attackIPCount: 4,
            attackCount: 21
        },
        {
            key: '10',
            attackedIP: '172.18.0.50',
            lastAttackTime: '2024-03-11 12:45',
            assetGroup: '社交媒体平台',
            attackIPCount: 18,
            attackCount: 86
        },
        {
            key: '11',
            attackedIP: '172.18.0.51',
            lastAttackTime: '2024-03-11 12:50',
            assetGroup: '零售系统',
            attackIPCount: 6,
            attackCount: 32
        },
        {
            key: '12',
            attackedIP: '172.18.0.52',
            lastAttackTime: '2024-03-11 12:55',
            assetGroup: '制造业系统',
            attackIPCount: 11,
            attackCount: 53
        }
    ];

    const columns: ColumnsType<DataType> = [
        {
            title: '被攻击IP',
            dataIndex: 'attackedIP',
            key: 'attackedIP',
        },
        {
            title: '当日最近攻击时间',
            dataIndex: 'lastAttackTime',
            key: 'lastAttackTime',
        },
        {
            title: '所属资产分组',
            dataIndex: 'assetGroup',
            key: 'assetGroup',
        },
        {
            title: '攻击IP数量',
            dataIndex: 'attackIPCount',
            key: 'attackIPCount',
            sorter: (a, b) => a.attackIPCount - b.attackIPCount,
        },
        {
            title: '攻击次数',
            dataIndex: 'attackCount',
            key: 'attackCount',
            sorter: (a, b) => a.attackCount - b.attackCount,
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

    // 添加选择框配置
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
        columnWidth: 50
    };

    // 计算当前页的数据
    const getCurrentPageData = () => {
        let data = [...mockData];
        if (sortField) {
            data.sort((a, b) => {
                if (sortField === 'attackIPCount') {
                    return a.attackIPCount - b.attackIPCount;
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
                        <Form.Item name="attackedIP" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="被攻击IP"
                                placeholder="请输入"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="assetGroup" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="所属资产组"
                                placeholder="请输入"
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
                title="被攻击IP详细信息"
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
                                <Descriptions.Item label="被攻击IP">{currentRecord.attackedIP}</Descriptions.Item>
                                <Descriptions.Item label="所属资产分组">{currentRecord.assetGroup}</Descriptions.Item>
                                <Descriptions.Item label="最近攻击时间">{currentRecord.lastAttackTime}</Descriptions.Item>
                                <Descriptions.Item label="攻击IP数量">{currentRecord.attackIPCount}</Descriptions.Item>
                                <Descriptions.Item label="攻击次数">{currentRecord.attackCount}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="攻击来源分布" style={{ marginTop: 24 }}>
                            <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
                                此处可放置攻击来源分布图表
                            </div>
                        </Card>

                        <Card title="攻击趋势" style={{ marginTop: 24 }}>
                            <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
                                此处可放置攻击趋势图表
                            </div>
                        </Card>

                        <Card title="资产信息" style={{ marginTop: 24 }}>
                            <Descriptions column={2}>
                                <Descriptions.Item label="资产名称">Web服务器-{currentRecord.attackedIP}</Descriptions.Item>
                                <Descriptions.Item label="资产类型">Web服务器</Descriptions.Item>
                                <Descriptions.Item label="操作系统">CentOS 7.6</Descriptions.Item>
                                <Descriptions.Item label="开放端口">80, 443, 22</Descriptions.Item>
                                <Descriptions.Item label="运行服务">Nginx 1.18.0, SSH</Descriptions.Item>
                                <Descriptions.Item label="重要程度">高</Descriptions.Item>
                                <Descriptions.Item label="责任人">张三</Descriptions.Item>
                                <Descriptions.Item label="联系方式">13800138000</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </>
                )}
            </Drawer>
        </Card>
    );
};

export default AttackedIpAnalysis; 
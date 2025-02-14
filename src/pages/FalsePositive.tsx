import React, { useState } from 'react';
import { Card, Form, Table, Space, Button, Popconfirm, message, Row, Col, Select, Tag, Drawer, Timeline } from 'antd';
import { SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import LabelInput from '../components/LabelInput';
import LabelSelect from '../components/LabelSelect';

const { Option } = Select;

interface FalsePositiveItem {
    key: string;
    ticketNo: string;
    content: string;
    status: 'processing' | 'completed';
    feedbackTime: string;
    updateTime: string;
    result: 'approved' | 'rejected' | null;
}

// 模拟数据
const mockData: FalsePositiveItem[] = [
    {
        key: '1',
        ticketNo: 'FP202403110001',
        content: 'www.anqd.com',
        status: 'completed',
        feedbackTime: '2024-03-11 10:00',
        updateTime: '2024-03-11 10:30',
        result: 'approved'
    },
    {
        key: '2',
        ticketNo: 'FP202403110002',
        content: '1.2.34.3',
        status: 'processing',
        feedbackTime: '2024-03-11 11:00',
        updateTime: '2024-03-11 11:00',
        result: null
    },
    {
        key: '3',
        ticketNo: 'FP202403110003',
        content: 'malware.example.com',
        status: 'completed',
        feedbackTime: '2024-03-11 14:20',
        updateTime: '2024-03-11 15:00',
        result: 'rejected'
    },
    {
        key: '4',
        ticketNo: 'FP202403110004',
        content: '192.168.1.100',
        status: 'processing',
        feedbackTime: '2024-03-11 16:30',
        updateTime: '2024-03-11 16:30',
        result: null
    },
    {
        key: '5',
        ticketNo: 'FP202403110005',
        content: 'threat.domain.net',
        status: 'completed',
        feedbackTime: '2024-03-11 17:45',
        updateTime: '2024-03-11 18:00',
        result: 'approved'
    }
];

const FalsePositive: React.FC = () => {
    const [form] = Form.useForm();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<FalsePositiveItem | null>(null);

    // 表格列定义
    const columns = [
        {
            title: '工单编号',
            dataIndex: 'ticketNo',
            key: 'ticketNo',
        },
        {
            title: '情报内容',
            dataIndex: 'content',
            key: 'content',
            ellipsis: true,
        },
        {
            title: '流程状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'processing' ? 'processing' : 'success'}>
                    {status === 'processing' ? '处理中' : '已完成'}
                </Tag>
            ),
        },
        {
            title: '反馈时间',
            dataIndex: 'feedbackTime',
            key: 'feedbackTime',
        },
        {
            title: '更新时间',
            dataIndex: 'updateTime',
            key: 'updateTime',
        },
        {
            title: '反馈结果',
            dataIndex: 'result',
            key: 'result',
            render: (result: string | null) => {
                if (result === 'approved') return <Tag color="success">通过</Tag>;
                if (result === 'rejected') return <Tag color="error">拒绝</Tag>;
                return <Tag>未反馈</Tag>;
            },
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: FalsePositiveItem) => (
                <Space>
                    <Button type="link" onClick={() => handleDetail(record)}>
                        详情
                    </Button>
                    <Popconfirm
                        title="确定要删除这条记录吗？"
                        onConfirm={() => handleDelete(record)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button type="link" danger>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // 选择框配置
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
        columnWidth: 50
    };

    // 处理搜索
    const handleSearch = (values: any) => {
        console.log('搜索条件：', values);
        // TODO: 实现搜索逻辑
    };

    // 处理重置
    const handleReset = () => {
        form.resetFields();
    };

    // 处理详情查看
    const handleDetail = (record: FalsePositiveItem) => {
        setCurrentRecord(record);
        setDrawerVisible(true);
    };

    // 处理删除
    const handleDelete = (record: FalsePositiveItem) => {
        console.log('删除记录：', record);
        message.success('删除成功');
        // TODO: 实现删除逻辑
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

    return (
        <Card>
            <Form
                form={form}
                name="false_positive_search"
                onFinish={handleSearch}
                style={{ marginBottom: 24 }}
            >
                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Form.Item name="ticketNo" style={{ marginBottom: 0 }}>
                            <LabelInput
                                label="工单编号"
                                placeholder="请输入"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="status" style={{ marginBottom: 0 }}>
                            <LabelSelect
                                label="流程状态"
                                placeholder="请选择"
                            >
                                <Option value="all">全部</Option>
                                <Option value="processing">处理中</Option>
                                <Option value="completed">已完成</Option>
                            </LabelSelect>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="result" style={{ marginBottom: 0 }}>
                            <LabelSelect
                                label="反馈结果"
                                placeholder="请选择"
                            >
                                <Option value="all">全部</Option>
                                <Option value="approved">通过</Option>
                                <Option value="rejected">拒绝</Option>
                                <Option value="null">未反馈</Option>
                            </LabelSelect>
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
                            </Space>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

            {/* 条件渲染按钮 */}
            {selectedRowKeys.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <Space>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                        >
                            批量删除{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}
                        </Button>
                    </Space>
                </div>
            )}

            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={mockData}
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

            <Drawer
                title="误报反馈详情"
                placement="right"
                width={500}
                onClose={() => {
                    setDrawerVisible(false);
                    setCurrentRecord(null);
                }}
                open={drawerVisible}
            >
                {currentRecord && (
                    <Timeline
                        items={[
                            {
                                children: (
                                    <>
                                        <div style={{ marginBottom: 16 }}>{currentRecord.feedbackTime}</div>
                                        <div style={{ color: '#666666', marginBottom: 16 }}>情报内容：{currentRecord.content}</div>
                                        <div style={{ color: '#666666', marginBottom: 16 }}>
                                            反馈内容：当前情报为我司正常业务，请移除。
                                        </div>
                                        <div style={{ color: '#666666', marginBottom: 16, display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ marginRight: 16 }}>附件：</span>
                                            <Space direction="vertical">
                                                <a href="#">业务说明文档.pdf</a>
                                                <a href="#">系统截图.png</a>
                                            </Space>
                                        </div>
                                    </>
                                )
                            },
                            {
                                children: (
                                    <>
                                        <div style={{ marginBottom: 16 }}>{currentRecord.updateTime}</div>
                                        <div style={{ color: '#666666', marginBottom: 16 }}>
                                            反馈结果：
                                            {currentRecord.result === 'approved' ? '通过' :
                                                currentRecord.result === 'rejected' ? '拒绝' :
                                                    '处理中'}
                                        </div>
                                        <div style={{ color: '#666666', marginBottom: 16 }}>
                                            处理意见：已经确认为XX场所误报，已从情报库中移除。
                                        </div>
                                        <div style={{ color: '#666666', marginBottom: 16, display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ marginRight: 16 }}>附件：</span>
                                            <Space direction="vertical">
                                                <a href="#">误报证明.pdf</a>
                                            </Space>
                                        </div>
                                    </>
                                )
                            }
                        ]}
                    />
                )}
            </Drawer>
        </Card>
    );
};

export default FalsePositive; 
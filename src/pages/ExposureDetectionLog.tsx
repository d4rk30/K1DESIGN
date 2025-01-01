import React from 'react';
import { Card, Form, Input, Select, Button, Table, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined } from '@ant-design/icons';

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

const ExposureDetectionLog: React.FC = () => {
    const [form] = Form.useForm();

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
            time: '2024-11-11 12:03'
        },
        // ... 其他数据项
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
            render: (text) => (
                <Space>
                    <img src="/path/to/flag" alt="flag" style={{ width: 16, height: 16 }} />
                    {text}
                </Space>
            ),
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
            render: () => (
                <Button type="link" size="small">
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

    return (
        <Card bordered={false}>
            <Form
                form={form}
                name="exposure_log_search"
                onFinish={onFinish}
                layout="inline"
                style={{ marginBottom: 24 }}
            >
                <Form.Item name="quickSearch" style={{ width: 200 }}>
                    <Select placeholder="快捷搜索">
                        <Option value="ip">IP</Option>
                        <Option value="port">端口</Option>
                        <Option value="rule">规则</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="sourceIP">
                    <Input placeholder="源IP" style={{ width: 200 }} />
                </Form.Item>

                <Form.Item name="targetIP">
                    <Input placeholder="目的IP" style={{ width: 200 }} />
                </Form.Item>

                <Form.Item name="protectionType">
                    <Select placeholder="防护类型" style={{ width: 200 }}>
                        <Option value="all">全部</Option>
                        <Option value="nmap">Nmap</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="assetGroup">
                    <Input placeholder="所属资产分组" style={{ width: 200 }} />
                </Form.Item>

                <Form.Item name="riskLevel">
                    <Select placeholder="严重级别" style={{ width: 200 }}>
                        <Option value="high">高级</Option>
                        <Option value="medium">中级</Option>
                        <Option value="low">低级</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="action">
                    <Select placeholder="处理动作" style={{ width: 200 }}>
                        <Option value="all">全部</Option>
                        <Option value="block">阻断</Option>
                        <Option value="monitor">监控</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                            查询
                        </Button>
                        <Button icon={<ReloadOutlined />} onClick={handleReset}>
                            重置
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Button icon={<ExportOutlined />}>导出</Button>
                    <Button icon={<DeleteOutlined />}>清空</Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={mockData}
                pagination={{
                    total: 400,
                    current: 1,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
            />
        </Card>
    );
};

export default ExposureDetectionLog; 
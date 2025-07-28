import { Card, Form, Button, Space, Alert } from 'antd';
import React, { useState } from 'react';
import LabelInput from '@/components/LabelInput';
import LabelSelect from '@/components/LabelSelect';

const tabList = [
    { key: 'ping', tab: 'Ping' },
    { key: 'tcpdump', tab: 'Tcpdump' },
    { key: 'traceroute', tab: 'Traceroute' },
    { key: 'fault-collect', tab: '故障信息收集' },
    { key: 'snmp', tab: 'SNMP配置' },
    { key: 'webshell', tab: 'WebShell' },
];

const TcpdumpForm: React.FC = () => {
    const [form] = Form.useForm();
    return (
        <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: 720, margin: '0 auto' }}
            initialValues={{ protocol: 'any' }}
        >
            <Form.Item name="protocol">
                <LabelSelect
                    label="协议类型"
                    placeholder="请选择协议类型"
                    options={[
                        { label: 'any', value: 'any' },
                        { label: 'ip', value: 'ip' },
                        { label: 'tcp', value: 'tcp' },
                        { label: 'udp', value: 'udp' },
                        { label: 'arp', value: 'arp' },
                    ]}
                />
            </Form.Item>
            <Form.Item
                name="duration"
                rules={[
                    { required: true, message: '请输入抓包时长' },
                    { pattern: /^(?:[1-9][0-9]{0,2}|1[0-7][0-9]{2}|1800)$/, message: '请输入1-1800之间的整数' }
                ]}
            >
                <LabelInput
                    label="抓包时长"
                    required
                    placeholder="单位秒（限制1-1800秒）"
                    type="number"
                    min={1}
                    max={1800}
                />
            </Form.Item>
            <Form.Item
                name="type"
                rules={[{ required: true, message: '请选择类型' }]}
            >
                <LabelSelect
                    label="类型"
                    required
                    placeholder="请选择类型"
                    options={[
                        { label: '管理接口', value: 'manage' },
                        { label: '数据接口', value: 'data' },
                    ]}
                />
            </Form.Item>
            <Form.Item
                name="interface"
                rules={[{ required: true, message: '请选择接口' }]}
            >
                <LabelSelect
                    label="接口"
                    required
                    placeholder="请选择接口"
                    options={[
                        { label: 'GE0', value: 'GE0' },
                        { label: 'GE1', value: 'GE1' },
                    ]}
                />
            </Form.Item>
            <Form.Item
                name="category"
                rules={[{ required: true, message: '请选择类别' }]}
            >
                <LabelSelect
                    label="类别"
                    required
                    placeholder="请选择类别"
                    allowClear
                    options={[
                        { label: '无', value: 'none' },
                        { label: '源地址', value: 'src' },
                        { label: '目的地址', value: 'dst' },
                    ]}
                />
            </Form.Item>
            <Form.Item name="host">
                <LabelInput
                    label="主机IP/域名"
                    placeholder="请输入主机IP或域名"
                />
            </Form.Item>
            <Alert
                type="warning"
                showIcon={false}
                style={{ margin: '16px 0' }}
                message={
                    <div>
                        注意：<br />
                        1、 完成配置后可以点击"启动"开始截取报文，可以点击"终止"按钮停止截取报文，并下载已截取的报文；<br />
                        2、 若抓包长时间未响应时，请确定IP或端口是否连通。<br />
                        3、抓包大小上限为1G
                    </div>
                }
            />
            <Form.Item>
                <Space>
                    <Button type="primary">启动</Button>
                    <Button disabled>终止</Button>
                    <Button>导出</Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

const contentList: Record<string, React.ReactNode> = {
    ping: <div></div>,
    tcpdump: <TcpdumpForm />,
    traceroute: <div></div>,
    'fault-collect': <div></div>,
    snmp: <div></div>,
    webshell: <div></div>,
};

const MaintenanceTools: React.FC = () => {
    const [activeTabKey, setActiveTabKey] = useState<string>('ping');

    return (
        <Card
            tabList={tabList}
            activeTabKey={activeTabKey}
            onTabChange={setActiveTabKey}
            tabProps={{ size: 'large' }}
        >
            {contentList[activeTabKey]}
        </Card>
    );
};

export default MaintenanceTools; 
import React from 'react';
import { Card, Form, Input, Button, Select, DatePicker, Space, InputNumber, Tooltip } from 'antd';
import type { Rule } from 'antd/es/form';
import dayjs from 'dayjs';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

const provinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省'];
const cities = ['北京市', '上海市', '广州市', '深圳市', '南京市'];
const districts = ['朝阳区', '浦东新区', '天河区', '福田区', '玄武区'];

const hostNameRules: Rule[] = [
    { required: true, message: '请输入主机名' },
    { max: 64, message: '主机名最长64个字符' },
    {
        pattern: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
        message: '主机名仅可由小写字母、数字、"-"组成，"-"不能用于开头或结尾'
    },
    {
        pattern: /^(?!.*--)/,
        message: '不能连续使用"-"字符'
    }
];

const License: React.FC = () => {
    const [form] = Form.useForm();

    const handleSave = (values: any) => {
        console.log('Form values:', values);
    };

    const handleReset = () => {
        form.resetFields();
    };

    const handleSwitchLine = () => {
        // 实现线路切换逻辑
    };

    return (
        <div>
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    style={{ width: '40%', minWidth: '400px', margin: '0 auto' }}
                    initialValues={{
                        licenseCode: 'FQAFM3JL6YN2N8FI5ANZP74W6M4CCBVY',
                        deviceSerial: '7CE468709AD401C094C240E4BD06C340',
                        licenseDate: [
                            dayjs('2018-03-01 00:00:00'),
                            dayjs('2025-01-31 23:59:59')
                        ],
                        blockFunction: '开启'
                    }}
                >
                    <Form.Item
                        name="licenseCode"
                        label="授权码"
                        rules={[{ required: true, message: '请输入授权码' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="deviceSerial"
                        label="设备序列号"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="licenseDate"
                        label="授权期限"
                    >
                        <RangePicker
                            showTime
                            disabled
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="blockFunction"
                        label="阻断功能"
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="companyName"
                        label="单位名称"
                        rules={[{ required: true, message: '请输入单位名称' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="industry"
                        label="所属行业"
                        rules={[{ required: true, message: '请选择所属行业' }]}
                    >
                        <Select>
                            <Select.Option value="telecom">电信</Select.Option>
                            <Select.Option value="broadcast">广电</Select.Option>
                            <Select.Option value="bank">银行</Select.Option>
                            <Select.Option value="customs">海关</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="deployLocation"
                        label="部署位置"
                        rules={[{ required: true, message: '请选择部署位置' }]}
                    >
                        <Select>
                            <Select.Option value="office">办公区</Select.Option>
                            <Select.Option value="internet">互联网出口</Select.Option>
                            <Select.Option value="other">其他</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="province"
                        label="省份"
                        rules={[{ required: true, message: '请选择省份' }]}
                    >
                        <Select>
                            {provinces.map(province => (
                                <Select.Option key={province} value={province}>{province}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="city"
                        label="城市"
                        rules={[{ required: true, message: '请选择城市' }]}
                    >
                        <Select>
                            {cities.map(city => (
                                <Select.Option key={city} value={city}>{city}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="district"
                        label="区域"
                        rules={[{ required: true, message: '请选择区域' }]}
                    >
                        <Select>
                            {districts.map(district => (
                                <Select.Option key={district} value={district}>{district}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="manager"
                        label="负责人"
                        rules={[{ required: true, message: '请输入负责人' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="联系电话"
                        rules={[{ required: true, message: '请输入联系电话' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="联系邮箱"
                        rules={[
                            { required: true, message: '请输入联系邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="timeout"
                        label={
                            <Space>
                                系统超时时间（分）
                                <Tooltip title="可配置正整数0-60，0代表永久不超时">
                                    <QuestionCircleOutlined />
                                </Tooltip>
                            </Space>
                        }
                        rules={[
                            { required: true, message: '请输入系统超时时间' },
                            { type: 'number', min: 0, max: 60, message: '请输入0-60之间的整数' }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} max={60} precision={0} />
                    </Form.Item>

                    <Form.Item
                        name="hostname"
                        label="主机名"
                        rules={hostNameRules}
                    >
                        <Input placeholder='例如：192-168-1-1，仅可由小写字母、数字、"-"组成，最长64个字符' />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                保存
                            </Button>
                            <Button onClick={handleSwitchLine}>
                                线路切换
                            </Button>
                            <Button onClick={handleReset}>
                                重置
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default License;

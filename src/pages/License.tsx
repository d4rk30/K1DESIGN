import React from 'react';
import { Card, Form, Button, Space } from 'antd';
import type { Rule } from 'antd/es/form';
import dayjs from 'dayjs';
import LabelInput from '@/components/LabelInput';
import LabelSelect from '@/components/LabelSelect';
import LabelRangePicker from '@/components/LabelRangePicker';
import { SaveOutlined, SwapOutlined, UndoOutlined } from '@ant-design/icons';

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
                        rules={[{ required: true, message: '请输入授权码' }]}
                    >
                        <LabelInput
                            label="授权码"
                            placeholder="请输入授权码"
                        />
                    </Form.Item>

                    <Form.Item name="deviceSerial">
                        <LabelInput
                            label="设备序列号"
                            disabled
                        />
                    </Form.Item>

                    <Form.Item name="licenseDate">
                        <LabelRangePicker
                            label="授权期限"
                            showTime
                            disabled
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item name="blockFunction">
                        <LabelInput
                            label="阻断功能"
                            disabled
                        />
                    </Form.Item>

                    <Form.Item
                        name="companyName"
                        rules={[{ required: true, message: '请输入单位名称' }]}
                    >
                        <LabelInput
                            label="单位名称"
                            placeholder="请输入单位名称"
                            required
                        />
                    </Form.Item>

                    <Form.Item
                        name="industry"
                        rules={[{ required: true, message: '请选择所属行业' }]}
                    >
                        <LabelSelect
                            label="所属行业"
                            placeholder="请选择所属行业"
                            required
                            options={[
                                { label: '电信', value: 'telecom' },
                                { label: '广电', value: 'broadcast' },
                                { label: '银行', value: 'bank' },
                                { label: '海关', value: 'customs' }
                            ]}
                        >
                        </LabelSelect>
                    </Form.Item>

                    <Form.Item
                        name="deployLocation"
                        rules={[{ required: true, message: '请选择部署位置' }]}
                    >
                        <LabelSelect
                            label="部署位置"
                            placeholder="请选择部署位置"
                            required
                            options={[
                                { label: '办公区', value: 'office' },
                                { label: '互联网出口', value: 'internet' },
                                { label: '其他', value: 'other' }
                            ]}
                        >
                        </LabelSelect>
                    </Form.Item>

                    <Form.Item
                        name="province"
                        rules={[{ required: true, message: '请选择省份' }]}
                    >
                        <LabelSelect
                            label="省份"
                            required
                            placeholder="请选择省份"
                            options={provinces.map(province => ({ label: province, value: province }))}
                        >
                        </LabelSelect>
                    </Form.Item>

                    <Form.Item
                        name="city"
                        rules={[{ required: true, message: '请选择城市' }]}
                    >
                        <LabelSelect
                            label="城市"
                            placeholder="请选择城市"
                            required
                            options={cities.map(city => ({ label: city, value: city }))}
                        >
                        </LabelSelect>
                    </Form.Item>

                    <Form.Item
                        name="district"
                        rules={[{ required: true, message: '请选择区域' }]}
                    >
                        <LabelSelect
                            label="区域"
                            required
                            placeholder="请选择区域"
                            options={districts.map(district => ({ label: district, value: district }))}
                        >
                        </LabelSelect>
                    </Form.Item>

                    <Form.Item
                        name="manager"
                        rules={[{ required: true, message: '请输入负责人' }]}
                    >
                        <LabelInput
                            label="负责人"
                            placeholder="请输入负责人"
                            required
                        />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        rules={[{ required: true, message: '请输入联系电话' }]}
                    >
                        <LabelInput
                            label="联系电话"
                            required
                            placeholder="请输入联系电话"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: '请输入联系邮箱' },
                            { type: 'email', message: '请输入有效的邮箱地址' }
                        ]}
                    >
                        <LabelInput
                            label="联系邮箱"
                            placeholder="请输入联系邮箱"
                            required
                        />
                    </Form.Item>

                    <Form.Item
                        name="timeout"
                        rules={[
                            { required: true, message: '请输入系统超时时间' },
                            { type: 'number', min: 0, max: 60, message: '请输入0-60之间的整数' }
                        ]}
                    >
                        <LabelInput
                            label="系统超时时间（分）"
                            type="number"
                            min={0}
                            max={60}
                            style={{ width: '100%' }}
                            placeholder="请输入系统超时时间"
                            required
                        />
                    </Form.Item>

                    <Form.Item
                        name="hostname"
                        rules={hostNameRules}
                    >
                        <LabelInput
                            label="主机名"
                            placeholder='例如：192-168-1-1，仅可由小写字母、数字、"-"组成，最长64个字符'
                            required
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                                保存
                            </Button>
                            <Button onClick={handleSwitchLine} icon={<SwapOutlined />}>
                                线路切换
                            </Button>
                            <Button onClick={handleReset} icon={<UndoOutlined />}>
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
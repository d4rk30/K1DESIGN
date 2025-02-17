import React from 'react';
import { Card, Row, Col, Button, Input, Space, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';

// 修改组件名称为 NoData
const NoData: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Row gutter={16} align="middle">
                        <Col flex="auto">
                            <Input
                                placeholder={'攻击情报仅支持输入IP，外联情报支持IP、域名和URL'}
                                style={{
                                    height: 40,
                                    border: '1px solid #f0f0f0',
                                }}
                            />
                        </Col>
                        <Col>
                            <Space>
                                <Button
                                    type={'default'}
                                    style={{ height: 40 }}
                                >
                                    攻击情报查询
                                </Button>
                                <Button
                                    type={'default'}
                                    style={{ height: 40 }}
                                >
                                    外联情报查询
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Card styles={{ body: { padding: '24px' } }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="暂无相关 192.168.1.109 情报数据"
                            style={{ margin: '40px 0' }}
                        >
                        </Empty>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default NoData; 
import React from 'react';
import { Card, Row, Col, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Meta } = Card;

interface IntelligenceSource {
    title: string;
    logoPath: string;
    description: string;
    status: 'connected' | 'disconnected';
    updateTime: string;
}

const intelligenceSources: IntelligenceSource[] = [
    {
        title: '公安一所威胁情报',
        logoPath: '/images/公安一所.png',
        description: '正向攻击情报',
        status: 'connected',
        updateTime: '2024-04-08 15:30:00'
    },
    {
        title: '奇安信息威胁情报',
        logoPath: '/images/奇安信.png',
        description: '受控外联情报',
        status: 'connected',
        updateTime: '2024-04-08 15:28:00'
    },
    {
        title: '腾讯威胁情报',
        logoPath: '/images/腾讯.png',
        description: '受控外联情报',
        status: 'disconnected',
        updateTime: '2024-04-08 14:45:00'
    },
    {
        title: '360威胁情报',
        logoPath: '/images/360.png',
        description: '受控外联情报',
        status: 'connected',
        updateTime: '2024-04-08 15:25:00'
    },
    {
        title: '华为威胁情报',
        logoPath: '/images/华为.png',
        description: '受控外联情报',
        status: 'connected',
        updateTime: '2024-04-08 15:20:00'
    },
    {
        title: '阿里云威胁情报',
        logoPath: '/images/阿里.png',
        description: '受控外联情报',
        status: 'disconnected',
        updateTime: '2024-04-08 14:30:00'
    },
];

const PublicIntelligence: React.FC = () => {
    const renderStatus = (status: 'connected' | 'disconnected') => {
        return status === 'connected' ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
                已连接
            </Tag>
        ) : (
            <Tag color="error" icon={<CloseCircleOutlined />}>
                未连接
            </Tag>
        );
    };

    return (
        <div style={{}}>
            <Row gutter={[24, 24]}>
                {intelligenceSources.map((source, index) => (
                    <Col xs={24} sm={12} md={8} lg={4} xl={4} key={index}>
                        <Card>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        alt={source.title}
                                        src={source.logoPath}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                </div>
                                <Meta
                                    title={
                                        <div style={{
                                            paddingRight: '32px' // 为logo留出空间
                                        }}>
                                            <span>{source.title}</span>
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <div style={{ marginBottom: '8px' }}>{source.description}</div>
                                            <div style={{
                                                marginBottom: '12px',
                                            }}>
                                                更新时间: {source.updateTime}
                                            </div>
                                            {renderStatus(source.status)}

                                        </div>
                                    }
                                />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default PublicIntelligence;

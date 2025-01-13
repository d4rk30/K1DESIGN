import React from 'react';
import { Input, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const ThreatIntelligenceTrace: React.FC = () => {
    const navigate = useNavigate();

    const handleSearch = (type: 'attack' | 'external') => {
        navigate('detail', { state: { type } });
    };

    return (
        <div style={{
            height: '100%',
            backgroundImage: 'url(/images/bg.png)',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                paddingTop: '60px',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <div style={{
                        position: 'relative',
                        padding: '20px',
                    }}>
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '50px',
                            height: '10px',
                            background: 'rgba(0, 0, 0, 0.06)',
                            filter: 'blur(2px)',
                            borderRadius: '50%',
                        }} />
                        <img
                            src="/images/logo2.png"
                            alt="威胁情报溯源"
                            style={{
                                width: '64px',
                                height: '64px',
                                marginBottom: '24px',
                                objectFit: 'contain',
                                position: 'relative',
                            }}
                        />
                    </div>
                    <h1 style={{
                        marginTop: '12px',
                        color: 'rgba(0, 0, 0, 0.75)',
                    }}>网盾K01 威胁情报溯源</h1>
                    <div style={{
                        fontSize: '14px',
                        color: 'rgba(0, 0, 0, 0.4)',
                        marginBottom: '48px',
                        marginTop: '12px',
                    }}>
                        让一切威胁无所遁行
                    </div>
                    <div style={{
                        width: '100%',
                        maxWidth: '900px',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                    }}>
                        <Input
                            size="large"
                            placeholder="攻击情报仅支持输入IP；外联情报支持IP、域名和URL"
                            style={{ flex: 1 }}
                        />
                        <Space>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => handleSearch('attack')}
                            >
                                攻击情报查询
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => handleSearch('external')}
                            >
                                外联情报查询
                            </Button>
                        </Space>
                    </div>
                </div>
                <div style={{
                    textAlign: 'center',
                    color: 'rgba(0, 0, 0, 0.3)',
                    fontSize: '14px',
                    position: 'absolute',
                    bottom: '24px',
                    left: 0,
                    right: 0,
                }}>
                    云端情报支持:公安部第一研究所
                </div>
            </div>
        </div>
    );
};

export default ThreatIntelligenceTrace; 
import React, { useState } from 'react';
import { Input, Button, Space, message, Tag, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';

const ThreatIntelligenceTrace: React.FC = () => {
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState('');

    const handleSearch = (type: 'attack' | 'external') => {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
        const urlRegex = /^https?:\/\/(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?::[0-9]+)?(?:\/[^\s]*)?$/;

        if (!inputValue.trim()) {
            message.error('请输入查询内容');
            return;
        }

        if (type === 'attack') {
            if (!ipRegex.test(inputValue)) {
                message.error('攻击情报仅支持输入IP');
                return;
            }
            navigate('detail', { state: { type, query: inputValue, inputType: 'ip' } });
        } else { // external
            const isIp = ipRegex.test(inputValue);
            const isDomain = domainRegex.test(inputValue);
            const isUrl = urlRegex.test(inputValue);

            if (!isIp && !isDomain && !isUrl) {
                message.error('外联情报查询请输入有效的IP、域名或URL');
                return;
            }

            let inputType: string;
            if (isIp) {
                inputType = 'ip';
            } else if (isUrl) {
                inputType = 'url';
            } else {
                inputType = 'domain';
            }

            navigate('detail', { state: { type, query: inputValue, inputType } });
        }
    };

    const handleExampleClick = (example: string) => {
        setInputValue(example);
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
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
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

                    {/* 搜索示例区域 */}
                    <div style={{
                        width: '100%',
                        maxWidth: '900px',
                        marginTop: '32px',
                        padding: '24px',
                        borderRadius: '12px',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        position: 'relative',
                        background: 'rgba(255, 255, 255, 0.3)'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            color: 'rgba(0, 0, 0, 0.75)',
                            marginBottom: '16px',
                        }}>
                            搜索示例
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                        }}>
                            <Row>
                                <Col span={6} style={{ borderRight: '1px solid rgba(0, 0, 0, 0.1)', paddingRight: '16px' }}>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'rgba(0, 0, 0, 0.6)',
                                            marginBottom: '16px',
                                        }}>
                                            查询IP情报：
                                        </div>
                                        <Space wrap>
                                            <Tag
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '4px 12px',
                                                    fontSize: '13px',
                                                }}
                                                onClick={() => handleExampleClick('188.190.10.197')}
                                            >
                                                188.190.10.197
                                            </Tag>
                                            <Tag
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '4px 12px',
                                                    fontSize: '13px',
                                                }}
                                                onClick={() => handleExampleClick('121.37.189.177')}
                                            >
                                                121.37.189.177
                                            </Tag>
                                        </Space>
                                    </div>
                                </Col>
                                <Col span={8} style={{ borderRight: '1px solid rgba(0, 0, 0, 0.1)', paddingRight: '16px', paddingLeft: '16px' }}>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'rgba(0, 0, 0, 0.6)',
                                            marginBottom: '16px',
                                        }}>
                                            查询域名情报：
                                        </div>
                                        <Space wrap>
                                            <Tag
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '4px 12px',
                                                    fontSize: '13px',
                                                }}
                                                onClick={() => handleExampleClick('admin01.spikq.com')}
                                            >
                                                admin01.spikq.com
                                            </Tag>
                                            <Tag
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '4px 12px',
                                                    fontSize: '13px',
                                                }}
                                                onClick={() => handleExampleClick('update.wpsofiice.net')}
                                            >
                                                http://update.wpsofiice.net
                                            </Tag>
                                        </Space>
                                    </div>
                                </Col>
                                <Col span={8} style={{ paddingLeft: '16px' }}>
                                    <div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: 'rgba(0, 0, 0, 0.6)',
                                            marginBottom: '16px',
                                        }}>
                                            查询URL情报：
                                        </div>
                                        <Space wrap>
                                            <Tag
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '4px 12px',
                                                    fontSize: '13px',
                                                }}
                                                onClick={() => handleExampleClick('ewoijioewoif27.club/search?q=123')}
                                            >
                                                ewoijioewoif27.club/search?q=123
                                            </Tag>
                                            <Tag
                                                style={{
                                                    cursor: 'pointer',
                                                    padding: '4px 12px',
                                                    fontSize: '13px',
                                                }}
                                                onClick={() => handleExampleClick('http://chromedata.webredirect.org/search?q=123')}
                                            >
                                                http://chromedata.webredirect.org/search?q=123
                                            </Tag>
                                        </Space>
                                    </div>
                                </Col>
                            </Row>
                        </div>
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
                    云端情报支持：公安部第一研究所
                </div>
            </div>
        </div >
    );
};

export default ThreatIntelligenceTrace;
import React, { useState, useRef, useEffect } from 'react';
import { Card, Row, Col, Button, Tag, Typography } from 'antd';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import styles from './style.module.less';

interface AttackTrendData {
  date: string;
  high: number;
  medium: number;
  low: number;
}

interface BaseData {
  type: string;
  count: number;
  percentage: number;
}

interface AttackTrendCardProps {
  trendData: AttackTrendData[];
  intelTypeData: BaseData[];
}

const CHART_COLORS = {
  high: '#ff4d4f',
  medium: '#faad14',
  low: '#52c41a',
  blue: '#1890ff',
};

const CHART_CONFIG = {
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '40px',
    containLabel: true
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  }
};

const STYLES = {
  chartTitle: {
    fontWeight: 500,
    fontSize: '14px',
    color: '#000000'
  },
  chartSubtitle: {
    fontSize: '12px',
    color: '#8c8c8c',
    marginLeft: '4px'
  },
  tag: (color: keyof typeof CHART_COLORS) => ({
    marginLeft: '8px',
    border: '1px solid',
    background: `rgba(${color}, 0.1)`,
    color: CHART_COLORS[color],
    borderColor: `rgba(${color}, 0.2)`
  })
};

const renderChartTitle = (title: string, subtitle: string = '（单位：次数）') => (
  <div style={{ marginBottom: '8px', marginLeft: '12px' }}>
    <span style={STYLES.chartTitle}>{title}</span>
    <span style={STYLES.chartSubtitle}>{subtitle}</span>
  </div>
);

const AttackTrendCard: React.FC<AttackTrendCardProps> = ({ trendData, intelTypeData }) => {
  const [isChartsExpanded, setIsChartsExpanded] = useState(false);

  const CollapsedCharts: React.FC<{
    trendData: AttackTrendData[];
    intelTypeData: BaseData[];
    style?: React.CSSProperties;
  }> = ({ trendData, intelTypeData, style }) => {
    const [indexes, setIndexes] = useState({ trend: 0, intelType: 0 });
    const [isPaused, setIsPaused] = useState({ trend: false, intelType: false });
    const [isFading, setIsFading] = useState(false);
    const intervals = useRef<{ [key: string]: NodeJS.Timeout }>({});

    const updateIndex = (type: 'trend' | 'intelType') => {
      setIsFading(true);
      setTimeout(() => {
        setIndexes(prev => ({
          ...prev,
          [type]: type === 'trend'
            ? (prev.trend + 1) % trendData.length
            : (prev.intelType + 1) % Math.ceil(intelTypeData.length / 3)
        }));
        setIsFading(false);
      }, 300);
    };

    useEffect(() => {
      Object.entries({ trend: !isPaused.trend, intelType: !isPaused.intelType })
        .forEach(([key, shouldRun]) => {
          if(shouldRun) {
            intervals.current[key] = setInterval(
              () => updateIndex(key as 'trend' | 'intelType'),
              5000
            );
          }
        });

      return () => {
        Object.values(intervals.current).forEach(clearInterval);
      };
    }, [isPaused, trendData.length, intelTypeData.length]);

    const renderTrendTags = (data: AttackTrendData) => (
      ['high', 'medium', 'low'].map(level => (
        <Tag key={level} style={STYLES.tag(level as keyof typeof CHART_COLORS)}>
          {`${level === 'high' ? '高危' : level === 'medium' ? '中危' : '低危'}：${data[level as keyof Pick<AttackTrendData, 'high' | 'medium' | 'low'>]}`}
        </Tag>
      ))
    );

    return (
      <div style={{
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        ...style
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '24px',
            flexShrink: 0
          }}
          onMouseEnter={() => setIsPaused({ ...isPaused, trend: true })}
          onMouseLeave={() => setIsPaused({ ...isPaused, trend: false })}
        >
          <span style={STYLES.chartTitle}>攻击趋势</span>
          <span style={STYLES.chartSubtitle}>（单位：次数）</span>
          <div className={`${styles.content} ${isFading ? styles['fade-out'] : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {trendData[indexes.trend]?.date}
            </span>
            {renderTrendTags(trendData[indexes.trend])}
          </div>
        </div>

        <div style={{ width: '1px', height: '20px', background: '#f0f0f0', margin: '0 24px', flexShrink: 0 }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flex: 1,
            justifyContent: 'space-between'
          }}
          onMouseEnter={() => setIsPaused({ ...isPaused, intelType: true })}
          onMouseLeave={() => setIsPaused({ ...isPaused, intelType: false })}
        >
          <div style={{ flexShrink: 0 }}>
            <span style={STYLES.chartTitle}>情报类型TOP10</span>
            <span style={STYLES.chartSubtitle}>（单位：百分比）</span>
          </div>
          <div className={`${styles.content} ${isFading ? styles['fade-out'] : ''}`} style={{ display: 'flex', gap: '32px', minWidth: 0, flex: 1 }}>
            {intelTypeData
              .slice(indexes.intelType * 3, (indexes.intelType + 1) * 3)
              .map((item: BaseData, index: number) => (
                <div key={`${item.type}-${indexes.intelType}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 0 }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#e6f7ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: CHART_COLORS.blue,
                    fontSize: '12px',
                    flexShrink: 0
                  }}>
                    {indexes.intelType * 3 + index + 1}
                  </div>
                  <Typography.Text className={styles['type-text']}>{item.type}</Typography.Text>
                  <Tag style={{
                    marginLeft: '8px',
                    border: '1px solid',
                    background: 'rgba(24, 144, 255, 0.1)',
                    color: CHART_COLORS.blue,
                    borderColor: 'rgba(24, 144, 255, 0.2)',
                    flexShrink: 0
                  }}>{item.percentage}%</Tag>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const AttackTrendChart: React.FC = () => {
    const generateChartData = () => {
      const dates = Array.from({length: 7}, (_, i) => 
        dayjs().subtract(6-i, 'day').format('MM-DD')
      );

      const generateRiskData = () => ({
        high: Math.random() < 0.2 
          ? Math.floor(Math.random() * 200 + 4800)
          : Math.floor(Math.random() * 2800 + 2000),
        medium: Math.floor(Math.random() * 2000 + 1500),
        low: Math.floor(Math.random() * 2000 + 500)
      });

      return {
        dates,
        riskData: dates.map(() => generateRiskData())
      };
    };

    const { dates, riskData } = generateChartData();
    
    const option = {
      ...CHART_CONFIG,
      legend: {
        data: ['高危', '中危', '低危'],
        top: 0,
        left: 'center',
      },
      xAxis: {
        type: 'category',
        data: dates,
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 5000,
        interval: 1000,
      },
      series: [
        {
          name: '高危',
          type: 'bar',
          data: riskData.map(d => d.high),
          itemStyle: {
            color: CHART_COLORS.high,
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '中危',
          type: 'bar',
          data: riskData.map(d => d.medium),
          itemStyle: {
            color: CHART_COLORS.medium,
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: '低危',
          type: 'bar',
          data: riskData.map(d => d.low),
          itemStyle: {
            color: CHART_COLORS.low,
            borderRadius: [4, 4, 0, 0]
          }
        }
      ]
    };

    return (
      <>
        {renderChartTitle('攻击趋势')}
        <ReactECharts
          option={option}
          style={{ height: '180px' }}
          opts={{ renderer: 'svg' }}
        />
      </>
    );
  };

  const IntelTypeChart: React.FC = () => {
    const generateData = () => {
      const types = [
        '僵尸网络', '漏洞利用', '恶意IP', '暴力破解', '扫描探测',
        '拒绝服务攻击', 'WebShell攻击', '恶意代码攻击', '代理IP', '木马蠕虫攻击'
      ];

      return types.map(type => ({
        name: type,
        value: Math.floor(Math.random() * 1000)
      }));
    };

    const data = generateData();
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const colors = [
      '#1890ff',
      '#2E9BFF',
      '#44A6FF',
      '#5AB1FF',
      '#70BCFF',
      '#86C7FF',
      '#9CD2FF',
      '#B2DDFF',
      '#C8E8FF',
      '#DEF3FF'
    ];

    const option = {
      ...CHART_CONFIG,
      color: colors,
      tooltip: {
        trigger: 'item',
        formatter: (params: { name: string; value: number; percent: number; }) => {
          return `${params.name}: ${params.value} 次 (${params.percent}%)`;
        }
      },
      legend: [
        {
          type: 'scroll',
          orient: 'vertical',
          right: '35%',
          top: 'middle',
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 10,
          data: data.slice(0, 5),
          formatter: (name: string) => {
            const item = data.find(d => d.name === name);
            if (item) {
              const percent = ((item.value / total) * 100).toFixed(1);
              return `${name}  ${percent}%`;
            }
            return name;
          },
          textStyle: {
            fontSize: 12
          }
        },
        {
          type: 'scroll',
          orient: 'vertical',
          right: '10%',
          top: 'middle',
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 10,
          data: data.slice(5, 10),
          formatter: (name: string) => {
            const item = data.find(d => d.name === name);
            if (item) {
              const percent = ((item.value / total) * 100).toFixed(1);
              return `${name}  ${percent}%`;
            }
            return name;
          },
          textStyle: {
            fontSize: 12
          }
        }
      ],
      series: [
        {
          name: '情报类型',
          type: 'pie',
          radius: ['40%', '60%'],
          center: ['20%', '50%'],
          data: data,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    return (
      <>
        {renderChartTitle('情报类型TOP10', '（单位：百分比）')}
        <ReactECharts
          option={option}
          style={{ height: '180px', marginLeft: '-30px' }}
          opts={{ renderer: 'svg' }}
        />
      </>
    );
  };

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <Card style={{ marginBottom: isChartsExpanded ? '24px' : '0' }}>
        {isChartsExpanded ? (
          <Row gutter={24}>
            <Col span={12}>
              <AttackTrendChart />
            </Col>
            <Col span={12} style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', right: 12, top: -4, zIndex: 1 }}>
                <Button
                  type="link"
                  onClick={() => setIsChartsExpanded(false)}
                  style={{ padding: '4px 0' }}
                >
                  收起图表
                </Button>
              </div>
              <IntelTypeChart />
            </Col>
          </Row>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <CollapsedCharts
                trendData={trendData}
                intelTypeData={intelTypeData}
                style={{ padding: 0 }}
              />
            </div>
            <Button
              type="link"
              onClick={() => setIsChartsExpanded(true)}
              style={{ padding: '4px 0', marginLeft: '16px' }}
            >
              展开图表
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttackTrendCard; 
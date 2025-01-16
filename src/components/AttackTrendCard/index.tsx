import React, { useState } from 'react';
import { Card, Row, Col, Button, Tag, Typography } from 'antd';
import ReactECharts from 'echarts-for-react';
import styles from './style.module.less';

// 类型定义
interface AttackTrendData {
  date: string;
  high: number;
  medium: number;
  low: number;
}

interface IntelTypeData {
  type: string;
  count: number;
  percentage: number;
}

interface AttackTrendCardProps {
  trendData: AttackTrendData[];
  intelTypeData: IntelTypeData[];
}

// 常量配置
const CHART_COLORS = {
  high: {
    type: 'linear',
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [{
      offset: 0,
      color: '#ff1f1fb3'
    }, {
      offset: 1,
      color: '#ff4d4fb3'
    }]
  },
  medium: {
    type: 'linear',
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [{
      offset: 0,
      color: '#faad14b3'
    }, {
      offset: 1,
      color: '#ffc53db3'
    }]
  },
  low: {
    type: 'linear',
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [{
      offset: 0,
      color: '#389e0db3'
    }, {
      offset: 1,
      color: '#52c41ab3'
    }]
  },
  blue: '#1890ff'
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

// 子组件1: 折叠状态下的攻击趋势展示
const CollapsedTrendDisplay: React.FC<{
  data: AttackTrendData;
  date: string;
  isFading: boolean;
}> = ({ data, date, isFading }) => (
  <div className={`${styles.content} ${isFading ? styles['fade-out'] : ''}`}
    style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
    <span style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>{date}</span>
    {['high', 'medium', 'low'].map(level => (
      <Tag key={level}
        color={level === 'high' ? 'error' : level === 'medium' ? 'warning' : 'success'}>
        {`${level === 'high' ? '高危' : level === 'medium' ? '中危' : '低危'}：${data[level as keyof Pick<AttackTrendData, 'high' | 'medium' | 'low'>]}`}
      </Tag>
    ))}
  </div>
);

// 子组件2: 折叠状态下的情报类型展示
const CollapsedIntelDisplay: React.FC<{
  data: IntelTypeData[];
  startIndex: number;
  displayCount: number;
  isFading: boolean;
}> = ({ data, startIndex, displayCount, isFading }) => (
  <div className={`${styles.content} ${isFading ? styles['fade-out'] : ''}`}
    style={{ display: 'flex', gap: '1%', minWidth: 0, flex: 1 }}>
    {data.slice(startIndex, startIndex + displayCount).map((item, index) => (
      <div key={`${item.type}-${index}`}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 0 }}>
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
          {startIndex + index + 1}
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
);

// 子组件3: 展开状态下的攻击趋势图表
const ExpandedTrendChart: React.FC<{
  data: AttackTrendData[];
}> = ({ data }) => {
  // 计算最大值，并向上取整到最近的500的倍数
  const maxValue = Math.max(...data.map(item => Math.max(item.high, item.medium, item.low)));
  const roundedMax = Math.ceil(maxValue / 500) * 500;

  const option = {
    ...CHART_CONFIG,
    legend: {
      data: ['高危', '中危', '低危'],
      top: 0,
      left: 'center',
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: roundedMax,
      interval: 500,  // 固定间隔为500
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [
      {
        name: '高危',
        type: 'bar',
        data: data.map(item => item.high),
        itemStyle: {
          color: CHART_COLORS.high,
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '中危',
        type: 'bar',
        data: data.map(item => item.medium),
        itemStyle: {
          color: CHART_COLORS.medium,
          borderRadius: [4, 4, 0, 0]
        }
      },
      {
        name: '低危',
        type: 'bar',
        data: data.map(item => item.low),
        itemStyle: {
          color: CHART_COLORS.low,
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  };

  return (
    <>
      <div style={{ marginBottom: '8px', marginLeft: '12px' }}>
        <span style={{ fontWeight: 500, fontSize: '14px', color: '#000000' }}>攻击趋势</span>
      </div>
      <ReactECharts
        option={option}
        style={{ height: '180px' }}
        opts={{ renderer: 'svg' }}
      />
    </>
  );
};

// 子组件4: 展开状态下的情报类型图表
const ExpandedIntelChart: React.FC<{
  data: IntelTypeData[];
}> = ({ data }) => {
  const colors = ['#1890ff', '#2E9BFF', '#44A6FF', '#5AB1FF', '#70BCFF',
    '#86C7FF', '#9CD2FF', '#B2DDFF', '#C8E8FF', '#DEF3FF'];

  const option = {
    ...CHART_CONFIG,
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}: ${params.value} 次 (${params.percent}%)`;
      }
    },
    legend: [
      {
        type: 'scroll',
        orient: 'vertical',
        right: '35%',
        top: 'middle',
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 12,
        data: data.slice(0, 5).map(item => item.type),
        formatter: (name: string) => {
          const item = data.find(d => d.type === name);
          return item ? `${name}  ${item.percentage}%` : name;
        },
        textStyle: {
          fontSize: 13,
          lineHeight: 20
        }
      },
      {
        type: 'scroll',
        orient: 'vertical',
        right: '10%',
        top: 'middle',
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 12,
        data: data.slice(5).map(item => item.type),
        formatter: (name: string) => {
          const item = data.find(d => d.type === name);
          return item ? `${name}  ${item.percentage}%` : name;
        },
        textStyle: {
          fontSize: 13,
          lineHeight: 20
        }
      }
    ],
    series: [{
      name: '情报类型',
      type: 'pie',
      radius: ['45%', '75%'],
      center: ['30%', '50%'],
      data: data.map(item => ({
        name: item.type,
        value: item.count
      })),
      label: { show: false },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  return (
    <>
      <div style={{ marginBottom: '8px', marginLeft: '12px' }}>
        <span style={{ fontWeight: 500, fontSize: '14px', color: '#000000' }}>情报类型TOP{data.length}</span>
      </div>
      <ReactECharts
        option={option}
        style={{ height: '180px', marginLeft: '-100px' }}
        opts={{ renderer: 'svg' }}
      />
    </>
  );
};

// 主组件
const AttackTrendCard: React.FC<AttackTrendCardProps> = ({
  trendData,
  intelTypeData,
}) => {
  const [isChartsExpanded, setIsChartsExpanded] = useState(false);

  return (
    <div style={{ position: 'relative', marginBottom: '24px' }}>
      <Card style={{ marginBottom: isChartsExpanded ? '24px' : '0' }}>
        {isChartsExpanded ? (
          <Row gutter={24}>
            <Col span={12}>
              <ExpandedTrendChart data={trendData} />
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
              <ExpandedIntelChart data={intelTypeData} />
            </Col>
          </Row>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',  // 确保垂直居中
            justifyContent: 'space-between'
          }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0
                }}
              >
                <span style={{ fontWeight: 500, fontSize: '14px', color: '#000000', marginRight: '8px' }}>攻击趋势</span>
                <CollapsedTrendDisplay
                  data={trendData[0]}
                  date={trendData[0].date}
                  isFading={false}
                />
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
              >
                <div style={{ flexShrink: 0 }}>
                  <span style={{ fontWeight: 500, fontSize: '14px', color: '#000000' }}>情报类型TOP5</span>
                </div>
                <CollapsedIntelDisplay
                  data={intelTypeData}
                  startIndex={0}
                  displayCount={5}
                  isFading={false}
                />
              </div>
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
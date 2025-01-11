import React from 'react';
import { DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import styles from './index.module.css';
import locale from 'antd/es/date-picker/locale/zh_CN';

const { RangePicker } = DatePicker;

interface LabelRangePickerProps extends Omit<RangePickerProps, 'onChange'> {
    label?: string;
    value?: [any, any];
    onChange?: (dates: [any, any] | null) => void;
    presets?: { label: string; value: [any, any] }[];
}

const LabelRangePicker: React.FC<LabelRangePickerProps> = ({
    label,
    value,
    onChange,
    presets,
    className,
    ...rest
}) => {
    return (
        <div className={styles.labelRangePickerWrapper}>
            {label && <span className={styles.label}>{label}</span>}
            <RangePicker
                {...rest}
                value={value}
                onChange={onChange}
                className={`${styles.picker} ${className || ''}`}
                presets={presets}
                locale={locale}
                bordered={false}
            />
        </div>
    );
};

export default LabelRangePicker; 
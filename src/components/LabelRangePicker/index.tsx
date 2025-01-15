import React from 'react';
import { DatePicker } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import styles from './index.module.css';

const { RangePicker } = DatePicker;

interface LabelRangePickerProps extends Omit<RangePickerProps, 'onChange'> {
    label?: string;
    required?: boolean;
    value?: [any, any];
    onChange?: (dates: [any, any] | null) => void;
    presets?: { label: string; value: [any, any] }[];
    disabled?: boolean;
}

const LabelRangePicker: React.FC<LabelRangePickerProps> = ({
    label,
    required,
    value,
    onChange,
    presets,
    className,
    disabled,
    ...rest
}) => {
    return (
        <div className={`${styles.labelRangePickerWrapper} ${disabled ? styles.disabled : ''}`}>
            {label && (
                <span className={styles.label}>
                    {required && <span className={styles.required}>*</span>}
                    {label}
                </span>
            )}
            <RangePicker
                {...rest}
                disabled={disabled}
                value={value}
                onChange={onChange}
                className={`${styles.picker} ${className || ''}`}
                presets={presets}
                bordered={false}
            />
        </div>
    );
};

export default LabelRangePicker; 
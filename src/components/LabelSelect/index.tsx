import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd/es/select';
import styles from './style.module.less';

interface LabelSelectProps extends SelectProps {
    label: string;
    required?: boolean;
}

const LabelSelect: React.FC<LabelSelectProps> = ({
    label,
    required,
    className,
    ...restProps
}) => {
    return (
        <Select
            className={`${styles.labelSelect} ${className || ''}`}
            prefix={
                <span className={styles.label}>
                    {required && <span className={styles.required}>*</span>}
                    {label}
                </span>
            }
            {...restProps}
        />
    );
};

export default LabelSelect; 
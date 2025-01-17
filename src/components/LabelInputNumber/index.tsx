import React from 'react';
import { InputNumber, InputNumberProps } from 'antd';
import styles from './style.module.less';

interface LabelInputNumberProps extends InputNumberProps {
    label: string;
    required?: boolean;
}

const LabelInputNumber: React.FC<LabelInputNumberProps> = ({
    label,
    required,
    className,
    ...restProps
}) => {
    return (
        <div className={styles.labelInputNumberWrapper}>
            <InputNumber
                className={`${styles.input} ${className || ''}`}
                prefix={
                    <span className={styles.label}>
                        {required && <span className={styles.required}>*</span>}
                        {label}
                    </span>
                }
                {...restProps}
            />
        </div>
    );
};

export default LabelInputNumber; 
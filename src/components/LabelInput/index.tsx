import React from 'react';
import { Input, InputProps } from 'antd';
import styles from './style.module.less';

interface LabelInputProps extends InputProps {
    label: string;
    required?: boolean;
}

const LabelInput: React.FC<LabelInputProps> = ({
    label,
    required,
    className,
    ...restProps
}) => {
    return (
        <div className={styles.labelInputWrapper}>
            <Input
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

export default LabelInput; 
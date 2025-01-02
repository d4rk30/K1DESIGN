import React from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd/es/input';
import styles from './style.module.less';

interface LabelInputProps extends Omit<InputProps, 'label'> {
    label: string;
}

const LabelInput: React.FC<LabelInputProps> = ({ label, ...props }) => {
    return (
        <div className={styles.labelInputWrapper}>
            <span className={styles.label}>{label}</span>
            <Input variant="borderless" {...props} className={`${styles.input} ${props.className || ''}`} />
        </div>
    );
};

export default LabelInput; 
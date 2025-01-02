import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd/es/select';
import styles from './style.module.less';

interface LabelSelectProps extends Omit<SelectProps, 'label'> {
    label: string;
}

const LabelSelect: React.FC<LabelSelectProps> = ({ label, ...props }) => {
    return (
        <div className={styles.labelSelectWrapper}>
            <span className={styles.label}>{label}</span>
            <Select variant="borderless" {...props} className={`${styles.select} ${props.className || ''}`} />
        </div>
    );
};

export default LabelSelect; 
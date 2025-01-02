import React from 'react';
import { Cascader } from 'antd';
import type { CascaderProps, DefaultOptionType } from 'antd/es/cascader';
import styles from './style.module.less';

interface LabelCascaderProps extends Omit<CascaderProps<DefaultOptionType, string, false>, 'label'> {
    label: string;
}

const LabelCascader: React.FC<LabelCascaderProps> = ({ label, ...props }) => {
    return (
        <div className={styles.labelCascaderWrapper}>
            <span className={styles.label}>{label}</span>
            <Cascader variant="borderless" {...props} className={`${styles.cascader} ${props.className || ''}`} />
        </div>
    );
};

export default LabelCascader; 
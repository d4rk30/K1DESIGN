import React from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd/es/input';
import styles from './style.module.less';

interface LabelInputProps extends Omit<InputProps, 'label'> {
    label: string;
    required?: boolean;
}

const LabelInput: React.FC<LabelInputProps> = ({ 
    label, 
    required = false,
    style,
    ...props 
}) => {
    return (
        <div className={styles.labelWrapper} style={style}>
            <div className={styles.label}>
                {required && (
                    <span className={styles.required}>
                        *
                    </span>
                )}
                <span>{label}</span>
            </div>
            <Input
                {...props}
                className={styles.input}
                style={{
                    paddingLeft: `${label.length * 14 + 50}px`
                }}
            />
        </div>
    );
};

export default LabelInput; 
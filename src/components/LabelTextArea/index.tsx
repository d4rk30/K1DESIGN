import React from 'react';
import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import styles from './style.module.less';

const { TextArea } = Input;

interface LabelTextAreaProps extends TextAreaProps {
    label: string;
    required?: boolean;
}

const LabelTextArea: React.FC<LabelTextAreaProps> = ({
    label,
    required,
    className,
    ...restProps
}) => {
    return (
        <div className={styles.labelTextAreaWrapper}>
            <div className={styles.inputWrapper}>
                <span className={styles.label}>
                    {required && <span className={styles.required}>*</span>}
                    {label}
                </span>
                <TextArea
                    className={`${styles.textarea} ${className || ''}`}
                    {...restProps}
                />
            </div>
        </div>
    );
};

export default LabelTextArea; 
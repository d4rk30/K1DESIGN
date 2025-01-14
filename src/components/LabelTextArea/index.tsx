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
            <TextArea
                className={styles.textarea}
                style={{
                    paddingLeft: `${label.length * 14 + 50}px`
                }}
                {...props}
            />
        </div>
    );
};

export default LabelTextArea; 
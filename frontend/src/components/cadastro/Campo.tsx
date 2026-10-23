import type { ReactNode } from "react";
import styles from "./Campo.module.css";

interface CampoProps {
    id: string;
    rotulo: string;
    className?: string;
    children: ReactNode;
}

export default function Campo({id, rotulo, className = "", children}: CampoProps) {
    return (
        <div className={`${styles.campo} ${className}`}>
            <label htmlFor={id}>{rotulo}</label>
            {children}
        </div>
    );
}
import React, {memo} from 'react';
import * as styles from './Cell.module.css';

const Cell = memo(({state, handleClick}) => {
    const cellClass = state === 1 ? styles.Alive : styles.Dead;
    return (
        <li className={`${styles.Cell} ${cellClass}`} onClick={handleClick}>
            <div />
        </li>
    );
});

export default Cell;

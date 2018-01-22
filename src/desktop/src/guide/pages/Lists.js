import React from 'react';
import classNames from 'classnames';

import listCSS from 'components/UI/HistoryList.css';

import css from './lists.css';

const Colors = () => {
    return (
        <div className={css.lists}>
            <h1>History list inline</h1>
            <nav className={classNames(listCSS.historyList, listCSS.inline)}>
                <a className={classNames(listCSS.received, listCSS.confirmed)}>
                    <div>
                        <span>2 days ago</span>
                        <strong>Received</strong>
                        <span>12Mi</span>
                    </div>
                </a>
                <a className={classNames(listCSS.received, listCSS.pending)}>
                    <div>
                        <span>1 day ago</span>
                        <strong>Pending</strong>
                        <span>120Gi</span>
                    </div>
                </a>
                <a className={classNames(listCSS.sent, listCSS.confirmed)}>
                    <div>
                        <span>1 day ago</span>
                        <strong>Sent</strong>
                        <span>-120Gi</span>
                    </div>
                </a>
                <a className={classNames(listCSS.sent, listCSS.pending)}>
                    <div>
                        <span>1 day ago</span>
                        <strong>Pending</strong>
                        <span>-120Gi</span>
                    </div>
                </a>
            </nav>

            <h1>History list full</h1>
            <nav className={listCSS.historyList}>
                <a>
                    <div className={listCSS.full}>
                        <p>
                            <span>Received 12Mi</span>
                            <strong>Confirmed</strong>
                        </p>
                        <p>
                            <span>Message: Hello</span>
                            <span>12 days ago</span>
                        </p>
                    </div>
                </a>
                <a>
                    <div className={listCSS.full}>
                        <p>
                            <span>Received 12Mi</span>
                            <strong>Confirmed</strong>
                        </p>
                        <p>
                            <span>Message: Hello</span>
                            <span>12 days ago</span>
                        </p>
                    </div>
                </a>
            </nav>
        </div>
    );
};

export default Colors;

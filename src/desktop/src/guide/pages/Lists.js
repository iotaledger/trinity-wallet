import React from 'react';
import classNames from 'classnames';

import listCSS from 'ui/components/list.css';
import Icon from 'ui/components/Icon';

import css from './lists.css';

const Colors = () => {
    return (
        <div className={css.lists}>
            <h1>History list inline</h1>
            <nav className={classNames(listCSS.list, listCSS.inline)}>
                <a className={classNames(listCSS.received, listCSS.confirmed)}>
                    <div>
                        <Icon icon="receive" size={16} />
                        <span>2 days ago</span>
                        <strong>Received</strong>
                        <span>12Mi</span>
                    </div>
                </a>
                <a className={classNames(listCSS.received, listCSS.pending)}>
                    <div>
                        <Icon icon="receive" size={16} />
                        <span>1 day ago</span>
                        <strong>Pending</strong>
                        <span>120Gi</span>
                    </div>
                </a>
                <a className={classNames(listCSS.sent, listCSS.confirmed)}>
                    <div>
                        <Icon icon="send" size={16} />
                        <span>1 day ago</span>
                        <strong>Sent</strong>
                        <span>-120Gi</span>
                    </div>
                </a>
                <a className={classNames(listCSS.sent, listCSS.pending)}>
                    <div>
                        <Icon icon="send" size={16} />
                        <span>1 day ago</span>
                        <strong>Pending</strong>
                        <span>-120Gi</span>
                    </div>
                </a>
            </nav>

            <h1>History list full</h1>
            <nav className={listCSS.list}>
                <a className={classNames(listCSS.received, listCSS.pending)}>
                    <div className={listCSS.full}>
                        <p>
                            <span>Received 12Mi</span>
                            <strong>Pending</strong>
                        </p>
                        <p>
                            <span>Message: Hello</span>
                            <span>12 days ago</span>
                        </p>
                    </div>
                </a>
                <a className={classNames(listCSS.received, listCSS.confirmed)}>
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

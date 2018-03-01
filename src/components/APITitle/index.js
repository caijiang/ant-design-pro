import React, { PureComponent } from 'react';
import { Tooltip } from 'antd';
import styles from '../api.less';

/**
 * 背景应该采用浅色表示method
 * 外框应该使用重色表示状态
 * tooltip 显示 summary
 * 若 deprecated 则显示删除线
 */
export default class APITitle extends PureComponent {
  render() {
    const { api } = this.props;
    const titleClasses = [styles[`entryTitle_${api.method}`]];
    if (api.status) { titleClasses.push(styles[`entryTitle_${api.status}`]); }
    if (api.deprecated) { titleClasses.push(styles.entryTitle_deprecated); }
    return (
      <div className={titleClasses.join(' ')}>
        <Tooltip title={api.summary}>
          <span className={styles[`methodName_${api.method}`]}>{api.method}</span>
        &nbsp;
          {api.uri}
        </Tooltip>
      </div>
    );
  }
}

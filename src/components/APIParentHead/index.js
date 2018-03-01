import React, { PureComponent } from 'react';
import { Button, Tooltip } from 'antd';
import APICreation from '../APICreation';

/**
 * 作为信息显示在API上级
 * 应该具备tag过滤，新增API等功能
 */
export default class APIParentHead extends PureComponent {
  state = {
    startCreate: false,
  }
  createAPI = (data) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'projectSchema/addApi',
      payload: data,
      callback: () => this.setState({ startCreate: false }),
    });
  }
  render() {
    const { startCreate } = this.state;
    return (
      <div >
        <span>API</span>
        <Tooltip title="可以实现过滤">
          <Button type="dashed" size="small" icon="filter" />
        </Tooltip>
        <Tooltip title="添加一个新的API">
          <Button size="small" icon="plus" onClick={() => this.setState({ startCreate: true })} />
        </Tooltip>
        <APICreation
          visible={startCreate}
          onCancel={() => this.setState({ startCreate: false })}
          onOk={this.createAPI}
        />
      </div>
    );
  }
}

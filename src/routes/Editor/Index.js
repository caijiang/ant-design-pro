import React, { PureComponent } from 'react';
import { connect } from 'dva';

@connect(state => ({
  projectSchema: state.projectSchema,
}))
export default class Index extends PureComponent {
  render() {
    return <p>点击左侧菜单吧。</p>;
  }
}

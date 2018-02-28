import React, { PureComponent } from 'react';
import { connect } from 'dva';

@connect(state => ({
  projects: state.projects,
}))
export default class APIEditor extends PureComponent {
  render() {
    return <div />;
  }
}

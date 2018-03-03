import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Row, Col, Input, Spin, Icon, Popconfirm, Tooltip, Collapse } from 'antd';
import { toPaths } from '../../models/projectSchema';
import globalStyles from '../../index.less';
import styles from '../../components/api.less';
import APIEditorSummary from './APIEditorSummary';

const { Panel } = Collapse;

@connect(state => ({
  projectSchema: state.projectSchema,
}))
export default class APIEditor extends PureComponent {
  apiId = () => {
    const { match: { params: { id } } } = this.props;
    return parseInt(id, 10);
  }
  apiMethod = () => {
    const { match: { params: { method } } } = this.props;
    return method;
  }
  /**
   * 返回我关注的api
   */
  myApi = () => {
    const { projectSchema: { schema } } = this.props;
    const [result] = toPaths(schema)
      .filter(api => api.id === this.apiId())
      .filter(api => api.method === this.apiMethod());
    return result;
  }


  unwatchApi = () => {
    const api = this.myApi();
    const { dispatch } = this.props;
    dispatch({
      type: 'projectSchema/unwatchApi',
      payload: {
        id: api.id,
        method: api.method,
      },
    });
  }

  watchApi = () => {
    const api = this.myApi();
    const { dispatch } = this.props;
    dispatch({
      type: 'projectSchema/watchApi',
      payload: {
        id: api.id,
        method: api.method,
      },
    });
  }

  submitApi = () => {
    const api = this.myApi();
    const { dispatch } = this.props;
    dispatch({
      type: 'projectSchema/submitApi',
      payload: {
        id: api.id,
        method: api.method,
      },
    });
  }

  unSubmitApi = () => {
    const api = this.myApi();
    const { dispatch } = this.props;
    dispatch({
      type: 'projectSchema/unSubmitApi',
      payload: {
        id: api.id,
        method: api.method,
      },
    });
  }


  render() {
    const api = this.myApi();
    if (!api) {
      return <Spin size="large" className={globalStyles.globalSpin} />;
    }
    console.log(api.watch);
    const { projectSchema: { schema: { version } } } = this.props;
    const globalEditable = !version && (!api.status || api.status === 'editing');
    const lockButton = api.status === 'editing' ? (
      <Col md={4} sm={8}>
        <Popconfirm title="锁定该API之后，在获得其他关注者的许可之前将不可编辑。">
          <Button size="small" onClick={this.submitApi}><Icon type="lock" /></Button>
        </Popconfirm>
      </Col>
    ) : null;
    const unlockButton = api.status === 'submitted' ? (
      <Col md={4} sm={8}>
        <Popconfirm title="确定要申请其他关注的许可以获得编辑权？">
          <Button size="small" onClick={this.unSubmitApi}><Icon type="unlock" /></Button>
        </Popconfirm>
      </Col>
    ) : null;
    const watchButton = !api.watch ? (
      <Col md={4} sm={8}>
        <Tooltip title="点击取消关注该API">
          <Button size="small" onClick={this.watchApi}><Icon type="eye" /></Button>
        </Tooltip>
      </Col>
    ) : (
      <Col md={4} sm={8}>
        <Tooltip title="点击关注该API">
          <Button size="small" onClick={this.unwatchApi}><Icon type="eye-o" /></Button>
        </Tooltip>
      </Col>
    );
    const appButton = (api.watch && api.status === 'recalling') ? (
      <Col md={4} sm={8}>
        <Tooltip title="点击允许该API重新进入编辑状态">
          <Button size="small" onClick={this.unSubmitApi}><Icon type="check" /></Button>
        </Tooltip>
      </Col>
    ) : null;
    return (
      <div>
        <Row align="middle" justify="space-between" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col md={8} sm={12}>
            <span
              style={{ textAlign: 'right', lineHeight: '32px' }}
              className={[styles[`methodName_${api.method}`], styles.entryMethodName].join(' ')}
            >{api.method}
            </span>
          </Col>
          <Col md={16} sm={12}><Input disabled={!globalEditable} value={api.uri} /></Col>
        </Row>
        <Row style={{ paddingTop: '4px', paddingBottom: '4px' }}>
          <Col md={4} sm={8}>
            <Popconfirm title="确定要删除该API？">
              <Button size="small" disabled={!globalEditable}><Icon type="delete" /></Button>
            </Popconfirm>
          </Col>
          <Col md={4} sm={8}>
            <Tooltip title="点击以其他URI复制一次">
              <Button size="small" ><Icon type="copy" /></Button>
            </Tooltip>
          </Col>
          {lockButton}
          {unlockButton}
          {watchButton}
          {appButton}
        </Row>
        <Collapse>
          <Panel header="概要">
            <APIEditorSummary {...this.props} api={api} globalEditable={globalEditable} />
          </Panel>
        </Collapse>
      </div>
    );
  }
}

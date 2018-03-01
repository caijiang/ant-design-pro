import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Route, Redirect, Switch, routerRedux } from 'dva/router';
import { Button, Layout, Tree, Icon, Input, Spin } from 'antd';
import { toPaths, filterPath } from '../../models/projectSchema';
import NotFound from '../../routes/Exception/404';
import { getRoutes } from '../../utils/utils';
import APIParentHead from '../../components/APIParentHead';
import APITitle from '../../components/APITitle';
import styles from '../../index.less';

const { Content, Sider } = Layout;
const { TreeNode } = Tree;

@connect(state => ({
  projectSchema: state.projectSchema,
}))
export default class APILayout extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'projectSchema/fetch',
      payload: {
        id: this.projectId(),
        branch: this.projectBranch(),
      },
    });
  }
  projectId = () => {
    const { match: { params: { name } } } = this.props;
    return name;
  }
  projectBranch = () => {
    const { match: { params: { branch } } } = this.props;
    return branch;
  }
  routePrefix = () => `/editor/${this.projectId()}/${this.projectBranch()}`
  /**
   * 构建菜单
   * 大概是由三树构成
   */
  renderSider = () => {
    const prefix = this.routePrefix();
    const { projectSchema: { schema, filterText }, projectSchema, dispatch } = this.props;
    const pathsNode = (
      <TreeNode
        disableCheckbox={false}
        selectable={false}
        title={
          <APIParentHead {...this.props} />
        }
      >
        {toPaths(schema)
        .filter(filterPath(projectSchema))
        .map((api) => {
          return (
            <TreeNode
              title={<APITitle api={api} />}
              key={`/api/${api.id}/${api.method}`}
            />
          );
        })}
      </TreeNode>
    );
    return (
      <Sider style={{ background: 'rgba(0, 0, 0, 0)' }}>
        <Input
          value={filterText}
          onChange={(e) => {
            dispatch({
              type: 'projectSchema/updateFilterText',
              payload: e.target.value,
            });
          }}
          style={{ width: 140 }}
          size="small"
          prefix={<Icon type="filter" />}
        />
        <Tree
          checkStrictly={false}
          defaultExpandAll
          onSelect={(selectedKeys) => {
            if (selectedKeys.length > 0) {
              dispatch(routerRedux.push(`${prefix}${selectedKeys[0]}`));
            }
          }}
        >
          {pathsNode}
        </Tree>
        <Button>发布？</Button>
      </Sider>
    );
  }
  render() {
    // const { projectSchema: { schema } } = this.props;
    const { match, routerData, projectSchema: { loading } } = this.props;
    // console.log('routerData,', routerData);
    // console.log('match,', match);
    // getRoutes(match.path, routerData).forEach(item =>
    //   console.log(item));
    // console.log(toPaths(schema));
    const prefix = this.routePrefix();
    // 三棵树
    return (
      <div>
        <Spin size="large" spinning={loading} className={styles.globalSpin} />
        <Layout>
          {this.renderSider()}
          <Content >
            <Switch>
              {getRoutes(match.path, routerData).map((item) => {
              const C = item.component;
              return (
                <Route
                  key={item.key}
                  path={item.path}
                  exact={item.exact}
                  render={props => <C {...props} />}
                />
              );
            })}
              <Redirect exact from={prefix} to={`${prefix}/index`} />
              <Route render={NotFound} />
            </Switch>
          </Content>
        </Layout>
      </div>
    );
  }
}

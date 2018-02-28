import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Card, Button, Icon, List, message, Form, Row, Col, Input } from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import Ellipsis from '../../components/Ellipsis';
import FormModal from '../../components/FormModal';

import styles from './Projects.less';

const FormItem = Form.Item;
@connect(state => ({
  projects: state.projects,
}))
export default class CardList extends PureComponent {
  state = {
    openNewProject: false,
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'projects/fetch',
    });
  }

  openNewProjectWindow = () => {
    this.setState({
      ...this.state,
      openNewProject: true,
    });
  }
  closeNewProjectWindow = () => {
    this.setState({
      ...this.state,
      openNewProject: false,
    });
  }
  handleAddProject = (data) => {
    // 添加完成后自行刷新
    const { dispatch } = this.props;
    const { closeNewProjectWindow } = this;
    dispatch({
      type: 'projects/add',
      payload: data,
      callback: () => {
        message.success('添加成功');
        dispatch({
          type: 'projects/fetch',
        });
        closeNewProjectWindow();
      },
    });
  }

  render() {
    const { projects: { list, loading } } = this.props;

    const content = (
      <div className={styles.pageHeaderContent}>
        <p>
          这里管理项目相关的资源，其核心是API的共同维护以及相关的自动化指南
        </p>
        <div className={styles.contentLink}>
          <a>
            <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/MjEImQtenlyueSmVEfUD.svg" /> 快速开始
          </a>
          {/* <a>
            <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/NbuDUAuBlIApFuDvWiND.svg" /> 产品简介
          </a>
          <a>
            <img alt="" src="https://gw.alipayobjects.com/zos/rmsportal/ohOEPSYdDTNnyMbGuyLb.svg" /> 产品文档
          </a> */}
        </div>
      </div>
    );

    const extraContent = (
      <div className={styles.extraImg}>
        <img alt="这是一个标题" src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png" />
      </div>
    );

    const { openNewProject } = this.state;
    const editHelper = (item) => {
      // 如果是高级模式，那么就直接推送layer
      if (item.apiType === 'advanced') {
        const go = () => {
          this.props.dispatch(routerRedux.push(`/editor/${item.id}/${item.branch}`));
        };
        return <a onClick={go}>高级编辑API</a>;
      }
      return <a href={item.editorUrl} target="_blank">编辑API</a>;
    };

    // 允许操作 设置默认分支，获取默认地址
    // https://github.com/nkbt/react-copy-to-clipboard
    return (
      <PageHeaderLayout
        title=""
        content={content}
        extraContent={extraContent}
      >
        <div className={styles.cardList}>
          <List
            rowKey="id"
            loading={loading}
            grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
            dataSource={['', ...list]}
            renderItem={item => (item ? (
              <List.Item key={item.id}>
                <Card hoverable className={styles.card} actions={[editHelper(item), <a>设置默认分支</a>]}>
                  <Card.Meta
                    avatar={<img alt="" className={styles.cardAvatar} src={item.avatar} />}
                    title={<a href="#">{item.id}</a>}
                    description={(
                      <Ellipsis className={styles.item} lines={3}>{item.description}</Ellipsis>
                    )}
                  />
                </Card>
              </List.Item>
              ) : (
                <List.Item>
                  <Button type="dashed" className={styles.newButton} onClick={this.openNewProjectWindow}>
                    <Icon type="plus" /> 新增项目
                  </Button>
                </List.Item>
              )
            )}
          />
        </div>
        <FormModal
          title="新增项目"
          visible={openNewProject}
          onFormRender={({ getFieldDecorator }) =>
            (
              <Form layout="inline">
                <Row>
                  <Col>
                    <FormItem
                      required="true"
                      label="id"
                      // help="项目id应该是字母,数组和-的组合"
                    >
                      {getFieldDecorator('id', {
                    rules: [
                      {
                        required: true,
                        pattern: /[a-zA-Z0-9-]{3,}/,
                        message: '必须输入有效的项目名称',
                      }],
                  })(
                    <Input placeholder="请输入新项目id" />
                  )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormItem
                      required="true"
                      label="描述"
                    >
                      {getFieldDecorator('description', {
                    rules: [
                      {
                        required: true,
                        min: 3,
                        message: '必须输入描述',
                      }],
                  })(
                    <Input.TextArea rows="3" placeholder="请输入项目描述" />
                  )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormItem
                      label="图片"
                    >
                      {getFieldDecorator('avatar')(
                        <Input placeholder="请输入项目图片的url" />
                  )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
)
          }
          onCancel={this.closeNewProjectWindow}
          onOk={this.handleAddProject}
        />
      </PageHeaderLayout>
    );
  }
}

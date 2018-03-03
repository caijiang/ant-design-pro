import React, { PureComponent } from 'react';
import { Row, Col, Input } from 'antd';
import EditableTagGroup from '../../components/EditableTagGroup';

const { TextArea } = Input;

export default class APIEditorSummary extends PureComponent {
  addTag = (text) => {
    console.log('add tag:', text);
  }
  removeTag = (text) => {
    console.log('remove tag:', text);
  }
  addConsume = (text) => {
    console.log('addConsume:', text);
  }
  removeConsume = (text) => {
    console.log('removeConsume:', text);
  }
  addProduce = (text) => {
    console.log('addProduce:', text);
  }
  removeProduce = (text) => {
    console.log('removeProduce:', text);
  }
  render() {
    const { globalEditable, api } = this.props;
    return (
      <div>
        <Row align="middle" justify="space-between" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col span={24} >
            <Input title="概要" disabled={!globalEditable} value={api.summary} />
          </Col>
        </Row>
        <Row style={{ paddingTop: '4px' }} align="middle" justify="space-between" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col span={24} >
            <TextArea
              title="详细描述"
              disabled={!globalEditable}
              autosize
              value={api.description}
            />
          </Col>
        </Row>
        <Row style={{ paddingTop: '4px' }} align="middle" justify="space-between" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col span={2}>
          标签:
          </Col>
          <Col span={22} >
            <EditableTagGroup
              tags={api.tags}
              doAdd={globalEditable && this.addTag}
              doRemove={globalEditable && this.removeTag}
            />
          </Col>
        </Row>
        <Row style={{ paddingTop: '4px' }} align="middle" justify="space-between" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col style={{ textAlign: 'center' }} span={12}>
            消耗
          </Col>
          <Col style={{ textAlign: 'center' }} span={12}>
            产生
          </Col>
        </Row>
        <Row style={{ paddingTop: '4px' }} align="middle" justify="space-between" gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
          <Col style={{ textAlign: 'center' }} span={12}>
            <EditableTagGroup
              tags={api.consumes}
              doAdd={(globalEditable && api.method !== 'get') && this.addConsume}
              doRemove={(globalEditable && api.method !== 'get') && this.removeConsume}
            />
          </Col>
          <Col style={{ textAlign: 'center' }} span={12}>
            <EditableTagGroup
              tags={api.produces}
              doAdd={(globalEditable && api.method !== 'head') && this.addProduce}
              doRemove={(globalEditable && api.method !== 'head') && this.removeProduce}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

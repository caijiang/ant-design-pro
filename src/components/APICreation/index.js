import React, { PureComponent } from 'react';
import { Form, Modal, Row, Col, Input, Radio } from 'antd';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
/**
 * 新增API等功能
 */
@Form.create()
export default class APICreation extends PureComponent {
  ok = () => {
    const { onOk, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onOk(fieldsValue);
    });
  }
  render() {
    const { visible } = this.props;
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Modal
        visible={visible}
        title="新增API"
        {...this.props}
        onOk={this.ok}
      >
        <Form layout="inline">
          <Row gutter={{ md: 8, sm: 16, lg: 24, xl: 48 }}>
            <Col >
              <FormItem
                required="true"
                label="URI"
                style={{
                  width: '100%',
                }}
                wrapperCol={{
                  span: 16,
                }}
                labelCol={{
                  span: 8,
                }}
              >
                {getFieldDecorator('uri', {
                  rules: [
                    {
                      required: true,
                      pattern: /^\/.*/,
                      message: '必须输入有效的URI',
                    }],
                })(
                  <Input />
                  )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, sm: 16, lg: 24, xl: 48 }}>
            <Col >
              <FormItem
                required="true"
                label="请求方法"
                style={{
                  width: '100%',
                }}
                wrapperCol={{
                  span: 16,
                }}
                labelCol={{
                  span: 8,
                }}
              >
                {getFieldDecorator('method', {
                  rules: [
                    {
                      required: true,
                      message: '必须选择请求方法',
                    }],
                })(
                  <RadioGroup>
                    <Radio value="get">GET</Radio>
                    <Radio value="post">POST</Radio>
                    <Radio value="put">PUT</Radio>
                    <Radio value="patch">PATCH</Radio>
                    <Radio value="delete">DELETE</Radio>
                    <Radio value="head">HEAD</Radio>
                    <Radio value="trace">TRACE</Radio>
                    <Radio value="options">OPTIONS</Radio>
                  </RadioGroup>
                  )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

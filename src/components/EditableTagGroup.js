import React, { PureComponent } from 'react';
import { Tooltip, Tag, Input, Icon } from 'antd';

/**
 * 可编辑的标签组
 * 提供一组数据
 * 提供组件生成工具（如果没有就直接数据）
 * 提供添加时的方法，若不提供则无法添加
 * 提供删除时的方法，若不提供则无法删除
 */
export default class EditableTagGroup extends PureComponent {
  state = {
    inputVisible: false,
    inputValue: '',
  };

  handleClose = (removedTag) => {
    const { doRemove } = this.props;
    doRemove(removedTag);
  }
  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  }

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  }
  handleInputConfirm = () => {
    const { inputValue } = this.state;
    const { doAdd } = this.props;
    doAdd(inputValue);
  }

  saveInputRef = (input) => {
    this.input = input;
  }

  render() {
    const { inputVisible, inputValue } = this.state;
    const { tags, doAdd, doRemove, tagContextRender } = this.props;
    return (
      <div>
        {(tags || []).map((tag) => {
          const tagElem = (
            <Tag closable={doRemove} afterClose={() => this.handleClose(tag)}>
              {tagContextRender ? tagContextRender(tag) : (
                tag.length > 20 ? `${tag.slice(0, 20)}...` : tag
              )}
            </Tag>
          );
          return (!tagContextRender && tag.length > 20)
          ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{ width: 78 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {(!inputVisible && doAdd) && (
          <Tag
            onClick={this.showInput}
            style={{ background: '#fff', borderStyle: 'dashed' }}
          >
            <Icon type="plus" /> New
          </Tag>
        )}
      </div>
    );
  }
}

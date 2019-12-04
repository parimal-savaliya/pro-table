import React, { useState } from 'react';
import {
  Form,
  Input,
  Row,
  Col,
  TimePicker,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Icon,
} from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { ConfigConsumer, ConfigConsumerProps } from 'antd/lib/config-provider';
import Container from '../container';
import { ProColumns } from '../index';
import './index.less';

interface FormItem<T> extends FormComponentProps {
  onSubmit?: (value: T) => void;
  onReset?: () => void;
}

const FromInputRender: React.FC<{
  item: ProColumns<any>;
  value?: any;
  onChange?: (value: any) => void;
}> = React.forwardRef(({ item, ...rest }, ref: any) => {
  /**
   * 自定义 render
   */
  if (item.renderFormItem) {
    return item.renderFormItem(item, rest) as any;
  }
  if (!item.valueType || item.valueType === 'text') {
    const { valueEnum } = item;
    if (valueEnum) {
      return (
        <Select placeholder="请选择" ref={ref} {...rest}>
          {Object.keys(valueEnum).map(key => (
            <Select.Option key={key} value={key}>
              {valueEnum[key] || ''}
            </Select.Option>
          ))}
        </Select>
      );
    }
    return <Input placeholder="请输入" {...rest} />;
  }
  if (item.valueType === 'date') {
    return (
      <DatePicker
        ref={ref}
        placeholder="请选择"
        style={{
          width: '100%',
        }}
        {...rest}
      />
    );
  }
  if (item.valueType === 'dateTime') {
    return (
      <DatePicker
        showTime
        ref={ref}
        placeholder="请选择"
        style={{
          width: '100%',
        }}
        {...rest}
      />
    );
  }
  if (item.valueType === 'time') {
    return (
      <TimePicker
        ref={ref}
        placeholder="请选择"
        style={{
          width: '100%',
        }}
        {...rest}
      />
    );
  }
  if (item.valueType === 'money') {
    return (
      <InputNumber
        ref={ref}
        min={0}
        formatter={value => {
          if (value) {
            return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          }
          return '';
        }}
        parser={value => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
        placeholder="请输入"
        precision={2}
        style={{
          width: '100%',
        }}
        {...rest}
      />
    );
  }

  return undefined;
});

const FormSearch = <T, U = {}>({ form, onSubmit }: FormItem<T>) => {
  const counter = Container.useContainer();
  const [collapse, setCollapse] = useState<boolean>(true);

  const submit = () => {
    form.validateFields((err, value) => {
      if (err) {
        return;
      }
      const tmpValue = {};
      Object.keys(value).forEach(key => {
        if (value[key] && value[key] !== 'all') {
          tmpValue[key] = value[key];
        }
      });
      if (onSubmit) {
        onSubmit(value as T);
      }
    });
  };

  const domList = counter.proColumns
    .filter(
      (item, index) =>
        item.valueType !== 'index' &&
        item.valueType !== 'indexBorder' &&
        item.valueType !== 'option' &&
        (collapse ? index < 3 : true) &&
        !item.hideInSearch,
    )
    .map(item => (
      <Col span={8} key={item.key || item.dataIndex}>
        <Form.Item label={item.title}>
          {form.getFieldDecorator((item.key || item.dataIndex) as string, {
            initialValue: item.initialValue,
          })(<FromInputRender item={item} />)}
        </Form.Item>
      </Col>
    ));
  return (
    <ConfigConsumer>
      {({ getPrefixCls }: ConfigConsumerProps) => {
        const className = getPrefixCls('pro-table-form-search');
        return (
          <div className={className}>
            <Form>
              <Row gutter={16} justify="end">
                {domList}
                <Col
                  span={8}
                  offset={(2 - (domList.length % 3)) * 8}
                  key="option"
                  className={`${className}-option`}
                >
                  <Button type="primary" htmlType="submit" onClick={() => submit()}>
                    搜索
                  </Button>
                  <Button style={{ marginLeft: 8 }} onClick={() => form.resetFields()}>
                    重置
                  </Button>
                  <a
                    style={{ marginLeft: 8 }}
                    onClick={() => {
                      setCollapse(!collapse);
                    }}
                  >
                    {collapse ? '展开' : '收起'}{' '}
                    {collapse ? <Icon type="down" /> : <Icon type="up" />}
                  </a>
                </Col>
              </Row>
            </Form>
          </div>
        );
      }}
    </ConfigConsumer>
  );
};

export default Form.create<FormItem<any>>()(FormSearch);

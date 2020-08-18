import React, { useContext, useEffect } from 'react';
import useIsMounted from 'ismounted';
import { set } from 'lodash';

import { useFormApi, useFieldApi } from '@@ddf';
import { components } from '@data-driven-forms/pf3-component-mapper';
import { EditingContext, loadProviderFields } from './index';

const extractInitialValues = ({ name, initialValue, fields }) => {
  const children = fields ? fields.reduce((obj, field) => ({ ...obj, ...extractInitialValues(field) }), {}) : {};
  const item = name && initialValue ? { [name]: initialValue } : undefined;
  return { ...item, ...children };
};

const ProviderSelectField = ({ kind, ...props }) => {
  const isMounted = useIsMounted();
  const formOptions = useFormApi();
  const { input: { value } } = useFieldApi(props);
  const { isDisabled: edit } = props;
  const { setState } = useContext(EditingContext);

  useEffect(() => {
    if (!edit && value) {
      miqSparkleOn();

      loadProviderFields(kind, value).then((fields) => {
        if (isMounted.current) {
          setState(({ fields: [firstField] }) => ({ fields: [firstField, ...fields] }));
          const initialValues = extractInitialValues({ fields });
          formOptions.initialize(Object.keys(initialValues).reduce((obj, key) => set(obj, key, initialValues[key]), { value }));
        }
      }).then(miqSparkleOff);
    }
  }, [value]);

  return <components.Select {...props} />;
};

export default ProviderSelectField;

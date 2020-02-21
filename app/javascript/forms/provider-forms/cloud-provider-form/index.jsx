import React, { useState } from 'react';
import { componentTypes, validatorTypes } from '@data-driven-forms/react-form-renderer';

import { API } from '../../../http_api';
import MiqFormRenderer from '../../data-driven-form';

const typeSelectorSchema = {
  fields: [
    {
      component: componentTypes.SELECT,
      name: 'type',
      label: __('Type'),
      placeholder: `<${__('Choose')}>`,
      loadOptions: () =>
        API.options('/api/providers').then(({ data: { supported_providers } }) => supported_providers // eslint-disable-line camelcase
          .filter(({ kind }) => kind === 'cloud')
          .map(({ title, type }) => ({ value: type, label: title }))),
    },
  ],
};

const loadProviderServerZones = () =>
  API.get('/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name')
    .then(({ resources }) => resources.map(({ name }) => ({ value: name, label: name })));

const initialSchema = type => ([
  {
    component: componentTypes.TEXT_FIELD,
    name: 'name',
    label: __('Name'),
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  },
  {
    component: componentTypes.TEXT_FIELD,
    name: 'type',
    type: 'hidden',
    initialValue: type,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  },
  {
    component: componentTypes.SELECT,
    name: 'zone_name',
    label: __('Zone'),
    placeholder: `<${__('Choose')}>`,
    loadOptions: loadProviderServerZones,
    initialValue: 'default',
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  },
]);

const CloudProviderForm = ({ ...props }) => {
  const [{ type, schema }, setState] = useState({ schema: { fields: [] } });

  const typeSelected = ({ active, values: { type: newType } = {} }) => {
    if (active === 'type' && type !== newType) {
      API.options(`/api/providers?type=${newType}`).then(({ data: { provider_form_schema } }) => { // eslint-disable-line camelcase
        setState({
          type: newType,
          schema: {
            fields: [
              ...initialSchema(newType),
              {
                component: componentTypes.SUB_FORM,
                name: newType,
                ...provider_form_schema, // eslint-disable-line camelcase
              },
            ],
          },
        });
      });
    }
  };

  const onSubmit = (data) => {
    // Omit validator results from each endpoint
    const endpoints = Object.keys(data.endpoints).reduce((obj, key) => {
      const { valid, ...endpoint } = data.endpoints[key]; // eslint-disable-line no-unused-vars
      return { ...obj, [key]: endpoint };
    }, {});

    API.post('/api/providers', { ...data, endpoints, ddf: true });
  };

  return (
    <div>
      <MiqFormRenderer
        schema={typeSelectorSchema}
        onSubmit={() => undefined}
        renderFormButtons={() => ''}
        onStateUpdate={typeSelected}
      />
      <MiqFormRenderer schema={schema} onSubmit={onSubmit} />
    </div>
  );
};

export default CloudProviderForm;

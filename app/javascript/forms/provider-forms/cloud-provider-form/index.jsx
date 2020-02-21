import React, { useState, useEffect } from 'react';
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

const initialSchema = [
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
    isRequired: true,
    validate: [{
      type: validatorTypes.REQUIRED,
    }],
  },
];

const CloudProviderForm = ({ providerId, ...props }) => {
  const [{ type, schema, values }, setState] = useState({ schema: { fields: [] } });

  const loadProviderSchema = (type, newValues = {}) => {
    API.options(`/api/providers?type=${type}`).then(({ data: { provider_form_schema } }) => { // eslint-disable-line camelcase
      setState({
        type,
        schema: {
          fields: [
            ...initialSchema,
            {
              component: componentTypes.SUB_FORM,
              name: type,
              ...provider_form_schema, // eslint-disable-line camelcase
            },
          ],
        },
        values: { type, ...newValues },
      });
    });
  };

  useEffect(() => {
    if (providerId) {
      API.get(`/api/providers/${providerId}?attributes=endpoints,authentications,zone_name`).then(({
        type,
        endpoints: _endpoints,
        authentications: _authentications,
        ...provider
      }) => {
        const endpoints = _endpoints.reduce((obj, { role, ...endpoint }) => ({
          ...obj,
          [role]: endpoint,
        }), {});

        const authentications = _authentications.reduce((obj, { authtype, ...authentication }) => ({
          ...obj,
          [authtype]: authentication,
        }), {});

        loadProviderSchema(type, { ...provider, endpoints, authentications });
      });
    }
  }, [providerId]);

  const typeSelected = ({ active, values: { type: newType } = {} }) => {
    if (active === 'type' && type !== newType) {
      loadProviderSchema(newType);
    }
  };

  const onSubmit = ({ type, ..._data }, { getState }) => {
    // Retrieve fields from the schema, but omit the validator components as the API doesn't like them
    const fields = Object.keys(getState().modified).filter(field => !field.match(/^authentications\.[^.]+\.valid$/));
    // Filter out fields that are not available in the form schema
    const data = _.pick(_data, fields);

    if (providerId) {
      API.patch(`/api/providers/${providerId}`, { ...data, ddf: true });
    } else {
      API.post('/api/providers', { ...data, type, ddf: true });
    }
  };

  return (
    <div>
      { !providerId && (
        <MiqFormRenderer
          schema={typeSelectorSchema}
          onSubmit={() => undefined}
          renderFormButtons={() => ''}
          onStateUpdate={typeSelected}
        />
      ) }
      <EditingContext.Provider value={providerId}>
        <MiqFormRenderer schema={schema} onSubmit={onSubmit} initialValues={values} clearedValue={null} />
      </EditingContext.Provider>
    </div>
  );
};

export const EditingContext = React.createContext({});
export default CloudProviderForm;

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { pick } from 'lodash';
import AsyncCredentials from './async-credentials';
import { EditingContext } from '../../forms/provider-forms/cloud-provider-form';

const AsyncProviderCredentials = ({ validation, ...props }) => {
  const providerId = useContext(EditingContext);

  if (!validation) {
    // Pass down the required `edit` to the password component (if it exists)
    return props.formOptions.renderForm(props.fields.map(field => ({
      ...field,
      ...(field.component === 'password-field' ? { edit: !!providerId } : undefined),
    })), props.formOptions);
  }

  const asyncValidate = (fields, fieldNames) => new Promise((resolve, reject) => {
    const url = providerId ? `/api/providers/${providerId}` : '/api/providers';
    const resource = pick(fields, fieldNames);

    API.post(url, { action: 'verify_credentials', resource }).then(({ results: [result] = [], ...single }) => {
      const { task_id, success } = result || single;
      // The request here can either create a background task or fail
      return success ? API.wait_for_task(task_id) : Promise.reject(result);
      // The wait_for_task request can succeed with valid or invalid credentials
      // with the message that the task is completed successfully. Based on the
      // task_results we resolve() or reject() with an unknown error.
      // Any known errors are passed to the catch(), which will reject() with a
      // message describing what went wrong.
    }).then(result => (result.task_results ? resolve() : reject(__('Validation failed: unknown error'))))
      .catch(({ message }) => reject([__('Validation failed:'), message].join(' ')));
  });

  // The order of props is important here, because they have to be overridden
  return <AsyncCredentials {...props} asyncValidate={asyncValidate} edit={!!providerId} />;
};

AsyncProviderCredentials.propTypes = {
  ...AsyncCredentials.propTypes,
  asyncValidate: undefined,
  validation: PropTypes.bool,
};
AsyncProviderCredentials.defaultProps = {
  validation: true,
  ...AsyncCredentials.defaultProps,
};

export default AsyncProviderCredentials;

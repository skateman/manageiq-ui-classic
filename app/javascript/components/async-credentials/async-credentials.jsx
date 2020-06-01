import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { isEqual, get, set } from 'lodash';
import { useFormApi } from '@@ddf';
import {
  Button,
  FormGroup,
  HelpBlock,
} from 'patternfly-react';
import ButtonSpinner from '../../forms/button-spinner';
import CheckErrors from './check-errors';
import { checkValidState } from './helper';

const AsyncCredentials = ({
  FieldProvider,
  validateLabel,
  validationProgressLabel,
  validationSuccessLabel,
  validateDefaultError,
  fields,
  name,
  asyncValidate,
  validationDependencies,
  edit,
}) => {
  const formOptions = useFormApi();
  const [asyncError, setAsyncError] = useState(validateDefaultError);
  const [validating, setValidating] = useState(false);
  const [lastValid, setLastValid] = useState({});
  const [initialValues] = useState(fields.reduce((acc, { name }) => ({
    ...acc,
    [name]: formOptions.getState().values[name],
  }), {}));
  const asyncFields = fields.map(({ name }) => name);

  const handleAsyncValidation = (formOptions, hiddenName, fieldNames) => {
    setValidating(true);
    const { values } = formOptions.getState();
    asyncValidate(values, fieldNames)
      .then(() => {
        formOptions.change(hiddenName, true);
        setLastValid(asyncFields.reduce((acc, curr) => ({ ...acc, [curr]: values[curr] }), {}));
        if (checkValidState(formOptions, name)) {
          formOptions.change(name, formOptions.getFieldState(name).initial);
        }
        setValidating(false);
      })
      .catch((error) => {
        formOptions.change(hiddenName, false);
        setAsyncError(error || validateDefaultError);
        setValidating(false);
      });
  };

  const enhancedChange = (value, name, validateName, change) => {
    let fieldValue = value;
    // check if value is event and replace the value if it is
    if (typeof fieldValue === 'object' && fieldValue.target && fieldValue.target.hasOwnProperty('value')) {
      fieldValue = fieldValue.target.value;
    }
    change(name, fieldValue);
    const { values } = formOptions.getState();
    const currentValues = asyncFields.reduce((acc, curr) => {
      set(acc, curr, get(values, curr));
      return { ...acc };
    }, {});
    const valid = (isEqual(lastValid, currentValues) || isEqual(initialValues, currentValues)) ? undefined : false;
    setAsyncError(validateDefaultError);
    change(validateName, valid);
  };

  return (
    <Fragment>
      {formOptions.renderForm(fields.map(field => ({
        ...field,
        ...(field.component === 'password-field' ? { parent: name, edit } : undefined),
        isDisabled: field.isDisabled || validating,
        onChange: value => enhancedChange(value, field.name, name, formOptions.change),
      })), formOptions)}
      <FieldProvider initialValue={!!edit} name={name} validate={value => (value === false ? asyncError : undefined)}>
        {({ input, meta }) => (
          <FormGroup validationState={meta.error ? 'error' : null}>
            <input type="hidden" {...input} />
            <CheckErrors
              subscription={{ valid: true, invalid: true, active: true }}
              names={[...asyncFields, ...validationDependencies]}
              FieldProvider={FieldProvider}
            >
              {valid => (
                <Fragment>
                  <Button
                    bsSize="small"
                    bsStyle="primary"
                    onClick={() => handleAsyncValidation(formOptions, name, [...asyncFields, ...validationDependencies])}
                    disabled={valid.includes(false) || validating}
                  >
                    {validating ? validationProgressLabel : validateLabel}
                    {validating && <ButtonSpinner /> }
                  </Button>
                  {!meta.error && !valid.includes(false) && !isEqual(lastValid, {}) && <HelpBlock>{ validationSuccessLabel }</HelpBlock>}
                  {meta.error && <HelpBlock>{asyncError}</HelpBlock>}
                </Fragment>
              )}
            </CheckErrors>
          </FormGroup>
        )}
      </FieldProvider>
    </Fragment>
  );
};

AsyncCredentials.propTypes = {
  FieldProvider: PropTypes.oneOfType([PropTypes.element.isRequired, PropTypes.func]).isRequired,
  validateLabel: PropTypes.string,
  validationProgressLabel: PropTypes.string,
  validationSuccessLabel: PropTypes.string,
  validateDefaultError: PropTypes.string,
  asyncValidate: PropTypes.func.isRequired,
  edit: PropTypes.bool,
  validationDependencies: PropTypes.arrayOf(PropTypes.string),
};

AsyncCredentials.defaultProps = {
  validateLabel: __('Validate'),
  validationProgressLabel: __('Validating'),
  validationSuccessLabel: __('Validation successful'),
  validateDefaultError: __('Validation Required'),
  edit: false,
  validationDependencies: [],
};

export default AsyncCredentials;

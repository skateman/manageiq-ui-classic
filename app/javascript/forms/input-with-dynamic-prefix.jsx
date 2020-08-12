import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ControlLabel,
  InputGroup,
  FormGroup,
  FormControl,
  HelpBlock,
} from 'patternfly-react';
import { rawComponents } from '@data-driven-forms/pf3-component-mapper';

import { useFormApi, useFieldApi } from '@@ddf';
import RequiredLabel from './required-label';

const DataDrivenInputWithPrefix = ({
  prefixOptions,
  validate,
  prefixSeparator,
  ...rest
}) => {
  const [prefix, setPrefix] = useState();
  const formOptions = useFormApi();
  /**
   * get string prefix from initial value on after initial component mount
   */
  useEffect(() => {
    const value = formOptions.getFieldState(rest.name);
    if (value.initial) {
      setPrefix(value.initial.substring(0, value.initial.indexOf(prefixSeparator) + prefixSeparator.length));
    }
  }, []);

  /**
   * create regular expression to strip the value of its prefix
   */
  const prefixMatcher = new RegExp(`.*${prefixSeparator}`);

  const { isRequired, label, input: { name, onChange, value }, meta: { error } } = useFieldApi({
    ...rest,
    validate: (value) => {
      let implicitValidator;
      let missingPrefix;
      if (validate) {
        implicitValidator = validate(value);
      }
      if (prefix) {
        missingPrefix = (value && value.replace(prefixMatcher, '') === '') || (value === prefix) ? __('Required') : undefined;
      }
      return implicitValidator || missingPrefix;
    },
  });

  return (
    <FormGroup name={name} validationState={error && 'error'}>
      <div>
        <ControlLabel>
          {isRequired ? <RequiredLabel label={label} /> : label }
        </ControlLabel>
      </div>
      <div className="dynamic-prefix-input">
        <rawComponents.Select
          classNamePrefix="ddorg__pf3-component-mapper__select"
          invalid={isRequired && !prefix}
          id={`dynamic-prefix-select-${rest.name}`}
          input={{
            onChange: (prefix) => {
              onChange(`${prefix}${value.replace(prefixMatcher, '')}`);
              setPrefix(prefix);
            },
            value: prefix,
            name: `dynamic-prefix-select-${rest.name}`,
          }}
          options={prefixOptions}
        />
        {prefix && (
          <InputGroup>
            <InputGroup.Addon>
              {prefix}
            </InputGroup.Addon>
            <FormControl
              onChange={({ target: { value } }) => onChange(`${prefix}${value}`)}
              value={value.replace(prefixMatcher, '')}
              name={name}
              id={`dynamic-prefix-text-input-${rest.name}`}
            />
          </InputGroup>
        )}
      </div>
      {error && <HelpBlock>{error}</HelpBlock>}
    </FormGroup>
  );
};

DataDrivenInputWithPrefix.propTypes = {
  name: PropTypes.string.isRequired,
  prefixSeparator: PropTypes.string,
  validate: PropTypes.func,
  prefixOptions: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, value: PropTypes.any })).isRequired,
};

DataDrivenInputWithPrefix.defaultProps = {
  prefixSeparator: '://',
  validate: undefined,
};


export default DataDrivenInputWithPrefix;

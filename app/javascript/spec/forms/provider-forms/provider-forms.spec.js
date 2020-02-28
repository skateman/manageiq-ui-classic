import React from 'react';
import { act } from 'react-dom/test-utils';
import fetchMock from 'fetch-mock';
import FormRenderer from '@data-driven-forms/react-form-renderer';
import toJson from 'enzyme-to-json';
import CloudProviderForm from '../../../forms/provider-forms/cloud-provider-form';
import { mount } from '../../helpers/mountForm';
import {
  providerOptions,
  provider111Data,
  providerTypeData,
  zoneData,
} from './providerData';
import '../../helpers/miqSparkle';
import '../../helpers/sprintf';
import '../../helpers/miq_formatters_helper';
import miqRedirectBack from '../../../helpers/miq-redirect-back';

describe('Provider Forms', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {
      providerId: undefined,
      type: 'cloud',
      return: 'returnurl',
    };
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('should correctly render a new form', async(done) => {
    fetchMock.once('/api/providers', providerOptions);

    let wrapper;
    await act(async() => {
      wrapper = mount(<CloudProviderForm {...initialProps} />);
    });

    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should correctly select and render the second form', async(done) => {
    fetchMock
      .getOnce('/api/providers/111?attributes=endpoints,authentications,zone_name', provider111Data)
      .once('/api/providers', providerOptions)
      .once('/api/providers?type=ManageIQ::Providers::Amazon::CloudManager', providerTypeData)
      .getOnce('/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name', zoneData);

    let wrapper;
    await act(async() => {
      wrapper = mount(<CloudProviderForm kind="cloud" redirect="returnurl" />);
    });

    expect(toJson(wrapper)).toMatchSnapshot();

    await act(async() => {
      const Form = wrapper.find(FormRenderer).first().childAt(0);
      Form.instance().form.change('type', 'ManageIQ::Providers::Amazon::CloudManager');
      wrapper.update();
    });

    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should correctly render the edit form', async(done) => {
    fetchMock
      .getOnce('/api/providers/111?attributes=endpoints,authentications,zone_name', provider111Data)
      .once('/api/providers', providerOptions)
      .once('/api/providers?type=ManageIQ::Providers::Amazon::CloudManager', providerTypeData)
      .getOnce('/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name', zoneData);

    let wrapper;
    await act(async() => {
      wrapper = mount(<CloudProviderForm providerId="111" kind="cloud" redirect="returnurl" />);
    });

    expect(toJson(wrapper)).toMatchSnapshot();
    done();
  });

  it('should correctly redirect on cancel', async(done) => {
    fetchMock
      .getOnce('/api/providers/111?attributes=endpoints,authentications,zone_name', provider111Data)
      .once('/api/providers', providerOptions)
      .once('/api/providers?type=ManageIQ::Providers::Amazon::CloudManager', providerTypeData)
      .getOnce('/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name', zoneData);

    let wrapper;
    await act(async() => {
      wrapper = mount(<CloudProviderForm providerId="111" kind="cloud" redirect="returnurl" />);
    });

    wrapper.find('button').last().simulate('click');
    expect(miqRedirectBack).toHaveBeenCalledWith('Edit of cloud was cancelled by the user', 'success', 'returnurl');
    done();
  });

  it('should submit correctly the form and redirect back', async(done) => {
    fetchMock
      .getOnce('/api/providers/111?attributes=endpoints,authentications,zone_name', provider111Data)
      .once('/api/providers', providerOptions)
      .once('/api/providers?type=ManageIQ::Providers::Amazon::CloudManager', providerTypeData)
      .getOnce('/api/zones?expand=resources&attributes=id,name,visible&filter[]=visible!=false&sort_by=name', zoneData)
      .patch('api/providers/111', {}, 200);

    let wrapper;
    await act(async() => {
      wrapper = mount(<CloudProviderForm providerId="111" kind="cloud" redirect="returnurl" />);
    });

    const Form = wrapper.find(FormRenderer).last().childAt(0);
    await act(async() => {
      Form.instance().form.change('name', 'New Name');
      wrapper.update();
    });

    Form.instance().form.submit();
    expect(fetchMock.lastCall()[0]).toBe('/api/providers/111');
    expect(fetchMock.lastCall()[1]).toEqual({
      backendName: 'API', body: '{"name":"New Name","zone_name":"Amazon Zone","ddf":true}', credentials: 'include', headers: {}, method: 'PATCH',
    });
    done();
  });
});

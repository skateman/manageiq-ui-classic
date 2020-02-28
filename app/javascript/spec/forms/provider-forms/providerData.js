export const providerOptions = {
  data: {
    supported_providers: [
      {
        title: 'Google Compute Engine',
        type: 'ManageIQ::Providers::Google::CloudManager',
        kind: 'cloud',
      },
    ],
  },
};

export const provider111Data = {
  href: 'http://localhost:3000/api/providers/111',
  id: '111',
  name: 'Amazon',
  created_on: '2017-11-20T19:29:31Z',
  updated_on: '2019-04-06T23:58:45Z',
  guid: '1732b30c-d9ae-4e9a-b855-30fba78120f1',
  zone_id: '3',
  type: 'ManageIQ::Providers::Amazon::CloudManager',
  api_version: null,
  uid_ems: null,
  host_default_vnc_port_start: null,
  host_default_vnc_port_end: null,
  provider_region: 'us-east-1',
  last_refresh_error: null,
  last_refresh_date: '2019-04-06T23:58:45Z',
  provider_id: null,
  realm: null,
  tenant_id: '1',
  project: null,
  parent_ems_id: null,
  subscription: null,
  last_metrics_error: null,
  last_metrics_update_date: null,
  last_metrics_success_date: null,
  tenant_mapping_enabled: null,
  enabled: true,
  options: {},
  zone_before_pause_id: null,
  last_inventory_date: null,
  endpoints: [{
    id: '35',
    role: 'default',
    ipaddress: null,
    hostname: null,
    port: null,
    resource_type: 'ExtManagementSystem',
    resource_id: '38',
    created_at: '2017-11-20T19:29:31Z',
    updated_at: '2017-11-20T19:29:31Z',
    verify_ssl: 1,
    url: null,
    security_protocol: null,
    api_version: null,
    path: null,
    certificate_authority: null,
  }],
  authentications: [{
    href: 'http://localhost:3000/api/auth_key_pairs/158',
    id: '158',
    name: 'smartstate-2713bf1d-0a64-486f-85b9-7d1cc4187c5f',
    authtype: null,
    userid: null,
    resource_id: '38',
    resource_type: 'ExtManagementSystem',
    created_on: '2018-03-09T21:12:48Z',
    updated_on: '2018-03-09T21:12:48Z',
    last_valid_on: null,
    last_invalid_on: null,
    credentials_changed_on: null,
    status: null,
    status_details: null,
    type: 'ManageIQ::Providers::Amazon::CloudManager::AuthKeyPair',
    fingerprint: '84:a7:3e:6e:cc:92:ff:e9:c8:35:9f:64:69:9d:a8:f7:b6:29:47:b6',
    challenge: null,
    login: null,
    public_key: null,
    htpassd_users: [],
    ldap_id: [],
    ldap_email: [],
    ldap_name: [],
    ldap_preferred_user_name: [],
    ldap_bind_dn: null,
    ldap_insecure: null,
    ldap_url: null,
    request_header_challenge_url: null,
    request_header_login_url: null,
    request_header_headers: [],
    request_header_preferred_username_headers: [],
    request_header_name_headers: [],
    request_header_email_headers: [],
    open_id_sub_claim: null,
    open_id_user_info: null,
    open_id_authorization_endpoint: null,
    open_id_token_endpoint: null,
    open_id_extra_scopes: [],
    open_id_extra_authorize_parameters: null,
    certificate_authority: null,
    google_hosted_domain: null,
    github_organizations: [],
    rhsm_sku: null,
    rhsm_pool_id: null,
    rhsm_server: null,
    manager_ref: null,
    options: null,
    evm_owner_id: null,
    miq_group_id: null,
    tenant_id: null,
    become_username: null,
  }],
  zone_name: 'Amazon Zone',
  actions: [
    { name: 'change_password', method: 'post', href: 'http://localhost:3000/api/providers/38' },
    { name: 'edit', method: 'post', href: 'http://localhost:3000/api/providers/38' },
    { name: 'edit', method: 'patch', href: 'http://localhost:3000/api/providers/38' },
    { name: 'edit', method: 'put', href: 'http://localhost:3000/api/providers/38' },
    { name: 'refresh', method: 'post', href: 'http://localhost:3000/api/providers/38' },
    { name: 'delete', method: 'post', href: 'http://localhost:3000/api/providers/38' },
    { name: 'delete', method: 'delete', href: 'http://localhost:3000/api/providers/38' },
  ],
};

export const providerTypeData = {
  data: {
    provider_form_schema: {
      fields: [
        { component: 'text-field', name: 'name', label: 'Endpoint URL' },
      ],
    },
  },
};

export const zoneData = {
  resources: [
    {
      href: 'http://localhost:3000/api/zones/3', id: '3', name: 'Amazon Zone', visible: true,
    },
  ],
};

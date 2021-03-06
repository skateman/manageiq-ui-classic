describe OpsController do
  before do
    EvmSpecHelper.seed_specific_product_features(
      %w(vm vm_compare vm_delete instance instance_delete image image_delete miq_template
         miq_template_delete ems_configuration_show_list)
    )
  end

  context '#rbac_expand_features' do
    subject { controller.send(:rbac_expand_features, ['vm']) }
    it 'expands features' do
      is_expected.to include('vm_compare')
    end
  end

  context '#rbac_compact_features' do
    let(:root) { 'vm' }
    let(:complete_set)   { [root] + MiqProductFeature.feature_children(root) }
    let(:incomplete_set) { MiqProductFeature.feature_children(root) }

    it 'it does not return the descendants if the ancestor is present' do
      expect(controller.send(:rbac_compact_features, complete_set)).to eq([root])
    end

    it 'it returns the descendants if the ancestor is not present' do
      expect(controller.send(:rbac_compact_features, incomplete_set)).to match_array(incomplete_set)
    end
  end

  describe '#recurse_sections_and_features' do
    context 'special "_tab_all_vm_rules" node' do
      it 'yields vm, instance, template and image  with *delete' do
        expect do |b|
          controller.send(:recurse_sections_and_features, '_tab_all_vm_rules', &b)
        end.to yield_successive_args(
          ['image', include('image_delete')],
          ['instance', include('instance_delete')],
          ['miq_template', include('miq_template_delete')],
          ['vm', include('vm_delete')],
        )
      end
    end
    context '"_tab_conf" feature node' do
      it 'yields features including "ems_configuration_show_list"' do
        expect do |b|
          controller.send(:recurse_sections_and_features, 'ems_configuration', &b)
        end.to yield_successive_args(["ems_configuration", include("ems_configuration_show_list")])
      end
    end
    context '"vm" feature node' do
      it 'yields features including "vm_compare"' do
        expect do |b|
          controller.send(:recurse_sections_and_features, 'vm', &b)
        end.to yield_with_args('vm', include('vm_compare'))
      end
    end
  end
end

class TreeBuilderOpsRbacFeatures < TreeBuilder
  has_kids_for Menu::Section,     [:x_get_tree_section_kids]
  has_kids_for Menu::Item,        [:x_get_tree_item_kids]
  has_kids_for MiqProductFeature, [:x_get_tree_feature_kids]

  def initialize(name, sandbox, build, **params)
    @role     = params[:role]
    @editable = params[:editable]
    @features = @role.miq_product_features.map(&:identifier)

    @root_counter = []

    # Make sure tree_state doesn't hold on to old data between requests
    TreeState.new(sandbox).remove_tree(name)

    super(name, sandbox, build)
  end

  private

  def x_get_tree_roots(count_only, _options)
    top_nodes = Menu::Manager.select do |section|
      return false if section.id == :cons && !Settings.product.consumption
      return false if section.name.nil?
      Vmdb::PermissionStores.instance.can?(section.id)
    end

    top_nodes += %w[all_vm_rules api_exclusive sui ops_explorer].collect do |feature|
      MiqProductFeature.obj_features[feature].try(:[], :feature)
    end

    count_only_or_objects(count_only, top_nodes.compact)
  end

  def x_get_tree_section_kids(parent, count_only = false)
    kids = parent.items.reject do |item|
      item.kind_of?(Menu::Item) && !MiqProductFeature.feature_exists?(item.try(:feature))
    end

    count_only_or_objects(count_only, kids)
  end

  def x_get_tree_item_kids(parent, count_only = false)
    kids = MiqProductFeature.obj_feature_children(parent.feature)
    count_only_or_objects(count_only, kids)
  end

  def x_get_tree_feature_kids(parent, count_only = false)
    kids = MiqProductFeature.obj_feature_children(parent.identifier) || []
    count_only_or_objects(count_only, kids)
  end

  def tree_init_options
    {
      :role           => @role,
      :features       => @features,
      :editable       => @editable,
      :node_id_prefix => node_id_prefix,
      :checkboxes     => true,
      :three_checks   => true,
      :post_check     => true,
      :check_url      => "/ops/rbac_role_field_changed/",
      :oncheck        => @editable ? "miqOnCheckGeneric" : false
    }
  end

  def root_options
    {
      :key        => "#{node_id_prefix}__#{root_feature}",
      :icon       => "pficon pficon-folder-close",
      :text       => _(root_details[:name]),
      :tooltip    => _(root_details[:description]) || _(root_details[:name]),
      :expand     => true,
      :selectable => false,
      :select     => root_select_state,
      :checkable  => @editable
    }
  end

  def root_details
    @root_details ||= MiqProductFeature.feature_details(root_feature)
  end

  def root_select_state
    @features.include?(root_feature) || select_state_from_counter
  end

  def select_state_from_counter
    return false if @root_counter.empty?
    return true if @root_counter.all? { |n| n == true } # true not truthy
    return 'undefined' if @root_counter.any? { |n| n || n == 'undefined' }

    false
  end

  def node_id_prefix
    @role.id || "new"
  end

  def root_feature
    @root_feature ||= MiqProductFeature.feature_root
  end

  def all_vm_options
    text = _("Access Rules for all Virtual Machines")
    checked = @features.include?("all_vm_rules") || root_select_state

    {
      :key     => "#{node_id_prefix}___tab_all_vm_rules",
      :text    => text,
      :tooltip => text,
      :icon    => "pficon pficon-folder-close",
      :select  => checked
    }
  end

  def override(node, object, _, _)
    case object
    when Menu::Section
      @root_counter << node[:select]
    when MiqProductFeature
      if object.identifier == "all_vm_rules"
        node.merge!(all_vm_options)
      end
    end
  end
end

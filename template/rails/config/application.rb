require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module __project_name_pascal__
  class Application < Rails::Application
    config.load_defaults 8.0
    config.autoload_lib(ignore: %w[tasks])
  end
end

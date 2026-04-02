Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.action_controller.perform_caching = true
  config.force_ssl = true
  config.assume_ssl = true
  config.logger = ActiveSupport::Logger.new($stdout)
                    .tap  { |l| l.formatter = ::Logger::Formatter.new }
                    .then { |l| ActiveSupport::TaggedLogging.new(l) }
  config.log_tags = [:request_id]
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "info")
  config.active_record.dump_schema_after_migration = false
  config.require_master_key = false
end

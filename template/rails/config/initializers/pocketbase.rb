require_relative "../../lib/pocketbase/client"

# Pocketbase connection — configure via POCKETBASE_URL env var
# Default: http://localhost:8090
#
# Usage in controllers:
#   client = Pocketbase::Client.new(token: session[:pb_token])
#   records = client.records("posts")

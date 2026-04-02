require "net/http"
require "json"
require "uri"

module Pocketbase
  class Client
    def initialize(token: nil, base_url: nil)
      @token    = token
      @base_url = base_url || ENV.fetch("POCKETBASE_URL", "http://localhost:8090")
    end

    # Auth
    def authenticate(email:, password:, collection: "users")
      post("/api/collections/#{collection}/auth-with-password", {
        identity: email,
        password: password
      })
    end

    def refresh_token
      post("/api/collections/users/auth-refresh", {})
    end

    # Records
    def records(collection, filter: nil, sort: nil, page: 1, per_page: 30)
      params = { page: page, perPage: per_page }
      params[:filter] = filter if filter
      params[:sort]   = sort   if sort
      get("/api/collections/#{collection}/records", params: params)
    end

    def record(collection, id, expand: nil)
      params = {}
      params[:expand] = expand if expand
      get("/api/collections/#{collection}/records/#{id}", params: params)
    end

    def create(collection, data)
      post("/api/collections/#{collection}/records", data)
    end

    def update(collection, id, data)
      patch("/api/collections/#{collection}/records/#{id}", data)
    end

    def destroy(collection, id)
      http_delete("/api/collections/#{collection}/records/#{id}")
    end

    private

    def get(path, params: {})
      uri = build_uri(path, params)
      execute(Net::HTTP::Get.new(uri))
    end

    def post(path, body)
      uri = build_uri(path)
      req = Net::HTTP::Post.new(uri)
      req.body = body.to_json
      req["Content-Type"] = "application/json"
      execute(req)
    end

    def patch(path, body)
      uri = build_uri(path)
      req = Net::HTTP::Patch.new(uri)
      req.body = body.to_json
      req["Content-Type"] = "application/json"
      execute(req)
    end

    def http_delete(path)
      execute(Net::HTTP::Delete.new(build_uri(path)))
    end

    def build_uri(path, params = {})
      uri = URI("#{@base_url}#{path}")
      uri.query = URI.encode_www_form(params) unless params.empty?
      uri
    end

    def execute(request)
      request["Authorization"] = "Bearer #{@token}" if @token
      Net::HTTP.start(request.uri.host, request.uri.port) do |http|
        response = http.request(request)
        JSON.parse(response.body)
      end
    rescue => e
      raise "Pocketbase request failed: #{e.message}"
    end
  end
end

# Avoid CORS issues when running frontend and backend on different ports.
# Handle Cross-Origin Resource Sharing (CORS) so that API calls work.

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "localhost", "127.0.0.1", "localhost:4200", "localhost:3000"
    resource "*", headers: :any, methods: [:get, :post, :put, :patch, :delete], credentials: true
  end
end

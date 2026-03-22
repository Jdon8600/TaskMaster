# Avoid CORS issues when running frontend and backend on different ports.
# Handle Cross-Origin Resource Sharing (CORS) so that API calls work.

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "localhost", "127.0.0.1", "localhost:4200", "localhost:3000", "10.0.2.2", "http://10.0.2.2", "http://10.0.2.2:3000","https://192.168.4.159:3000", "http://192.168.4.159"
    resource "*", headers: :any, methods: [:get, :post, :put, :patch, :delete, :options], credentials: true
  end
end

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes for frontend integration
  namespace :api do
    post "login", to: "auth#login"
    post "signup", to: "auth#signup"
    post "logout", to: "auth#logout"
    
    resources :tasks, only: [:index, :create, :update, :destroy]
  end
end

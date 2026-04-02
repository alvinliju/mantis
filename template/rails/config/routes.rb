Rails.application.routes.draw do
  root "home#index"

  resource :session, only: %i[new create destroy]

  get "up" => "rails/health#show", as: :rails_health_check
end

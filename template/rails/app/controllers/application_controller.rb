class ApplicationController < ActionController::Base
  helper_method :current_user, :signed_in?

  private

  def current_user
    return unless session[:pb_token]
    @current_user ||= session[:pb_user]
  end

  def signed_in?
    current_user.present?
  end

  def require_sign_in
    redirect_to new_session_path, alert: "Please sign in." unless signed_in?
  end
end

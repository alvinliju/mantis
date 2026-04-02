class SessionsController < ApplicationController
  def new
    redirect_to root_path if signed_in?
  end

  def create
    client = Pocketbase::Client.new
    result = client.authenticate(
      email: params[:email],
      password: params[:password]
    )

    if result["token"]
      session[:pb_token] = result["token"]
      session[:pb_user]  = result["record"]
      redirect_to root_path, notice: "Signed in."
    else
      flash.now[:alert] = result["message"] || "Invalid email or password."
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session.delete(:pb_token)
    session.delete(:pb_user)
    redirect_to new_session_path, notice: "Signed out."
  end
end

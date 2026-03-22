module Api
  class AuthController < ApplicationController
    skip_before_action :verify_authenticity_token
    
    def login
      email = params[:email]
      password = params[:password]
      
      user = User.find_by(email_address: email)
      
      if user&.authenticate(password)
        token = JwtHelper.encode({ user_id: user.id, exp: 24.hours.from_now.to_i })
        render json: { 
          message: "Login successful", 
          user: user.as_json,
          token: token,
          authenticated: true 
        }, status: :ok
      else
        render json: { 
          error: "Invalid email or password",
          authenticated: false 
        }, status: :unauthorized
      end
    end
    
    def signup
      first_name = params[:firstName]
      last_name = params[:lastName]
      email = params[:email]
      password = params[:password]
      
      user = User.new(
        first_name: first_name,
        last_name: last_name,
        email_address: email,
        password: password
      )
      
      if user.save
        token = JwtHelper.encode({ user_id: user.id, exp: 24.hours.from_now.to_i })
        render json: { 
          message: "User created successfully", 
          user: user.as_json,
          token: token,
          authenticated: true 
        }, status: :created
      else
        render json: { 
          error: "Signup failed",
          errors: user.errors.full_messages
        }, status: :unprocessable_entity
      end
    end
    
    def logout
      render json: { message: "Logged out successfully" }, status: :ok
    end
  end
end

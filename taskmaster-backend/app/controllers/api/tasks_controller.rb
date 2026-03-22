module Api
  class TasksController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :authenticate_user!
    before_action :set_task, only: [:update, :destroy]
    
    def index
      tasks = Task.where(email_address: @current_user.email_address)
      render json: tasks, status: :ok
    end
    
    def create
      task = Task.new(task_params)
      task.email_address = @current_user.email_address
      
      if task.save
        render json: task, status: :created
      else
        render json: { 
          error: "Task creation failed",
          errors: task.errors.full_messages 
        }, status: :unprocessable_entity
      end
    end
    
    def update
      if @task.update(task_params)
        render json: @task, status: :ok
      else
        render json: { 
          error: "Task update failed",
          errors: @task.errors.full_messages 
        }, status: :unprocessable_entity
      end
    end
    
    def destroy
      @task.destroy
      render json: { message: "Task deleted successfully" }, status: :ok
    end
    
    private
    
    def set_task
      @task = Task.find_by(id: params[:id], email_address: @current_user.email_address)
      
      unless @task
        render json: { error: "Task not found" }, status: :not_found
      end
    end
    
    def authenticate_user!
      token = request.headers['Authorization']&.split(' ')&.last
      return render json: { error: "No token provided" }, status: :unauthorized unless token
      
      payload = JwtHelper.decode(token)
      return render json: { error: "Invalid token" }, status: :unauthorized unless payload
      
      @current_user = User.find_by(email_address: payload['user_id'])
      return render json: { error: "User not found" }, status: :unauthorized unless @current_user
    end
    
    def task_params
      params.require(:task).permit(:title, :description, :due_date, :status)
    end
  end
end

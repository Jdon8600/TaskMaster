module Api
  class TasksController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :authenticate_user!
    before_action :set_task, only: [:update, :destroy]
    
    def index
      user_email = session[:user_email]
      tasks = Task.where(email_address: user_email)
      render json: tasks, status: :ok
    end
    
    def create
      user_email = session[:user_email]
      task = Task.new(task_params)
      task.email_address = user_email
      
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
      user_email = session[:user_email]
      @task = Task.find_by(id: params[:id], email_address: user_email)
      
      unless @task
        render json: { error: "Task not found" }, status: :not_found
      end
    end
    
    def authenticate_user!
      unless session[:user_email]
        render json: { error: "Unauthorized" }, status: :unauthorized
      end
    end
    
    def task_params
      params.require(:task).permit(:title, :description, :due_date, :status)
    end
  end
end

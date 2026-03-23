require "test_helper"

module Api
  class TasksControllerTest < ActionDispatch::IntegrationTest
    setup do
      @user = User.create!(
        first_name: "Test",
        last_name: "User",
        email_address: "test@example.com",
        password: "password123"
      )

      # Login to set session
      post api_login_path, params: {
        email: "test@example.com",
        password: "password123"
      }, as: :json
      assert_response :success
    end

    teardown do
      Task.destroy_all
      User.destroy_all
    end

    test "should get index" do
      task1 = Task.create!(
        title: "Test Task 1",
        description: "Description 1",
        due_date: "2026-03-25",
        status: "pending",
        email_address: @user.email_address
      )
      task2 = Task.create!(
        title: "Test Task 2",
        description: "Description 2",
        due_date: "2026-03-26",
        status: "in_progress",
        email_address: @user.email_address
      )

      get api_tasks_path, as: :json
      assert_response :success

      response_body = JSON.parse(response.body)
      assert_equal 2, response_body.length
      assert_equal "Test Task 1", response_body[0]["title"]
      assert_equal "Test Task 2", response_body[1]["title"]
    end

    test "should not get index when not authenticated" do
      # Clear session
      post api_logout_path, as: :json

      get api_tasks_path, as: :json
      assert_response :unauthorized
      response_body = JSON.parse(response.body)
      assert_equal "Unauthorized", response_body["error"]
    end

    test "should create task" do
      assert_difference 'Task.count' do
        post api_tasks_path, params: {
          task: {
            title: "New Task",
            description: "New Description",
            due_date: "2026-03-25",
            status: "pending"
          }
        }, as: :json
      end

      assert_response :created
      response_body = JSON.parse(response.body)
      assert_equal "New Task", response_body["title"]
      assert_equal "New Description", response_body["description"]
      assert_equal "pending", response_body["status"]
      assert_equal @user.email_address, response_body["email_address"]
    end

    test "should not create task with invalid data" do
      assert_no_difference 'Task.count' do
        post api_tasks_path, params: {
          task: {
            title: "",
            description: "Description",
            due_date: "2026-03-25",
            status: "pending"
          }
        }, as: :json
      end

      assert_response :unprocessable_entity
      response_body = JSON.parse(response.body)
      assert_equal "Task creation failed", response_body["error"]
      assert response_body["errors"].present?
    end

    test "should not create task when not authenticated" do
      # Clear session
      post api_logout_path, as: :json

      assert_no_difference 'Task.count' do
        post api_tasks_path, params: {
          task: {
            title: "New Task",
            description: "Description",
            due_date: "2026-03-25",
            status: "pending"
          }
        }, as: :json
      end

      assert_response :unauthorized
    end

    test "should update task" do
      task = Task.create!(
        title: "Original Task",
        description: "Original Description",
        due_date: "2026-03-25",
        status: "pending",
        email_address: @user.email_address
      )

      put api_task_path(task), params: {
        task: {
          title: "Updated Task",
          description: "Updated Description",
          status: "done"
        }
      }, as: :json

      assert_response :success
      response_body = JSON.parse(response.body)
      assert_equal "Updated Task", response_body["title"]
      assert_equal "Updated Description", response_body["description"]
      assert_equal "done", response_body["status"]

      task.reload
      assert_equal "Updated Task", task.title
    end

    test "should not update task with invalid data" do
      task = Task.create!(
        title: "Original Task",
        description: "Original Description",
        due_date: "2026-03-25",
        status: "pending",
        email_address: @user.email_address
      )

      put api_task_path(task), params: {
        task: {
          title: "",
          description: "Updated Description",
          status: "done"
        }
      }, as: :json

      assert_response :unprocessable_entity
      response_body = JSON.parse(response.body)
      assert_equal "Task update failed", response_body["error"]
      assert response_body["errors"].present?
    end

    test "should not update task that doesn't belong to user" do
      other_user = User.create!(
        first_name: "Other",
        last_name: "User",
        email_address: "other@example.com",
        password: "password123"
      )

      task = Task.create!(
        title: "Other's Task",
        description: "Description",
        due_date: "2026-03-25",
        status: "pending",
        email_address: other_user.email_address
      )

      put api_task_path(task), params: {
        task: {
          title: "Updated Task",
          status: "done"
        }
      }, as: :json

      assert_response :not_found
      response_body = JSON.parse(response.body)
      assert_equal "Task not found", response_body["error"]
    end

    test "should destroy task" do
      task = Task.create!(
        title: "Task to Delete",
        description: "Description",
        due_date: "2026-03-25",
        status: "pending",
        email_address: @user.email_address
      )

      assert_difference 'Task.count', -1 do
        delete api_task_path(task), as: :json
      end

      assert_response :success
      response_body = JSON.parse(response.body)
      assert_equal "Task deleted successfully", response_body["message"]
    end

    test "should not destroy task that doesn't belong to user" do
      other_user = User.create!(
        first_name: "Other",
        last_name: "User",
        email_address: "other@example.com",
        password: "password123"
      )

      task = Task.create!(
        title: "Other's Task",
        description: "Description",
        due_date: "2026-03-25",
        status: "pending",
        email_address: other_user.email_address
      )

      assert_no_difference 'Task.count' do
        delete api_task_path(task), as: :json
      end

      assert_response :not_found
      response_body = JSON.parse(response.body)
      assert_equal "Task not found", response_body["error"]
    end
  end
end
require "test_helper"

module Api
  class AuthControllerTest < ActionDispatch::IntegrationTest
    setup do
      @user = User.create!(
        first_name: "Test",
        last_name: "User",
        email_address: "test@example.com",
        password: "password123"
      )
    end

    teardown do
      User.destroy_all
    end

    test "should login with valid credentials" do
      post api_login_path, params: {
        email: "test@example.com",
        password: "password123"
      }, as: :json

      assert_response :success
      response_body = JSON.parse(response.body)
      assert response_body["authenticated"]
      assert_equal "Login successful", response_body["message"]
      assert_equal @user.email_address, response_body["user"]["email_address"]
    end

    test "should not login with invalid email" do
      post api_login_path, params: {
        email: "wrong@example.com",
        password: "password123"
      }, as: :json

      assert_response :unauthorized
      response_body = JSON.parse(response.body)
      assert_not response_body["authenticated"]
      assert_equal "Invalid email or password", response_body["error"]
    end

    test "should not login with invalid password" do
      post api_login_path, params: {
        email: "test@example.com",
        password: "wrongpassword"
      }, as: :json

      assert_response :unauthorized
      response_body = JSON.parse(response.body)
      assert_not response_body["authenticated"]
      assert_equal "Invalid email or password", response_body["error"]
    end

    test "should signup with valid data" do
      assert_difference 'User.count' do
        post api_signup_path, params: {
          firstName: "New",
          lastName: "User",
          email: "new@example.com",
          password: "newpassword123"
        }, as: :json
      end

      assert_response :created
      response_body = JSON.parse(response.body)
      assert response_body["authenticated"]
      assert_equal "User created successfully", response_body["message"]
      assert_equal "new@example.com", response_body["user"]["email_address"]
    end

    test "should not signup with duplicate email" do
      assert_no_difference 'User.count' do
        post api_signup_path, params: {
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "password123"
        }, as: :json
      end

      assert_response :unprocessable_entity
      response_body = JSON.parse(response.body)
      assert_not response_body["authenticated"]
      assert_equal "Signup failed", response_body["error"]
      assert_includes response_body["errors"], "Email address has already been taken"
    end

    test "should not signup with invalid data" do
      assert_no_difference 'User.count' do
        post api_signup_path, params: {
          firstName: "",
          lastName: "User",
          email: "invalid-email",
          password: "123"
        }, as: :json
      end

      assert_response :unprocessable_entity
      response_body = JSON.parse(response.body)
      assert_not response_body["authenticated"]
      assert_equal "Signup failed", response_body["error"]
      assert response_body["errors"].present?
    end

    test "should logout" do
      # First login
      post api_login_path, params: {
        email: "test@example.com",
        password: "password123"
      }, as: :json
      assert_response :success

      # Then logout
      post api_logout_path, as: :json
      assert_response :success
      response_body = JSON.parse(response.body)
      assert_equal "Logged out successfully", response_body["message"]
    end
  end
end
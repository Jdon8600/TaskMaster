class User < ApplicationRecord
  self.primary_key = "email_address"
  
  validates :first_name, :last_name, :email_address, presence: true
  validates :email_address, format: { with: URI::MailTo::EMAIL_REGEXP }, uniqueness: true
  validates :password, presence: true, length: { minimum: 6 }, if: :new_record?
  
  has_secure_password
  has_many :tasks, foreign_key: :email_address, dependent: :destroy
  
  def as_json(options = {})
    super(options.merge(except: [:password_digest]))
  end
end
